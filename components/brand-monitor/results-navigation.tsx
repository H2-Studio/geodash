import React from "react";
import { ResultsTab } from "@/lib/brand-monitor-reducer";

interface BrandData {
  visibilityScore: number;
  sentimentScore: number;
  shareOfVoice: number;
  overallScore: number;
  averagePosition: number;
  weeklyChange?: number;
}

interface ResultsNavigationProps {
  activeTab: ResultsTab;
  onTabChange: (tab: ResultsTab) => void;
  onRestart: () => void;
  brandData?: BrandData;
  brandName?: string;
}

export function ResultsNavigation({
  activeTab,
  onTabChange,
  onRestart,
  brandData,
  brandName,
}: ResultsNavigationProps) {
  const handleTabClick = (tab: ResultsTab) => {
    onTabChange(tab);
  };

  // Nouveau : blue-shadow
  const blueShadow =
    "[box-shadow:inset_0px_-2.108433723449707px_0px_0px_#1d4ed8,_0px_1.2048193216323853px_6.325301647186279px_0px_rgba(37,_99,_235,_58%)] hover:translate-y-[1px] hover:scale-[0.98]";

  return (
    <nav
      className="w-80 flex-shrink-0 animate-fade-in flex flex-col h-[calc(100vh-8rem)] ml-[-2rem] sticky top-8"
      style={{ animationDelay: "0.3s" }}
    >
      <div className="w-full flex flex-col justify-between flex-1">
        {/* Navigation Tabs - at the top */}
        <div className="space-y-2">
          <button
            onClick={() => handleTabClick("matrix")}
            className={`w-full text-left px-4 py-3 rounded-[10px] text-sm font-medium transition-all duration-200 ${
              activeTab === "matrix"
                ? "bg-[#36322F] text-white [box-shadow:inset_0px_-2.108433723449707px_0px_0px_#171310,_0px_1.2048193216323853px_6.325301647186279px_0px_rgba(58,_33,_8,_58%)]"
                : `bg-blue-500 text-white hover:bg-blue-600 ${blueShadow}`
            }`}
          >
            Comparison Matrix
          </button>
          <button
            onClick={() => handleTabClick("prompts")}
            className={`w-full text-left px-4 py-3 rounded-[10px] text-sm font-medium transition-all duration-200 ${
              activeTab === "prompts"
                ? "bg-[#36322F] text-white [box-shadow:inset_0px_-2.108433723449707px_0px_0px_#171310,_0px_1.2048193216323853px_6.325301647186279px_0px_rgba(58,_33,_8,_58%)]"
                : `bg-blue-500 text-white hover:bg-blue-600 ${blueShadow}`
            }`}
          >
            Prompts & Responses
          </button>
          <button
            onClick={() => handleTabClick("rankings")}
            className={`w-full text-left px-4 py-3 rounded-[10px] text-sm font-medium transition-all duration-200 ${
              activeTab === "rankings"
                ? "bg-[#36322F] text-white [box-shadow:inset_0px_-2.108433723449707px_0px_0px_#171310,_0px_1.2048193216323853px_6.325301647186279px_0px_rgba(58,_33,_8,_58%)]"
                : `bg-blue-500 text-white hover:bg-blue-600 ${blueShadow}`
            }`}
          >
            Provider Rankings
          </button>
          <button
            onClick={() => handleTabClick("visibility")}
            className={`w-full text-left px-4 py-3 rounded-[10px] text-sm font-medium transition-all duration-200 ${
              activeTab === "visibility"
                ? "bg-[#36322F] text-white [box-shadow:inset_0px_-2.108433723449707px_0px_0px_#171310,_0px_1.2048193216323853px_6.325301647186279px_0px_rgba(58,_33,_8,_58%)]"
                : `bg-blue-500 text-white hover:bg-blue-600 ${blueShadow}`
            }`}
          >
            Visibility Score
          </button>
        </div>

        {/* Analyze another website button - at the bottom */}
        <div className="pt-4 pb-8 border-t border-gray-200">
          <button
            onClick={onRestart}
            className="w-full text-left px-4 py-3 rounded-[10px] text-sm font-medium transition-all duration-200 bg-[#36322F] text-[#fff] hover:bg-[#4a4542] [box-shadow:inset_0px_-2.108433723449707px_0px_0px_#171310,_0px_1.2048193216323853px_6.325301647186279px_0px_rgba(58,_33,_8,_58%)] hover:translate-y-[1px] hover:scale-[0.98] hover:[box-shadow:inset_0px_-1px_0px_0px_#171310,_0px_1px_3px_0px_rgba(58,_33,_8,_40%)] active:translate-y-[2px] active:scale-[0.97] active:[box-shadow:inset_0px_1px_1px_0px_#171310,_0px_1px_2px_0px_rgba(58,_33,_8,_30%)] flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Analyze another website
          </button>
        </div>
      </div>
    </nav>
  );
}
