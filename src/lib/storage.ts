import { supabase } from "./supabase";

const BUCKET = "motorcycle-images";

export async function uploadMotorcycleImage(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function ensureMotorcycleImagesBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (!exists) {
    try {
      await supabase.storage.createBucket(BUCKET, {
        public: true,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif"],
        fileSizeLimit: 5242880, // 5MB
      });
    } catch (e) {
      // Ignore if cannot create (needs service role)
    }
  }
}
