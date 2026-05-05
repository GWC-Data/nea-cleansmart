/**
 * AuthContext.tsx
 * Provides global authentication state accessible to all components.
 * Wrap the app root with <AuthProvider> to enable context.
 *
 * Note: User profile is NOT persisted in localStorage.
 * It is fetched dynamically from the backend when needed.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { UserProfile } from "../types/auth.types";
import { getToken, saveToken, clearAuthData } from "../utils/tokenUtils";
import { apiService } from "../services/apiService";
import { orgApiService } from "../services/orgApiService";

/**
 * Decode the `role` claim from a JWT without verifying the signature.
 * Safe for client-side use only — the backend always validates the token.
 */
const getRoleFromToken = (token: string): string | null => {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded?.role ?? null;
  } catch {
    return null;
  }
};

// ─── Context Shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** Currently logged-in user, or null if unauthenticated */
  currentUser: UserProfile | null;

  /** JWT token string, or null */
  token: string | null;

  /** True while auth state is being rehydrated from storage */
  isLoading: boolean;

  /** Call after a successful login to persist auth state */
  onLoginSuccess: (token: string, user: UserProfile, expiry?: number) => void;

  /** Refresh user profile from backend */
  refreshUserProfile: () => Promise<void>;

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

  /** Fetch and update user profile from backend */
  const refreshUserProfile = useCallback(async () => {
    try {
      const profile = await apiService.getUserProfile();
      if (profile) {
        setCurrentUser(profile);
      }
    } catch (error) {
      console.error("Failed to refresh user profile:", error);
    }
  }, []);

  /** Restore auth state on app mount */
  useEffect(() => {
    const restore = async () => {
      const storedToken = getToken();
      if (storedToken) {
        setToken(storedToken);
        const role = getRoleFromToken(storedToken);

        if (role === "organization") {
          // Organization users: fetch profile from the org dashboard endpoint.
          // The /users/details endpoint is for User-table records only and would
          // return null/error for org accounts, causing an unwanted logout on refresh.
          const orgProfile = await orgApiService.getOrgProfile();
          if (orgProfile) {
            setCurrentUser(orgProfile as any);
          }
        } else if (role !== "admin") {
          // Regular users: standard profile fetch.
          // Admins use a separate token key and auth flow (AdminAuthContext), so
          // we skip them here to avoid a superfluous /users/details call.
          await refreshUserProfile();
        }
      }
      setIsLoading(false);
    };
    restore();
  }, [refreshUserProfile]);

  /** Persist and set auth state after successful login */
  const onLoginSuccess = (
    newToken: string,
    user: UserProfile,
    expiry?: number,
  ) => {
    saveToken(newToken, expiry);
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
      value={{
        currentUser,
        token,
        isLoading,
        onLoginSuccess,
        refreshUserProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
