import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  VenusAndMars,
  ChevronDown,
} from "lucide-react";
import type { RegisterFormState } from "../../types/auth.types";
import { toast } from "sonner";

interface RegisterFormProps {
  onSuccess: () => void;
  onNavigateToLogin: () => void;
}

const INITIAL_STATE: RegisterFormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  age: "",
  gender: "",
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
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const genderDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        genderDropdownRef.current &&
        !genderDropdownRef.current.contains(event.target as Node)
      ) {
        setIsGenderDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    if (!form.name.trim()) {
      setValidationError("Name is required.");
      return false;
    }
    if (!form.email.includes("@")) {
      setValidationError("Valid email is required.");
      return false;
    }
    if (form.password.length < 6) {
      setValidationError("Password must be at least 6 characters.");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setValidationError("Passwords do not match.");
      return false;
    }
    setValidationError(null);
    return true;
  };

  React.useEffect(() => {
    if (validationError) {
      toast.error(validationError, { duration: 5000 });
    }
  }, [validationError]);

  React.useEffect(() => {
    if (error) {
      toast.error(error, { duration: 5000 });
    }
  }, [error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    handleRegister(form, onSuccess);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 md:space-y-3">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="reg-name"
          className="flex items-center gap-2 text-sm font-semibold text-gray-500"
        >
          <div className="bg-[#1d7fc4]/10 p-1 rounded-full">
            <User className="w-3.5 h-3.5 text-[#1d7fc4]" />
          </div>
          Full Name <span className="text-red-500">*</span>
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
        <label
          htmlFor="reg-email"
          className="flex items-center gap-2 text-sm font-semibold text-gray-500"
        >
          <div className="bg-[#1d7fc4]/10 p-1 rounded-full">
            <Mail className="w-3.5 h-3.5 text-[#1d7fc4]" />
          </div>
          Email Address <span className="text-red-500">*</span>
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
        <label
          htmlFor="reg-password"
          className="flex items-center gap-2 text-sm font-semibold text-gray-500"
        >
          <div className="bg-[#1d7fc4]/10 p-1 rounded-full">
            <Lock className="w-3.5 h-3.5 text-[#1d7fc4]" />
          </div>
          Password <span className="text-red-500">*</span>
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
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="reg-confirm-password"
          className="flex items-center gap-2 text-sm font-semibold text-gray-500"
        >
          <div className="bg-[#1d7fc4]/10 p-1 rounded-full">
            <Lock className="w-3.5 h-3.5 text-[#1d7fc4]" />
          </div>
          Confirm Password <span className="text-red-500">*</span>
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
            {showConfirmPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="reg-age"
          className="flex items-center gap-2 text-sm font-semibold text-gray-500"
        >
          <div className="bg-[#1d7fc4]/10 p-1 rounded-full">
            <Calendar className="w-3.5 h-3.5 text-[#1d7fc4]" />
          </div>
          Age
        </label>
        <input
          id="reg-age"
          name="age"
          type="number"
          autoComplete="age"
          value={form.age}
          onChange={handleChange}
          className="w-full bg-white border-2 border-[#6aa9e9] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#1d7fc4] focus:ring-1 focus:ring-[#1d7fc4] transition-all placeholder:text-gray-400"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="reg-gender"
          className="flex items-center gap-2 text-sm font-semibold text-gray-500"
        >
          <div className="bg-[#1d7fc4]/10 p-1 rounded-full">
            <VenusAndMars className="w-3.5 h-3.5 text-[#1d7fc4]" />
          </div>
          Gender
        </label>
        <div className="relative" ref={genderDropdownRef}>
          <button
            type="button"
            onClick={() => setIsGenderDropdownOpen(!isGenderDropdownOpen)}
            className="w-full bg-white border-2 border-[#6aa9e9] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#1d7fc4] focus:ring-1 focus:ring-[#1d7fc4] transition-all text-left flex justify-between items-center text-gray-700"
          >
            <span className={form.gender ? "text-gray-900" : "text-gray-400"}>
              {form.gender || "Select Options"}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {isGenderDropdownOpen && (
            <div className="absolute z-10 w-full mt-1.5 bg-white border border-gray-100 rounded-lg shadow-lg py-1.5 animate-in fade-in slide-in-from-top-1 zoom-in-95 duration-200">
              {["Male", "Female", "Other"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, gender: option }));
                    setIsGenderDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#1d7fc4]/5 transition-colors ${form.gender === option ? "text-[#1d7fc4] font-bold bg-[#1d7fc4]/5" : "text-gray-700 font-medium"}`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="cursor-pointer w-full bg-[#96c93d] hover:bg-[#86b537] disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors shadow-sm mt-5"
      >
        {isSubmitting ? "Creating..." : "Create Account"}
      </button>

      <div className="text-center text-sm text-gray-500 mt-2">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onNavigateToLogin}
          className="cursor-pointer text-secondary font-semibold hover:underline"
        >
          Log in
        </button>
      </div>
    </form>
  );
};
