import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldAlert } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/common/PasswordInput";
import { FieldError } from "@/components/common/FieldError";
import { InlineAlert } from "@/components/common/InlineAlert";
import { RecoveryKeyModal } from "@/components/common/RecoveryKeyModal";
import { useRegisterMutation } from "@/hooks/useAuthMutations";
import { registerSchema, type RegisterFormValues } from "@/pages/auth/register.schema";
import { cn } from "@/utils/cn";
import type { ApiError } from "@/types/api";

// ── Required field indicator ───────────────────────────────────────

function Req() {
  return (
    <span className="ml-0.5 text-red-500" aria-hidden="true">
      *
    </span>
  );
}

// ── Password strength ──────────────────────────────────────────────

type StrengthLevel = 0 | 1 | 2 | 3 | 4;

interface StrengthResult {
  level: StrengthLevel;
  label: string;
  color: string;
  textColor: string;
}

function measureStrength(password: string): StrengthResult {
  if (!password) return { level: 0, label: "", color: "bg-transparent", textColor: "" };
  let score = 0;
  if (password.length >= 10) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const level = Math.min(4, Math.ceil(score * 0.9)) as StrengthLevel;
  const map: Record<StrengthLevel, Omit<StrengthResult, "level">> = {
    0: { label: "", color: "bg-transparent", textColor: "" },
    1: { label: "Weak", color: "bg-red-500", textColor: "text-red-500" },
    2: { label: "Fair", color: "bg-orange-400", textColor: "text-orange-400" },
    3: { label: "Good", color: "bg-yellow-400", textColor: "text-yellow-500" },
    4: { label: "Strong", color: "bg-green-500", textColor: "text-green-600" },
  };
  return { level, ...map[level] };
}

function PasswordStrengthBar({ password }: { password: string }) {
  const { level, label, color, textColor } = useMemo(
    () => measureStrength(password),
    [password]
  );
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1" role="img" aria-label={`Password strength: ${label || "not rated"}`}>
        {([1, 2, 3, 4] as StrengthLevel[]).map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              level >= i ? color : "bg-border"
            )}
          />
        ))}
      </div>
      {label && (
        <p className={cn("text-xs font-medium transition-colors", textColor)} aria-live="polite">
          {label}
        </p>
      )}
    </div>
  );
}

// ── Register page ──────────────────────────────────────────────────

export default function Register() {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();
  const [formError, setFormError] = useState<string | null>(null);
  
  // Track generated recovery key for modal
  const [generatedRecoveryKey, setGeneratedRecoveryKey] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      loginPassword: "",
      masterPassword: "",
      confirmMasterPassword: "",
    },
    mode: "onTouched",
  });

  const masterPasswordValue = watch("masterPassword");

  const onSubmit = (values: RegisterFormValues) => {
    setFormError(null);
    registerMutation.mutate(
      {
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        loginPassword: values.loginPassword,
        masterPassword: values.masterPassword,
      },
      {
        onSuccess: (data) => {
          if (!data.success) {
            setFormError(
              data.message || "Registration failed. Please try again."
            );
            return;
          }
          if (data.recoveryKey) {
            setGeneratedRecoveryKey(data.recoveryKey);
            setRegisteredEmail(values.email.trim());
          } else {
            navigate("/verify-email", {
              replace: true,
              state: { email: values.email.trim() },
            });
          }
        },
        onError: (error) => {
          const apiError = error as ApiError;
          setFormError(
            apiError.message || "Registration failed. Please try again."
          );
        },
      }
    );
  };
  
  const handleRecoveryKeyConfirm = () => {
    setGeneratedRecoveryKey(null);
    navigate("/verify-email", {
      replace: true,
      state: { email: registeredEmail },
    });
  };

  return (
    <>
      <AuthLayout
        eyebrow="Get started"
        title="Create your vault"
        subtitle="Set up your account to store and manage credentials."
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 mt-6">
          {formError && <InlineAlert variant="error">{formError}</InlineAlert>}

          {/* ── Account section ───────────────────────────── */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full name<Req />
              </Label>
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="Jane Smith"
                hasError={Boolean(errors.fullName)}
                className="h-12"
                {...register("fullName")}
              />
              <FieldError message={errors.fullName?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email address<Req />
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                hasError={Boolean(errors.email)}
                className="h-12"
                {...register("email")}
              />
              <FieldError message={errors.email?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loginPassword">
                Login password<Req />
              </Label>
              <PasswordInput
                id="loginPassword"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                hasError={Boolean(errors.loginPassword)}
                className="h-12"
                {...register("loginPassword")}
              />
              <FieldError message={errors.loginPassword?.message} />
            </div>
          </div>

          {/* ── Master password section ────────────────────── */}
          <div className="rounded-2xl border border-brass/25 bg-brass-soft/5 px-5 py-6 space-y-6">
            {/* Security callout */}
            <div className="flex items-start gap-3">
              <ShieldAlert
                className="mt-0.5 size-5 shrink-0 text-brass"
                aria-hidden="true"
              />
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-brass">
                  Master password
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  This password encrypts every credential in your vault. It is never stored or sent to our servers.{" "}
                  <strong className="font-semibold text-foreground">
                    If you forget it, your data cannot be recovered.
                  </strong>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="masterPassword">
                Choose a master password<Req />
              </Label>
              <PasswordInput
                id="masterPassword"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                hasError={Boolean(errors.masterPassword)}
                className="h-12"
                aria-describedby="master-password-strength"
                {...register("masterPassword")}
              />
              <div id="master-password-strength">
                <PasswordStrengthBar password={masterPasswordValue} />
              </div>
              <FieldError message={errors.masterPassword?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmMasterPassword">
                Confirm master password<Req />
              </Label>
              <PasswordInput
                id="confirmMasterPassword"
                autoComplete="new-password"
                placeholder="Repeat your master password"
                hasError={Boolean(errors.confirmMasterPassword)}
                className="h-12"
                {...register("confirmMasterPassword")}
              />
              <FieldError message={errors.confirmMasterPassword?.message} />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-12 text-base mt-2"
            isLoading={registerMutation.isPending}
          >
            Create account
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="ui-brand-link font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </AuthLayout>
      
      {generatedRecoveryKey && (
        <RecoveryKeyModal
          open={Boolean(generatedRecoveryKey)}
          recoveryKey={generatedRecoveryKey}
          onConfirm={handleRecoveryKeyConfirm}
        />
      )}
    </>
  );
}
