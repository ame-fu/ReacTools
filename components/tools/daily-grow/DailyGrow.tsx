"use client";

import { useCallback, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useI18n } from "@/lib/i18n/context";
import { AnnualOverviewModal } from "./AnnualOverviewModal";
import { DailyGrowModal } from "./DailyGrowModal";
import { ProfileSwapper } from "./ProfileSwapper";
import "./daily-grow.css";
import type { ModalField, TabId } from "./types";
import { useDailyGrowStore } from "./useDailyGrowStore";
import {
  getCurrentWeekDates,
  getToday,
  getVisiblePeriods,
  isRestDay,
} from "./utils";

type Tt = (key: string) => string;

interface GenericModalState {
  title: string;
  subtitle: string;
  fields: ModalField[];
  onConfirm: (data: Record<string, string>) => void;
}

interface ConfirmState {
  message: string;
  onConfirm: () => void;
}

const TAB_ORDER: TabId[] = ["checkin", "badges", "schedule", "admin"];

const DESKTOP_TAB_NUM: Record<TabId, string> = {
  checkin: "01",
  badges: "02",
  schedule: "03",
  admin: "04",
};

const MOBILE_TAB_LABEL: Record<TabId, string> = {
  checkin: "checkin",
  badges: "honors",
  schedule: "schedule",
  admin: "mobileSettings",
};

const WEEK_DAY_KEYS = [
  "weekMon",
  "weekTue",
  "weekWed",
  "weekThu",
  "weekFri",
  "weekSat",
  "weekSun",
] as const;

const SCHEDULE_DAY_KEYS = [
  "dayMonday",
  "dayTuesday",
  "dayWednesday",
  "dayThursday",
  "dayFriday",
  "daySaturday",
  "daySunday",
] as const;

const PRESET_THEME_KEYS = [
  "themeRed",
  "themeBlue",
  "themeYellow",
  "themeBlack",
  "themeGrey",
  "themeOffWhite",
] as const;

function buildPresetOptions(tt: Tt) {
  return [
    { value: "0", label: tt("presetTerracotta") },
    { value: "1", label: tt("presetSteelBlue") },
    { value: "2", label: tt("presetOchre") },
    { value: "3", label: tt("presetCharcoal") },
    { value: "4", label: tt("presetSage") },
    { value: "5", label: tt("presetOatmeal") },
  ];
}

export default function DailyGrow() {
  const { t, locale } = useI18n();
  const tt: Tt = useCallback((k) => t(`tools.daily-grow.${k}`), [t]);

  const store = useDailyGrowStore();
  const { state } = store;
  const kid = store.getActiveProfile();

  const importRef = useRef<HTMLInputElement>(null);

  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [genericModal, setGenericModal] = useState<GenericModalState | null>(
    null,
  );
  const [verifyModal, setVerifyModal] = useState<{
    num1: number;
    num2: number;
    answer: number;
    pending: () => void;
  } | null>(null);
  const [annualOpen, setAnnualOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const [batchSubject, setBatchSubject] = useState("");
  const [batchPreset, setBatchPreset] = useState("1");
  const [addKidName, setAddKidName] = useState("");
  const [addKidCode, setAddKidCode] = useState("");
  const [addActTitle, setAddActTitle] = useState("");
  const [addActPreset, setAddActPreset] = useState("0");

  const restConfig = {
    restDays: state.restDays,
    customRestDates: state.customRestDates,
    customWorkDates: state.customWorkDates,
  };

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2500);
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  const openModal = useCallback(
    (
      title: string,
      subtitle: string,
      fields: ModalField[],
      onConfirm: (data: Record<string, string>) => void,
    ) => {
      setGenericModal({ title, subtitle, fields, onConfirm });
    },
    [],
  );

  const closeModal = useCallback(() => setGenericModal(null), []);

  const parentVerify = useCallback((callback: () => void) => {
    const num1 = Math.floor(Math.random() * 5 + 4);
    const num2 = Math.floor(Math.random() * 5 + 3);
    setVerifyModal({
      num1,
      num2,
      answer: num1 * num2,
      pending: callback,
    });
  }, []);

  const handleToggleRestDate = useCallback(
    (dateStr: string) => {
      const wasRest = isRestDay(dateStr, restConfig);
      store.toggleCalendarDateRestStatus(dateStr);
      showToast(
        wasRest
          ? tt("toastSetWorkDay").replace("{date}", dateStr)
          : tt("toastSetRestDay").replace("{date}", dateStr),
      );
    },
    [restConfig, showToast, store, tt],
  );

  const handleRotateKid = useCallback(() => {
    if (state.profiles.length === 0) return;
    const idx = state.profiles.findIndex((p) => p.id === state.activeKidId);
    const nextIdx = (idx + 1) % state.profiles.length;
    const nextName = state.profiles[nextIdx].name;
    store.rotateKid();
    showToast(tt("toastSwitchedProfile").replace("{name}", nextName));
  }, [showToast, state.activeKidId, state.profiles, store, tt]);

  const handleGrantStar = useCallback(() => {
    if (!kid) return;
    openModal(tt("grantStarTitle"), tt("grantStarSub"), [
      { id: "title", type: "text", placeholder: tt("grantStarTitlePlaceholder") },
      { id: "remark", type: "text", placeholder: tt("grantStarRemarkPlaceholder") },
    ], (res) => {
      store.grantReward({
        kidId: kid.id,
        title: res.title,
        remark: res.remark,
      });
      showToast(tt("toastGrantStarSuccess"));
    });
  }, [kid, openModal, showToast, store, tt]);

  const handleRedeemStar = useCallback(() => {
    if (!kid) return;
    const balance = store.getRewardBalance(kid.id);
    if (balance <= 0) {
      showToast(tt("toastInsufficientBalance"));
      return;
    }
    openModal(tt("redeemStarTitle"), tt("redeemStarSub"), [
      { id: "remark", type: "text", placeholder: tt("redeemRemarkPlaceholder") },
    ], (res) => {
      const ok = store.redeemReward({ kidId: kid.id, remark: res.remark });
      if (!ok) {
        showToast(
          res.remark.trim()
            ? tt("toastInsufficientBalance")
            : tt("toastRedeemRemarkRequired"),
        );
        return;
      }
      showToast(tt("toastRedeemSuccess"));
    });
  }, [kid, openModal, showToast, store, tt]);

  const handleEditPeriod = useCallback(
    (num: number) => {
      const pt = state.periodTimes.find((x) => x.num === num);
      if (!pt) return;
      openModal(
        tt("editPeriodTitle"),
        `${tt("editPeriodSub")}${num}:`,
        [
          { id: "name", type: "text", placeholder: tt("periodLabelPlaceholder"), defaultValue: pt.name },
          { id: "range", type: "text", placeholder: tt("periodRangePlaceholder"), defaultValue: pt.range },
        ],
        (res) => {
          const ok = store.updatePeriodTime({
            num,
            name: res.name,
            range: res.range,
          });
          showToast(ok ? tt("toastPeriodUpdated") : tt("toastInputsRequired"));
        },
      );
    },
    [openModal, showToast, state.periodTimes, store, tt],
  );

  const handleScheduleSlotClick = useCallback(
    (dayNum: number, periodNum: number) => {
      if (!kid) return;
      if (state.batchEditMode) {
        store.toggleScheduleSlotSelection(dayNum, periodNum);
        return;
      }

      const existing = state.schedule.find(
        (s) => s.kidId === kid.id && s.day === dayNum && s.period === periodNum,
      );
      const presetOptions = buildPresetOptions(tt);

      openModal(
        tt("editClassTitle"),
        `${tt("editClassSub")}${dayNum} - ${tt("periodWord")} ${periodNum}:`,
        [
          {
            id: "subject",
            type: "text",
            placeholder: tt("subjectPlaceholder"),
            defaultValue: existing?.subject ?? "",
          },
          {
            id: "preset",
            type: "select",
            label: tt("themeColorPreset"),
            defaultValue: existing?.preset ?? 1,
            options: presetOptions,
          },
          {
            id: "syncToHabit",
            type: "select",
            label: tt("syncToHabitLabel"),
            defaultValue: "0",
            options: [
              { value: "0", label: tt("syncNo") },
              { value: "1", label: tt("syncYes") },
            ],
          },
        ],
        (res) => {
          const subject = res.subject.trim();
          const presetVal = parseInt(res.preset, 10);
          const syncToHabit = res.syncToHabit === "1";

          store.updateScheduleSlot({
            day: dayNum,
            period: periodNum,
            subject,
            preset: presetVal,
            syncToHabit,
          });

          if (subject) {
            let msg = tt("toastClassAssigned").replace("{subject}", subject);
            if (syncToHabit) {
              const exists = state.activities.some(
                (a) =>
                  a.kidId === kid.id &&
                  a.title.toLowerCase() === subject.toLowerCase(),
              );
              msg += exists ? tt("toastHabitExists") : tt("toastHabitSynced");
            }
            showToast(msg);
          } else {
            showToast(tt("toastClassCleared"));
          }
        },
      );
    },
    [kid, openModal, showToast, state.activities, state.batchEditMode, state.schedule, store, tt],
  );

  const handleBatchApply = useCallback(() => {
    const ok = store.applyBatchClass({
      subject: batchSubject,
      preset: parseInt(batchPreset, 10),
    });
    if (!ok) {
      showToast(
        batchSubject.trim()
          ? tt("toastSelectSlots")
          : tt("toastSubjectRequired"),
      );
      return;
    }
    setBatchSubject("");
    showToast(tt("toastBatchApplied"));
  }, [batchPreset, batchSubject, showToast, store, tt]);

  const handleBatchClear = useCallback(() => {
    if (state.selectedSlots.length === 0) {
      showToast(tt("toastSelectSlots"));
      return;
    }
    store.clearBatchSlots();
    showToast(tt("toastBatchCleared"));
  }, [showToast, state.selectedSlots.length, store, tt]);

  const handleToggleBatch = useCallback(() => {
    store.toggleBatchEditMode();
    showToast(
      !state.batchEditMode
        ? tt("toastBatchModeOn")
        : tt("toastBatchModeOff"),
    );
  }, [showToast, state.batchEditMode, store, tt]);

  const handleEditProfile = useCallback(
    (id: string) => {
      const profile = state.profiles.find((p) => p.id === id);
      if (!profile) return;
      openModal(tt("editProfileTitle"), tt("editProfileSub"), [
        { id: "name", type: "text", placeholder: tt("enterName"), defaultValue: profile.name },
        { id: "code", type: "text", placeholder: tt("codePlaceholder"), defaultValue: profile.code },
      ], (res) => {
        const ok = store.updateProfile(id, res.name, res.code);
        showToast(ok ? tt("toastProfileUpdated") : tt("toastFieldsRequired"));
      });
    },
    [openModal, showToast, state.profiles, store, tt],
  );

  const handleDeleteProfile = useCallback(
    (id: string) => {
      if (state.profiles.length <= 1) {
        showToast(tt("toastMinOneProfile"));
        return;
      }
      const profile = state.profiles.find((p) => p.id === id);
      setConfirmState({
        message: tt("confirmDeleteProfile").replace(
          "{name}",
          profile?.name ?? "",
        ),
        onConfirm: () => {
          store.removeProfile(id);
          showToast(tt("toastProfileRemoved"));
        },
      });
    },
    [showToast, state.profiles, store, tt],
  );

  const handleEditHabit = useCallback(
    (id: string) => {
      const act = state.activities.find((a) => a.id === id);
      if (!act) return;
      openModal(tt("editHabitTitle"), tt("editHabitSub"), [
        { id: "title", type: "text", placeholder: tt("enterHabitTitle"), defaultValue: act.title },
        {
          id: "preset",
          type: "select",
          label: tt("themeColorPreset"),
          defaultValue: act.preset,
          options: buildPresetOptions(tt),
        },
      ], (res) => {
        const ok = store.updateHabit(id, res.title, parseInt(res.preset, 10));
        showToast(ok ? tt("toastHabitUpdated") : tt("toastHabitTitleRequired"));
      });
    },
    [openModal, showToast, state.activities, store, tt],
  );

  const handleDeleteHabit = useCallback(
    (id: string) => {
      const act = state.activities.find((a) => a.id === id);
      setConfirmState({
        message: tt("confirmDeleteHabit").replace("{title}", act?.title ?? ""),
        onConfirm: () => {
          store.removeHabit(id);
          showToast(tt("toastHabitRemoved"));
        },
      });
    },
    [showToast, state.activities, store, tt],
  );

  const handleAddProfile = useCallback(() => {
    const ok = store.addProfile(addKidName, addKidCode);
    if (!ok) {
      showToast(tt("toastFieldsRequired"));
      return;
    }
    setAddKidName("");
    setAddKidCode("");
    showToast(tt("toastProfileCreated"));
  }, [addKidCode, addKidName, showToast, store, tt]);

  const handleAddHabit = useCallback(() => {
    const ok = store.addHabit(addActTitle, parseInt(addActPreset, 10));
    if (!ok) {
      showToast(tt("toastHabitTitleRequired"));
      return;
    }
    setAddActTitle("");
    showToast(tt("toastHabitAdded"));
  }, [addActPreset, addActTitle, showToast, store, tt]);

  const handleExport = useCallback(() => {
    try {
      const data = store.getBackupData();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `daily_grow_backup_${getToday()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(tt("toastExportSuccess"));
    } catch (e) {
      showToast(
        tt("toastExportFailed").replace(
          "{error}",
          e instanceof Error ? e.message : String(e),
        ),
      );
    }
  }, [showToast, store, tt]);

  const handleImportFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          if (!importedData || typeof importedData !== "object") {
            throw new Error("Invalid structure");
          }
          store.importBackupData(importedData);
          showToast(tt("importSuccess"));
        } catch {
          showToast(tt("importError"));
        }
        event.target.value = "";
      };
      reader.readAsText(file);
    },
    [showToast, store, tt],
  );

  const renderCheckinTab = () => {
    if (!kid) {
      return (
        <div className="text-center py-24 text-slate-400">
          <span className="text-xs font-bold block mb-2">
            {tt("noActiveProfile")}
          </span>
        </div>
      );
    }

    const kidActs = state.activities.filter((a) => a.kidId === kid.id);
    const today = getToday();
    const finishedCount = state.logs.filter(
      (l) => l.date === today && l.kidId === kid.id,
    ).length;
    const totalCount = kidActs.length;
    const progressPct =
      totalCount > 0 ? Math.round((finishedCount / totalCount) * 100) : 0;
    const isRestDayToday = isRestDay(today, restConfig);

    return (
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {isRestDayToday && (
          <div className="pattern-rest border border-[#1A1A1A] p-5 shadow-[3px_3px_0px_0px_#1A1A1A] flex flex-col gap-1.5">
            <h4 className="font-accent font-bold text-neutral-800 text-sm tracking-wider uppercase">
              {tt("restMode")}
            </h4>
            <p className="text-xs text-neutral-600 leading-relaxed font-bold">
              {tt("restModeDesc")}
            </p>
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-3 ml-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-accent">
              {tt("challengesTitle")}
            </span>
            <span className="font-accent text-xs font-bold text-slate-500">
              {finishedCount}/{totalCount}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kidActs.length === 0 ? (
              <div className="col-span-full bg-white rounded-none border border-neutral-200 p-10 text-center text-slate-400 text-xs shadow-[3px_3px_0px_0px_#1A1A1A]">
                {tt("noHabitsHint")}
              </div>
            ) : (
              kidActs.map((act, idx) => {
                const isChecked = state.logs.some(
                  (l) =>
                    l.kidId === kid.id && l.actId === act.id && l.date === today,
                );
                const formattedIdx = String(idx + 1).padStart(2, "0");
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => store.toggleHabit(act.id)}
                    className={`card-tap preset-${act.preset} w-full h-[64px] rounded-none p-4 flex items-center justify-between cursor-pointer shadow-[3px_3px_0px_0px_#1A1A1A] ${isChecked ? "checked" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-accent text-xs font-bold opacity-50">
                        {formattedIdx}
                      </span>
                      <h4 className="text-xs md:text-sm font-bold tracking-tight uppercase">
                        {act.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] tracking-wider font-extrabold opacity-75">
                        {isChecked
                          ? tt("done")
                          : isRestDayToday
                            ? tt("optional")
                            : tt("todo")}
                      </span>
                      <div className="check-ring">
                        {isChecked && (
                          <span className="text-[8px] font-black leading-none">
                            ✓
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-none p-5 border border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A]">
          <div className="flex justify-between text-[11px] font-bold text-black mb-2 font-accent">
            <span className="tracking-wider uppercase">{tt("progressTitle")}</span>
            <span className="font-bold">{progressPct}%</span>
          </div>
          <div className="w-full h-3 bg-[#FAF9F5] border border-[#1A1A1A] overflow-hidden relative">
            <div
              className="h-full bg-[#4A6B82] border-r border-[#1A1A1A] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <ProfileSwapper profile={kid} onSwap={handleRotateKid} tt={tt} />
      </div>
    );
  };

  const renderBadgesTab = () => {
    if (!kid) return null;

    const kidTxs = state.rewards.filter((tx) => tx.kidId === kid.id);
    const balance = kidTxs.reduce((sum, tx) => sum + tx.amount, 0);
    const currentWeekDates = getCurrentWeekDates();
    const kidActs = state.activities.filter((a) => a.kidId === kid.id);
    const totalActsCount = kidActs.length;

    const d = new Date();
    const currentYear = d.getFullYear();
    const currentMonth = d.getMonth();
    const currentMonthDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthNameString = d.toLocaleDateString(
      locale === "zh" ? "zh-CN" : "en-US",
      { year: "numeric", month: "long" },
    );
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const calendarOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    return (
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div className="bg-white rounded-none border border-[#1A1A1A] p-6 text-black md:flex md:items-center md:justify-between md:gap-8 shadow-[3px_3px_0px_0px_#1A1A1A]">
          <div className="text-center md:text-left">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase font-accent">
              {tt("availableStars")}
            </span>
            <h2 className="font-black text-4xl mt-1 leading-none tracking-tight font-accent">
              {balance}
            </h2>
            <p className="text-xs text-slate-500 mt-2">{tt("availableStarsSub")}</p>
          </div>
          <div className="flex gap-2.5 mt-5 md:mt-0 justify-center">
            <button
              type="button"
              onClick={() => parentVerify(handleGrantStar)}
              className="card-tap bg-[#D35B47] hover:bg-red-700 text-white font-bold text-[10px] tracking-wider px-5 py-2.5 rounded-none border border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] uppercase"
            >
              {tt("grantStar")}
            </button>
            <button
              type="button"
              onClick={() => parentVerify(handleRedeemStar)}
              className="card-tap bg-[#E2AC4B] hover:bg-yellow-500 text-black font-bold text-xs tracking-wider px-5 py-2.5 rounded-none border border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] uppercase"
            >
              {tt("redeemGift")}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-none p-5 border border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A]">
          <div className="flex justify-between items-center mb-1 ml-1">
            <span className="text-xs md:text-sm font-bold text-black tracking-wider uppercase font-accent">
              {tt("weeklyActivity")}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase font-accent">
              {tt("weekStats")}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-bold mb-3 pl-1 uppercase tracking-wide">
            {tt("weeklyTip")}
          </p>
          <div className="flex justify-between gap-2.5">
            {currentWeekDates.map((dateStr, i) => {
              const doneCount = state.logs.filter(
                (l) => l.kidId === kid.id && l.date === dateStr,
              ).length;
              const isPerfect =
                totalActsCount > 0 && doneCount >= totalActsCount;
              const isExempt = isRestDay(dateStr, restConfig);

              let statusText = `${doneCount}/${totalActsCount}`;
              let blockStyle = "bg-white text-[#1A1A1A]";
              if (isExempt) {
                statusText = tt("statusRest");
                blockStyle = "pattern-rest text-neutral-500";
              }
              if (isPerfect) {
                statusText = tt("statusDone");
                blockStyle = "bg-[#D35B47] text-white";
              }

              return (
                <div
                  key={dateStr}
                  className="flex-1 flex flex-col items-center gap-2 min-w-[12%]"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleRestDate(dateStr)}
                    className={`w-11 h-11 md:w-full md:h-14 rounded-none border border-[#1A1A1A] flex flex-col items-center justify-center text-[10px] font-bold transition-all ${blockStyle} cursor-pointer shadow-[2px_2px_0px_0px_#1A1A1A]`}
                    title={dateStr}
                  >
                    <span className="uppercase text-[10px] tracking-wider font-extrabold font-accent">
                      {tt(WEEK_DAY_KEYS[i])}
                    </span>
                    <span className="text-[9px] md:text-xs opacity-75 mt-0.5 font-accent">
                      {statusText}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-none p-5 border border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A]">
          <div className="flex justify-between items-center mb-1 ml-1">
            <span className="text-xs md:text-sm font-bold text-[#1A1A1A] tracking-wider uppercase font-accent">
              {monthNameString} {tt("monthlyMap")}
            </span>
            <button
              type="button"
              onClick={() => setAnnualOpen(true)}
              className="card-tap bg-[#4A6B82] hover:bg-blue-800 text-white text-[10px] font-bold tracking-widest px-3.5 py-2 rounded-none border border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] uppercase font-accent"
            >
              {tt("annualArchive")}
            </button>
          </div>
          <p className="text-xs text-slate-400 font-bold mb-4 pl-1 uppercase tracking-wide">
            {tt("monthlyTip")}
          </p>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-neutral-800 mb-3 uppercase border-b border-neutral-100 pb-2 font-accent">
            {WEEK_DAY_KEYS.map((key) => (
              <div key={key}>{tt(key)}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: calendarOffset }).map((_, i) => (
              <div
                key={`off-${i}`}
                className="aspect-square rounded-none bg-[#F5F4EE] border border-neutral-200/50 flex items-center justify-center"
              >
                <span className="text-xs text-neutral-300 select-none">•</span>
              </div>
            ))}
            {Array.from({ length: currentMonthDays }).map((_, dayIdx) => {
              const day = dayIdx + 1;
              const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const doneOnDay = state.logs.filter(
                (l) => l.kidId === kid.id && l.date === dateString,
              ).length;
              const isExempt = isRestDay(dateString, restConfig);

              let bgPresetClass =
                "bg-white border border-[#1A1A1A] text-black";
              let displayRatio = `${doneOnDay}/${totalActsCount}`;

              if (isExempt) {
                bgPresetClass =
                  "pattern-rest border border-neutral-300 text-neutral-500";
                displayRatio = tt("statusRest");
              } else if (doneOnDay > 0 && doneOnDay < totalActsCount) {
                bgPresetClass =
                  "bg-[#E2AC4B]/10 border border-[#E2AC4B] text-black";
              } else if (doneOnDay > 0 && doneOnDay >= totalActsCount) {
                bgPresetClass =
                  "bg-[#D35B47] border border-[#D35B47] text-white";
                displayRatio = tt("statusDone");
              }

              return (
                <button
                  key={dateString}
                  type="button"
                  onClick={() => handleToggleRestDate(dateString)}
                  className={`aspect-square rounded-none ${bgPresetClass} flex flex-col items-center justify-center relative cursor-pointer shadow-[1.5px_1.5px_0px_0px_#1A1A1A]`}
                  title={dateString}
                >
                  <span className="text-sm md:text-base font-bold font-accent">
                    {day}
                  </span>
                  <span className="text-[10px] md:text-xs font-bold opacity-80 mt-0.5 font-accent">
                    {displayRatio}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-4 mt-5 pt-3 border-t border-neutral-100 text-[10px] text-slate-500 font-bold uppercase font-accent">
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

        <div className="bg-white rounded-none p-5 border border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A]">
          <div className="flex justify-between items-center border-b-2 border-neutral-150 pb-2 mb-1">
            <span className="text-xs md:text-sm font-bold text-black tracking-wider uppercase font-accent">
              {tt("starsHistory")}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase font-accent">
              {tt("txLedger")}
            </span>
          </div>
          <div className="divide-y divide-neutral-100">
            {kidTxs.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs font-bold uppercase">
                {tt("noRecords")}
              </div>
            ) : (
              kidTxs.map((tx) => {
                const isEarn = tx.type === "earn";
                return (
                  <div
                    key={tx.id}
                    className="flex justify-between items-center py-2.5 border-b border-neutral-100 last:border-0 text-xs"
                  >
                    <div className="text-left flex-grow min-w-0 pr-4">
                      <span className="font-bold text-neutral-800 block truncate uppercase">
                        {tx.remark || tx.title}
                      </span>
                      <span className="text-[8px] text-slate-400 block mt-0.5">
                        {tx.date}
                      </span>
                    </div>
                    <div
                      className={`font-bold text-right ${isEarn ? "text-blue-700" : "text-[#D35B47]"}`}
                    >
                      {isEarn ? "+" : ""}
                      {tx.amount}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <ProfileSwapper profile={kid} onSwap={handleRotateKid} tt={tt} />
      </div>
    );
  };

  const renderScheduleTab = () => {
    if (!kid) return null;

    const kidSchedule = state.schedule.filter((s) => s.kidId === kid.id);
    const visiblePeriods = getVisiblePeriods(
      kid.id,
      state.schedule,
      state.periodTimes,
    );

    return (
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-bold text-neutral-800 uppercase tracking-wider font-accent">
            {tt("timetableTitle")}
          </span>
          <button
            type="button"
            onClick={handleToggleBatch}
            className="card-tap border border-[#1A1A1A] bg-white px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase rounded-none hover:bg-slate-50 font-mono"
          >
            {state.batchEditMode ? tt("cancelBatch") : tt("enableBatch")}
          </button>
        </div>

        <div className="w-full overflow-x-auto border border-[#1A1A1A] bg-white p-2 shadow-[3px_3px_0px_0px_#1A1A1A] no-scrollbar">
          <div className="grid grid-cols-8 gap-1 min-w-[760px] relative">
            <div className="sticky left-0 z-30 border border-[#1A1A1A] bg-[#E2AC4B] text-black font-bold text-[10px] p-1.5 shadow-[1px_0px_0px_0px_#1A1A1A] text-center uppercase font-mono">
              {tt("periodHeader")}
            </div>
            {SCHEDULE_DAY_KEYS.map((key) => (
              <div
                key={key}
                className="border border-[#1A1A1A] bg-[#4A6B82] text-white font-bold text-[10px] p-1.5 text-center uppercase tracking-wider font-accent"
              >
                {tt(key)}
              </div>
            ))}

            {visiblePeriods.map((p) => (
              <div key={p.num} className="contents">
                <button
                  type="button"
                  onClick={() => handleEditPeriod(p.num)}
                  className="sticky left-0 z-20 card-tap border border-[#1A1A1A] bg-[#FAF9F5] flex flex-col justify-center items-center p-1.5 shadow-[1px_1px_0px_0px_#1A1A1A] cursor-pointer hover:bg-slate-50 text-center leading-tight min-h-[48px]"
                >
                  <span className="text-[10px] font-bold text-neutral-800 font-accent">
                    {p.name}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold mt-0.5 leading-none font-accent">
                    {p.range}
                  </span>
                </button>

                {Array.from({ length: 7 }).map((_, dIdx) => {
                  const dayNum = dIdx + 1;
                  const cellClass = kidSchedule.find(
                    (s) => s.day === dayNum && s.period === p.num,
                  );
                  const slotKey = `${dayNum}-${p.num}`;
                  const isSelected = state.selectedSlots.includes(slotKey);
                  const selectionClass = isSelected
                    ? "outline-2 outline-black outline-offset-[-2px] bg-[#E2AC4B] border-2 border-black animate-pulse"
                    : "";

                  if (cellClass) {
                    return (
                      <button
                        key={slotKey}
                        type="button"
                        onClick={() => handleScheduleSlotClick(dayNum, p.num)}
                        className={`card-tap preset-${cellClass.preset} checked border border-neutral-300 p-1.5 flex flex-col justify-between items-start cursor-pointer shadow-[1.5px_1.5px_0px_0px_#1A1A1A] relative min-h-[48px] ${selectionClass}`}
                      >
                        <span className="text-xs md:text-sm font-bold uppercase tracking-tight leading-tight">
                          {cellClass.subject}
                        </span>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={slotKey}
                      type="button"
                      onClick={() => handleScheduleSlotClick(dayNum, p.num)}
                      className={`card-tap bg-white border border-neutral-200 p-1.5 flex flex-col justify-center items-center cursor-pointer shadow-[1px_1px_0px_0px_#1a1a1a11] group hover:bg-slate-50 min-h-[48px] ${selectionClass}`}
                    >
                      <span className="text-[10px] md:text-xs font-bold text-slate-200 group-hover:text-neutral-500 uppercase tracking-wider transition-colors font-accent" />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {state.batchEditMode && (
          <div className="bg-white border border-[#1A1A1A] p-5 shadow-[3px_3px_0px_0px_#1A1A1A] flex flex-col gap-3">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="font-extrabold text-black uppercase bg-[#E2AC4B] px-2 py-0.5 border border-black text-[10px]">
                  {state.selectedSlots.length} {tt("slotsSelected")}
                </span>
                <span className="text-slate-500 font-bold text-[10px]">
                  {tt("batchConfigText")}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={batchSubject}
                  onChange={(e) => setBatchSubject(e.target.value)}
                  className="flex-1 bg-white border border-[#1A1A1A] rounded-none px-3 py-1.5 text-xs font-bold outline-none focus:border-black"
                  placeholder={tt("batchSubjectPlaceholder")}
                />
                <select
                  value={batchPreset}
                  onChange={(e) => setBatchPreset(e.target.value)}
                  className="bg-white border border-[#1A1A1A] rounded-none px-2 py-1.5 text-xs font-bold outline-none"
                >
                  {buildPresetOptions(tt).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleBatchApply}
                    disabled={state.selectedSlots.length === 0}
                    className="bg-[#4A6B82] text-white border border-[#1A1A1A] px-4 py-1.5 text-[10px] font-bold uppercase card-tap rounded-none disabled:opacity-50"
                  >
                    {tt("apply")}
                  </button>
                  <button
                    type="button"
                    onClick={handleBatchClear}
                    disabled={state.selectedSlots.length === 0}
                    className="bg-[#1A1A1A] text-white border border-[#1A1A1A] px-4 py-1.5 text-[10px] font-bold uppercase card-tap rounded-none disabled:opacity-50"
                  >
                    {tt("clear")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3.5 border-t border-neutral-200 pt-4 mt-2">
          <span className="w-2.5 h-2.5 bg-[#4A6B82] inline-block" />
          <span className="text-xs text-slate-400 font-bold">{tt("periodTip")}</span>
        </div>

        <ProfileSwapper profile={kid} onSwap={handleRotateKid} tt={tt} />
      </div>
    );
  };

  const renderAdminTab = () => {
    const kidActs = kid
      ? state.activities.filter((a) => a.kidId === kid.id)
      : [];

    return (
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        <div className="bg-white rounded-none p-4 border border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] flex flex-col gap-3 col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              {tt("dataBackup")}
            </span>
            <span className="text-[10px] bg-[#1A1A1A] text-white px-2 py-0.5 font-bold uppercase font-accent leading-none">
              Utility
            </span>
          </div>
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex justify-between items-center text-[11px] font-bold text-neutral-500 uppercase">
              <span>{tt("dataBackupSubShort")}</span>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={handleExport}
                className="flex-1 card-tap bg-white hover:bg-slate-50 text-black border border-[#1A1A1A] py-1 text-xs font-bold uppercase rounded-none"
              >
                {tt("exportBtn")}
              </button>
              <button
                type="button"
                onClick={() => importRef.current?.click()}
                className="flex-1 card-tap bg-[#4A6B82] text-white border border-[#4A6B82] py-1 text-xs font-bold uppercase rounded-none"
              >
                {tt("importBtn")}
              </button>
              <input
                ref={importRef}
                type="file"
                className="hidden"
                accept=".json"
                onChange={handleImportFile}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-none p-5 border border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A] flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-black text-xs tracking-wider border-b-2 border-neutral-100 pb-3 mb-3 flex justify-between items-center uppercase font-mono">
              <span>{tt("profiles")}</span>
              <span className="text-[9px] bg-[#1A1A1A] text-white px-2.5 py-0.5 font-bold font-accent">
                {state.profiles.length} {tt("kidsCount")}
              </span>
            </h4>
            <div className="space-y-1">
              {state.profiles.length === 0 ? (
                <p className="text-[10px] text-slate-400 uppercase font-mono">
                  {tt("noActiveProfile")}
                </p>
              ) : (
                state.profiles.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center py-3 border-b border-neutral-100 last:border-0 text-xs"
                  >
                    <span className="font-bold text-[#1A1A1A] uppercase font-accent">
                      {p.code} • {p.name}
                    </span>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          parentVerify(() => handleEditProfile(p.id))
                        }
                        className="text-blue-700 font-bold text-xs hover:underline uppercase"
                      >
                        {tt("edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          parentVerify(() => handleDeleteProfile(p.id))
                        }
                        className="text-[#D35B47] font-bold text-xs hover:underline uppercase"
                      >
                        {tt("delete")}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4 pt-4 border-t-2 border-neutral-100">
            <span className="text-[9px] text-slate-400 tracking-wider font-bold uppercase font-mono">
              {tt("addNewProfile")}
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={addKidName}
                onChange={(e) => setAddKidName(e.target.value)}
                className="flex-1 bg-white border border-[#1A1A1A] rounded-none px-3 py-2 text-xs font-bold outline-none focus:border-black transition-all"
                placeholder={tt("enterName")}
              />
              <input
                type="text"
                value={addKidCode}
                onChange={(e) => setAddKidCode(e.target.value.toUpperCase())}
                maxLength={2}
                className="w-14 bg-white border border-[#1A1A1A] rounded-none px-2 text-center text-xs font-bold outline-none focus:border-black uppercase font-accent"
                placeholder={tt("codePlaceholder")}
              />
              <button
                type="button"
                onClick={handleAddProfile}
                className="card-tap bg-[#1A1A1A] text-white text-xs px-4 rounded-none font-bold uppercase border border-[#1A1A1A] font-accent"
              >
                {tt("add")}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-none p-5 border border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A] flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-[#1A1A1A] text-xs tracking-wider border-b-2 border-neutral-100 pb-3 mb-3 flex justify-between items-center uppercase font-mono">
              <span>{tt("habitSettings")}</span>
              <span className="text-[9px] bg-[#1A1A1A] text-white px-2.5 py-0.5 font-bold uppercase font-accent">
                {tt("kidLabel")}: {kid?.name ?? "—"}
              </span>
            </h4>
            <div className="space-y-1">
              {kidActs.length === 0 ? (
                <p className="text-[10px] text-slate-400 uppercase font-mono">
                  {tt("noHabits")}
                </p>
              ) : (
                kidActs.map((a) => (
                  <div
                    key={a.id}
                    className="flex justify-between items-center py-3 border-b border-neutral-100 last:border-0 text-xs"
                  >
                    <span className="font-bold text-[#1A1A1A] uppercase">
                      {a.title} ({tt(PRESET_THEME_KEYS[a.preset] ?? "themeRed")})
                    </span>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          parentVerify(() => handleEditHabit(a.id))
                        }
                        className="text-blue-700 font-bold text-xs hover:underline uppercase"
                      >
                        {tt("edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          parentVerify(() => handleDeleteHabit(a.id))
                        }
                        className="text-[#D35B47] font-bold text-xs hover:underline uppercase"
                      >
                        {tt("delete")}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4 pt-4 border-t-2 border-neutral-100">
            <span className="text-[9px] text-slate-400 tracking-wider font-bold uppercase font-mono">
              {tt("createHabit")}
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={addActTitle}
                onChange={(e) => setAddActTitle(e.target.value)}
                className="flex-1 bg-white border border-[#1A1A1A] rounded-none px-3.5 py-2.5 text-xs font-bold outline-none focus:border-black transition-all"
                placeholder={tt("enterHabitTitle")}
              />
              <select
                value={addActPreset}
                onChange={(e) => setAddActPreset(e.target.value)}
                className="bg-white border border-[#1A1A1A] rounded-none px-2 text-xs font-bold outline-none focus:border-black font-accent"
              >
                {buildPresetOptions(tt).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddHabit}
                className="card-tap bg-[#1A1A1A] text-white text-xs px-4 rounded-none font-bold uppercase border border-[#1A1A1A] font-accent"
              >
                {tt("add")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (state.tab) {
      case "checkin":
        return renderCheckinTab();
      case "badges":
        return renderBadgesTab();
      case "schedule":
        return renderScheduleTab();
      case "admin":
        return renderAdminTab();
      default:
        return null;
    }
  };

  const tabLabelKey: Record<TabId, string> = {
    checkin: "checkin",
    badges: "honors",
    schedule: "schedule",
    admin: "admin",
  };

  return (
    <div className="daily-grow-root min-h-screen flex flex-col justify-between items-center p-0 md:p-6 lg:p-8 select-none">
      <div className="relative w-full max-w-5xl min-h-screen md:min-h-[820px] md:h-[840px] bg-white rounded-none border-2 border-[#1A1A1A] shadow-[8px_8px_0px_0px_#1A1A1A] flex flex-col overflow-hidden">
        {/* Toast */}
        <div
          className={`absolute top-4 left-4 right-4 md:left-1/2 md:right-auto md:w-[350px] md:transform md:-translate-x-1/2 bg-[#1A1A1A] text-white text-xs font-bold py-3.5 px-5 rounded-none border border-white/20 z-50 flex justify-between items-center transition-all duration-300 ${
            toast.visible
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 pointer-events-none -translate-y-4"
          }`}
        >
          <span className="tracking-wider font-accent text-xs">
            {toast.message}
          </span>
          <button
            type="button"
            onClick={hideToast}
            className="text-amber-300 hover:text-white text-xs font-black pl-2"
          >
            {tt("ok")}
          </button>
        </div>

        {/* Header */}
        <header className="bg-white border-b border-[#1A1A1A] py-6 px-6 md:px-10 flex-shrink-0 z-20">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 max-w-4xl mx-auto">
            <div className="flex flex-col">
              <h1 className="text-left font-bold text-xl text-[#1A1A1A] tracking-wider uppercase font-mono leading-none">
                {tt("appTitle")}
              </h1>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 font-mono">
                {tt("headerSubtitle")}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              {TAB_ORDER.map((tabId) => {
                const isActive = state.tab === tabId;
                return (
                  <button
                    key={tabId}
                    type="button"
                    onClick={() => store.setTab(tabId)}
                    className={`text-xs font-bold tracking-wider pb-1 transition-colors ${
                      isActive
                        ? "text-[#1A1A1A] border-b border-[#1A1A1A]"
                        : "text-slate-400 border-b border-transparent hover:text-black"
                    }`}
                  >
                    <span className="opacity-40 mr-1 font-accent">
                      {DESKTOP_TAB_NUM[tabId]} /
                    </span>{" "}
                    {tt(tabLabelKey[tabId])}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 self-start md:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D35B47]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#4A6B82]" />
              <span className="text-[10px] font-bold font-mono tracking-wider text-slate-400">
                v2.2
              </span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8 no-scrollbar pb-24 md:pb-8 bg-[#F8F7F3]">
          {renderTabContent()}
        </main>

        {/* Mobile bottom nav */}
        <footer className="md:hidden fixed bottom-4 left-4 right-4 h-14 bg-white/95 backdrop-blur-md border-2 border-[#1A1A1A] flex justify-around items-center shadow-[4px_4px_0px_0px_#1A1A1A] z-40">
          {TAB_ORDER.map((tabId) => {
            const isActive = state.tab === tabId;
            return (
              <button
                key={tabId}
                type="button"
                onClick={() => store.setTab(tabId)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                  isActive ? "text-[#1A1A1A] font-bold" : "text-slate-400"
                }`}
              >
                <span className="text-[11px] font-bold tracking-wider font-accent">
                  {tt(MOBILE_TAB_LABEL[tabId])}
                </span>
                <span
                  className={`w-1.5 h-1.5 rounded-none mt-1 ${
                    isActive ? "bg-[#1A1A1A]" : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </footer>
      </div>

      {/* Generic modal */}
      <DailyGrowModal
        open={genericModal !== null}
        title={genericModal?.title ?? ""}
        subtitle={genericModal?.subtitle ?? ""}
        fields={genericModal?.fields ?? []}
        confirmLabel={tt("confirm")}
        cancelLabel={tt("cancel")}
        onConfirm={(data) => {
          genericModal?.onConfirm(data);
          closeModal();
        }}
        onCancel={closeModal}
      />

      {/* Parent verification modal */}
      <DailyGrowModal
        open={verifyModal !== null}
        title={tt("securityLock")}
        subtitle={tt("securitySub")}
        fields={
          verifyModal
            ? [
                {
                  id: "ans",
                  type: "number",
                  placeholder: `${verifyModal.num1} * ${verifyModal.num2} = ?`,
                },
              ]
            : []
        }
        confirmLabel={tt("confirm")}
        cancelLabel={tt("cancel")}
        onConfirm={(data) => {
          if (verifyModal) {
            if (parseInt(data.ans, 10) === verifyModal.answer) {
              verifyModal.pending();
            } else {
              showToast(tt("toastSecurityFailed"));
            }
          }
          setVerifyModal(null);
        }}
        onCancel={() => setVerifyModal(null)}
      />

      {/* Annual overview */}
      <AnnualOverviewModal
        open={annualOpen}
        onClose={() => setAnnualOpen(false)}
        profile={kid}
        activities={state.activities}
        logs={state.logs}
        restConfig={restConfig}
        onToggleRestDate={(dateStr) => {
          handleToggleRestDate(dateStr);
        }}
        tt={tt}
      />

      {/* Delete confirmations */}
      <ConfirmDialog
        open={confirmState !== null}
        onClose={() => setConfirmState(null)}
        message={confirmState?.message ?? ""}
        confirmText={tt("delete")}
        cancelText={tt("cancel")}
        variant="danger"
        onConfirm={() => confirmState?.onConfirm()}
      />
    </div>
  );
}
