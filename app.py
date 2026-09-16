"""
UX Auction server.

Plain Flask, no external JS/client library required (this machine has no
general internet access, only PyPI) - real-time updates are pushed to
browsers over Server-Sent Events (a native browser API, no library needed),
and every gameplay action is a plain POST. Exactly one auction is ever
active in memory at a time; this module is the only place that mutates it,
persisting to SQLite and broadcasting a fresh sanitized view to everyone
after each change.
"""

import json
import queue
import threading
import time

from flask import Flask, Response, jsonify, request, send_from_directory, stream_with_context

import db
import views
from state import Auction, ValidationError

app = Flask(__name__, static_folder="static")

current_auction = None
lock = threading.RLock()
subscribers = {}  # sub_id -> {"queue", "role", "code", "participant_id"?}
_sub_counter = 0
# Tracks each participant's most recent stream, so a stale connection's
# cleanup (e.g. after a browser auto-reconnect) can't clobber a newer one's
# "connected" status.
active_participant_stream = {}


def _restore_active_auction():
    global current_auction
    record = db.get_active_auction()
    if record:
        current_auction = Auction.from_dict(record["data"])


_restore_active_auction()


def _persist():
    if current_auction:
        db.save_auction(current_auction.code, current_auction.status, current_auction.to_dict(), time.time())


def _push(sub, payload):
    sub["queue"].put(json.dumps(payload))


def _broadcast():
    if not current_auction:
        return
    for sub in list(subscribers.values()):
        if sub["code"] != current_auction.code:
            continue
        if sub["role"] == "admin":
            if current_auction.status == "COMPLETED":
                _push(sub, views.public_summary(current_auction))
            else:
                _push(sub, views.admin_view(current_auction))
        elif sub["role"] == "participant":
            if current_auction.status == "COMPLETED":
                _push(sub, views.public_summary(current_auction))
            else:
                payload = views.participant_view(current_auction, sub["participant_id"])
                if payload:
                    _push(sub, payload)


# ---------------------------------------------------------------------------
# Static app + lookup
# ---------------------------------------------------------------------------


@app.route("/")
def index():
    return send_from_directory("static/app", "index.html")


@app.route("/api/lookup/<code>")
def lookup(code):
    code = code.strip().upper()
    with lock:
        if current_auction and current_auction.code == code:
            return jsonify({"found": True, "status": current_auction.status})
    record = db.get_auction_by_code(code)
    if not record:
        return jsonify({"found": False})
    if record["status"] == "COMPLETED":
        auction = Auction.from_dict(record["data"])
        return jsonify({"found": True, "status": "COMPLETED", "summary": views.public_summary(auction)})
    return jsonify({"found": True, "status": record["status"]})


@app.route("/api/auction", methods=["POST"])
def create_auction():
    global current_auction
    with lock:
        if current_auction and current_auction.status != "COMPLETED":
            return jsonify({"error": "An auction is already active. End or reset it first."}), 400
        current_auction = Auction()
        _persist()
        return jsonify({"code": current_auction.code, "adminToken": current_auction.admin_token})


# ---------------------------------------------------------------------------
# Participant actions
# ---------------------------------------------------------------------------


@app.route("/api/join", methods=["POST"])
def join():
    data = request.get_json(force=True) or {}
    code = (data.get("code") or "").strip().upper()
    with lock:
        if not current_auction or current_auction.code != code:
            return jsonify({"error": "Auction not found."}), 404
        try:
            participant = current_auction.join(data.get("name") or "")
        except ValidationError as e:
            return jsonify({"error": str(e)}), 400
        _persist()
    _broadcast()
    return jsonify({"participantId": participant["id"], "token": participant["token"]})


def _find_participant_or_error(data):
    code = (data.get("code") or "").strip().upper()
    if not current_auction or current_auction.code != code:
        raise ValidationError("Auction not found.")
    participant = current_auction.find_by_token(data.get("token") or "")
    if not participant:
        raise ValidationError("Session not found.")
    return participant


@app.route("/api/bid", methods=["POST"])
def bid():
    data = request.get_json(force=True) or {}
    with lock:
        try:
            participant = _find_participant_or_error(data)
            current_auction.place_bid(participant["id"], data.get("amount"))
        except ValidationError as e:
            return jsonify({"error": str(e)}), 400
        _persist()
    _broadcast()
    return jsonify({"ok": True})


# ---------------------------------------------------------------------------
# Admin actions
# ---------------------------------------------------------------------------


def _require_admin(data):
    if not current_auction:
        raise ValidationError("No active auction.")
    if data.get("code") != current_auction.code or data.get("adminToken") != current_auction.admin_token:
        raise ValidationError("Not authorized.")


ADMIN_ACTIONS = {
    "start_planning": lambda a, data: a.start_planning(),
    "begin_bidding": lambda a, data: a.begin_bidding(),
    "confirm_sale": lambda a, data: a.confirm_sale(),
    "skip_item": lambda a, data: a.skip_item(),
    "pause": lambda a, data: a.pause(),
    "resume": lambda a, data: a.resume(),
    "close_category": lambda a, data: a.close_category(),
    "reoffer_item": lambda a, data: a.reoffer_item(data.get("itemId"), data.get("price")),
    "direct_grant": lambda a, data: a.direct_grant(data.get("itemId"), data.get("participantId"), data.get("price")),
    "end_auction": lambda a, data: a.end_auction(),
}


@app.route("/api/admin/<action>", methods=["POST"])
def admin_action(action):
    data = request.get_json(force=True) or {}
    global current_auction
    with lock:
        try:
            _require_admin(data)
        except ValidationError as e:
            return jsonify({"error": str(e)}), 400

        if action == "reset_auction":
            if current_auction.status == "COMPLETED":
                return jsonify({"error": "Completed auctions can't be reset - create a new one instead."}), 400
            db.delete_auction(current_auction.code)
            current_auction = None
            return jsonify({"ok": True, "reset": True})

        fn = ADMIN_ACTIONS.get(action)
        if not fn:
            return jsonify({"error": "Unknown action."}), 400
        try:
            fn(current_auction, data)
        except ValidationError as e:
            return jsonify({"error": str(e)}), 400
        _persist()
    _broadcast()
    return jsonify({"ok": True})


# ---------------------------------------------------------------------------
# Real-time stream (Server-Sent Events)
# ---------------------------------------------------------------------------


@app.route("/api/stream")
def stream():
    global _sub_counter
    role = request.args.get("role")
    code = (request.args.get("code") or "").strip().upper()

    with lock:
        if not current_auction or current_auction.code != code:
            return jsonify({"error": "Auction not found."}), 404

        if role == "admin":
            if request.args.get("adminToken") != current_auction.admin_token:
                return jsonify({"error": "Not authorized."}), 403
            sub = {"queue": queue.Queue(), "role": "admin", "code": code}
            initial = (
                views.public_summary(current_auction)
                if current_auction.status == "COMPLETED"
                else views.admin_view(current_auction)
            )
        else:
            participant = current_auction.find_by_token(request.args.get("token") or "")
            if not participant:
                return jsonify({"error": "Session not found."}), 404
            current_auction.set_connected(participant["id"], True)
            sub = {"queue": queue.Queue(), "role": "participant", "code": code, "participant_id": participant["id"]}
            initial = (
                views.public_summary(current_auction)
                if current_auction.status == "COMPLETED"
                else views.participant_view(current_auction, participant["id"])
            )

        _sub_counter += 1
        sub_id = _sub_counter
        subscribers[sub_id] = sub
        newly_connected_participant = sub["role"] == "participant"
        if newly_connected_participant:
            active_participant_stream[sub["participant_id"]] = sub_id
        _push(sub, initial)

    if newly_connected_participant:
        _broadcast()  # let the admin (and others) see the connection status flip immediately

    def gen():
        try:
            while True:
                try:
                    msg = sub["queue"].get(timeout=15)
                    yield f"data: {msg}\n\n"
                except queue.Empty:
                    yield ": keep-alive\n\n"
        finally:
            with lock:
                subscribers.pop(sub_id, None)
                is_participant = sub["role"] == "participant"
                is_still_current = active_participant_stream.get(sub.get("participant_id")) == sub_id
                if is_participant and is_still_current and current_auction and current_auction.code == code:
                    current_auction.set_connected(sub["participant_id"], False)
                    _persist()
            if is_participant and is_still_current:
                _broadcast()

    return Response(
        stream_with_context(gen()),
        mimetype="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ---------------------------------------------------------------------------
# Background timer - resolves each item's 15s silence window
# ---------------------------------------------------------------------------


def _timer_loop():
    while True:
        time.sleep(1)
        changed = False
        with lock:
            if current_auction and current_auction.tick():
                _persist()
                changed = True
        if changed:
            _broadcast()


threading.Thread(target=_timer_loop, daemon=True).start()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=True, threaded=True, use_reloader=False)
