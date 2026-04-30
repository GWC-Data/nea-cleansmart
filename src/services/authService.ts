import { ENV } from "../config/env";
import type {
  LoginPayload,
  RegisterPayload,
  AuthResponse,
  UserProfile,
} from "../types/auth.types";
import bcrypt from "bcryptjs";

const FRONTEND_SALT = "$2a$10$Xxxxxxxxxxxxxxxxxxxxxx";

const BASE = ENV.API_BASE_URL;

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * Creates a new user account.
 * Maps to: POST /users
 * Password is sent as plaintext over HTTPS; backend handles bcrypt hashing.
 */
export const registerUser = async (
  payload: RegisterPayload,
): Promise<UserProfile> => {
  const securePayload = { 
    ...payload, 
    password: bcrypt.hashSync(payload.password, FRONTEND_SALT) 
  };

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
  // Password hashed before sending
  const securePayload = { 
    ...payload,
    password: bcrypt.hashSync(payload.password, FRONTEND_SALT)
  };

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
