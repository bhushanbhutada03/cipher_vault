import { useMutation, useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/api/categoryApi";
import type { ApiError } from "@/types/api";
import type { Category, CategoryRequest } from "@/types/category";

export function useCategories() {
  return useQuery<Category[], ApiError>({
    queryKey: ["categories"],
    queryFn: () => categoryApi.getCategories(),
  });
}

export function useDeleteCategoryMutation() {
  return useMutation<void, ApiError, number>({
    mutationFn: (id) => categoryApi.deleteCategory(id),
  });
}

export function useCreateCategoryMutation() {
  return useMutation<Category, ApiError, CategoryRequest>({
    mutationFn: (payload) => categoryApi.createCategory(payload),
  });
}

export function useUpdateCategoryMutation() {
  return useMutation<Category, ApiError, { id: number; payload: CategoryRequest }>({
    mutationFn: ({ id, payload }) => categoryApi.updateCategory(id, payload),
  });
}
