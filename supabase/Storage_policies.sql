-- ============================================================================
-- STORAGE POLICIES UNTUK UPLOAD GAMBAR MOTOR
-- Bucket: motorcycle-images (public)
-- Jalankan di Supabase Dashboard -> SQL Editor
-- ============================================================================

-- Pastikan bucket sudah dibuat (bisa via Dashboard > Storage > New bucket)
-- Nama bucket: motorcycle-images
-- Public bucket: ON

-- Hapus policy lama jika ada
DROP POLICY IF EXISTS "Public read motorcycle images" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload motorcycle images" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete motorcycle images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload motorcycle images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update motorcycle images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete motorcycle images" ON storage.objects;
DROP POLICY IF EXISTS "Public read motorcycles" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload motorcycles" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update motorcycles" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete motorcycles" ON storage.objects;

-- Siapa saja bisa melihat gambar (public)
CREATE POLICY "Public read motorcycle images"
ON storage.objects FOR SELECT
USING (bucket_id = 'motorcycle-images');

-- Cuma user terautentikasi yang bisa upload
CREATE POLICY "Admin upload motorcycle images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'motorcycle-images');

-- Cuma user terautentikasi yang bisa hapus
CREATE POLICY "Admin delete motorcycle images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'motorcycle-images');
