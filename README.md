# Rental Motor — Admin Dashboard

Admin dashboard untuk bisnis rental motor, terhubung ke **Supabase** sebagai sumber data yang sama dengan chatbot AI (n8n).

## Fitur

- Autentikasi admin via Supabase Auth (email/password)
- Ringkasan bisnis: statistik, grafik, booking terbaru, status motor
- Manajemen motor: CRUD, search, filter, sort, proteksi hapus
- Manajemen customer: CRUD, deteksi duplikat Chat ID/WhatsApp, riwayat booking
- Manajemen booking: CRUD, deteksi bentrok tanggal, hitung harga otomatis, ubah status
- Kalender rental bulanan dengan warna status & deteksi konflik
- FAQ untuk chatbot (aktif/nonaktif, kategori)
- Halaman pengaturan & status koneksi

## Teknologi

React · Vite · TypeScript · Tailwind CSS v4 · TanStack Query · React Hook Form · Zod · Recharts · date-fns · Lucide · Supabase

## Menjalankan

```bash
npm install
npm run dev
```

## Konfigurasi

Salin `.env.example` menjadi `.env.local` dan isi kredensial dari Supabase Dashboard → Project Settings → API:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Gunakan hanya anon key di frontend. Service role key tidak boleh masuk ke frontend.

Sebelum dipakai, jalankan `supabase/RLS_policies.sql` di SQL Editor agar user terautentikasi dapat mengakses tabel `motorcycles`, `customers`, `bookings`, dan `faq`.