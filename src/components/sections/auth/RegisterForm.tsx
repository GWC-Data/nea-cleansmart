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
  MapPin,
} from "lucide-react";
import type { RegisterFormState } from "../../../types/auth.types";
import { toast } from "sonner";
import { FloatingInput } from "../../ui/FloatingInput";

interface Country {
  code: string;
  name: string;
  flag: string;
  minLength: number;
  maxLength: number;
  placeholder: string;
}

const COUNTRIES_FALLBACK: Country[] = [
  { code: "+65", name: "Singapore", flag: "🇸🇬", minLength: 8, maxLength: 8, placeholder: "8225 2118" },
  { code: "+91", name: "India", flag: "🇮🇳", minLength: 10, maxLength: 10, placeholder: "98765 43210" },
  { code: "+1", name: "United States", flag: "🇺🇸", minLength: 10, maxLength: 10, placeholder: "201 555 0123" },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧", minLength: 10, maxLength: 10, placeholder: "7911 123456" },
  { code: "+60", name: "Malaysia", flag: "🇲🇾", minLength: 9, maxLength: 10, placeholder: "12 345 6789" },
  { code: "+62", name: "Indonesia", flag: "🇮🇩", minLength: 9, maxLength: 13, placeholder: "812 3456 7890" },
  { code: "+61", name: "Australia", flag: "🇦🇺", minLength: 9, maxLength: 9, placeholder: "412 345 678" },
];

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
  address: "",
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
  const [countries, setCountries] = useState<Country[]>(COUNTRIES_FALLBACK);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(COUNTRIES_FALLBACK[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countryFocused, setCountryFocused] = useState(false);
  const countryDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag");
        if (!response.ok) return;
        const data = await response.json();
        
        const mappedCountries: Country[] = data
          .map((item: any) => {
            const root = item.idd?.root || "";
            const suffix = item.idd?.suffixes?.[0] || "";
            const code = root + suffix;
            
            if (!code) return null;
            
            // Match with our fallback countries to preserve exact phone digit validation and placeholders
            const known = COUNTRIES_FALLBACK.find(
              (c) => c.name.toLowerCase() === item.name?.common?.toLowerCase() || c.code === code
            );
            
            return {
              code,
              name: item.name?.common || "",
              flag: item.flag || "",
              minLength: known ? known.minLength : 8,
              maxLength: known ? known.maxLength : 15,
              placeholder: known ? known.placeholder : "1234 5678"
            };
          })
          .filter((c: any): c is Country => c !== null && !!c.name && !!c.code);
          
        // Sort alphabetically
        mappedCountries.sort((a, b) => a.name.localeCompare(b.name));
        
        setCountries(mappedCountries);
        
        // Auto-detect user country via IP Geolocation
        try {
          const geoRes = await fetch("https://ipapi.co/json/");
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            const matchedCountry = mappedCountries.find(
              (c) => c.name.toLowerCase().includes(geoData.country_name?.toLowerCase()) || c.code === geoData.country_calling_code
            );
            if (matchedCountry) {
              setSelectedCountry(matchedCountry);
              return;
            }
          }
        } catch (geoErr) {
          console.warn("Geolocation detection failed:", geoErr);
        }
        
        // Default to Singapore if geolocation fails or doesn't match
        const defaultSG = mappedCountries.find((c) => c.code === "+65") || COUNTRIES_FALLBACK[0];
        setSelectedCountry(defaultSG);
        
      } catch (err) {
        console.error("Failed to fetch country codes dynamically:", err);
      }
    };
    
    fetchCountries();
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        genderDropdownRef.current &&
        !genderDropdownRef.current.contains(event.target as Node)
      ) {
        setIsGenderDropdownOpen(false);
        setGenderFocused(false);
      }
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCountryDropdownOpen(false);
        setCountryFocused(false);
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
    if (activeTab === "organization") {
      if (!selectedCountry) {
        setValidationError("Country code is required.");
        return false;
      }
      const rawPhone = form.phoneNumber?.replace(/\s+/g, "") || "";
      if (!rawPhone) {
        setValidationError("Phone Number is required.");
        return false;
      }
      const { minLength, maxLength, name: countryName } = selectedCountry;
      if (rawPhone.length < minLength || rawPhone.length > maxLength) {
        if (minLength === maxLength) {
          setValidationError(`Phone number for ${countryName} must be exactly ${minLength} digits.`);
        } else {
          setValidationError(`Phone number for ${countryName} must be between ${minLength} and ${maxLength} digits.`);
        }
        return false;
      }
    }
    if (activeTab === "organization" && !form.address?.trim()) {
      setValidationError("Address is required.");
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
      const combinedPhone = `${selectedCountry?.code} ${form.phoneNumber?.trim()}`;
      handleOrganizationRegister({ ...form, phoneNumber: combinedPhone }, onSuccess);
    } else {
      handleRegister(form, onSuccess);
    }
  };

  /* Gender floating-label helpers */
  const genderIsFloating =
    genderFocused || isGenderDropdownOpen || !!form.gender;

  /* Country floating-label helpers */
  const countryIsFloating =
    countryFocused || isCountryDropdownOpen || !!selectedCountry;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
      {/* Tabs */}
      <div className="flex bg-[#F0F4F8] p-1 rounded-xl mb-4 relative border border-[#E8EDF2]">
        <button
          type="button"
          onClick={() => {
            setActiveTab("user");
            setValidationError(null);
          }}
          className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all duration-300 rounded-lg z-10 ${
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
          className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all duration-300 rounded-lg z-10 ${
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
        <div className="space-y-4 md:space-y-5">
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

          {/* User Name */}
          <FloatingInput
            id="reg-name-org"
            name="name"
            type="text"
            label={
              <>
                User Name <span className="text-red-500">*</span>
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

          {/* Address */}
          <FloatingInput
            id="reg-address-org"
            name="address"
            type="text"
            label={
              <>
                Address <span className="text-red-500">*</span>
              </>
            }
            value={form.address || ""}
            onChange={handleChange}
            required={activeTab === "organization"}
            icon={<MapPin className="w-5 h-5" />}
          />

          {/* Country Code & Phone Number Field */}
          <div className="flex items-center gap-2.5 w-full">
            {/* Left icon */}
            <div className="shrink-0 text-[#1d7fc4] w-5 flex justify-center">
              <Phone className="w-5 h-5" />
            </div>

            {/* Container for Country Code and Phone Number fields with 35% and 65% width */}
            <div className="flex-1 flex gap-x-3 w-full">
              {/* Country Code (35% width) */}
              <div style={{ width: "35%" }} className="relative" ref={countryDropdownRef}>
                {/* Floating label */}
                <label
                  htmlFor="reg-country-code"
                  className={[
                    "absolute left-3.5 pointer-events-none select-none z-10",
                    "transition-all duration-150 ease-out origin-left",
                    countryIsFloating
                      ? "-top-2 text-[11px] font-semibold bg-white px-1 leading-none"
                      : "top-1/2 -translate-y-1/2 text-sm font-medium",
                    countryFocused || isCountryDropdownOpen
                      ? "text-[#1d7fc4]"
                      : "text-gray-500",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  Code <span className="text-red-500">*</span>
                </label>

                {/* Trigger button */}
                <button
                  type="button"
                  id="reg-country-code"
                  onClick={() => {
                    setIsCountryDropdownOpen((o) => !o);
                    setCountryFocused(true);
                  }}
                  className={[
                    "w-full bg-white rounded-lg px-3.5 pt-5 pb-2.5 text-sm text-left",
                    "border-2 transition-all outline-none flex items-center justify-between",
                    isCountryDropdownOpen || countryFocused
                      ? "border-[#1d7fc4] ring-1 ring-[#1d7fc4]/30"
                      : "border-gray-300 hover:border-gray-400",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span
                    className={
                      selectedCountry
                        ? "text-gray-900 text-sm"
                        : "text-transparent text-sm"
                    }
                  >
                    {selectedCountry ? `${selectedCountry.flag} ${selectedCountry.code}` : "placeholder"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      isCountryDropdownOpen
                        ? "rotate-180 text-[#1d7fc4]"
                        : "text-gray-400"
                    }`}
                  />
                </button>

                {/* Dropdown options */}
                {isCountryDropdownOpen && (
                  <div className="absolute z-20 w-[240px] max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-top-1 zoom-in-95 duration-150">
                    {countries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(country);
                          setIsCountryDropdownOpen(false);
                          setCountryFocused(false);
                          setValidationError(null);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                          selectedCountry?.code === country.code
                            ? "text-[#1d7fc4] font-bold bg-[#1d7fc4]/5"
                            : "text-gray-700 font-medium hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-base shrink-0">{country.flag}</span>
                        <span className="font-semibold shrink-0">{country.code}</span>
                        <span className="text-gray-400 text-xs truncate">({country.name})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Phone Number Input (65% width) */}
              <div style={{ width: "65%" }}>
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
                  placeholder={selectedCountry?.placeholder || "8225 2118"}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-4">
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
