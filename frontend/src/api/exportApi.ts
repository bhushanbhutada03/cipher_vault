import { axiosInstance } from "./axiosInstance";

export const exportApi = {
  async exportCsv(): Promise<string> {
    const { data } = await axiosInstance.get<string>(
      "/api/export/csv",
      { responseType: "text" }
    );
    return data;
  }
};
