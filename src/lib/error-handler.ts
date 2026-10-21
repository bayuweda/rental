export function handleStorageError(error: any): string {
  const message = error?.message || String(error);
  
  if (message.includes("row-level security") || message.includes("policy")) {
    return "Storage policy belum dikonfigurasi. Pastikan bucket 'motorcycle-images' sudah dibuat dan policy di SQL Editor sudah dijalankan.";
  }
  if (message.includes("bucket") && message.includes("not found")) {
    return "Bucket 'motorcycle-images' tidak ditemukan. Buat bucket 'motorcycle-images' dengan setting Public di Supabase Storage.";
  }
  if (message.includes("too large") || message.includes("size")) {
    return "Ukuran file terlalu besar (maksimal 5MB).";
  }
  if (message.includes("mime") || message.includes("type")) {
    return "Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.";
  }
  if (message.includes("unauthorized") || message.includes("permission")) {
    return "Anda tidak memiliki izin untuk upload. Pastikan sudah login sebagai admin.";
  }
  
  return message;
}
