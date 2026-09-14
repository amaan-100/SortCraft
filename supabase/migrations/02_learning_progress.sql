-- SortCraft — Phase 2/3 migration
-- Learning levels, quiz results and badges, all protected by RLS.

-- ---------------------------------------------------------------------------
-- level_progress: one row per user per level, holding their best quiz result
-- ---------------------------------------------------------------------------
create table if not exists public.level_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  level_id integer not null check (level_id between 1 and 10),
  best_score integer not null default 0 check (best_score >= 0),
  questions integer not null default 0 check (questions >= 0),
  xp_earned integer not null default 0 check (xp_earned >= 0),
  completed_at timestamptz not null default now(),
  primary key (user_id, level_id)
);

create index if not exists level_progress_user_idx
  on public.level_progress (user_id);

alter table public.level_progress enable row level security;

drop policy if exists "Users read own level progress" on public.level_progress;
create policy "Users read own level progress"
  on public.level_progress for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users insert own level progress" on public.level_progress;
create policy "Users insert own level progress"
  on public.level_progress for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users update own level progress" on public.level_progress;
create policy "Users update own level progress"
  on public.level_progress for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own level progress" on public.level_progress;
create policy "Users delete own level progress"
  on public.level_progress for delete to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- user_badges: badge ids are defined in the client (src/data/badges.ts)
-- ---------------------------------------------------------------------------
create table if not exists public.user_badges (
  user_id uuid not null references auth.users (id) on delete cascade,
  badge_id text not null,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create index if not exists user_badges_user_idx on public.user_badges (user_id);

alter table public.user_badges enable row level security;

drop policy if exists "Users read own badges" on public.user_badges;
create policy "Users read own badges"
  on public.user_badges for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users insert own badges" on public.user_badges;
create policy "Users insert own badges"
  on public.user_badges for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users update own badges" on public.user_badges;
create policy "Users update own badges"
  on public.user_badges for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own badges" on public.user_badges;
create policy "Users delete own badges"
  on public.user_badges for delete to authenticated
  using (auth.uid() = user_id);

-- No policies are granted to the `anon` role, so anonymous visitors cannot read
-- or write any row in these tables.
