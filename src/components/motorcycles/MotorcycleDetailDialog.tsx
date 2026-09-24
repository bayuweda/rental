import { Pencil } from "lucide-react";
import { Dialog } from "../ui/dialog";
import { Button } from "../ui/button";
import { MotorcycleStatusBadge } from "../ui/status-badges";
import { BookingStatusBadge } from "../ui/status-badges";
import { formatIDR, formatDate } from "../../lib/utils";
import { isOverlapping } from "../../lib/date";
import { todayInput } from "../../lib/date";
import type { BookingWithRelations, Motorcycle } from "../../types";

interface Props {
  motor: Motorcycle | null;
  onClose: () => void;
  onEdit?: (motor: Motorcycle) => void;
  bookings: BookingWithRelations[];
}

export function MotorcycleDetailDialog({
  motor,
  onClose,
  onEdit,
  bookings,
}: Props) {
  if (!motor) return null;

  const motorBookings = bookings.filter((b) => b.motorcycle_id === motor.id);

  const upcoming = motorBookings
    .filter((b) => b.end_date >= todayInput() && b.status !== "cancelled")
    .sort((a, b) => a.start_date.localeCompare(b.start_date))
    .slice(0, 5);

  const hasUpcomingConflict = motorBookings.some((a) =>
    motorBookings.some(
      (b) =>
        a.id !== b.id &&
        a.status !== "cancelled" &&
        a.status !== "completed" &&
        b.status !== "cancelled" &&
        b.status !== "completed" &&
        isOverlapping(a.start_date, a.end_date, b.start_date, b.end_date)
    )
  );

  return (
    <Dialog
      open={motor !== null}
      onClose={onClose}
      title={motor.name}
      description={`${motor.brand ?? "-"} ${motor.type ?? ""}`.trim()}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
          {onEdit ? (
            <Button onClick={() => onEdit(motor)}>
              <Pencil className="h-4 w-4" />
              Edit Motor
            </Button>
          ) : null}
        </>
      }
    >
      <div className="space-y-4">
        {motor.image_url ? (
          <img
            src={motor.image_url}
            alt={motor.name}
            className="h-40 w-full rounded-lg border border-slate-200 object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : null}

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <p className="text-xs text-slate-500">Plat nomor</p>
            <p className="font-medium text-slate-900">{motor.license_plate ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Tahun</p>
            <p className="font-medium text-slate-900">{motor.year ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Harga per hari</p>
            <p className="font-medium text-slate-900">
              {formatIDR(motor.price_per_day)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Status</p>
            <p>
              <MotorcycleStatusBadge status={motor.status} />
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-slate-500">Deskripsi</p>
            <p className="whitespace-pre-wrap text-slate-700">
              {motor.description ?? "-"}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-900">
            Booking terdekat
          </p>
          {upcoming.length === 0 ? (
            <p className="text-sm text-slate-500">
              Tidak ada booking aktif untuk motor ini.
            </p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((booking) => (
                <li
                  key={booking.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <span className="text-slate-700">
                    {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                  </span>
                  <BookingStatusBadge status={booking.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {hasUpcomingConflict ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Terdeteksi booking yang tanggalnya saling bertentangan untuk motor ini.
          </div>
        ) : null}
      </div>
    </Dialog>
  );
}