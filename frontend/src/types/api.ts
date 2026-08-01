export interface ApiError {
  status: number;
  error?: string;
  message: string;
  fieldErrors?: Record<string, string>;
  remainingSeconds?: number;
  remainingAttempts?: number;
}
