import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/common/PasswordInput";
import { FieldError } from "@/components/common/FieldError";
import { InlineAlert } from "@/components/common/InlineAlert";
import { useRecoverVaultMutation } from "@/hooks/useVault";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { ApiError } from "@/types/api";

const recoverSchema = z.object({
  recoveryKey: z.string().min(1, "Recovery key is required"),
  newMasterPassword: z.string().min(8, "Master password must be at least 8 characters"),
  confirmMasterPassword: z.string().min(1, "Please confirm your master password"),
}).refine((data) => data.newMasterPassword === data.confirmMasterPassword, {
  message: "Passwords do not match",
  path: ["confirmMasterPassword"],
});

type RecoverFormValues = z.infer<typeof recoverSchema>;

export default function RecoverVault() {
  const navigate = useNavigate();
  const recoverMutation = useRecoverVaultMutation();
  const { logout } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoverFormValues>({
    resolver: zodResolver(recoverSchema),
    defaultValues: { recoveryKey: "", newMasterPassword: "", confirmMasterPassword: "" },
  });

  const onSubmit = (values: RecoverFormValues) => {
    setFormError(null);
    recoverMutation.mutate(
      {
        recoveryKey: values.recoveryKey,
        newMasterPassword: values.newMasterPassword,
      },
      {
        onSuccess: () => {
          toast.success("Vault recovered", { description: "Please login again with your new master password." });
          logout();
          navigate("/login", { replace: true });
        },
        onError: (error) => {
          setFormError((error as ApiError).message || "Failed to recover vault. Please check your recovery key.");
        },
      }
    );
  };

  return (
    <AuthLayout
      eyebrow="Lost Master Password?"
      title="Recover your vault"
      subtitle="Enter your recovery key and choose a new master password."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 mt-6">
        {formError && (
          <InlineAlert variant="error">{formError}</InlineAlert>
        )}

        <div className="space-y-2">
          <Label htmlFor="recoveryKey">Recovery Key</Label>
          <PasswordInput
            id="recoveryKey"
            placeholder="••••••••••••••••••••••••••••••••"
            hasError={Boolean(errors.recoveryKey)}
            className="h-12 font-mono"
            disabled={recoverMutation.isPending}
            autoFocus
            {...register("recoveryKey")}
          />
          <FieldError message={errors.recoveryKey?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newMasterPassword">New Master Password</Label>
          <PasswordInput
            id="newMasterPassword"
            hasError={Boolean(errors.newMasterPassword)}
            className="h-12"
            disabled={recoverMutation.isPending}
            {...register("newMasterPassword")}
          />
          <FieldError message={errors.newMasterPassword?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmMasterPassword">Confirm Master Password</Label>
          <PasswordInput
            id="confirmMasterPassword"
            hasError={Boolean(errors.confirmMasterPassword)}
            className="h-12"
            disabled={recoverMutation.isPending}
            {...register("confirmMasterPassword")}
          />
          <FieldError message={errors.confirmMasterPassword?.message} />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full h-12 text-base mt-2"
          isLoading={recoverMutation.isPending}
        >
          Recover Vault
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link to="/unlock" className="ui-brand-link font-medium hover:underline">
          Back to unlock vault
        </Link>
      </p>
    </AuthLayout>
  );
}
