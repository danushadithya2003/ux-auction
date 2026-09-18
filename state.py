"""
The authoritative auction state machine.

One Auction instance represents the single currently-active session (only one
auction runs at a time). All mutations happen through methods on this class,
which validate every rule before changing anything - the server is the
source of truth, never the client.
"""

import random
import time
import uuid

from seed_data import CATEGORIES

STARTING_BALANCE = 100
INCREMENTS = [1, 5, 10]
SILENCE_SECONDS = 15
CODE_ALPHABET = "ABCDEFGHJKLMNPQRTUVWXYZ2346789"  # no O/0, I/1, S/5

# The next lot goes live the instant a sale is confirmed, but everyone's
# screen is covered by the SOLD takeover for a couple of seconds first -
# without this, that time is silently eaten out of their bidding window.
# Padding the window by this much (only after a real sale, not a skip)
# means the full SILENCE_SECONDS starts once people can actually see the lot.
SOLD_POPUP_GRACE_SECONDS = 3


class ValidationError(Exception):
    pass


def _gen_code(length=6):
    return "".join(random.choice(CODE_ALPHABET) for _ in range(length))


def _new_id(prefix):
    return f"{prefix}_{uuid.uuid4().hex[:10]}"


AVAILABLE_STATUSES = ("UNUSED", "UNSOLD_PENDING_REOFFER")


class Auction:
    def __init__(self, code=None, admin_token=None):
        self.code = code or _gen_code()
        self.admin_token = admin_token or uuid.uuid4().hex
        self.status = "LOBBY"  # LOBBY, PLANNING, LIVE, PAUSED, COMPLETED
        self.created_at = time.time()
        self.completed_at = None
        self.current_category_index = 0
        self.categories = []
        self.participants = {}  # id -> dict
        self.purchases = []
        self.paused_remaining = None
        self._build_categories()

    # ---------- setup ----------

    def _build_categories(self):
        for c_idx, cat in enumerate(CATEGORIES):
            category = {
                "id": _new_id("cat"),
                "name": cat["name"],
                "order": c_idx,
                "status": "PENDING",
                "closed_at": None,
                "items": [],
            }
            for i_idx, item in enumerate(cat["items"]):
                category["items"].append({
                    "id": _new_id("item"),
                    "category_id": category["id"],
                    "name": item["name"],
                    "description": item["description"],
                    "starting_price": item["startingPrice"],
                    "tier": item["tier"],
                    "order": i_idx,
                    "status": "UNUSED",
                    "current_bid": None,
                    "current_bidder_id": None,
                    "bidding_expires_at": None,
                    "sold_to": None,
                    "sold_price": None,
                    "sale_type": None,
                    "bid_feed": [],
                })
            self.categories.append(category)

    # ---------- lookups ----------

    def _category(self, category_id):
        for c in self.categories:
            if c["id"] == category_id:
                return c
        return None

    def find_item(self, item_id):
        for c in self.categories:
            for it in c["items"]:
                if it["id"] == item_id:
                    return it, c
        return None, None

    def current_category(self):
        if 0 <= self.current_category_index < len(self.categories):
            return self.categories[self.current_category_index]
        return None

    def current_item(self):
        cat = self.current_category()
        if not cat:
            return None
        for it in cat["items"]:
            if it["status"] in ("BIDDING", "PENDING_CONFIRM"):
                return it
        return None

    def _purchases_for(self, participant_id):
        return [p for p in self.purchases if p["participant_id"] == participant_id]

    def owns_in_category(self, participant_id, category_id):
        return any(p["category_id"] == category_id for p in self._purchases_for(participant_id))

    def _unmet_categories(self, participant_id, exclude_category_id=None):
        missing = []
        for c in self.categories:
            if exclude_category_id and c["id"] == exclude_category_id:
                continue
            if not self.owns_in_category(participant_id, c["id"]):
                missing.append(c["id"])
        return missing

    def reserve_floor(self, participant_id, exclude_category_id=None):
        return len(self._unmet_categories(participant_id, exclude_category_id)) * 1

    def _cheapest_available(self, category_id):
        cat = self._category(category_id)
        if not cat:
            return None
        available = [it for it in cat["items"] if it["status"] in AVAILABLE_STATUSES]
        if not available:
            return None
        return min(available, key=lambda it: it["starting_price"])

    def missing_grant_suggestions(self):
        """For every participant still missing an item from an already-CLOSED
        category, suggest the cheapest available item there (if any). Purely
        informational for the Admin - direct_grant is the actual action."""
        suggestions = []
        for c in self.categories:
            if c["status"] != "CLOSED":
                continue
            cheapest = self._cheapest_available(c["id"])
            for p in self.participants.values():
                if self.owns_in_category(p["id"], c["id"]):
                    continue
                suggestions.append({
                    "participant_id": p["id"],
                    "category_id": c["id"],
                    "suggested_item_id": cheapest["id"] if cheapest else None,
                    "suggested_price": cheapest["starting_price"] if cheapest else None,
                })
        return suggestions

    # ---------- participants ----------

    def join(self, name):
        name = (name or "").strip()
        if not name:
            raise ValidationError("Name is required.")
        if self.status == "COMPLETED":
            raise ValidationError("This auction has already ended.")
        if any(p["name"].lower() == name.lower() for p in self.participants.values()):
            raise ValidationError("That name is already taken in this auction.")
        participant_id = _new_id("p")
        token = uuid.uuid4().hex
        participant = {
            "id": participant_id,
            "name": name,
            "token": token,
            "balance": STARTING_BALANCE,
            "connected": True,
            "joined_at": time.time(),
        }
        self.participants[participant_id] = participant
        return participant

    def find_by_token(self, token):
        for p in self.participants.values():
            if p["token"] == token:
                return p
        return None

    def set_connected(self, participant_id, connected):
        p = self.participants.get(participant_id)
        if p:
            p["connected"] = connected

    # ---------- session-level transitions ----------

    def start_planning(self):
        if self.status != "LOBBY":
            raise ValidationError("Auction is not in the lobby.")
        self.status = "PLANNING"

    def begin_bidding(self):
        if self.status != "PLANNING":
            raise ValidationError("Auction is not in planning.")
        self.status = "LIVE"
        self._open_category(self.current_category_index)

    def pause(self):
        if self.status != "LIVE":
            raise ValidationError("Auction is not live.")
        item = self.current_item()
        if item and item["status"] == "BIDDING" and item["bidding_expires_at"]:
            self.paused_remaining = max(0, item["bidding_expires_at"] - time.time())
        self.status = "PAUSED"

    def resume(self):
        if self.status != "PAUSED":
            raise ValidationError("Auction is not paused.")
        item = self.current_item()
        if item and item["status"] == "BIDDING":
            remaining = self.paused_remaining if self.paused_remaining is not None else SILENCE_SECONDS
            item["bidding_expires_at"] = time.time() + remaining
        self.paused_remaining = None
        self.status = "LIVE"

    def end_auction(self):
        if self.status not in ("LIVE", "PAUSED"):
            raise ValidationError("Auction is not running.")
        self.status = "COMPLETED"
        self.completed_at = time.time()

    # ---------- category / item flow ----------

    def _open_category(self, index):
        if index >= len(self.categories):
            return
        cat = self.categories[index]
        cat["status"] = "OPEN"
        self._reveal_next_item(cat)

    def _reveal_next_item(self, cat, grace_seconds=0):
        for it in cat["items"]:
            if it["status"] == "UNUSED":
                it["status"] = "BIDDING"
                it["current_bid"] = None
                it["current_bidder_id"] = None
                it["bidding_expires_at"] = time.time() + SILENCE_SECONDS + grace_seconds
                it["bid_feed"] = [{"kind": "open", "name": None, "amount": it["starting_price"]}]
                return it
        return None

    def place_bid(self, participant_id, amount):
        if self.status != "LIVE":
            raise ValidationError("Bidding is not open right now.")
        participant = self.participants.get(participant_id)
        if not participant:
            raise ValidationError("Unknown participant.")
        item = self.current_item()
        if not item or item["status"] != "BIDDING":
            raise ValidationError("No item is open for bidding.")
        if item["current_bidder_id"] == participant_id:
            raise ValidationError("You are already the highest bidder.")

        try:
            amount = int(amount)
        except (TypeError, ValueError):
            raise ValidationError("Invalid bid amount.")

        if item["current_bid"] is None:
            base = item["starting_price"]
            allowed = {base} | {base + inc for inc in INCREMENTS}
        else:
            base = item["current_bid"]
            allowed = {base + inc for inc in INCREMENTS}
        if amount not in allowed:
            raise ValidationError("Invalid bid amount.")

        if amount > participant["balance"]:
            raise ValidationError("Bid exceeds your remaining balance.")

        reserve = self.reserve_floor(participant_id, exclude_category_id=item["category_id"])
        if participant["balance"] - amount < reserve:
            raise ValidationError("That bid would leave you unable to secure your remaining required categories.")

        item["current_bid"] = amount
        item["current_bidder_id"] = participant_id
        item["bidding_expires_at"] = time.time() + SILENCE_SECONDS
        item["bid_feed"].append({"kind": "bid", "name": participant["name"], "amount": amount})
        item["bid_feed"] = item["bid_feed"][-3:]

    def tick(self):
        """Call roughly once a second. Returns True if anything changed.

        When the silence window lapses with a bid on the table, the item
        moves to PENDING_CONFIRM so the Auctioneer confirms the sale by
        hand. With no bid at all, nothing auto-resolves either - the timer
        just sits at zero and the item stays open until the Auctioneer
        explicitly skips it (or someone bids)."""
        if self.status != "LIVE":
            return False
        item = self.current_item()
        if not item or item["status"] != "BIDDING":
            return False
        if item["bidding_expires_at"] is None or time.time() < item["bidding_expires_at"]:
            return False
        if not item["current_bidder_id"]:
            return False
        item["status"] = "PENDING_CONFIRM"
        return True

    def _finalize_sale(self, item, participant_id, price, sale_type):
        participant = self.participants[participant_id]
        participant["balance"] -= price
        item["status"] = "SOLD"
        item["sold_to"] = participant_id
        item["sold_price"] = price
        item["sale_type"] = sale_type
        item["current_bid"] = price
        item["current_bidder_id"] = participant_id
        self.purchases.append({
            "id": _new_id("pur"),
            "participant_id": participant_id,
            "item_id": item["id"],
            "category_id": item["category_id"],
            "price": price,
            "sale_type": sale_type,
            "timestamp": time.time(),
        })

    def confirm_sale(self):
        item = self.current_item()
        if not item or not item["current_bidder_id"]:
            raise ValidationError("There is no pending sale to confirm.")
        cat = self._category(item["category_id"])
        self._finalize_sale(item, item["current_bidder_id"], item["current_bid"], "NORMAL")
        self._reveal_next_item(cat, grace_seconds=SOLD_POPUP_GRACE_SECONDS)

    def skip_item(self):
        item = self.current_item()
        if not item:
            raise ValidationError("No active item.")
        cat = self._category(item["category_id"])
        item["status"] = "UNSOLD_PENDING_REOFFER"
        item["current_bid"] = None
        item["current_bidder_id"] = None
        item["bidding_expires_at"] = None
        self._reveal_next_item(cat)

    def reoffer_item(self, item_id, new_price):
        if self.current_item():
            raise ValidationError("Resolve the current item first.")
        item, cat = self.find_item(item_id)
        if not item or item["status"] != "UNSOLD_PENDING_REOFFER":
            raise ValidationError("That item isn't available to re-offer.")
        try:
            new_price = int(new_price)
        except (TypeError, ValueError):
            raise ValidationError("Invalid price.")
        if new_price < 1:
            raise ValidationError("Price must be at least 1 coin.")
        item["starting_price"] = new_price
        item["status"] = "BIDDING"
        item["current_bid"] = None
        item["current_bidder_id"] = None
        item["bidding_expires_at"] = time.time() + SILENCE_SECONDS
        item["bid_feed"] = [{"kind": "open", "name": None, "amount": new_price}]

    def direct_grant(self, item_id, participant_id, price):
        item, cat = self.find_item(item_id)
        if not item or item["status"] not in AVAILABLE_STATUSES:
            raise ValidationError("That item is not available to grant.")
        participant = self.participants.get(participant_id)
        if not participant:
            raise ValidationError("Unknown participant.")
        try:
            price = int(price)
        except (TypeError, ValueError):
            raise ValidationError("Invalid price.")
        if price < 1:
            raise ValidationError("Price must be at least 1 coin.")
        if price > participant["balance"]:
            raise ValidationError("That participant can't afford that price.")
        self._finalize_sale(item, participant_id, price, "CATCHUP_GRANT")

    def close_category_check(self):
        """Participants still missing an item from the current category who
        the Admin could still fix with a grant. Someone missing it is
        excluded once there's nothing left in the category to give them -
        otherwise the category could never close (a soft-lock)."""
        cat = self.current_category()
        if not cat:
            return []
        if self._cheapest_available(cat["id"]) is None:
            return []
        return [p["id"] for p in self.participants.values() if not self.owns_in_category(p["id"], cat["id"])]

    def exempt_from_current_category(self):
        """Participants missing an item from the current category who are
        exempt because nothing is left to grant them - the flip side of
        close_category_check()."""
        cat = self.current_category()
        if not cat or self._cheapest_available(cat["id"]) is not None:
            return []
        return [p["id"] for p in self.participants.values() if not self.owns_in_category(p["id"], cat["id"])]

    def close_category(self):
        cat = self.current_category()
        if not cat:
            raise ValidationError("No open category.")
        if cat["status"] != "OPEN":
            raise ValidationError("Category is not open.")
        if self.current_item():
            raise ValidationError("Resolve the current item before closing the category.")
        if self.close_category_check():
            raise ValidationError("Some participants still need an item from this category.")
        cat["status"] = "CLOSED"
        cat["closed_at"] = time.time()
        self.current_category_index += 1
        if self.current_category_index < len(self.categories):
            self._open_category(self.current_category_index)

    # ---------- serialization (for persistence / crash recovery) ----------

    def to_dict(self):
        return {
            "code": self.code,
            "admin_token": self.admin_token,
            "status": self.status,
            "created_at": self.created_at,
            "completed_at": self.completed_at,
            "current_category_index": self.current_category_index,
            "categories": self.categories,
            "participants": self.participants,
            "purchases": self.purchases,
            "paused_remaining": self.paused_remaining,
        }

    @classmethod
    def from_dict(cls, data):
        auction = cls.__new__(cls)
        auction.code = data["code"]
        auction.admin_token = data["admin_token"]
        auction.status = data["status"]
        auction.created_at = data["created_at"]
        auction.completed_at = data["completed_at"]
        auction.current_category_index = data["current_category_index"]
        auction.categories = data["categories"]
        auction.participants = data["participants"]
        auction.purchases = data["purchases"]
        auction.paused_remaining = data["paused_remaining"]
        return auction
