import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/common/PasswordInput";
import { FieldError } from "@/components/common/FieldError";
import { InlineAlert } from "@/components/common/InlineAlert";
import {
  useCategories,
  useCreateCategoryMutation,
} from "@/hooks/useCategories";
import { CategoryFormDialog } from "@/pages/categories/CategoryFormDialog";
import { credentialApi } from "@/api/credentialApi";
import type { ApiError } from "@/types/api";
import type { Category } from "@/types/category";
import type { CreateCredentialRequest } from "@/types/credential";
import { z } from "zod";

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

export default function NewCredential() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: categories, isPending: categoriesPending, error: categoriesError } =
    useCategories();
  const createCategoryMutation = useCreateCategoryMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);

  const createMutation = useMutation<void, ApiError, CreateCredentialRequest>({
    mutationFn: (payload) => credentialApi.createCredential(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      navigate("/", { replace: true });
    },
    onError: (error) => {
      setFormError(error.message);
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
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

  const categoriesList = categories ?? [];
  const hasCategories = categoriesList.length > 0;

  const handleCreateCategory = async (payload: { categoryName: string }) => {
    const category = await createCategoryMutation.mutateAsync(payload);
    await queryClient.invalidateQueries({ queryKey: ["categories"] });
    await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    setValue("categoryId", category.id, { shouldDirty: true, shouldValidate: true });
    clearErrors("categoryId");
    return category;
  };

  const onSubmit = (values: CredentialFormValues) => {
    setFormError(null);

    createMutation.mutate({
      categoryId: values.categoryId,
      websiteName: values.websiteName.trim(),
      websiteUrl: values.websiteUrl?.trim() || undefined,
      username: values.username.trim(),
      email: values.email?.trim() || undefined,
      password: values.password,
      notes: values.notes?.trim() || undefined,
      favorite: values.favorite,
    });
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <section className="rounded-2xl border border-border bg-surface px-5 py-6 shadow-sm sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-brass">
                Credentials
              </p>
              <div>
                <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Add Credential
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Save a new website login to your encrypted vault.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to dashboard
            </Button>
          </div>
        </section>

        {categoriesError ? (
          <InlineAlert variant="error">
            {categoriesError.message || "Categories could not be loaded."}
          </InlineAlert>
        ) : null}

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
                  className="flex h-11 w-full rounded-md border border-border-strong bg-surface px-3.5 py-2 text-sm text-foreground transition-colors duration-150 focus-visible:border-brass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/30 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("categoryId")}
                >
                  <option value={0}>Select a category</option>
                  {categoriesList.map((category: Category) => (
                    <option key={category.id} value={category.id}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.categoryId?.message} />
                {!hasCategories && !categoriesPending ? (
                  <div className="rounded-xl border border-dashed border-border-strong bg-surface-elevated px-4 py-4">
                    <p className="text-sm font-medium text-foreground">
                      No categories available yet
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Create a category first before adding credentials.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setIsCreateCategoryOpen(true)}
                    >
                      Create Category
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="johndoe"
                  hasError={Boolean(errors.username)}
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

            <label className="flex items-start gap-3 rounded-xl border border-border bg-surface-elevated px-4 py-3">
              <input
                type="checkbox"
                className="mt-1 size-4 rounded border-border-strong text-brass focus:ring-brass/30"
                {...register("favorite")}
              />
              <span>
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Star className="size-4 text-brass" aria-hidden="true" />
                  Mark as favorite
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  Pin this credential to highlight it on the dashboard.
                </span>
              </span>
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => navigate("/")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                isLoading={createMutation.isPending}
                disabled={!hasCategories || categoriesPending}
              >
                <Plus className="size-4" aria-hidden="true" />
                Add Credential
              </Button>
            </div>
          </form>
        </section>
      </div>

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
