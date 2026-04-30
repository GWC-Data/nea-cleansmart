import React, { useState } from "react";
import { Trophy, Building2, Medal } from "lucide-react";

interface LeaderboardProps {
  userLeaderboard: any[];
  orgLeaderboard: any[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  userLeaderboard,
  orgLeaderboard,
}) => {
  const [activeTab, setActiveTab] = useState<"users" | "orgs">("users");

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-500 bg-yellow-50";
      case 2:
        return "text-gray-400 bg-gray-50";
      case 3:
        return "text-orange-500 bg-orange-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <Medal className="w-4 h-4" />;
    }
    return <span className="text-[10px] font-bold">{rank}</span>;
  };
  console.log("userLeaderboard", userLeaderboard);
  console.log("orgLeaderboard", orgLeaderboard);
  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col gap-4">
      {/* Tab Navigation */}
      <div className="flex p-1 bg-gray-50 rounded-2xl">
        <button
          onClick={() => setActiveTab("users")}
          className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
            activeTab === "users"
              ? "bg-[#96c93d] text-white shadow-lg"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Trophy
            className={`w-3.5 h-3.5 ${activeTab === "users" ? "text-white" : "text-gray-300"}`}
          />
          Users
        </button>
        <button
          onClick={() => setActiveTab("orgs")}
          className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
            activeTab === "orgs"
              ? "bg-[#96c93d] text-white shadow-lg"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Building2
            className={`w-3.5 h-3.5 ${activeTab === "orgs" ? "text-white" : "text-gray-300"}`}
          />
          Organizations
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 animate-in fade-in duration-500">
        {activeTab === "users" ? (
          <>
            <div className="flex items-center justify-between px-1">
              <h3 className="font-black text-gray-900 text-sm tracking-tight">
                Top Performers
              </h3>
            </div>
            <div className="flex flex-col gap-2.5">
              {userLeaderboard.length > 0 ? (
                userLeaderboard.slice(0, 5).map((user, idx) => (
                  <div
                    key={user.userId}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getRankColor(
                        idx + 1,
                      )}`}
                    >
                      {getRankIcon(idx + 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-gray-900 truncate">
                        {user.userName}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-black text-[#08351e] uppercase tracking-widest">
                          {user.totalPoints} pts
                        </span>
                        <span className="w-0.5 h-0.5 bg-gray-300 rounded-full" />
                        <span className="text-[9px] font-medium text-gray-400">
                          {user.totalTimeLogged} hrs
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center flex flex-col items-center gap-2">
                  <Trophy className="w-8 h-8 text-gray-100" />
                  <p className="text-[10px] text-gray-400 font-medium">
                    No performance data yet
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between px-1">
              <h3 className="font-black text-gray-900 text-sm tracking-tight">
                Top Organizations
              </h3>
            </div>
            <div className="flex flex-col gap-2.5">
              {orgLeaderboard.length > 0 ? (
                orgLeaderboard.slice(0, 5).map((org, idx) => (
                  <div
                    key={org.orgId}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        idx === 0
                          ? "bg-[#96c93d] text-[#08351e]"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {getRankIcon(idx + 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-gray-900 truncate">
                        {org.orgName}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-black text-[#08351e] uppercase tracking-widest">
                          {org.totalHours.toFixed(1)} hrs
                        </span>
                        <span className="w-0.5 h-0.5 bg-gray-300 rounded-full" />
                        <span className="text-[9px] font-medium text-gray-400">
                          {org.memberCount} members
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center flex flex-col items-center gap-2">
                  <Building2 className="w-8 h-8 text-gray-100" />
                  <p className="text-[10px] text-gray-400 font-medium">
                    No organization data yet
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
