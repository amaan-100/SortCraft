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
| Backend | Java 21 + Spring Boot 3 (sorting engine + quiz scoring) |

The sorting engine and quiz scoring run on a Java Spring Boot backend. When that
server is reachable the frontend uses it (see the **Java engine** badge on the
visualizer); when it is not — for example on the deployed Vercel site — the app
silently falls back to an identical in-browser TypeScript engine. Supabase
remains the data layer for auth and progress in both cases.

## Project structure

```
src/
├── algorithms/       Pure sorting logic (bubbleSort, quickSort, ... , stepRecorder)
├── components/       UI: auth, layout, quiz, visualizer, ui primitives
├── context/          AuthContext, ProgressContext, ThemeContext
├── data/             levels.ts (10 levels + quizzes), badges.ts
├── hooks/            useSortPlayer, usePrefersReducedMotion, useQuizAttempts
├── lib/              supabase.ts (client), api.ts (Java backend client), quizData.ts
├── pages/            Landing, Visualizer, Compare, Levels, Progress, Dashboard, ...
└── utils/            cn, array, displayName, quizAnswers
backend/
├── pom.xml           Maven build (Spring Boot 3.3, Java 21)
└── src/main/java/com/sortcraft/backend/
    ├── controller/   REST endpoints (sort, algorithms, levels, quiz, health)
    ├── engine/       Java port of the sorting algorithms + step recorder
    ├── service/      QuizScorer (server-side answer checking)
    ├── data/         AlgorithmCatalog, LevelCatalog (10 levels, 35 questions)
    ├── model/        DTOs and enums
    └── config/       CORS + global error handling
render.yaml           Render Blueprint (free Docker web service)
supabase/
└── migrations/       SQL schema — apply these to your Supabase project
```

## Getting started (local development)

Requirements: Node.js 18+, Java 21 (JDK) and Maven 3.9+

```bash
# 1. Frontend
npm install
cp .env.example .env   # then fill in your Supabase values
npm run dev            # opens http://localhost:5173

# 2. Java backend (optional but recommended — powers the visualizer + quizzes)
cd backend
mvn spring-boot:run    # listens on http://localhost:8080
cd ..
```

With both running, open http://localhost:5173 and confirm the visualizer shows
the **Java engine** badge. Stop the backend and reload to see the app fall back
to the browser engine without breaking anything.

`.env.example` contains:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_JAVA_BACKEND_URL=http://localhost:8080
```

Get the Supabase values from your project (Project Settings → API). Only the
public **anon** key ever ships to the browser — never put a service-role key in
the frontend. `VITE_JAVA_BACKEND_URL` is optional; it defaults to
`http://localhost:8080`.

The app runs without Supabase configured or without the Java backend, but auth /
progress-syncing and the Java engine are disabled until they are available.

## Java backend

A Spring Boot 3 (Java 21) application that owns the *authoritative* sorting
engine and quiz answer key. The frontend client lives in `src/lib/api.ts`.

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/health` | GET | Lightweight liveness probe the frontend uses to detect the backend |
| `/api/sort` | POST | Compute `SortStep[]` for an array + algorithm + order |
| `/api/algorithms` | GET | Metadata (pseudocode, Java code, complexity) for all 7 algorithms |
| `/api/levels` | GET | All 10 levels with lessons and quizzes |
| `/api/levels/{id}` | GET | A single level |
| `/api/quiz/score` | POST | Server-side quiz scoring with the authoritative answer key |

The step output is byte-for-byte shaped like the in-browser engine's
`SortStep`, so the frontend treats both sources identically. Quiz scoring (score,
pass/fail, XP) mirrors the same rules as the Supabase `record_quiz_attempt()` RPC.

Example — bubble sort steps:

```bash
curl -X POST http://localhost:8080/api/sort \
  -H "Content-Type: application/json" \
  -d '{"array":[5,3,8,1,2],"algorithm":"bubble","order":"asc"}'
```

Example — score a level quiz:

```bash
curl -X POST http://localhost:8080/api/quiz/score \
  -H "Content-Type: application/json" \
  -d '{"levelId":1,"answers":[{"questionId":"l1q1","selected":1},{"questionId":"l1q2","selected":2},{"questionId":"l1q3","selected":1}]}'
```

## Database setup

The schema lives in `supabase/migrations/`. Apply them in order once (Dashboard
→ SQL Editor → paste + run each file):

1. `01_create_profiles.sql`
2. `02_learning_progress.sql`
3. `03_quiz_attempts_and_identity.sql`
4. `04_harden_quiz_progress.sql`

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

### Deploying the Java backend (Render, free)

The backend is hosted on Render as a Docker web service on the **free** plan
(512 MB; it sleeps after ~15 min of inactivity and wakes automatically on the
next request). The config ships in this repo as `render.yaml`.

1. Push this repo to GitHub (already done).
2. On [render.com](https://render.com), sign up with GitHub **→ New → Blueprint**.
3. Pick the **SortCraft** repo. Render reads `render.yaml` and provisions a
   `sortcraft-backend` web service automatically.
4. Click **Apply** / **Create Resources**. The first deploy builds the Docker
   image (a few minutes) and starts on a URL like
   `https://sortcraft-backend.onrender.com`.
5. Verify: open `https://sortcraft-backend.onrender.com/api/health` — you should
   see `{"status":"ok",...}`.

To make the deployed frontend use the Java engine:

1. On Vercel → your project → **Settings → Environment Variables**, add
   `VITE_JAVA_BACKEND_URL` = `https://sortcraft-backend.onrender.com` for
   Production, Preview and Development.
2. Redeploy the Vercel project. Open the visualizer — the badge should now read
   **Java engine**.

**Cold-start note:** on the free tier the backend sleeps after ~15 min idle.
The frontend re-probes the backend every 30 s, so on first load the badge may
briefly show **Browser engine** and flip to **Java engine** within ~30–60 s once
the instance wakes. Everything keeps working meanwhile via the in-browser
engine. The app works exactly the same with the backend down — the Java server
is a progressive enhancement, never a requirement.

## Roadmap

- [x] Interactive visualizer (play, pause, step, scrub, replay, custom arrays)
- [x] Comparison lab
- [x] Ten learning levels + 35 quiz questions
- [x] XP, badges, level map, dashboard
- [x] Email/password auth (Supabase) + protected routes
- [x] Per-attempt quiz history with answer review and retakes
- [ ] Non-comparison sorts (counting/radix), leaderboards