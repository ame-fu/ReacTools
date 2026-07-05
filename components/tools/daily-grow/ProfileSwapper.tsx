"use client";

import type { Profile } from "./types";

interface ProfileSwapperProps {
  profile: Profile;
  onSwap: () => void;
  tt: (key: string) => string;
}

export function ProfileSwapper({ profile, onSwap, tt }: ProfileSwapperProps) {
  return (
    <div className="border-t border-neutral-300 pt-6 mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 bg-[#1A1A1A] text-white rounded-none flex items-center justify-center text-xs font-bold tracking-widest border border-black shadow-[3px_3px_0px_0px_#E2AC4B] font-accent">
          {profile.code}
        </div>
        <div className="text-center sm:text-left">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block leading-none mb-1 font-accent">
            {tt("activeProfile")}
          </span>
          <h3 className="text-sm font-bold text-black tracking-tight leading-none uppercase">
            {profile.name}
          </h3>
        </div>
      </div>
      <button
        type="button"
        onClick={onSwap}
        className="card-tap bg-white hover:bg-slate-50 text-[#1A1A1A] text-[10px] font-bold py-2.5 px-4 border border-[#1A1A1A] tracking-wider shadow-[3px_3px_0px_0px_#4A6B82] uppercase font-accent"
      >
        {tt("swapProfile")}
      </button>
    </div>
  );
}
