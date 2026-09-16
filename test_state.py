"""
Smoke tests for the auction state machine, run directly against state.py
(no server/sockets involved). Run with: python3 test_state.py
"""

from state import Auction, ValidationError


def expect_error(fn, *args):
    try:
        fn(*args)
    except ValidationError:
        return
    raise AssertionError(f"Expected ValidationError from {fn}")


def test_happy_path_one_category():
    a = Auction()
    p1 = a.join("Alice")
    p2 = a.join("Bob")
    a.start_planning()
    a.begin_bidding()

    cat0 = a.categories[0]
    item = a.current_item()
    assert item is not None and item["status"] == "BIDDING"

    a.place_bid(p1["id"], item["starting_price"])
    assert item["current_bidder_id"] == p1["id"]

    expect_error(a.place_bid, p1["id"], item["current_bid"])  # can't bid against self
    expect_error(a.place_bid, p2["id"], item["current_bid"] + 2)  # invalid increment

    a.place_bid(p2["id"], item["current_bid"] + 1)
    assert item["current_bidder_id"] == p2["id"]

    a.confirm_sale()
    assert item["status"] == "SOLD"
    assert a.participants[p2["id"]]["balance"] == 100 - item["sold_price"]
    assert a.owns_in_category(p2["id"], cat0["id"])
    print("test_happy_path_one_category OK")


def test_guarantee_gate_and_direct_grant():
    a = Auction()
    p1 = a.join("Alice")
    p2 = a.join("Bob")
    a.start_planning()
    a.begin_bidding()

    item = a.current_item()
    a.place_bid(p1["id"], item["starting_price"])
    a.confirm_sale()  # p1 secures category 0; p2 has nothing yet

    # category 0 has more items queued automatically; skip them all so we can
    # attempt to close with p2 still missing.
    while a.current_item():
        a.skip_item()

    expect_error(a.close_category)  # p2 still missing -> blocked
    missing = a.close_category_check()
    assert missing == [p2["id"]]

    # grant p2 the cheapest available leftover item in category 0
    cat0 = a.categories[0]
    cheapest = a._cheapest_available(cat0["id"])
    a.direct_grant(cheapest["id"], p2["id"], 1)
    assert a.owns_in_category(p2["id"], cat0["id"])

    a.close_category()  # now succeeds
    assert cat0["status"] == "CLOSED"
    print("test_guarantee_gate_and_direct_grant OK")


def test_reserve_floor_blocks_overspending():
    a = Auction()
    p1 = a.join("Alice")
    a.start_planning()
    a.begin_bidding()
    item = a.current_item()

    # Alice has 5 categories total; if she nearly empties her balance on the
    # very first item, she should be blocked once it would leave her with
    # less than 1 coin per remaining category (4 others).
    too_high = 100 - 3  # would leave 3 coins, but she needs >= 4 for the other categories
    # place a valid bid first so current_bid exists, then try to top it absurdly
    expect_error(a.place_bid, p1["id"], too_high)
    print("test_reserve_floor_blocks_overspending OK")


def test_reoffer_unsold_item():
    a = Auction()
    p1 = a.join("Alice")
    a.start_planning()
    a.begin_bidding()
    item = a.current_item()
    item_id = item["id"]

    a.skip_item()  # no bids -> unsold pending reoffer
    it, _ = a.find_item(item_id)
    assert it["status"] == "UNSOLD_PENDING_REOFFER"

    # a new item is now current; re-offer must wait until it's resolved
    expect_error(a.reoffer_item, item_id, 5)
    while a.current_item():
        a.skip_item()
    assert a.current_item() is None  # category 0's queue is now empty

    a.reoffer_item(item_id, 5)
    it, _ = a.find_item(item_id)
    assert it["status"] == "BIDDING" and it["starting_price"] == 5
    print("test_reoffer_unsold_item OK")


def test_late_joiner_grant_suggestion():
    a = Auction()
    p1 = a.join("Alice")
    a.start_planning()
    a.begin_bidding()
    item = a.current_item()
    a.place_bid(p1["id"], item["starting_price"])
    a.confirm_sale()
    while a.current_item():
        a.skip_item()
    a.close_category()  # category 0 now CLOSED, Alice already has an item

    p2 = a.join("Carol")  # joins after category 0 closed
    suggestions = a.missing_grant_suggestions()
    carol_suggestions = [s for s in suggestions if s["participant_id"] == p2["id"]]
    assert len(carol_suggestions) == 1
    assert carol_suggestions[0]["category_id"] == a.categories[0]["id"]
    assert carol_suggestions[0]["suggested_item_id"] is not None
    print("test_late_joiner_grant_suggestion OK")


def test_serialization_roundtrip():
    a = Auction()
    a.join("Alice")
    a.start_planning()
    data = a.to_dict()
    b = Auction.from_dict(data)
    assert b.code == a.code and b.status == a.status
    print("test_serialization_roundtrip OK")


if __name__ == "__main__":
    test_happy_path_one_category()
    test_guarantee_gate_and_direct_grant()
    test_reserve_floor_blocks_overspending()
    test_reoffer_unsold_item()
    test_late_joiner_grant_suggestion()
    test_serialization_roundtrip()
    print("\nAll smoke tests passed.")
