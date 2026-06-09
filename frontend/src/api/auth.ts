import type { User } from "../types";
import { apiRequest, setTokens } from "./client";

export async function login(username: string, password: string) {
  const tokens = await apiRequest<{ access: string; refresh: string }>("/auth/login/", {
    method: "POST",
    body: { username, password },
    auth: false
  });
  setTokens(tokens.access, tokens.refresh);
  return getMe();
}

export async function register(data: {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}) {
  return apiRequest<User>("/auth/register/", { method: "POST", body: data, auth: false });
}

export async function getMe() {
  return apiRequest<User>("/auth/me/");
}

export async function logout() {
  try {
    await apiRequest("/auth/logout/", { method: "POST" });
  } catch {
    /* server logout is advisory */
  }
}
