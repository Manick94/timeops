# TimeOps

Global timezone intelligence app for sales and operations teams. Built as a mobile-first React PWA.

## Quick Start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview production build locally
```

## Tech Stack

| Tool | Version | Role |
|---|---|---|
| Vite | 8 | Build tool & dev server |
| React | 19 | UI framework |
| TypeScript | 6 | Type safety |
| Tailwind CSS | 4 | Styling (via `@tailwindcss/vite`) |
| Zustand | 5 | Global state with `localStorage` persistence |
| React Router | 7 | Client-side routing (HashRouter) |

## Project Structure

```
src/
├── lib/
│   ├── types.ts        # Location, LocationWithTime, OverlapWindow, Suggestion types
│   ├── timezone.ts     # All timezone logic (enrichLocation, computeOverlap, getSuggestion)
│   └── cities.ts       # 30 preset cities with IANA timezone IDs + flagEmoji helper
├── store/
│   └── useStore.ts     # Zustand store — locations[], userTimezone, add/remove actions
├── components/
│   ├── StatusDot.tsx   # Available / Edge / Sleeping indicator with optional label
│   └── TimeWidget.tsx  # Dashboard grid card — flag, city, time, status, diff
├── screens/
│   ├── Dashboard.tsx   # Home: widget grid, map strip, CTA bar, overlap footer
│   ├── WidgetDetail.tsx# Full view: live clock, insights, Call/Schedule/Remove
│   ├── OverlapView.tsx # 24h UTC timeline grid + best overlap window summary
│   └── AddLocation.tsx # Search + toggle add/remove from preset city list
├── App.tsx             # Router — /, /detail/:id, /overlap, /add
├── main.tsx            # React entry point
└── index.css           # Global styles, CSS variables, Tailwind import
```

## Core Logic

### Timezone handling (`src/lib/timezone.ts`)

All conversions use `Intl.DateTimeFormat` — no manual UTC offset math, DST is handled automatically.

```ts
getLocalTime(timezone)          // returns a Date object in the target timezone
enrichLocation(loc, userTz)     // attaches live time, status, diff to a Location
computeOverlap(locations)       // finds best UTC window where all locations are AVAILABLE
getSuggestion(enrichedLocs)     // returns "Call now" / "Edge hours" / "Wait Nh"
```

### Status rules

```
hour >= workStart && hour < workEnd           → AVAILABLE  (green)
hour within 2h before or 3h after work hours → EDGE        (amber)
everything else                               → SLEEPING   (red)
```

Default work hours: 9:00 – 18:00 local. Configurable per location in the data model.

### Overlap algorithm

Scans all 24 UTC hours, checks whether every location is AVAILABLE at each hour, finds the longest consecutive window, and scores it (100% = 4+ hours of overlap).

### Data model

```ts
interface Location {
  id: string
  city: string
  country: string
  countryCode: string   // ISO 3166-1 alpha-2 (for flag emoji)
  timezone: string      // IANA ID e.g. "America/New_York"
  workStart: number     // hour 0–23
  workEnd: number       // hour 0–23
}
```

State is persisted to `localStorage` under the key `timeops-storage`.

## Adding More Cities

Edit `src/lib/cities.ts` and append to the `PRESET_CITIES` array:

```ts
{ id: id(), city: 'Lisbon', country: 'Portugal', countryCode: 'PT', timezone: 'Europe/Lisbon', workStart: 9, workEnd: 18 },
```

Use any [IANA timezone identifier](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) for `timezone`.

## Planned Features (from requirement.md)

- [ ] Interactive world map (tap to select location)
- [ ] Google Calendar integration for scheduling
- [ ] AI suggestion ("Best time to call John?")
- [ ] Custom work hours per location
- [ ] Team collaboration / shared location sets
- [ ] CRM tagging (clients per region)
- [ ] PWA manifest + service worker for offline use and home screen install

## Design Tokens

```css
--color-available: #22C55E   /* green */
--color-edge:      #F59E0B   /* amber */
--color-sleeping:  #EF4444   /* red */
--color-primary:   #3B82F6   /* blue */
--color-bg:        #0F172A   /* background */
--color-card:      #1E293B   /* card surface */
```
