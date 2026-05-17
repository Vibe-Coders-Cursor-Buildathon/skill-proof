-- Course publish approval: users request; admins approve before public catalog

alter table courses
  add column if not exists publish_status text not null default 'draft'
    check (publish_status in ('draft', 'pending', 'approved', 'rejected')),
  add column if not exists publish_requested_at timestamptz,
  add column if not exists publish_reviewed_at timestamptz,
  add column if not exists publish_rejection_reason text;

-- Backfill from legacy is_published flag
update courses
set publish_status = 'approved'
where is_published = true
  and (publish_status is null or publish_status = 'draft');

create index if not exists courses_publish_status_pending_idx
  on courses (publish_status)
  where publish_status = 'pending';

comment on column courses.publish_status is
  'draft: not submitted; pending: awaiting admin; approved: live on catalog; rejected: denied';
