import { useMemo, useState } from "react";
import { addDays, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useBookings, useMotorcycles } from "../hooks/useData";
import { PageHeader } from "../components/ui/page-header";
import { Button } from "../components/ui/button";
import { Select } from "../components/ui/select";
import { Card } from "../components/ui/card";
import { LoadingState } from "../components/ui/spinner";
import { ErrorState } from "../components/ui/states";
import { BookingDetailDialog } from "../components/bookings/BookingDetailDialog";
import { BOOKING_STATUS_COLOR, BOOKING_STATUS_META, BOOKING_STATUSES } from "../lib/constants";
import { cn } from "../lib/utils";
import { isActiveBooking } from "../lib/stats";
import { isWithinDay } from "../lib/date";
import type { BookingStatus, BookingWithRelations } from "../types";

const WEEKDAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function monthLabel(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export function CalendarPage() {
  const bookingsQuery = useBookings();
  const motorcyclesQuery = useMotorcycles();

  const [monthDate, setMonthDate] = useState(() => startOfMonth(new Date()));
  const [motorFilter, setMotorFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [detail, setDetail] = useState<BookingWithRelations | null>(null);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [monthDate]);

  const visibleBookings = useMemo(() => {
    let items = bookingsQuery.data ?? [];
    if (motorFilter !== "all") items = items.filter((b) => b.motorcycle_id === motorFilter);
    if (statusFilter !== "all") items = items.filter((b) => b.status === statusFilter);
    return items;
  }, [bookingsQuery.data, motorFilter, statusFilter]);

  const monthRange = useMemo(
    () => ({ start: format(startOfMonth(monthDate), "yyyy-MM-dd"), end: format(endOfMonth(monthDate), "yyyy-MM-dd") }),
    [monthDate]
  );

  const conflicts = useMemo(() => {
    const monthBookings = (bookingsQuery.data ?? []).filter(
      (b) => isActiveBooking(b.status) && b.start_date <= monthRange.end && b.end_date >= monthRange.start
    );
    const found: Array<{ a: BookingWithRelations; b: BookingWithRelations }> = [];
    for (let i = 0; i < monthBookings.length; i++) {
      for (let j = i + 1; j < monthBookings.length; j++) {
        const x = monthBookings[i];
        const y = monthBookings[j];
        if (x.motorcycle_id !== y.motorcycle_id) continue;
        if (x.start_date <= y.end_date && y.start_date <= x.end_date) {
          found.push({ a: x, b: y });
        }
      }
    }
    return found;
  }, [bookingsQuery.data, monthRange]);

  const maintenanceMotors = (motorcyclesQuery.data ?? []).filter(
    (m) => m.status === "maintenance"
  );

  if (bookingsQuery.isLoading || motorcyclesQuery.isLoading) {
    return <LoadingState label="Menyiapkan kalender..." />;
  }
  if (bookingsQuery.isError || motorcyclesQuery.isError) {
    return (
      <ErrorState
        message={bookingsQuery.error?.message ?? motorcyclesQuery.error?.message}
        onRetry={() => {
          bookingsQuery.refetch();
          motorcyclesQuery.refetch();
        }}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Kalender Rental"
        description="Lihat jadwal booking motor dalam tampilan bulanan."
        actions={
          <>
            <Button variant="outline" onClick={() => setMonthDate(startOfMonth(new Date()))}>
              Hari ini
            </Button>
            <Button variant="outline" onClick={() => setMonthDate(startOfMonth(addDays(monthDate, -31)))}>
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </Button>
            <Button variant="outline" onClick={() => setMonthDate(startOfMonth(addDays(monthDate, 32)))}>
              Berikutnya
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <span className="text-sm font-semibold text-slate-900">
            {monthLabel(monthDate)}
          </span>
          <div className="ml-auto flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select
              className="sm:w-56"
              value={motorFilter}
              onChange={(e) => setMotorFilter(e.target.value)}
            >
              <option value="all">Semua motor</option>
              {(motorcyclesQuery.data ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
            <Select
              className="sm:w-44"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus | "all")}
            >
              <option value="all">Semua status</option>
              {BOOKING_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {BOOKING_STATUS_META[s].label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {conflicts.length > 0 ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Terdeteksi jadwal bentrok pada bulan ini:
          <ul className="mt-1 list-inside list-disc">
            {conflicts.slice(0, 5).map((c, i) => (
              <li key={i}>
                {c.a.motorcycles?.name} - {c.a.customers?.name} (
                {c.a.start_date} s.d. {c.a.end_date}) vs {c.b.customers?.name} (
                {c.b.start_date} s.d. {c.b.end_date})
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {maintenanceMotors.length > 0 ? (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Motor dalam perawatan:{" "}
          {maintenanceMotors.map((m) => m.name).join(", ")}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="grid min-w-[720px] grid-cols-7 border-b border-slate-200 bg-slate-50">
          {WEEKDAY_LABELS.map((day) => (
            <div key={day} className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid min-w-[720px] grid-cols-7">
          {days.map((day) => {
            const dayStr = format(day, "yyyy-MM-dd");
            const dayBookings = visibleBookings.filter((b) =>
              isWithinDay(day, b.start_date, b.end_date)
            );
            const inMonth = isSameMonth(day, monthDate);
            return (
              <div
                key={dayStr}
                className={cn(
                  "min-h-24 border-b border-slate-100 p-1.5",
                  !inMonth && "bg-slate-50/60"
                )}
              >
                <span
                  className={cn(
                    "mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                    format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                      ? "bg-slate-900 text-white"
                      : "text-slate-600"
                  )}
                >
                  {format(day, "d")}
                </span>
                <div className="space-y-1">
                  {dayBookings.slice(0, 3).map((b) => {
                    const color = BOOKING_STATUS_COLOR[b.status] ?? BOOKING_STATUS_COLOR.pending;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setDetail(b)}
                        className="block w-full truncate rounded px-1.5 py-1 text-left text-xs font-medium"
                        style={{ backgroundColor: color.light, color: color.base }}
                        title={`${b.customers?.name ?? "-"} - ${b.motorcycles?.name ?? "-"} (${b.status})`}
                      >
                        {b.customers?.name ?? "-"}
                      </button>
                    );
                  })}
                  {dayBookings.length > 3 ? (
                    <span className="block px-1.5 text-xs text-slate-400">
                      +{dayBookings.length - 3} lainnya
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600">
        <CalendarDays className="h-4 w-4" />
        {BOOKING_STATUSES.map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: BOOKING_STATUS_COLOR[s].base }}
            />
            {BOOKING_STATUS_META[s].label}
          </span>
        ))}
      </div>

      <BookingDetailDialog booking={detail} onClose={() => setDetail(null)} />
    </div>
  );
}