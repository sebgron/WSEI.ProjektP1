const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export interface FetchClientOptions extends RequestInit {
  // Extend RequestInit if needed in the future
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message?: string
  ) {
    super(message || `API Error: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

export async function fetchClient<T = unknown>(
  path: string,
  options: FetchClientOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage: string | undefined;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || JSON.stringify(errorData);
    } catch {
      // Response body is not JSON, use default message
    }
    throw new ApiError(response.status, response.statusText, errorMessage);
  }

  return response.json() as Promise<T>;
}
