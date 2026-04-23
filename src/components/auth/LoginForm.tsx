import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  Mail,
  Lock,
  Send,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import type { LoginFormState } from "../../types/auth.types";
import { toast } from "sonner";
import { FloatingInput } from "../ui/FloatingInput";
import { apiService } from "../../services/apiService";

interface LoginFormProps {
  onSuccess: () => void;
  onNavigateToRegister: () => void;
}

const INITIAL_STATE: LoginFormState = { email: "", password: "" };

type View = "login" | "forgot" | "sent";

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onNavigateToRegister,
}) => {
  const { handleLogin, isSubmitting, error } = useAuth();
  const [form, setForm] = useState<LoginFormState>(INITIAL_STATE);
  const [view, setView] = useState<View>("login");

  // Forgot-password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  React.useEffect(() => {
    if (error)
      toast.error("Email or password is incorrect", { duration: 5000 });
  }, [error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent multiple rapid clicks/submits
    handleLogin(form, onSuccess);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setIsSending(true);
    // TODO: Replace URL/method in apiService.requestPasswordReset once backend is ready.
    // Payload: { email: string }
    const success = await apiService.requestPasswordReset(forgotEmail);
    setIsSending(false);
    if (success) {
      setView("sent");
    } else {
      toast.error("Could not send OTP. Please try again.");
    }
  };

  // ─── Login view ─────────────────────────────────────────────────────────────
  if (view === "login") {
    return (
      <>
        <div className="text-center mb-4 lg:mb-6">
          <h1 className="text-2xl xl:text-3xl font-extrabold text-[#1d7fc4] tracking-tight">
            Log In
          </h1>
        </div>

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

          {/* Forgot password link */}
          <div className="flex justify-end -mt-3">
            <button
              type="button"
              onClick={() => {
                setForgotEmail("");
                setView("forgot");
              }}
              className="cursor-pointer text-sm text-[#1d7fc4] font-semibold hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mb-4 cursor-pointer w-full bg-[#96c93d] hover:bg-[#86b537] disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors shadow-sm"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>

          <div className="text-center text-sm text-gray-500">
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
      </>
    );
  }

  // ─── Forgot password — email input ──────────────────────────────────────────
  if (view === "forgot") {
    return (
      <>
        <div className="text-center mb-4 lg:mb-6">
          <h1 className="text-2xl xl:text-3xl font-extrabold text-[#1d7fc4] tracking-tight">
            Forgot Password?
          </h1>
        </div>

        <form onSubmit={handleSendOtp} className="space-y-5 md:space-y-7">
          <p className="text-sm text-gray-500 text-center -mt-2">
            Enter your registered email and we'll send you an OTP to reset your
            password.
          </p>

          <FloatingInput
            id="forgot-email"
            name="forgot-email"
            type="email"
            label="Email Address"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            autoComplete="email"
            required
            icon={<Mail className="w-5 h-5" />}
          />

          <button
            type="submit"
            disabled={isSending}
            className="cursor-pointer w-full bg-[#87b637] hover:bg-[#739a2e] disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending OTP…
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send OTP
              </>
            )}
          </button>

          {/* Back to login */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setView("login")}
              className="cursor-pointer flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1d7fc4] font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        </form>
      </>
    );
  }

  // ─── OTP sent — success confirmation ────────────────────────────────────────
  return (
    <>
      <div className="text-center mb-4 lg:mb-6">
        <h1 className="text-2xl xl:text-3xl font-extrabold text-[#1d7fc4] tracking-tight">
          Check Your Email
        </h1>
      </div>

      <div className="text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-9 h-9 text-green-500" />
        </div>

        <p className="text-sm text-gray-500">
          We've sent a one-time password to{" "}
          <span className="font-semibold text-gray-700">{forgotEmail}</span>.
          <br />
          Please check your inbox and follow the instructions.
        </p>

        <button
          type="button"
          onClick={() => {
            setForgotEmail("");
            setView("login");
          }}
          className="cursor-pointer w-full bg-[#87b637] hover:bg-[#739a2e] text-white font-bold py-3 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>
      </div>
    </>
  );
};
