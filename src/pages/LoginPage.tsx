import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2, Bike as BikeIcon } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthProvider";
import { paths } from "../routes/paths";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { loginSchema, type LoginFormValues } from "../lib/validations";

export function LoginPage() {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  if (!loading && user) {
    const from = (location.state as { from?: { pathname: string } } | null)
      ?.from?.pathname;
    return <Navigate to={from ?? paths.dashboard} replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await signIn(values.email, values.password);
      const from = (location.state as { from?: { pathname: string } } | null)
        ?.from?.pathname;
      navigate(from ?? paths.dashboard, { replace: true });
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Terjadi kendala saat login. Silakan coba lagi."
      );
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex flex-col items-center gap-2 px-6 pb-2 pt-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900">
            <BikeIcon className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-2 text-xl font-semibold text-slate-900">
            Rental Motor Admin
          </h1>
          <p className="text-sm text-slate-500">
            Masuk untuk mengelola bisnis rental motor Anda.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 px-6 py-6" noValidate>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@contoh.com"
              {...register("email")}
            />
            {errors.email ? (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password ? (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          {formError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}
            {isSubmitting ? "Masuk..." : "Masuk"}
          </Button>
        </form>
      </Card>
    </div>
  );
}