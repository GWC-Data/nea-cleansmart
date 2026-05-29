import React from "react";
import { useNavigate } from "react-router-dom";

import { LoginForm } from "../../../components/sections/auth/LoginForm";
import heroBg from "../../../assets/logIn.png";
import logo from "../../../assets/publicHygineCouncil.png";

interface LoginPageProps {
  onLoginSuccess: (role: string) => void;
  onNavigateToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
}) => {
  // Navigation hook to redirect to landing page on logo click
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex lg:flex-row font-sans">
      {/* Left Pane - Desktop Only (relative container to allow absolute positioning of logo overlay) */}
      <div className="hidden lg:flex h-screen aspect-square shrink-0 bg-[#f8fcf9] relative">
        <img
          src={heroBg}
          alt="Keep Singapore Clean 2026"
          className="w-full h-full object-contain"
        />
        {/* Accessible clickable overlay positioned precisely over the baked-in Public Hygiene Council logo */}
        <div
          onClick={() => navigate("/")}
          className="absolute top-[3%] left-[3%] w-[12%] h-[6%] cursor-pointer z-10 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8cc63f]"
          title="Go to Home"
          aria-label="Public Hygiene Council Logo - Go to Home"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              navigate("/");
            }
          }}
        />
      </div>

      {/* Right Pane (Form) */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 xl:p-16 relative bg-white">
        <div className="w-full max-w-sm animate-slide-up opacity-0">
          {/* Logo (visible on mobile and tablet — desktop logo sits inside left image) */}
          <img
            src={logo}
            alt="Public Hygiene Council"
            className="h-10 object-contain mb-8 lg:hidden mx-auto cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => navigate("/")}
            title="Go to Home"
          />
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
