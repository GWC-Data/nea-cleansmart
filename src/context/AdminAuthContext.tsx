/**
 * AdminAuthContext.tsx
 * Provides global admin authentication state.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { UserProfile } from "../types/auth.types";
import {
  getAdminToken,
  saveAdminToken,
  clearAdminToken,
} from "../utils/tokenUtils";
import { adminApiService } from "../services/adminApiService";

interface AdminAuthContextValue {
  currentUser: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  onLoginSuccess: (token: string, user: UserProfile, expiry?: number) => void;
  refreshUserProfile: () => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export const useAdminAuthContext = (): AdminAuthContextValue => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx)
    throw new Error(
      "useAdminAuthContext must be used inside <AdminAuthProvider>",
    );
  return ctx;
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUserProfile = useCallback(async () => {
    try {
      const profile = await adminApiService.getCurrentUser();
      if (profile) setCurrentUser(profile);
    } catch (error) {
      console.error("Failed to refresh admin user profile:", error);
    }
  }, []);

  /** Restore admin auth state on app mount */
  useEffect(() => {
    const restore = async () => {
      const storedToken = getAdminToken();
      if (storedToken) {
        setToken(storedToken);
        await refreshUserProfile();
      }
      setIsLoading(false);
    };
    restore();
  }, [refreshUserProfile]);

  const onLoginSuccess = (
    newToken: string,
    user: UserProfile,
    expiry?: number,
  ) => {
    saveAdminToken(newToken, expiry);
    setToken(newToken);
    setCurrentUser(user);
  };

  const logout = () => {
    clearAdminToken();
    setToken(null);
    setCurrentUser(null);
  };

  return (
    <AdminAuthContext.Provider
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
    </AdminAuthContext.Provider>
  );
};
