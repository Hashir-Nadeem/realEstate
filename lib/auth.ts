import { apiRequest } from "./api";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
}

export async function register(data: {
  fullName: string;
  email: string;
  password: string;
}) {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function login(data: {
  email: string;
  password: string;
}) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function forgotPassword(email: string) {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(data: {
  token: string;
  newPassword: string;
}) {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function refreshToken(refreshToken: string) {
  return apiRequest<AuthResponse>("/auth/refresh-token", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}
