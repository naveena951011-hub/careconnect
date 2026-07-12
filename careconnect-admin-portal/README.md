# CareConnect Admin Portal — Dispatch Console

A themed React dashboard for CareConnect (Day 1 admin-portal deliverable),
built around the live-incident + resident-approval data from the Days 1–8
backend.

## Design

Not a generic SaaS dashboard — styled as a night-shift security dispatch
console: void-navy background, indigo panels, signal-red for live SOS,
amber for pending approvals, teal for resolved/safe. Live incident cards
carry a radar-pulse animation; the clock and elapsed-time counters update
in real time. Monospace type for anything that reads like console data
(IDs, timestamps, coordinates); a humanist sans for everything read as
prose.

Currently wired to realistic mock data matching the shape of the actual
`/api/sos/alerts/` and `/api/society/resident-approvals/` responses — swap
the `SEED_*` constants in `AdminDashboard.jsx` for real `fetch()` calls to
connect it to the live backend.

## Run it

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## What's interactive right now

- **Simulate incoming SOS** button — adds a new live alert to the feed with
  the radar-pulse animation, exactly like a real trigger would look
- **Mark as resolved** on any live alert
- **Approve / reject** on pending resident requests — removes them from the
  queue with a toast confirmation
- Live clock + live-incrementing "time ago" on each alert

## Next step to make it real

Replace the mock arrays with calls to your Django backend:
```js
fetch('http://localhost:8000/api/sos/alerts/', {
  headers: { Authorization: `Bearer ${accessToken}` }
})
```
You'll need CORS already allows `http://localhost:5173` — add it to
`CORS_ALLOWED_ORIGINS` in your backend `.env` if you change the dev port.
