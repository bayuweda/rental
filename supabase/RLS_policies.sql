-- ============================================================================
-- RLS & AKSES UNTUK ADMIN DASHBOARD
-- Project: octtnvdebrupssxjtzxn.supabase.co
-- KONTEKS: chatbot n8n memakai SERVICE ROLE KEY, sehingga:
--   - TIDAK perlu policy baca publik (anon) -> akses publik tetap tertutup.
--   - Hanya user terautentikasi (admin dashboard) yang mendapat akses.
-- Jalankan di Supabase Dashboard -> SQL Editor -> New query.
-- Aman untuk dijalankan ulang (idempotent).
-- ============================================================================

-- 1) AKTIFKAN ROW LEVEL SECURITY pada tabel yang dipakai dashboard.
ALTER TABLE IF EXISTS public.motorcycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bookings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.faq         ENABLE ROW LEVEL SECURITY;

-- 2) POLICY UNTUK USER TERAUTENTIKASI (admin setelah login).
--    Role anon/eksternal tanpa login: TIDAK bisa apa-apa.
DO $$
DECLARE
  t text;
  p text;
BEGIN
  FOREACH t IN ARRAY ARRAY['motorcycles','customers','bookings','faq']
  LOOP
    p := 'dashboard_full_authenticated_' || t;
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', p, t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true);',
      p, t
    );
  END LOOP;
END $$;

-- 3) VERIFIKASI: tampilkan semua policy pada tabel terkait.
SELECT tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('motorcycles','customers','bookings','faq')
ORDER BY tablename;