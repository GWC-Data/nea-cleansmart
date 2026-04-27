import { ENV } from "../config/env";
import bcrypt from "bcryptjs";
import type {
  LoginPayload,
  RegisterPayload,
  RegisterOrganizationPayload,
  AuthResponse,
  UserProfile,
} from "../types/auth.types";

const BASE = ENV.API_BASE_URL;
// We use a fixed salt so the frontend always generates the exact same hash for the same password.
// Be aware that frontend hashing is not a replacement for HTTPS.
const FRONTEND_SALT = "$2a$10$Xxxxxxxxxxxxxxxxxxxxxx";

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * Creates a new user account.
 * Maps to: POST /users
 */
export const registerOrganization = async (
  payload: RegisterOrganizationPayload,
): Promise<any> => {
  // Hash password before sending
  const hashedPassword = bcrypt.hashSync(payload.password, FRONTEND_SALT);
  const securePayload = { ...payload, password: hashedPassword };

  const res = await fetch(`${BASE}/organizations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(securePayload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.message ?? "Registration failed. Please try again.");
  }

  return res.json();
};

export const registerUser = async (
  payload: RegisterPayload,
): Promise<UserProfile> => {
  // Hash password before sending
  const hashedPassword = bcrypt.hashSync(payload.password, FRONTEND_SALT);
  const securePayload = { ...payload, password: hashedPassword };

  const res = await fetch(`${BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(securePayload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.message ?? "Registration failed. Please try again.");
  }

  return res.json() as Promise<UserProfile>;
};

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * Authenticates an existing user and returns a JWT token.
 * Maps to: POST /auth/login
 */
export const loginUser = async (
  payload: LoginPayload,
): Promise<AuthResponse> => {
  // Hash password before sending
  const hashedPassword = bcrypt.hashSync(payload.password, FRONTEND_SALT);
  const securePayload = { ...payload, password: hashedPassword };

  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(securePayload),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.message ?? "Login failed. Check your credentials.");
  }

  return res.json() as Promise<AuthResponse>;
};
