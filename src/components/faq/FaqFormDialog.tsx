import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Dialog } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input, Textarea } from "../ui/input";
import { Label } from "../ui/label";
import { faqSchema, type FaqFormValues } from "../../lib/validations";
import type { Faq } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<Faq>) => Promise<void>;
  initial?: Faq | null;
}

function toFormValues(faq: Faq | null | undefined): FaqFormValues {
  return {
    question: faq?.question ?? "",
    answer: faq?.answer ?? "",
    category: faq?.category ?? "",
    is_active: faq?.is_active ?? true,
  };
}

export function FaqFormDialog({ open, onClose, onSubmit, initial }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FaqFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: toFormValues(null),
  });

  useEffect(() => {
    if (open) reset(toFormValues(initial));
  }, [open, initial, reset]);

  const onFormSubmit = handleSubmit(async (values) => {
    await onSubmit({
      question: values.question,
      answer: values.answer,
      category: values.category || null,
      is_active: values.is_active,
    });
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={initial ? "Edit FAQ" : "Tambah FAQ"}
      description="FAQ ini akan digunakan sebagai sumber informasi untuk chatbot."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            type="submit"
            form="faq-form"
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
      <form id="faq-form" onSubmit={onFormSubmit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="question">Pertanyaan *</Label>
          <Input id="question" placeholder="Berapa tarif sewa per hari?" {...register("question")} />
          {errors.question ? (
            <p className="mt-1 text-xs text-red-600">{errors.question.message}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="answer">Jawaban *</Label>
          <Textarea
            id="answer"
            placeholder="Jawaban yang akan diberikan chatbot..."
            className="min-h-[120px]"
            {...register("answer")}
          />
          {errors.answer ? (
            <p className="mt-1 text-xs text-red-600">{errors.answer.message}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="category">Kategori</Label>
            <Input id="category" placeholder="Umum, Harga, Prosedur..." {...register("category")} />
            {errors.category ? (
              <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>
            ) : null}
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
                Aktif (dapat dibaca chatbot)
              </label>
            </div>
          </div>
        </div>
      </form>
    </Dialog>
  );
}