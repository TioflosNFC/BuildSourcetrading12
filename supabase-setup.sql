-- ===========================================================
-- BUILD SOURCE — Supabase setup
-- Run this once in Supabase: Project → SQL Editor → New query
-- ===========================================================

-- 1. PRODUCTS TABLE
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price text,
  category text,
  image_url text,
  created_at timestamptz not null default now()
);

-- 2. PROJECTS TABLE (gallery)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  note text,
  image_url text,
  created_at timestamptz not null default now()
);

-- 3. ENABLE ROW LEVEL SECURITY
alter table public.products enable row level security;
alter table public.projects enable row level security;

-- 4. PUBLIC READ ACCESS (anyone visiting the website can view)
create policy "Public can view products"
  on public.products for select
  using (true);

create policy "Public can view projects"
  on public.projects for select
  using (true);

-- 5. LOGGED-IN ADMIN CAN INSERT / UPDATE / DELETE
-- (Anyone who successfully logs in via Supabase Auth on /admin.html
--  counts as authenticated. Create that admin user in:
--  Authentication → Users → Add user)
create policy "Authenticated users can insert products"
  on public.products for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update products"
  on public.products for update
  to authenticated
  using (true);

create policy "Authenticated users can delete products"
  on public.products for delete
  to authenticated
  using (true);

create policy "Authenticated users can insert projects"
  on public.projects for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update projects"
  on public.projects for update
  to authenticated
  using (true);

create policy "Authenticated users can delete projects"
  on public.projects for delete
  to authenticated
  using (true);
