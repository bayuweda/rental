import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { uploadMotorcycleImage } from "../../lib/storage";
import { handleStorageError } from "../../lib/error-handler";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const url = await uploadMotorcycleImage(file);
      onChange(url);
    } catch (err: any) {
      setError(handleStorageError(err));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (value) {
    return (
      <div className="space-y-2">
        <div className="relative overflow-hidden rounded-lg border border-slate-200">
          <img
            src={value}
            alt="Preview"
            className="h-40 w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute right-2 top-2 bg-white/90"
            onClick={() => onChange(null)}
            disabled={disabled || uploading}
          >
            <X className="h-3 w-3" />
            Hapus
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 p-6 transition hover:border-slate-400 ${
          disabled || uploading ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || uploading}
        />
        {uploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            <p className="text-sm text-slate-500">Mengupload...</p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-slate-400" />
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700">
                Klik untuk upload gambar
              </p>
              <p className="text-xs text-slate-500">JPG, PNG, WebP, GIF (max 5MB)</p>
            </div>
          </>
        )}
      </label>
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-2">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      ) : null}
    </div>
  );
}
