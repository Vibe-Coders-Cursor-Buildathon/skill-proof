-- Allow audio as a course source type
alter table public.courses
  drop constraint if exists courses_source_type_check;

alter table public.courses
  add constraint courses_source_type_check
  check (source_type in ('youtube', 'pdf', 'article', 'audio'));
