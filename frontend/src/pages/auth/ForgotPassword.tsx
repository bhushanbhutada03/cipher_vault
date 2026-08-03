import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/common/PasswordInput";
import { FieldError } from "@/components/common/FieldError";
import { InlineAlert } from "@/components/common/InlineAlert";
import {
  useForgotPasswordMutation,
  useResendOtpMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
} from "@/hooks/useAuthMutations";
import {
  requestOtpSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  type RequestOtpFormValues,
  type VerifyOtpFormValues,
  type ResetPasswordFormValues,
} from "@/pages/auth/forgotPassword.schema";
import type { ApiError } from "@/types/api";

type Step = "REQUEST_OTP" | "VERIFY_OTP" | "RESET_PASSWORD";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const isInitialized = useRef(false);
  if (!isInitialized.current) {
    isInitialized.current = true;
    const storedKey = sessionStorage.getItem("forgotPasswordLocationKey");
    
    if (storedKey !== location.key) {
      sessionStorage.removeItem("forgotPasswordStep");
      sessionStorage.removeItem("forgotPasswordEmail");
      sessionStorage.removeItem("forgotPasswordResendUnlockedAt");
      sessionStorage.removeItem("forgotPasswordLockoutUnlockedAt");
      sessionStorage.setItem("forgotPasswordLocationKey", location.key);
    }
  }
  const [step, setStep] = useState<Step>(() => {
    return (sessionStorage.getItem("forgotPasswordStep") as Step) || "REQUEST_OTP";
  });
  const [email, setEmail] = useState(() => {
    return sessionStorage.getItem("forgotPasswordEmail") || "";
  });
  const [otp, setOtp] = useState("");
  const [formError, setFormError] = useState<{ message: string; remainingAttempts?: number } | null>(null);

  const [lockoutUnlockedAt, setLockoutUnlockedAt] = useState<number>(() => {
    return parseInt(sessionStorage.getItem("forgotPasswordLockoutUnlockedAt") || "0", 10);
  });
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  const [resendUnlockedAt, setResendUnlockedAt] = useState<number>(() => {
    return parseInt(sessionStorage.getItem("forgotPasswordResendUnlockedAt") || "0", 10);
  });
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    sessionStorage.setItem("forgotPasswordStep", step);
    sessionStorage.setItem("forgotPasswordEmail", email);
  }, [step, email]);

  useEffect(() => {
    if (resendUnlockedAt > 0) {
      sessionStorage.setItem("forgotPasswordResendUnlockedAt", resendUnlockedAt.toString());
      
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
      sessionStorage.removeItem("forgotPasswordResendUnlockedAt");
      setResendCountdown(0);
    }
  }, [resendUnlockedAt]);

  const requestOtpMutation = useForgotPasswordMutation();
  const resendOtpMutation = useResendOtpMutation();
  const verifyOtpMutation = useVerifyOtpMutation();
  const resetPasswordMutation = useResetPasswordMutation();

  useEffect(() => {
    if (lockoutUnlockedAt > 0) {
      sessionStorage.setItem("forgotPasswordLockoutUnlockedAt", lockoutUnlockedAt.toString());
      
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
      sessionStorage.removeItem("forgotPasswordLockoutUnlockedAt");
      setLockoutSeconds(0);
    }
  }, [lockoutUnlockedAt]);

  const requestOtpForm = useForm<RequestOtpFormValues>({
    resolver: zodResolver(requestOtpSchema),
    defaultValues: { email: "" },
  });

  const verifyOtpForm = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: "" },
  });

  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
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

  const onRequestOtp = (values: RequestOtpFormValues) => {
    setFormError(null);
    requestOtpMutation.mutate(values, {
      onSuccess: () => {
        setEmail(values.email);
        setStep("VERIFY_OTP");
        setFormError(null);
        setResendUnlockedAt(Date.now() + 60000);
      },
      onError: handleApiError,
    });
  };

  const onResendOtp = () => {
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

  const onVerifyOtp = (values: VerifyOtpFormValues) => {
    setFormError(null);
    verifyOtpMutation.mutate(
      { email, otp: values.otp },
      {
        onSuccess: () => {
          setOtp(values.otp);
          setStep("RESET_PASSWORD");
          setFormError(null);
          setResendUnlockedAt(0); // Clear countdown when verified
        },
        onError: handleApiError,
      }
    );
  };

  const onResetPassword = (values: ResetPasswordFormValues) => {
    setFormError(null);
    resetPasswordMutation.mutate(
      { email, otp, newPassword: values.newPassword },
      {
        onSuccess: () => {
          // Clear all session state when completely done
          sessionStorage.removeItem("forgotPasswordStep");
          sessionStorage.removeItem("forgotPasswordEmail");
          sessionStorage.removeItem("forgotPasswordResendUnlockedAt");
          sessionStorage.removeItem("forgotPasswordLockoutUnlockedAt");
          sessionStorage.removeItem("forgotPasswordLocationKey");
          navigate("/login", { replace: true });
        },
        onError: handleApiError,
      }
    );
  };

  return (
    <AuthLayout
      eyebrow="Account Recovery"
      title="Reset your password"
      subtitle={
        step === "REQUEST_OTP"
          ? "Enter your email to receive a verification code."
          : step === "VERIFY_OTP"
          ? `Enter the 6-digit code sent to ${email}.`
          : "Create a new login password."
      }
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

      {step === "REQUEST_OTP" && (
        <form onSubmit={requestOtpForm.handleSubmit(onRequestOtp)} noValidate className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              hasError={Boolean(requestOtpForm.formState.errors.email) || lockoutSeconds > 0}
              className="h-12"
              disabled={requestOtpMutation.isPending || lockoutSeconds > 0}
              {...requestOtpForm.register("email")}
            />
            <FieldError message={requestOtpForm.formState.errors.email?.message} />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-12 text-base mt-2"
            isLoading={requestOtpMutation.isPending}
            disabled={lockoutSeconds > 0}
          >
            {lockoutSeconds > 0 ? `Try again in ${lockoutSeconds}s` : "Send Code"}
          </Button>
        </form>
      )}

      {step === "VERIFY_OTP" && (
        <form onSubmit={verifyOtpForm.handleSubmit(onVerifyOtp)} noValidate className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              autoComplete="one-time-code"
              placeholder="123456"
              maxLength={6}
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
              <span>Didn't receive the code?</span>
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
            <button
              type="button"
              className="ui-brand-link text-sm font-medium hover:underline disabled:opacity-50"
              onClick={() => {
                setStep("REQUEST_OTP");
                setFormError(null);
                verifyOtpForm.reset();
              }}
              disabled={lockoutSeconds > 0}
            >
              Change Email
            </button>
          </div>
        </form>
      )}

      {step === "RESET_PASSWORD" && (
        <form onSubmit={resetPasswordForm.handleSubmit(onResetPassword)} noValidate className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <PasswordInput
              id="newPassword"
              autoComplete="new-password"
              placeholder="••••••••"
              hasError={Boolean(resetPasswordForm.formState.errors.newPassword) || lockoutSeconds > 0}
              className="h-12"
              disabled={resetPasswordMutation.isPending || lockoutSeconds > 0}
              {...resetPasswordForm.register("newPassword")}
            />
            <FieldError message={resetPasswordForm.formState.errors.newPassword?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="••••••••"
              hasError={Boolean(resetPasswordForm.formState.errors.confirmPassword) || lockoutSeconds > 0}
              className="h-12"
              disabled={resetPasswordMutation.isPending || lockoutSeconds > 0}
              {...resetPasswordForm.register("confirmPassword")}
            />
            <FieldError message={resetPasswordForm.formState.errors.confirmPassword?.message} />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-12 text-base mt-2"
            isLoading={resetPasswordMutation.isPending}
            disabled={lockoutSeconds > 0}
          >
            {lockoutSeconds > 0 ? `Try again in ${lockoutSeconds}s` : "Reset Password"}
          </Button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link to="/login" className="ui-brand-link font-medium hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
