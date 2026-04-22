/**
 * AdminLoginPage.tsx
 * Admin-only login page — styled to match the NEA CleanTrack design system.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Leaf, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuthContext } from "../../../context/AdminAuthContext";
import { adminApiService } from "../../../services/adminApiService";

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { onLoginSuccess } = useAdminAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const result = await adminApiService.login(email, password);
      if (!result) throw new Error("Login failed. Please check your credentials.");

      if (result.user.role !== "admin") {
        throw new Error(
          "Access denied. This panel is for administrators only."
        );
      }

      onLoginSuccess(result.accessToken, result.user, result.tokenExpiry);
      toast.success(`Welcome back, ${result.user.name}!`);
      navigate("/admin/dashboard");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0f4772 0%, #0a2d4e 50%, #051d34 100%)" }}
    >
      {/* Decorative blobs */}
      <div
        className="fixed top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
        style={{ background: "#96c93d", filter: "blur(80px)" }}
      />
      <div
        className="fixed bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
        style={{ background: "#107acc", filter: "blur(80px)" }}
      />

      {/* Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
        {/* Top accent bar */}
        <div
          className="h-1.5 w-full"
          style={{ background: "linear-gradient(90deg, #96c93d, #107acc)" }}
        />

        <div className="p-8">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
              style={{ background: "#0f4772" }}
            >
              <Leaf size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none">
                NEA <span style={{ color: "#107acc" }}>CleanTrack</span>
              </h1>
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-0.5">
                Admin Panel
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-gray-400 font-medium mt-1">
              Sign in to access the Admin Dashboard
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
              <p className="text-xs text-red-600 font-bold">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5"
              >
                Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nea.gov.sg"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 transition"
                style={{ "--tw-ring-color": "#107acc" } as React.CSSProperties}
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 transition"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-3 rounded-2xl text-white font-black text-sm shadow-md transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "#0f4772" }}
              id="admin-login-btn"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In to Admin Panel"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-[11px] text-gray-400 font-medium mt-6">
            Keep Singapore Clean · Public Hygiene Council
          </p>
        </div>
      </div>
    </div>
  );
};
