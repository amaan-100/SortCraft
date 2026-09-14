-- SortCraft — Phase 4/5 migration (additive, non-destructive)
--
-- Adds a quiz_attempts table (per-attempt history with answer review) and a small
-- set of level_progress status columns. It intentionally creates no submission
-- RPC; the next migration installs the only hardened write path.
--
-- IMPORTANT: this script is idempotent. It uses "create ... if not exists" and
-- "drop ... if exists" throughout, so it is safe to run repeatedly and safe to
-- paste into the Supabase SQL editor against an EXISTING database. It never
-- drops tables, columns, users or rows.

-- Idempotent prerequisite for gen_random_uuid().
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. quiz_attempts — one row per attempt, answers stored as a JSON array
-- ---------------------------------------------------------------------------
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  level_id integer not null check (level_id between 1 and 10),
  algorithm_slug text,
  score integer not null check (score >= 0),
  total_questions integer not null default 1 check (total_questions > 0),
  passed boolean not null default false,
  answers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists quiz_attempts_user_idx
  on public.quiz_attempts (user_id, level_id, created_at desc);

alter table public.quiz_attempts enable row level security;

drop policy if exists "Users read own quiz attempts" on public.quiz_attempts;
create policy "Users read own quiz attempts"
  on public.quiz_attempts for select to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 2. level_progress — add status columns (nullable so existing rows are fine)
-- ---------------------------------------------------------------------------
alter table public.level_progress
  add column if not exists status text not null default 'unlocked';
alter table public.level_progress
  add column if not exists lesson_completed boolean not null default false;
alter table public.level_progress
  add column if not exists quiz_completed boolean not null default false;
alter table public.level_progress
  add column if not exists challenge_completed boolean not null default false;
alter table public.level_progress
  add column if not exists attempts integer not null default 0;
alter table public.level_progress
  add column if not exists updated_at timestamptz not null default now();

-- ---------------------------------------------------------------------------
-- 3. Backfill the new status fields from existing score data.
-- Existing rows represent levels that were already attempted before these
-- columns existed. No score, XP, user, or progress row is removed or reset.
-- ---------------------------------------------------------------------------
update public.level_progress
set
  lesson_completed = true,
  quiz_completed = (
    questions > 0 and best_score * 1.0 / questions >= 0.6
  ),
  status = case
    when questions > 0 and best_score * 1.0 / questions >= 0.6
      then 'completed'
    else 'unlocked'
  end,
  attempts = greatest(attempts, 1),
  updated_at = now()
where
  lesson_completed is distinct from true
  or quiz_completed is distinct from (
    questions > 0 and best_score * 1.0 / questions >= 0.6
  )
  or status is distinct from case
    when questions > 0 and best_score * 1.0 / questions >= 0.6
      then 'completed'
    else 'unlocked'
  end
  or attempts < 1;

-- ---------------------------------------------------------------------------
-- 4. Fail closed until the hardened RPC in the next migration is installed.
-- SELECT remains available through the existing auth.uid()-scoped RLS policies.
-- ---------------------------------------------------------------------------
revoke insert, update, delete on table public.quiz_attempts
  from public, anon, authenticated;
revoke insert, update, delete on table public.level_progress
  from public, anon, authenticated;
revoke insert, update, delete on table public.user_badges
  from public, anon, authenticated;
