import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Download, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ExportConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isExporting: boolean;
  credentialCount: number;
  categoryCount: number;
}

export function ExportConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  isExporting,
  credentialCount,
  categoryCount,
}: ExportConfirmationDialogProps) {
  const [typedConfirmation, setTypedConfirmation] = useState("");

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTypedConfirmation("");
    }
    onOpenChange(isOpen);
  };

  const isConfirmed = typedConfirmation === "EXPORT MY VAULT";

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm" />
        <Dialog.Content 
          className="ui-dialog-surface fixed left-1/2 top-1/2 z-[100] w-[calc(100%-2rem)] max-w-[800px] max-h-[calc(100vh-2rem)] custom-scrollbar overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/60 bg-surface shadow-2xl focus:outline-none sm:max-h-[calc(100vh-3rem)]"
        >
          <div className="relative p-5 sm:px-8 sm:py-5 lg:px-10">
            <Dialog.Close className="ui-icon-button absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-surface-elevated hover:text-foreground">
              <X className="size-4" />
            </Dialog.Close>
            
            {/* Header */}
            <div className="mb-3 flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 ring-1 ring-destructive/20">
                <Download className="size-5 text-destructive" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold tracking-tight text-foreground">
                  Export Vault
                </Dialog.Title>
                <Dialog.Description className="text-[13px] text-muted-foreground leading-snug">
                  Export all credentials as a plain text CSV file.
                </Dialog.Description>
              </div>
            </div>

            {/* Warning Section */}
            <div className="ui-danger-panel mb-4 flex w-full flex-col gap-1 rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-2.5 text-destructive">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <h3 className="font-semibold text-sm">Critical Security Warning</h3>
              </div>
              <ul className="ml-5 list-disc space-y-0.5 text-[12px] font-medium leading-snug opacity-90">
                <li>This exports <strong className="font-bold">ALL</strong> decrypted passwords in plain text.</li>
                <li className="sm:whitespace-nowrap">Anyone obtaining this CSV gains <strong className="font-bold">full access</strong> to your accounts.</li>
                <li>Importing elsewhere does <strong className="font-bold">NOT</strong> delete this copy.</li>
                <li><strong className="font-bold">DELETE</strong> this CSV immediately after use.</li>
                <li><strong className="font-bold">NEVER</strong> upload it to cloud storage.</li>
              </ul>
            </div>
            
            {/* Confirmation Form */}
            <div className="w-full space-y-4 rounded-xl border border-border bg-surface-elevated p-4 shadow-sm sm:px-5">
              <div className="grid grid-cols-3 divide-x divide-border/40 rounded-lg border border-border/40 text-center">
                <div className="px-2 py-2">
                  <span className="block text-[13px] font-semibold text-foreground">{credentialCount}</span>
                  <span className="mt-0.5 block text-[11px] leading-tight text-muted-foreground">Credentials</span>
                </div>
                <div className="px-2 py-2">
                  <span className="block text-[13px] font-semibold text-foreground">{categoryCount}</span>
                  <span className="mt-0.5 block text-[11px] leading-tight text-muted-foreground">Categories</span>
                </div>
                <div className="px-2 py-2">
                  <span className="block text-[11px] leading-tight text-muted-foreground">File</span>
                  <span className="mt-0.5 block text-[13px] font-mono font-medium text-foreground">credentials.csv</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmExport" className="text-[11px] font-bold uppercase tracking-widest text-destructive ml-1">
                  Type "EXPORT MY VAULT"
                </Label>
                <Input
                  id="confirmExport"
                  value={typedConfirmation}
                  onChange={(e) => setTypedConfirmation(e.target.value.toUpperCase())}
                  onPaste={(e) => e.preventDefault()}
                  autoComplete="off"
                  placeholder="EXPORT MY VAULT"
                  disabled={isExporting}
                  className="h-11 bg-background font-mono text-[13px] tracking-wider uppercase focus-visible:ring-destructive"
                />
              </div>
            </div>

            {/* Action */}
            <div className="mt-3 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-11 sm:w-32 text-[13px] bg-background"
                onClick={() => handleOpenChange(false)}
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="h-11 sm:w-32 text-[13px] font-medium transition-opacity"
                disabled={!isConfirmed || isExporting}
                isLoading={isExporting}
                onClick={onConfirm}
              >
                Export
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
