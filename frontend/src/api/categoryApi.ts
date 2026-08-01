import { axiosInstance } from "@/api/axiosInstance";
import type { Category, CategoryRequest } from "@/types/category";

export const categoryApi = {
  async getCategories(): Promise<Category[]> {
    const { data } = await axiosInstance.get<Category[]>("/api/categories");
    return data;
  },

  async createCategory(payload: CategoryRequest): Promise<Category> {
    const { data } = await axiosInstance.post<Category>("/api/categories", payload);
    return data;
  },

  async updateCategory(id: number, payload: CategoryRequest): Promise<Category> {
    const { data } = await axiosInstance.put<Category>(`/api/categories/${id}`, payload);
    return data;
  },

  async deleteCategory(id: number): Promise<void> {
    await axiosInstance.delete(`/api/categories/${id}`);
  },
};
