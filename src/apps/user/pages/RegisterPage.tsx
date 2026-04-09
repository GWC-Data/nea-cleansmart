import React, { useState } from "react";

import { RegisterForm } from "../../../components/auth/RegisterForm";
import heroBg from "../../../assets/signUp.png";

interface RegisterPageProps {
  onNavigateToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigateToLogin,
}) => {
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegistrationSuccess = () => {
    setIsRegistered(true);
  };

  return (
    <div className="min-h-screen bg-background flex lg:flex-row font-sans">
      {/* Left Pane - Desktop Only */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-1/2 relative bg-[#f8fcf9] overflow-hidden items-center justify-center p-3 lg:p-3">
        <img 
          src={heroBg} 
          alt="Register Graphic" 
          className="w-full h-full object-contain max-h-[800px]" 
        />
      </div>

      {/* Right Pane (Form) */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative bg-white">
        <div className="w-full max-w-md animate-slide-up opacity-0">
          <div className="text-center mb-4 lg:mb-6">
            {isRegistered ? null : (
              <>
                {/* Desktop Header */}
                <h1 className="text-2xl xl:text-3xl font-extrabold text-[#1d7fc4] tracking-tight">
                  Create Your Account
                </h1>
              </>
            )}
          </div>

          <div className="bg-transparent w-full">
            {isRegistered ? (
              <div className="text-center space-y-4 py-8">
                <div className="text-6xl mb-6">✅</div>
                <h2 className="text-2xl font-bold text-gray-900">
                  You're registered!
                </h2>
                <p className="text-base text-gray-600 leading-relaxed max-w-sm mx-auto">
                  Thank you! Your registration for the 15-hour Virtual Clean-up
                  Challenge has been confirmed.
                </p>
                <button
                  onClick={onNavigateToLogin}
                  className="cursor-pointer mt-8 w-full bg-secondary hover:bg-secondary-hover text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm text-lg"
                >
                  Log In Now
                </button>
              </div>
            ) : (
              <RegisterForm
                onSuccess={handleRegistrationSuccess}
                onNavigateToLogin={onNavigateToLogin}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
