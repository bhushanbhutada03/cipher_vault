import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "@/api/profileApi";
import type { 
  UpdateProfileRequest, 
  ChangeLoginPasswordRequest, 
  ChangeMasterPasswordRequest, 
  ProfileResponseData 
} from "@/api/profileApi";
import { toast } from "sonner";
import type { ApiError } from "@/types/api";

export const PROFILE_QUERY_KEY = ["profile"];

export function useProfile() {
  return useQuery<ProfileResponseData, ApiError>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: profileApi.getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation<ProfileResponseData, ApiError, UpdateProfileRequest>({
    mutationFn: profileApi.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, data);
      toast.success("Profile updated successfully");
    },
  });
}

export function useChangeLoginPassword() {
  return useMutation<{ message: string }, ApiError, ChangeLoginPasswordRequest>({
    mutationFn: profileApi.changeLoginPassword,
    onSuccess: () => {
      toast.success("Login password changed successfully");
    },
  });
}

export function useChangeMasterPassword() {
  return useMutation<{ message: string }, ApiError, ChangeMasterPasswordRequest>({
    mutationFn: profileApi.changeMasterPassword,
    onSuccess: () => {
      toast.success("Master password changed successfully");
    },
  });
}
