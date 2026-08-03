import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "default" | "destructive";
  isConfirming?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "default",
  isConfirming = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm" />
        <Dialog.Content className="ui-dialog-surface fixed left-1/2 top-1/2 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/50 bg-surface p-6 shadow-xl focus:outline-none">
          <div className="space-y-2">
            <Dialog.Title className="font-display text-xl font-semibold text-foreground">
              {title}
            </Dialog.Title>
            <Dialog.Description className="text-sm leading-6 text-muted-foreground">
              {description}
            </Dialog.Description>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-12 sm:w-24 text-base font-medium"
              onClick={() => onOpenChange(false)}
              disabled={isConfirming}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={confirmVariant}
              className="h-12 sm:min-w-[120px] text-base font-medium"
              isLoading={isConfirming}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
