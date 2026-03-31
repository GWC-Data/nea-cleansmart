import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Leaf,
  ArrowRight,
  Trash2,
  ShieldCheck,
  Users,
  Clock,
  Globe,
  Quote,
} from "lucide-react";
import { FaYoutube, FaTiktok, FaFacebook, FaInstagram } from "react-icons/fa6";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fafcfb] text-gray-900 font-sans overflow-x-hidden">
      {/* Navbar */}
      <header className="flex justify-between items-center px-6 lg:px-12 py-5 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100/50">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <Leaf className="w-6 h-6 lg:w-7 lg:h-7 text-secondary" />
          <span className="text-lg lg:text-xl font-bold tracking-tight text-gray-900">
            NEA - CleanTrack
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/login")}
            className="hidden sm:block text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Log in
          </button>
          <button
            onClick={() => navigate("/register")}
            className="bg-[#08351e] hover:bg-[#0a4527] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors"
          >
            Register
          </button>
        </div>
      </header>

      <main className="px-6 lg:px-12 pt-5 lg:pt-10 max-w-[1600px] mx-auto w-full animate-slide-up">
        {/* 1. Hero Section */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center justify-between">
          <div className="flex-1 max-w-2xl text-center lg:text-left">
            <div className="inline-block bg-[#e6f4ea] text-secondary font-bold text-[10px] lg:text-xs px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider shadow-sm border border-[#c1e8d4]">
              Public Hygiene Council (PHC)
            </div>
            <h1 className="text-[3.5rem] leading-[1.05] lg:text-[5rem] font-extrabold text-gray-900 mb-6 tracking-tight">
              Keep <br className="hidden lg:block" />
              <span className="italic text-secondary font-serif pr-2">
                Singapore
              </span>
              <span className="block lg:inline">Clean</span>
            </h1>
            <p className="text-base lg:text-lg text-gray-500 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
              Every year, the Public Hygiene Council (PHC) holds its flagship
              initiative to raise awareness of the problem of littering and to
              nudge Singapore residents to uphold higher standards of public
              hygiene and cleanliness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => navigate("/register")}
                className="bg-[#96c93d] text-white px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#0a4527] transition-all group shadow-lg shadow-[#08351e]/20"
              >
                Register Now{" "}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="bg-white border-2 border-gray-100 text-gray-700 px-8 py-4 rounded-full font-bold hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm"
              >
                How it works
              </button>
            </div>
          </div>

          <div className="flex-1 w-full max-w-lg lg:max-w-none relative order-first lg:order-last mb-4 lg:mb-0">
            {/* The right side image area abstraction */}
            <div className="bg-[#111827] rounded-[2rem] lg:rounded-[3rem] p-8 lg:p-12 relative overflow-hidden h-[300px] lg:h-[450px] flex items-center justify-center shadow-2xl">
              <div className="absolute inset-0 bg-linear-to-tr from-secondary/20 to-transparent"></div>

              <div className="relative z-10 text-center flex flex-col items-center">
                {/* Abstract graphic representing the masked cleaner */}
                <div className="w-32 h-32 lg:w-48 lg:h-48 relative mb-6">
                  <div className="absolute inset-0 border-4 border-[#3b82f6] rounded-[2rem] transform rotate-12 opacity-80"></div>
                  <div className="absolute inset-0 border-4 border-secondary rounded-[2rem] transform -rotate-6 bg-[#1e293b] flex items-center justify-center shadow-2xl overflow-hidden">
                    <span className="text-white text-6xl">🧽</span>
                  </div>
                </div>
                <h2 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-[0.2em] whitespace-pre-line drop-shadow-md">
                  KEEP SINGAPORE
                  <br />
                  <span className="text-secondary text-3xl lg:text-5xl mt-2 block">
                    CLEAN
                  </span>
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Upholding Higher Standards */}
        <div className="mt-16 lg:mt-20 flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
          <div className="flex-1 w-full max-w-xl">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Upholding Higher
              <br className="hidden lg:block" /> Standards
            </h2>
            <p className="text-gray-500 mb-10 leading-relaxed font-medium">
              The Public Hygiene Council efforts are focused on engaging
              residents of all ages to take personal responsibility for our
              shared environment. We believe that a clean Singapore starts with
              individual action.
            </p>

            <div className="flex flex-col gap-5">
              {/* Card 1 */}
              <div className="flex gap-5 items-start bg-white p-5 rounded-3xl border-l-[6px] border-[#08351e] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-transform">
                <div className="bg-[#e6f4ea] p-3 rounded-2xl text-[#08351e]">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 text-base mb-1">
                    Responsible Disposal
                  </h4>
                  <p className="text-[13px] text-gray-500 leading-relaxed">
                    Promoting mindful waste management and ensuring litter-free
                    communal zones across the heartlands.
                  </p>
                </div>
              </div>
              {/* Card 2 */}
              <div className="flex gap-5 items-start bg-white p-5 rounded-3xl border-l-[6px] border-gray-100 shadow-sm hover:border-gray-300 transition-colors">
                <div className="bg-gray-100 p-3 rounded-2xl text-gray-500">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm3 2h6v4H9v-4z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 text-base mb-1">
                    Tray Return
                  </h4>
                  <p className="text-[13px] text-gray-500 leading-relaxed">
                    Cultivating a gracious dining culture by returning trays and
                    keeping our hawker centers pristine.
                  </p>
                </div>
              </div>
              {/* Card 3 */}
              <div className="flex gap-5 items-start bg-white p-5 rounded-3xl border-l-[6px] border-gray-100 shadow-sm hover:border-gray-300 transition-colors">
                <div className="bg-gray-100 p-3 rounded-2xl text-gray-500">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 text-base mb-1">
                    Public Hygiene
                  </h4>
                  <p className="text-[13px] text-gray-500 leading-relaxed">
                    Strengthening health security through rigorous sanitation
                    practices in shared public infrastructures.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md lg:max-w-[600px] relative mt-0 mx-auto lg:ml-auto">
            <div className="rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-2xl aspect-square lg:aspect-4/3 relative">
              <img
                src="https://media.istockphoto.com/id/1320296817/photo/man-throwing-garbage-bag-into-bin-at-home-closeup.jpg?s=612x612&w=0&k=20&c=jd6qzLwBWhk80Ps7JDRy5HP-d8PZMti6MB0jQ68P69A="
                alt="cleaning"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10"></div>
            </div>
            {/* Floating Card */}
            {/* <div className="absolute -bottom-6 -left-2 lg:bottom-12 lg:-left-12 bg-white p-6 lg:p-8 rounded-[2rem] shadow-2xl max-w-[220px] lg:max-w-[260px] animate-fade-in z-10 border border-gray-50">
              <h3 className="text-3xl lg:text-4xl font-extrabold text-secondary mb-2 tracking-tight">
                15 Years
              </h3>
              <p className="text-xs lg:text-[13px] text-gray-500 font-medium leading-relaxed">
                Of championing cleanliness and public health initiatives.
              </p>
            </div> */}
          </div>
        </div>

        {/* 3. Strategic Outreach */}
        <div className="mt-16 lg:mt-16 text-center bg-[#f4faf7] -mx-6 lg:-mx-12 px-6 lg:px-12 py-10 lg:py-10 rounded-[3rem] lg:rounded-[4rem]">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Strategic Outreach
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto mb-12 lg:mb-16 font-medium leading-relaxed">
            Connect with us on our digital channels to stay updated on upcoming
            clean-up events, educational campaigns, and community milestones.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-5xl mx-auto mb-12">
            <a href="https://www.youtube.com/publichygienecouncil" target="_blank" rel="noopener noreferrer" className="bg-white lg:bg-gray-100 hover:bg-white border border-gray-100 lg:border-transparent hover:border-gray-200 hover:shadow-lg transition-all p-6 lg:p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 cursor-pointer">
              <FaYoutube className="w-8 h-8 text-gray-800" />
              <span className="font-extrabold text-sm text-gray-900">
                YouTube
              </span>
            </a>
            <a href="https://www.tiktok.com/@keepsgclean" target="_blank" rel="noopener noreferrer" className="bg-white lg:bg-gray-100 hover:bg-white border border-gray-100 lg:border-transparent hover:border-gray-200 hover:shadow-lg transition-all p-6 lg:p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 cursor-pointer">
              <FaTiktok className="w-8 h-8 text-gray-800" />
              <span className="font-extrabold text-sm text-gray-900">
                TikTok
              </span>
            </a>
            <a href="https://facebook.com/keepsgclean" target="_blank" rel="noopener noreferrer" className="bg-white lg:bg-gray-100 hover:bg-white border border-gray-100 lg:border-transparent hover:border-gray-200 hover:shadow-lg transition-all p-6 lg:p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 cursor-pointer">
              <FaFacebook className="w-8 h-8 text-gray-800" />
              <span className="font-extrabold text-sm text-gray-900">
                Facebook
              </span>
            </a>
            <a href="https://instagram.com/keepsgclean" target="_blank" rel="noopener noreferrer" className="bg-white lg:bg-gray-100 hover:bg-white border border-gray-100 lg:border-transparent hover:border-gray-200 hover:shadow-lg transition-all p-6 lg:p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 cursor-pointer">
              <FaInstagram className="w-8 h-8 text-gray-800" />
              <span className="font-extrabold text-sm text-gray-900">
                Instagram
              </span>
            </a>
          </div>

          <button className="bg-[#96c93d] hover:bg-[#84b836] text-white px-8 lg:px-10 py-4 lg:py-5 rounded-full font-extrabold uppercase tracking-widest text-[11px] lg:text-xs transition-all shadow-[0_10px_30px_rgb(8,53,30,0.2)] hover:shadow-[0_10px_40px_rgb(8,53,30,0.3)] hover:-translate-y-1">
            JOIN THE CLEAN MOVEMENT
          </button>
        </div>

        {/* 4. Measurable Change */}
        <div className="mt-10 lg:mt-10 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Measurable Change
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto mb-8 lg:mb-10 font-medium leading-relaxed">
            Our environmental efforts shift responsibly. Every pulse closer to
            clean, every hour is accounted to form our global pledge for good.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 lg:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-left hover:-translate-y-1 transition-transform">
              <div className="bg-[#e6f4ea] w-14 h-14 rounded-2xl flex items-center justify-center mb-8">
                <Users className="w-7 h-7 text-secondary" />
              </div>
              <div className="text-[2.5rem] lg:text-5xl font-extrabold text-gray-900 mb-2 tracking-tight">
                42.8k
              </div>
              <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-8">
                Total Volunteers
              </div>
              <div className="flex -space-x-3">
                <img
                  src="https://i.pravatar.cc/100?img=1"
                  className="w-10 h-10 rounded-full border-[3px] border-white shadow-sm relative z-30"
                  alt="avatar"
                />
                <img
                  src="https://i.pravatar.cc/100?img=2"
                  className="w-10 h-10 rounded-full border-[3px] border-white shadow-sm relative z-20"
                  alt="avatar"
                />
                <img
                  src="https://i.pravatar.cc/100?img=3"
                  className="w-10 h-10 rounded-full border-[3px] border-white shadow-sm relative z-10"
                  alt="avatar"
                />
                <div className="w-10 h-10 rounded-full border-[3px] border-white bg-secondary text-white text-[10px] font-bold flex items-center justify-center relative z-0 shadow-sm">
                  +10k
                </div>
              </div>
            </div>

            <div className="bg-white p-8 lg:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-left hover:-translate-y-1 transition-transform">
              <div className="bg-[#e6f4ea] w-14 h-14 rounded-2xl flex items-center justify-center mb-8">
                <Clock className="w-7 h-7 text-secondary" />
              </div>
              <div className="text-[2.5rem] lg:text-5xl font-extrabold text-gray-900 mb-2 tracking-tight">
                1.5M
              </div>
              <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-8">
                Logged Hours
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700 bg-gray-50 py-2 px-3 rounded-full w-fit">
                <svg
                  className="w-4 h-4 text-secondary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                72% from last month
              </div>
            </div>

            <div className="bg-white p-8 lg:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-left hover:-translate-y-1 transition-transform">
              <div className="bg-[#fcf4e8] w-14 h-14 rounded-2xl flex items-center justify-center mb-8">
                <Globe className="w-7 h-7 text-yellow-600" />
              </div>
              <div className="text-[2.5rem] lg:text-5xl font-extrabold text-gray-900 mb-2 tracking-tight">
                124
              </div>
              <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-8">
                Active Countries
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700 bg-gray-50 py-2 px-3 rounded-full w-fit">
                <div className="w-2 h-2 rounded-full bg-secondary"></div>
                Across 12 regions
              </div>
            </div>
          </div>
        </div>

        {/* 5. Voices of the Ecosystem */}
        <div className="mt-8 lg:mt-16 flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          <div className="flex-1 w-full relative h-[350px] lg:h-[450px]">
            {/* Offset Images */}
            <div className="absolute top-0 left-0 w-[65%] h-[65%] rounded-[2rem] overflow-hidden shadow-2xl z-20 transition-transform hover:scale-105 hover:z-30 duration-500">
              <img
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600"
                alt="Nature"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-[65%] h-[65%] rounded-[2rem] overflow-hidden shadow-xl z-10 transition-transform hover:scale-105 duration-500">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600"
                alt="Community"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="text-secondary/20 mb-6 lg:mb-8">
              <Quote className="w-12 h-12 lg:w-16 lg:h-16 fill-current" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-10 leading-tight tracking-tight">
              Voices of the <br className="hidden lg:block" />
              Ecosystem
            </h2>

            <div className="space-y-10 lg:space-y-12">
              <div className="border-l-[3px] border-secondary pl-6 lg:pl-8">
                <p className="text-lg lg:text-xl text-gray-600 font-medium italic mb-6 leading-relaxed">
                  "EcoPulse has transformed how our neighborhood handles
                  cleaning initiatives. The transparency and ease of
                  participation are unmatched."
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src="https://i.pravatar.cc/100?img=11"
                    className="w-12 h-12 rounded-full shadow-sm"
                    alt="Marcus Chan"
                  />
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-[15px]">
                      Marcus Chan
                    </h4>
                    <p className="text-[13px] text-gray-500 font-medium">
                      Community Leader, Tampines
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-l-[3px] border-gray-200 pl-6 lg:pl-8">
                <p className="text-lg lg:text-xl text-gray-600 font-medium italic mb-6 leading-relaxed">
                  "The gamification makes stewardship feel like a shared
                  adventure rather than a chore. We've cleaned 3 local parks
                  this month alone!"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src="https://i.pravatar.cc/100?img=12"
                    className="w-12 h-12 rounded-full shadow-sm"
                    alt="Sarah Lim"
                  />
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-[15px]">
                      Sarah Lim
                    </h4>
                    <p className="text-[13px] text-gray-500 font-medium">
                      Active Volunteer
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Footer CTA */}
        {/* <div className="mt-32 lg:mt-40 bg-[#08351e] rounded-[3rem] lg:rounded-[4rem] p-10 lg:p-24 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(110deg,#08351e_40%,#0a4527_100%)]"></div> */}
        {/* Decorative faint pattern */}
        {/* <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          
          <div className="relative z-10 w-full max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-6 lg:mb-8 tracking-tight">Ready to make a<br />difference?</h2>
            <p className="text-[#a7d0b8] mb-10 lg:mb-12 font-medium text-base lg:text-lg">Join 50,000+ citizens in making Singapore the cleanest city on the planet through actionable, daily steps.</p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="email" placeholder="Enter your email" className="flex-1 rounded-full px-6 py-4 lg:py-5 bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-secondary transition-colors focus:bg-white/20 font-medium" />
              <button className="bg-secondary hover:bg-secondary-hover shadow-[0_5px_20px_rgb(34,197,94,0.3)] text-white px-10 py-4 lg:py-5 rounded-full font-bold transition-all hover:shadow-[0_8px_30px_rgb(34,197,94,0.4)]">Submit</button>
            </div>
            
            <p className="text-[10px] text-white/40 mt-5 uppercase tracking-widest font-bold">By signing up you agree to our terms of service</p>
          </div>
        </div> */}
      </main>

      {/* 7. Global Footer */}
      <footer className="mt-12 lg:mt-16 border-t border-gray-100 bg-white">
        <div className="max-w-[1600px] mx-auto w-full px-6 lg:px-12 py-8 lg:py-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8">
            <div className="flex items-center gap-2">
              <Leaf className="w-8 h-8 text-secondary" />
              <span className="font-extrabold text-gray-900 text-xl tracking-tight">
                NEA - CleanTrack
              </span>
            </div>

            <p className="text-xs font-semibold text-gray-400">
              © 2026 Public Hygiene Council. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
