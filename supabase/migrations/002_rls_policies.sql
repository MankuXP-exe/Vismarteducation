-- ═══════════════════════════════════════════════════════════════════
-- Vi Smart Learning Education — Row Level Security Policies
-- Run AFTER 001_schema.sql
-- ═══════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.batches enable row level security;
alter table public.enrollments enable row level security;
alter table public.subjects enable row level security;
alter table public.chapters enable row level security;
alter table public.lectures enable row level security;
alter table public.live_classes enable row level security;
alter table public.study_materials enable row level security;
alter table public.lecture_progress enable row level security;
alter table public.doubts enable row level security;
alter table public.bookmarks enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;


-- ━━━ PROFILES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- ━━━ BATCHES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create policy "Anyone can view active batches"
  on public.batches for select using (is_active = true);

create policy "Admins and teachers can manage batches"
  on public.batches for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','teacher'))
  );


-- ━━━ ENROLLMENTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create policy "Students see own enrollments"
  on public.enrollments for select using (auth.uid() = student_id);

create policy "System can create enrollments"
  on public.enrollments for insert with check (auth.uid() = student_id);


-- ━━━ SUBJECTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create policy "Enrolled students can view subjects"
  on public.subjects for select using (
    exists (
      select 1 from public.enrollments
      where student_id = auth.uid() and batch_id = subjects.batch_id and status = 'active'
    )
    or exists (
      select 1 from public.profiles where id = auth.uid() and role in ('admin','teacher')
    )
  );


-- ━━━ CHAPTERS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create policy "Enrolled students can view chapters"
  on public.chapters for select using (
    exists (
      select 1 from public.enrollments
      where student_id = auth.uid() and batch_id = chapters.batch_id and status = 'active'
    )
    or exists (
      select 1 from public.profiles where id = auth.uid() and role in ('admin','teacher')
    )
  );


-- ━━━ LECTURES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create policy "Enrolled students can view lectures"
  on public.lectures for select using (
    is_free_preview = true
    or exists (
      select 1 from public.enrollments
      where student_id = auth.uid() and batch_id = lectures.batch_id and status = 'active'
    )
    or exists (
      select 1 from public.profiles where id = auth.uid() and role in ('admin','teacher')
    )
  );


-- ━━━ LECTURE PROGRESS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create policy "Students manage own progress"
  on public.lecture_progress for all
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);


-- ━━━ DOUBTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create policy "Students manage own doubts"
  on public.doubts for all
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

create policy "Teachers can answer doubts"
  on public.doubts for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','teacher'))
  );


-- ━━━ BOOKMARKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create policy "Students manage own bookmarks"
  on public.bookmarks for all
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);


-- ━━━ PAYMENTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create policy "Students see own payments"
  on public.payments for select using (auth.uid() = student_id);


-- ━━━ NOTIFICATIONS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create policy "Users see own notifications"
  on public.notifications for all using (auth.uid() = user_id);


-- ━━━ STUDY MATERIALS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create policy "Enrolled students view materials"
  on public.study_materials for select using (
    exists (
      select 1 from public.enrollments
      where student_id = auth.uid() and batch_id = study_materials.batch_id and status = 'active'
    )
    or exists (
      select 1 from public.profiles where id = auth.uid() and role in ('admin','teacher')
    )
  );


-- ━━━ LIVE CLASSES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create policy "Enrolled students view live classes"
  on public.live_classes for select using (
    exists (
      select 1 from public.enrollments
      where student_id = auth.uid() and batch_id = live_classes.batch_id and status = 'active'
    )
    or exists (
      select 1 from public.profiles where id = auth.uid() and role in ('admin','teacher')
    )
  );
