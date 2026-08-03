import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Edit2,
  Eye,
  FolderOpen,
  Shield,
  Star,
  Trash2,
  History,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MasterPasswordDialog } from "@/components/common/MasterPasswordDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PasswordHistoryDialog } from "@/components/common/PasswordHistoryDialog";
import {
  useCredential,
  useDeleteCredentialMutation,
  useRevealMutation,
  useToggleFavoriteMutation,
  useCredentialHistory,
} from "@/hooks/useCredentials";
import type { CredentialDetailResponse } from "@/types/credential";

export default function CredentialDetail() {
  const { id } = useParams<{ id: string }>();
  const credentialId = Number(id);
  const navigate = useNavigate();

  const { data: credential, isPending, error } = useCredential(credentialId);
  const { data: history } = useCredentialHistory(credentialId, true);
  const toggleFavorite = useToggleFavoriteMutation();
  const revealMutation = useRevealMutation();
  const deleteMutation = useDeleteCredentialMutation();

  const [revealedData, setRevealedData] = useState<CredentialDetailResponse | null>(null);
  
  // Dialog states
  const [isRevealDialogOpen, setIsRevealDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteMasterPassword, setDeleteMasterPassword] = useState("");
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`, { description: "Ready to paste." });
    } catch {
      toast.error("Copy failed", { description: `Failed to copy ${label}.` });
    }
  };

  const handleRevealPassword = (password: string) => {
    revealMutation.mutate(
      { id: credentialId, payload: { masterPassword: password } },
      {
        onSuccess: (data) => {
          setRevealedData(data);
          setIsRevealDialogOpen(false);
          toast.success("Credential unlocked", { description: "Password revealed successfully." });
        },
      }
    );
  };

  const handleDeletePasswordPrompt = (password: string) => {
    setDeleteMasterPassword(password);
    setIsDeleteDialogOpen(false);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(
      { id: credentialId, payload: { masterPassword: deleteMasterPassword } },
      {
        onSuccess: () => {
          toast.success("Credential deleted", { description: "The credential has been permanently removed." });
          navigate("/credentials", { replace: true });
        },
      }
    );
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="size-8 animate-spin rounded-full border-4 border-brass border-t-transparent" />
      </div>
    );
  }

  if (error || !credential) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Credential not found
          </h2>
          <p className="mt-2 text-muted-foreground">
            The credential may have been deleted or you don't have access.
          </p>
          <Button className="mt-6" onClick={() => navigate("/credentials")}>
            Back to credentials
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <section className="rounded-2xl border border-border bg-surface px-5 py-6 shadow-sm sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border-strong bg-surface-elevated p-2">
                {credential.faviconUrl ? (
                  <img
                    src={credential.faviconUrl}
                    alt=""
                    className="size-full object-contain"
                  />
                ) : (
                  <Shield className="size-6 text-brass" />
                )}
              </div>
              <div className="space-y-1">
                <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {credential.websiteName}
                </h1>
                {credential.websiteUrl && (
                  <a
                    href={
                      credential.websiteUrl.startsWith("http")
                        ? credential.websiteUrl
                        : `https://${credential.websiteUrl}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brass hover:underline"
                  >
                    {credential.websiteUrl}
                  </a>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleFavorite.mutate(credentialId)}
                aria-label={credential.favorite ? "Remove favorite" : "Add favorite"}
              >
                <Star
                  className={`size-4 ${
                    credential.favorite ? "fill-brass text-brass" : "text-muted-foreground"
                  }`}
                />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-4"
                onClick={() => setIsHistoryDialogOpen(true)}
              >
                <History className="mr-2 size-4 text-muted-foreground" />
                Password History {history ? `(${history.length})` : "(0)"}
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/credentials/${credentialId}/edit`}>
                  <Edit2 className="mr-2 size-4" />
                  Edit
                </Link>
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            className="mt-6 -ml-3 text-muted-foreground"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 size-4" />
            Go back
          </Button>
        </section>

        <section className="rounded-2xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-5 py-4 sm:px-6">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Credential Details
            </h2>
          </div>
          
          <div className="space-y-6 p-5 sm:p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Username</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={revealedData ? revealedData.username : "••••••••••••••••"}
                    className={revealedData ? "h-12" : "h-12 font-mono tracking-widest text-muted-foreground"}
                  />
                  {revealedData ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-12"
                      onClick={() => handleCopy(revealedData.username, "Username")}
                    >
                      <Copy className="size-4" />
                    </Button>
                  ) : null}
                </div>
              </div>

              {revealedData && revealedData.email && (
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={revealedData.email}
                      className="h-12"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-12"
                      onClick={() => handleCopy(revealedData.email || "", "Email")}
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Password</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    type={revealedData?.password ? "text" : "password"}
                    value={revealedData?.password || "••••••••••••••••"}
                    className={revealedData?.password ? "h-12" : "h-12 font-mono tracking-widest"}
                  />
                  {!revealedData ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 px-4"
                      onClick={() => setIsRevealDialogOpen(true)}
                    >
                      <Eye className="mr-2 size-4" />
                      Unlock
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-12"
                      onClick={() => handleCopy(revealedData.password || "", "Password")}
                    >
                      <Copy className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <div className="flex h-12 items-center gap-2 rounded-md border border-border bg-surface-elevated px-3">
                  <FolderOpen className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{credential.categoryName}</span>
                </div>
              </div>
            </div>

            {revealedData && revealedData.notes && (
              <div className="space-y-2">
                <Label>Notes</Label>
                <div className="rounded-md border border-border bg-surface-elevated px-4 py-3">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                    {revealedData.notes}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <MasterPasswordDialog
        open={isRevealDialogOpen}
        onOpenChange={setIsRevealDialogOpen}
        title="Reveal Password"
        description="Please enter your master password to reveal this credential's password."
        submitLabel="Reveal"
        isSubmitting={revealMutation.isPending}
        error={revealMutation.error}
        onSubmit={handleRevealPassword}
        actionScope="reveal"
      />

      <MasterPasswordDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Authentication Required"
        description="Please enter your master password to authorize deletion."
        submitLabel="Continue"
        onSubmit={handleDeletePasswordPrompt}
        actionScope="delete"
      />

      <ConfirmDialog
        open={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
        title="Delete Credential"
        description={`Are you sure you want to delete "${credential.websiteName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="destructive"
        isConfirming={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
      
      <PasswordHistoryDialog
        open={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
        credentialId={credentialId}
      />
    </main>
  );
}
