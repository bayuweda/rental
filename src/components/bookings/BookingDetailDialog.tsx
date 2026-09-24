import { Pencil, Trash2 } from "lucide-react";
import { Dialog } from "../ui/dialog";
import { Button } from "../ui/button";
import { BookingStatusBadge } from "../ui/status-badges";
import { formatIDR, formatDate, formatDateTime } from "../../lib/utils";
import type { BookingWithRelations } from "../../types";

interface Props {
  booking: BookingWithRelations | null;
  onClose: () => void;
  onEdit?: (booking: BookingWithRelations) => void;
  onDelete?: (booking: BookingWithRelations) => void;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <div className="text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}

export function BookingDetailDialog({ booking, onClose, onEdit, onDelete }: Props) {
  if (!booking) return null;

  return (
    <Dialog
      open={booking !== null}
      onClose={onClose}
      title="Detail Booking"
      description={`ID: ${booking.id}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
          {onDelete ? (
            <Button variant="danger" onClick={() => onDelete(booking)}>
              <Trash2 className="h-4 w-4" />
              Hapus
            </Button>
          ) : null}
          {onEdit ? (
            <Button onClick={() => onEdit(booking)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          ) : null}
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
          <DetailRow
            label="Customer"
            value={booking.customers?.name ?? "-"}
          />
          <DetailRow
            label="Kontak"
            value={
              <span className="whitespace-nowrap">
                {booking.customers?.phone ??
                  booking.customers?.whatsapp_number ??
                  "-"}
              </span>
            }
          />
          <DetailRow label="Motor" value={booking.motorcycles?.name ?? "-"} />
          <DetailRow
            label="Plat Nomor"
            value={booking.motorcycles?.license_plate ?? "-"}
          />
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <DetailRow label="Tanggal Mulai" value={formatDate(booking.start_date)} />
          <DetailRow label="Tanggal Selesai" value={formatDate(booking.end_date)} />
          <DetailRow label="Jumlah Hari" value={`${booking.total_days} hari`} />
          <DetailRow label="Harga per Hari" value={formatIDR(booking.price_per_day)} />
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <DetailRow
            label="Total Harga"
            value={<span className="text-base font-bold">{formatIDR(booking.total_price)}</span>}
          />
          <DetailRow label="Status" value={<BookingStatusBadge status={booking.status} />} />
        </div>

        <div>
          <p className="text-xs text-slate-500">Catatan</p>
          <p className="whitespace-pre-wrap text-sm text-slate-700">
            {booking.notes ?? "-"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-3">
          <DetailRow label="Dibuat" value={formatDateTime(booking.created_at)} />
          <DetailRow label="Diperbarui" value={formatDateTime(booking.updated_at)} />
        </div>
      </div>
    </Dialog>
  );
}