import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/common/FieldError";
import { InlineAlert } from "@/components/common/InlineAlert";
import { categorySchema, type CategoryFormValues } from "@/pages/categories/category.schema";
import type { ApiError } from "@/types/api";
import type { Category, CategoryRequest } from "@/types/category";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  categories: Category[];
  category?: Category | null;
  isSubmitting?: boolean;
  onSubmit: (payload: CategoryRequest) => Promise<Category>;
}

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  mode,
  categories,
  category,
  isSubmitting = false,
  onSubmit,
}: CategoryFormDialogProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      categoryName: category?.categoryName ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        categoryName: category?.categoryName ?? "",
      });
      setFormError(null);
    }
  }, [category, open, reset]);

  const existingNames = useMemo(
    () =>
      new Set(
        categories
          .filter((item) => item.id !== category?.id)
          .map((item) => normalizeName(item.categoryName))
      ),
    [categories, category?.id]
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setFormError(null);
      reset({
        categoryName: category?.categoryName ?? "",
      });
    }

    onOpenChange(nextOpen);
  };

  const handleFormSubmit = async (values: CategoryFormValues) => {
    setFormError(null);

    const categoryName = values.categoryName.trim();

    if (existingNames.has(normalizeName(categoryName))) {
      setError("categoryName", {
        type: "validate",
        message: "Category already exists.",
      });
      return;
    }

    try {
      await onSubmit({ categoryName });
      handleOpenChange(false);
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.status === 409 || apiError.message === "Category already exists.") {
        setError("categoryName", {
          type: "server",
          message: "Category already exists.",
        });
        return;
      }

      setFormError(apiError.message || "Something went wrong. Please try again.");
    }
  };

  const title = mode === "create" ? "Add Category" : "Edit Category";
  const description =
    mode === "create"
      ? "Create a category to group related credentials."
      : "Update the category name across the vault.";
  const submitLabel = mode === "create" ? "Save Category" : "Save Changes";

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
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

          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            noValidate
            className="mt-6 space-y-6"
          >
            {formError ? <InlineAlert variant="error">{formError}</InlineAlert> : null}

            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                placeholder="Work"
                autoFocus
                hasError={Boolean(errors.categoryName)}
                className="h-12"
                {...register("categoryName")}
              />
              <FieldError message={errors.categoryName?.message} />
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
              <Button type="submit" isLoading={isSubmitting} className="h-12 sm:min-w-[120px] text-base font-medium">
                {submitLabel}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
