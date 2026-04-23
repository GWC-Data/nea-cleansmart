import React, { useState, useId } from "react";
import { Eye, EyeOff } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────
   FloatingInput
   Material "outlined" floating-label input.
   Optional icon renders to the LEFT of the bordered input box.

   Autofill handling
   -----------------
   When a browser injects saved credentials it does NOT fire React's
   onChange, so `value` stays "" and the floating label sits on top of
   the pre-filled text. We solve this two ways:

   1. CSS  `:autofill` / `:-webkit-autofill` pseudo-class triggers a
      dummy keyframe animation. We catch `animationstart` on the input
      to set the `autofilled` flag, which forces `isFloating = true`.

   2. The keyframes are injected once via a <style> tag so every
      FloatingInput instance benefits without extra CSS files.
───────────────────────────────────────────────────────────────────── */

// Inject keyframes once (idempotent guard via dataset flag)
if (
  typeof document !== "undefined" &&
  !document.getElementById("fi-autofill-kf")
) {
  const s = document.createElement("style");
  s.id = "fi-autofill-kf";
  s.textContent = `
    @keyframes autofillDetected { from { opacity: 1; } to { opacity: 1; } }
    @keyframes autofillCancel   { from { opacity: 1; } to { opacity: 1; } }
    input:-webkit-autofill { animation-name: autofillDetected; animation-duration: 1ms; }
    input:not(:-webkit-autofill) { animation-name: autofillCancel; animation-duration: 1ms; }
  `;
  document.head.appendChild(s);
}

interface FloatingInputProps {
  label: React.ReactNode;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  className?: string;
  /** Lucide (or any) icon element to show to the left of the input */
  icon?: React.ReactNode;
  /** Render the show/hide eye button (password fields) */
  showToggle?: boolean;
}

export const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  id,
  required,
  autoComplete,
  placeholder,
  className = "",
  icon,
  showToggle = false,
}) => {
  const autoId = useId();
  const inputId = id ?? autoId;

  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [autofilled, setAutofilled] = useState(false);

  // Catch the CSS-animation trick fired by :-webkit-autofill
  const handleAnimationStart = (e: React.AnimationEvent<HTMLInputElement>) => {
    if (e.animationName === "autofillDetected") setAutofilled(true);
    if (e.animationName === "autofillCancel") setAutofilled(false);
  };

  const isFloating = focused || value.length > 0 || autofilled;

  const resolvedType = showToggle ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* ── Left icon (outside the box) ─────────────────────────── */}
      {icon && (
        <div className="shrink-0 text-[#1d7fc4] w-5 flex justify-center">
          {icon}
        </div>
      )}

      {/* ── Input + floating label wrapper ──────────────────────── */}
      <div className="relative flex-1">
        <input
          id={inputId}
          name={name}
          type={resolvedType}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          placeholder={focused ? (placeholder ?? "") : ""}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onAnimationStart={handleAnimationStart}
          className={[
            "peer w-full bg-white rounded-lg px-3.5 pt-5 pb-2.5 text-sm text-gray-900",
            "border-2 transition-all outline-none",
            focused
              ? "border-[#1d7fc4] ring-1 ring-[#1d7fc4]/30"
              : "border-gray-300 hover:border-gray-400",
            showToggle ? "pr-11" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />

        {/* Floating label */}
        <label
          htmlFor={inputId}
          className={[
            "absolute left-3.5 pointer-events-none select-none",
            "transition-all duration-150 ease-out origin-left",
            isFloating
              ? "-top-2 text-[11px] font-semibold bg-white px-1 leading-none"
              : "top-[50%] -translate-y-1/2 text-sm font-medium",
            focused ? "text-[#1d7fc4]" : "text-gray-500",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {label}
        </label>

        {/* Password eye toggle */}
        {showToggle && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1d7fc4] transition-colors focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
