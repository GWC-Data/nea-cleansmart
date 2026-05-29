import React from "react";
import { Medal } from "lucide-react";

/**
 * Custom Medal Icon rendering dynamically styled medals.
 * Aligned with the 1st (Diamond), 2nd (Gold), and 3rd (Silver) place badge structure.
 */
const MedalIcon: React.FC<{ label: string; className?: string }> = ({
  label,
  className,
}) => {
  const isDiamond = label === "Diamond";
  const isGold = label === "Gold";

  const place = isDiamond ? "1st" : isGold ? "2nd" : "3rd";
  const mainColor = isDiamond ? "#009cdc" : isGold ? "#e39c03" : "#94a1b2";
  const textColor = isDiamond ? "#2b3441" : isGold ? "#2b3441" : "#2b3441";

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
        {/* Scalloped edge design of the medal */}
        <path
          d="M50 5 L58 10 L68 7 L73 16 L83 16 L83 27 L92 32 L89 42 L95 50 L89 58 L92 68 L83 73 L83 83 L73 84 L68 93 L58 90 L50 95 L42 90 L32 93 L27 84 L17 83 L17 73 L8 68 L11 58 L5 50 L11 42 L8 32 L17 27 L17 16 L27 16 L32 7 L42 10 Z"
          fill={mainColor}
        />
        {/* Place text (e.g. 1st, 2nd, 3rd) */}
        <text
          x="50"
          y="65"
          textAnchor="middle"
          fill={textColor}
          fontSize="26"
          fontWeight="900"
          fontFamily="serif"
        >
          {place.slice(0, -2)}
          <tspan fontSize="10" dy="-10">
            {place.slice(-2)}
          </tspan>
        </text>
      </svg>
    </div>
  );
};

// Available badges mapping: points, hour thresholds, and tailwind ring/border color styles
export const BADGES = [
  {
    label: "Silver",
    points: 50,
    hours: 5,
    color: "bg-[#eff1f2]",
    border: "border-slate-100",
    icon: "text-slate-400",
    ring: "ring-slate-200",
  },
  {
    label: "Gold",
    points: 100,
    hours: 10,
    color: "bg-[#f3e68a]",
    border: "border-yellow-100",
    icon: "text-yellow-400",
    ring: "ring-yellow-200",
  },
  {
    label: "Diamond",
    points: 150,
    hours: 15,
    color: "bg-[#caf4fb]",
    border: "border-blue-100",
    icon: "text-blue-400",
    ring: "ring-blue-200",
  },
];
interface RewardsBadgesCardProps {
  userTotalPoints: number;
}

/**
 * Shared RewardsBadgesCard component.
 * Displays cumulative badge milestones and a progress bar to target the next badge tier.
 * Responsive design adjusts layout dynamically for mobile, tablet, and desktop views.
 */
export const RewardsBadgesCard: React.FC<RewardsBadgesCardProps> = ({
  userTotalPoints,
}) => {
  // Determine highest earned badge and next badge targets based on user total cumulative points
  // Comment: Unlocks badges at 50 (Silver), 100 (Gold), and 150 (Diamond) points
  const highestEarned = [...BADGES]
    .reverse()
    .find((b) => userTotalPoints >= b.points);
  // const nextBadge = BADGES.find((b) => userTotalPoints < b.points);

  return (
    <div className="bg-[#ffffff] rounded-[2rem] p-6 shadow-sm border border-gray-100 w-full">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-[#08351e] p-2 rounded-xl shadow-lg shadow-green-900/10">
          <Medal className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-extrabold text-gray-900 text-lg tracking-tight">
            Badges
          </h3>
        </div>
      </div>
      <p className="text-xs font-medium mb-4 leading-relaxed text-gray-500">
        Earn points from clean-up activities to unlock badges and rewards.
      </p>

      {/* Progress towards the next badge milestone */}
      {/* Comment: Renders progress bar to the next milestone based on points */}
      {/* {nextBadge && (
        <div className="mb-5 bg-gray-50/50 rounded-2xl px-4 py-3 border border-gray-100/50">
          <div className="flex justify-between text-[11px] font-bold text-gray-500 mb-1.5">
            <span>Progress to {nextBadge.label} Badge</span>
            <span className="text-[#08351e] font-extrabold">
              {userTotalPoints} / {nextBadge.points} pts
            </span>
          </div>
          <div className="w-full bg-gray-200/60 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-[#08351e] transition-all duration-500"
              style={{
                width: `${Math.min((userTotalPoints / nextBadge.points) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )} */}

      {/* Grid listing all available badges and their earned status */}
      <div className="flex flex-col lg:flex-row gap-3">
        {BADGES.map((badge) => {
          const isEarned = userTotalPoints >= badge.points;
          const isCurrent = highestEarned?.label === badge.label;
          return (
            <div
              key={badge.label}
              className={`flex items-center lg:flex-col lg:justify-center gap-4 lg:gap-3 rounded-2xl px-4 py-3 lg:py-5 lg:px-2 border shadow-sm transition-all lg:flex-1 ${
                isCurrent
                  ? `${badge.color} border-transparent ring-2 ${badge.ring} scale-[1.02]`
                  : isEarned
                    ? `${badge.color} border-transparent opacity-75`
                    : "bg-white border-gray-100"
              }`}
            >
              <div className="p-1 rounded-full shrink-0 flex items-center justify-center">
                <MedalIcon label={badge.label} className="w-16 h-16" />
              </div>
              <div className="flex-1 lg:flex-none w-full flex flex-col items-start lg:items-center">
                <div className="flex items-center gap-2 lg:flex-col lg:gap-1.5">
                  <p className="font-extrabold text-gray-800 text-sm">
                    {badge.label}
                  </p>
                  {/* {isCurrent && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.border} ${badge.icon} bg-white/70`}
                    >
                      ✓ Current
                    </span>
                  )}
                  {isEarned && !isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200 text-gray-400 bg-white/70">
                      ✓ Earned
                    </span>
                  )} */}
                </div>
                <p className="text-[11px] text-gray-500 font-medium lg:text-center mt-1 lg:mt-2 lg:leading-tight">
                  <span className="block">{badge.points} pts</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
