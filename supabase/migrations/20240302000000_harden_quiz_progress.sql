-- SortCraft - harden quiz scoring and progress ownership.
--
-- This migration is non-destructive to application data. It replaces secured
-- functions, adjusts grants/policies, and adds one profile protection trigger.
-- It does not drop tables, columns, users, profiles, progress, attempts, badges,
-- or authentication data.

-- Preserve RLS even if the remote database was configured manually.
alter table public.profiles enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.level_progress enable row level security;
alter table public.user_badges enable row level security;

-- Compatibility backfill in case an earlier draft of 20240301000000 was
-- already applied remotely. The WHERE clause makes reruns a no-op once the
-- derived fields match the existing score/questions data.
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

-- A display-name constraint is intentionally omitted. Existing production data
-- cannot be inspected from a migration authoring environment, and even a NOT
-- VALID constraint would affect future updates to legacy rows. Frontend sign-up
-- and Settings validation enforce the current limit without altering names.
-- This no-op-compatible drop also removes the constraint if an earlier draft of
-- the preceding migration was applied before this hardening migration.
alter table public.profiles
  drop constraint if exists profiles_display_name_length;

-- Authoritative score/progress tables are read-only to browser roles. Writes
-- occur only through the SECURITY DEFINER functions below. SELECT continues to
-- use the existing auth.uid()-scoped RLS policies.
revoke insert, update, delete on table public.quiz_attempts
  from public, anon, authenticated;
revoke insert, update, delete on table public.level_progress
  from public, anon, authenticated;
revoke insert, update, delete on table public.user_badges
  from public, anon, authenticated;

-- Remove now-unused write policies as defense in depth. Even if table grants
-- are accidentally restored later, RLS still denies direct browser writes.
drop policy if exists "Users insert own quiz attempts" on public.quiz_attempts;
drop policy if exists "Users delete own quiz attempts" on public.quiz_attempts;
drop policy if exists "Users insert own level progress" on public.level_progress;
drop policy if exists "Users update own level progress" on public.level_progress;
drop policy if exists "Users delete own level progress" on public.level_progress;
drop policy if exists "Users insert own badges" on public.user_badges;
drop policy if exists "Users update own badges" on public.user_badges;
drop policy if exists "Users delete own badges" on public.user_badges;

-- Normal profile edits may change identity fields, but cannot change derived XP
-- or level totals. SECURITY DEFINER functions execute as their owner and can
-- update these fields after validating a quiz or reset request.
create or replace function public.protect_profile_progress_fields()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if current_user in ('anon', 'authenticated') then
    new.total_xp := old.total_xp;
    new.current_level := old.current_level;
  end if;
  return new;
end;
$$;

revoke all on function public.protect_profile_progress_fields()
  from public, anon, authenticated;

drop trigger if exists profiles_protect_progress on public.profiles;
create trigger profiles_protect_progress
  before update on public.profiles
  for each row execute function public.protect_profile_progress_fields();

-- Remove the client-trusting six-argument overload if an earlier draft reached
-- a database. The only quiz RPC created below accepts a level and selections.
drop function if exists public.record_quiz_attempt(
  integer, integer, integer, boolean, integer, jsonb
);

create or replace function public.record_quiz_attempt(
  p_level_id integer,
  p_answers jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_expected_total integer;
  v_answer_count integer;
  v_distinct_count integer;
  v_valid_count integer;
  v_score integer;
  v_passed boolean;
  v_level_reward integer;
  v_xp integer;
  v_previous_xp integer := 0;
  v_xp_awarded integer := 0;
  v_normalized_answers jsonb;
  v_algorithm_slug text;
  v_current_level integer := 1;
  v_total_xp integer := 0;
  v_i integer;
  v_progress jsonb;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  -- Serialize submissions and resets for this user. This makes the previous-XP
  -- read and reported XP delta safe under simultaneous requests.
  perform 1
  from public.profiles
  where id = v_user
  for update;

  if not found then
    raise exception 'Profile not found';
  end if;

  if p_level_id not between 1 and 10 then
    raise exception 'Invalid level';
  end if;

  v_expected_total := case p_level_id
    when 1 then 3 when 2 then 4 when 3 then 3 when 4 then 3 when 5 then 3
    when 6 then 4 when 7 then 4 when 8 then 4 when 9 then 3 when 10 then 4
  end;

  v_level_reward := case p_level_id
    when 1 then 80
    when 2 then 100 when 3 then 100 when 4 then 100
    when 5 then 120
    when 6 then 140 when 7 then 140 when 8 then 140 when 9 then 140
    when 10 then 180
  end;

  v_algorithm_slug := case p_level_id
    when 2 then 'bubble' when 3 then 'selection' when 4 then 'insertion'
    when 6 then 'merge' when 7 then 'quick' when 8 then 'heap'
    when 9 then 'shell' else null
  end;

  if jsonb_typeof(p_answers) <> 'array' then
    raise exception 'Invalid answer payload';
  end if;

  -- Level N requires a server-owned passing record for level N-1. Because the
  -- function always filters by v_user, no caller can use another user's record.
  if p_level_id > 1 and not exists (
    select 1
    from public.level_progress lp
    where lp.user_id = v_user
      and lp.level_id = p_level_id - 1
      and lp.questions > 0
      and lp.best_score * 1.0 / lp.questions >= 0.6
  ) then
    raise exception 'Level % is locked due to an incomplete prerequisite', p_level_id;
  end if;

  -- Server-owned answer key. The browser submits only stable question ids and
  -- zero-based selected option indices; client correctness values are ignored.
  with answer_key(question_id, level_id, correct_option, option_count) as (
    values
      ('l1q1', 1, 1, 4), ('l1q2', 1, 2, 4), ('l1q3', 1, 1, 4),
      ('l2q1', 2, 1, 4), ('l2q2', 2, 1, 4), ('l2q3', 2, 1, 4),
      ('l2q4', 2, 1, 4),
      ('l3q1', 3, 1, 4), ('l3q2', 3, 0, 4), ('l3q3', 3, 1, 4),
      ('l4q1', 4, 1, 4), ('l4q2', 4, 2, 4), ('l4q3', 4, 1, 4),
      ('l5q1', 5, 2, 4), ('l5q2', 5, 1, 4), ('l5q3', 5, 1, 4),
      ('l6q1', 6, 2, 4), ('l6q2', 6, 1, 4), ('l6q3', 6, 1, 4),
      ('l6q4', 6, 0, 4),
      ('l7q1', 7, 1, 4), ('l7q2', 7, 1, 4), ('l7q3', 7, 1, 4),
      ('l7q4', 7, 1, 4),
      ('l8q1', 8, 2, 4), ('l8q2', 8, 1, 4), ('l8q3', 8, 1, 4),
      ('l8q4', 8, 1, 4),
      ('l9q1', 9, 1, 4), ('l9q2', 9, 1, 4), ('l9q3', 9, 1, 4),
      ('l10q1', 10, 1, 4), ('l10q2', 10, 1, 4),
      ('l10q3', 10, 1, 4), ('l10q4', 10, 1, 4)
  ), submitted as (
    select
      a.ordinality,
      a.item ->> 'questionId' as question_id,
      case
        when jsonb_typeof(a.item) = 'object'
          and (a.item ->> 'selected') ~ '^[0-9]+$'
          then (a.item ->> 'selected')::integer
        else null
      end as selected
    from jsonb_array_elements(p_answers) with ordinality as a(item, ordinality)
  ), checked as (
    select
      s.ordinality,
      s.question_id,
      s.selected,
      k.correct_option,
      (
        k.question_id is not null
        and k.level_id = p_level_id
        and s.selected between 0 and k.option_count - 1
      ) as valid,
      coalesce(s.selected = k.correct_option, false) as is_correct
    from submitted s
    left join answer_key k on k.question_id = s.question_id
  )
  select
    count(*),
    count(distinct question_id),
    count(*) filter (where valid),
    count(*) filter (where valid and is_correct),
    jsonb_agg(
      jsonb_build_object(
        'questionId', question_id,
        'selected', selected,
        'correct', is_correct
      ) order by ordinality
    )
  into
    v_answer_count,
    v_distinct_count,
    v_valid_count,
    v_score,
    v_normalized_answers
  from checked;

  if v_answer_count <> v_expected_total
    or v_distinct_count <> v_expected_total
    or v_valid_count <> v_expected_total then
    raise exception 'Invalid or incomplete answer payload';
  end if;

  v_passed := v_score * 1.0 / v_expected_total >= 0.6;
  v_xp := case
    when v_passed then
      round(v_level_reward * v_score::numeric / v_expected_total)::integer
    else 0
  end;

  select coalesce(lp.xp_earned, 0)
  into v_previous_xp
  from public.level_progress lp
  where lp.user_id = v_user and lp.level_id = p_level_id;
  v_previous_xp := coalesce(v_previous_xp, 0);

  insert into public.quiz_attempts
    (user_id, level_id, algorithm_slug, score, total_questions, passed, answers)
  values
    (v_user, p_level_id, v_algorithm_slug, v_score, v_expected_total,
     v_passed, v_normalized_answers);

  insert into public.level_progress
    (user_id, level_id, best_score, questions, xp_earned, completed_at,
     status, lesson_completed, quiz_completed, challenge_completed, attempts)
  values
    (v_user, p_level_id, v_score, v_expected_total, v_xp, now(),
     case when v_passed then 'completed' else 'unlocked' end,
     true, v_passed, false, 1)
  on conflict (user_id, level_id) do update
    set best_score = greatest(public.level_progress.best_score, excluded.best_score),
        questions = excluded.questions,
        xp_earned = greatest(public.level_progress.xp_earned, excluded.xp_earned),
        completed_at = case
          when excluded.quiz_completed then now()
          else public.level_progress.completed_at
        end,
        status = case
          when public.level_progress.quiz_completed or excluded.quiz_completed
            then 'completed'
          else 'unlocked'
        end,
        lesson_completed = true,
        quiz_completed = public.level_progress.quiz_completed or excluded.quiz_completed,
        attempts = public.level_progress.attempts + 1,
        updated_at = now();

  v_xp_awarded := greatest(v_xp - v_previous_xp, 0);

  -- Recompute profile totals exclusively from authoritative progress rows.
  select coalesce(sum(lp.xp_earned), 0)::integer
  into v_total_xp
  from public.level_progress lp
  where lp.user_id = v_user;

  v_current_level := 1;
  for v_i in 1..9 loop
    if exists (
      select 1
      from public.level_progress lp
      where lp.user_id = v_user
        and lp.level_id = v_i
        and lp.questions > 0
        and lp.best_score * 1.0 / lp.questions >= 0.6
    ) then
      v_current_level := v_i + 1;
    else
      exit;
    end if;
  end loop;

  update public.profiles
  set total_xp = v_total_xp,
      current_level = v_current_level
  where id = v_user;

  select to_jsonb(lp)
  into v_progress
  from public.level_progress lp
  where lp.user_id = v_user and lp.level_id = p_level_id;

  return jsonb_build_object(
    'progress', coalesce(v_progress, '{}'::jsonb),
    'score', v_score,
    'total', v_expected_total,
    'passed', v_passed,
    'xp_awarded', v_xp_awarded,
    'total_xp', v_total_xp,
    'current_level', v_current_level,
    'algorithm_slug', v_algorithm_slug
  );
end;
$$;

revoke all on function public.record_quiz_attempt(integer, jsonb)
  from public, anon, authenticated;
grant execute on function public.record_quiz_attempt(integer, jsonb)
  to authenticated;

-- Existing reset action: delete only the caller's learning records and reset
-- only that caller's derived profile totals. The profile/auth user remain.
create or replace function public.reset_learning_progress()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  -- Uses the same lock as quiz submission so reset and submission cannot race.
  perform 1
  from public.profiles
  where id = v_user
  for update;

  if not found then
    raise exception 'Profile not found';
  end if;

  delete from public.quiz_attempts where user_id = v_user;
  delete from public.user_badges where user_id = v_user;
  delete from public.level_progress where user_id = v_user;

  update public.profiles
  set total_xp = 0,
      current_level = 1
  where id = v_user;
end;
$$;

revoke all on function public.reset_learning_progress()
  from public, anon, authenticated;
grant execute on function public.reset_learning_progress()
  to authenticated;