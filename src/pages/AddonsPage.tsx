import { useMemo, useState } from "react";
import { PackagePlus, Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  useAddons,
  useCreateAddon,
  useDeleteAddon,
  useUpdateAddon,
} from "../hooks/useData";
import { PageHeader } from "../components/ui/page-header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { LoadingState } from "../components/ui/spinner";
import { EmptyState, ErrorState } from "../components/ui/states";
import { ConfirmDialog } from "../components/ui/confirm-dialog";
import { useToast } from "../components/ui/toast";
import { AddonFormDialog } from "../components/addons/AddonFormDialog";
import { formatIDR } from "../lib/utils";
import type { Addon } from "../types";

export function AddonsPage() {
  const addonsQuery = useAddons();
  const createMutation = useCreateAddon();
  const updateMutation = useUpdateAddon();
  const deleteMutation = useDeleteAddon();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Addon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Addon | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (addonsQuery.data ?? []).filter((a) => {
      const matchSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        (a.description ?? "").toLowerCase().includes(q);
      const matchActive =
        activeFilter === "all" ||
        (activeFilter === "active" ? a.is_active : !a.is_active);
      return matchSearch && matchActive;
    });
  }, [addonsQuery.data, search, activeFilter]);

  const handleSubmit = async (values: Partial<Addon>) => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, values });
        toast({ title: "Add-on berhasil diperbarui." });
      } else {
        await createMutation.mutateAsync(values);
        toast({ title: "Add-on berhasil disimpan." });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      toast({
        title: "Menyimpan add-on gagal",
        description: error instanceof Error ? error.message : "Silakan coba lagi.",
        variant: "error",
      });
    }
  };

  const handleToggleActive = async (addon: Addon) => {
    try {
      await updateMutation.mutateAsync({
        id: addon.id,
        values: { is_active: !addon.is_active },
      });
      toast({ title: addon.is_active ? "Add-on dinonaktifkan." : "Add-on diaktifkan." });
    } catch (error) {
      toast({
        title: "Gagal mengubah status add-on",
        description: error instanceof Error ? error.message : "Silakan coba lagi.",
        variant: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast({ title: "Add-on berhasil dihapus." });
    } catch (error) {
      toast({
        title: "Add-on gagal dihapus",
        description:
          error instanceof Error
            ? error.message
            : "Add-on mungkin masih dipakai oleh data booking.",
        variant: "error",
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  if (addonsQuery.isLoading) return <LoadingState label="Memuat add-on..." />;
  if (addonsQuery.isError) {
    return <ErrorState message={addonsQuery.error?.message} onRetry={() => addonsQuery.refetch()} />;
  }

  return (
    <div>
      <PageHeader
        title="Add-on"
        description="Kelola perlengkapan tambahan untuk booking."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Tambah Add-on
          </Button>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Cari nama atau deskripsi add-on..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            className="sm:w-52"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as "all" | "active" | "inactive")}
          >
            <option value="all">Semua status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </Select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={PackagePlus}
          title={search || activeFilter !== "all" ? "Tidak ada add-on yang cocok" : "Belum ada add-on"}
          description={
            search || activeFilter !== "all"
              ? "Coba ubah kata kunci atau filter."
              : "Tambahkan add-on seperti helm atau jas hujan."
          }
          action={
            search || activeFilter !== "all" ? undefined : (
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4" />
                Tambah Add-on
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((addon) => (
            <Card key={addon.id}>
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">{addon.name}</p>
                    {addon.is_active ? (
                      <Badge className="bg-emerald-100 text-emerald-700">Aktif</Badge>
                    ) : (
                      <Badge className="bg-slate-200 text-slate-600">Nonaktif</Badge>
                    )}
                    <Badge className="bg-slate-100 text-slate-700">
                      {formatIDR(addon.price)} {addon.price_type === "per_day" ? "/ hari" : "(flat)"}
                    </Badge>
                    {addon.stock != null ? (
                      <Badge className="bg-blue-50 text-blue-700">Stok: {addon.stock}</Badge>
                    ) : null}
                  </div>
                  {addon.description ? (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{addon.description}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => handleToggleActive(addon)}>
                    {addon.is_active ? "Nonaktifkan" : "Aktifkan"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit add-on"
                    onClick={() => {
                      setEditing(addon);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Hapus add-on"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => setDeleteTarget(addon)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddonFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initial={editing}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
        title={`Hapus add-on "${deleteTarget?.name ?? ""}"?`}
        description="Tindakan ini permanen. Jika add-on masih dipakai oleh booking, penghapusan dapat ditolak."
        confirmLabel="Ya, hapus"
      />
    </div>
  );
}
