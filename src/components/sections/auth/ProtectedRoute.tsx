import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "../../../context/AuthContext";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, isLoading } = useAuthContext();
  const location = useLocation();

  // Show loader first while auth state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-green-800 font-medium">
          Checking authentication...
        </div>
      </div>
    );
  }

  // Not logged in — save intended path and redirect to login
  if (!currentUser) {
    sessionStorage.setItem("redirect_after_login", location.pathname);
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
