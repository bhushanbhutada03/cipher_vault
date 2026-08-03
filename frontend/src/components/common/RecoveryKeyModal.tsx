import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { KeyRound, Copy, Download, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface RecoveryKeyModalProps {
  open: boolean;
  recoveryKey: string;
  onConfirm: () => void;
}

export function RecoveryKeyModal({
  open,
  recoveryKey,
  onConfirm,
}: RecoveryKeyModalProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [typedConfirmation, setTypedConfirmation] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(recoveryKey);
      setCopied(true);
      toast.success("Recovery Key copied securely", { description: "Store it safely offline." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed", { description: "Failed to copy recovery key." });
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([`Cipher Vault Recovery Key\n\n${recoveryKey}\n\nKeep this safe. It will never be shown again.`], {
      type: "text/plain",
    });
    element.href = URL.createObjectURL(file);
    element.download = "CipherVault_RecoveryKey.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Recovery Key downloaded", { description: "Store it offline in a secure location." });
  };

  const isConfirmed =
    acknowledged && typedConfirmation === "I HAVE SAVED MY RECOVERY KEY";

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm" />
        <Dialog.Content 
          className="ui-dialog-surface fixed left-1/2 top-1/2 z-[100] w-[calc(100%-2rem)] max-w-[800px] max-h-[calc(100vh-2rem)] custom-scrollbar overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/60 bg-surface shadow-2xl focus:outline-none sm:max-h-[calc(100vh-3rem)]"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <div className="p-5 sm:px-8 sm:py-5 lg:px-10">
            {/* Header */}
            <div className="mb-3 flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brass-soft/50 ring-1 ring-brass/30">
                <KeyRound className="size-5 text-brass" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold tracking-tight text-foreground">
                  Save your Recovery Key
                </Dialog.Title>
                <span className="mt-1 inline-flex w-fit rounded-full border border-brass/30 bg-brass-soft/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brass">
                  One-time display
                </span>
                <Dialog.Description className="text-[13px] text-muted-foreground leading-snug">
                  This is the only time your key will be shown.
                </Dialog.Description>
              </div>
            </div>

            {/* Key Display */}
            <div data-copied={copied || undefined} className="ui-key-panel mb-3 w-full rounded-xl border border-border bg-black/95 px-5 py-4 text-center shadow-inner dark:bg-black sm:px-8">
              <span className="font-mono text-lg font-medium tracking-[0.18em] text-brass [font-variant-numeric:slashed-zero]">
                {recoveryKey || "GENERATING..."}
              </span>
            </div>

            {/* Buttons */}
            <div className="mb-4 flex w-full justify-center gap-3">
              <Button variant="outline" size="sm" className="h-9 px-4 bg-background" onClick={handleCopy}>
                {copied ? <Check className="mr-2 size-4 text-success" /> : <Copy className="mr-2 size-4 text-muted-foreground" />}
                Copy Key
              </Button>
              <Button variant="outline" size="sm" className="h-9 px-4 bg-background" onClick={handleDownload}>
                <Download className="mr-2 size-4 text-muted-foreground" />
                Save as .txt
              </Button>
            </div>

            {/* Security Warning */}
            <div className="ui-danger-panel mb-4 w-full rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-2.5 text-destructive">
              <h3 className="mb-0.5 flex items-center gap-2 text-[13px] font-bold tracking-wide">
                <AlertCircle className="size-4 shrink-0" />
                CRITICAL SECURITY WARNING
              </h3>
              <ul className="ml-5 list-disc space-y-0.5 text-[12px] font-medium leading-snug opacity-90">
                <li>This Recovery Key is shown <strong className="font-bold">ONLY ONCE</strong>.</li>
                <li>Store it <strong className="font-bold">OFFLINE</strong> (paper recommended).</li>
                <li>Never store it in Gmail, Google Drive, Dropbox, or any cloud storage.</li>
                <li>Without this Recovery Key and your Master Password, your vault can <strong className="font-bold">NEVER</strong> be recovered.</li>
              </ul>
            </div>

            {/* Confirmation Form */}
            <div className="w-full space-y-3 rounded-xl border border-border bg-surface-elevated p-4 shadow-sm sm:px-5">
              <div className="flex items-start gap-3.5">
                <Checkbox
                  id="acknowledge"
                  checked={acknowledged}
                  onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
                  className="mt-1 size-4.5 rounded-sm shrink-0"
                />
                <Label htmlFor="acknowledge" className="text-[13px] font-medium leading-relaxed text-foreground cursor-pointer flex-1 break-words">
                  I confirm that I have securely saved this Recovery Key offline.
                </Label>
              </div>

              <div className="space-y-2 pt-0.5">
                <Label htmlFor="confirmText" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                  Type "I HAVE SAVED MY RECOVERY KEY"
                </Label>
                <Input
                  id="confirmText"
                  value={typedConfirmation}
                  onChange={(e) => setTypedConfirmation(e.target.value.toUpperCase())}
                  onPaste={(e) => e.preventDefault()}
                  autoComplete="off"
                  placeholder="I HAVE SAVED MY RECOVERY KEY"
                  className="h-11 bg-background font-mono text-[13px] tracking-wider uppercase focus-visible:ring-brass"
                />
              </div>
            </div>

            {/* Action */}
            <div className="mt-3 flex justify-end">
              <Button
                size="default"
                className="h-11 px-8 font-medium transition-opacity w-full sm:w-auto"
                disabled={!isConfirmed}
                onClick={onConfirm}
              >
                {window.location.pathname.includes('/register') ? 'Continue' : 'Confirm'}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
