import React from "react";

import { LoginForm } from "../../../components/sections/auth/LoginForm";
import heroBg from "../../../assets/logIn.png";

interface LoginPageProps {
  onLoginSuccess: () => void;
  onNavigateToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
}) => {
  return (
    <div className="min-h-screen bg-background flex lg:flex-row font-sans">
      {/* Left Pane - Desktop Only */}
      <div className="hidden lg:flex h-screen aspect-square shrink-0 bg-[#f8fcf9]">
        <img
          src={heroBg}
          alt="Keep Singapore Clean 2026"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Right Pane (Form) */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 xl:p-16 relative bg-white">
        <div className="w-full max-w-sm animate-slide-up opacity-0">
          <div className="bg-transparent w-full">
            <LoginForm
              onSuccess={onLoginSuccess}
              onNavigateToRegister={onNavigateToRegister}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
