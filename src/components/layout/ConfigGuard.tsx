import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { isSupabaseConfigured, missingEnvVars } from "../../lib/supabase";

export function ConfigGuard({ children }: { children: ReactNode }) {
  if (isSupabaseConfigured) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-amber-300 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-5 w-5 text-amber-700" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Konfigurasi Supabase belum lengkap
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Aplikasi membutuhkan Supabase URL dan anon key agar dapat
              mengakses data rental motor.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm">
          <p className="mb-1 font-medium text-slate-700">
            Variabel yang belum terisi:
          </p>
          <ul className="list-inside list-disc text-slate-600">
            {missingEnvVars.map((v) => (
              <li key={v} className="font-mono text-xs">
                {v}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <p>
            1. Salin file <code className="rounded bg-slate-100 px-1">.env.example</code>{" "}
            menjadi <code className="rounded bg-slate-100 px-1">.env.local</code> di
            root project.
          </p>
          <p>
            2. Isi nilai dari Supabase Dashboard → Project Settings → API:
            <span className="mt-1 block font-mono text-xs text-slate-700">
              VITE_SUPABASE_URL=https://xxxx.supabase.co
              <br />
              VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
            </span>
          </p>
          <p>3. Restart server dev (npm run dev).</p>
          <p className="text-xs text-slate-400">
            Gunakan hanya anon key (bukan service role key) di frontend.
          </p>
        </div>
      </div>
    </div>
  );
}