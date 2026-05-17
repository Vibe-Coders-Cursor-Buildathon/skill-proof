-- Certificates for published courses (Business publishers + learners)

alter table profiles
  add column if not exists certificate_logo_url text,
  add column if not exists certificate_brand_name text;

comment on column profiles.certificate_logo_url is
  'Public URL to org logo shown on certificates (Business plan)';
comment on column profiles.certificate_brand_name is
  'Organization name on certificates when publisher is Business';

alter table courses
  add column if not exists certificates_enabled boolean not null default false;

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_number text not null unique,
  user_id uuid not null references profiles (id) on delete cascade,
  course_id uuid not null references courses (id) on delete cascade,
  learner_name text not null,
  course_title text not null,
  quiz_score_percent int not null check (quiz_score_percent >= 0 and quiz_score_percent <= 100),
  publisher_user_id uuid references profiles (id) on delete set null,
  publisher_brand_name text,
  publisher_logo_url text,
  platform_name text not null default 'SkillProof',
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create index if not exists certificates_user_id_idx on certificates (user_id);
create index if not exists certificates_course_id_idx on certificates (course_id);

alter table certificates enable row level security;

create policy "Users can view own certificates"
  on certificates for select
  using (auth.uid() = user_id);

create policy "Course owners can view certificates for their courses"
  on certificates for select
  using (
    exists (
      select 1 from courses c
      where c.id = certificates.course_id
        and c.user_id = auth.uid()
    )
  );

create policy "Published course certificates are viewable by number lookup"
  on certificates for select
  using (
    exists (
      select 1 from courses c
      where c.id = certificates.course_id
        and c.is_published = true
    )
  );
