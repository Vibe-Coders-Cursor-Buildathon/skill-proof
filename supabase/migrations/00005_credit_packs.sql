create table credit_packs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  credits int not null check (credits > 0),
  price_cents int not null check (price_cents >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into credit_packs (slug, name, credits, price_cents) values
  ('pack-10', '10 Credits', 10, 999),
  ('pack-50', '50 Credits', 50, 3999),
  ('pack-100', '100 Credits', 100, 6999);
