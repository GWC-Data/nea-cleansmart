import React, { useState } from "react";
import { Leaf } from "lucide-react";
import { RegisterForm } from "../../../components/auth/RegisterForm";

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Animated Wrapper */}
      <div className="w-full max-w-lg animate-slide-up opacity-0">
        {/* Header branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="w-8 h-8 text-secondary" />
            <span className="text-2xl font-bold text-gray-900 tracking-tight">NEA - CleanTrack</span>
          </div>
          
          {isRegistered ? null : (
            <>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Create your account</h1>
              <p className="text-sm text-gray-500">Join the clean-up challenge today</p>
            </>
          )}
        </div>

        {/* Form/Confirmation Container */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] border border-gray-100 p-7 sm:p-9">
          {isRegistered ? (
             <div className="text-center space-y-4">
               <div className="text-6xl mb-6">✅</div>
               <h2 className="text-2xl font-bold text-gray-900">You're registered!</h2>
               <p className="text-base text-gray-600 leading-relaxed max-w-sm mx-auto">
                 Thank you! Your registration for the 15-hour Virtual Clean-up Challenge has been confirmed.
               </p>
               <button
                 onClick={onNavigateToLogin}
                 className="mt-8 w-full bg-secondary hover:bg-secondary-hover text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm text-lg"
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
  );
};
