-- Course publish approval: users request; admins approve before public catalog

alter table courses
  add column publish_status text not null default 'draft'
    check (publish_status in ('draft', 'pending', 'approved', 'rejected')),
  add column publish_requested_at timestamptz,
  add column publish_reviewed_at timestamptz,
  add column publish_rejection_reason text;

-- Backfill from legacy is_published flag
update courses
set publish_status = 'approved'
where is_published = true;

create index courses_publish_status_pending_idx
  on courses (publish_status)
  where publish_status = 'pending';

comment on column courses.publish_status is
  'draft: not submitted; pending: awaiting admin; approved: live on catalog; rejected: denied';
