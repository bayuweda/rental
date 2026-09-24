import { addMonths, endOfMonth, startOfMonth } from "./date";
import type { BookingWithRelations, Motorcycle } from "../types";

export const ACTIVE_BOOKING_STATUSES = ["pending", "confirmed", "ongoing"] as const;
export const REVENUE_STATUSES = ["confirmed", "completed", "ongoing", "pending"] as const;

export function isRelevantBooking(status: string): boolean {
  return status !== "cancelled";
}

export function isActiveBooking(status: string): boolean {
  return status === "pending" || status === "confirmed" || status === "ongoing";
}

export interface DashboardStats {
  totalMotorcycles: number;
  available: number;
  rented: number;
  maintenance: number;
  inactive: number;
  totalCustomers: number;
  pendingBookings: number;
  confirmedBookings: number;
  activeBookings: number;
  totalValue: number;
}

export function computeStats(
  motorcycles: Motorcycle[],
  bookings: BookingWithRelations[],
  customers: unknown[]
): DashboardStats {
  return {
    totalMotorcycles: motorcycles.length,
    available: motorcycles.filter((m) => m.status === "available").length,
    rented: motorcycles.filter((m) => m.status === "rented").length,
    maintenance: motorcycles.filter((m) => m.status === "maintenance").length,
    inactive: motorcycles.filter((m) => m.status === "inactive").length,
    totalCustomers: customers.length,
    pendingBookings: bookings.filter((b) => b.status === "pending").length,
    confirmedBookings: bookings.filter((b) => b.status === "confirmed").length,
    activeBookings: bookings.filter((b) => isActiveBooking(b.status)).length,
    totalValue: bookings
      .filter((b) => isRelevantBooking(b.status))
      .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0),
  };
}

export interface MonthlyValuePoint {
  month: string;
  total: number;
}

export function computeMonthlyValues(
  bookings: BookingWithRelations[],
  monthsBack = 6
): MonthlyValuePoint[] {
  const now = new Date();
  const points: MonthlyValuePoint[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const monthStart = startOfMonth(addMonths(now, -i));
    const monthEnd = endOfMonth(addMonths(now, -i));
    const label = new Intl.DateTimeFormat("id-ID", {
      month: "short",
    }).format(monthStart);
    const total = bookings
      .filter(
        (b) =>
          isRelevantBooking(b.status) &&
          b.created_at >= monthStart.toISOString() &&
          b.created_at <= monthEnd.toISOString()
      )
      .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
    points.push({ month: label, total });
  }
  return points;
}

export function computeMotorStatusDistribution(motorcycles: Motorcycle[]) {
  const counts: Record<string, number> = {
    available: 0,
    rented: 0,
    maintenance: 0,
    inactive: 0,
  };
  for (const m of motorcycles) {
    counts[m.status] = (counts[m.status] ?? 0) + 1;
  }
  return counts;
}