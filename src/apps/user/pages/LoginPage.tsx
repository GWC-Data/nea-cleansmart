import React from "react";
import { Leaf } from "lucide-react";
import { LoginForm } from "../../../components/auth/LoginForm";

interface LoginPageProps {
  onLoginSuccess: () => void;
  onNavigateToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
}) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Animated Wrapper */}
      <div className="w-full max-w-md animate-slide-up opacity-0">
        {/* Header branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="w-8 h-8 text-secondary" />
            <span className="text-2xl font-bold text-gray-900 tracking-tight">NEA - CleanTrack</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-sm text-gray-500">
            Sign in to continue your clean-up journey
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] border border-gray-100 p-7 sm:p-9">
          <LoginForm
            onSuccess={onLoginSuccess}
            onNavigateToRegister={onNavigateToRegister}
          />
        </div>
      </div>
    </div>
  );
};
