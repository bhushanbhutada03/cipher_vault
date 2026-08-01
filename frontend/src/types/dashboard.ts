export interface RecentCredential {
  id: number;
  websiteName: string;
  websiteUrl: string;
  categoryName: string;
  favorite: boolean;
  faviconUrl: string;
}

export interface DashboardResponse {
  totalCredentials: number;
  favoriteCredentials: number;
  totalCategories: number;
  recentCredentials: RecentCredential[];
}
