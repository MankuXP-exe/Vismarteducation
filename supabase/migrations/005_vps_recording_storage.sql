alter table public.lectures
  add column if not exists video_url text,
  add column if not exists video_path text,
  add column if not exists thumbnail_url text,
  add column if not exists file_size_mb numeric(10,2);

alter table public.live_classes
  add column if not exists recording_path text,
  add column if not exists recording_file_size_mb numeric(10,2),
  add column if not exists thumbnail_url text;

alter table public.study_materials
  add column if not exists file_path text;

create or replace function increment_chapter_lectures(
  chapter_id_param uuid
)
returns void as $$
begin
  update public.chapters
  set total_lectures = total_lectures + 1
  where id = chapter_id_param;
end;
$$ language plpgsql;
