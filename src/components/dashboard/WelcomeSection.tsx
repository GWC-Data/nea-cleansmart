import React from "react";
import type { UserStats } from "../../services/apiService";

interface WelcomeSectionProps {
  name: string;
  points: number;
  level: number;
  stats: UserStats | null;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  name,
  points,
  stats,
}) => {
  const totalPoints = stats?.totalPoints ?? points;
  const start =
    totalPoints < 50
      ? 0
      : totalPoints < 100
        ? 50
        : totalPoints < 150
          ? 100
          : 150;
  const end = totalPoints < 50 ? 50 : totalPoints < 100 ? 100 : 150;
  const progress = Math.min((totalPoints - start) / (end - start), 1);
  const offset = 276 - progress * 276;

  const nextBadge =
    totalPoints < 50
      ? "Silver"
      : totalPoints < 100
        ? "Gold"
        : totalPoints < 150
          ? "Diamond"
          : null;
  const pointsNeeded = nextBadge
    ? (totalPoints < 50 ? 50 : totalPoints < 100 ? 100 : 150) - totalPoints
    : null;

  return (
    <div className="flex flex-col gap-4 w-full relative z-10">
      {/* Green Hero Card */}
      <div className="relative bg-[#08351e] rounded-[2rem] p-6 lg:p-8 overflow-hidden shadow-lg border border-[#0a4527]">
        {/* Decorative faint abstract blob */}
        <div className="absolute -bottom-10 -right-10 w-64 h-64 opacity-10 pointer-events-none">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="#ffffff"
              d="M45.7,-76.3C58.9,-68.9,69.2,-55.9,78.3,-41.8C87.4,-27.7,95.3,-12.4,94,-1.8C92.7,8.8,82.2,28.8,70.9,45.4C59.6,62.1,47.5,75.4,32.4,82.7C17.3,90.1,-0.7,91.4,-17.1,87.3C-33.5,83.1,-48.2,73.6,-61.7,60.8C-75.1,48,-87.3,31.9,-93.2,13.7C-99.1,-4.5,-98.7,-24.8,-88.9,-41.2C-79,-57.6,-59.7,-70.2,-41.7,-75.4C-23.7,-80.6,-7,-78.5,8.8,-76C24.6,-73.4,40.4,-70.5,45.7,-76.3Z"
              transform="translate(100 100) scale(1.1)"
            />
          </svg>
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-white mb-1 tracking-tight">
            Hi, {name}!
          </h1>
          <p className="text-[#a7d0b8] text-sm mb-6 font-medium">
            Ready to make an impact today?
          </p>

          <div className="flex items-center gap-6 mt-4">
            {/* Circular Progress */}
            <div className="relative w-28 h-28 shrink-0">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  className="text-white/10"
                  strokeWidth="6"
                  stroke="currentColor"
                  fill="transparent"
                  r="44"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-white"
                  strokeWidth="6"
                  strokeDasharray="276"
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="44"
                  cx="50"
                  cy="50"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-white tracking-tight leading-none mt-1">
                  {points.toLocaleString()}
                </span>
                <span className="text-[9px] font-black text-white/70 uppercase tracking-widest mt-1">
                  Points
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-[#a7d0b8] text-xs font-medium leading-relaxed max-w-[120px]">
                {pointsNeeded !== null
                  ? `${pointsNeeded} points until your ${nextBadge} badge!`
                  : "🎉 You've earned all badges!"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
