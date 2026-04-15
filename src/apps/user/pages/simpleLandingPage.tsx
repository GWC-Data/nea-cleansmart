import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { FaYoutube, FaFacebook, FaInstagram } from "react-icons/fa6";
import logo from "../../../assets/publicHygineCouncil.png";

export const SimpleLandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col relative overflow-x-hidden">
      {/* Header */}
      <header className="w-full bg-white px-6 md:px-12 py-4 flex justify-between items-center z-20 shadow-sm relative">
        <img
          src={logo}
          alt="Public Hygiene Council"
          className="h-10 md:h-12 object-contain"
        />
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="#"
            className="text-sm md:text-base font-bold text-[#1d7fc4] tracking-wide hover:underline underline-offset-4"
          >
            KEEP SINGAPORE CLEAN
          </a>
          <button 
            onClick={() => navigate('/welcome')}
            className="bg-[#8cc63f] hover:bg-[#7abe31] cursor-pointer text-white px-5 py-2.5 rounded-full font-bold text-sm transition-colors shadow-sm"
          >
            Cleanliness Champions
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button 
          className="md:hidden text-gray-800 p-2 -mr-2"
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu className="w-7 h-7" />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 z-50 bg-white flex flex-col pt-4 px-6 animate-in slide-in-from-right-full duration-300 shadow-2xl overflow-y-auto border-l border-gray-100">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <img src={logo} alt="PHC Logo" className="h-10 object-contain" />
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-800 p-2 -mr-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-7 h-7" />
            </button>
          </div>
          
          <div className="flex flex-col gap-10 mt-12 w-full mx-auto">
            <a
              href="#"
              className="text-xl sm:text-2xl font-bold text-[#1d7fc4] tracking-wide text-left hover:underline underline-offset-4"
            >
              KEEP SINGAPORE CLEAN
            </a>
            
            <button 
              onClick={() => {
                setIsMenuOpen(false);
                navigate('/login');
              }}
              className="w-full bg-[#8cc63f] hover:bg-[#7abe31] text-white px-6 py-4 rounded-xl font-bold text-lg transition-colors shadow-sm text-center"
            >
              Join 15-Hours Cleanup Challenge
            </button>

            <div className="flex items-center gap-6 mt-4">
              <a href="https://www.youtube.com/publichygienecouncil" target="_blank" rel="noopener noreferrer" className="text-black hover:text-[#1d7fc4] transition-colors">
                <FaYoutube className="w-8 h-8 sm:w-10 sm:h-10" />
              </a>
              <a href="https://www.tiktok.com/@keepsgclean" target="_blank" rel="noopener noreferrer" className="text-black hover:text-[#1d7fc4] transition-colors">
                <TikTokIcon className="w-7 h-7 sm:w-9 sm:h-9" />
              </a>
              <a href="https://facebook.com/keepsgclean" target="_blank" rel="noopener noreferrer" className="text-black hover:text-[#1d7fc4] transition-colors">
                <FaFacebook className="w-8 h-8 sm:w-10 sm:h-10" />
              </a>
              <a href="https://instagram.com/keepsgclean" target="_blank" rel="noopener noreferrer" className="text-black hover:text-[#1d7fc4] transition-colors">
                <FaInstagram className="w-8 h-8 sm:w-10 sm:h-10" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="w-full">
        <img
          src="https://keepsgclean.com/wp-content/uploads/2026/03/PHC_KV_Microsite-Banner_1640x720px.png"
          alt="Keep Singapore Clean Campaign Banner"
          className="w-full h-auto object-cover max-h-[70vh] object-top"
        />
      </div>

      {/* Content Section */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-12 md:py-16 bg-white">
        {/* Title & Decorative swoosh */}
        <div className="mb-8 relative">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 tracking-tight leading-tight mb-2">
            Keep Singapore Clean
          </h2>
          {/* Decorative graphic imitating the screenshot underline */}
          <img
            src="https://keepsgclean.com/wp-content/uploads/2025/03/decoblue.svg"
            alt="Decorative underline"
            className="w-28 md:w-36 h-auto"
          />
        </div>

        {/* Narrative Paragraphs */}
        <div className="space-y-6 text-[#4a4a4a] text-sm md:text-base font-medium leading-relaxed tracking-[0.015em]">
          <p>
            Every year, the Public Hygiene Council (PHC) holds its flagship
            initiative, the Keep Singapore Clean (KSC) campaign, to raise
            awareness of the problem of littering and to nudge Singapore
            residents to uphold higher standards of public hygiene and
            cleanliness in their everyday lives.
          </p>

          <p>
            Over the past few years, PHC has strengthened efforts to engage
            Singapore residents of all ages to encourage them to do their part
            for the environment. Their participation could be via various
            approaches, such as throwing rubbish into bins responsibly,
            returning crockery to tray return stations after meals and keeping
            tables clean for the next diners, and keeping public toilets clean
            and dry.
          </p>

          <p>
            PHC has engaged agency partners to systematically develop and
            implement strategic communications campaigns on various platforms,
            including delivering public messages through mainstream media.
            Please refer to our{" "}
            <a
              href="https://www.youtube.com/publichygienecouncil"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1d7fc4] underline decoration-1 underline-offset-2 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
            >
              YouTube channel
              <ExternalLinkIcon />
            </a>{" "}
            and follow us on Social Media at @KeepSGClean on{" "}
            <a
              href="https://www.tiktok.com/@keepsgclean"
              target="_blank" rel="noopener noreferrer"
              className="text-[#1d7fc4] underline decoration-1 underline-offset-2 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
            >
              TikTok <ExternalLinkIcon />
            </a>
            ,{" "}
            <a
              href="https://facebook.com/keepsgclean"
              target="_blank" rel="noopener noreferrer"
              className="text-[#1d7fc4] underline decoration-1 underline-offset-2 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
            >
              Facebook <ExternalLinkIcon />
            </a>{" "}
            and{" "}
            <a
              href="https://instagram.com/keepsgclean"
              target="_blank" rel="noopener noreferrer"
              className="text-[#1d7fc4] underline decoration-1 underline-offset-2 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
            >
              Instagram <ExternalLinkIcon />
            </a>{" "}
            for regular updates.
          </p>
        </div>

        {/* Video Embed */}
        <div className="w-full mt-10 shadow-[0_0_30px_rgba(0,0,0,0.15)] rounded bg-black aspect-video overflow-hidden">
          <iframe
            src="https://www.youtube.com/embed/6qCXej3ZXVE?controls=1&rel=0&playsinline=0&cc_load_policy=0&autoplay=0&enablejsapi=1&origin=https%3A%2F%2Fkeepsgclean.com&widgetid=1&forigin=https%3A%2F%2Fkeepsgclean.com%2F&aoriginsup=1&gporigin=https%3A%2F%2Fkeepsgclean.com%2F&vf=1"
            title="Keep Singapore Clean Video"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="w-full bg-linear-to-r from-[#1d7fc4] via-[#1d7fc4] to-[#8cc63f] py-4 md:py-5 mt-auto">
        <p className="text-center text-white text-xs lg:text-sm font-semibold tracking-wide px-4">
          Copyright © 2026 Public Hygiene Council. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

const ExternalLinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-3 h-3 translate-y-px"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.12-1.02 4.13-2.58 5.6-1.58 1.48-3.79 2.27-5.94 1.99-2.28-.27-4.2-1.61-5.36-3.56-1.18-1.95-1.28-4.43-.27-6.43 1.02-2.03 2.94-3.51 5.12-3.92 1.09-.2 2.22-.16 3.29.15.01 1.45.01 2.91.01 4.36-.6-.24-1.26-.35-1.91-.25-1.02.14-1.91.82-2.31 1.75-.41.97-.24 2.18.42 2.99.66.82 1.79 1.12 2.8 1.06 1.08-.1 2.05-.72 2.5-1.69.21-.46.3-1.01.29-1.51-.04-6.01-.02-12.01-.01-18.01Z"/>
  </svg>
);;
