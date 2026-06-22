// Base URL is proxied through Vite dev server to avoid CORS in development.
// In production the React app is served from the same origin as the backend.
const BASE_URL = "/api";

// ─── Response shapes (mirrors backend DTOs) ──────────────────────────────────

export interface AuthResponse {
  token?: string;
  requiresTwoFactor?: boolean;
  qrCode?: string;
  message?: string;
}

export interface MailMessageDto {
  uid: number;
  from: string;
  subject: string;
  sentAt: string;
  seen: boolean;
}

export interface MailMessageDetailDto {
  uid: number;
  from: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  seen: boolean;
}

// ─── Request shapes ───────────────────────────────────────────────────────────

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface Verify2faRequest {
  username: string;
  code: number; // Integer on the backend — always parse before sending
}

export interface SendMailRequest {
  to: string;
  subject: string;
  body: string;
}

// ─── Internal helper ──────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options?: RequestInit,
  auth = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Surface the backend error message when available
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.message ?? `Request failed: ${response.status}`);
  }

  // 204 No Content — nothing to parse
  if (response.status === 204) return undefined as T;

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────

export const authApi = {
  login(data: LoginRequest): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  register(data: RegisterRequest): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  verifyTwoFactor(data: Verify2faRequest): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/verify-2fa", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Requires a valid JWT — used after login to enable 2FA
  setupTwoFactor(): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/setup-2fa", { method: "POST" }, true);
  },
};

// ─── Mail endpoints ───────────────────────────────────────────────────────────

export const mailApi = {
  getInbox(): Promise<MailMessageDto[]> {
    return request<MailMessageDto[]>("/mail/inbox", {}, true);
  },

  getMessage(uid: number): Promise<MailMessageDetailDto> {
    return request<MailMessageDetailDto>(`/mail/${uid}`, {}, true);
  },

  send(data: SendMailRequest): Promise<void> {
    return request<void>("/mail/send", {
      method: "POST",
      body: JSON.stringify(data),
    }, true);
  },
};