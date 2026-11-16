import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Dialog } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input, Textarea } from "../ui/input";
import { Label } from "../ui/label";
import { Select } from "../ui/select";
import { addonSchema, type AddonFormValues } from "../../lib/validations";
import type { Addon } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<Addon>) => Promise<void>;
  initial?: Addon | null;
}

function toFormValues(addon: Addon | null | undefined): AddonFormValues {
  return {
    name: addon?.name ?? "",
    description: addon?.description ?? "",
    price: Number(addon?.price ?? 0),
    price_type: addon?.price_type ?? "per_day",
    stock: addon?.stock != null ? String(addon.stock) : "",
    is_active: addon?.is_active ?? true,
  };
}

export function AddonFormDialog({ open, onClose, onSubmit, initial }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddonFormValues>({
    resolver: zodResolver(addonSchema),
    defaultValues: toFormValues(null),
  });

  useEffect(() => {
    if (open) reset(toFormValues(initial));
  }, [open, initial, reset]);

  const onFormSubmit = handleSubmit(async (values) => {
    await onSubmit({
      name: values.name,
      description: values.description || null,
      price: values.price,
      price_type: values.price_type,
      stock: values.stock === "" || values.stock == null ? null : Number(values.stock),
      is_active: values.is_active,
    });
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={initial ? "Edit Add-on" : "Tambah Add-on"}
      description="Add-on tambahan yang dapat dipilih saat booking."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            type="submit"
            form="addon-form"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </>
      }
    >
      <form id="addon-form" onSubmit={onFormSubmit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="name">Nama add-on *</Label>
          <Input id="name" placeholder="Contoh: Helm, Jas hujan" {...register("name")} />
          {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name.message}</p> : null}
        </div>

        <div>
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            placeholder="Deskripsi singkat add-on..."
            {...register("description")}
          />
          {errors.description ? (
            <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="price">Harga *</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="1000"
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price ? <p className="mt-1 text-xs text-red-600">{errors.price.message}</p> : null}
          </div>
          <div>
            <Label htmlFor="price_type">Tipe harga *</Label>
            <Select id="price_type" {...register("price_type")}>
              <option value="per_day">Per hari</option>
              <option value="flat">Flat (sekali)</option>
            </Select>
            {errors.price_type ? (
              <p className="mt-1 text-xs text-red-600">{errors.price_type.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="stock">Stok (opsional)</Label>
            <Input id="stock" type="number" min="0" step="1" placeholder="Kosong = tidak terbatas" {...register("stock")} />
            {errors.stock ? <p className="mt-1 text-xs text-red-600">{errors.stock.message}</p> : null}
          </div>
          <div>
            <Label htmlFor="is_active">Status</Label>
            <div className="flex h-9 items-center gap-2">
              <input
                id="is_active"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                {...register("is_active")}
              />
              <label htmlFor="is_active" className="text-sm text-slate-700">
                Aktif (dapat dipilih)
              </label>
            </div>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
