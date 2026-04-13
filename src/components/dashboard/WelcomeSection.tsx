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
  // ── Badge / progress calculation (unchanged) ──────────────────────────────
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

  // SVG circle: r=44 → circumference ≈ 276.46
  const CIRC = 2 * Math.PI * 44;
  const offset = CIRC - progress * CIRC;

  // Badge: users only earn one at 50+ points
  const hasBadge = totalPoints >= 50;
  const badgeName = !hasBadge
    ? null
    : totalPoints < 100
      ? "Silver"
      : totalPoints < 150
        ? "Gold"
        : "Diamond";

  const levelLabel = badgeName ? `${badgeName} Guardian Level` : null;

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
    <div className="flex flex-col gap-3 w-full relative z-10">
      {/* ── Greeting (outside the card) ─────────────────────────────────── */}
      <div className="col-span-12 lg:col-span-8 xl:col-span-6 flex flex-col gap-2">
        <h1 className="text-2xl font-black tracking-tight text-gray-900 leading-tight">
          Welcome back, {name}!
        </h1>
        <p className="text-gray-500 font-medium text-sm leading-relaxed">
          Your contribution helped to create a cleaner and more hygienic
          environment for all Singapore residents to enjoy.
        </p>
      </div>
      {/* <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Welcome back, {name}!
        </h1>
        <p className="text-gray-500 text-sm font-medium mt-0.5">
          Your contribution helped to create a cleaner and more hygienic
          environment for all Singapore residents to enjoy.
        </p>
      </div> */}

      {/* ── Green Hero Card ──────────────────────────────────────────────── */}
      <div
        className="relative rounded-[2rem] py-8 px-6 overflow-hidden shadow-lg"
        style={{
          background: "linear-gradient(145deg, #2d7a50 0%, #1e5c3a 100%)",
        }}
      >
        {/* Decorative blob */}
        {/* <div className="absolute -bottom-10 -right-10 w-64 h-64 opacity-[0.07] pointer-events-none">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="#ffffff"
              d="M45.7,-76.3C58.9,-68.9,69.2,-55.9,78.3,-41.8C87.4,-27.7,95.3,-12.4,94,-1.8C92.7,8.8,82.2,28.8,70.9,45.4C59.6,62.1,47.5,75.4,32.4,82.7C17.3,90.1,-0.7,91.4,-17.1,87.3C-33.5,83.1,-48.2,73.6,-61.7,60.8C-75.1,48,-87.3,31.9,-93.2,13.7C-99.1,-4.5,-98.7,-24.8,-88.9,-41.2C-79,-57.6,-59.7,-70.2,-41.7,-75.4C-23.7,-80.6,-7,-78.5,8.8,-76C24.6,-73.4,40.4,-70.5,45.7,-76.3Z"
              transform="translate(100 100) scale(1.1)"
            />
          </svg>
        </div> */}

        {/* ── Circular badge (centred) ─────────────────────────────────── */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="relative w-36 h-36">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              {/* Track */}
              <circle
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="6"
                fill="transparent"
                r="44"
                cx="50"
                cy="50"
              />
              {/* Progress */}
              <circle
                stroke="#9bf8b7"
                strokeWidth="6"
                strokeDasharray={CIRC}
                strokeDashoffset={offset}
                strokeLinecap="round"
                fill="transparent"
                r="44"
                cx="50"
                cy="50"
                style={{ transition: "stroke-dashoffset 0.6s ease" }}
              />
            </svg>

            {/* Centre label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
              <span className="text-3xl font-extrabold text-white tracking-tight leading-none">
                {totalPoints.toLocaleString()}
              </span>
              <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">
                Points
              </span>
            </div>
          </div>

          {/* Badge name / no-badge state */}
          <div className="text-center">
            {levelLabel ? (
              <p className="text-white font-extrabold text-base tracking-tight">
                {levelLabel}
              </p>
            ) : (
              <p className="text-white/70 text-sm font-semibold tracking-tight">
                No Badge Yet
              </p>
            )}
            <p className="text-[#a7d0b8] text-xs font-medium mt-1">
              {pointsNeeded !== null
                ? `${pointsNeeded} points until next ${nextBadge} Badge`
                : "🎉 You've earned all badges!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
