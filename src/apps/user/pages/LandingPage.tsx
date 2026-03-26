import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ArrowRight, Medal, Users } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselImages = [
    "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80&w=800"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans pb-16 overflow-x-hidden text-[#1f2937]">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-secondary" />
          <span className="text-xl font-bold tracking-tight text-primary-dark">NEA - CleanTrack</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="text-sm font-semibold text-gray-700 hover:text-gray-900 hidden sm:block"
          >
            Log in
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="text-sm font-semibold bg-secondary text-white px-5 py-2.5 rounded-lg hover:bg-secondary-hover transition-colors shadow-sm"
          >
            Register
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-6 pt-10 md:pt-16 max-w-7xl mx-auto w-full animate-slide-up">
        {/* Layout container: Left (Hero) + Right (Carousel) */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
          
          {/* Left Hero Section */}
          <div className="flex-1 max-w-2xl flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 bg-soft px-3.5 py-1.5 rounded-full mb-6">
              <Leaf className="w-3.5 h-3.5 text-secondary" />
              <span className="text-xs font-semibold text-primary-dark">
                15-Hour Virtual Clean-up Challenge
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-[4rem] font-extrabold tracking-tight mb-6 leading-[1.05]">
              <span className="block text-[#111827] lg:hidden">Be a</span>
              <span className="block text-[#111827] lg:hidden">Cleanliness</span>
              <span className="hidden lg:block text-[#111827]">Be a Cleanliness</span>
              <span className="block text-secondary">Champion!</span>
            </h1>

            {/* Body Text */}
            <p className="text-base text-gray-500 mb-8 leading-relaxed max-w-lg">
              Do your part to keep Singapore clean. Track your volunteer hours, earn points, and unlock milestone badges as you make a difference.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10 border-b border-gray-100 pb-10 w-full justify-center lg:justify-start">
              <button 
                onClick={() => navigate('/register')}
                className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-hover text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-sm active:scale-95 w-full sm:w-auto"
              >
                Register Now <ArrowRight className="w-4 h-4 ml-1" />
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all shadow-sm active:scale-95 w-full sm:w-auto"
              >
                Already registered? Log in
              </button>
            </div>

            {/* Stats */}
            <div className="flex justify-between items-center w-full max-w-lg mx-auto lg:mx-0 px-2 lg:px-0">
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-2xl md:text-3xl font-bold text-gray-900">500+</span>
                <span className="text-xs md:text-sm text-gray-400 font-medium mt-1">Volunteers</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-2xl md:text-3xl font-bold text-gray-900">1,200h</span>
                <span className="text-xs md:text-sm text-gray-400 font-medium mt-1">Logged Hours</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-2xl md:text-3xl font-bold text-gray-900">50+</span>
                <span className="text-xs md:text-sm text-gray-400 font-medium mt-1">Locations</span>
              </div>
            </div>
          </div>
          
          {/* Right Section (Carousel) */}
          <div className="w-full lg:w-[480px] xl:w-[500px] shrink-0">
            <div className="relative w-full aspect-4/3 rounded-3xl overflow-hidden shadow-2xl">
              {/* Images */}
              {carouselImages.map((src, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <img
                    src={src}
                    alt={`Community clean-up slide ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              
              {/* Overlay Gradient for better dot visibility */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/40 to-transparent pointer-events-none z-20" />

              {/* Pagination Dots */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 bg-white/30 backdrop-blur-md px-3.5 py-2 rounded-full z-30">
                {carouselImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`rounded-full transition-all duration-300 ${
                      idx === currentSlide
                        ? 'w-2.5 h-2.5 bg-primary scale-125'
                        : 'w-2 h-2 bg-white/70 hover:bg-white'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Feature Cards below */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          
          {/* Card 1 */}
          <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform duration-300">
            <div className="bg-soft w-12 h-12 flex items-center justify-center rounded-xl mb-6">
              <Leaf className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Track Clean-ups</h3>
            <p className="text-sm text-[#5e6a7c] leading-relaxed">
              QR-based check-in/out with automatic duration tracking and waste logging.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform duration-300">
            <div className="bg-soft w-12 h-12 flex items-center justify-center rounded-xl mb-6">
              <Medal className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Earn Badges</h3>
            <p className="text-sm text-[#5e6a7c] leading-relaxed">
              Unlock Silver, Gold, and Diamond milestones as you accumulate volunteer hours.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform duration-300">
            <div className="bg-soft w-12 h-12 flex items-center justify-center rounded-xl mb-6">
              <Users className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Leaderboard</h3>
            <p className="text-sm text-[#5e6a7c] leading-relaxed">
              Compete with fellow volunteers and see who tops the community rankings.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
};
