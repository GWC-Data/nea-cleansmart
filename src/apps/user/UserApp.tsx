/**
 * UserApp.tsx
 * Root component for the User-facing application.
 * Handles top-level routing between: Landing → Register → Login → Dashboard
 *
 * Currently manages routing with a simple state machine.
 * Replace with React Router when the project grows.
 */

import React, { useState } from "react";
import { AuthProvider } from "../../context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

// Extend this union as new pages are added
type AppScreen = "login" | "register" | "dashboard";

export const UserApp: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("login");

  return (
    <AuthProvider>
      {currentScreen === "register" && (
        <RegisterPage
          onNavigateToLogin={() => setCurrentScreen("login")}
        />
      )}

      {currentScreen === "login" && (
        <LoginPage
          onLoginSuccess={() => setCurrentScreen("dashboard")}
          onNavigateToRegister={() => setCurrentScreen("register")}
        />
      )}

      {currentScreen === "dashboard" && (
        // TODO: Replace with <ParticipantDashboard /> in the next phase
        <div className="p-8 text-green-800 font-bold">
          Dashboard — coming soon
        </div>
      )}
    </AuthProvider>
  );
};
