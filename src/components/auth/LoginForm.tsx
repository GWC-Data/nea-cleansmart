import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import type { LoginFormState } from "../../types/auth.types";
import { toast } from "sonner";

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
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  React.useEffect(() => {
    if (error) {
      toast.error("Email or password is incorrect", { duration: 5000 });
    }
  }, [error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(form, onSuccess);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="login-email"
          className="flex items-center gap-2 text-sm font-semibold text-gray-500"
        >
          <div className="bg-[#1d7fc4]/10 p-1 rounded-full">
            <Mail className="w-3.5 h-3.5 text-[#1d7fc4]" />
          </div>
          Email Address
        </label>
        <input
          id="login-email"
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
        <label
          htmlFor="login-password"
          className="flex items-center gap-2 text-sm font-semibold text-gray-500"
        >
          <div className="bg-[#1d7fc4]/10 p-1 rounded-full">
            <Lock className="w-3.5 h-3.5 text-[#1d7fc4]" />
          </div>
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
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
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="cursor-pointer w-full bg-[#96c93d] hover:bg-[#86b537] disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors shadow-sm mt-4"
      >
        {isSubmitting ? "Signing in..." : "Sign In"}
      </button>

      <div className="text-center text-sm text-gray-500 mt-2">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onNavigateToRegister}
          className="cursor-pointer text-secondary font-semibold hover:underline"
        >
          Register
        </button>
      </div>
    </form>
  );
};
