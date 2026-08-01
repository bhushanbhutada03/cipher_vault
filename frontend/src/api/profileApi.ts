import { axiosInstance } from "@/api/axiosInstance";

export interface UpdateProfileRequest {
  fullName: string;
}

export interface ChangeLoginPasswordRequest {
  currentPassword?: string;
  newPassword?: string;
}

export interface ChangeMasterPasswordRequest {
  currentMasterPassword?: string;
  newMasterPassword?: string;
}

export interface ProfileResponseData {
  id: number;
  fullName: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
}

export const profileApi = {
  async getProfile(): Promise<ProfileResponseData> {
    const { data } = await axiosInstance.get<ProfileResponseData>("/api/profile");
    return data;
  },

  async updateProfile(payload: UpdateProfileRequest): Promise<ProfileResponseData> {
    const { data } = await axiosInstance.put<ProfileResponseData>("/api/profile", payload);
    return data;
  },

  async changeLoginPassword(payload: ChangeLoginPasswordRequest): Promise<{ message: string }> {
    const { data } = await axiosInstance.put<{ message: string }>("/api/profile/login-password", payload);
    return data;
  },

  async changeMasterPassword(payload: ChangeMasterPasswordRequest): Promise<{ message: string }> {
    const { data } = await axiosInstance.put<{ message: string }>("/api/profile/master-password", payload);
    return data;
  },
};
