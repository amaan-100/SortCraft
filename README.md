# SortCraft

**Build your understanding, one algorithm at a time.**

SortCraft is an educational sorting-algorithm visualizer for university students. It
turns the abstract idea of a sorting algorithm into a step-by-step animation with live
pseudocode, real comparison/swap counters, guided lesson levels, quizzes and
gamified progress.

---

## 1. Project overview

### What it does

- Visualizes seven sorting algorithms with animated bars and a real step engine
  (no faked movement).
- Teaches the material through ten sequential learning levels, each with a short
  lesson, key points and a quiz of 1–4 questions.
- Saves progress (XP, levels, badges, quiz history) to a Supabase-backed account.

### Who it is for

Undergraduate and first-year postgraduate students learning sorting during a data
structures & algorithms course, and anyone who wants to *see* what Big-O means.

### Educational objectives

Know what a comparison sort is, understand the classic quadratic sorts and the main
`O(n log n)` sorts, read/step through pseudocode, and confidently *choose* an
algorithm using stability, memory and worst-case guarantees.

### Supported algorithms

| Family | Algorithms |
| --- | --- |
| Quadratic | Bubble Sort, Selection Sort, Insertion Sort |
| Advanced / divide & conquer | Shell Sort, Merge Sort, Quick Sort, Heap Sort |

### Current feature status

- ✅ Interactive visualizer (play, pause, step, scrub, replay, skip-to-end, custom arrays)
- ✅ Comparison lab (race several algorithms on one array)
- ✅ Ten learning levels + 35 quiz questions
- ✅ XP, 8 badges, level map, dashboard
- ✅ Email/password authentication (Supabase), protected routes
- ✅ Per-attempt quiz history with answer review and retakes
- ⏳ Non-comparison sorts (counting/radix), leaderboards

---

## 2. Technology stack

| Layer | Technology |
| --- | --- |
| UI framework | React 19 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v4 (utility-first, dark mode via `@custom-variant`) |
| Routing | React Router (HashRouter) |
| Icons | Lucide React |
| Animation | Framer Motion (bars, panels — disabled under `prefers-reduced-motion`) |
| Auth | Supabase Auth (email/password) |
| Database | Supabase PostgreSQL |
| Security | Row Level Security + `SECURITY DEFINER` RPC |
| Hosting | Vercel (frontend) |

Dependencies are listed in `package.json`. No separate backend server is used.

---

## 3. System architecture

```
Browser (React SPA)
   │   sorting engine (pure, local) ── animations & metrics
   │   React state / contexts ──────── UI + optimistic local storage
   ▼
Supabase Auth  ──── session, JWT, email/password
   ▼
Supabase PostgreSQL
   ├── public.profiles        (RLS: auth.uid())
   ├── public.level_progress  (RLS: auth.uid())
   ├── public.quiz_attempts   (RLS: auth.uid())
   └── public.user_badges     (RLS: auth.uid())
```

### Where each concern lives

| Concern | Location |
| --- | --- |
| Sorting algorithm logic | `src/algorithms/*` — pure functions, no UI/network imports |
| Step generation & metrics | `src/algorithms/stepRecorder.ts` |
| Animation playback state | `src/hooks/useSortPlayer.ts` |
| Auth session / profile | `src/context/AuthContext.tsx` |
| XP / levels / badges | `src/context/ProgressContext.tsx` |
| Quiz attempts read/write | `src/lib/quizData.ts` + RPC |
| Ownership enforcement | database RLS + `record_quiz_attempt()` RPC — **not** the browser |
| Display-name resolution | `src/utils/displayName.ts` (single fallback chain) |

---

## 4. Frontend structure

```
src/
├── algorithms/       pure sorting logic (bubbleSort, selectionSort, …, types, stepRecorder, index)
├── components/
│   ├── auth/         AuthShell, ProtectedRoute, AuthPrompt
│   ├── layout/       Navbar, Layout, AccountMenu
│   ├── progress/     XpBar, BadgeGrid
│   ├── quiz/         Quiz (answering UI), QuizHistory (review)
│   ├── ui/           Button, Card, Input, Slider, Complexity, ScrollableTable
│   └── visualizer/   BarChart, MiniBars, Controls, StatsBar, CodePanel, ExplanationPanel,
│                     ComplexityCard, ConfigPanel, Legend
├── context/          AuthContext, ProgressContext, ThemeContext
├── data/             levels.ts (10 levels + quizzes), badges.ts
├── hooks/            useSortPlayer, usePrefersReducedMotion, useQuizAttempts
├── lib/              supabase.ts (client), quizData.ts (attempts)
├── pages/            Landing, Visualizer, Compare, Levels, LevelDetail, Progress,
│                     Dashboard, Login, SignUp, Settings, NotFound
└── utils/            cn, array, displayName, quizAnswers
```

---

## 5. Authentication

### Supabase Auth

Auth is handled entirely by Supabase Auth — SortCraft stores **no passwords**. The
client is initialised with only the public **anon** key (`src/lib/supabase.ts`).

| Value | Stored in |
| --- | --- |
| Email + password | `auth.users` (managed by Supabase) |
| `display_name`, `username` (sign-up) | `auth.users.raw_user_meta_data` |
| Authoritative profile (name, XP, level) | `public.profiles` |

### Sign-up flow

1. `SignUpPage` trims and validates the display name and username
   (`src/utils/displayName.ts`).
2. `AuthContext.signUp()` calls `supabase.auth.signUp({ options: { data: { display_name, username } } })`.
3. The DB trigger `handle_new_user()` (migration 1) inserts a `profiles` row from
   that metadata — which is how the name survives when **email confirmation is enabled**
   and there is no session yet.
4. If a session is immediately available, `AuthContext` upserts the `profiles` row
   directly (an update of the trigger's row, not a second profile system).
5. If sign-up started from a protected quiz action, immediate sign-up returns to
   that exact level. With email confirmation enabled, the form stays on the inbox
   instruction; the login link retains the intended return route.

### Login / session restoration / logout

- `signIn()` → `supabase.auth.signInWithPassword`.
- `AuthContext` restores the session via `getSession()` and `onAuthStateChange`,
  then loads `profiles` for the signed-in user.
- `signOut()` clears local identity **before** the network call, so no personalised
  data lingers.
- The protected `/dashboard`, `/progress` and `/settings` routes are wrapped in
  `ProtectedRoute` and redirect to `/login` when signed out.

### Display-name fallback order

Resolved by `resolveDisplayName()` (used by header, dashboard, progress page):

1. `profiles.display_name`
2. `user.user_metadata.display_name`
3. `profiles.username`
4. email local-part
5. `"User"`

The email is only a fallback and is **never** shown in the header when a display
name exists. `AuthContext.loadProfile()` self-heals a blank `profiles.display_name`
from auth metadata on first login.

---

## 6. Database

All tables are in the `public` schema and are **user-owned** (no shared/public data).

| Table | Purpose | Key columns |
| --- | --- | --- |
| `profiles` | One row per user (identity + totals) | `id` (FK→auth.users), `display_name`, `username` (unique), `current_level`, `total_xp` |
| `level_progress` | Best result per user per level | PK `(user_id, level_id)`, `best_score`, `questions`, `xp_earned`, `status`, `attempts`, `completed_at` |
| `quiz_attempts` | Every quiz attempt (append-only) | `id` (uuid), `user_id`, `level_id`, `score`, `total_questions`, `passed`, `answers` (jsonb) |
| `user_badges` | Which badges a user has earned | PK `(user_id, badge_id)` |

### How quiz attempts are saved

- The `Quiz` component records each answer against its **stable question id**
  (`questionId`), never its array position.
- `ProgressContext.submitQuiz()` calls `record_quiz_attempt()` with only
  `p_level_id` and `p_answers` (`questionId` + selected option). Score, pass/fail,
  correctness and XP are calculated exclusively inside PostgreSQL.

### How retakes work

Every submission **inserts a new** `quiz_attempts` row — older attempts are kept and
are read-only. The `level_progress.best_score` and `xp_earned` are only ever *raised*
(`greatest(...)`), so retaking a completed level can never award XP twice.

### How level advancement works

Completion is a quiz with a ≥60% score. Levels unlock sequentially; the RPC refuses
to record an attempt for level `N > 1` unless level `N-1` is already completed. The
client additionally hides locked levels (`isLevelUnlocked()`), but the database check
is the authoritative one.

The existing **Reset progress** action calls `reset_learning_progress()`. That RPC
derives the caller from `auth.uid()`, deletes only that user's attempts/progress/badges,
and resets only the XP/level fields on their profile; it never deletes the account or
profile identity.

---

## 7. RLS security

- Every user-owned table has **RLS enabled**.
- Ownership policies check `auth.uid() = user_id` (or `= id` for `profiles`), so a
  user can only see or delete their own rows.
- Direct browser INSERT/UPDATE/DELETE privileges are revoked on `quiz_attempts`,
  `level_progress` and `user_badges`. The hardened RPCs are the only authoritative
  write/reset paths, and their `SECURITY DEFINER` bodies derive the owner from
  `auth.uid()`.
- A profile trigger prevents authenticated browser requests from changing
  `profiles.total_xp` or `profiles.current_level`; those are derived by the RPC.
- The `anon` role is granted **no** policies, so unauthenticated visitors cannot read
  any user data.
- `auth.uid()` is a Postgres function that returns the id encoded in the caller's JWT;
  a client cannot forge it.

### Why frontend checks are not enough

Hiding buttons (or the `AuthPrompt`) improves UX but does not stop a user opening the
browser console and calling `.from("level_progress").insert({ user_id: "someone-else" })`.
RLS rejects those writes because the insert policy requires `auth.uid() = user_id`.
XP/level scores are validated inside the `SECURITY DEFINER` RPC. The hardened RPC
contains the answer key, validates every stable question id, recomputes score and XP,
normalises the answer JSON, checks prerequisites, and ignores client-calculated
`score`, `passed`, and `xp_reward` fields.

### Testing the policies

Create two accounts (A and B). As A, sign in and run a quiz; confirm the dashboard
shows A's XP. Sign in as B and confirm B sees **nothing** of A's attempts or badges.
Run `supabase db lint` and, if available, `supabase test db`.

---

## 8. Sorting engine

Each algorithm is a pure function `(input: number[], order) => SortStep[]` registered
in `src/algorithms/index.ts`.

A `SortStep` records, for one operation:

- `action` — `COMPARE`, `SWAP`, `INSERT`, `SHIFT`, `OVERWRITE`, `PIVOT`, `MARK_SORTED`, `COMPLETE`
- `array` — a **full snapshot** of the array after the action
- `indices` — the indices affected (for highlighting)
- `explanation` — human-readable text for the panel
- `pseudocodeLine` — line to highlight in the code panel
- `comparisons`, `swaps` — running counters
- `phase`, `sortedIndices`, `selectedIndices`

Because every step stores its own snapshot, **Previous** simply shows the previous
snapshot (no inverse operations) and **seek** jumps straight to any step. Statistics
are the counters on the final step (`summarise()` in `index.ts`). Playback is a single
`setTimeout` in `useSortPlayer`, so two animations can never run at once.

### Adding a new action type

1. Add the string to `ActionType` in `src/algorithms/types.ts`.
2. Map it to a colour in `BarChart.tsx` (`barClasses` + `MOVE_ACTIONS` if it moves data)
   and a badge colour in `ExplanationPanel.tsx` (`actionStyles`).
3. Emit it from your algorithm via the `StepRecorder`.

---

## 9. Adding a new algorithm

1. **Create** `src/algorithms/mySort.ts` implementing `Algorithm`
   (see `mergeSort.ts` as the closest template).
2. Implement `generateSteps` using `StepRecorder` — the recorder handles snapshots,
   counters and the sorted set for you.
3. Add the `meta` fields: `id`, `name`, `family`, `tagline`, `description`,
   `complexity {best,average,worst,space,stable,inPlace}`, `pseudocode[]`, `javaCode`.
4. **Register** it in `src/algorithms/index.ts` — add it to `algorithms` and
   `algorithmList`, and add the id to `AlgorithmId` in `types.ts`.
5. Add complexity expressions via the `<Complexity>` component (keeps `O(n log n)`
   on one line). It appears automatically in the visualizer's algorithm picker,
   the info card, the comparison lab and the landing page.
6. **Test**: open `/visualizer?algo=mySort`, run ascending + descending, step forward
   and backward, scrub, and confirm the final array is fully green and sorted.
7. To teach it, add a level (Section 11) pointing at `algorithm: "mySort"`.

---

## 10. Adding new quizzes

Quiz data lives in `src/data/levels.ts`, inside a `Level.quiz: QuizQuestion[]`.

A question requires:

```ts
{
  id: string;          // STABLE id, e.g. "l2q1" — never the array index
  prompt: string;
  options: string[];   // 2–6 options
  answer: number;      // index into options
  explanation: string; // shown on review
}
```

- Associate a quiz with a level by adding the question to that level's `quiz` array.
- Saved answers are keyed by `question.id`, so reordering questions or options does
  not corrupt existing history.
- Add the same stable id and zero-based correct option to the protected `answer_key`
  values in `record_quiz_attempt()`. For a deployed database, do this in a **new
  incremental migration** that replaces the function; never edit remote rows or
  reset the database. Update that level's expected question count in the RPC too.
- Retakes insert a fresh `quiz_attempts` row; prior attempts stay read-only.
- **Test**: take the quiz, answer some correctly, submit, then open "Previous
  attempts" and verify each answer shows correct/incorrect plus its explanation.

---

## 11. Adding new levels

Level metadata is `src/data/levels.ts`:

```ts
{
  id, title, subtitle, minutes, xpReward, algorithm?, lesson[], keyPoints[], quiz[]
}
```

- **Prerequisites** are implicit: level `N` requires level `N-1` to be completed
  (enforced by `isLevelUnlocked()` in the client and by the RPC on the server).
- **Completion** = ≥60% on the level's quiz.
- **XP** = `round(xpReward * score/total)`, awarded once on your best passing attempt
  (capped and never duplicated).
- The current database contract supports levels 1–10. To add Level 11, create an
  incremental migration that expands the `level_id` check constraints and updates
  `record_quiz_attempt()` with its question count, XP reward, answer ids, optional
  algorithm slug, and prerequisite range. Existing progress rows remain intact.

---

## 12. Adding new comparison metrics

Metric *types* are captured in the results table and cards of `src/pages/ComparePage.tsx`
(`finals[]` built from each run's final `SortStep`). To add a metric like "writes":

1. Capture it in the algorithm's `SortStep` or derive it in `summarise()`
   (`src/algorithms/index.ts`).
2. Add a column to the results table (a `<th scope="col">` + `<td>`), and if desired
   to the per-run stats `<dl>`.
3. Wrap any Big-O-style value in `<Complexity>` and any wide table in
   `<ScrollableTable>` so the page never scrolls sideways on mobile.

---

## 13. Environment setup

`.env.example` contains only:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

| Variable | Browser-safe? | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | ✅ public project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ public anon key (RLS-limited) |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ **never in the frontend** | bypasses RLS |

Local development:

```bash
npm install
cp .env.example .env
npm run dev
```

Supabase setup: create a project, enable the Email provider, copy the project URL +
anon key into `.env`. If email confirmation is on, the app still works — the DB
trigger seeds the profile from sign-up metadata.

---

## 14. Existing Supabase database transition

If you already connected SortCraft to Supabase and want to add the new tables
**without touching existing data**:

1. **Inspect** the current schema: Supabase dashboard → Table Editor, and
   `supabase migration list` if you use the CLI.
2. **Back up** before any schema change (Dashboard → Database → Backups).
3. Apply only pending migrations **in order** with `supabase db push`, or run the
   exact pending files in the SQL editor. The two `202403…` files are idempotent,
   but migration history should remain the source of truth:
   - `supabase/migrations/20240101000000_create_profiles.sql`
   - `supabase/migrations/20240201000000_learning_progress.sql`
   - `supabase/migrations/20240301000000_quiz_attempts_and_identity.sql`
   - `supabase/migrations/20240302000000_harden_quiz_progress.sql`
4. `20240301000000` creates/backfills the quiz schema and immediately revokes direct
   writes. `20240302000000` repeats the conditional compatibility backfill, installs
   the only quiz/reset RPCs, removes any obsolete six-argument quiz function,
   protects profile totals, and reinforces RLS/grants.
   Neither migration deletes application rows, users, profiles, or auth data.
5. **Verify** existing profiles still load and login still works (test two accounts).
6. Update generated database types with `supabase gen types typescript …` if you use them.
7. **Recovery from mismatch:** if either `202403…` version is already marked applied
   remotely with different SQL, do **not** edit/reapply that remote version and do not
   use `migration repair` as a substitute for executing corrective SQL. Create a new
   migration with a later unique timestamp containing the correction, apply it, then
   use `supabase migration repair` only when the schema is already correct and the
   history marker alone is wrong. Never use a destructive reset to reconcile history.

> ⚠️ Destructive commands are **never** run automatically. If you ever need to reset,
> be explicit and aware: `supabase db reset --local` (local only) or
> `drop table …` (manual, remote, destructive).

---

## 15. Deployment

```bash
npm run build      # outputs dist/
npm run preview    # local preview of the production build
```

Vercel:

1. Import the repository, framework preset **Vite**, build `npm run build`, output `dist`.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for Production, Preview and
   Development.
3. In Supabase **Authentication → URL Configuration**, add your Vercel site URL to
   the redirect allow-list (for email confirmation links).
4. Routing uses `HashRouter`, so no rewrite rules are required.

Common errors: missing env vars (auth pages show a warning banner), email-confirmation
links 404 (redirect URL not allow-listed), or "RLS permission denied" (run the latest
migration).

---

## 16. Troubleshooting

| Symptom | Fix |
| --- | --- |
| Display name not appearing / wrong name in header | `profiles.display_name` is blank → reload profile (Settings), or confirm the trigger migration ran; check `resolveDisplayName()` order |
| Session not restoring after refresh | Check the Supabase **Site URL / redirect URLs**; confirm `persistSession` is on (`src/lib/supabase.ts`) |
| "Log in"/"Sign up" still show after login | A stale build or `loading` never resolving — check the browser console for a Supabase fetch error |
| RLS permission denied | The latest migration hasn't run, or you're using a service-role key by mistake (never do) |
| Quiz progress not saving | You're signed out, or the `record_quiz_attempt` RPC is missing (apply both `202403…` migrations) |
| Duplicate XP | Should be impossible — XP is `greatest(existing, new)`; if it happens, the RPC is missing |
| Quiz history missing | `quiz_attempts` table not created, or `loadQuizAttempts` failed (check console) |
| Retake answers not resetting | The retake button remounts the quiz with a new `key` |
| Mobile overflow / horizontal scroll | Data is wider than the viewport — ensure wide tables use `<ScrollableTable>` |
| `O(n log n)` wrapping | Always render Big-O through `<Complexity>` |
| Supabase migration error | Apply migrations in filename order; they are idempotent |
| Environment-variable error | `.env` missing `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`; restart the dev server after editing |

---

## 17. Security checklist

- [ ] RLS enabled on `profiles`, `level_progress`, `quiz_attempts`, `user_badges`
- [ ] No service-role key anywhere in the frontend or `VITE_*` variables
- [ ] No passwords stored or handled manually (Supabase Auth only)
- [ ] Input validation on sign-up (trim + length) and custom arrays
- [ ] Protected routes for `/dashboard`, `/progress`, `/settings`
- [ ] Authenticated writes only (`auth.uid()` checks + RPC)
- [ ] User-ownership checks (`auth.uid() = user_id`)
- [ ] No `dangerouslySetInnerHTML` / unsafe HTML rendering
- [ ] Safe, non-leaky error messages (token/password never logged)
- [ ] No secrets committed to Git (`.env` ignored; only `.env.example` tracked)
- [ ] No destructive database reset during deployment

---

## 18. Manual verification checklist

### Identity and header

- [ ] Sign up with display name `Potato`; the header shows `Potato`, not the email.
- [ ] Refresh, log out, then log in again; `Potato` is restored.
- [ ] Log in as another user; the previous user's name never flashes.
- [ ] Update the name in Settings; the header changes immediately.
- [ ] Confirm logged-out buttons disappear when signed in on desktop and mobile.

### Quiz and progress

- [ ] Signed out: preview a quiz and submit; the auth prompt appears and no XP is awarded.
- [ ] Sign in from that prompt; return to the same level.
- [ ] Submit a passing attempt; it appears in history with date, selected answers,
      correctness, and explanations.
- [ ] Retake with fresh selections; both attempts remain and XP is not duplicated.
- [ ] Try opening a locked level directly; the UI redirects and the RPC rejects a
      forged request.

### Responsive comparison

- [ ] Check `/compare` at 320, 375, 414, 768, 1024 px and desktop width.
- [ ] Confirm `document.documentElement.scrollWidth === document.documentElement.clientWidth`.
- [ ] Only the metrics table scrolls horizontally; it is keyboard-focusable.
- [ ] `O(n log n)` and `O(log n) space` remain on one readable line in both themes.

### RLS

- [ ] User A cannot select User B's `quiz_attempts`, `level_progress`, or profile.
- [ ] Direct INSERT/UPDATE to `quiz_attempts` and `level_progress` is denied.
- [ ] Calling the quiz RPC while signed out is denied.
- [ ] A normal profile update cannot change `total_xp` or `current_level`.
