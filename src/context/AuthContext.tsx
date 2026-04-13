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
        await refreshUserProfile(); // await it
      }
      setIsLoading(false); // runs after profile is loaded
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
