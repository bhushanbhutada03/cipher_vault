import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/common/FieldError";
import { InlineAlert } from "@/components/common/InlineAlert";
import {
  useVerifyRegistrationEmailMutation,
  useResendRegistrationOtpMutation,
} from "@/hooks/useAuthMutations";
import {
  verifyEmailSchema,
  type VerifyEmailFormValues,
} from "@/pages/auth/verifyEmail.schema";
import type { ApiError } from "@/types/api";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = (location.state as { email?: string })?.email;

  useEffect(() => {
    if (!email) {
      navigate("/login", { replace: true });
    }
  }, [email, navigate]);

  const [formError, setFormError] = useState<{ message: string; remainingAttempts?: number } | null>(null);

  const [lockoutUnlockedAt, setLockoutUnlockedAt] = useState<number>(() => {
    return parseInt(sessionStorage.getItem("verifyEmailLockoutUnlockedAt") || "0", 10);
  });
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  const [resendUnlockedAt, setResendUnlockedAt] = useState<number>(() => {
    return parseInt(sessionStorage.getItem("verifyEmailResendUnlockedAt") || "0", 10);
  });
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (resendUnlockedAt > 0) {
      sessionStorage.setItem("verifyEmailResendUnlockedAt", resendUnlockedAt.toString());
      
      const updateCountdown = () => {
        const remaining = Math.ceil((resendUnlockedAt - Date.now()) / 1000);
        if (remaining <= 0) {
          setResendCountdown(0);
        } else {
          setResendCountdown(remaining);
        }
      };
      
      updateCountdown();
      const timer = setInterval(updateCountdown, 1000);
      return () => clearInterval(timer);
    } else {
      sessionStorage.removeItem("verifyEmailResendUnlockedAt");
      setResendCountdown(0);
    }
  }, [resendUnlockedAt]);

  useEffect(() => {
    if (lockoutUnlockedAt > 0) {
      sessionStorage.setItem("verifyEmailLockoutUnlockedAt", lockoutUnlockedAt.toString());
      
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
      sessionStorage.removeItem("verifyEmailLockoutUnlockedAt");
      setLockoutSeconds(0);
    }
  }, [lockoutUnlockedAt]);

  const verifyOtpMutation = useVerifyRegistrationEmailMutation();
  const resendOtpMutation = useResendRegistrationOtpMutation();

  const verifyOtpForm = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { otp: "" },
  });

  const handleApiError = (error: unknown) => {
    const apiError = error as ApiError;
    if (apiError.status === 429 && apiError.remainingSeconds) {
      setLockoutUnlockedAt(Date.now() + apiError.remainingSeconds * 1000);
      setFormError(null);
    } else {
      setFormError({
        message: apiError.message || "An unexpected error occurred. Please try again.",
        remainingAttempts: apiError.remainingAttempts,
      });
    }
  };

  const onResendOtp = () => {
    if (!email) return;
    setFormError(null);
    resendOtpMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setFormError(null);
          verifyOtpForm.reset();
          setResendUnlockedAt(Date.now() + 60000);
          toast.success("Code sent", { description: "A new verification code has been sent." });
        },
        onError: handleApiError,
      }
    );
  };

  const onVerifyOtp = (values: VerifyEmailFormValues) => {
    if (!email) return;
    setFormError(null);
    verifyOtpMutation.mutate(
      { email, otp: values.otp },
      {
        onSuccess: () => {
          setFormError(null);
          setResendUnlockedAt(0); // Clear countdown when verified
          sessionStorage.removeItem("verifyEmailResendUnlockedAt");
          sessionStorage.removeItem("verifyEmailLockoutUnlockedAt");
          toast.success("Email verified", { description: "You can now log in." });
          navigate("/login", { replace: true, state: { verificationSuccess: true } });
        },
        onError: handleApiError,
      }
    );
  };

  if (!email) {
    return null;
  }

  return (
    <AuthLayout
      eyebrow="Account Verification"
      title="Verify your email"
      subtitle={`Enter the 6-digit code sent to ${email}.`}
    >
      {lockoutSeconds > 0 ? (
        <div className="mb-5">
          <InlineAlert variant="error">
            Too many attempts. Try again in {lockoutSeconds} seconds.
          </InlineAlert>
        </div>
      ) : formError ? (
        <div className="mb-5">
          <InlineAlert variant="error">
            {formError.message}
            {typeof formError.remainingAttempts === "number" && (
              <span className="ml-1 font-semibold">
                {formError.remainingAttempts} attempt{formError.remainingAttempts === 1 ? "" : "s"} remaining.
              </span>
            )}
          </InlineAlert>
        </div>
      ) : null}

      <form onSubmit={verifyOtpForm.handleSubmit(onVerifyOtp)} noValidate className="space-y-6 mt-6">
        <div className="space-y-2">
          <Label htmlFor="otp">Verification Code</Label>
          <Input
            id="otp"
            type="text"
            autoComplete="one-time-code"
            placeholder="123456"
            maxLength={6}
            autoFocus
            hasError={Boolean(verifyOtpForm.formState.errors.otp) || lockoutSeconds > 0}
            className="h-12 text-center tracking-widest text-lg font-mono"
            disabled={verifyOtpMutation.isPending || lockoutSeconds > 0}
            {...verifyOtpForm.register("otp")}
          />
          <FieldError message={verifyOtpForm.formState.errors.otp?.message} />
        </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-12 text-base mt-2"
            isLoading={verifyOtpMutation.isPending}
            disabled={lockoutSeconds > 0}
          >
          {lockoutSeconds > 0 ? `Try again in ${lockoutSeconds}s` : "Verify Code"}
        </Button>

        <div className="flex flex-col space-y-4 mt-6 items-center">
          <div className="text-sm text-muted-foreground flex items-center justify-center space-x-2">
            <span>Didn&apos;t receive a code?</span>
            <button
              type="button"
              className="ui-brand-link font-medium hover:underline disabled:opacity-50 disabled:hover:no-underline"
              onClick={onResendOtp}
              disabled={resendCountdown > 0 || lockoutSeconds > 0 || resendOtpMutation.isPending}
            >
              {lockoutSeconds > 0 
                ? "Locked" 
                : resendCountdown > 0 
                  ? `Resend in ${resendCountdown}s` 
                  : "Resend Code"}
            </button>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
