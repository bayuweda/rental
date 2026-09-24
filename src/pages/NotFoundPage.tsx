import { Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";
import { paths } from "../routes/paths";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-4">
      <FileQuestion className="h-10 w-10 text-slate-400" />
      <p className="text-lg font-semibold text-slate-900">
        Halaman tidak ditemukan
      </p>
      <p className="text-sm text-slate-500">
        URL yang Anda akses tidak tersedia.
      </p>
      <Link
        to={paths.dashboard}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}