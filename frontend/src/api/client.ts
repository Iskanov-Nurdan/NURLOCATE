const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getTokens() {
  return {
    access: localStorage.getItem("access_token"),
    refresh: localStorage.getItem("refresh_token")
  };
}

function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
    return JSON.parse(json) as { exp?: number };
  } catch {
    return null;
  }
}

function isTokenExpiring(token: string) {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now() + 30_000;
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

async function refreshAccessToken(): Promise<string | null> {
  const { refresh } = getTokens();
  if (!refresh) return null;

  const res = await fetch(`${API_BASE}/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh })
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const data = (await res.json()) as { access: string };
  localStorage.setItem("access_token", data.access);
  return data.access;
}

let refreshPromise: Promise<string | null> | null = null;

export async function getValidAccessToken(): Promise<string | null> {
  const { access, refresh } = getTokens();
  if (!access && !refresh) return null;
  if (access && !isTokenExpiring(access)) return access;

  refreshPromise ??= refreshAccessToken().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (options.auth !== false) {
    const access = await getValidAccessToken();
    if (access) headers.Authorization = `Bearer ${access}`;
  }

  let response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (response.status === 401 && options.auth !== false) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      headers.Authorization = `Bearer ${newAccess}`;
      response = await fetch(`${API_BASE}${path}`, {
        method: options.method ?? "GET",
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
      });
    }
  }

  if (!response.ok) {
    let message = response.statusText;
    try {
      const payload = (await response.json()) as { detail?: string };
      if (payload.detail) message = payload.detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export { API_BASE, ApiError };
