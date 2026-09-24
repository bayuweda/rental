import { Pencil } from "lucide-react";
import { Dialog } from "../ui/dialog";
import { Button } from "../ui/button";
import { BookingStatusBadge } from "../ui/status-badges";
import { formatIDR, formatDate, formatDateTime } from "../../lib/utils";
import { isRelevantBooking } from "../../lib/stats";
import type { BookingWithRelations, Customer } from "../../types";

interface Props {
  customer: Customer | null;
  onClose: () => void;
  onEdit?: (customer: Customer) => void;
  bookings: BookingWithRelations[];
}

export function CustomerDetailDialog({
  customer,
  onClose,
  onEdit,
  bookings,
}: Props) {
  if (!customer) return null;

  const customerBookings = bookings
    .filter((b) => b.customer_id === customer.id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const totalValue = customerBookings
    .filter((b) => isRelevantBooking(b.status))
    .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

  return (
    <Dialog
      open={customer !== null}
      onClose={onClose}
      title={customer.name}
      description={`Terdaftar sejak ${formatDate(customer.created_at)}`}
      className="max-w-2xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
          {onEdit ? (
            <Button onClick={() => onEdit(customer)}>
              <Pencil className="h-4 w-4" />
              Edit Customer
            </Button>
          ) : null}
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-500">Nomor telepon</p>
            <p className="font-medium text-slate-900">{customer.phone ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Nomor WhatsApp</p>
            <p className="font-medium text-slate-900">
              {customer.whatsapp_number ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Telegram Chat ID</p>
            <p className="font-mono text-slate-900">
              {customer.telegram_chat_id ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Jumlah booking</p>
            <p className="font-medium text-slate-900">
              {customerBookings.length} booking
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-slate-500">Total nilai booking</p>
            <p className="font-medium text-slate-900">{formatIDR(totalValue)}</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-900">
            Riwayat booking
          </p>
          {customerBookings.length === 0 ? (
            <p className="text-sm text-slate-500">
              Belum ada booking untuk customer ini.
            </p>
          ) : (
            <div className="space-y-2">
              {customerBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {booking.motorcycles?.name ?? "-"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(booking.start_date)} -{" "}
                      {formatDate(booking.end_date)} · {booking.total_days} hari ·
                      dibuat {formatDateTime(booking.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">
                      {formatIDR(booking.total_price)}
                    </span>
                    <BookingStatusBadge status={booking.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}