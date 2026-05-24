-- Prevent duplicate active subjects/chapters created by repeated upload attempts.
-- Run after existing duplicate rows have been deactivated.

create unique index if not exists idx_subjects_batch_name_active_unique
on public.subjects (batch_id, lower(btrim(name)))
where is_active = true;

create unique index if not exists idx_chapters_subject_title_active_unique
on public.chapters (
  batch_id,
  subject_id,
  lower(regexp_replace(btrim(title), '\s+', '', 'g'))
)
where is_active = true;
