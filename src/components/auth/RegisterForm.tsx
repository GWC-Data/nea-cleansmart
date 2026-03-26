import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
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
        <label htmlFor="reg-name" className="text-sm font-semibold text-gray-900">
          Full Name
        </label>
        <input
          id="reg-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          value={form.name}
          onChange={handleChange}
          required
          className="bg-background border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all placeholder:text-gray-400"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-email" className="text-sm font-semibold text-gray-900">
          Email
        </label>
        <input
          id="reg-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          required
          className="bg-background border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all placeholder:text-gray-400"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-password" className="text-sm font-semibold text-gray-900">
          Password
        </label>
        <input
          id="reg-password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Min 6 characters"
          value={form.password}
          onChange={handleChange}
          required
          className="bg-background border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all placeholder:text-gray-400"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-confirm-password" className="text-sm font-semibold text-gray-900">
          Confirm Password
        </label>
        <input
          id="reg-confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          className="bg-background border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all placeholder:text-gray-400"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-secondary hover:bg-secondary-hover disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm mt-3"
      >
        {isSubmitting ? "Registering..." : "Register"}
      </button>

      <div className="text-center text-sm text-gray-500 mt-6 border-t border-gray-100 pt-6">
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
