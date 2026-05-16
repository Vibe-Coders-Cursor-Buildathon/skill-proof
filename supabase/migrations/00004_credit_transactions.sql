create table credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  amount int not null,
  balance_after int not null,
  reason text not null,
  reference_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index credit_transactions_user_id_idx on credit_transactions (user_id);
create index credit_transactions_created_at_idx on credit_transactions (created_at desc);

-- Grant credits (plan signup, purchase, admin)
create or replace function public.grant_credits(
  p_user_id uuid,
  p_amount int,
  p_reason text,
  p_reference_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_balance int;
begin
  if p_amount <= 0 then
    raise exception 'grant amount must be positive';
  end if;

  update profiles
  set credits_balance = credits_balance + p_amount
  where id = p_user_id
  returning credits_balance into v_new_balance;

  if not found then
    raise exception 'profile not found';
  end if;

  insert into credit_transactions (user_id, amount, balance_after, reason, reference_id, metadata)
  values (p_user_id, p_amount, v_new_balance, p_reason, p_reference_id, p_metadata);

  return v_new_balance;
end;
$$;

-- Spend one or more credits (course generation)
create or replace function public.spend_credits(
  p_user_id uuid,
  p_amount int default 1,
  p_reason text default 'course_generation',
  p_reference_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_balance int;
  v_current int;
begin
  if p_amount <= 0 then
    raise exception 'spend amount must be positive';
  end if;

  if auth.uid() is distinct from p_user_id then
    raise exception 'unauthorized';
  end if;

  select credits_balance into v_current
  from profiles
  where id = p_user_id
  for update;

  if not found then
    raise exception 'profile not found';
  end if;

  if v_current < p_amount then
    raise exception 'insufficient_credits';
  end if;

  update profiles
  set credits_balance = credits_balance - p_amount
  where id = p_user_id
  returning credits_balance into v_new_balance;

  insert into credit_transactions (user_id, amount, balance_after, reason, reference_id, metadata)
  values (p_user_id, -p_amount, v_new_balance, p_reason, p_reference_id, p_metadata);

  return v_new_balance;
end;
$$;

-- Alias for single credit spend
create or replace function public.spend_credit(
  p_user_id uuid,
  p_reason text default 'course_generation',
  p_reference_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns int
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.spend_credits(p_user_id, 1, p_reason, p_reference_id, p_metadata);
end;
$$;

-- Create profile + grant initial plan credits on signup
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
  where slug = 'basic' and is_active = true
  limit 1;

  if v_plan_id is null then
    raise exception 'basic plan not found';
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
      jsonb_build_object('plan_slug', 'basic', 'trigger', 'signup')
    );
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
