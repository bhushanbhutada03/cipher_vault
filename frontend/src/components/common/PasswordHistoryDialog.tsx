import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { History, X, Copy, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCredentialHistory } from "@/hooks/useCredentials";
import { MasterPasswordDialog } from "@/components/common/MasterPasswordDialog";
import { useUnlockVaultMutation } from "@/hooks/useVault";

interface PasswordHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credentialId: number;
}

export function PasswordHistoryDialog({
  open,
  onOpenChange,
  credentialId,
}: PasswordHistoryDialogProps) {
  const { data: history, isPending, error } = useCredentialHistory(credentialId, open);
  const [revealedEntries, setRevealedEntries] = useState<Record<number, boolean>>({});
  const [pendingRevealIndex, setPendingRevealIndex] = useState<number | null>(null);
  
  const unlockMutation = useUnlockVaultMutation();

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Password copied", { description: "Ready to paste." });
    } catch {
      toast.error("Copy failed", { description: "Failed to copy password." });
    }
  };

  const handleRevealClick = (index: number) => {
    setPendingRevealIndex(index);
  };

  const handleAuthSubmit = (password: string) => {
    unlockMutation.mutate(
      { masterPassword: password },
      {
        onSuccess: () => {
          if (pendingRevealIndex !== null) {
            setRevealedEntries((prev) => ({ ...prev, [pendingRevealIndex]: true }));
            setPendingRevealIndex(null);
          }
        },
      }
    );
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm" />
          <Dialog.Content className="ui-dialog-surface fixed left-1/2 top-1/2 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/50 bg-surface shadow-xl focus:outline-none">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <Dialog.Title className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                <History className="size-4 text-brass" />
                Password History
              </Dialog.Title>
              <Dialog.Close className="ui-icon-button rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-foreground">
                <X className="size-4" />
              </Dialog.Close>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
              {isPending ? (
                <div className="flex justify-center py-8">
                  <div className="size-6 animate-spin rounded-full border-2 border-brass border-t-transparent" />
                </div>
              ) : error ? (
                <p className="text-center text-sm text-destructive py-4">
                  Failed to load history.
                </p>
              ) : !history || history.length === 0 ? (
                <div className="text-center py-8">
                  <History className="mx-auto size-8 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">No previous passwords found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((entry, index) => {
                    const date = new Date(entry.changedAt).toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    });
                    const isRevealed = revealedEntries[index];
                    return (
                      <div key={index} className="rounded-lg border border-border bg-surface-elevated p-3">
                        <div className="mb-2 text-xs font-medium text-muted-foreground">
                          Changed on {date}
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-mono text-sm tracking-widest text-foreground truncate select-all">
                            {isRevealed ? entry.oldPassword : "••••••••••••"}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {!isRevealed && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => handleRevealClick(index)}
                              >
                                <Eye className="mr-1.5 size-3.5" />
                                Reveal
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground hover:text-foreground disabled:opacity-50"
                              onClick={() => handleCopy(entry.oldPassword)}
                              disabled={!isRevealed}
                            >
                              <Copy className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {pendingRevealIndex !== null && (
        <MasterPasswordDialog
          open={true}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setPendingRevealIndex(null);
              unlockMutation.reset();
            }
          }}
          title="Reveal Password"
          description="Enter your master password to reveal this previous password."
          submitLabel="Reveal"
          onSubmit={handleAuthSubmit}
          isSubmitting={unlockMutation.isPending}
          error={unlockMutation.error}
          actionScope="reveal"
        />
      )}
    </>
  );
}
