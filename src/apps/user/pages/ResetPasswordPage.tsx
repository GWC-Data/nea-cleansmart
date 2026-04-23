import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Lock,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { apiService } from "../../../services/apiService";

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simple password strength calculation
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length > 7) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score < 2) return { text: "Weak", color: "bg-red-400" };
    if (score === 2) return { text: "Moderate", color: "bg-yellow-400" };
    if (score >= 3) return { text: "Strong", color: "bg-green-500" };
    return { text: "", color: "bg-gray-200" };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const success = await apiService.resetPassword(token, password);
    setIsSubmitting(false);

    if (success) {
      toast.success("Password reset successfully! You can now log in.");
      navigate("/login");
    } else {
      toast.error("Failed to reset password. The link might be expired.");
    }
  };

  return (
    <div className="min-h-screen bg-[#e8f3ea] flex items-center justify-center p-4 lg:p-8 font-sans relative overflow-hidden">
      {/* Background decoration to simulate ecosystem blurred leaves */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#d1ebd6] rounded-full blur-3xl opacity-60"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#c2e4c9] rounded-full blur-3xl opacity-50"></div>

      {/* Main Card Container */}
      <div className="relative w-full max-w-5xl bg-white rounded-[2rem] lg:rounded-[3rem] shadow-xl overflow-hidden flex flex-col lg:flex-row">
        {/* Left Side (Informational / Branding) */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#eaf4ed] p-12 xl:p-16 flex-col justify-center border-r border-[#dcfce7]">
          <div className="w-16 h-16 bg-[#08351e] rounded-full flex items-center justify-center mb-8 shadow-md">
            <Lock className="w-8 h-8 text-[#9bf8b7]" />
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-gray-900 leading-tight mb-4 tracking-tight">
            Secure your
            <br />
            <span className="text-[#08351e]">ecosystem.</span>
          </h1>

          <p className="text-gray-600 text-lg leading-relaxed mb-10 max-w-md">
            Restore access to your EcoPulse account. A strong password keeps
            your environmental contributions safe and your community impact
            growing.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#155e32] p-1 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-[#08351e]">
                End-to-end encrypted security
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-[#155e32] p-1 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-[#08351e]">
                Eco-positive infrastructure
              </span>
            </div>
          </div>
        </div>

        {/* Right Side (Form) */}
        <div className="w-full lg:w-1/2 p-8 sm:p-10 lg:p-12 xl:p-16 flex flex-col justify-center bg-white relative z-10">
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={() => navigate("/login")}
                className="text-[#08351e]"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <span className="font-bold text-[#08351e] text-lg">
                Reset Password
              </span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 leading-tight mb-2 tracking-tight">
              Secure your <br />
              <span className="text-[#08351e]">Ecosystem.</span>
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              Choose a strong password to keep your EcoPulse data and
              environmental impact safe.
            </p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-10">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
              Reset Password
            </h2>
            <p className="text-gray-500 font-medium">
              Please enter your new credentials below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-11 pr-12 py-3.5 bg-[#f3f6f4] border-none rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-[#08351e] outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Password Strength UI */}
              {password.length > 0 && (
                <div className="mt-3">
                  <div className="flex gap-2 h-1.5 mb-2">
                    <div
                      className={`flex-1 rounded-full ${password.length > 0 ? strength.color : "bg-gray-200"}`}
                    ></div>
                    <div
                      className={`flex-1 rounded-full ${strength.text === "Moderate" || strength.text === "Strong" ? strength.color : "bg-gray-200"}`}
                    ></div>
                    <div
                      className={`flex-1 rounded-full ${strength.text === "Strong" ? strength.color : "bg-gray-200"}`}
                    ></div>
                    <div
                      className={`flex-1 rounded-full ${strength.text === "Strong" ? strength.color : "bg-gray-200"}`}
                    ></div>
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Password strength:{" "}
                    <span className="text-gray-900">{strength.text}</span>
                  </p>
                </div>
              )}
              {password.length === 0 && (
                <p className="text-[10px] italic text-gray-400 mt-2">
                  Min. 8 characters with a symbol and number
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full pl-11 pr-12 py-3.5 bg-[#f3f6f4] border-none rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-[#08351e] outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-500 hover:text-gray-700"
                >
                  {password &&
                  confirmPassword &&
                  password === confirmPassword ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : showConfirm ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Security Tip (Mobile Focused, but good for both) */}
            <div className="bg-[#e6f4ea] rounded-2xl p-4 flex gap-4 items-start relative overflow-hidden mt-6">
              <div className="bg-[#bfe6c9] p-2 rounded-xl shrink-0 z-10 relative">
                <ShieldCheck className="w-5 h-5 text-[#08351e]" />
              </div>
              <div className="z-10 relative">
                <h4 className="text-sm font-bold text-[#08351e] mb-1">
                  Security Tip
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed pr-4">
                  Use a combination of symbols, numbers, and capital letters for
                  maximum protection.
                </p>
              </div>
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#c8ecd2] rounded-full opacity-60 pointer-events-none"></div>
            </div>

            {/* Submit Actions */}
            <div className="pt-4 flex flex-col gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#08351e] hover:bg-[#0a4527] text-white font-bold py-4 rounded-full transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 cursor-pointer"
              >
                {isSubmitting ? "Updating..." : "Update Password"}
                {!isSubmitting && <ArrowRight className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full py-3 text-sm font-bold text-gray-500 hover:text-[#08351e] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
