import { axiosInstance } from "@/api/axiosInstance";
import type { DashboardResponse } from "@/types/dashboard";

export const dashboardApi = {
  async getDashboard(): Promise<DashboardResponse> {
    const { data } = await axiosInstance.get<DashboardResponse>("/api/dashboard");
    return data;
  },
};
