-- Helper: check if current user has a plan feature
create or replace function public.user_has_feature(feature_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (p.features ->> feature_key)::boolean,
    false
  )
  from profiles pr
  join plans p on p.id = pr.plan_id
  where pr.id = auth.uid();
$$;

-- plans: readable by everyone (pricing page)
alter table plans enable row level security;

create policy "Plans are viewable by everyone"
  on plans for select
  using (is_active = true);

-- profiles
alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- credit_transactions: read own history only
alter table credit_transactions enable row level security;

create policy "Users can view own credit transactions"
  on credit_transactions for select
  using (auth.uid() = user_id);

-- credit_packs: public catalog
alter table credit_packs enable row level security;

create policy "Credit packs are viewable by everyone"
  on credit_packs for select
  using (is_active = true);

-- courses
alter table courses enable row level security;

create policy "Published courses are publicly readable"
  on courses for select
  using (is_published = true);

create policy "Owners can view own courses"
  on courses for select
  using (auth.uid() = user_id);

create policy "Authenticated users can create courses"
  on courses for insert
  with check (auth.uid() = user_id);

create policy "Owners can update own courses"
  on courses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Owners can delete own courses"
  on courses for delete
  using (auth.uid() = user_id);

-- Authenticated users may only spend their own credits (enforced inside spend_credits)
grant execute on function public.spend_credits(uuid, int, text, uuid, jsonb) to authenticated;
grant execute on function public.spend_credit(uuid, text, uuid, jsonb) to authenticated;
grant execute on function public.user_has_feature(text) to authenticated, anon;
