import { getAccessToken, setAccessToken } from "./api";

const API_BASE = "http://localhost:8080/api";
const TOKEN_ENDPOINT =
  "http://localhost:9090/realms/leave-management-system/protocol/openid-connect/token";
const CLIENT_ID = "leave-management-web";
const CLIENT_SECRET = "emanbfVfDLqtnkmRchIoLriPDYzd7tYz";
const TOKEN_RESPONSE_STORAGE_KEY = "keycloak_token_response";
const USER_PROFILE_STORAGE_KEY = "leave_user_profile";

export type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
  token_type?: string;
  session_state?: string;
  scope?: string;
  [key: string]: unknown;
};

export type UserProfile = {
  username: string;
  email: string;
  fullname?: string;
  fullName?: string;
  role: "ROLE_ADMIN" | "ROLE_USER" | string;
  [key: string]: unknown;
};

export function cacheCurrentUser(profile: UserProfile) {
  localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export async function loginWithPassword(username: string, password: string) {
  const body = new URLSearchParams({
    grant_type: "password",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    username,
    password,
  });

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      payload?.error_description || payload?.error || "Login failed",
    );
  }

  const tokenResponse = payload as TokenResponse;
  setAccessToken(tokenResponse.access_token);
  localStorage.setItem(
    TOKEN_RESPONSE_STORAGE_KEY,
    JSON.stringify(tokenResponse),
  );

  return tokenResponse;
}

export async function fetchCurrentUser() {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Missing access token");
  }

  const response = await fetch(`${API_BASE}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      logout();

      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    throw new Error(
      payload?.message || payload?.error || "Failed to load user profile",
    );
  }

  const profile = payload as UserProfile;
  cacheCurrentUser(profile);

  return profile;
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}

export function getTokenResponse() {
  const value = localStorage.getItem(TOKEN_RESPONSE_STORAGE_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as TokenResponse;
  } catch {
    return null;
  }
}

export function getCurrentUser() {
  const value = localStorage.getItem(USER_PROFILE_STORAGE_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as UserProfile;
  } catch {
    return null;
  }
}

export function getDashboardPathForRole(role?: string) {
  return role === "ROLE_ADMIN" ? "/dashboard/admin" : "/dashboard/user";
}

export function logout() {
  setAccessToken("");
  localStorage.removeItem(TOKEN_RESPONSE_STORAGE_KEY);
  localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
}
