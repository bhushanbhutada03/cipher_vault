import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/common/PasswordInput";
import { InlineAlert } from "@/components/common/InlineAlert";
import { useMasterPasswordLockStatusQuery } from "@/hooks/useCredentials";
import { useAuth } from "@/hooks/useAuth";
import { vaultTokenService } from "@/services/vaultTokenService";
import type { ApiError } from "@/types/api";

interface MasterPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  error?: ApiError | string | null;
  actionScope?: string;
  onReset?: () => void;
  onSubmit: (password: string) => void;
}

export function MasterPasswordDialog({
  open,
  onOpenChange,
  title = "Authentication Required",
  description = "Please enter your master password to continue.",
  submitLabel = "Verify",
  isSubmitting = false,
  error = null,
  actionScope = "default",
  onReset,
  onSubmit,
}: MasterPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  const { data: lockStatus } = useMasterPasswordLockStatusQuery(open);

  const { logout } = useAuth();

  useEffect(() => {
    setPassword("");
  }, [open]);

  useEffect(() => {
    if (lockStatus?.locked && lockStatus.remainingSeconds > 0) {
      setLockoutSeconds(lockStatus.remainingSeconds);
    } else if (error && typeof error === "object") {
      // 3-Attempt Policy check
      if (error.status !== 429) {
        const failures = vaultTokenService.recordFailure(actionScope);
        if (failures >= 3) {
          vaultTokenService.clearToken();
          logout();
          return;
        }
      }
      
      if (error.status === 429 && error.remainingSeconds) {
        setLockoutSeconds(error.remainingSeconds);
      } else {
        setLockoutSeconds(0);
      }
    } else {
      setLockoutSeconds(0);
    }
  }, [error, open, lockStatus, logout, actionScope]);

  useEffect(() => {
    if (lockoutSeconds <= 0) return;

    const timer = setInterval(() => {
      setLockoutSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    onSubmit(password);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setPassword("");
      setLockoutSeconds(0);
      onReset?.();
    }
    onOpenChange(isOpen);
  };

  const remainingAttempts = 3 - vaultTokenService.getFailures(actionScope);

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm" />
        <Dialog.Content className="ui-dialog-surface fixed left-1/2 top-1/2 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/50 bg-surface shadow-xl focus:outline-none">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <Dialog.Title className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <Lock className="size-4 text-brass" />
              {title}
            </Dialog.Title>
            <Dialog.Close className="ui-icon-button rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-foreground">
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5">
            <Dialog.Description className="mb-4 text-sm leading-6 text-muted-foreground">
              {description}
            </Dialog.Description>

            {lockoutSeconds > 0 ? (
              <div className="mb-4">
                <InlineAlert variant="error">
                  Too many incorrect attempts. Try again in {lockoutSeconds} seconds.
                </InlineAlert>
              </div>
            ) : error ? (
              <div className="mb-4">
                <InlineAlert variant="error">
                  {typeof error === "string" ? error : error.message}
                  {remainingAttempts > 0 && typeof error === "object" && error.status !== 429 && (
                    <span className="ml-1 font-semibold">{remainingAttempts} attempt{remainingAttempts === 1 ? "" : "s"} remaining.</span>
                  )}
                </InlineAlert>
              </div>
            ) : null}

            <div className="space-y-2">
              <label htmlFor="masterPassword" className="text-sm font-medium text-foreground">
                Master Password
              </label>
              <PasswordInput
                key={open ? "open" : "closed"}
                id="masterPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your master password"
                hasError={Boolean(error) || lockoutSeconds > 0}
                autoFocus
                disabled={isSubmitting || lockoutSeconds > 0}
                className="h-12"
              />
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-12 sm:w-24 text-base font-medium"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-12 sm:min-w-[120px] text-base font-medium"
                isLoading={isSubmitting}
                disabled={!password.trim() || lockoutSeconds > 0}
              >
                {lockoutSeconds > 0 ? `Try again in ${lockoutSeconds}s` : submitLabel}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
