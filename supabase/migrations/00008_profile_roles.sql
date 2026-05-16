-- Profile roles: customer (default) and admin
create type profile_role as enum ('customer', 'admin');

alter table profiles
  add column role profile_role not null default 'customer';

create index profiles_role_idx on profiles (role) where role = 'admin';

-- Helper: whether the current session user is an admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated, anon;

-- Set absolute credits balance (admin panel); records ledger delta
create or replace function public.admin_set_credits(
  p_user_id uuid,
  p_balance int
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current int;
  v_delta int;
begin
  if p_balance < 0 then
    raise exception 'balance must be non-negative';
  end if;

  select credits_balance into v_current
  from profiles
  where id = p_user_id
  for update;

  if not found then
    raise exception 'profile not found';
  end if;

  v_delta := p_balance - v_current;

  update profiles
  set credits_balance = p_balance
  where id = p_user_id;

  if v_delta <> 0 then
    insert into credit_transactions (user_id, amount, balance_after, reason, metadata)
    values (
      p_user_id,
      v_delta,
      p_balance,
      'admin_adjustment',
      jsonb_build_object('previous_balance', v_current)
    );
  end if;

  return p_balance;
end;
$$;

-- Admin RLS policies
create policy "Admins can view all profiles"
  on profiles for select
  using (public.is_admin());

create policy "Admins can update all profiles"
  on profiles for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can view all courses"
  on courses for select
  using (public.is_admin());

create policy "Admins can update all courses"
  on courses for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can view all credit transactions"
  on credit_transactions for select
  using (public.is_admin());
