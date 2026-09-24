import { supabase } from "./supabase";
import type {
  Booking,
  BookingStatus,
  BookingWithRelations,
  Customer,
  Faq,
  Motorcycle,
} from "../types";

function toErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "message" in error) {
    const msg = String((error as { message: string }).message);
    if (msg.includes("duplicate key") || msg.includes("unique")) {
      return "Data sudah terdaftar. Periksa kembali nilai yang unik.";
    }
    if (msg.includes("row-level security") || msg.includes("policy")) {
      return "Akses ditolak. Periksa konfigurasi izin database.";
    }
    return msg;
  }
  return fallback;
}

function apiError(error: unknown, fallback: string): never {
  throw new Error(toErrorMessage(error, fallback));
}

/* ---------------- Motorcycles ---------------- */

export async function fetchMotorcycles(): Promise<Motorcycle[]> {
  const { data, error } = await supabase
    .from("motorcycles")
    .select("*")
    .order("name");
  if (error) apiError(error, "Gagal mengambil data motor.");
  return (data ?? []) as Motorcycle[];
}

export async function createMotorcycle(
  values: Partial<Motorcycle>
): Promise<Motorcycle> {
  const { data, error } = await supabase
    .from("motorcycles")
    .insert(values)
    .select()
    .single();
  if (error) apiError(error, "Data motor gagal disimpan.");
  return data as Motorcycle;
}

export async function updateMotorcycle(
  id: string,
  values: Partial<Motorcycle>
): Promise<Motorcycle> {
  const { data, error } = await supabase
    .from("motorcycles")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) apiError(error, "Data motor gagal diperbarui.");
  return data as Motorcycle;
}

export async function deleteMotorcycle(id: string): Promise<void> {
  const { error } = await supabase.from("motorcycles").delete().eq("id", id);
  if (error) apiError(error, "Motor gagal dihapus.");
}

/* ---------------- Customers ---------------- */

export async function fetchCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("name");
  if (error) apiError(error, "Gagal mengambil data customer.");
  return (data ?? []) as Customer[];
}

export async function createCustomer(
  values: Partial<Customer>
): Promise<Customer> {
  const { data, error } = await supabase
    .from("customers")
    .insert(values)
    .select()
    .single();
  if (error) apiError(error, "Data customer gagal disimpan.");
  return data as Customer;
}

export async function updateCustomer(
  id: string,
  values: Partial<Customer>
): Promise<Customer> {
  const { data, error } = await supabase
    .from("customers")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) apiError(error, "Data customer gagal diperbarui.");
  return data as Customer;
}

export async function deleteCustomer(id: string): Promise<void> {
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) apiError(error, "Customer gagal dihapus.");
}

/* ---------------- Bookings ---------------- */

export async function fetchBookings(): Promise<BookingWithRelations[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "*, customers(id, name, phone, whatsapp_number, telegram_chat_id), motorcycles(id, name, brand, license_plate, price_per_day, status)"
    )
    .order("created_at", { ascending: false });
  if (error) apiError(error, "Gagal mengambil data booking.");
  return (data ?? []) as BookingWithRelations[];
}

export async function createBooking(
  values: Partial<Booking>
): Promise<Booking> {
  const { data, error } = await supabase
    .from("bookings")
    .insert(values)
    .select()
    .single();
  if (error) apiError(error, "Booking gagal disimpan.");
  return data as Booking;
}

export async function updateBooking(
  id: string,
  values: Partial<Booking>
): Promise<Booking> {
  const { data, error } = await supabase
    .from("bookings")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) apiError(error, "Booking gagal diperbarui.");
  return data as Booking;
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<Booking> {
  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) apiError(error, "Status booking gagal diperbarui.");
  return data as Booking;
}

export async function deleteBooking(id: string): Promise<void> {
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) apiError(error, "Booking gagal dihapus.");
}

/* ---------------- FAQ ---------------- */

export async function fetchFaqs(): Promise<Faq[]> {
  const { data, error } = await supabase
    .from("faq")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) apiError(error, "Gagal mengambil data FAQ.");
  return (data ?? []) as Faq[];
}

export async function createFaq(values: Partial<Faq>): Promise<Faq> {
  const { data, error } = await supabase
    .from("faq")
    .insert(values)
    .select()
    .single();
  if (error) apiError(error, "FAQ gagal disimpan.");
  return data as Faq;
}

export async function updateFaq(id: string, values: Partial<Faq>): Promise<Faq> {
  const { data, error } = await supabase
    .from("faq")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) apiError(error, "FAQ gagal diperbarui.");
  return data as Faq;
}

export async function deleteFaq(id: string): Promise<void> {
  const { error } = await supabase.from("faq").delete().eq("id", id);
  if (error) apiError(error, "FAQ gagal dihapus.");
}