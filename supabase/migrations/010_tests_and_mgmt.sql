-- ═══════════════════════════════════════════════════════════════════
-- Vi Smart — Tests, Lectures Management, Materials Management
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- ─── TESTS ──────────────────────────────────────────────────
create table if not exists public.tests (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references public.batches(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null,
  description text,
  duration_minutes integer not null default 60,
  total_marks integer not null default 0,
  negative_marking numeric(4,2) default 0,
  pass_percentage integer default 40,
  starts_at timestamptz,
  ends_at timestamptz,
  is_published boolean default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_tests_batch on public.tests(batch_id);
create index if not exists idx_tests_subject on public.tests(subject_id);

-- Test questions
create table if not exists public.test_questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid references public.tests(id) on delete cascade not null,
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option text not null check (correct_option in ('a','b','c','d')),
  explanation text,
  marks integer not null default 1,
  question_order integer not null default 0,
  created_at timestamptz default now()
);

create index if not exists idx_test_questions_test on public.test_questions(test_id);

-- Student test attempts
create table if not exists public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  test_id uuid references public.tests(id) on delete cascade not null,
  answers jsonb default '{}',
  score integer default 0,
  total_marks integer default 0,
  correct_count integer default 0,
  incorrect_count integer default 0,
  unanswered_count integer default 0,
  percentage numeric(5,2) default 0,
  passed boolean default false,
  started_at timestamptz default now(),
  submitted_at timestamptz,
  time_taken_seconds integer default 0
);

create index if not exists idx_test_attempts_user on public.test_attempts(user_id);
create index if not exists idx_test_attempts_test on public.test_attempts(test_id);

-- ─── Lecture Progress Tracking (enhanced) ───────────────────
create table if not exists public.lecture_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  lecture_id uuid references public.lectures(id) on delete cascade not null,
  completed boolean default false,
  watched_percentage numeric(5,2) default 0,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique(user_id, lecture_id)
);

create index if not exists idx_lecture_completions_user on public.lecture_completions(user_id);

-- ─── Teacher Notifications (broadcast) ─────────────────────
alter table public.notifications add column if not exists created_by uuid references public.profiles(id);
alter table public.notifications add column if not exists target_role text check (target_role in ('all','students','teachers','batch'));
alter table public.notifications add column if not exists batch_id uuid references public.batches(id);

-- RLS
alter table public.tests enable row level security;
alter table public.test_questions enable row level security;
alter table public.test_attempts enable row level security;
alter table public.lecture_completions enable row level security;

-- Tests policies
create policy "Anyone can view published tests"
  on public.tests for select
  using (is_published = true);

create policy "Teachers can manage tests"
  on public.tests for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher'));

create policy "Admins can manage all tests"
  on public.tests for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Test questions policies
create policy "Anyone can view questions of published tests"
  on public.test_questions for select
  using (exists (select 1 from public.tests where id = test_id and is_published = true));

create policy "Teachers can manage questions"
  on public.test_questions for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher'));

create policy "Admins can manage all questions"
  on public.test_questions for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Test attempts policies
create policy "Users can view own attempts"
  on public.test_attempts for select
  using (auth.uid() = user_id);

create policy "Users can insert own attempts"
  on public.test_attempts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own attempts"
  on public.test_attempts for update
  using (auth.uid() = user_id);

create policy "Teachers can view all attempts"
  on public.test_attempts for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher','admin')));

-- Lecture completions policies
create policy "Users can manage own completions"
  on public.lecture_completions for all
  using (auth.uid() = user_id);

create policy "Admins can view all completions"
  on public.lecture_completions for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher','admin')));
