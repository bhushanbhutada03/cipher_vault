import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Calendar, KeyRound, ShieldAlert, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/common/PasswordInput";
import { FieldError } from "@/components/common/FieldError";
import { InlineAlert } from "@/components/common/InlineAlert";
import { MasterPasswordDialog } from "@/components/common/MasterPasswordDialog";
import { ExportConfirmationDialog } from "@/components/common/ExportConfirmationDialog";
import { RecoveryKeyModal } from "@/components/common/RecoveryKeyModal";
import {
  useProfile,
  useUpdateProfile,
  useChangeLoginPassword,
  useChangeMasterPassword,
} from "@/hooks/useProfile";
import {
  useExportCsvMutation,
  useRegenerateRecoveryKeyMutation,
  useUnlockVaultMutation,
} from "@/hooks/useVault";
import { useCredentials } from "@/hooks/useCredentials";
import { useCategories } from "@/hooks/useCategories";
import {
  updateProfileSchema,
  changeLoginPasswordSchema,
  changeMasterPasswordSchema,
  type UpdateProfileFormValues,
  type ChangeLoginPasswordFormValues,
  type ChangeMasterPasswordFormValues,
} from "./profile.schema";
import type { ApiError } from "@/types/api";

export default function Profile() {
  const { data: profile, isPending: isProfilePending, error: profileError } = useProfile();
  
  const updateProfileMutation = useUpdateProfile();
  const changeLoginPasswordMutation = useChangeLoginPassword();
  const changeMasterPasswordMutation = useChangeMasterPassword();
  const exportCsvMutation = useExportCsvMutation();
  const regenerateRecoveryKeyMutation = useRegenerateRecoveryKeyMutation();
  
  const { data: credentials } = useCredentials();
  const { data: categories } = useCategories();

  // Full Name Form
  const updateProfileForm = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { fullName: "" },
  });

  useEffect(() => {
    if (profile?.fullName) {
      updateProfileForm.reset({ fullName: profile.fullName });
    }
  }, [profile, updateProfileForm]);

  // Login Password Form
  const loginPasswordForm = useForm<ChangeLoginPasswordFormValues>({
    resolver: zodResolver(changeLoginPasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  const [loginPasswordError, setLoginPasswordError] = useState<string | null>(null);

  // Master Password Form
  const masterPasswordForm = useForm<ChangeMasterPasswordFormValues>({
    resolver: zodResolver(changeMasterPasswordSchema),
    defaultValues: { currentMasterPassword: "", newMasterPassword: "", confirmMasterPassword: "" },
  });
  const [masterPasswordError, setMasterPasswordError] = useState<ApiError | null>(null);
  
  const [lockoutUnlockedAt, setLockoutUnlockedAt] = useState<number>(() => {
    return parseInt(sessionStorage.getItem("masterPasswordLockoutUnlockedAt_change_master") || "0", 10);
  });
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Export State
  const [isExportAuthDialogOpen, setIsExportAuthDialogOpen] = useState(false);
  const [isExportConfirmDialogOpen, setIsExportConfirmDialogOpen] = useState(false);

  // Recovery Key State
  const [isRecoveryDialogOpen, setIsRecoveryDialogOpen] = useState(false);
  const [newRecoveryKey, setNewRecoveryKey] = useState<string | null>(null);

  useEffect(() => {
    if (lockoutUnlockedAt > 0) {
      sessionStorage.setItem("masterPasswordLockoutUnlockedAt_change_master", lockoutUnlockedAt.toString());
      
      const updateLockout = () => {
        const remaining = Math.ceil((lockoutUnlockedAt - Date.now()) / 1000);
        if (remaining <= 0) {
          setLockoutSeconds(0);
        } else {
          setLockoutSeconds(remaining);
        }
      };
      
      updateLockout();
      const timer = setInterval(updateLockout, 1000);
      return () => clearInterval(timer);
    } else {
      sessionStorage.removeItem("masterPasswordLockoutUnlockedAt_change_master");
      setLockoutSeconds(0);
    }
  }, [lockoutUnlockedAt]);

  const handleMasterPasswordError = (error: unknown) => {
    const apiError = error as ApiError;
    if (apiError.status === 429 && apiError.remainingSeconds) {
      setLockoutUnlockedAt(Date.now() + apiError.remainingSeconds * 1000);
      setMasterPasswordError(null);
    } else {
      setMasterPasswordError(apiError);
    }
  };

  const onUpdateProfile = (values: UpdateProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };

  const onChangeLoginPassword = (values: ChangeLoginPasswordFormValues) => {
    setLoginPasswordError(null);
    changeLoginPasswordMutation.mutate(values, {
      onSuccess: () => {
        loginPasswordForm.reset();
      },
      onError: (error) => {
        setLoginPasswordError((error as ApiError).message || "An unexpected error occurred.");
      },
    });
  };

  const onChangeMasterPassword = (values: ChangeMasterPasswordFormValues) => {
    setMasterPasswordError(null);
    changeMasterPasswordMutation.mutate(values, {
      onSuccess: () => {
        masterPasswordForm.reset();
        setLockoutUnlockedAt(0);
      },
      onError: handleMasterPasswordError,
    });
  };

  const unlockVaultMutation = useUnlockVaultMutation();
  
  const handleExportConfirm = () => {
    setIsExportConfirmDialogOpen(false);
    setIsExportAuthDialogOpen(true);
  };

  const handleExportAuthSubmit = (password: string) => {
    unlockVaultMutation.mutate(
      { masterPassword: password },
      {
        onSuccess: () => {
          setIsExportAuthDialogOpen(false);
          executeExport();
        },
        onError: handleMasterPasswordError,
      }
    );
  };

  const executeExport = () => {
    exportCsvMutation.mutate(undefined, {
      onSuccess: (csvData) => {
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "credentials.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setIsExportConfirmDialogOpen(false);
        toast.success("Vault exported successfully", { description: "CSV downloaded securely." });
      },
      onError: (error) => {
        setIsExportConfirmDialogOpen(false);
        toast.error("Export failed", { description: (error as ApiError).message || "Please try again." });
      }
    });
  };

  // Regenerate Recovery Key Flow
  const handleRegenerateRecoveryKey = (password: string) => {
    regenerateRecoveryKeyMutation.mutate(
      { masterPassword: password },
      {
        onSuccess: (data) => {
          setNewRecoveryKey(data.recoveryKey);
          setIsRecoveryDialogOpen(false);
          toast.success("Recovery Key generated", { description: "Your new key is ready to be saved." });
        },
      }
    );
  };

  if (isProfilePending) {
    return (
      <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl flex h-40 animate-pulse items-center justify-center rounded-2xl bg-surface" />
      </main>
    );
  }

  if (profileError || !profile) {
    return (
      <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <InlineAlert variant="error">Failed to load profile data.</InlineAlert>
        </div>
      </main>
    );
  }

  const memberSince = new Date(profile.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <>
      <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
          {/* Header */}
          <section className="rounded-2xl border border-border bg-surface px-5 py-6 shadow-sm sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-brass-soft text-brass">
                <User className="size-6" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Account Settings
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage your profile and security settings.
                </p>
              </div>
            </div>
          </section>

          {/* Profile Information */}
          <section className="rounded-2xl border border-border bg-surface px-5 py-6 shadow-sm sm:px-8">
            <h2 className="mb-6 font-display text-xl font-medium text-foreground">Profile Information</h2>
            
            <div className="mb-8 grid gap-6 sm:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Email Address</Label>
                <div className="mt-1.5 flex items-center gap-2 rounded-md border border-border-strong bg-surface-elevated px-3.5 py-2.5 text-sm">
                  <Mail className="size-4 text-muted-foreground" />
                  <span className="truncate text-foreground/80">{profile.email}</span>
                </div>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Member Since</Label>
                <div className="mt-1.5 flex items-center gap-2 rounded-md border border-border-strong bg-surface-elevated px-3.5 py-2.5 text-sm">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span className="truncate text-foreground/80">{memberSince}</span>
                </div>
              </div>
            </div>

            <form onSubmit={updateProfileForm.handleSubmit(onUpdateProfile)} className="space-y-6 border-t border-border pt-6">
              <div className="max-w-md space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  hasError={Boolean(updateProfileForm.formState.errors.fullName)}
                  className="h-12"
                  disabled={updateProfileMutation.isPending}
                  {...updateProfileForm.register("fullName")}
                />
                <FieldError message={updateProfileForm.formState.errors.fullName?.message} />
              </div>
              
              <Button
                type="submit"
                className="h-12 sm:min-w-[120px] text-base"
                isLoading={updateProfileMutation.isPending}
              >
                Save Changes
              </Button>
            </form>
          </section>

          {/* Security Section */}
          <section className="rounded-2xl border border-border bg-surface px-5 py-6 shadow-sm sm:px-8">
            <div className="mb-6 flex items-center gap-2">
              <ShieldAlert className="size-5 text-brass" />
              <h2 className="font-display text-xl font-medium text-foreground">Security</h2>
            </div>

            {/* Change Login Password */}
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-medium text-foreground">Change Login Password</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Update the password you use to sign in.
                </p>
              </div>
              
              {loginPasswordError && (
                <InlineAlert variant="error">{loginPasswordError}</InlineAlert>
              )}

              <form onSubmit={loginPasswordForm.handleSubmit(onChangeLoginPassword)} className="max-w-md space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Login Password</Label>
                  <PasswordInput
                    id="currentPassword"
                    autoComplete="current-password"
                    hasError={Boolean(loginPasswordForm.formState.errors.currentPassword)}
                    className="h-12"
                    disabled={changeLoginPasswordMutation.isPending}
                    {...loginPasswordForm.register("currentPassword")}
                  />
                  <FieldError message={loginPasswordForm.formState.errors.currentPassword?.message} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Login Password</Label>
                  <PasswordInput
                    id="newPassword"
                    autoComplete="new-password"
                    hasError={Boolean(loginPasswordForm.formState.errors.newPassword)}
                    className="h-12"
                    disabled={changeLoginPasswordMutation.isPending}
                    {...loginPasswordForm.register("newPassword")}
                  />
                  <FieldError message={loginPasswordForm.formState.errors.newPassword?.message} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <PasswordInput
                    id="confirmPassword"
                    autoComplete="new-password"
                    hasError={Boolean(loginPasswordForm.formState.errors.confirmPassword)}
                    className="h-12"
                    disabled={changeLoginPasswordMutation.isPending}
                    {...loginPasswordForm.register("confirmPassword")}
                  />
                  <FieldError message={loginPasswordForm.formState.errors.confirmPassword?.message} />
                </div>

                <Button
                  type="submit"
                  variant="default"
                  className="h-12 sm:min-w-[120px] text-base"
                  isLoading={changeLoginPasswordMutation.isPending}
                >
                  Update Login Password
                </Button>
              </form>
            </div>

            <hr className="my-8 border-border" />

            {/* Change Master Password */}
            <div className="space-y-6">
              <div>
                <h3 className="flex items-center gap-2 text-base font-medium text-danger-hover">
                  <KeyRound className="size-4" />
                  Change Master Password
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Changing your master password re-encrypts the vault.
                </p>
              </div>

              {lockoutSeconds > 0 ? (
                <InlineAlert variant="error">
                  Too many attempts. Try again in {lockoutSeconds} seconds.
                </InlineAlert>
              ) : masterPasswordError ? (
                <InlineAlert variant="error">
                  {masterPasswordError.message}
                  {typeof masterPasswordError.remainingAttempts === "number" && (
                    <span className="ml-1 font-semibold">
                      {masterPasswordError.remainingAttempts} attempt{masterPasswordError.remainingAttempts === 1 ? "" : "s"} remaining.
                    </span>
                  )}
                </InlineAlert>
              ) : null}

              <form onSubmit={masterPasswordForm.handleSubmit(onChangeMasterPassword)} className="max-w-md space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentMasterPassword">Current Master Password</Label>
                  <PasswordInput
                    id="currentMasterPassword"
                    hasError={Boolean(masterPasswordForm.formState.errors.currentMasterPassword) || lockoutSeconds > 0}
                    className="h-12"
                    disabled={changeMasterPasswordMutation.isPending || lockoutSeconds > 0}
                    {...masterPasswordForm.register("currentMasterPassword")}
                  />
                  <FieldError message={masterPasswordForm.formState.errors.currentMasterPassword?.message} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newMasterPassword">New Master Password</Label>
                  <PasswordInput
                    id="newMasterPassword"
                    hasError={Boolean(masterPasswordForm.formState.errors.newMasterPassword) || lockoutSeconds > 0}
                    className="h-12"
                    disabled={changeMasterPasswordMutation.isPending || lockoutSeconds > 0}
                    {...masterPasswordForm.register("newMasterPassword")}
                  />
                  <FieldError message={masterPasswordForm.formState.errors.newMasterPassword?.message} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmMasterPassword">Confirm Master Password</Label>
                  <PasswordInput
                    id="confirmMasterPassword"
                    hasError={Boolean(masterPasswordForm.formState.errors.confirmMasterPassword) || lockoutSeconds > 0}
                    className="h-12"
                    disabled={changeMasterPasswordMutation.isPending || lockoutSeconds > 0}
                    {...masterPasswordForm.register("confirmMasterPassword")}
                  />
                  <FieldError message={masterPasswordForm.formState.errors.confirmMasterPassword?.message} />
                </div>

                <Button
                  type="submit"
                  variant="destructive"
                  className="h-12 sm:min-w-[120px] text-base"
                  isLoading={changeMasterPasswordMutation.isPending}
                  disabled={lockoutSeconds > 0}
                >
                  {lockoutSeconds > 0 ? `Try again in ${lockoutSeconds}s` : "Update Master Password"}
                </Button>
              </form>
            </div>
          </section>

          {/* Vault Management Section */}
          <section className="rounded-2xl border border-border bg-surface px-5 py-6 shadow-sm sm:px-8 mb-10">
            <h2 className="mb-6 font-display text-xl font-medium text-foreground">Vault Management</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-base font-medium text-foreground flex items-center gap-2">
                  <Download className="size-4 text-brass" />
                  Export Credentials
                </h3>
                <p className="mt-1 text-sm text-muted-foreground mb-4">
                  Download a CSV file containing all your stored credentials. Keep this file secure as it contains unencrypted passwords.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsExportConfirmDialogOpen(true)}
                  isLoading={exportCsvMutation.isPending}
                >
                  Export CSV
                </Button>
              </div>

              <hr className="border-border" />

              <div>
                <h3 className="text-base font-medium text-foreground flex items-center gap-2">
                  <RefreshCw className="size-4 text-danger-hover" />
                  Regenerate Recovery Key
                </h3>
                <p className="mt-1 text-sm text-muted-foreground mb-4">
                  If you lost your recovery key, you can generate a new one. This will invalidate your old recovery key.
                </p>
                <Button
                  variant="outline"
                  className="text-danger-hover border-danger-hover hover:bg-danger-hover/10"
                  onClick={() => setIsRecoveryDialogOpen(true)}
                >
                  Regenerate Recovery Key
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Export Auth */}
      <MasterPasswordDialog
        open={isExportAuthDialogOpen}
        onOpenChange={setIsExportAuthDialogOpen}
        title="Authentication Required"
        description="Please enter your master password to authorize the export."
        submitLabel="Continue"
        isSubmitting={unlockVaultMutation.isPending}
        error={masterPasswordError || unlockVaultMutation.error}
        onSubmit={handleExportAuthSubmit}
        actionScope="export"
      />

      {/* Export Confirm */}
      <ExportConfirmationDialog
        open={isExportConfirmDialogOpen}
        onOpenChange={setIsExportConfirmDialogOpen}
        onConfirm={handleExportConfirm}
        isExporting={exportCsvMutation.isPending}
        credentialCount={credentials?.length || 0}
        categoryCount={categories?.length || 0}
      />

      {/* Recovery Key Auth */}
      <MasterPasswordDialog
        open={isRecoveryDialogOpen}
        onOpenChange={setIsRecoveryDialogOpen}
        title="Authentication Required"
        description="Please enter your master password to regenerate your recovery key."
        submitLabel="Regenerate Key"
        isSubmitting={regenerateRecoveryKeyMutation.isPending}
        error={regenerateRecoveryKeyMutation.error}
        onReset={regenerateRecoveryKeyMutation.reset}
        onSubmit={handleRegenerateRecoveryKey}
        actionScope="recovery_key"
      />

      {/* Generated Recovery Key Modal */}
      {newRecoveryKey && (
        <RecoveryKeyModal
          open={Boolean(newRecoveryKey)}
          recoveryKey={newRecoveryKey}
          onConfirm={() => setNewRecoveryKey(null)}
        />
      )}
    </>
  );
}
