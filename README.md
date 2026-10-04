# UAQ Family Connect — Premium Responsive UI

This version keeps the existing Supabase authentication and data flow, while redesigning the family-facing experience for three responsive layouts:

- Mobile: app-like single-column layout with fixed bottom navigation
- Tablet: wider two-column layouts where appropriate
- Desktop: dedicated sidebar navigation and premium dashboard layout

## Family navigation

Home · Moments · Appointments · Announcements · More

## Preserved backend/data

The existing Supabase login/session validation, resident profile RPC, `family_updates`, `family_appointments`, `family_announcements`, and private Storage signed URLs are retained.

## Run locally

```bash
npm install
npm run dev
```

For production:

```bash
npm run build
```

## Notes

- Greeting automatically changes between Good morning / Good afternoon / Good evening based on the user's device time.
- Family Access in the UI states the intended maximum of 2 devices. Active-device counting is not fabricated in the UI; connect it to backend session/device tracking if you later want a live `1/2` or `2/2` counter.
- Photos and videos remain driven by the existing `family_updates` data and Storage signed URLs.
