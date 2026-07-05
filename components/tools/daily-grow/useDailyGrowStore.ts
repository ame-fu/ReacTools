"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_ACTIVITIES,
  DEFAULT_ACTIVE_KID_ID,
  DEFAULT_LANG,
  DEFAULT_PERIOD_TIMES,
  DEFAULT_PROFILES,
  DEFAULT_REST_DAYS,
  DEFAULT_REWARD_TRANSACTIONS,
  DEFAULT_SCHEDULE,
} from "./defaults";
import type {
  Activity,
  DailyGrowBackupData,
  DailyGrowState,
  LangCode,
  PeriodTime,
  Profile,
  RewardTx,
  ScheduleItem,
  TabId,
} from "./types";
import {
  generateId,
  getToday,
  isRestDay,
  parseJsonStorage,
  readStorageItem,
  STORAGE_KEYS,
  writeStorageItem,
} from "./utils";

const DEFAULT_STATE: DailyGrowState = {
  tab: "checkin",
  profiles: DEFAULT_PROFILES,
  activities: DEFAULT_ACTIVITIES,
  logs: [],
  rewards: DEFAULT_REWARD_TRANSACTIONS,
  schedule: DEFAULT_SCHEDULE,
  periodTimes: DEFAULT_PERIOD_TIMES,
  restDays: DEFAULT_REST_DAYS,
  customRestDates: [],
  customWorkDates: [],
  activeKidId: DEFAULT_ACTIVE_KID_ID,
  activeScheduleMobileDay: 1,
  batchEditMode: false,
  selectedSlots: [],
  lang: DEFAULT_LANG,
};

function loadInitialState(): DailyGrowState {
  if (typeof window === "undefined") {
    return DEFAULT_STATE;
  }

  return {
    tab: "checkin",
    profiles: parseJsonStorage(STORAGE_KEYS.profiles, DEFAULT_PROFILES),
    activities: parseJsonStorage(STORAGE_KEYS.activities, DEFAULT_ACTIVITIES),
    logs: parseJsonStorage(STORAGE_KEYS.logs, []),
    rewards: parseJsonStorage(STORAGE_KEYS.rewards, DEFAULT_REWARD_TRANSACTIONS),
    schedule: parseJsonStorage(STORAGE_KEYS.schedule, DEFAULT_SCHEDULE),
    periodTimes: parseJsonStorage(STORAGE_KEYS.periodTimes, DEFAULT_PERIOD_TIMES),
    restDays: parseJsonStorage(STORAGE_KEYS.restDays, DEFAULT_REST_DAYS),
    customRestDates: parseJsonStorage(STORAGE_KEYS.customRestDates, []),
    customWorkDates: parseJsonStorage(STORAGE_KEYS.customWorkDates, []),
    activeKidId: readStorageItem(STORAGE_KEYS.activeKidId) ?? DEFAULT_ACTIVE_KID_ID,
    activeScheduleMobileDay: 1,
    batchEditMode: false,
    selectedSlots: [],
    lang: (readStorageItem(STORAGE_KEYS.lang) as LangCode | null) ?? DEFAULT_LANG,
  };
}

function syncToStorage(state: DailyGrowState): void {
  writeStorageItem(STORAGE_KEYS.profiles, JSON.stringify(state.profiles));
  writeStorageItem(STORAGE_KEYS.activities, JSON.stringify(state.activities));
  writeStorageItem(STORAGE_KEYS.logs, JSON.stringify(state.logs));
  writeStorageItem(STORAGE_KEYS.rewards, JSON.stringify(state.rewards));
  writeStorageItem(STORAGE_KEYS.schedule, JSON.stringify(state.schedule));
  writeStorageItem(STORAGE_KEYS.periodTimes, JSON.stringify(state.periodTimes));
  writeStorageItem(STORAGE_KEYS.restDays, JSON.stringify(state.restDays));
  writeStorageItem(STORAGE_KEYS.customRestDates, JSON.stringify(state.customRestDates));
  writeStorageItem(STORAGE_KEYS.customWorkDates, JSON.stringify(state.customWorkDates));
  writeStorageItem(STORAGE_KEYS.activeKidId, state.activeKidId);
  writeStorageItem(STORAGE_KEYS.lang, state.lang);
}

function resolveActiveKidId(state: DailyGrowState): string {
  const kid = state.profiles.find((p) => p.id === state.activeKidId) ?? state.profiles[0];
  return kid?.id ?? state.activeKidId;
}

export interface GrantRewardInput {
  kidId: string;
  title?: string;
  remark?: string;
}

export interface RedeemRewardInput {
  kidId: string;
  remark: string;
}

export interface UpdateScheduleSlotInput {
  day: number;
  period: number;
  subject: string;
  preset: number;
  syncToHabit?: boolean;
}

export interface ApplyBatchClassInput {
  subject: string;
  preset: number;
}

export interface UpdatePeriodInput {
  num: number;
  name: string;
  range: string;
}

export function useDailyGrowStore() {
  const [state, setState] = useState<DailyGrowState>(loadInitialState);

  useEffect(() => {
    syncToStorage(state);
  }, [state]);

  const sync = useCallback(() => {
    setState((prev) => {
      syncToStorage(prev);
      return prev;
    });
  }, []);

  const setTab = useCallback((tab: TabId) => {
    setState((prev) => ({
      ...prev,
      tab,
      batchEditMode: false,
      selectedSlots: [],
    }));
  }, []);

  const toggleLanguage = useCallback((lang: LangCode) => {
    setState((prev) => ({ ...prev, lang }));
  }, []);

  const rotateKid = useCallback(() => {
    setState((prev) => {
      if (prev.profiles.length === 0) return prev;
      const idx = prev.profiles.findIndex((p) => p.id === prev.activeKidId);
      const nextIdx = (idx + 1) % prev.profiles.length;
      return { ...prev, activeKidId: prev.profiles[nextIdx].id };
    });
  }, []);

  const setActiveKidId = useCallback((kidId: string) => {
    setState((prev) => ({ ...prev, activeKidId: kidId }));
  }, []);

  const switchMobileScheduleDay = useCallback((dayNum: number) => {
    setState((prev) => ({ ...prev, activeScheduleMobileDay: dayNum }));
  }, []);

  const toggleHabit = useCallback((actId: string) => {
    const today = getToday();
    setState((prev) => {
      const activeKidId = resolveActiveKidId(prev);
      const logIdx = prev.logs.findIndex(
        (l) => l.kidId === activeKidId && l.actId === actId && l.date === today,
      );

      if (logIdx > -1) {
        return {
          ...prev,
          activeKidId,
          logs: prev.logs.filter((_, i) => i !== logIdx),
        };
      }

      return {
        ...prev,
        activeKidId,
        logs: [
          ...prev.logs,
          { id: generateId("log"), kidId: activeKidId, actId, date: today },
        ],
      };
    });
  }, []);

  const toggleCalendarDateRestStatus = useCallback((dateStr: string) => {
    setState((prev) => {
      const restConfig = {
        restDays: prev.restDays,
        customRestDates: prev.customRestDates,
        customWorkDates: prev.customWorkDates,
      };
      const wasRest = isRestDay(dateStr, restConfig);

      const dateObj = new Date(`${dateStr}T12:00:00`);
      const dayOfWeek = dateObj.getDay();
      const isRecurringRest = prev.restDays.includes(dayOfWeek);

      let customWorkDates = [...prev.customWorkDates];
      let customRestDates = [...prev.customRestDates];

      if (wasRest) {
        if (isRecurringRest) {
          if (!customWorkDates.includes(dateStr)) {
            customWorkDates.push(dateStr);
          }
        }
        customRestDates = customRestDates.filter((d) => d !== dateStr);
      } else if (isRecurringRest) {
        customWorkDates = customWorkDates.filter((d) => d !== dateStr);
      } else if (!customRestDates.includes(dateStr)) {
        customRestDates.push(dateStr);
      }

      return { ...prev, customWorkDates, customRestDates };
    });
  }, []);

  const toggleBatchEditMode = useCallback(() => {
    setState((prev) => ({
      ...prev,
      batchEditMode: !prev.batchEditMode,
      selectedSlots: [],
    }));
  }, []);

  const toggleScheduleSlotSelection = useCallback((dayNum: number, periodNum: number) => {
    const slotKey = `${dayNum}-${periodNum}`;
    setState((prev) => {
      const idx = prev.selectedSlots.indexOf(slotKey);
      const selectedSlots =
        idx > -1
          ? prev.selectedSlots.filter((s) => s !== slotKey)
          : [...prev.selectedSlots, slotKey];
      return { ...prev, selectedSlots };
    });
  }, []);

  const applyBatchClass = useCallback(({ subject, preset }: ApplyBatchClassInput) => {
    const trimmed = subject.trim();
    if (!trimmed) return false;

    setState((prev) => {
      const kidId = resolveActiveKidId(prev);
      if (prev.selectedSlots.length === 0) return prev;

      let schedule = [...prev.schedule];

      prev.selectedSlots.forEach((slot) => {
        const [dStr, pStr] = slot.split("-");
        const day = parseInt(dStr, 10);
        const period = parseInt(pStr, 10);

        schedule = schedule.filter(
          (s) => !(s.kidId === kidId && s.day === day && s.period === period),
        );

        schedule.push({
          id: generateId("sch"),
          kidId,
          day,
          period,
          subject: trimmed,
          preset,
        });
      });

      return {
        ...prev,
        schedule,
        batchEditMode: false,
        selectedSlots: [],
      };
    });

    return true;
  }, []);

  const clearBatchSlots = useCallback(() => {
    setState((prev) => {
      const kidId = resolveActiveKidId(prev);
      if (prev.selectedSlots.length === 0) return prev;

      let schedule = [...prev.schedule];

      prev.selectedSlots.forEach((slot) => {
        const [dStr, pStr] = slot.split("-");
        const day = parseInt(dStr, 10);
        const period = parseInt(pStr, 10);
        schedule = schedule.filter(
          (s) => !(s.kidId === kidId && s.day === day && s.period === period),
        );
      });

      return {
        ...prev,
        schedule,
        batchEditMode: false,
        selectedSlots: [],
      };
    });
  }, []);

  const updatePeriodTime = useCallback(({ num, name, range }: UpdatePeriodInput) => {
    const nameStr = name.trim();
    const rangeStr = range.trim();
    if (!nameStr || !rangeStr) return false;

    setState((prev) => ({
      ...prev,
      periodTimes: prev.periodTimes.map((pt) =>
        pt.num === num ? { ...pt, name: nameStr, range: rangeStr } : pt,
      ),
    }));

    return true;
  }, []);

  const updateScheduleSlot = useCallback(
    ({ day, period, subject, preset, syncToHabit = false }: UpdateScheduleSlotInput) => {
      setState((prev) => {
        const kidId = resolveActiveKidId(prev);
        const trimmed = subject.trim();

        let schedule = prev.schedule.filter(
          (s) => !(s.kidId === kidId && s.day === day && s.period === period),
        );

        let activities = prev.activities;

        if (trimmed) {
          schedule = [
            ...schedule,
            {
              id: generateId("sch"),
              kidId,
              day,
              period,
              subject: trimmed,
              preset,
            },
          ];

          if (syncToHabit) {
            const habitExists = prev.activities.some(
              (a) => a.kidId === kidId && a.title.toLowerCase() === trimmed.toLowerCase(),
            );
            if (!habitExists) {
              activities = [
                ...prev.activities,
                {
                  id: generateId("act"),
                  kidId,
                  title: trimmed,
                  preset,
                },
              ];
            }
          }
        }

        return { ...prev, schedule, activities };
      });
    },
    [],
  );

  const grantReward = useCallback(({ kidId, title, remark }: GrantRewardInput) => {
    const finalTitle = (title?.trim().toUpperCase() || "STAR REWARD");
    const finalRemark = remark?.trim() || "Parent granted reward star";

    setState((prev) => ({
      ...prev,
      rewards: [
        {
          id: generateId("tx"),
          kidId,
          type: "earn",
          title: finalTitle,
          remark: finalRemark,
          date: getToday(),
          amount: 1,
        },
        ...prev.rewards,
      ],
    }));
  }, []);

  const redeemReward = useCallback(
    ({ kidId, remark }: RedeemRewardInput): boolean => {
      const finalRemark = remark.trim();
      if (!finalRemark) return false;

      const balance = state.rewards
        .filter((tx) => tx.kidId === kidId)
        .reduce((sum, tx) => sum + tx.amount, 0);

      if (balance <= 0) return false;

      setState((prev) => ({
        ...prev,
        rewards: [
          {
            id: generateId("tx"),
            kidId,
            type: "consume",
            title: "REDEMPTION",
            remark: finalRemark,
            date: getToday(),
            amount: -1,
          },
          ...prev.rewards,
        ],
      }));

      return true;
    },
    [state.rewards],
  );

  const addProfile = useCallback((name: string, code: string) => {
    const trimmedName = name.trim();
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedName || !trimmedCode) return false;

    const newId = generateId("kid");
    setState((prev) => ({
      ...prev,
      profiles: [
        ...prev.profiles,
        { id: newId, name: trimmedName, code: trimmedCode.slice(0, 2) },
      ],
      activeKidId: newId,
    }));

    return true;
  }, []);

  const updateProfile = useCallback((id: string, name: string, code: string) => {
    const trimmedName = name.trim();
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedName || !trimmedCode) return false;

    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.id === id ? { ...p, name: trimmedName, code: trimmedCode.slice(0, 2) } : p,
      ),
    }));

    return true;
  }, []);

  const removeProfile = useCallback((id: string) => {
    setState((prev) => {
      if (prev.profiles.length <= 1) return prev;

      const profiles = prev.profiles.filter((p) => p.id !== id);
      const activeKidId =
        prev.activeKidId === id ? (profiles[0]?.id ?? prev.activeKidId) : prev.activeKidId;

      return {
        ...prev,
        profiles,
        activeKidId,
        activities: prev.activities.filter((a) => a.kidId !== id),
        logs: prev.logs.filter((l) => l.kidId !== id),
        rewards: prev.rewards.filter((b) => b.kidId !== id),
        schedule: prev.schedule.filter((s) => s.kidId !== id),
      };
    });
  }, []);

  const addHabit = useCallback((title: string, preset: number) => {
    const trimmed = title.trim();
    if (!trimmed) return false;

    setState((prev) => ({
      ...prev,
      activities: [
        ...prev.activities,
        {
          id: generateId("act"),
          kidId: resolveActiveKidId(prev),
          title: trimmed,
          preset,
        },
      ],
    }));

    return true;
  }, []);

  const updateHabit = useCallback((id: string, title: string, preset: number) => {
    const trimmed = title.trim();
    if (!trimmed) return false;

    setState((prev) => ({
      ...prev,
      activities: prev.activities.map((a) =>
        a.id === id ? { ...a, title: trimmed, preset } : a,
      ),
    }));

    return true;
  }, []);

  const removeHabit = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      activities: prev.activities.filter((a) => a.id !== id),
      logs: prev.logs.filter((l) => l.actId !== id),
    }));
  }, []);

  const getBackupData = useCallback((): DailyGrowBackupData => {
    return {
      profiles: state.profiles,
      activities: state.activities,
      logs: state.logs,
      rewards: state.rewards,
      schedule: state.schedule,
      periodTimes: state.periodTimes,
      restDays: state.restDays,
      customRestDates: state.customRestDates,
      customWorkDates: state.customWorkDates,
      lang: state.lang,
    };
  }, [state]);

  const importBackupData = useCallback((data: DailyGrowBackupData) => {
    setState((prev) => ({
      ...prev,
      profiles: data.profiles,
      activities: data.activities,
      logs: data.logs,
      rewards: data.rewards,
      schedule: data.schedule,
      periodTimes: data.periodTimes,
      restDays: data.restDays,
      customRestDates: data.customRestDates,
      customWorkDates: data.customWorkDates,
      lang: data.lang,
      batchEditMode: false,
      selectedSlots: [],
    }));
  }, []);

  const getRewardBalance = useCallback(
    (kidId: string) =>
      state.rewards.filter((tx) => tx.kidId === kidId).reduce((sum, tx) => sum + tx.amount, 0),
    [state.rewards],
  );

  const getActiveProfile = useCallback((): Profile | undefined => {
    return state.profiles.find((p) => p.id === state.activeKidId) ?? state.profiles[0];
  }, [state.profiles, state.activeKidId]);

  return {
    state,
    sync,
    setTab,
    toggleLanguage,
    rotateKid,
    setActiveKidId,
    switchMobileScheduleDay,
    toggleHabit,
    toggleCalendarDateRestStatus,
    toggleBatchEditMode,
    toggleScheduleSlotSelection,
    applyBatchClass,
    clearBatchSlots,
    updatePeriodTime,
    updateScheduleSlot,
    grantReward,
    redeemReward,
    addProfile,
    updateProfile,
    removeProfile,
    addHabit,
    updateHabit,
    removeHabit,
    getBackupData,
    importBackupData,
    getRewardBalance,
    getActiveProfile,
  };
}

export type DailyGrowStore = ReturnType<typeof useDailyGrowStore>;

export type {
  Activity,
  DailyGrowState,
  LangCode,
  PeriodTime,
  Profile,
  RewardTx,
  ScheduleItem,
  TabId,
};
