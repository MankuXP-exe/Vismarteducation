-- ═══════════════════════════════════════════════════════════════════
-- Vi Smart — XP & Gamification System
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- ─── User XP Profiles ─────────────────────────────────────────
create table if not exists public.user_xp (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  total_xp integer default 0,
  weekly_xp integer default 0,
  daily_xp integer default 0,
  level integer default 1,
  streak_days integer default 0,
  longest_streak integer default 0,
  last_active_date date,
  badges text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── XP Transaction Log ────────────────────────────────────────
create table if not exists public.xp_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  action text not null,
  xp_earned integer not null,
  multiplier real default 1,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists idx_xp_logs_user on public.xp_logs(user_id);
create index if not exists idx_xp_logs_user_action on public.xp_logs(user_id, action);
create index if not exists idx_xp_logs_created on public.xp_logs(created_at desc);

-- ─── Badges Definition ─────────────────────────────────────────
create table if not exists public.badges (
  id text primary key,
  name text not null,
  description text not null,
  icon text not null,
  requirement_type text not null,
  requirement_value integer not null,
  created_at timestamptz default now()
);

-- ─── User Badges Earned ────────────────────────────────────────
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  badge_id text references public.badges(id) on delete cascade not null,
  earned_at timestamptz default now(),
  unique(user_id, badge_id)
);

-- ─── Weekly Leaderboard (auto-reset view) ──────────────────────
create or replace view public.weekly_leaderboard as
select
  ux.user_id,
  p.full_name,
  p.avatar_url,
  ux.weekly_xp,
  ux.level,
  rank() over (order by ux.weekly_xp desc) as rank
from public.user_xp ux
join public.profiles p on p.id = ux.user_id
order by ux.weekly_xp desc;

-- ─── All-Time Leaderboard ──────────────────────────────────────
create or replace view public.alltime_leaderboard as
select
  ux.user_id,
  p.full_name,
  p.avatar_url,
  ux.total_xp,
  ux.level,
  rank() over (order by ux.total_xp desc) as rank
from public.user_xp ux
join public.profiles p on p.id = ux.user_id
order by ux.total_xp desc;

-- ─── RLS ────────────────────────────────────────────────────────
alter table public.user_xp enable row level security;
alter table public.xp_logs enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

create policy "Users can view own XP" on public.user_xp for select using (auth.uid() = user_id);
create policy "Admins can view all XP" on public.user_xp for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Users can view own logs" on public.xp_logs for select using (auth.uid() = user_id);
create policy "Admins can view all logs" on public.xp_logs for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Anyone can view badges" on public.badges for select using (true);
create policy "Admins can manage badges" on public.badges for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Users can view own badges" on public.user_badges for select using (auth.uid() = user_id);
create policy "Anyone can view earned badges" on public.user_badges for select using (true);

-- ─── Seed Badges ────────────────────────────────────────────────
insert into public.badges (id, name, description, icon, requirement_type, requirement_value) values
  ('first_login', 'First Steps', 'Log in for the first time', '👣', 'login', 1),
  ('streak_7', 'Consistent Learner', 'Maintain a 7-day streak', '🔥', 'streak', 7),
  ('streak_30', 'Dedicated Scholar', 'Maintain a 30-day streak', '💎', 'streak', 30),
  ('streak_100', 'Iron Will', 'Maintain a 100-day streak', '🏆', 'streak', 100),
  ('lectures_10', 'Bookworm', 'Watch 10 lectures', '📚', 'lectures_watched', 10),
  ('lectures_50', 'Knowledge Seeker', 'Watch 50 lectures', '📖', 'lectures_watched', 50),
  ('lectures_100', 'Marathon Watcher', 'Watch 100 lectures', '🎯', 'lectures_watched', 100),
  ('tests_10', 'Test Warrior', 'Attempt 10 tests', '⚔️', 'tests_attempted', 10),
  ('tests_50', 'Exam Crusher', 'Attempt 50 tests', '💪', 'tests_attempted', 50),
  ('top_10_weekly', 'Rising Star', 'Reach Top 10 in weekly leaderboard', '⭐', 'weekly_rank', 10),
  ('top_3_weekly', ' podium Finisher', 'Reach Top 3 in weekly leaderboard', '🥉', 'weekly_rank', 3),
  ('xp_1000', 'XP Apprentice', 'Earn 1,000 total XP', '🌟', 'total_xp', 1000),
  ('xp_5000', 'XP Master', 'Earn 5,000 total XP', '💫', 'total_xp', 5000),
  ('xp_10000', 'XP Legend', 'Earn 10,000 total XP', '👑', 'total_xp', 10000)
on conflict (id) do nothing;
