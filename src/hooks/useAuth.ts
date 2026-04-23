/**
 * useAuth.ts
 * Custom hook that composes auth service calls with context state updates.
 * Components should use this hook rather than calling authService directly.
 */

import { useState } from "react";
import { loginUser, registerUser } from "../services/authService";
import { useAuthContext } from "../context/AuthContext";
import { saveAdminToken } from "../utils/tokenUtils";
import type { LoginFormState, RegisterFormState } from "../types/auth.types";

export const useAuth = () => {
  const {
    onLoginSuccess,
    logout,
    currentUser,
    token,
    isLoading,
    refreshUserProfile,
  } = useAuthContext();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Register ──────────────────────────────────────────────────────────────

  /**
   * Handles registration form submission.
   * On success, navigates the user or triggers parent callback.
   */
  const handleRegister = async (
    formData: RegisterFormState,
    onSuccess: () => void,
  ) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "user", // Users registering via the User App are always "user" role
        ...(formData.age && { age: Number(formData.age) }), // only include if filled
        ...(formData.gender && { gender: formData.gender }), // only include if filled
      });
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Login ─────────────────────────────────────────────────────────────────

  /**
   * Handles login form submission.
   * Calls the auth service, then updates global auth context on success.
   */
  const handleLogin = async (
    formData: LoginFormState,
    onSuccess: () => void,
  ) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const { accessToken, tokenExpiry, user } = await loginUser(formData);

      if (user.role === "admin") {
        // Save to the isolated admin token key — do NOT touch user AuthContext
        saveAdminToken(accessToken, tokenExpiry);
        // Signal to LoginRoute that it should navigate to /admin/dashboard
        sessionStorage.setItem("login_role", "admin");
        onSuccess();
        return;
      }

      // Normal volunteer login
      onLoginSuccess(accessToken, user, tokenExpiry);
      await refreshUserProfile();
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    currentUser,
    token,
    isSubmitting,
    error,
    isLoading,
    handleLogin,
    handleRegister,
    logout,
    refreshUserProfile,
  };
};
