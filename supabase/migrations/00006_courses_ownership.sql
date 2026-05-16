alter table courses
  add column user_id uuid references profiles (id) on delete set null,
  add column is_published boolean not null default false,
  add column published_at timestamptz,
  add column content_edited jsonb,
  add column university_stamp jsonb;

create index courses_user_id_idx on courses (user_id);
create index courses_is_published_idx on courses (is_published) where is_published = true;
