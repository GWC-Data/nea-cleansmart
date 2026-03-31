import React from "react";

import { LoginForm } from "../../../components/auth/LoginForm";
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
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative bg-primary-dark overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
        </div>
      </div>

      {/* Right Pane (Form) */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 xl:p-16 relative bg-white">
        <div className="w-full max-w-sm animate-slide-up opacity-0">
          <div className="text-center mb-8 lg:mb-10">
            <h1 className="text-3xl xl:text-4xl font-extrabold text-[#1d7fc4] tracking-tight">
              Log In
            </h1>
          </div>

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
