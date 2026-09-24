import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Dialog } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input, Textarea } from "../ui/input";
import { Label } from "../ui/label";
import { Select } from "../ui/select";
import {
  bookingSchema,
  type BookingFormValues,
} from "../../lib/validations";
import { BOOKING_STATUSES, BOOKING_STATUS_META } from "../../lib/constants";
import { formatIDR, cn } from "../../lib/utils";
import { inclusiveDays, isOverlapping, todayInput } from "../../lib/date";
import { isActiveBooking } from "../../lib/stats";
import { BookingStatusBadge } from "../ui/status-badges";
import type { Booking, BookingWithRelations, Customer, Motorcycle } from "../../types";

export interface BookingFormInput {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<Booking>) => Promise<void>;
  initial?: BookingWithRelations | null;
  motorcycles: Motorcycle[];
  customers: Customer[];
  bookings: BookingWithRelations[];
}

interface ConflictInfo {
  id: string;
  customer: string;
  start: string;
  end: string;
  status: Booking["status"];
}

export function BookingFormDialog({
  open,
  onClose,
  onSubmit,
  initial,
  motorcycles,
  customers,
  bookings,
}: BookingFormInput) {
  const [conflicts, setConflicts] = useState<ConflictInfo[]>([]);

  const defaultValues: BookingFormValues = {
    customer_id: initial?.customer_id ?? "",
    motorcycle_id: initial?.motorcycle_id ?? "",
    start_date: initial?.start_date ?? todayInput(),
    end_date: initial?.end_date ?? todayInput(),
    status: initial?.status ?? "pending",
    notes: initial?.notes ?? "",
  };

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues,
  });

  const [motorcycleId, startDate, endDate] = watch([
    "motorcycle_id",
    "start_date",
    "end_date",
  ]);

  useEffect(() => {
    if (open) reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial, reset]);

  const selectedMotor = useMemo(
    () => motorcycles.find((m) => m.id === motorcycleId),
    [motorcycles, motorcycleId]
  );

  const days = useMemo(
    () => inclusiveDays(startDate, endDate),
    [startDate, endDate]
  );
  const totalPrice = useMemo(() => {
    const price = selectedMotor ? Number(selectedMotor.price_per_day) || 0 : 0;
    return days * price;
  }, [selectedMotor, days]);

  useEffect(() => {
    if (!motorcycleId || !startDate || !endDate) {
      setConflicts([]);
      return;
    }
    const found = (bookings ?? []).filter(
      (b) =>
        b.motorcycle_id === motorcycleId &&
        b.id !== initial?.id &&
        isActiveBooking(b.status) &&
        isOverlapping(b.start_date, b.end_date, startDate, endDate)
    );
    setConflicts(
      found.map((b) => ({
        id: b.id,
        customer: b.customers?.name ?? "-",
        start: b.start_date,
        end: b.end_date,
        status: b.status,
      }))
    );
  }, [motorcycleId, startDate, endDate, bookings, initial?.id]);

  const motorBlocked = selectedMotor
    ? selectedMotor.status !== "available"
    : false;
  const canSubmit = conflicts.length === 0 && !motorBlocked;

  const onFormSubmit = handleSubmit(async (values) => {
    if (conflicts.length > 0) {
      return;
    }
    const price = selectedMotor ? Number(selectedMotor.price_per_day) || 0 : 0;
    const payload: Partial<Booking> = {
      customer_id: values.customer_id,
      motorcycle_id: values.motorcycle_id,
      start_date: values.start_date,
      end_date: values.end_date,
      status: values.status,
      notes: values.notes || null,
      total_days: inclusiveDays(values.start_date, values.end_date),
      price_per_day: price,
      total_price: inclusiveDays(values.start_date, values.end_date) * price,
    };
    await onSubmit(payload);
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={initial ? "Edit Booking" : "Buat Booking"}
      description="Harga diambil dari tabel motorcycles. Booking bentrok tidak dapat disimpan."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            type="submit"
            form="booking-form"
            disabled={isSubmitting || !canSubmit}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            {isSubmitting ? "Menyimpan..." : initial ? "Simpan Perubahan" : "Simpan Booking"}
          </Button>
        </>
      }
    >
      <form id="booking-form" onSubmit={onFormSubmit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="customer_id">Customer *</Label>
          <Select id="customer_id" {...register("customer_id")}>
            <option value="">Pilih customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          {errors.customer_id ? (
            <p className="mt-1 text-xs text-red-600">{errors.customer_id.message}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="motorcycle_id">Motor *</Label>
          <Select id="motorcycle_id" {...register("motorcycle_id")}>
            <option value="">Pilih motor</option>
            {motorcycles
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.license_plate ?? "tanpa plat"}) - {formatIDR(m.price_per_day)}/hari
                </option>
              ))}
          </Select>
          {errors.motorcycle_id ? (
            <p className="mt-1 text-xs text-red-600">{errors.motorcycle_id.message}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_date">Tanggal Mulai *</Label>
            <Input id="start_date" type="date" {...register("start_date")} />
            {errors.start_date ? (
              <p className="mt-1 text-xs text-red-600">{errors.start_date.message}</p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="end_date">Tanggal Selesai *</Label>
            <Input id="end_date" type="date" {...register("end_date")} />
            {errors.end_date ? (
              <p className="mt-1 text-xs text-red-600">{errors.end_date.message}</p>
            ) : null}
          </div>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" {...register("status")}>
            {BOOKING_STATUSES.map((status) => (
              <option key={status} value={status}>
                {BOOKING_STATUS_META[status].label}
              </option>
            ))}
          </Select>
        </div>

        <div
          className={cn(
            "rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm",
            days > 0 && "bg-emerald-50/60"
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-slate-600">
              {selectedMotor ? selectedMotor.name : "Motor belum dipilih"} ·{" "}
              {formatIDR(selectedMotor ? selectedMotor.price_per_day : 0)}/hari
            </span>
            <span className="font-semibold text-slate-900">
              {days} hari
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-slate-500">Perhitungan inklusif (mulai + selesai dihitung)</span>
            <span className="text-base font-bold text-slate-900">
              {formatIDR(totalPrice)}
            </span>
          </div>
        </div>

        {motorBlocked ? (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Motor ini berstatus{" "}
              <strong>
                {selectedMotor?.status === "maintenance"
                  ? "perawatan"
                  : selectedMotor?.status === "rented"
                    ? "sedang disewa"
                    : "nonaktif"}
              </strong>
              , sehingga tidak dapat dibooking.
            </span>
          </div>
        ) : null}

        {conflicts.length > 0 ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <p className="mb-1 flex items-center gap-1.5 font-medium">
              <AlertTriangle className="h-4 w-4" />
              Tanggal rental bertentangan dengan booking yang sudah ada:
            </p>
            <ul className="ml-5 list-disc space-y-1">
              {conflicts.map((c) => (
                <li key={c.id}>
                  {c.customer} ({c.start} s.d. {c.end}) -{" "}
                  <BookingStatusBadge status={c.status} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {initial ? (
          <p className="text-xs text-slate-400">
            Total hari & harga lama akan diperbarui sesuai perhitungan terbaru. Harga per hari tidak mengubah riwayat booking lain.
          </p>
        ) : null}

        <div>
          <Label htmlFor="notes">Catatan</Label>
          <Textarea
            id="notes"
            placeholder="Catatan tambahan (opsional)"
            {...register("notes")}
          />
          {errors.notes ? (
            <p className="mt-1 text-xs text-red-600">{errors.notes.message}</p>
          ) : null}
        </div>
      </form>
    </Dialog>
  );
}