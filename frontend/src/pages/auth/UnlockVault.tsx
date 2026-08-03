import { useState, useEffect } from "react";
import { Navigate, useLocation, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/common/PasswordInput";
import { FieldError } from "@/components/common/FieldError";
import { InlineAlert } from "@/components/common/InlineAlert";
import { useUnlockVaultMutation } from "@/hooks/useVault";
import { useAuth } from "@/hooks/useAuth";
import { vaultTokenService } from "@/services/vaultTokenService";
import type { ApiError } from "@/types/api";

const unlockSchema = z.object({
  masterPassword: z.string().min(1, "Master password is required"),
});

type UnlockFormValues = z.infer<typeof unlockSchema>;

export default function UnlockVault() {
  const navigate = useNavigate();
  const location = useLocation();
  const unlockMutation = useUnlockVaultMutation();
  const { logout } = useAuth();
  const [formError, setFormError] = useState<{ message: string; remainingAttempts?: number } | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // If vault is already unlocked, redirect to destination
  const isUnlocked = vaultTokenService.hasToken();
  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/";

  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UnlockFormValues>({
    resolver: zodResolver(unlockSchema),
    defaultValues: { masterPassword: "" },
  });

  if (isUnlocked) {
    return <Navigate to={redirectTo} replace />;
  }

  const onSubmit = (values: UnlockFormValues) => {
    setFormError(null);
    unlockMutation.mutate(values, {
      onSuccess: () => {
        navigate(redirectTo, { replace: true });
      },
      onError: (error) => {
        const apiError = error as ApiError;
        
        // 3-Attempt Policy
        const failures = vaultTokenService.recordFailure("unlock");
        if (failures >= 3) {
          logout();
          vaultTokenService.clearToken();
          return; // The auth context handles the redirect to /login
        }
        
        const remaining = 3 - failures;

        if (apiError.status === 429 && apiError.remainingSeconds) {
          setLockoutSeconds(apiError.remainingSeconds);
          setFormError(null);
        } else {
          setFormError({
            message: "Invalid master password.",
            remainingAttempts: remaining,
          });
        }
      },
    });
  };

  return (
    <AuthLayout
      eyebrow="Authentication Required"
      title="Unlock your vault"
      subtitle="Enter your master password to unlock the vault."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 mt-6">
        {lockoutSeconds > 0 ? (
          <InlineAlert variant="error">
            Too many failed attempts. Try again in {lockoutSeconds} seconds.
          </InlineAlert>
        ) : formError ? (
          <InlineAlert variant="error">
            {formError.message}
            {typeof formError.remainingAttempts === "number" && (
              <span className="ml-1 font-semibold">{formError.remainingAttempts} attempt{formError.remainingAttempts === 1 ? "" : "s"} remaining.</span>
            )}
          </InlineAlert>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="masterPassword">Master Password</Label>
          <PasswordInput
            id="masterPassword"
            autoComplete="current-password"
            placeholder="••••••••"
            hasError={Boolean(errors.masterPassword) || lockoutSeconds > 0}
            className="h-12"
            disabled={unlockMutation.isPending || lockoutSeconds > 0}
            autoFocus
            {...register("masterPassword")}
          />
          <FieldError message={errors.masterPassword?.message} />
        </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-12 text-base mt-2"
            isLoading={unlockMutation.isPending}
            disabled={lockoutSeconds > 0}
          >
          {lockoutSeconds > 0 ? `Try again in ${lockoutSeconds}s` : "Unlock Vault"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Forgot your master password?{" "}
        <Link to="/recover" className="ui-brand-link font-medium hover:underline">
          Recover vault
        </Link>
      </p>
    </AuthLayout>
  );
}
