-- ============================================================================
-- SETUP ADD-ONS (jalankan di Supabase Dashboard -> SQL Editor)
-- Idempotent sebisa mungkin. Jalankan sekali untuk project ini.
-- ============================================================================

-- 1) Tabel add-ons
create table if not exists public.addons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null check (price >= 0),
  price_type text not null default 'per_day' check (price_type in ('per_day', 'flat')),
  stock integer check (stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Tabel relasi booking <-> add-on
create table if not exists public.booking_addons (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  addon_id uuid not null references public.addons(id),
  quantity integer not null default 1 check (quantity > 0),
  price_snapshot numeric not null,
  price_type_snapshot text not null,
  subtotal numeric not null,
  created_at timestamptz not null default now()
);

-- 3) Kolom total add-on pada bookings
alter table public.bookings
  add column if not exists addons_total numeric not null default 0;

-- 4) RLS
alter table public.addons enable row level security;
alter table public.booking_addons enable row level security;

-- 5) Grant akses ke role authenticated (admin dashboard)
grant usage on schema public to authenticated;
grant all on table public.addons to authenticated;
grant all on table public.booking_addons to authenticated;

-- 6) Policy untuk admin terautentikasi
drop policy if exists dashboard_full_authenticated_addons on public.addons;
create policy dashboard_full_authenticated_addons
  on public.addons for all to authenticated
  using (true) with check (true);

drop policy if exists dashboard_full_authenticated_booking_addons on public.booking_addons;
create policy dashboard_full_authenticated_booking_addons
  on public.booking_addons for all to authenticated
  using (true) with check (true);

-- 7) (Opsional) trigger updated_at sederhana jika fungsi ada; jika tidak, abaikan.
-- Pastikan kolom updated_at diupdate oleh app/API jika diperlukan.

-- 8) Verifikasi
select tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('addons', 'booking_addons')
order by tablename;
