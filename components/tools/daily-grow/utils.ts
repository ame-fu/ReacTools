import type { PeriodTime, ScheduleItem } from "./types";

export const STORAGE_KEYS = {
  profiles: "reac-tools-daily-grow-profiles",
  activities: "reac-tools-daily-grow-activities",
  logs: "reac-tools-daily-grow-logs",
  rewards: "reac-tools-daily-grow-rewards-txs",
  schedule: "reac-tools-daily-grow-schedule",
  periodTimes: "reac-tools-daily-grow-periodtimes",
  restDays: "reac-tools-daily-grow-restdays",
  customRestDates: "reac-tools-daily-grow-custom-rest-dates",
  customWorkDates: "reac-tools-daily-grow-custom-work-dates",
  activeKidId: "reac-tools-daily-grow-active-id",
  lang: "reac-tools-daily-grow-lang",
} as const;

export interface RestDayConfig {
  restDays: number[];
  customRestDates: string[];
  customWorkDates: string[];
}

export function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function isRestDay(dateStr: string, config: RestDayConfig): boolean {
  if (config.customWorkDates.includes(dateStr)) return false;
  if (config.customRestDates.includes(dateStr)) return true;
  const dateObj = new Date(`${dateStr}T12:00:00`);
  const dayOfWeek = dateObj.getDay();
  return config.restDays.includes(dayOfWeek);
}

export function getCurrentWeekDates(referenceDate: Date = new Date()): string[] {
  const current = new Date(referenceDate);
  const week: string[] = [];
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(current);
  monday.setDate(diff);

  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    const year = nextDay.getFullYear();
    const month = String(nextDay.getMonth() + 1).padStart(2, "0");
    const dayStr = String(nextDay.getDate()).padStart(2, "0");
    week.push(`${year}-${month}-${dayStr}`);
  }
  return week;
}

export function getVisiblePeriods(
  kidId: string,
  schedule: ScheduleItem[],
  periodTimes: PeriodTime[],
): PeriodTime[] {
  const kidSchedule = schedule.filter((s) => s.kidId === kidId);

  const periodStatus = periodTimes.map((p) => {
    const hasClass = kidSchedule.some((s) => s.period === p.num);
    return { period: p, isEmpty: !hasClass };
  });

  const visible: PeriodTime[] = [];
  let prevWasEmpty = false;

  periodStatus.forEach((status) => {
    if (status.isEmpty) {
      if (!prevWasEmpty) {
        visible.push(status.period);
        prevWasEmpty = true;
      }
    } else {
      visible.push(status.period);
      prevWasEmpty = false;
    }
  });

  return visible;
}

export function generateId(prefix: string): string {
  if (prefix === "sch") {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  }
  return `${prefix}_${Date.now()}`;
}

export function readStorageItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorageItem(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore quota / privacy errors
  }
}

export function parseJsonStorage<T>(key: string, fallback: T): T {
  const raw = readStorageItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
