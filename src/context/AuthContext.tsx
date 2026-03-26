/**
 * AuthContext.tsx
 * Provides global authentication state accessible to all components.
 * Wrap the app root with <AuthProvider> to enable context.
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import type { UserProfile } from "../types/auth.types";
import {
  getToken,
  getUserProfile,
  saveToken,
  saveUserProfile,
  clearAuthData,
} from "../utils/tokenUtils";

// ─── Context Shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** Currently logged-in user, or null if unauthenticated */
  currentUser: UserProfile | null;

  /** JWT token string, or null */
  token: string | null;

  /** True while auth state is being rehydrated from storage */
  isLoading: boolean;

  /** Call after a successful login to persist auth state */
  onLoginSuccess: (token: string, user: UserProfile) => void;

  /** Clears all auth data and resets state */
  logout: () => void;
}

// ─── Context & Hook ───────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

/** Use inside any component to access auth state and actions */
export const useAuthContext = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used inside <AuthProvider>");
  }
  return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** Rehydrate auth state from localStorage on first mount */
  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUserProfile();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setCurrentUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  /** Persist and set auth state after successful login */
  const onLoginSuccess = (newToken: string, user: UserProfile) => {
    saveToken(newToken);
    saveUserProfile(user);
    setToken(newToken);
    setCurrentUser(user);
  };

  /** Clear all auth data and reset state */
  const logout = () => {
    clearAuthData();
    setToken(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, token, isLoading, onLoginSuccess, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
