"""
Sanitized state views. The Admin sees everything (including hidden item
tiers). Participants never see hidden metadata or each other's balances -
only what the requirements call for: the live item, their own budget and
collection, and other players' names/progress.
"""

import time

from state import INCREMENTS


def _time_remaining(item):
    if item and item.get("status") == "BIDDING" and item.get("bidding_expires_at"):
        return max(0, round(item["bidding_expires_at"] - time.time()))
    return None


def _bidding_expires_at(item):
    # Raw epoch timestamp, not the rounded seconds-remaining above. A client
    # ticking down from a rounded integer can get two updates that round to
    # the same number (e.g. a bid landing moments after a reveal both read
    # as "15") and never notice the deadline actually moved - ticking
    # against this exact timestamp instead avoids that class of bug.
    if item and item.get("status") == "BIDDING" and item.get("bidding_expires_at"):
        return item["bidding_expires_at"]
    return None


def _bid_options_for(item, participant_balance, reserve):
    if not item or item["status"] != "BIDDING":
        return []
    if item["current_bid"] is None:
        base = item["starting_price"]
        options = [base] + [base + inc for inc in INCREMENTS]
    else:
        base = item["current_bid"]
        options = [base + inc for inc in INCREMENTS]
    ceiling = participant_balance - reserve
    return [o for o in options if o <= ceiling]


def admin_view(auction):
    purchase_count = {}
    category_count = {}
    for pur in auction.purchases:
        purchase_count[pur["participant_id"]] = purchase_count.get(pur["participant_id"], 0) + 1
        cats = category_count.setdefault(pur["participant_id"], set())
        cats.add(pur["category_id"])

    participants = [
        {
            "id": p["id"],
            "name": p["name"],
            "balance": p["balance"],
            "connected": p["connected"],
            "itemCount": purchase_count.get(p["id"], 0),
            "categoriesSecured": len(category_count.get(p["id"], set())),
            "totalCategories": len(auction.categories),
        }
        for p in auction.participants.values()
    ]

    categories = []
    for c in auction.categories:
        items = []
        for it in c["items"]:
            items.append({
                "id": it["id"],
                "name": it["name"],
                "description": it["description"],
                "startingPrice": it["starting_price"],
                "tier": it["tier"],
                "status": it["status"],
                "currentBid": it["current_bid"],
                "currentBidderName": auction.participants.get(it["current_bidder_id"], {}).get("name") if it["current_bidder_id"] else None,
                "soldToName": auction.participants.get(it["sold_to"], {}).get("name") if it["sold_to"] else None,
                "soldPrice": it["sold_price"],
                "saleType": it["sale_type"],
            })
        categories.append({"id": c["id"], "name": c["name"], "status": c["status"], "items": items})

    current_item = auction.current_item()
    current_category = auction.current_category()
    current_item_view = None
    if current_item:
        current_item_view = {
            "id": current_item["id"],
            "name": current_item["name"],
            "description": current_item["description"],
            "startingPrice": current_item["starting_price"],
            "tier": current_item["tier"],
            "status": current_item["status"],
            "currentBid": current_item["current_bid"],
            "currentBidderName": auction.participants.get(current_item["current_bidder_id"], {}).get("name") if current_item["current_bidder_id"] else None,
            "timeRemaining": _time_remaining(current_item),
            "biddingExpiresAt": _bidding_expires_at(current_item),
            "bidFeed": [{"kind": e["kind"], "name": e["name"], "amount": e["amount"]} for e in current_item.get("bid_feed", [])],
        }

    missing_suggestions = []
    for s in auction.missing_grant_suggestions():
        participant = auction.participants.get(s["participant_id"])
        category = next((c for c in auction.categories if c["id"] == s["category_id"]), None)
        item = None
        if s["suggested_item_id"]:
            for c in auction.categories:
                for it in c["items"]:
                    if it["id"] == s["suggested_item_id"]:
                        item = it
        missing_suggestions.append({
            "participantId": s["participant_id"],
            "participantName": participant["name"] if participant else None,
            "categoryId": s["category_id"],
            "categoryName": category["name"] if category else None,
            "suggestedItemId": s["suggested_item_id"],
            "suggestedItemName": item["name"] if item else None,
            "suggestedPrice": s["suggested_price"],
        })

    return {
        "role": "admin",
        "code": auction.code,
        "status": auction.status,
        "categories": categories,
        "currentCategoryId": current_category["id"] if current_category else None,
        "currentCategoryName": current_category["name"] if current_category else None,
        "currentItem": current_item_view,
        "participants": participants,
        "missingForCurrentCategory": [
            auction.participants[pid]["name"] for pid in auction.close_category_check()
        ] if current_category else [],
        "exemptForCurrentCategory": [
            auction.participants[pid]["name"] for pid in auction.exempt_from_current_category()
        ] if current_category else [],
        "missingGrantSuggestions": missing_suggestions,
        "allCategoriesClosed": auction.current_category_index >= len(auction.categories),
    }


def participant_view(auction, participant_id):
    participant = auction.participants.get(participant_id)
    if not participant:
        return None

    collection = []
    for pur in auction.purchases:
        if pur["participant_id"] != participant_id:
            continue
        item, cat = auction.find_item(pur["item_id"])
        collection.append({
            "name": item["name"],
            "description": item["description"],
            "categoryName": cat["name"] if cat else None,
            "price": pur["price"],
            "saleType": pur["sale_type"],
        })

    categories_progress = [
        {"id": c["id"], "name": c["name"], "status": c["status"], "secured": auction.owns_in_category(participant_id, c["id"])}
        for c in auction.categories
    ]

    browse_categories = []
    for c in auction.categories:
        items = []
        for it in c["items"]:
            sold_bidder = auction.participants.get(it["sold_to"]) if it["sold_to"] else None
            items.append({
                "id": it["id"],
                "name": it["name"],
                "description": it["description"],
                "startingPrice": it["starting_price"],
                "status": it["status"],
                "soldToName": sold_bidder["name"] if sold_bidder else None,
                "soldPrice": it["sold_price"],
            })
        browse_categories.append({"id": c["id"], "name": c["name"], "status": c["status"], "items": items})

    players = []
    for p in auction.participants.values():
        p_collection = []
        for pur in auction.purchases:
            if pur["participant_id"] != p["id"]:
                continue
            item, cat = auction.find_item(pur["item_id"])
            p_collection.append({"name": item["name"], "categoryName": cat["name"] if cat else None, "price": pur["price"]})
        players.append({
            "id": p["id"],
            "name": p["name"],
            "isMe": p["id"] == participant_id,
            "balance": p["balance"],
            "connected": p["connected"],
            "categoriesSecured": len({c["categoryName"] for c in p_collection}),
            "totalCategories": len(auction.categories),
            "collection": p_collection,
        })

    current_item = auction.current_item()
    current_category = auction.current_category()
    reserve = auction.reserve_floor(participant_id, exclude_category_id=current_item["category_id"] if current_item else None)

    current_item_view = None
    if current_item:
        bidder = auction.participants.get(current_item["current_bidder_id"]) if current_item["current_bidder_id"] else None
        current_item_view = {
            "id": current_item["id"],
            "name": current_item["name"],
            "description": current_item["description"],
            "startingPrice": current_item["starting_price"],
            "status": current_item["status"],
            "currentBid": current_item["current_bid"],
            "currentBidderName": bidder["name"] if bidder else None,
            "isMine": current_item["current_bidder_id"] == participant_id,
            "timeRemaining": _time_remaining(current_item),
            "biddingExpiresAt": _bidding_expires_at(current_item),
            "bidOptions": _bid_options_for(current_item, participant["balance"], reserve),
            "bidFeed": [{"kind": e["kind"], "name": e["name"], "amount": e["amount"]} for e in current_item.get("bid_feed", [])],
        }

    return {
        "role": "participant",
        "participantId": participant_id,
        "name": participant["name"],
        "balance": participant["balance"],
        "reserveFloor": reserve,
        "status": auction.status,
        "code": auction.code,
        "collection": collection,
        "categoriesProgress": categories_progress,
        "categories": browse_categories,
        "participantNames": sorted(p["name"] for p in auction.participants.values()),
        "players": players,
        "currentCategoryName": current_category["name"] if current_category else None,
        "currentItem": current_item_view,
        "allCategoriesClosed": auction.current_category_index >= len(auction.categories),
    }


def public_summary(auction):
    participants = []
    for p in auction.participants.values():
        collection = []
        for pur in auction.purchases:
            if pur["participant_id"] != p["id"]:
                continue
            item, cat = auction.find_item(pur["item_id"])
            collection.append({
                "name": item["name"],
                "description": item["description"],
                "categoryName": cat["name"] if cat else None,
                "price": pur["price"],
                "saleType": pur["sale_type"],
            })
        participants.append({"id": p["id"], "name": p["name"], "finalBalance": p["balance"], "collection": collection})

    return {
        "role": "summary",
        "code": auction.code,
        "status": auction.status,
        "completedAt": auction.completed_at,
        "categories": [c["name"] for c in auction.categories],
        "participants": participants,
    }
