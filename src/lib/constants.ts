import type { BookingStatus, MotorcycleStatus } from "../types";

export const MOTORCYCLE_STATUSES: MotorcycleStatus[] = [
  "available",
  "rented",
  "maintenance",
  "inactive",
];

export const BOOKING_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "ongoing",
  "completed",
  "cancelled",
];

interface StatusMeta {
  label: string;
  badge: string;
  dot: string;
}

export const MOTORCYCLE_STATUS_META: Record<MotorcycleStatus, StatusMeta> = {
  available: {
    label: "Tersedia",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  rented: {
    label: "Sedang Disewa",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  maintenance: {
    label: "Perawatan",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  inactive: {
    label: "Nonaktif",
    badge: "bg-slate-200 text-slate-600",
    dot: "bg-slate-400",
  },
};

export const BOOKING_STATUS_META: Record<BookingStatus, StatusMeta> = {
  pending: {
    label: "Pending",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  confirmed: {
    label: "Confirmed",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  ongoing: {
    label: "Berjalan",
    badge: "bg-violet-100 text-violet-700",
    dot: "bg-violet-500",
  },
  completed: {
    label: "Selesai",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "Batal",
    badge: "bg-red-100 text-red-600",
    dot: "bg-red-500",
  },
};

export const BOOKING_STATUS_COLOR: Record<
  BookingStatus,
  { base: string; light: string }
> = {
  pending: { base: "#f59e0b", light: "#fef3c7" },
  confirmed: { base: "#3b82f6", light: "#dbeafe" },
  ongoing: { base: "#8b5cf6", light: "#ede9fe" },
  completed: { base: "#10b981", light: "#d1fae5" },
  cancelled: { base: "#ef4444", light: "#fee2e2" },
};

export const APP_VERSION = "1.0.0";