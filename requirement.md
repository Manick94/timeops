# TimeOps – Global Timezone Intelligence App

## 🧠 Product Overview

TimeOps is a mobile-first application designed for global sales and operations teams. It provides real-time timezone visibility, intelligent overlap analysis, and actionable suggestions for communication across regions.

Unlike traditional clock apps, TimeOps focuses on **decision-making**, not just time display.

---

## 🎯 Core Objectives

- Eliminate timezone confusion for global teams
- Provide actionable insights (e.g., “Call now”)
- Visualize global working hours and overlaps
- Enable quick selection of locations via map

---

## 👤 Target Users

- Sales teams handling overseas clients
- Customer success managers
- Remote teams working across timezones
- Freelancers working with global clients

---

## 📱 Platform

- Primary: Android (mobile-first)
- Secondary: Tablet / Web (future)

---

## 🎨 Design System

### Theme

- Dark mode (default)

### Colors

- Available: #22C55E (Green)
- Edge Hours: #F59E0B (Amber)
- Sleeping: #EF4444 (Red)
- Primary: #3B82F6 (Blue)
- Background: #0F172A
- Card: #1E293B

### Typography

- Time: Large, bold (32–48px)
- Labels: Medium (14–16px)
- Secondary info: Small (12px)

---

## 🧩 Core Features

### 1. Dashboard (Home Screen)

Displays multiple timezone widgets in a grid.

#### Components:

- Top Bar:
  - App title: “TimeOps”
  - Add button (+)

- Map Strip:
  - Horizontal scrollable mini-map
  - Tap to open full map

- Widget Grid:
  Each widget contains:
  - Country flag
  - City name
  - Current time
  - Work hours (e.g., 9–18)
  - Status indicator:
    - 🟢 Available
    - 🟡 Edge
    - 🔴 Sleeping

- Bottom Panel:
  - Best overlap time

- CTA Bar:
  - Suggestion (e.g., “Call US now”)

---

### 2. Map Selector Screen

Interactive world map to select locations.

#### Components:

- Search bar (city/country)
- Map view (tap to select)
- Bottom sheet:
  - Location name
  - Timezone
  - Current time
  - Status
  - “Add to Dashboard” button

---

### 3. Widget Detail Screen

Detailed view of a selected timezone.

#### Components:

- Large clock display

- Status indicator

- Work hours

- Time difference from user

- Insights:
  - “Good time to call”
  - “Peak response window”

- Actions:
  - Call Now
  - Schedule
  - Remove

---

### 4. Overlap Intelligence Screen

#### Components:

- Timeline visualization of all selected timezones
- Highlight overlapping working hours
- Suggested meeting time
- Warnings (e.g., late hours)

---

### 5. Smart Suggestion Engine

#### Outputs:

- “Call now”
- “Wait X hours”
- “Best time later today”

---

## ⚙️ Functional Requirements

### Timezone Handling

- Use IANA timezone database (e.g., `Asia/Kolkata`, `America/New_York`)
- Use `Intl.DateTimeFormat` for accurate timezone conversion ([coreui.io][1])
- Handle DST automatically

### Status Calculation

```
if (time >= 9 && time < 18) → AVAILABLE (🟢)
if (time >= 7 && time < 9) OR (time >= 18 && time < 21) → EDGE (🟡)
else → SLEEPING (🔴)
```

---

### Overlap Algorithm

1. Convert all timezones to UTC
2. Define working hours (default: 9–18 local)
3. Find intersection across all selected zones
4. Return:
   - Best overlap window
   - Duration
   - Quality score

---

### Time Conversion Logic

- Use `Intl.DateTimeFormat` API for timezone-safe formatting ([coreui.io][1])
- Avoid relying on system timezone
- Use IANA timezone identifiers ([Wikipedia][2])

---

## 🧱 Component Architecture (Godot-Friendly)

### Scenes / Components

- `Dashboard.tscn`
- `TimeWidget.tscn`
- `MapSelector.tscn`
- `WidgetDetail.tscn`
- `OverlapView.tscn`
- `SuggestionPanel.tscn`

---

### TimeWidget Structure

```
TimeWidget
├── FlagIcon
├── CityLabel
├── TimeLabel
├── StatusIndicator
├── WorkHoursLabel
```

---

## 🔄 Data Model

### Location Object

```
{
  id: string,
  city: string,
  country: string,
  timezone: string,
  workStart: number (default: 9),
  workEnd: number (default: 18)
}
```

---

### App State

```
{
  locations: Location[],
  userTimezone: string,
  suggestions: string
}
```

---

## ⚡ Smart Suggestion Logic

```
if any location is AVAILABLE:
  suggest "Call now"
else:
  find next AVAILABLE window
  suggest "Wait X hours"
```

---

## 🧪 MVP Scope

### Must Have

- Add/remove locations
- Display time widgets
- Status indicators
- Basic overlap calculation

### Nice to Have

- Map UI
- Smart suggestions
- Animations

---

## 🚀 Future Enhancements

- Calendar integration (Google Calendar)
- CRM tagging (clients per region)
- AI assistant (“Best time to call John?”)
- Team collaboration

---

## ⚠️ Edge Cases

- Daylight Saving Time changes
- Countries with single timezone (e.g., India)
- Multiple timezones per country (e.g., USA)
- Incorrect system timezone

---

## 🧠 Key Differentiator

This app is NOT a clock app.

It is a:
→ Decision engine for global communication

---

## ✅ Success Metrics

- Reduced scheduling errors
- Faster call decision time
- Increased successful outreach timing

---

## 🏁 Build Notes

- Start with static timezone list
- Add dynamic map
- Keep UI minimal and fast
- Prioritize performance over visuals initially

---
