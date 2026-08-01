import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  FolderOpen,
  PencilLine,
  Plus,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { InlineAlert } from "@/components/common/InlineAlert";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import {
  useCategories,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from "@/hooks/useCategories";
import { CategoryFormDialog } from "@/pages/categories/CategoryFormDialog";
import type { Category } from "@/types/category";

function PageHeader({ onAdd }: { onAdd: () => void }) {
  return (
    <section className="rounded-2xl border border-border bg-surface px-5 py-6 shadow-sm sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-brass">
            Categories
          </p>
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Organize your credentials
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Keep your vault structured with clear category groupings for every saved credential.
            </p>
          </div>
        </div>

        <Button type="button" className="w-full sm:w-auto" onClick={onAdd}>
          <Plus className="size-4" aria-hidden="true" />
          Add Category
        </Button>
      </div>
    </section>
  );
}

function TableSkeletonRow() {
  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-5 py-4 sm:px-6">
        <div className="h-4 w-44 animate-pulse rounded bg-surface-elevated" />
      </td>
      <td className="px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="h-9 w-16 animate-pulse rounded-md bg-surface-elevated" />
          <div className="h-9 w-16 animate-pulse rounded-md bg-surface-elevated" />
        </div>
      </td>
    </tr>
  );
}

function CategoryRow({
  category,
  onEdit,
  onDelete,
  deleting,
  disabled,
}: {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  deleting: boolean;
  disabled: boolean;
}) {
  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brass-soft text-brass">
            <FolderOpen className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {category.categoryName}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">Category #{category.id}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => onEdit(category)}
          >
            <PencilLine className="size-4" aria-hidden="true" />
            Edit
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={disabled}
            onClick={() => onDelete(category)}
            isLoading={deleting}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex min-h-[340px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-brass-soft text-brass">
        <FolderOpen className="size-7" aria-hidden="true" />
      </div>
      <h2 className="font-display text-2xl font-semibold text-foreground">
        No categories yet
      </h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        Create your first category to keep credentials organized and easier to manage.
      </p>
      <Button type="button" className="mt-6 min-w-36" onClick={onAdd}>
        <Plus className="size-4" aria-hidden="true" />
        Add Category
      </Button>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
  retrying,
}: {
  message: string;
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <section className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-border bg-surface px-6 py-12 text-center shadow-sm">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger">
        <AlertCircle className="size-6" aria-hidden="true" />
      </div>
      <h2 className="font-display text-2xl font-semibold text-foreground">
        We could not load categories
      </h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{message}</p>
      <Button type="button" className="mt-6 min-w-32" onClick={onRetry}>
        <RefreshCcw className={cn("size-4", retrying && "animate-spin")} />
        Retry
      </Button>
    </section>
  );
}

export default function Categories() {
  const queryClient = useQueryClient();
  const { data, error, isPending, refetch, isFetching } = useCategories();
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const sortedCategories = useMemo(() => data ?? [], [data]);
  const hasCategories = sortedCategories.length > 0;
  const showEmpty = !isPending && !error && !hasCategories;

  const refreshCategoryData = async (includeDashboard: boolean) => {
    await queryClient.invalidateQueries({ queryKey: ["categories"] });
    if (includeDashboard) {
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  };

  const handleCreate = async (payload: { categoryName: string }) => {
    setActionError(null);
    const category = await createMutation.mutateAsync(payload);
    await refreshCategoryData(true);
    return category;
  };

  const handleEdit = async (payload: { categoryName: string }) => {
    if (!editingCategory) {
      throw new Error("Category not found.");
    }

    setActionError(null);
    const category = await updateMutation.mutateAsync({
      id: editingCategory.id,
      payload,
    });
    await refreshCategoryData(false);
    return category;
  };

  const handleDelete = (category: Category) => {
    setActionError(null);
    setDeletingCategory(category);
  };

  const confirmDelete = async () => {
    if (!deletingCategory) {
      return;
    }

    try {
      setActionError(null);
      await deleteMutation.mutateAsync(deletingCategory.id);
      await refreshCategoryData(true);
      setDeletingCategory(null);
    } catch (mutationError) {
      setActionError(
        (mutationError as Error).message || "Category could not be deleted."
      );
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <PageHeader onAdd={() => setIsCreateOpen(true)} />

        {actionError ? <InlineAlert variant="error">{actionError}</InlineAlert> : null}

        {error ? (
          <ErrorState
            message={error.message ?? "Please try again in a moment."}
            onRetry={() => refetch()}
            retrying={isFetching}
          />
        ) : (
          <section className="rounded-2xl border border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-5 py-5 sm:px-6">
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Category Table
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Category name and actions.
                </p>
              </div>
            </div>

            {isPending ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-b border-border">
                    <tr className="text-left text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      <th className="px-5 py-4 sm:px-6">Category Name</th>
                      <th className="px-5 py-4 sm:px-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <TableSkeletonRow key={index} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : showEmpty ? (
              <EmptyState onAdd={() => setIsCreateOpen(true)} />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-b border-border">
                    <tr className="text-left text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      <th className="px-5 py-4 sm:px-6">Category Name</th>
                      <th className="px-5 py-4 sm:px-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCategories.map((category) => (
                      <CategoryRow
                        key={category.id}
                        category={category}
                        onEdit={setEditingCategory}
                        onDelete={handleDelete}
                        deleting={
                          deleteMutation.isPending &&
                          deleteMutation.variables === category.id
                        }
                        disabled={updateMutation.isPending || deleteMutation.isPending}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>

      <CategoryFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        mode="create"
        categories={sortedCategories}
        isSubmitting={createMutation.isPending}
        onSubmit={handleCreate}
      />

      <CategoryFormDialog
        open={Boolean(editingCategory)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingCategory(null);
          }
        }}
        mode="edit"
        category={editingCategory}
        categories={sortedCategories}
        isSubmitting={updateMutation.isPending}
        onSubmit={handleEdit}
      />

      <ConfirmDialog
        open={Boolean(deletingCategory)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingCategory(null);
          }
        }}
        title="Delete Category"
        description={
          deletingCategory
            ? `Delete "${deletingCategory.categoryName}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete Category"
        confirmVariant="destructive"
        isConfirming={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </main>
  );
}
