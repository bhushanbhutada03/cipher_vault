import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Lock, Save } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/common/PasswordInput";
import { FieldError } from "@/components/common/FieldError";
import { InlineAlert } from "@/components/common/InlineAlert";
import { MasterPasswordDialog } from "@/components/common/MasterPasswordDialog";
import {
  useCategories,
  useCreateCategoryMutation,
} from "@/hooks/useCategories";
import { CategoryFormDialog } from "@/pages/categories/CategoryFormDialog";
import {
  useCredential,
  useRevealMutation,
  useUpdateCredentialMutation,
} from "@/hooks/useCredentials";

const credentialSchema = z.object({
  categoryId: z.coerce.number().positive("Choose a category"),
  websiteName: z.string().min(1, "Website name is required"),
  websiteUrl: z.string().trim().optional(),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  password: z.string().min(1, "Password is required"),
  notes: z.string().optional(),
  favorite: z.boolean(),
});

type CredentialFormValues = z.infer<typeof credentialSchema>;

export default function EditCredential() {
  const { id } = useParams<{ id: string }>();
  const credentialId = Number(id);
  const navigate = useNavigate();

  const { data: credential, isPending: credentialPending, error: credentialError } =
    useCredential(credentialId);
  const { data: categories, isPending: categoriesPending } = useCategories();
  const createCategoryMutation = useCreateCategoryMutation();
  const revealMutation = useRevealMutation();
  const updateMutation = useUpdateCredentialMutation();

  const [masterPassword, setMasterPassword] = useState<string | null>(null);
  const [isUnlockDialogOpen, setIsUnlockDialogOpen] = useState(false);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const categoriesList = categories ?? [];
  const hasCategories = categoriesList.length > 0;

  // We need to find the categoryId from the categoryName provided in the response
  const initialCategoryId = useMemo(() => {
    if (!credential || !categories) return 0;
    const cat = categories.find((c) => c.categoryName === credential.categoryName);
    return cat ? cat.id : 0;
  }, [credential, categories]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<CredentialFormValues>({
    resolver: zodResolver(credentialSchema),
    defaultValues: {
      categoryId: 0,
      websiteName: "",
      websiteUrl: "",
      username: "",
      email: "",
      password: "",
      notes: "",
      favorite: false,
    },
  });

  // Prompt for master password immediately to unlock the form and retrieve the current password
  useEffect(() => {
    if (credential && !isUnlocked && !isUnlockDialogOpen) {
      setIsUnlockDialogOpen(true);
    }
  }, [credential, isUnlocked, isUnlockDialogOpen]);

  const handleUnlock = (password: string) => {
    revealMutation.mutate(
      { id: credentialId, payload: { masterPassword: password } },
      {
        onSuccess: (revealedData) => {
          setMasterPassword(password);
          setIsUnlocked(true);
          setIsUnlockDialogOpen(false);
          
          // Pre-fill form now that we have all data including the password
          reset({
            categoryId: initialCategoryId,
            websiteName: revealedData.websiteName,
            websiteUrl: revealedData.websiteUrl || "",
            username: revealedData.username,
            email: revealedData.email || "",
            password: revealedData.password || "",
            notes: revealedData.notes || "",
            favorite: revealedData.favorite,
          });
        },
      }
    );
  };

  const handleCreateCategory = async (payload: { categoryName: string }) => {
    const category = await createCategoryMutation.mutateAsync(payload);
    setValue("categoryId", category.id, { shouldDirty: true, shouldValidate: true });
    clearErrors("categoryId");
    return category;
  };

  const onSubmit = (values: CredentialFormValues) => {
    if (!masterPassword) return; // Should not happen since we force unlock first
    setFormError(null);

    updateMutation.mutate(
      {
        id: credentialId,
        payload: {
          masterPassword: masterPassword,
          categoryId: values.categoryId,
          websiteName: values.websiteName.trim(),
          websiteUrl: values.websiteUrl?.trim() || undefined,
          username: values.username.trim(),
          email: values.email?.trim() || undefined,
          password: values.password,
          notes: values.notes?.trim() || undefined,
          favorite: values.favorite,
        },
      },
      {
        onSuccess: () => {
          navigate(`/credentials/${credentialId}`, { replace: true });
        },
        onError: (err) => {
          setFormError(err.message);
        },
      }
    );
  };

  if (credentialPending) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="size-8 animate-spin rounded-full border-4 border-brass border-t-transparent" />
      </div>
    );
  }

  if (credentialError || !credential) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Credential not found
          </h2>
          <Button className="mt-6" onClick={() => navigate("/credentials")}>
            Back to credentials
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <section className="rounded-2xl border border-border bg-surface px-5 py-6 shadow-sm sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-brass">
                Edit Credential
              </p>
              <div>
                <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {credential.websiteName}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Update the details of your stored credential.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => navigate(`/credentials/${credentialId}`)}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Cancel
            </Button>
          </div>
        </section>

        {!isUnlocked ? (
          <section className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-border bg-surface px-6 py-12 text-center shadow-sm">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-brass-soft text-brass">
              <Lock className="size-7" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-foreground">
              Locked for Editing
            </h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              You must unlock this credential with your master password before you can edit it.
            </p>
            <Button type="button" className="mt-6" onClick={() => setIsUnlockDialogOpen(true)}>
              Unlock Credential
            </Button>
          </section>
        ) : (
          <section className="rounded-2xl border border-border bg-surface shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 p-5 sm:p-6">
              {formError ? <InlineAlert variant="error">{formError}</InlineAlert> : null}

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="websiteName">Website Name</Label>
                  <Input
                    id="websiteName"
                    placeholder="GitHub"
                    hasError={Boolean(errors.websiteName)}
                    className="h-12"
                    {...register("websiteName")}
                  />
                  <FieldError message={errors.websiteName?.message} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    placeholder="https://github.com"
                    hasError={Boolean(errors.websiteUrl)}
                    className="h-12"
                    {...register("websiteUrl")}
                  />
                  <FieldError message={errors.websiteUrl?.message} />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category</Label>
                  <select
                    id="categoryId"
                    disabled={categoriesPending || !hasCategories}
                    className="flex h-12 w-full rounded-md border border-border-strong bg-surface px-3.5 py-2 text-sm text-foreground transition-colors duration-150 focus-visible:border-brass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/30 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("categoryId")}
                  >
                    <option value={0}>Select a category</option>
                    {categoriesList.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.categoryId?.message} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="johndoe"
                    hasError={Boolean(errors.username)}
                    className="h-12"
                    {...register("username")}
                  />
                  <FieldError message={errors.username?.message} />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    hasError={Boolean(errors.email)}
                    className="h-12"
                    {...register("email")}
                  />
                  <FieldError message={errors.email?.message} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <PasswordInput
                    id="password"
                    placeholder="Enter the account password"
                    hasError={Boolean(errors.password)}
                    className="h-12"
                    {...register("password")}
                  />
                  <FieldError message={errors.password?.message} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  rows={4}
                  placeholder="Optional notes about this credential"
                  className="flex w-full rounded-md border border-border-strong bg-surface px-3.5 py-3 text-sm text-foreground placeholder:text-faint-foreground transition-colors duration-150 focus-visible:border-brass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/30 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("notes")}
                />
                <FieldError message={errors.notes?.message} />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 sm:w-auto"
                  onClick={() => navigate(`/credentials/${credentialId}`)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full h-12 sm:w-auto"
                  isLoading={updateMutation.isPending}
                  disabled={!hasCategories || categoriesPending}
                >
                  <Save className="mr-2 size-4" aria-hidden="true" />
                  Save Changes
                </Button>
              </div>
            </form>
          </section>
        )}
      </div>

      <MasterPasswordDialog
        open={isUnlockDialogOpen}
        onOpenChange={(open) => {
          if (!open && !isUnlocked) {
            // User cancelled unlocking, send them back
            navigate(`/credentials/${credentialId}`);
          }
          setIsUnlockDialogOpen(open);
        }}
        title="Unlock to Edit"
        description={`Please enter your master password to unlock and edit "${credential?.websiteName}".`}
        submitLabel="Unlock"
        isSubmitting={revealMutation.isPending}
        error={revealMutation.error}
        onSubmit={handleUnlock}
      />

      <CategoryFormDialog
        open={isCreateCategoryOpen}
        onOpenChange={setIsCreateCategoryOpen}
        mode="create"
        categories={categoriesList}
        isSubmitting={createCategoryMutation.isPending}
        onSubmit={handleCreateCategory}
      />
    </main>
  );
}
