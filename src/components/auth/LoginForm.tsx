import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Mail, Lock } from "lucide-react";
import type { LoginFormState } from "../../types/auth.types";
import { toast } from "sonner";
import { FloatingInput } from "../ui/FloatingInput";

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
    <form onSubmit={handleSubmit} className="space-y-5 md:space-y-7">
      <FloatingInput
        id="login-email"
        name="email"
        type="email"
        label="Email Address"
        value={form.email}
        onChange={handleChange}
        autoComplete="email"
        required
        icon={<Mail className="w-5 h-5" />}
      />

      <FloatingInput
        id="login-password"
        name="password"
        label="Password"
        value={form.password}
        onChange={handleChange}
        autoComplete="current-password"
        required
        showToggle
        icon={<Lock className="w-5 h-5" />}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="cursor-pointer w-full bg-[#96c93d] hover:bg-[#86b537] disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors shadow-sm"
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
