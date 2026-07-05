"use client";

import type { Activity, Log, Profile } from "./types";
import { isRestDay, type RestDayConfig } from "./utils";

interface AnnualOverviewModalProps {
  open: boolean;
  onClose: () => void;
  profile: Profile | undefined;
  activities: Activity[];
  logs: Log[];
  restConfig: RestDayConfig;
  onToggleRestDate: (dateStr: string) => void;
  tt: (key: string) => string;
}

const MONTH_KEYS = [
  "monthJan",
  "monthFeb",
  "monthMar",
  "monthApr",
  "monthMay",
  "monthJun",
  "monthJul",
  "monthAug",
  "monthSep",
  "monthOct",
  "monthNov",
  "monthDec",
] as const;

const WEEKDAY_HEADERS = ["M", "T", "W", "T", "F", "S", "S"];

export function AnnualOverviewModal({
  open,
  onClose,
  profile,
  activities,
  logs,
  restConfig,
  onToggleRestDate,
  tt,
}: AnnualOverviewModalProps) {
  if (!open || !profile) return null;

  const currentYear = new Date().getFullYear();
  const kidActs = activities.filter((a) => a.kidId === profile.id);
  const totalActsCount = kidActs.length;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-none border-2 border-[#1A1A1A] p-6 w-full max-w-5xl shadow-[8px_8px_0px_0px_#1A1A1A] flex flex-col gap-4 relative max-h-[85vh] overflow-y-auto no-scrollbar">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 bg-[#D35B47] text-white font-bold text-xs tracking-wider border border-[#1A1A1A] px-4 py-2 hover:bg-red-800 card-tap rounded-none uppercase font-accent"
        >
          {tt("closePanel")}
        </button>

        <div className="border-b border-neutral-200 pb-3">
          <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase font-mono">
            {tt("milestones")}
          </span>
          <h3 className="text-base font-bold text-[#1A1A1A] uppercase tracking-wider">
            {tt("annualProgressTitle")}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {MONTH_KEYS.map((monthKey, m) => {
            const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
            const firstDayIndex = new Date(currentYear, m, 1).getDay();
            const calendarOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
            const monthLabel = tt(monthKey);

            return (
              <div
                key={monthKey}
                className="bg-white rounded-none border border-[#1A1A1A] p-2.5 shadow-[2px_2px_0px_0px_#1A1A1A] flex flex-col justify-between"
              >
                <h5 className="font-bold text-neutral-800 text-[10px] tracking-wider uppercase mb-1.5 border-b border-neutral-100 pb-1 font-accent">
                  {monthLabel.substring(0, 3)}
                </h5>
                <div className="grid grid-cols-7 gap-0.5 text-center text-[8px] font-bold text-slate-400 mb-1 font-accent">
                  {WEEKDAY_HEADERS.map((d, i) => (
                    <div key={`${monthKey}-h-${i}`}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({ length: calendarOffset }).map((_, i) => (
                    <div
                      key={`${monthKey}-off-${i}`}
                      className="aspect-square rounded-none bg-[#F5F4EE] border border-neutral-200/50"
                    />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, dayIdx) => {
                    const day = dayIdx + 1;
                    const dateString = `${currentYear}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const doneOnDay = logs.filter(
                      (l) => l.kidId === profile.id && l.date === dateString,
                    ).length;
                    const isExempt = isRestDay(dateString, restConfig);

                    let bgClass =
                      "bg-white border border-neutral-200 text-neutral-800";
                    if (isExempt) {
                      bgClass =
                        "pattern-rest border border-neutral-300 text-neutral-400";
                    } else if (doneOnDay > 0 && doneOnDay < totalActsCount) {
                      bgClass =
                        "bg-[#E2AC4B]/10 border border-[#E2AC4B] text-[#E2AC4B]";
                    } else if (
                      doneOnDay > 0 &&
                      doneOnDay >= totalActsCount
                    ) {
                      bgClass =
                        "bg-[#D35B47] border border-[#D35B47] text-white";
                    }

                    return (
                      <button
                        key={dateString}
                        type="button"
                        onClick={() => onToggleRestDate(dateString)}
                        className={`aspect-square rounded-none ${bgClass} flex items-center justify-center relative text-[10px] font-bold font-accent cursor-pointer`}
                        title={`${dateString}`}
                      >
                        <span>{day}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-4 pt-3 border-t border-neutral-200 text-[10px] text-slate-500 font-bold uppercase font-accent">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 border border-neutral-300 bg-white" />
            {tt("chartTodo")}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 border border-neutral-300 pattern-rest" />
            {tt("chartRest")}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 border border-neutral-300 bg-[#E2AC4B]/10" />
            {tt("chartPartial")}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 border border-neutral-300 bg-[#D35B47]" />
            {tt("chartCompleted")}
          </div>
        </div>
      </div>
    </div>
  );
}
