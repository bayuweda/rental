import { useMemo, useState } from "react";
import { Bike, Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  useBookings,
  useCreateMotorcycle,
  useDeleteMotorcycle,
  useMotorcycles,
  useUpdateMotorcycle,
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
import { MotorcycleStatusBadge } from "../components/ui/status-badges";
import { MotorcycleFormDialog } from "../components/motorcycles/MotorcycleFormDialog";
import { MotorcycleDetailDialog } from "../components/motorcycles/MotorcycleDetailDialog";
import { MOTORCYCLE_STATUSES, MOTORCYCLE_STATUS_META } from "../lib/constants";
import { formatIDR } from "../lib/utils";
import { isActiveBooking } from "../lib/stats";
import type { Motorcycle, MotorcycleStatus } from "../types";

type SortKey = "name" | "price_per_day" | "year" | "status";

export function MotorcyclesPage() {
  const motorcyclesQuery = useMotorcycles();
  const bookingsQuery = useBookings();
  const createMutation = useCreateMotorcycle();
  const updateMutation = useUpdateMotorcycle();
  const deleteMutation = useDeleteMotorcycle();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MotorcycleStatus | "all">(
    "all"
  );
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Motorcycle | null>(null);
  const [detail, setDetail] = useState<Motorcycle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Motorcycle | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let items = motorcyclesQuery.data ?? [];

    if (q) {
      items = items.filter((m) =>
        [m.name, m.brand, m.license_plate]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }
    if (statusFilter !== "all") {
      items = items.filter((m) => m.status === statusFilter);
    }
    return [...items].sort((a, b) => {
      switch (sortKey) {
        case "price_per_day":
          return Number(a.price_per_day) - Number(b.price_per_day);
        case "year":
          return (a.year ?? 0) - (b.year ?? 0);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [motorcyclesQuery.data, search, statusFilter, sortKey]);

  const activeBookingCount = (motorId: string): number =>
    (bookingsQuery.data ?? []).filter(
      (b) => b.motorcycle_id === motorId && isActiveBooking(b.status)
    ).length;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const count = activeBookingCount(deleteTarget.id);
    if (count > 0) {
      toast({
        title: "Motor tidak dapat dihapus",
        description: `Mengapa: masih ada ${count} booking aktif (pending/confirmed/berjalan) yang menggunakan motor ini. Batalkan atau selesaikan booking tersebut terlebih dahulu.`,
        variant: "error",
      });
      setDeleteTarget(null);
      return;
    }
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast({ title: "Data motor berhasil dihapus." });
    } catch (error) {
      toast({
        title: "Motor gagal dihapus",
        description:
          error instanceof Error
            ? error.message
            : "Motor masih terkait dengan data lain.",
        variant: "error",
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSubmit = async (values: Partial<Motorcycle>) => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, values });
        toast({ title: "Data motor berhasil diperbarui." });
      } else {
        await createMutation.mutateAsync(values);
        toast({
          title: "Data motor berhasil disimpan.",
          description: "Chatbot dapat langsung membaca informasi motor ini.",
        });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      toast({
        title: editing ? "Perbarui motor gagal" : "Simpan motor gagal",
        description:
          error instanceof Error ? error.message : "Silakan coba lagi.",
        variant: "error",
      });
    }
  };

  if (motorcyclesQuery.isLoading) {
    return <LoadingState label="Memuat data motor..." />;
  }
  if (motorcyclesQuery.isError) {
    return <ErrorState message={motorcyclesQuery.error?.message} onRetry={() => motorcyclesQuery.refetch()} />;
  }

  return (
    <div>
      <PageHeader
        title="Manajemen Motor"
        description="Kelola armada motor yang tersedia untuk disewa."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Tambah Motor
          </Button>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Cari nama, merek, atau plat nomor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            className="sm:w-52"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as MotorcycleStatus | "all")
            }
          >
            <option value="all">Semua status</option>
            {MOTORCYCLE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {MOTORCYCLE_STATUS_META[status].label}
              </option>
            ))}
          </Select>
          <Select
            className="sm:w-52"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            <option value="name">Urut: Nama</option>
            <option value="price_per_day">Urut: Harga</option>
            <option value="year">Urut: Tahun</option>
            <option value="status">Urut: Status</option>
          </Select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Bike}
          title={search || statusFilter !== "all" ? "Tidak ada motor yang cocok" : "Belum ada motor"}
          description={search || statusFilter !== "all" ? "Coba ubah kata kunci atau filter." : "Tambahkan motor pertama Anda untuk mulai mengelola armada."}
          action={
            search || statusFilter !== "all" ? undefined : (
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4" />
                Tambah Motor
              </Button>
            )
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Merek / Tipe</TableHead>
              <TableHead>Plat</TableHead>
              <TableHead>Tahun</TableHead>
              <TableHead className="text-right">Harga</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((motor) => (
              <TableRow
                key={motor.id}
                onClick={() => setDetail(motor)}
                className="cursor-pointer"
              >
                <TableCell className="font-medium text-slate-900">
                  {motor.name}
                </TableCell>
                <TableCell>
                  {[motor.brand, motor.type].filter(Boolean).join(" - ") || "-"}
                </TableCell>
                <TableCell>{motor.license_plate ?? "-"}</TableCell>
                <TableCell>{motor.year ?? "-"}</TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  {formatIDR(motor.price_per_day)}/hari
                </TableCell>
                <TableCell>
                  <MotorcycleStatusBadge status={motor.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div
                    className="flex items-center justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${motor.name}`}
                      onClick={() => {
                        setEditing(motor);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Hapus ${motor.name}`}
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => setDeleteTarget(motor)}
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

      <MotorcycleFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initial={editing}
      />

      <MotorcycleDetailDialog
        motor={detail}
        onClose={() => setDetail(null)}
        onEdit={(motor) => {
          setDetail(null);
          setEditing(motor);
          setFormOpen(true);
        }}
        bookings={bookingsQuery.data ?? []}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
        title={`Hapus motor "${deleteTarget?.name ?? ""}"?`}
        description="Tindakan ini permanen. Jika motor masih memiliki booking terkait, penghapusan akan ditolak."
        confirmLabel="Ya, hapus"
      />
    </div>
  );
}