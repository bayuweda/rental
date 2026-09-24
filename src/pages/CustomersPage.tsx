import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import {
  useBookings,
  useCreateCustomer,
  useCustomers,
  useDeleteCustomer,
  useUpdateCustomer,
} from "../hooks/useData";
import { PageHeader } from "../components/ui/page-header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
import { CustomerFormDialog } from "../components/customers/CustomerFormDialog";
import { CustomerDetailDialog } from "../components/customers/CustomerDetailDialog";
import { formatDate } from "../lib/utils";
import type { Customer } from "../types";

export function CustomersPage() {
  const customersQuery = useCustomers();
  const bookingsQuery = useBookings();
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [detail, setDetail] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const customers = customersQuery.data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = customersQuery.data ?? [];
    if (!q) return list;
    return list.filter((c) =>
      [c.name, c.phone, c.whatsapp_number, c.telegram_chat_id]
        .filter((v) => v !== null && v !== undefined && v !== "")
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [customersQuery.data, search]);

  const bookingCountFor = (customerId: string): number =>
    (bookingsQuery.data ?? []).filter((b) => b.customer_id === customerId).length;

  const checkDuplicate = (values: Partial<Customer>, excludeId?: string) => {
    const target = customers.find((c) => c.id !== excludeId);
    if (!target) return undefined;
    if (
      values.whatsapp_number &&
      customers.some(
        (c) =>
          c.id !== excludeId && c.whatsapp_number === values.whatsapp_number
      )
    ) {
      return "Nomor WhatsApp sudah terdaftar untuk customer lain.";
    }
    if (
      values.telegram_chat_id &&
      customers.some(
        (c) =>
          c.id !== excludeId && c.telegram_chat_id === values.telegram_chat_id
      )
    ) {
      return "Telegram Chat ID sudah terdaftar untuk customer lain.";
    }
    return undefined;
  };

  const handleSubmit = async (values: Partial<Customer>) => {
    const duplicate = checkDuplicate(values, editing?.id);
    if (duplicate) {
      toast({ title: "Data tidak dapat disimpan", description: duplicate, variant: "error" });
      return;
    }
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, values });
        toast({ title: "Data customer berhasil diperbarui." });
      } else {
        await createMutation.mutateAsync(values);
        toast({ title: "Data customer berhasil disimpan." });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      toast({
        title: editing ? "Perbarui customer gagal" : "Simpan customer gagal",
        description:
          error instanceof Error ? error.message : "Silakan coba lagi.",
        variant: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const count = bookingCountFor(deleteTarget.id);
    if (count > 0) {
      toast({
        title: "Customer tidak dapat dihapus",
        description: `Customer ini memiliki ${count} booking terkait.`,
        variant: "error",
      });
      setDeleteTarget(null);
      return;
    }
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast({ title: "Data customer berhasil dihapus." });
    } catch (error) {
      toast({
        title: "Customer gagal dihapus",
        description:
          error instanceof Error ? error.message : "Silakan coba lagi.",
        variant: "error",
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  if (customersQuery.isLoading) {
    return <LoadingState label="Memuat data customer..." />;
  }
  if (customersQuery.isError) {
    return <ErrorState message={customersQuery.error?.message} onRetry={() => customersQuery.refetch()} />;
  }

  return (
    <div>
      <PageHeader
        title="Manajemen Customer"
        description="Kelola data customer rental dan koneksi Telegram."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Tambah Customer
          </Button>
        }
      />

      <Card className="mb-4">
        <div className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Cari nama, telepon, WhatsApp, atau Telegram Chat ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? "Tidak ada customer yang cocok" : "Belum ada customer"}
          description={
            search
              ? "Coba ubah kata kunci pencarian."
              : "Customer baru bisa dibuat manual atau masuk otomatis melalui chatbot."
          }
          action={
            search ? undefined : <Button onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" /> Tambah Customer</Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Telepon</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Telegram Chat ID</TableHead>
              <TableHead>Booking</TableHead>
              <TableHead>Terdaftar</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((customer) => (
              <TableRow
                key={customer.id}
                onClick={() => setDetail(customer)}
                className="cursor-pointer"
              >
                <TableCell className="font-medium text-slate-900">
                  {customer.name}
                </TableCell>
                <TableCell>{customer.phone ?? "-"}</TableCell>
                <TableCell>{customer.whatsapp_number ?? "-"}</TableCell>
                <TableCell className="font-mono text-xs">
                  {customer.telegram_chat_id ?? "-"}
                </TableCell>
                <TableCell>{bookingCountFor(customer.id)}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(customer.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <div
                    className="flex items-center justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${customer.name}`}
                      onClick={() => {
                        setEditing(customer);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Hapus ${customer.name}`}
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => setDeleteTarget(customer)}
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

      <CustomerFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initial={editing}
      />

      <CustomerDetailDialog
        customer={detail}
        onClose={() => setDetail(null)}
        onEdit={(customer) => {
          setDetail(null);
          setEditing(customer);
          setFormOpen(true);
        }}
        bookings={bookingsQuery.data ?? []}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
        title={`Hapus customer "${deleteTarget?.name ?? ""}"?`}
        description="Tindakan ini permanen dan tidak dapat dibatalkan."
        confirmLabel="Ya, hapus"
      />
    </div>
  );
}