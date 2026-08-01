import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Calendar, KeyRound, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/common/PasswordInput";
import { FieldError } from "@/components/common/FieldError";
import { InlineAlert } from "@/components/common/InlineAlert";
import {
  useProfile,
  useUpdateProfile,
  useChangeLoginPassword,
  useChangeMasterPassword,
} from "@/hooks/useProfile";
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

  // Full Name Form
  const updateProfileForm = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { fullName: "" },
  });

  // Update form default value when profile loads
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
  const [masterPasswordError, setMasterPasswordError] = useState<{ message: string; remainingAttempts?: number } | null>(null);
  const [lockoutUnlockedAt, setLockoutUnlockedAt] = useState<number>(() => {
    return parseInt(sessionStorage.getItem("masterPasswordLockoutUnlockedAt") || "0", 10);
  });
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  useEffect(() => {
    if (lockoutUnlockedAt > 0) {
      sessionStorage.setItem("masterPasswordLockoutUnlockedAt", lockoutUnlockedAt.toString());
      
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
      sessionStorage.removeItem("masterPasswordLockoutUnlockedAt");
      setLockoutSeconds(0);
    }
  }, [lockoutUnlockedAt]);

  const handleMasterPasswordError = (error: unknown) => {
    const apiError = error as ApiError;
    if (apiError.status === 429 && apiError.remainingSeconds) {
      setLockoutUnlockedAt(Date.now() + apiError.remainingSeconds * 1000);
      setMasterPasswordError(null);
    } else {
      setMasterPasswordError({
        message: apiError.message || "An unexpected error occurred.",
        remainingAttempts: apiError.remainingAttempts,
      });
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
                Manage your profile information and security preferences.
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

          <form onSubmit={updateProfileForm.handleSubmit(onUpdateProfile)} className="space-y-5 border-t border-border pt-6">
            <div className="max-w-md">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                hasError={Boolean(updateProfileForm.formState.errors.fullName)}
                className="mt-1.5"
                disabled={updateProfileMutation.isPending}
                {...updateProfileForm.register("fullName")}
              />
              <FieldError message={updateProfileForm.formState.errors.fullName?.message} />
            </div>
            
            <Button
              type="submit"
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
                Update the password you use to sign in to your account.
              </p>
            </div>
            
            {loginPasswordError && (
              <InlineAlert variant="error">{loginPasswordError}</InlineAlert>
            )}

            <form onSubmit={loginPasswordForm.handleSubmit(onChangeLoginPassword)} className="max-w-md space-y-5">
              <div>
                <Label htmlFor="currentPassword">Current Login Password</Label>
                <PasswordInput
                  id="currentPassword"
                  autoComplete="current-password"
                  hasError={Boolean(loginPasswordForm.formState.errors.currentPassword)}
                  className="mt-1.5"
                  disabled={changeLoginPasswordMutation.isPending}
                  {...loginPasswordForm.register("currentPassword")}
                />
                <FieldError message={loginPasswordForm.formState.errors.currentPassword?.message} />
              </div>

              <div>
                <Label htmlFor="newPassword">New Login Password</Label>
                <PasswordInput
                  id="newPassword"
                  autoComplete="new-password"
                  hasError={Boolean(loginPasswordForm.formState.errors.newPassword)}
                  className="mt-1.5"
                  disabled={changeLoginPasswordMutation.isPending}
                  {...loginPasswordForm.register("newPassword")}
                />
                <FieldError message={loginPasswordForm.formState.errors.newPassword?.message} />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <PasswordInput
                  id="confirmPassword"
                  autoComplete="new-password"
                  hasError={Boolean(loginPasswordForm.formState.errors.confirmPassword)}
                  className="mt-1.5"
                  disabled={changeLoginPasswordMutation.isPending}
                  {...loginPasswordForm.register("confirmPassword")}
                />
                <FieldError message={loginPasswordForm.formState.errors.confirmPassword?.message} />
              </div>

              <Button
                type="submit"
                variant="outline"
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
                Your master password encrypts your entire vault. Changing it will safely re-encrypt all your stored credentials.
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

            <form onSubmit={masterPasswordForm.handleSubmit(onChangeMasterPassword)} className="max-w-md space-y-5">
              <div>
                <Label htmlFor="currentMasterPassword">Current Master Password</Label>
                <PasswordInput
                  id="currentMasterPassword"
                  hasError={Boolean(masterPasswordForm.formState.errors.currentMasterPassword) || lockoutSeconds > 0}
                  className="mt-1.5"
                  disabled={changeMasterPasswordMutation.isPending || lockoutSeconds > 0}
                  {...masterPasswordForm.register("currentMasterPassword")}
                />
                <FieldError message={masterPasswordForm.formState.errors.currentMasterPassword?.message} />
              </div>

              <div>
                <Label htmlFor="newMasterPassword">New Master Password</Label>
                <PasswordInput
                  id="newMasterPassword"
                  hasError={Boolean(masterPasswordForm.formState.errors.newMasterPassword) || lockoutSeconds > 0}
                  className="mt-1.5"
                  disabled={changeMasterPasswordMutation.isPending || lockoutSeconds > 0}
                  {...masterPasswordForm.register("newMasterPassword")}
                />
                <FieldError message={masterPasswordForm.formState.errors.newMasterPassword?.message} />
              </div>

              <div>
                <Label htmlFor="confirmMasterPassword">Confirm Master Password</Label>
                <PasswordInput
                  id="confirmMasterPassword"
                  hasError={Boolean(masterPasswordForm.formState.errors.confirmMasterPassword) || lockoutSeconds > 0}
                  className="mt-1.5"
                  disabled={changeMasterPasswordMutation.isPending || lockoutSeconds > 0}
                  {...masterPasswordForm.register("confirmMasterPassword")}
                />
                <FieldError message={masterPasswordForm.formState.errors.confirmMasterPassword?.message} />
              </div>

              <Button
                type="submit"
                variant="danger"
                isLoading={changeMasterPasswordMutation.isPending}
                disabled={lockoutSeconds > 0}
              >
                {lockoutSeconds > 0 ? `Try again in ${lockoutSeconds}s` : "Update Master Password"}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
