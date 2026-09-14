# SortCraft

**Build your understanding, one algorithm at a time.**

SortCraft is an interactive sorting-algorithm visualizer built for university
students learning data structures & algorithms. It turns the abstract idea of a
sorting algorithm into a step-by-step animation with live pseudocode, real
comparison/swap counters, guided lesson levels, quizzes and gamified progress.

**Live demo:** https://sort-craft.vercel.app/

---

## Features

**Visualizer**
- Seven algorithms with an animated bar chart and a real step engine — no faked
  movement: Bubble, Selection, Insertion, Shell, Merge, Quick and Heap sort
- Play, pause, step forward/backward, scrub, replay, skip-to-end
- Custom arrays and configurable animation speed
- Live pseudocode highlighting, plain-English explanations and Big-O complexity cards

**Comparison lab**
- Race several algorithms on the same array and compare real comparison/swap
  counts and other metrics side by side

**Learning path**
- Ten sequential lesson levels, each with a short lesson, key points and a quiz
- 35 quiz questions with answer review and retakes
- XP, 8 badges, level map and a progress dashboard
- Progress saved per-user with Supabase (email/password auth)

## Tech stack

| Layer | Technology |
| --- | --- |
| UI | React 19 + TypeScript |
| Build | Vite (single-file output) |
| Styling | Tailwind CSS v4 (light/dark mode) |
| Routing | React Router (HashRouter) |
| Animation | Framer Motion |
| Auth | Supabase Auth (email/password) |
| Database | Supabase PostgreSQL |
| Security | Row Level Security + hardened `SECURITY DEFINER` RPCs |

No separate backend server — the sorting engine runs entirely in the browser and
Supabase is the data layer.

## Project structure

```
src/
├── algorithms/       Pure sorting logic (bubbleSort, quickSort, ... , stepRecorder)
├── components/       UI: auth, layout, quiz, visualizer, ui primitives
├── context/          AuthContext, ProgressContext, ThemeContext
├── data/             levels.ts (10 levels + quizzes), badges.ts
├── hooks/            useSortPlayer, usePrefersReducedMotion, useQuizAttempts
├── lib/              supabase.ts (client), quizData.ts
├── pages/            Landing, Visualizer, Compare, Levels, Progress, Dashboard, ...
└── utils/            cn, array, displayName, quizAnswers
supabase/
└── migrations/       SQL schema — apply these to your Supabase project
```

## Getting started (local development)

Requirements: Node.js 18+

```bash
npm install
cp .env.example .env   # then fill in your Supabase values
npm run dev            # opens http://localhost:5173
```

`.env.example` contains:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Get these from your Supabase project (Project Settings → API). Only the public
**anon** key ever ships to the browser — never put a service-role key in the
frontend.

The app runs without Supabase configured, but auth and progress-syncing features
are disabled until you add the keys.

## Database setup

The schema lives in `supabase/migrations/`. Apply them in order once (Dashboard
→ SQL Editor → paste + run each file):

1. `20240101000000_create_profiles.sql`
2. `20240201000000_learning_progress.sql`
3. `20240301000000_quiz_attempts_and_identity.sql`
4. `20240302000000_harden_quiz_progress.sql`

Alternatively use the Supabase CLI: `supabase link --project-ref <ref>` then
`supabase db push`.

The migrations create the user-owned tables (`profiles`, `level_progress`,
`quiz_attempts`, `user_badges`), enable Row Level Security, and install the
`record_quiz_attempt()` and `reset_learning_progress()` RPCs. Score, pass/fail and
XP are always computed inside PostgreSQL — never trusted from the client.

## Deployment (Vercel)

1. Push this repository to GitHub.
2. On Vercel, import the repo with framework preset **Vite** (build
   `npm run build`, output `dist`).
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for Production, Preview
   and Development.
4. In Supabase → Authentication → URL Configuration, add your Vercel site URL to
   the redirect allow-list (for email-confirmation links).

Routing uses `HashRouter`, so no rewrite rules are required.

## Roadmap

- [x] Interactive visualizer (play, pause, step, scrub, replay, custom arrays)
- [x] Comparison lab
- [x] Ten learning levels + 35 quiz questions
- [x] XP, badges, level map, dashboard
- [x] Email/password auth (Supabase) + protected routes
- [x] Per-attempt quiz history with answer review and retakes
- [ ] Non-comparison sorts (counting/radix), leaderboards