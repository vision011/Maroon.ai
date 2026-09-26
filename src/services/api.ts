/**
 * Base API client. Mock-backed for now.
 * TODO: point API_BASE_URL at the real UMN gateway (see .env.example).
 */
export const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "/api";

const NETWORK_DELAY_MS = 450;

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 500,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Simulates a typed network round trip so services can be swapped for real fetches later. */
export async function mockRequest<T>(path: string, payload: T): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS));
  if (typeof console !== "undefined") console.debug(`[api] GET ${API_BASE_URL}${path}`);
  return payload;
}

export function authHeaders(token: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
