-- Align plans table with pricing UI (Free / Individual / Business / Enterprise)

-- Rename legacy slugs to match pricing cards
update plans set slug = 'free' where slug = 'basic';
update plans set slug = 'individual' where slug = 'professional';
update plans set slug = 'business' where slug = 'premium';

-- Free
update plans
set
  name = 'Free',
  included_credits_monthly = 3,
  sort_order = 1,
  features = '{
    "can_purchase_credits": true,
    "can_purchase_plans": true,
    "can_edit_course": false,
    "can_publish_course": false,
    "can_add_university_stamp": false,
    "can_share_public_link": true,
    "can_issue_certificate": false,
    "max_published_courses": 0
  }'::jsonb
where slug = 'free';

-- Individual
update plans
set
  name = 'Individual',
  included_credits_monthly = 20,
  sort_order = 2,
  features = '{
    "can_purchase_credits": true,
    "can_purchase_plans": true,
    "can_edit_course": true,
    "can_publish_course": false,
    "can_add_university_stamp": false,
    "can_share_public_link": true,
    "can_issue_certificate": true,
    "max_published_courses": 0
  }'::jsonb
where slug = 'individual';

-- Business
update plans
set
  name = 'Business',
  included_credits_monthly = 40,
  sort_order = 3,
  features = '{
    "can_purchase_credits": true,
    "can_purchase_plans": true,
    "can_edit_course": true,
    "can_publish_course": true,
    "can_add_university_stamp": true,
    "can_share_public_link": true,
    "can_issue_certificate": true,
    "max_published_courses": 4
  }'::jsonb
where slug = 'business';

-- Enterprise
update plans
set
  name = 'Enterprise',
  included_credits_monthly = 100,
  sort_order = 4,
  features = '{
    "can_purchase_credits": true,
    "can_purchase_plans": true,
    "can_edit_course": true,
    "can_publish_course": true,
    "can_add_university_stamp": true,
    "can_share_public_link": true,
    "can_issue_certificate": true,
    "max_published_courses": 10
  }'::jsonb
where slug = 'enterprise';

-- Signup: assign free plan (not basic)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan_id uuid;
  v_monthly_credits int;
  v_display_name text;
begin
  select id, included_credits_monthly
  into v_plan_id, v_monthly_credits
  from plans
  where slug = 'free' and is_active = true
  limit 1;

  if v_plan_id is null then
    raise exception 'free plan not found';
  end if;

  v_display_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    split_part(new.email, '@', 1)
  );

  insert into profiles (id, plan_id, display_name, plan_renews_at)
  values (
    new.id,
    v_plan_id,
    v_display_name,
    now() + interval '1 month'
  );

  if v_monthly_credits > 0 then
    perform public.grant_credits(
      new.id,
      v_monthly_credits,
      'plan_grant',
      null,
      jsonb_build_object('plan_slug', 'free', 'trigger', 'signup')
    );
  end if;

  return new;
end;
$$;

-- Numeric plan limit helper (publish caps)
create or replace function public.user_plan_limit(limit_key text)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((p.features ->> limit_key)::int, 0)
  from profiles pr
  join plans p on p.id = pr.plan_id
  where pr.id = auth.uid();
$$;

grant execute on function public.user_plan_limit(text) to authenticated, anon;
