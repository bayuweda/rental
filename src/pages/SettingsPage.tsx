import { useEffect, useState } from "react";
import {
  Bike,
  CheckCircle2,
  LogOut,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthProvider";
import { supabase } from "../lib/supabase";
import { APP_VERSION } from "../lib/constants";
import { paths } from "../routes/paths";
import { PageHeader } from "../components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Spinner } from "../components/ui/spinner";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}

export function SettingsPage() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const [connection, setConnection] = useState<
    "checking" | "connected" | "error"
  >("checking");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { error } = await supabase
          .from("motorcycles")
          .select("id", { count: "exact", head: true })
          .limit(1);
        if (mounted) setConnection(error ? "error" : "connected");
      } catch {
        if (mounted) setConnection("error");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate(paths.login, { replace: true });
  };

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Pengaturan"
        description="Informasi project, koneksi Supabase, dan akun admin."
      />

      <Card>
        <CardHeader>
          <CardTitle>Status Koneksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {connection === "checking" ? (
              <>
                <Spinner />
                <span className="text-sm text-slate-500">Memeriksa koneksi...</span>
              </>
            ) : connection === "connected" ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="text-sm text-slate-700">
                  Terhubung ke Supabase. Akses baca tabel motor berhasil.
                </span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm text-red-700">
                  Tidak dapat terhubung ke Supabase. Periksa kredensial di `.env.local` dan konfigurasi RLS.
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Akun Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <InfoRow label="Email" value={user?.email ?? "-"} />
          <InfoRow
            label="UID"
            value={
              user?.id ? (
                <span className="font-mono text-xs">{user.id.slice(0, 12)}…</span>
              ) : (
                "-"
              )
            }
          />
          <InfoRow label="Terdaftar" value={user?.created_at ?? "-"} />
          <div className="mt-3">
            <Button variant="outline" onClick={handleLogout} disabled={loading}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Informasi Project</CardTitle>
        </CardHeader>
        <CardContent>
          <InfoRow
            label="Aplikasi"
            value={<span className="flex items-center justify-end gap-1.5"><Bike className="h-3.5 w-3.5" /> Rental Motor Admin</span>}
          />
          <InfoRow label="Versi" value={APP_VERSION} />
          <InfoRow label="Framework" value="React + Vite + TypeScript + Tailwind CSS" />
          <InfoRow label="Data Source" value="Supabase PostgreSQL" />
          <InfoRow label="Integrasi" value="Chatbot n8n (database yang sama)" />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Catatan Keamanan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            Dashboard menggunakan Supabase Auth email/password. Data diakses melalui
            anon key dengan konfigurasi Row Level Security (RLS). Key rahasia dan
            service role tidak pernah disimpan di frontend.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}