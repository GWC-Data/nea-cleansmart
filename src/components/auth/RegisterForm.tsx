import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import type { RegisterFormState } from "../../types/auth.types";

interface RegisterFormProps {
  onSuccess: () => void;
  onNavigateToLogin: () => void;
}

const INITIAL_STATE: RegisterFormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onNavigateToLogin,
}) => {
  const { handleRegister, isSubmitting, error } = useAuth();
  const [form, setForm] = useState<RegisterFormState>(INITIAL_STATE);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    if (!form.name.trim()) { setValidationError("Name is required."); return false; }
    if (!form.email.includes("@")) { setValidationError("Valid email is required."); return false; }
    if (form.password.length < 6) { setValidationError("Password must be at least 6 characters."); return false; }
    if (form.password !== form.confirmPassword) { setValidationError("Passwords do not match."); return false; }
    setValidationError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    handleRegister(form, onSuccess);
  };

  const displayError = validationError ?? error;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {displayError && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {displayError}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-name" className="flex items-center gap-2 text-sm font-semibold text-gray-500">
          <div className="bg-[#1d7fc4]/10 p-1 rounded-full"><User className="w-3.5 h-3.5 text-[#1d7fc4]" /></div>
          Full Name
        </label>
        <input
          id="reg-name"
          name="name"
          type="text"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          required
          className="bg-white border-2 border-[#6aa9e9] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#1d7fc4] focus:ring-1 focus:ring-[#1d7fc4] transition-all placeholder:text-gray-400"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-email" className="flex items-center gap-2 text-sm font-semibold text-gray-500">
          <div className="bg-[#1d7fc4]/10 p-1 rounded-full"><Mail className="w-3.5 h-3.5 text-[#1d7fc4]" /></div>
          Email Address
        </label>
        <input
          id="reg-email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          required
          className="bg-white border-2 border-[#6aa9e9] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#1d7fc4] focus:ring-1 focus:ring-[#1d7fc4] transition-all placeholder:text-gray-400"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-password" className="flex items-center gap-2 text-sm font-semibold text-gray-500">
          <div className="bg-[#1d7fc4]/10 p-1 rounded-full"><Lock className="w-3.5 h-3.5 text-[#1d7fc4]" /></div>
          Password
        </label>
        <div className="relative">
          <input
            id="reg-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full bg-white border-2 border-[#6aa9e9] rounded-lg pl-3.5 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#1d7fc4] focus:ring-1 focus:ring-[#1d7fc4] transition-all placeholder:text-gray-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1d7fc4] hover:text-[#0b4d7c] transition-colors focus:outline-none"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-confirm-password" className="flex items-center gap-2 text-sm font-semibold text-gray-500">
          <div className="bg-[#1d7fc4]/10 p-1 rounded-full"><Lock className="w-3.5 h-3.5 text-[#1d7fc4]" /></div>
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="reg-confirm-password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="w-full bg-white border-2 border-[#6aa9e9] rounded-lg pl-3.5 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#1d7fc4] focus:ring-1 focus:ring-[#1d7fc4] transition-all placeholder:text-gray-400"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1d7fc4] hover:text-[#0b4d7c] transition-colors focus:outline-none"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#96c93d] hover:bg-[#86b537] disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors shadow-sm mt-5"
      >
        {isSubmitting ? "Creating..." : "Create Account"}
      </button>

      <div className="text-center text-sm text-gray-500 mt-2">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onNavigateToLogin}
          className="text-secondary font-semibold hover:underline"
        >
          Log in
        </button>
      </div>
    </form>
  );
};
