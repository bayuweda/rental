import { useMemo, useState } from "react";
import { CalendarX2, CarFront, Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  useBookings,
  useCreateBooking,
  useCustomers,
  useDeleteBooking,
  useMotorcycles,
  useUpdateBooking,
  useUpdateBookingStatus,
} from "../hooks/useData";
import { PageHeader } from "../components/ui/page-header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Card } from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { LoadingState } from "../components/ui/spinner";
import { EmptyState, ErrorState } from "../components/ui/states";
import { ConfirmDialog } from "../components/ui/confirm-dialog";
import { useToast } from "../components/ui/toast";
import { BookingFormDialog } from "../components/bookings/BookingFormDialog";
import { BookingDetailDialog } from "../components/bookings/BookingDetailDialog";
import { BOOKING_STATUSES, BOOKING_STATUS_META } from "../lib/constants";
import { formatIDR, formatDate } from "../lib/utils";
import type { Booking, BookingStatus, BookingWithRelations } from "../types";

type SortKey = "created_at" | "start_date" | "end_date" | "total_price";

export function BookingsPage() {
  const bookingsQuery = useBookings();
  const motorcyclesQuery = useMotorcycles();
  const customersQuery = useCustomers();
  const createMutation = useCreateBooking();
  const updateMutation = useUpdateBooking();
  const statusMutation = useUpdateBookingStatus();
  const deleteMutation = useDeleteBooking();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BookingWithRelations | null>(null);
  const [detail, setDetail] = useState<BookingWithRelations | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BookingWithRelations | null>(null);

  const bookings = bookingsQuery.data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let items = bookingsQuery.data ?? [];

    if (q) {
      items = items.filter(
        (b) =>
          b.id.toLowerCase().includes(q) ||
          (b.customers?.name ?? "").toLowerCase().includes(q) ||
          (b.motorcycles?.name ?? "").toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      items = items.filter((b) => b.status === statusFilter);
    }
    if (fromDate) {
      items = items.filter((b) => b.start_date >= fromDate && b.end_date >= fromDate);
    }
    if (toDate) {
      items = items.filter((b) => b.start_date <= toDate);
    }
    return [...items].sort((a, b) => {
      switch (sortKey) {
        case "start_date":
          return a.start_date.localeCompare(b.start_date);
        case "end_date":
          return a.end_date.localeCompare(b.end_date);
        case "total_price":
          return Number(a.total_price) - Number(b.total_price);
        default:
          return b.created_at.localeCompare(a.created_at);
      }
    });
  }, [bookingsQuery.data, search, statusFilter, fromDate, toDate, sortKey]);

  const handleSubmit = async (values: Partial<Booking>) => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, values });
        toast({ title: "Booking berhasil diperbarui." });
      } else {
        await createMutation.mutateAsync(values);
        toast({
          title: "Booking berhasil dibuat.",
          description: "Booking ini dapat dibaca oleh chatbot.",
        });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      toast({
        title: "Menyimpan booking gagal",
        description: error instanceof Error ? error.message : "Silakan coba lagi.",
        variant: "error",
      });
    }
  };

  const handleStatusChange = async (booking: BookingWithRelations, status: BookingStatus) => {
    if (status === booking.status) return;
    try {
      await statusMutation.mutateAsync({ id: booking.id, status });
      toast({ title: `Status booking diubah menjadi ${BOOKING_STATUS_META[status].label}.` });
    } catch (error) {
      toast({
        title: "Gagal mengubah status",
        description: error instanceof Error ? error.message : "Silakan coba lagi.",
        variant: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast({ title: "Booking berhasil dihapus." });
    } catch (error) {
      toast({
        title: "Booking gagal dihapus",
        description: error instanceof Error ? error.message : "Silakan coba lagi.",
        variant: "error",
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  const isLoading =
    bookingsQuery.isLoading || motorcyclesQuery.isLoading || customersQuery.isLoading;
  const queryError =
    bookingsQuery.error?.message ??
    motorcyclesQuery.error?.message ??
    customersQuery.error?.message;

  if (isLoading) return <LoadingState label="Memuat data booking..." />;
  if (queryError) {
    return (
      <ErrorState
        message={queryError}
        onRetry={() => {
          bookingsQuery.refetch();
          motorcyclesQuery.refetch();
          customersQuery.refetch();
        }}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Manajemen Booking"
        description="Kelola pemesanan rental motor dan jadwalnya."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Buat Booking
          </Button>
        }
      />

      <Card className="mb-4">
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Cari customer, motor, atau ID booking..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BookingStatus | "all")}
          >
            <option value="all">Semua status</option>
            {BOOKING_STATUSES.map((status) => (
              <option key={status} value={status}>
                {BOOKING_STATUS_META[status].label}
              </option>
            ))}
          </Select>
          <Input
            type="date"
            aria-label="Dari tanggal"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <Input
            type="date"
            aria-label="Sampai tanggal"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <div className="border-t border-slate-100 px-4 py-3">
          <Select
            className="sm:w-56"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            <option value="created_at">Urut: Terbaru dibuat</option>
            <option value="start_date">Urut: Tanggal mulai</option>
            <option value="end_date">Urut: Tanggal selesai</option>
            <option value="total_price">Urut: Total harga</option>
          </Select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CarFront}
          title="Tidak ada booking"
          description={
            search || statusFilter !== "all" || fromDate || toDate
              ? "Coba ubah kata kunci atau filter."
              : "Booking dari dashboard dan chatbot akan tampil di sini."
          }
          action={
            search || statusFilter !== "all" || fromDate || toDate ? undefined : (
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4" />
                Buat Booking
              </Button>
            )
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Motor</TableHead>
              <TableHead>Periode</TableHead>
              <TableHead>Hari</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((booking) => (
              <TableRow
                key={booking.id}
                onClick={() => setDetail(booking)}
                className="cursor-pointer"
              >
                <TableCell className="font-medium text-slate-900">
                  {booking.customers?.name ?? "-"}
                  <span className="block text-xs font-normal text-slate-400">
                    {booking.id.slice(0, 8)}
                  </span>
                </TableCell>
                <TableCell>{booking.motorcycles?.name ?? "-"}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                </TableCell>
                <TableCell>{booking.total_days}</TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  {formatIDR(booking.total_price)}
                </TableCell>
                <TableCell>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Select
                      className="h-8 w-32 text-xs"
                      value={booking.status}
                      onChange={(e) =>
                        handleStatusChange(booking, e.target.value as BookingStatus)
                      }
                      aria-label="Ubah status booking"
                    >
                      {BOOKING_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {BOOKING_STATUS_META[status].label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div
                    className="flex items-center justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Edit booking"
                      onClick={() => {
                        setEditing(booking);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Batalkan booking"
                      className="text-amber-600 hover:bg-amber-50"
                      onClick={() =>
                        handleStatusChange(booking, "cancelled")
                      }
                    >
                      <CalendarX2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Hapus booking"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => setDeleteTarget(booking)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <BookingFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initial={editing}
        motorcycles={motorcyclesQuery.data ?? []}
        customers={customersQuery.data ?? []}
        bookings={bookings}
      />

      <BookingDetailDialog
        booking={detail}
        onClose={() => setDetail(null)}
        onEdit={(booking) => {
          setDetail(null);
          setEditing(booking);
          setFormOpen(true);
        }}
        onDelete={(booking) => {
          setDetail(null);
          setDeleteTarget(booking);
        }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
        title="Hapus booking ini?"
        description="Tindakan ini permanen. Pertimbangkan untuk membatalkan (cancelled) daripada menghapus."
        confirmLabel="Ya, hapus"
      />
    </div>
  );
}