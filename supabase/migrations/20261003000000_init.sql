-- ============================================================================
-- AURELIA LAB — initial schema
-- Tables + Row Level Security for the storefront backend.
-- Apply with:  supabase db push   (or paste into the Supabase SQL editor)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Profiles (optional, for future personalisation)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by the owner"
  on public.profiles for select using (auth.uid() = id);
create policy "Profiles are insertable by the owner"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Profiles are updatable by the owner"
  on public.profiles for update using (auth.uid() = id);
create policy "Profiles are deletable by the owner"
  on public.profiles for delete using (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- Carts — one row per signed-in user, JSON list of { id, qty }
-- ----------------------------------------------------------------------------
create table if not exists public.carts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.carts enable row level security;

create policy "Carts are viewable by the owner"
  on public.carts for select using (auth.uid() = user_id);
create policy "Carts are insertable by the owner"
  on public.carts for insert with check (auth.uid() = user_id);
create policy "Carts are updatable by the owner"
  on public.carts for update using (auth.uid() = user_id);
create policy "Carts are deletable by the owner"
  on public.carts for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Orders — written by the edge functions with the service role.
-- Users can only read their own rows; they cannot insert directly.
-- ----------------------------------------------------------------------------
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  name text,
  phone text,
  items jsonb not null default '[]'::jsonb,
  subtotal integer not null default 0,
  shipping integer not null default 0,
  total integer not null default 0,
  currency text not null default 'INR',
  status text not null default 'pending', -- pending | created | paid | failed
  mode text not null default 'manual',    -- manual | razorpay
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists orders_razorpay_idx on public.orders (razorpay_order_id);

alter table public.orders enable row level security;

create policy "Orders are viewable by the owner"
  on public.orders for select
  using (user_id is not null and auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Contact messages — public submissions
-- ----------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  subject text,
  skin_concern text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "Anyone can send a contact message"
  on public.contact_messages for insert
  with check (true);

-- ----------------------------------------------------------------------------
-- Newsletter subscribers
-- ----------------------------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

create policy "Anyone can subscribe to the newsletter"
  on public.newsletter_subscribers for insert
  with check (true);

-- ----------------------------------------------------------------------------
-- Quiz results — one per signed-in user
-- ----------------------------------------------------------------------------
create table if not exists public.quiz_results (
  user_id uuid primary key references auth.users(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  skin_type text,
  concerns text[] not null default '{}',
  recommended text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.quiz_results enable row level security;

create policy "Quiz results are viewable by the owner"
  on public.quiz_results for select using (auth.uid() = user_id);
create policy "Quiz results are insertable by the owner"
  on public.quiz_results for insert with check (auth.uid() = user_id);
create policy "Quiz results are updatable by the owner"
  on public.quiz_results for update using (auth.uid() = user_id);
create policy "Quiz results are deletable by the owner"
  on public.quiz_results for delete using (auth.uid() = user_id);