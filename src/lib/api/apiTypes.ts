export type ApiError = { message: string, unAuthorized?: boolean, validateErrors?: Map<string, string> | null };

export type ApiResponse<T> = { success: boolean, responseData: T | null, status: number, error: ApiError | null };
