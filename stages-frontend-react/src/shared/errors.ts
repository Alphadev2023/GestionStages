export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export function getErrorMessage(e: unknown, fallback = 'Une erreur est survenue'): string {
  const err = e as ApiError;
  return err?.response?.data?.message ?? fallback;
}