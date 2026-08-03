import { axiosInstance } from "@/api/axiosInstance";
import type {
  CreateCredentialRequest,
  CredentialDetailResponse,
  CredentialListResponse,
  DeleteCredentialRequest,
  LockStatusResponse,
  RevealCredentialRequest,
  UpdateCredentialRequest,
  CredentialHistoryResponse,
} from "@/types/credential";

export const credentialApi = {
  async createCredential(payload: CreateCredentialRequest): Promise<void> {
    await axiosInstance.post("/api/credentials", payload);
  },

  async getAll(): Promise<CredentialListResponse[]> {
    const { data } = await axiosInstance.get<CredentialListResponse[]>("/api/credentials");
    return data;
  },

  async getFavorites(): Promise<CredentialListResponse[]> {
    const { data } = await axiosInstance.get<CredentialListResponse[]>("/api/credentials/favorites");
    return data;
  },

  async search(keyword: string): Promise<CredentialListResponse[]> {
    const { data } = await axiosInstance.get<CredentialListResponse[]>("/api/credentials/search", {
      params: { keyword },
    });
    return data;
  },

  async getById(id: number): Promise<CredentialListResponse> {
    const { data } = await axiosInstance.get<CredentialListResponse>(`/api/credentials/${id}`);
    return data;
  },

  async toggleFavorite(id: number): Promise<void> {
    await axiosInstance.patch(`/api/credentials/${id}/favorite`);
  },

  async getHistory(id: number): Promise<CredentialHistoryResponse[]> {
    const { data } = await axiosInstance.get<CredentialHistoryResponse[]>(`/api/credentials/${id}/history`);
    return data;
  },

  async reveal(id: number, payload: RevealCredentialRequest): Promise<CredentialDetailResponse> {
    const { data } = await axiosInstance.post<CredentialDetailResponse>(`/api/credentials/${id}/reveal`, payload);
    return data;
  },

  async update(id: number, payload: UpdateCredentialRequest): Promise<CredentialDetailResponse> {
    const { data } = await axiosInstance.put<CredentialDetailResponse>(`/api/credentials/${id}`, payload);
    return data;
  },

  async delete(id: number, payload: DeleteCredentialRequest): Promise<void> {
    await axiosInstance.delete(`/api/credentials/${id}`, { data: payload });
  },

  async getMasterPasswordLockStatus(): Promise<LockStatusResponse> {
    const response = await axiosInstance.get<LockStatusResponse>("/api/credentials/master-password/lock-status");
    return response.data;
  },
};
