import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 max-w-lg w-full">
        {/* Large 404 text with gradient */}
        <h1 className="text-[12rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-green-600 to-emerald-800 select-none">
          404
        </h1>

        <div className="space-y-6 -mt-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Oops! Page not found
          </h2>
          <p className="text-lg text-slate-600">
            The link you followed may be broken, or the page may have been removed. 
            Let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all active:scale-95 shadow-lg shadow-green-200"
            >
              <Home className="w-5 h-5" />
              Return Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
