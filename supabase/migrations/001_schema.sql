-- ═══════════════════════════════════════════════════════════════════
-- Vi Smart Learning Education — Complete Database Migration
-- Run this entire file in Supabase SQL Editor (one block at a time)
-- ═══════════════════════════════════════════════════════════════════

-- ━━━ BLOCK 1: Extensions ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";


-- ━━━ BLOCK 2: Profiles Table ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  email text unique not null,
  phone text,
  date_of_birth date,
  gender text check (gender in ('male','female','other')),
  current_class text,
  school_name text,
  board text default 'CBSE',
  avatar_url text,
  city text,
  state text default 'Haryana',
  role text not null default 'student' check (role in ('student','teacher','admin')),
  discount_category text check (discount_category in ('none','army','disabled','single_parent')) default 'none',
  discount_verified boolean default false,
  discount_document_url text,
  xp_points integer default 0,
  streak_days integer default 0,
  last_active_date date,
  is_active boolean default true,
  is_email_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function update_updated_at();


-- ━━━ BLOCK 3: Auto-create profile on signup ━━━━━━━━━━━━━━━━━━━━
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Student'),
    new.email,
    new.phone,
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ━━━ BLOCK 4: Batches Table ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create table public.batches (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  title text not null,
  subtitle text,
  description text,
  category text not null,
  stream text,
  class_level text,
  board text default 'CBSE',
  language text default 'Hindi + English',
  thumbnail_url text,
  banner_url text,
  preview_video_url text,
  price numeric(10,2) not null,
  original_price numeric(10,2),
  army_discount_percent integer default 50,
  disabled_discount_percent integer default 50,
  single_parent_flat_price numeric(10,2) default 5000,
  duration_months integer default 12,
  start_date date,
  end_date date,
  has_live_classes boolean default true,
  has_recorded_lectures boolean default true,
  has_notes boolean default true,
  has_doubt_support boolean default true,
  has_tests boolean default false,
  subjects text[] default '{}',
  badge text,
  is_featured boolean default false,
  is_active boolean default true,
  total_students integer default 0,
  total_lectures integer default 0,
  total_notes integer default 0,
  rating numeric(3,2) default 0,
  teacher_id uuid references public.profiles(id),
  teacher_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger batches_updated_at
  before update on public.batches
  for each row execute function update_updated_at();

create index idx_batches_category on public.batches(category);
create index idx_batches_slug on public.batches(slug);
create index idx_batches_active on public.batches(is_active);


-- ━━━ BLOCK 5: Enrollments Table ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create table public.enrollments (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid not null references public.profiles(id) on delete cascade,
  batch_id uuid not null references public.batches(id) on delete cascade,
  payment_id text unique,
  payment_order_id text,
  amount_paid numeric(10,2) not null,
  original_amount numeric(10,2),
  discount_applied text default 'none',
  discount_amount numeric(10,2) default 0,
  coupon_code text,
  status text not null default 'active' check (status in ('active','expired','cancelled','pending')),
  access_start_date timestamptz default now(),
  access_end_date timestamptz,
  completion_percent integer default 0,
  last_accessed_at timestamptz,
  enrolled_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(student_id, batch_id)
);

create trigger enrollments_updated_at
  before update on public.enrollments
  for each row execute function update_updated_at();

create or replace function update_batch_student_count()
returns trigger as $$
begin
  update public.batches
  set total_students = (
    select count(*) from public.enrollments
    where batch_id = new.batch_id and status = 'active'
  )
  where id = new.batch_id;
  return new;
end;
$$ language plpgsql;

create trigger enrollment_count_trigger
  after insert or update on public.enrollments
  for each row execute function update_batch_student_count();

create index idx_enrollments_student on public.enrollments(student_id);
create index idx_enrollments_batch on public.enrollments(batch_id);
create index idx_enrollments_status on public.enrollments(status);


-- ━━━ BLOCK 6: Subjects Table ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create table public.subjects (
  id uuid default uuid_generate_v4() primary key,
  batch_id uuid not null references public.batches(id) on delete cascade,
  name text not null,
  abbreviation text not null,
  description text,
  color text default '#5c35d9',
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

create index idx_subjects_batch on public.subjects(batch_id);


-- ━━━ BLOCK 7: Chapters Table ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create table public.chapters (
  id uuid default uuid_generate_v4() primary key,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  batch_id uuid not null references public.batches(id) on delete cascade,
  chapter_number text not null,
  title text not null,
  description text,
  sort_order integer default 0,
  is_active boolean default true,
  total_lectures integer default 0,
  total_notes integer default 0,
  total_dpps integer default 0,
  created_at timestamptz default now()
);

create index idx_chapters_subject on public.chapters(subject_id);
create index idx_chapters_batch on public.chapters(batch_id);


-- ━━━ BLOCK 8: Lectures Table ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create table public.lectures (
  id uuid default uuid_generate_v4() primary key,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  batch_id uuid not null references public.batches(id) on delete cascade,
  teacher_id uuid references public.profiles(id),
  title text not null,
  description text,
  cloudflare_video_id text,
  cloudflare_playback_url text,
  cloudflare_thumbnail_url text,
  duration_seconds integer default 0,
  duration_label text,
  lecture_type text default 'recorded' check (lecture_type in ('recorded','live_recording')),
  sort_order integer default 0,
  is_active boolean default true,
  is_free_preview boolean default false,
  total_views integer default 0,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger lectures_updated_at
  before update on public.lectures
  for each row execute function update_updated_at();

create index idx_lectures_chapter on public.lectures(chapter_id);
create index idx_lectures_batch on public.lectures(batch_id);
create index idx_lectures_active on public.lectures(is_active);


-- ━━━ BLOCK 9: Live Classes Table ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create table public.live_classes (
  id uuid default uuid_generate_v4() primary key,
  batch_id uuid not null references public.batches(id) on delete cascade,
  subject_id uuid references public.subjects(id),
  chapter_id uuid references public.chapters(id),
  teacher_id uuid not null references public.profiles(id),
  title text not null,
  description text,
  scheduled_at timestamptz not null,
  duration_minutes integer default 60,
  hms_room_id text,
  hms_room_code_teacher text,
  hms_room_code_student text,
  status text default 'scheduled' check (status in ('scheduled','live','completed','cancelled')),
  recording_cloudflare_id text,
  recording_url text,
  is_recording_available boolean default false,
  total_attendees integer default 0,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger live_classes_updated_at
  before update on public.live_classes
  for each row execute function update_updated_at();

create index idx_live_classes_batch on public.live_classes(batch_id);
create index idx_live_classes_scheduled on public.live_classes(scheduled_at);
create index idx_live_classes_status on public.live_classes(status);


-- ━━━ BLOCK 10: Study Materials Table ━━━━━━━━━━━━━━━━━━━━━━━━━━
create table public.study_materials (
  id uuid default uuid_generate_v4() primary key,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  batch_id uuid not null references public.batches(id) on delete cascade,
  lecture_id uuid references public.lectures(id),
  teacher_id uuid references public.profiles(id),
  title text not null,
  description text,
  file_url text not null,
  file_name text,
  file_size_bytes bigint,
  file_type text default 'pdf' check (file_type in ('pdf','doc','image','zip')),
  material_type text not null default 'notes' check (material_type in ('notes','dpp','dpp_solutions','reference','assignment','test_paper')),
  sort_order integer default 0,
  is_active boolean default true,
  is_downloadable boolean default true,
  total_downloads integer default 0,
  total_views integer default 0,
  published_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_materials_chapter on public.study_materials(chapter_id);
create index idx_materials_batch on public.study_materials(batch_id);
create index idx_materials_type on public.study_materials(material_type);


-- ━━━ BLOCK 11: Lecture Progress Table ━━━━━━━━━━━━━━━━━━━━━━━━━
create table public.lecture_progress (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid not null references public.profiles(id) on delete cascade,
  lecture_id uuid not null references public.lectures(id) on delete cascade,
  batch_id uuid not null references public.batches(id),
  watched_seconds integer default 0,
  total_seconds integer default 0,
  completion_percent integer default 0,
  is_completed boolean default false,
  last_position_seconds integer default 0,
  first_watched_at timestamptz default now(),
  last_watched_at timestamptz default now(),
  completed_at timestamptz,
  unique(student_id, lecture_id)
);

create or replace function update_enrollment_completion()
returns trigger as $$
declare
  v_total_lectures integer;
  v_completed_lectures integer;
  v_completion_percent integer;
begin
  select count(*) into v_total_lectures
  from public.lectures where batch_id = new.batch_id and is_active = true;

  select count(*) into v_completed_lectures
  from public.lecture_progress lp
  join public.lectures l on l.id = lp.lecture_id
  where lp.student_id = new.student_id
    and l.batch_id = new.batch_id
    and lp.is_completed = true;

  if v_total_lectures > 0 then
    v_completion_percent := (v_completed_lectures * 100) / v_total_lectures;
  else
    v_completion_percent := 0;
  end if;

  update public.enrollments
  set completion_percent = v_completion_percent, last_accessed_at = now()
  where student_id = new.student_id and batch_id = new.batch_id;

  return new;
end;
$$ language plpgsql;

create trigger lecture_progress_trigger
  after insert or update on public.lecture_progress
  for each row execute function update_enrollment_completion();

create index idx_progress_student on public.lecture_progress(student_id);
create index idx_progress_lecture on public.lecture_progress(lecture_id);


-- ━━━ BLOCK 12: Doubts Table ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create table public.doubts (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid not null references public.profiles(id) on delete cascade,
  lecture_id uuid references public.lectures(id),
  batch_id uuid not null references public.batches(id),
  subject_id uuid references public.subjects(id),
  question text not null,
  question_image_url text,
  answer text,
  answer_by uuid references public.profiles(id),
  answered_at timestamptz,
  status text default 'pending' check (status in ('pending','answered','closed')),
  asked_at timestamptz default now(),
  created_at timestamptz default now()
);

create index idx_doubts_student on public.doubts(student_id);
create index idx_doubts_batch on public.doubts(batch_id);
create index idx_doubts_status on public.doubts(status);


-- ━━━ BLOCK 13: Bookmarks Table ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create table public.bookmarks (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid not null references public.profiles(id) on delete cascade,
  lecture_id uuid references public.lectures(id),
  material_id uuid references public.study_materials(id),
  bookmark_type text not null check (bookmark_type in ('lecture','material')),
  created_at timestamptz default now(),
  unique(student_id, lecture_id),
  unique(student_id, material_id)
);

create index idx_bookmarks_student on public.bookmarks(student_id);


-- ━━━ BLOCK 14: Payments Table ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid not null references public.profiles(id) on delete cascade,
  batch_id uuid not null references public.batches(id),
  enrollment_id uuid references public.enrollments(id),
  razorpay_order_id text unique not null,
  razorpay_payment_id text unique,
  razorpay_signature text,
  amount numeric(10,2) not null,
  original_amount numeric(10,2),
  discount_type text default 'none',
  discount_amount numeric(10,2) default 0,
  currency text default 'INR',
  status text not null default 'pending' check (status in ('pending','success','failed','refunded','partially_refunded')),
  payment_method text,
  failure_reason text,
  notes jsonb default '{}',
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger payments_updated_at
  before update on public.payments
  for each row execute function update_updated_at();

create index idx_payments_student on public.payments(student_id);
create index idx_payments_status on public.payments(status);


-- ━━━ BLOCK 15: Notifications Table ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text default 'info' check (type in ('info','success','warning','live_class','new_lecture','payment')),
  action_url text,
  is_read boolean default false,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index idx_notifications_user on public.notifications(user_id);
create index idx_notifications_read on public.notifications(is_read);
