import { z } from "zod";
import {
  BOOKING_STATUSES,
  MOTORCYCLE_STATUSES,
} from "./constants";

export const motorcycleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama motor wajib diisi.")
    .max(255, "Nama motor terlalu panjang."),
  brand: z.string().trim().max(255).optional().or(z.literal("")),
  type: z.string().trim().max(255).optional().or(z.literal("")),
  year: z
    .string()
    .trim()
    .refine(
      (v) =>
        v === "" ||
        (/^\d{4}$/.test(v) &&
          Number(v) >= 1990 &&
          Number(v) <= new Date().getFullYear() + 1),
      "Tahun tidak valid (misal: 2024)."
    ),
  license_plate: z.string().trim().max(255).optional().or(z.literal("")),
  price_per_day: z
    .number({ error: "Harga per hari wajib diisi dengan angka." })
    .nonnegative("Harga per hari tidak boleh negatif."),
  status: z.enum(MOTORCYCLE_STATUSES, {
    error: "Pilih status motor yang valid.",
  }),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  image_url: z
    .string()
    .trim()
    .max(2048, "URL gambar terlalu panjang.")
    .refine(
      (v) => v === "" || /^https?:\/\//i.test(v),
      "URL gambar tidak valid (harus http/https)."
    )
    .optional()
    .or(z.literal("")),
});

export type MotorcycleFormValues = z.infer<typeof motorcycleSchema>;

export const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama customer wajib diisi.")
    .max(255, "Nama customer terlalu panjang."),
  phone: z
    .string()
    .trim()
    .max(32, "Nomor telepon terlalu panjang.")
    .optional()
    .or(z.literal("")),
  whatsapp_number: z
    .string()
    .trim()
    .max(32, "Nomor WhatsApp terlalu panjang.")
    .refine(
      (v) =>
        v === "" ||
        v === undefined ||
        /^[0-9+\-\s()]{5,32}$/.test(v ?? ""),
      "Format nomor WhatsApp tidak valid."
    )
    .optional()
    .or(z.literal("")),
  telegram_chat_id: z
    .string()
    .trim()
    .max(32)
    .refine(
      (v) => v === "" || v === undefined || /^\d+$/.test(v ?? ""),
      "Telegram Chat ID harus berupa angka."
    )
    .optional()
    .or(z.literal("")),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

export const bookingSchema = z
  .object({
    customer_id: z.string().min(1, "Customer wajib dipilih."),
    motorcycle_id: z.string().min(1, "Motor wajib dipilih."),
    start_date: z.string().min(1, "Tanggal mulai wajib diisi."),
    end_date: z.string().min(1, "Tanggal selesai wajib diisi."),
    status: z.enum(BOOKING_STATUSES, {
      error: "Pilih status booking yang valid.",
    }),
    notes: z.string().trim().max(5000).optional().or(z.literal("")),
  })
  .superRefine((value, ctx) => {
    if (value.end_date < value.start_date) {
      ctx.addIssue({
        code: "custom",
        path: ["end_date"],
        message: "Tanggal selesai tidak boleh sebelum tanggal mulai.",
      });
    }
  });

export type BookingFormValues = z.infer<typeof bookingSchema>;

export const faqSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Pertanyaan wajib diisi.")
    .max(1000, "Pertanyaan terlalu panjang."),
  answer: z
    .string()
    .trim()
    .min(1, "Jawaban wajib diisi.")
    .max(5000, "Jawaban terlalu panjang."),
  category: z.string().trim().max(255).optional().or(z.literal("")),
  is_active: z.boolean(),
});

export type FaqFormValues = z.infer<typeof faqSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .email("Format email tidak valid."),
  password: z.string().min(6, "Password minimal 6 karakter."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;