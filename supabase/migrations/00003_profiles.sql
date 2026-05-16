create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  plan_id uuid not null references plans (id),
  credits_balance int not null default 0 check (credits_balance >= 0),
  display_name text,
  organization_name text,
  plan_renews_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_plan_id_idx on profiles (plan_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row
  execute function public.set_updated_at();
