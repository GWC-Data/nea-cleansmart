import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import type { LoginFormState } from "../../types/auth.types";

interface LoginFormProps {
  onSuccess: () => void;
  onNavigateToRegister: () => void;
}

const INITIAL_STATE: LoginFormState = {
  email: "",
  password: "",
};

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onNavigateToRegister,
}) => {
  const { handleLogin, isSubmitting, error } = useAuth();
  const [form, setForm] = useState<LoginFormState>(INITIAL_STATE);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(form, onSuccess);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-email" className="text-sm font-semibold text-gray-900">
          Email
        </label>
        <input
          id="login-email"
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
        <label htmlFor="login-password" className="text-sm font-semibold text-gray-900">
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="********"
          value={form.password}
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
        {isSubmitting ? "Signing in..." : "Sign In"}
      </button>

      <div className="text-center text-sm text-gray-500 mt-6 border-t border-gray-100 pt-6">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onNavigateToRegister}
          className="text-secondary font-semibold hover:underline"
        >
          Register
        </button>
      </div>
    </form>
  );
};
