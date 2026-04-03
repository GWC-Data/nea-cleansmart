/**
 * auth.types.ts
 * All TypeScript interfaces and types related to authentication.
 * Mirrors the backend API request/response shapes.
 */

// ─── Request Payloads ────────────────────────────────────────────────────────

/** Payload sent to POST /users for new account creation */
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin"; // Default to "user" for the User App
  age?: string;
  gender?: string;
}

/** Payload sent to POST /auth/login */
export interface LoginPayload {
  email: string;
  password: string;
}

// ─── Response Shapes ─────────────────────────────────────────────────────────

/** User object returned from the backend */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

/** Successful login response containing JWT token */
export interface AuthResponse {
  token: string;
  user: UserProfile;
}

// ─── Form State ───────────────────────────────────────────────────────────────

/** Local state shape for the registration form */
export interface RegisterFormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  age?: string;
  gender?: string;
}

/** Local state shape for the login form */
export interface LoginFormState {
  email: string;
  password: string;
}
