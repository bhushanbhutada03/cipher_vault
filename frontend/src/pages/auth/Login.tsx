import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/common/PasswordInput";
import { FieldError } from "@/components/common/FieldError";
import { InlineAlert } from "@/components/common/InlineAlert";
import { useLoginMutation } from "@/hooks/useAuthMutations";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginFormValues } from "@/pages/auth/login.schema";
import { isEmailNotVerifiedError } from "@/utils/authHelpers";
import type { ApiError } from "@/types/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken } = useAuth();
  const loginMutation = useLoginMutation();
  const [formError, setFormError] = useState<{ message: string; remainingAttempts?: number } | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

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
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", loginPassword: "" },
  });

  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? "/";

  const onSubmit = (values: LoginFormValues) => {
    setFormError(null);
    loginMutation.mutate(values, {
      onSuccess: (data) => {
        if (!data.success || !data.token) {
          setFormError({ message: data.message || "Couldn't sign you in. Check your details and try again." });
          return;
        }
        setToken(data.token);
        navigate(redirectTo, { replace: true });
      },
      onError: (error, variables) => {
        const apiError = error as ApiError;
        if (isEmailNotVerifiedError(apiError)) {
          navigate("/verify-email", { replace: true, state: { email: variables.email } });
          return;
        }
        if (apiError.status === 429 && apiError.remainingSeconds) {
          setLockoutSeconds(apiError.remainingSeconds);
          setFormError(null);
        } else {
          setFormError({
            message: apiError.message || "Couldn't sign you in. Check your details and try again.",
            remainingAttempts: apiError.remainingAttempts,
          });
        }
      },
    });
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to your vault"
      subtitle="Use your email and password to access the vault."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 mt-6">
        {lockoutSeconds > 0 ? (
          <InlineAlert variant="error">
            Too many failed login attempts. Try again in {lockoutSeconds} seconds.
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
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            hasError={Boolean(errors.email) || lockoutSeconds > 0}
            className="h-12"
            disabled={loginMutation.isPending || lockoutSeconds > 0}
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="loginPassword">Password</Label>
            <Link
              to="/forgot-password"
              className="ui-brand-link text-sm font-medium hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="loginPassword"
            autoComplete="current-password"
            placeholder="••••••••"
            hasError={Boolean(errors.loginPassword) || lockoutSeconds > 0}
            className="h-12"
            disabled={loginMutation.isPending || lockoutSeconds > 0}
            {...register("loginPassword")}
          />
          <FieldError message={errors.loginPassword?.message} />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full h-12 text-base mt-2"
          isLoading={loginMutation.isPending}
          disabled={lockoutSeconds > 0}
        >
          {lockoutSeconds > 0 ? `Try again in ${lockoutSeconds}s` : "Sign in"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/register" className="ui-brand-link font-medium hover:underline">
          Create account
        </Link>
      </p>
    </AuthLayout>
  );
}
