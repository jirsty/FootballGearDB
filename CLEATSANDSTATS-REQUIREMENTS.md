# Cleats & Stats — Product Requirements Document

## Overview

**Cleats & Stats** is a web app that ranks NFL player gear (helmets, cleats, gloves, visors) by on-field performance stats. It answers questions like "Which helmet ran the most yards this week?" and "Which gloves caught the most touchdowns this season?" — then lets users shop the winning gear through affiliate links.

The core loop: **Curiosity → Data → Entertainment → Purchase**

---

## Brand Identity

- **Name:** Cleats & Stats
- **Tagline:** "Which gear dominates the field?"
- **Tone:** Fun, data-driven, sports-obsessed. Think ESPN meets a premium analytics dashboard. Not corporate — this is for fans who love football AND love gear.
- **Disclaimer:** "Not affiliated with the NFL" must appear in the footer.

---

## Design System

### Theme

Dark mode is the **only** theme. The app should feel like watching football on a Sunday night — immersive, high-contrast, data-forward.

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#0D0D14` | Page background |
| `--bg-secondary` | `#131320` | Card backgrounds |
| `--bg-surface` | `#1E1E2A` | Elevated surfaces, hover states |
| `--accent-primary` | `#FF6B35` | Primary CTA, active states, rankings, brand color |
| `--accent-success` | `#00E5A0` | Positive change indicators, "live" indicators |
| `--accent-info` | `#4DA8FF` | Secondary data highlights, opponent side in matchups |
| `--accent-danger` | `#FF4D6A` | Negative change indicators, alerts |
| `--accent-purple` | `#B266FF` | Tertiary accent for variety in charts/badges |
| `--text-primary` | `#FFFFFF` | Headings, key data |
| `--text-secondary` | `rgba(255,255,255,0.7)` | Body text |
| `--text-tertiary` | `rgba(255,255,255,0.4)` | Labels, captions |
| `--text-muted` | `rgba(255,255,255,0.2)` | Column headers, dividers |
| `--border-subtle` | `rgba(255,255,255,0.05)` | Card borders, dividers |

Use CSS variables throughout. Never hardcode colors.

### Typography

| Element | Font | Weight | Size | Extras |
|---------|------|--------|------|--------|
| Logo / App name | Oswald | 700 | 22px | letter-spacing: 1px |
| Page headings (H1) | Oswald | 700 | 48px | letter-spacing: -0.5px |
| Section headings (H2) | Oswald | 700 | 24px | letter-spacing: 0.5px |
| Data values (big numbers) | Oswald | 700 | 20-28px | — |
| Body text | Barlow | 400-600 | 14-16px | — |
| Labels / Tags | Barlow Condensed | 500-600 | 10-12px | uppercase, letter-spacing: 1.5-2px |
| Navigation | Barlow Condensed | 600 | 13px | uppercase, letter-spacing: 2px |

Load from Google Fonts: `Oswald:wght@400;500;600;700`, `Barlow:wght@400;500;600;700`, `Barlow+Condensed:wght@400;500;600;700`

**Never use:** Inter, Roboto, Arial, system fonts, or any generic sans-serif as primary fonts.

### Spacing & Radius

- Card border-radius: `16-20px`
- Button border-radius: `8-12px`
- Pill/tag border-radius: `20px`
- Card padding: `24-32px`
- Section gaps: `32-40px`
- Consistent 8px grid system

### Borders & Surfaces

- Card borders: `1px solid rgba(255,255,255,0.05)`
- Card backgrounds: subtle gradients, e.g., `linear-gradient(135deg, rgba(30,30,42,1) 0%, rgba(20,20,28,1) 100%)`
- Atmospheric radial gradients in the background (very subtle, `0.03-0.05` opacity) using accent colors
- Glass effect where appropriate: `backdrop-filter: blur(20px)` with semi-transparent backgrounds

### Animations & Interactions

- **Page load:** Staggered fade-slide-up animations on cards and rows (`animation-delay` increments of `0.08-0.1s`)
- **Hover on leaderboard rows:** Subtle background highlight with `rgba(255,107,53,0.06)`, arrow indicator slides right
- **Hover on stat cards:** `translateY(-4px)` lift with background gradient shift
- **Progress bars:** Animate width on load with `cubic-bezier(0.16, 1, 0.3, 1)` easing
- **Transitions:** All interactive elements should have `transition: all 0.3s ease` minimum
- **Live indicator:** Pulsing green dot with `pulse` keyframe animation near "Week X" label
- **Easing:** Prefer `cubic-bezier(0.16, 1, 0.3, 1)` for entrances, standard `ease` for hovers

---

## Pages & Features

### 1. Leaderboard (Home Page) — `/`

This is the core of the app. It's a ranked table of gear items sorted by a chosen stat category.

**Layout:**
- Hero section at top with headline: "WHICH GEAR DOMINATES THE FIELD?" and subheading
- Row of 4 "Weekly Highlight" stat cards below the hero
- Main leaderboard table below the cards
- Gear matchup teaser card below the leaderboard
- Shop CTA banner at the bottom

**Weekly Highlight Cards (row of 4):**
- Each card shows: icon/emoji, label (e.g., "Most Rushing Yards"), value (e.g., "2,341 yds"), and gear name
- Cards should have hover lift animation
- Staggered load animation

**Leaderboard Table:**
- **Filters at top:**
  - Stat category tabs: Rushing, Passing, Receiving, Kicking, Defense
  - Gear type pills: All Gear, Helmets, Cleats, Gloves, Visors
  - Time range dropdown: This Week, Last 4 Weeks, Season 2025
- **Each row shows:**
  - Rank number (top 3 highlighted in accent color)
  - Gear icon/image with color-coded background
  - Gear name + type badge (e.g., "Helmet" in a small pill)
  - Horizontal progress bar (relative to #1 ranked item)
  - Total stat value (e.g., "12,847")
  - Stat unit label (e.g., "rushing yds")
  - Weekly change indicator with +/- and green/red color
  - Player count ("47 players")
  - Arrow indicator on hover → links to Gear Detail page
- **Bottom of table:** "Showing X of Y gear items" + "View Full Leaderboard" button

**Gear Matchup Teaser:**
- Two gear items side by side with "VS" in the middle
- Show each item's key stat
- Label: "Sunday Matchup — Who wins this week?"
- Links to the full Matchup page

**Shop CTA Banner:**
- "GEAR UP LIKE THE PROS" headline
- Subtitle about shopping top-ranked gear
- "Shop Now" button with gradient background and box-shadow glow

### 2. Gear Detail Page — `/gear/:slug`

Shown when a user clicks a gear item from the leaderboard.

**Layout:**
- **Hero area:** Gear name, type badge, gear image (placeholder for now), and overall rank badge
- **Stat summary row:** Key stats in cards (total yards, TDs, players wearing it, rank change)
- **Performance chart:** Line chart showing the gear's cumulative stat over the season (week by week). Use Recharts or Chart.js.
- **Players using this gear:** Grid or list of player cards showing name, team, position, and their individual stats while wearing this gear. Each player card links to the Player Detail page.
- **Shop section:** Product card with gear image, price, star rating (if available), and affiliate link button: "Buy on Amazon" / "Buy on Dick's" etc. Style the button prominently with the primary accent gradient.
- **Related gear:** Row of cards showing other gear in the same category (e.g., other helmets)

### 3. Player Detail Page — `/player/:slug`

**Layout:**
- **Player header:** Name, team, position, headshot (placeholder silhouette for now)
- **Gear loadout:** Visual display of the player's full gear setup — helmet, cleats, gloves, visor. Each item is a clickable card that links to its Gear Detail page. Think of this like an RPG character equipment screen.
- **Player stats:** Key stats table for the current season
- **Gear performance context:** "How does [Player]'s gear stack up?" — show where each of their gear items ranks on the leaderboard

### 4. Matchups Page — `/matchups`

**Layout:**
- **This week's matchups:** List of upcoming games with the gear battle framed for each
- **Each matchup card shows:**
  - Game info (Team A vs Team B, date/time)
  - Featured gear battle: e.g., "Riddell SpeedFlex (12,847 rush yds) vs Schutt F7 (8,991 rush yds)"
  - Which gear "wins" based on aggregate stats of players in that game
- **Historical matchup results:** Past weeks' gear battles with outcomes

### 5. Shop / Browse Page — `/shop`

**Layout:**
- Filterable grid of gear items
- Each card shows: gear image, name, type, price, performance badge (e.g., "#1 in Rushing"), star rating
- Affiliate link button on each card
- Filters: gear type, price range, brand, performance rank
- Sort by: rank, price, popularity

### 6. Navigation

**Top navbar (sticky):**
- Logo: lightning bolt icon + "CLEATS & STATS" text (the "&" in accent color)
- Nav links: Leaderboard, Matchups, Players, Shop
- Right side: Live indicator ("Live · Week 14" with pulsing green dot)
- Mobile: hamburger menu

**Footer:**
- "© 2025 Cleats & Stats. Not affiliated with the NFL."
- "Data updated weekly during NFL season"
- Links: About, Contact, Privacy Policy, Affiliate Disclosure

---

## Data Architecture

### Core Entities

**Gear Item:**
```
{
  id: string,
  name: string,           // e.g., "Riddell SpeedFlex"
  brand: string,          // e.g., "Riddell"
  type: enum,             // "helmet" | "cleats" | "gloves" | "visor"
  model: string,          // specific model name
  imageUrl: string,
  affiliateLinks: [       // array of retailer links
    { retailer: string, url: string, price: number }
  ],
  slug: string            // URL-friendly name
}
```

**Player:**
```
{
  id: string,
  name: string,
  team: string,
  position: string,
  headshotUrl: string,
  gear: {
    helmet: gearItemId,
    cleats: gearItemId,
    gloves: gearItemId,
    visor: gearItemId | null
  },
  slug: string
}
```

**Weekly Stats (per player per week):**
```
{
  playerId: string,
  week: number,
  season: number,
  rushingYards: number,
  passingYards: number,
  receivingYards: number,
  touchdowns: number,
  receptions: number,
  fieldGoalsMade: number,
  fieldGoalsAttempted: number,
  sacks: number,
  interceptions: number,
  tackles: number,
  // ... other relevant stats
}
```

**Gear Leaderboard (computed/aggregated):**
```
{
  gearItemId: string,
  statCategory: string,    // "rushing" | "passing" | "receiving" | "kicking" | "defense"
  timeRange: string,       // "week-14" | "last-4-weeks" | "season-2025"
  totalValue: number,      // aggregated stat
  weeklyChange: number,    // change from previous period
  playerCount: number,     // how many players contribute
  rank: number
}
```

### Data Flow

1. **Player stats** are sourced from an NFL stats API (e.g., ESPN, Sportradar, or free alternatives like nfl_data_py)
2. **Gear assignments** (which player wears what) are manually maintained initially, potentially crowd-sourced later
3. **Leaderboard aggregation:** For each gear item, sum up the relevant stat across all players who wear that gear, for the selected time range
4. **Weekly updates:** Data refreshes after each game day (Sunday/Monday/Thursday)

### MVP Data Approach

For the MVP, use static JSON files with sample data to prove the UI and concept. Structure the code so that swapping in a real API later is straightforward (use a data service layer / API abstraction).

Create seed data for at least:
- 15-20 gear items (mix of helmets, cleats, gloves)
- 30-40 players with gear assignments
- 4 weeks of stats data
- Pre-computed leaderboard rankings

---

## Technical Stack (Recommended)

- **Framework:** Next.js (App Router) or Vite + React
- **Styling:** Tailwind CSS with custom theme config matching the design system above, OR CSS Modules
- **Charts:** Recharts for performance charts
- **State:** React state + context for filters/tabs (no heavy state management needed for MVP)
- **Data:** Static JSON files for MVP, designed to be replaced by API calls
- **Deployment:** Vercel (for Next.js) or Netlify
- **Font loading:** Google Fonts via `next/font` or `<link>` tag

---

## Responsive Behavior

- **Desktop (1200px+):** Full layout as described above
- **Tablet (768-1199px):** Weekly highlight cards stack 2x2, leaderboard table scrolls horizontally if needed
- **Mobile (< 768px):**
  - Hamburger nav menu
  - Weekly highlight cards stack vertically (1 column)
  - Leaderboard rows simplify: hide progress bar, show rank + name + stat + change only
  - Gear matchup card stacks vertically
  - Shop cards in single column

---

## Affiliate Integration

- Every gear item should have space for 1-3 affiliate links (Amazon, Dick's Sporting Goods, manufacturer direct)
- Affiliate buttons should use the primary accent gradient style with clear "Buy on [Retailer]" labels
- Include a sitewide affiliate disclosure in the footer and on the Shop page
- Track clicks on affiliate links (add `data-affiliate-click` attributes for future analytics integration)

---

## Future Features (Post-MVP)

These are NOT in scope for the initial build, but the architecture should not block them:

- **User accounts and favorites** (save favorite gear, follow players)
- **Push notifications** ("Your favorite helmet just threw 4 TDs!")
- **Shareable stat cards** (auto-generated images for Twitter/Instagram)
- **Community voting** (rate gear, leave reviews)
- **"Build your loadout"** (pick gear and see combined stats of players using that setup)
- **Podcast / content hub**
- **Expansion to other sports** (NBA shoes, MLB bats/gloves, etc.)
- **Real-time data updates** during games
- **Crowd-sourced gear tracking** (users submit gear sightings with photo proof)

---

## MVP Scope Summary

Build these pages with static data:

1. **Leaderboard (home)** — fully interactive with filters, tabs, time range
2. **Gear Detail** — performance chart, player list, affiliate links
3. **Player Detail** — gear loadout display, stats
4. **Navigation** — header with logo, nav links, live indicator, footer

**Not in MVP:** Matchups page, Shop page (but the data model should support them), user accounts, real-time data, shareable cards.

---

## Reference: UI Prototype

A React component prototype has been created that demonstrates the look and feel of the Leaderboard page. Use it as a visual reference for:
- Color palette and gradients
- Typography hierarchy
- Card styling and hover states
- Leaderboard row layout and progress bars
- Animation patterns (staggered fade-in, hover lifts, pulsing indicators)
- Gear matchup card layout
- Shop CTA banner styling

The prototype uses inline styles for portability, but the production app should use Tailwind or CSS Modules with the design tokens defined above.
