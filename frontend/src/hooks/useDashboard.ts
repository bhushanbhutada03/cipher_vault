import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/api/dashboardApi";
import type { ApiError } from "@/types/api";
import type { DashboardResponse } from "@/types/dashboard";

export function useDashboard() {
  return useQuery<DashboardResponse, ApiError>({
    queryKey: ["dashboard"],
    queryFn: () => dashboardApi.getDashboard(),
  });
}
