import React from "react";
import { useNavigate } from "react-router-dom";
import mainImage from "../../../assets/main.png";
import logo from "../../../assets/publicHygineCouncil.png";

export const MainPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-white">
      {/* ── LEFT PANEL — Hero Image ───────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-1/2 relative bg-[#f8fcf9] overflow-hidden items-center justify-center p-3 lg:p-3">
        <img
          src={mainImage}
          alt="Keep Singapore Clean 2026"
          className="w-full h-full object-contain max-h-[800px]"
          style={{ minHeight: "inherit" }}
        />
      </div>

      {/* ── RIGHT PANEL — Auth Panel ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 sm:px-12 py-12 md:py-0 bg-white">
        {/* Logo (mobile only — desktop logo sits inside left image) */}
        <img
          src={logo}
          alt="Public Hygiene Council"
          className="h-10 object-contain mb-8 md:hidden"
        />

        <div className="w-full max-w-sm space-y-6">
          {/* Heading */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1880c4] leading-snug tracking-tight">
              Ready to Make an Impact?
            </h1>
            <p className="text-sm text-[#2185c6] font-medium leading-relaxed">
              Start logging your clean-up activities and&nbsp;earn recognition
              for your efforts.
            </p>
          </div>

          {/* Login Button */}
          <button
            onClick={() => navigate("/login")}
            className="cursor-pointer w-full bg-[#8cc63f] hover:bg-[#7abe31] active:scale-[0.98] text-white font-bold py-3.5 rounded-lg text-sm transition-all shadow-sm"
          >
            Login to Continue
          </button>

          {/* Divider */}
          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-[#2185c6]" />
            <span className="text-xs font-semibold text-[#2185c6] shrink-0">
              New here?
            </span>
            <div className="flex-1 h-px bg-[#2185c6]" />
          </div>

          {/* Register Button */}
          <button
            onClick={() => navigate("/register")}
            className="cursor-pointer w-full bg-white hover:bg-[#f0f9e8] active:scale-[0.98] text-[#8cc63f] font-bold py-3.5 rounded-lg text-sm transition-all border-2 border-[#8cc63f] shadow-sm"
          >
            Get Started
          </button>

          {/* Footer note */}
          <p className="text-center text-[11px] text-gray-400 font-medium leading-relaxed">
            Track your hours. Contribute to your community. Every action counts.
          </p>
        </div>
      </div>
    </div>
  );
};
