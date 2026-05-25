-- ═══════════════════════════════════════════════════════════════════
-- Vi Smart — Bookmarks, Watch History & Doubts
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- ─── BOOKMARKS ──────────────────────────────────────────────
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  lecture_id uuid references public.lectures(id) on delete cascade,
  note_title text,
  note_url text,
  note_type text default 'lecture',
  created_at timestamptz default now()
);

create index if not exists idx_bookmarks_user on public.bookmarks(user_id);
create index if not exists idx_bookmarks_lecture on public.bookmarks(lecture_id);

alter table public.bookmarks enable row level security;

create policy "Users can manage own bookmarks"
  on public.bookmarks for all
  using (auth.uid() = user_id);

create policy "Admins can view all bookmarks"
  on public.bookmarks for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ─── WATCH HISTORY ──────────────────────────────────────────
create table if not exists public.watch_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  lecture_id uuid references public.lectures(id) on delete cascade not null,
  watched_seconds integer default 0,
  total_seconds integer default 0,
  completed boolean default false,
  last_watched_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(user_id, lecture_id)
);

create index if not exists idx_watch_history_user on public.watch_history(user_id);
create index if not exists idx_watch_history_recent on public.watch_history(last_watched_at desc);

alter table public.watch_history enable row level security;

create policy "Users can manage own watch history"
  on public.watch_history for all
  using (auth.uid() = user_id);

create policy "Admins can view all watch history"
  on public.watch_history for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ─── DOUBTS ─────────────────────────────────────────────────
create table if not exists public.doubts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  lecture_id uuid references public.lectures(id) on delete set null,
  question text not null,
  image_url text,
  ai_answer text,
  teacher_answer text,
  status text not null default 'pending' check (status in ('pending','answered_by_ai','answered_by_teacher','closed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_doubts_user on public.doubts(user_id);
create index if not exists idx_doubts_status on public.doubts(status);
create index if not exists idx_doubts_lecture on public.doubts(lecture_id);

alter table public.doubts enable row level security;

create policy "Users can manage own doubts"
  on public.doubts for all
  using (auth.uid() = user_id);

create policy "Admins can view all doubts"
  on public.doubts for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Teachers can view assigned doubts"
  on public.doubts for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher'));

create policy "Teachers can answer doubts"
  on public.doubts for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher'));
