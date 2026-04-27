import React, { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import {
  User,
  Mail,
  Lock,
  Calendar,
  VenusAndMars,
  ChevronDown,
  Building2,
  Phone,
} from "lucide-react";
import type { RegisterFormState } from "../../../types/auth.types";
import { toast } from "sonner";
import { FloatingInput } from "../../ui/FloatingInput";

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
  organizationName: "",
  phoneNumber: "",
};

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onNavigateToLogin,
}) => {
  const { handleRegister, handleOrganizationRegister, isSubmitting, error } =
    useAuth();
  const [form, setForm] = useState<RegisterFormState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<"user" | "organization">("user");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const [genderFocused, setGenderFocused] = useState(false);
  const genderDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        genderDropdownRef.current &&
        !genderDropdownRef.current.contains(event.target as Node)
      ) {
        setIsGenderDropdownOpen(false);
        setGenderFocused(false);
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
    if (activeTab === "organization" && !form.organizationName?.trim()) {
      setValidationError("Organization Name is required.");
      return false;
    }
    if (!form.name.trim()) {
      setValidationError("Full Name is required.");
      return false;
    }
    if (!form.email.includes("@")) {
      setValidationError("Valid email is required.");
      return false;
    }
    if (activeTab === "organization" && !form.phoneNumber?.trim()) {
      setValidationError("Phone Number is required.");
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
    if (isSubmitting) return; // Prevent multiple rapid clicks/submits
    if (!validate()) return;
    if (activeTab === "organization") {
      handleOrganizationRegister(form, onSuccess);
    } else {
      handleRegister(form, onSuccess);
    }
  };

  /* Gender floating-label helpers */
  const genderIsFloating =
    genderFocused || isGenderDropdownOpen || !!form.gender;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 md:space-y-7">
      {/* Tabs */}
      <div className="flex bg-[#F0F4F8] p-1.5 rounded-xl mb-8 relative border border-[#E8EDF2]">
        <button
          type="button"
          onClick={() => {
            setActiveTab("user");
            setValidationError(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all duration-300 rounded-lg z-10 ${
            activeTab === "user"
              ? "text-white bg-[#509CD1] shadow-[0_4px_12px_rgba(80,156,209,0.3)] transform scale-[1.02]"
              : "text-[#6B7A88] hover:text-[#1A2A3A] hover:bg-[#E8EDF2]"
          }`}
        >
          <User
            size={18}
            className={activeTab === "user" ? "text-white" : "text-[#8A9AA8]"}
          />
          User
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("organization");
            setValidationError(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all duration-300 rounded-lg z-10 ${
            activeTab === "organization"
              ? "text-white bg-[#86B537] shadow-[0_4px_12px_rgba(134,181,55,0.3)] transform scale-[1.02]"
              : "text-[#6B7A88] hover:text-[#1A2A3A] hover:bg-[#E8EDF2]"
          }`}
        >
          <Building2
            size={18}
            className={
              activeTab === "organization" ? "text-white" : "text-[#8A9AA8]"
            }
          />
          Organization
        </button>
      </div>

      {activeTab === "user" && (
        <>
          {/* Full Name */}
          <FloatingInput
            id="reg-name"
            name="name"
            type="text"
            label={
              <>
                Full Name <span className="text-red-500">*</span>
              </>
            }
            value={form.name}
            onChange={handleChange}
            autoComplete="name"
            required
            icon={<User className="w-5 h-5" />}
          />

          {/* Email */}
          <FloatingInput
            id="reg-email"
            name="email"
            type="email"
            label={
              <>
                Email Address <span className="text-red-500">*</span>
              </>
            }
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
            icon={<Mail className="w-5 h-5" />}
          />

          {/* Password */}
          <FloatingInput
            id="reg-password"
            name="password"
            label={
              <>
                Password <span className="text-red-500">*</span>
              </>
            }
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
            showToggle
            icon={<Lock className="w-5 h-5" />}
          />

          {/* Confirm Password */}
          <FloatingInput
            id="reg-confirm-password"
            name="confirmPassword"
            label={
              <>
                Confirm Password <span className="text-red-500">*</span>
              </>
            }
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            required
            showToggle
            icon={<Lock className="w-5 h-5" />}
          />

          {/* Age & Gender — single row */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            {/* Age — icon + FloatingInput in the same row */}
            <FloatingInput
              id="reg-age"
              name="age"
              type="number"
              label="Age"
              value={form.age ?? ""}
              onChange={handleChange}
              autoComplete="off"
              icon={<Calendar className="w-5 h-5" />}
            />

            {/* Gender — custom floating outlined dropdown with left icon */}
            <div className="flex items-center gap-2.5">
              {/* Left icon */}
              <div className="shrink-0 text-[#1d7fc4] w-5 flex justify-center">
                <VenusAndMars className="w-5 h-5" />
              </div>

              {/* Dropdown wrapper */}
              <div className="relative flex-1" ref={genderDropdownRef}>
                {/* Floating label */}
                <label
                  htmlFor="reg-gender"
                  className={[
                    "absolute left-3.5 pointer-events-none select-none z-10",
                    "transition-all duration-150 ease-out origin-left",
                    genderIsFloating
                      ? "-top-2 text-[11px] font-semibold bg-white px-1 leading-none"
                      : "top-1/2 -translate-y-1/2 text-sm font-medium",
                    genderFocused || isGenderDropdownOpen
                      ? "text-[#1d7fc4]"
                      : "text-gray-500",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  Gender
                </label>

                {/* Trigger button */}
                <button
                  type="button"
                  id="reg-gender"
                  onClick={() => {
                    setIsGenderDropdownOpen((o) => !o);
                    setGenderFocused(true);
                  }}
                  className={[
                    "w-full bg-white rounded-lg px-3.5 pt-5 pb-2.5 text-sm text-left",
                    "border-2 transition-all outline-none flex items-center justify-between",
                    isGenderDropdownOpen || genderFocused
                      ? "border-[#1d7fc4] ring-1 ring-[#1d7fc4]/30"
                      : "border-gray-300 hover:border-gray-400",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {/* Show selected value or empty (not a dash) */}
                  <span
                    className={
                      form.gender
                        ? "text-gray-900 text-sm"
                        : "text-transparent text-sm"
                    }
                  >
                    {form.gender || "placeholder"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      isGenderDropdownOpen
                        ? "rotate-180 text-[#1d7fc4]"
                        : "text-gray-400"
                    }`}
                  />
                </button>

                {/* Dropdown options */}
                {isGenderDropdownOpen && (
                  <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-top-1 zoom-in-95 duration-150">
                    {["Male", "Female", "Prefer not to say"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({ ...prev, gender: option }));
                          setIsGenderDropdownOpen(false);
                          setGenderFocused(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          form.gender === option
                            ? "text-[#1d7fc4] font-bold bg-[#1d7fc4]/5"
                            : "text-gray-700 font-medium hover:bg-gray-50"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "organization" && (
        <div className="space-y-5 md:space-y-7">
          {/* Organization Name */}
          <FloatingInput
            id="reg-org-name"
            name="organizationName"
            type="text"
            label={
              <>
                Organization Name <span className="text-red-500">*</span>
              </>
            }
            value={form.organizationName || ""}
            onChange={handleChange}
            required={activeTab === "organization"}
            icon={<Building2 className="w-5 h-5" />}
          />

          {/* Full Name */}
          <FloatingInput
            id="reg-name-org"
            name="name"
            type="text"
            label={
              <>
                Full Name <span className="text-red-500">*</span>
              </>
            }
            value={form.name}
            onChange={handleChange}
            required={activeTab === "organization"}
            icon={<User className="w-5 h-5" />}
          />

          {/* Work Email */}
          <FloatingInput
            id="reg-email-org"
            name="email"
            type="email"
            label={
              <>
                Work Email Address <span className="text-red-500">*</span>
              </>
            }
            value={form.email}
            onChange={handleChange}
            required={activeTab === "organization"}
            icon={<Mail className="w-5 h-5" />}
          />

          {/* Phone Number */}
          <FloatingInput
            id="reg-phone-org"
            name="phoneNumber"
            type="tel"
            label={
              <>
                Phone Number <span className="text-red-500">*</span>
              </>
            }
            value={form.phoneNumber || ""}
            onChange={handleChange}
            required={activeTab === "organization"}
            icon={<Phone className="w-5 h-5" />}
          />

          <div className="grid grid-cols-2 gap-x-3 gap-y-5 md:gap-y-7">
            {/* Password */}
            <FloatingInput
              id="reg-password-org"
              name="password"
              label={
                <>
                  Password <span className="text-red-500">*</span>
                </>
              }
              value={form.password}
              onChange={handleChange}
              required={activeTab === "organization"}
              showToggle
              icon={<Lock className="w-5 h-5" />}
            />
            {/* Confirm Password */}
            <FloatingInput
              id="reg-confirm-password-org"
              name="confirmPassword"
              label={
                <>
                  Confirm Password <span className="text-red-500">*</span>
                </>
              }
              value={form.confirmPassword}
              onChange={handleChange}
              required={activeTab === "organization"}
              showToggle
              icon={<Lock className="w-5 h-5" />}
            />
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mb-4 cursor-pointer w-full bg-[#96c93d] hover:bg-[#86b537] disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors shadow-sm"
      >
        {isSubmitting ? "Creating..." : "Create Account"}
      </button>

      <div className="text-center text-sm text-gray-500">
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
