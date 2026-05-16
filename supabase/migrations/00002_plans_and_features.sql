-- Plans catalog with JSONB feature flags (easy to modify without schema changes)
create table plans (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  features jsonb not null default '{}'::jsonb,
  included_credits_monthly int not null default 0,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into plans (slug, name, features, included_credits_monthly, sort_order) values
(
  'basic',
  'Basic',
  '{
    "can_purchase_credits": true,
    "can_purchase_plans": true,
    "can_edit_course": false,
    "can_publish_course": false,
    "can_add_university_stamp": false,
    "can_share_public_link": true
  }'::jsonb,
  3,
  1
),
(
  'professional',
  'Professional',
  '{
    "can_purchase_credits": true,
    "can_purchase_plans": true,
    "can_edit_course": true,
    "can_publish_course": true,
    "can_add_university_stamp": false,
    "can_share_public_link": true
  }'::jsonb,
  15,
  2
),
(
  'premium',
  'Premium',
  '{
    "can_purchase_credits": true,
    "can_purchase_plans": true,
    "can_edit_course": true,
    "can_publish_course": true,
    "can_add_university_stamp": false,
    "can_share_public_link": true
  }'::jsonb,
  50,
  3
),
(
  'enterprise',
  'Enterprise',
  '{
    "can_purchase_credits": true,
    "can_purchase_plans": true,
    "can_edit_course": true,
    "can_publish_course": true,
    "can_add_university_stamp": true,
    "can_share_public_link": true
  }'::jsonb,
  200,
  4
);
