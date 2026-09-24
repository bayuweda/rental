import { useMemo, useState } from "react";
import { HelpCircle, Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  useCreateFaq,
  useDeleteFaq,
  useFaqs,
  useUpdateFaq,
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
import { FaqFormDialog } from "../components/faq/FaqFormDialog";
import { formatDate } from "../lib/utils";
import type { Faq } from "../types";

export function FaqPage() {
  const faqsQuery = useFaqs();
  const createMutation = useCreateFaq();
  const updateMutation = useUpdateFaq();
  const deleteMutation = useDeleteFaq();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null);

  const categories = useMemo(() => {
    const list = faqsQuery.data ?? [];
    return Array.from(new Set(list.map((f) => f.category).filter(Boolean))).sort() as string[];
  }, [faqsQuery.data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = faqsQuery.data ?? [];
    return list.filter((f) => {
      const matchSearch =
        !q ||
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q);
      const matchCategory =
        categoryFilter === "all" || f.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [faqsQuery.data, search, categoryFilter]);

  const handleSubmit = async (values: Partial<Faq>) => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, values });
        toast({ title: "FAQ berhasil diperbarui." });
      } else {
        await createMutation.mutateAsync(values);
        toast({
          title: "FAQ berhasil disimpan.",
          description: "Chatbot dapat langsung menggunakan FAQ ini.",
        });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      toast({
        title: "Menyimpan FAQ gagal",
        description: error instanceof Error ? error.message : "Silakan coba lagi.",
        variant: "error",
      });
    }
  };

  const handleToggleActive = async (faq: Faq) => {
    try {
      await updateMutation.mutateAsync({
        id: faq.id,
        values: { is_active: !faq.is_active },
      });
      toast({
        title: faq.is_active
          ? "FAQ dinonaktifkan."
          : "FAQ diaktifkan.",
      });
    } catch (error) {
      toast({
        title: "Gagal mengubah status FAQ",
        description: error instanceof Error ? error.message : "Silakan coba lagi.",
        variant: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.is_active) {
      toast({
        title: "FAQ aktif tidak dapat langsung dihapus",
        description: "Nonaktifkan FAQ terlebih dahulu sebelum menghapusnya.",
        variant: "error",
      });
      setDeleteTarget(null);
      return;
    }
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast({ title: "FAQ berhasil dihapus." });
    } catch (error) {
      toast({
        title: "FAQ gagal dihapus",
        description: error instanceof Error ? error.message : "Silakan coba lagi.",
        variant: "error",
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  if (faqsQuery.isLoading) return <LoadingState label="Memuat FAQ..." />;
  if (faqsQuery.isError) {
    return <ErrorState message={faqsQuery.error?.message} onRetry={() => faqsQuery.refetch()} />;
  }

  return (
    <div>
      <PageHeader
        title="FAQ & Informasi Bisnis"
        description="Kelola pertanyaan dan jawaban yang dipakai chatbot."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Tambah FAQ
          </Button>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Cari pertanyaan atau jawaban..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            className="sm:w-52"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Semua kategori</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title={search || categoryFilter !== "all" ? "Tidak ada FAQ yang cocok" : "Belum ada FAQ"}
          description={
            search || categoryFilter !== "all"
              ? "Coba ubah kata kunci atau filter."
              : "Tambahkan FAQ agar chatbot dapat menjawab pertanyaan pelanggan."
          }
          action={
            search || categoryFilter !== "all" ? undefined : (
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4" />
                Tambah FAQ
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((faq) => (
            <Card key={faq.id}>
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">{faq.question}</p>
                    {faq.is_active ? (
                      <Badge className="bg-emerald-100 text-emerald-700">Aktif</Badge>
                    ) : (
                      <Badge className="bg-slate-200 text-slate-600">Nonaktif</Badge>
                    )}
                    {faq.category ? (
                      <Badge className="bg-slate-100 text-slate-600">{faq.category}</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                    {faq.answer}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    Diperbarui {formatDate(faq.updated_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(faq)}
                  >
                    {faq.is_active ? "Nonaktifkan" : "Aktifkan"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit FAQ"
                    onClick={() => {
                      setEditing(faq);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Hapus FAQ"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => setDeleteTarget(faq)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <FaqFormDialog
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
        title={`Hapus FAQ "${deleteTarget?.question ?? ""}"?`}
        description="Tindakan ini permanen."
        confirmLabel="Ya, hapus"
      />
    </div>
  );
}