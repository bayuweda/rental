import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Dialog } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input, Textarea } from "../ui/input";
import { Label } from "../ui/label";
import { Select } from "../ui/select";
import { ImageUpload } from "./ImageUpload";
import {
  motorcycleSchema,
  type MotorcycleFormValues,
} from "../../lib/validations";
import { MOTORCYCLE_STATUSES, MOTORCYCLE_STATUS_META } from "../../lib/constants";
import type { Motorcycle } from "../../types";

export interface MotorcycleFormInput {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<Motorcycle>) => Promise<void>;
  initial?: Motorcycle | null;
  submitLabel?: string;
}

function toFormValues(motor: Motorcycle | null | undefined): MotorcycleFormValues {
  return {
    name: motor?.name ?? "",
    brand: motor?.brand ?? "",
    type: motor?.type ?? "",
    year: motor?.year ? String(motor.year) : "",
    license_plate: motor?.license_plate ?? "",
    price_per_day:
      typeof motor?.price_per_day === "number"
        ? motor.price_per_day
        : 0,
    status: motor?.status ?? "available",
    description: motor?.description ?? "",
    image_url: motor?.image_url ?? "",
  };
}

export function MotorcycleFormDialog({
  open,
  onClose,
  onSubmit,
  initial,
  submitLabel = "Simpan",
}: MotorcycleFormInput) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MotorcycleFormValues>({
    resolver: zodResolver(motorcycleSchema),
    defaultValues: toFormValues(initial),
  });

  const imageUrl = watch("image_url");

  useEffect(() => {
    if (open) reset(toFormValues(initial));
  }, [open, initial, reset]);

  const onFormSubmit = handleSubmit(async (values) => {
    const payload: Partial<Motorcycle> = {
      name: values.name,
      brand: values.brand || null,
      type: values.type || null,
      year: values.year ? Number(values.year) : null,
      license_plate: values.license_plate || null,
      price_per_day: values.price_per_day,
      status: values.status,
      description: values.description || null,
      image_url: values.image_url || null,
    };
    await onSubmit(payload);
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={initial ? "Edit Motor" : "Tambah Motor"}
      description="Data ini digunakan bersama oleh dashboard dan chatbot."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            type="submit"
            form="motorcycle-form"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            {isSubmitting ? "Menyimpan..." : submitLabel}
          </Button>
        </>
      }
    >
      <form
        id="motorcycle-form"
        onSubmit={onFormSubmit}
        className="space-y-4"
        noValidate
      >
        <div>
          <Label htmlFor="name">Nama Motor *</Label>
          <Input
            id="name"
            placeholder="Honda Vario 125"
            {...register("name")}
          />
          {errors.name ? (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="brand">Merek</Label>
            <Input id="brand" placeholder="Honda" {...register("brand")} />
            {errors.brand ? (
              <p className="mt-1 text-xs text-red-600">{errors.brand.message}</p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="type">Tipe</Label>
            <Input id="type" placeholder="Skuter" {...register("type")} />
            {errors.type ? (
              <p className="mt-1 text-xs text-red-600">{errors.type.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="year">Tahun</Label>
            <Input
              id="year"
              type="text"
              inputMode="numeric"
              placeholder="2024"
              {...register("year")}
            />
            {errors.year ? (
              <p className="mt-1 text-xs text-red-600">{errors.year.message}</p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="license_plate">Plat Nomor</Label>
            <Input
              id="license_plate"
              placeholder="B 1234 ABC"
              {...register("license_plate")}
            />
            {errors.license_plate ? (
              <p className="mt-1 text-xs text-red-600">
                {errors.license_plate.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price_per_day">Harga per Hari (Rp) *</Label>
            <Input
              id="price_per_day"
              type="number"
              min={0}
              step="any"
              {...register("price_per_day", { valueAsNumber: true })}
            />
            {errors.price_per_day ? (
              <p className="mt-1 text-xs text-red-600">
                {errors.price_per_day.message}
              </p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select id="status" {...register("status")}>
              {MOTORCYCLE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {MOTORCYCLE_STATUS_META[status].label}
                </option>
              ))}
            </Select>
            {errors.status ? (
              <p className="mt-1 text-xs text-red-600">{errors.status.message}</p>
            ) : null}
          </div>
        </div>

        <div>
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            placeholder="Catatan kondisi motor, fitur, dll."
            {...register("description")}
          />
          {errors.description ? (
            <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
          ) : null}
        </div>

        <div>
          <Label>Gambar Motor</Label>
          <ImageUpload
            value={imageUrl || null}
            onChange={(url) => setValue("image_url", url || "", { shouldValidate: true })}
            disabled={isSubmitting}
          />
          <details className="mt-2">
            <summary className="cursor-pointer text-xs text-slate-500">
              Atau masukkan URL manual
            </summary>
            <Input
              id="image_url"
              type="text"
              placeholder="https://cdn.example.com/motor.jpg"
              className="mt-2"
              {...register("image_url")}
            />
          </details>
          {errors.image_url ? (
            <p className="mt-1 text-xs text-red-600">{errors.image_url.message}</p>
          ) : null}
        </div>
      </form>
    </Dialog>
  );
}
