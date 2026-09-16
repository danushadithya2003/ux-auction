# UX Auction

A live, real-time auction app for the "UX Auction" team activity. One person runs it as the
Auctioneer; everyone else joins from their own device (phone or laptop) using a short invite code.

## Running it

Open Terminal, then:

```bash
cd "/Users/danush.pandiyarajan/UX Auction"
source venv/bin/activate
python3 app.py
```

Leave that window open for the whole session — it's the server. You'll see something like:

```
* Running on http://127.0.0.1:5050
* Running on http://192.168.31.153:5050
```

- **On your own computer**, open `http://localhost:5050` and choose "I'm the Auctioneer".
- **Everyone else**, on the same WiFi, opens the second address shown (the `192.168.x.x` one) on
  their own phone/laptop and chooses "I'm a Participant" with the invite code you give them.

To stop the server, go back to that Terminal window and press `Ctrl+C`.

Auction data is saved to `data/uxauction.db` as you go, so if the server needs to restart mid-session
(or the computer sleeps), everyone can just reopen the page and they'll resume exactly where they
left off — same budget, same items won.

## What's built (MVP)

- Full auction flow: lobby → planning (browse) → live bidding, category by category → summary.
- Real-time updates for everyone (bids, sales, pauses, category changes) with no page refresh needed.
- The rules we agreed on: 100-coin budget, a 15-second silence timer per item, the "everyone must
  get one item per category" guarantee (with the Admin's direct-grant tool to close gaps), unsold-item
  re-offering, late joiners, pause/resume, and a durable "look up a finished auction by its code"
  summary page.
- Sample card content (5 categories × 10 cards) themed around the "rescue a failing product"
  scenario, so the mechanics can be tried immediately.

## Known gaps / next steps

- **Card content is a placeholder.** The JSON-upload option we discussed (swap in your own real
  cards before a session) isn't built yet — for now the content in `seed_data.py` is what loads
  every time. Say the word if you want that upload feature next, or want to hand-edit the sample
  content directly.
- **One auction at a time**, by design — starting a new one only works once the current one is
  ended or reset.
- Category illustrations are placeholder flat art (one style per category) — swap in real images
  later without touching any layout code.
- This is a development server, fine for a single live session with your team, not meant for
  public/internet-facing use.

## Project layout

- `app.py` — the server (routes + real-time updates)
- `state.py` — the auction rules/state machine (the part that enforces every business rule)
- `views.py` — shapes what the Admin vs. each Participant is allowed to see
- `seed_data.py` — the card content
- `db.py` — saves/restores auctions to `data/uxauction.db`
- `static/app/` — the **built** frontend that Flask actually serves (generated, don't hand-edit)
- `frontend/` — the React app source (see below)
- `test_state.py` — automated checks for the auction rules (`python3 test_state.py`)

## The frontend is a real React app now

The UI moved from plain JS to React + Vite, with a proper multi-page layout for participants
(Live Auction / All Items / My Collection / Players / How It Works, via a sidebar) and React Router
for navigation between them. This only matters if you (or I, in a future session) want to change
the UI — **running the app never requires Node**, only rebuilding it does.

**You don't need any of this to just run the app** — `static/app/` is already built and committed,
and `python3 app.py` serves it directly, same as before.

**To make frontend changes**, a local Node install lives in `.node/` (via `nodeenv`, isolated to
this project — nothing installed system-wide):

```bash
cd "/Users/danush.pandiyarajan/UX Auction/frontend"
source ../.node/bin/activate

npm run dev     # fast dev server at :5173, proxies API calls to Flask on :5050
                # (run `python3 app.py` in another terminal first)

npm run build   # rebuilds static/app/ — do this before shipping a change,
                # since that's the only thing app.py actually serves
```

Frontend source layout (`frontend/src/`):
- `pages/` — one file per screen (`Landing`, `admin/AdminApp`, `participant/LiveAuction`, etc.)
- `layout/` — the persistent sidebar + topbar shell around participant pages
- `components/` — shared pieces (item card bits, timer ring, category illustrations, summary view)
- `context/` — holds the live real-time state from the server and exposes actions (bid, admin controls)
- `api/` — talks to the Flask backend (HTTP + the real-time stream)
- `styles/`, `theme/` — design tokens (colors, fonts) and the per-category color/illustration mapping
