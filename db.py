"""
Durable storage for auctions.

Each auction is stored as a single JSON blob keyed by its invite code.
This is intentionally simple (no relational schema/migrations) given the
scale of this app - a handful of auctions, each with at most ~10 players
and ~50 items. It exists so that:
  - a completed auction's code keeps resolving to its summary indefinitely
  - the server can recover the in-progress auction after a restart
"""

import json
import os
import sqlite3
import threading

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "uxauction.db")

_lock = threading.Lock()


def _connect():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS auctions (
            code TEXT PRIMARY KEY,
            status TEXT NOT NULL,
            data TEXT NOT NULL,
            updated_at REAL NOT NULL
        )
        """
    )
    return conn


_conn = _connect()


def save_auction(code: str, status: str, data: dict, updated_at: float) -> None:
    with _lock:
        _conn.execute(
            "INSERT INTO auctions (code, status, data, updated_at) VALUES (?, ?, ?, ?) "
            "ON CONFLICT(code) DO UPDATE SET status=excluded.status, data=excluded.data, updated_at=excluded.updated_at",
            (code, status, json.dumps(data), updated_at),
        )
        _conn.commit()


def get_auction_by_code(code: str):
    with _lock:
        row = _conn.execute("SELECT code, status, data FROM auctions WHERE code = ?", (code,)).fetchone()
    if not row:
        return None
    return {"code": row[0], "status": row[1], "data": json.loads(row[2])}


def get_active_auction():
    """At most one auction is ever active (not COMPLETED) at a time."""
    with _lock:
        row = _conn.execute(
            "SELECT code, status, data FROM auctions WHERE status != 'COMPLETED' ORDER BY updated_at DESC LIMIT 1"
        ).fetchone()
    if not row:
        return None
    return {"code": row[0], "status": row[1], "data": json.loads(row[2])}


def delete_auction(code: str) -> None:
    with _lock:
        _conn.execute("DELETE FROM auctions WHERE code = ?", (code,))
        _conn.commit()
