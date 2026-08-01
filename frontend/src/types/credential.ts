export interface CreateCredentialRequest {
  categoryId: number;
  websiteName: string;
  websiteUrl?: string;
  username: string;
  email?: string;
  password: string;
  notes?: string;
  favorite: boolean;
}

export interface CredentialListResponse {
  id: number;
  websiteName: string;
  websiteUrl: string | null;
  categoryName: string;
  favorite: boolean;
  faviconUrl: string | null;
}

export interface CredentialDetailResponse {
  id: number;
  websiteName: string;
  websiteUrl: string | null;
  username: string;
  email: string | null;
  password?: string; // Nullable because it is masked initially; revealed explicitly
  notes: string | null;
  categoryName: string;
  favorite: boolean;
  faviconUrl: string | null;
}

export interface RevealCredentialRequest {
  masterPassword: string;
}

export interface UpdateCredentialRequest {
  masterPassword: string;
  categoryId: number;
  websiteName: string;
  websiteUrl?: string;
  username: string;
  email?: string;
  password?: string; // Optionally update password
  notes?: string;
  favorite: boolean;
}

export interface DeleteCredentialRequest {
  masterPassword: string;
}

export interface LockStatusResponse {
  locked: boolean;
  remainingSeconds: number;
}
