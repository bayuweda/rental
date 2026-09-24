import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { Dialog } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { customerSchema, type CustomerFormValues } from "../../lib/validations";
import type { Customer } from "../../types";

export interface CustomerFormInput {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<Customer>) => Promise<void>;
  initial?: Customer | null;
}

function toFormValues(customer: Customer | null | undefined): CustomerFormValues {
  return {
    name: customer?.name ?? "",
    phone: customer?.phone ?? "",
    whatsapp_number: customer?.whatsapp_number ?? "",
    telegram_chat_id: customer?.telegram_chat_id
      ? String(customer.telegram_chat_id)
      : "",
  };
}

export function CustomerFormDialog({
  open,
  onClose,
  onSubmit,
  initial,
}: CustomerFormInput) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: toFormValues(initial),
  });

  useEffect(() => {
    if (open) reset(toFormValues(initial));
  }, [open, initial, reset]);

  const onFormSubmit = handleSubmit(async (values) => {
    const payload: Partial<Customer> = {
      name: values.name,
      phone: values.phone || null,
      whatsapp_number: values.whatsapp_number || null,
      telegram_chat_id:
        values.telegram_chat_id && values.telegram_chat_id.trim() !== ""
          ? Number(values.telegram_chat_id)
          : null,
    };
    await onSubmit(payload);
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={initial ? "Edit Customer" : "Tambah Customer"}
      description="Identitas customer juga digunakan oleh chatbot Telegram."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            type="submit"
            form="customer-form"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </>
      }
    >
      <form id="customer-form" onSubmit={onFormSubmit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="name">Nama *</Label>
          <Input
            id="name"
            placeholder="Nama customer"
            {...register("name")}
          />
          {errors.name ? (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="phone">Nomor Telepon</Label>
            <Input id="phone" placeholder="081234567890" {...register("phone")} />
            {errors.phone ? (
              <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="whatsapp_number">Nomor WhatsApp</Label>
            <Input
              id="whatsapp_number"
              placeholder="081234567890"
              {...register("whatsapp_number")}
            />
            {errors.whatsapp_number ? (
              <p className="mt-1 text-xs text-red-600">
                {errors.whatsapp_number.message}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <Label htmlFor="telegram_chat_id">Telegram Chat ID</Label>
          <Input
            id="telegram_chat_id"
            inputMode="numeric"
            placeholder="123456789"
            {...register("telegram_chat_id")}
          />
          {errors.telegram_chat_id ? (
            <p className="mt-1 text-xs text-red-600">
              {errors.telegram_chat_id.message}
            </p>
          ) : null}
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
            <Send className="h-3 w-3" />
            Data teknis untuk menghubungkan customer dengan chat Telegram-nya.
          </p>
        </div>
      </form>
    </Dialog>
  );
}