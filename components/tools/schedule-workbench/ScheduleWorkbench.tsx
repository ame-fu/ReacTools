"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  Plus,
  UserPlus,
  Calendar,
  Clock,
  Trash2,
  X,
  Edit2,
  Eye,
  EyeOff,
  Settings,
  Image as ImageIcon,
  Upload,
  Download,
  Printer,
  Search,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { THEMES, BTN_STYLES, DAYS, PRESET_COLORS } from "./themeConfig";
import type { ThemeId } from "./themeConfig";
import { useI18n } from "@/lib/i18n/context";
import { AutoScaleText } from "@/components/ui/AutoScaleText";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  formatTimeDisplay,
  isImageItem,
  getImageUrl,
  calculate2DLayout,
  getFullTimeOptions,
} from "./utils";
import type { TimeFormat } from "./utils";

// --- 类型定义 ---
export interface ScheduleSettings {
  name: string;
  timeFormat: TimeFormat;
  startHour: number;
  endHour: number;
  theme: ThemeId;
}

export interface ScheduleUser {
  id: string;
  name: string;
  color: string;
  visible?: boolean;
}

export interface ScheduleTask {
  id: string;
  userId: string;
  days?: number[];
  day?: number;
  start: number;
  end: number;
  title: string;
}

export interface Schedule {
  id: string;
  isExpanded: boolean;
  settings: ScheduleSettings;
  users: ScheduleUser[];
  tasks: ScheduleTask[];
}

// --- 子组件：单个日程表项 ---
function ScheduleItem({
  schedule,
  onUpdate,
  onDelete,
  showAlert,
  showConfirm,
}: {
  schedule: Schedule;
  onUpdate: (id: string, updates: Partial<Schedule>) => void;
  onDelete: (id: string) => void;
  showAlert: (message: string) => void;
  showConfirm: (message: string, onConfirm: () => void) => void;
}) {
  const { t } = useI18n();
  const tt = (key: string) => t(`tools.schedule-workbench.${key}`);
  const { id, isExpanded, settings, users, tasks } = schedule;
  const theme = THEMES[settings.theme] || THEMES.classic;
  const getBtn = (type: string, extra = "") =>
    `flex justify-center items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${BTN_STYLES[theme.id][type] ?? ""} ${extra}`;

  const dayLabels = useMemo(
    () => [
      tt("days.mon"),
      tt("days.tue"),
      tt("days.wed"),
      tt("days.thu"),
      tt("days.fri"),
      tt("days.sat"),
      tt("days.sun"),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t]
  );

  const updateData = (updates: Partial<Schedule>) => onUpdate(id, updates);
  const gridRef = useRef<HTMLDivElement>(null);
  const printWrapperRef = useRef<HTMLDivElement>(null);

  const HOURS = useMemo(() => {
    const len = Math.ceil(settings.endHour - settings.startHour) + 1;
    return Array.from({ length: len }, (_, i) => settings.startHour + i);
  }, [settings.startHour, settings.endHour]);

  const FULL_TIME_OPTIONS = useMemo(
    () => getFullTimeOptions(settings.timeFormat),
    [settings.timeFormat]
  );

  const [taskModal, setTaskModal] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    data: ScheduleTask | null;
  }>({ isOpen: false, mode: "add", data: null });
  const [userModal, setUserModal] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    userId: string | null;
  }>({ isOpen: false, mode: "add", userId: null });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    userId: string | null;
  }>({ isOpen: false, userId: null });
  const [settingsModal, setSettingsModal] = useState({ isOpen: false });

  const [taskForm, setTaskForm] = useState({
    userId: "",
    days: [0] as number[],
    start: 9,
    end: 10,
    title: "",
    id: "",
  });
  const [userForm, setUserForm] = useState({ name: "", color: "#1E90FF" });
  const [settingsForm, setSettingsForm] = useState({ ...settings });

  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printConfig, setPrintConfig] = useState({
    orientation: "portrait" as "landscape" | "portrait",
    mode: "adaptive" as "adaptive" | "original",
    scale: 78,
    rotate: 0,
    fillBackground: false,
  });
  const [printView, setPrintView] = useState({ viewScale: 0.6, tx: 0, ty: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDownloading, setIsDownloading] = useState(false);

  const layoutBlocks = useMemo(() => {
    if (!isExpanded) return [];
    const rawBlocks: Array<{
      startDay: number;
      endDay: number;
      task: ScheduleTask;
    }> = [];
    tasks.forEach((task) => {
      const taskDays = task.days ?? (task.day !== undefined ? [task.day] : [0]);
      if (!taskDays.length) return;
      const user = users.find((u) => u.id === task.userId);
      if (!user || user.visible === false) return;
      if (task.start >= settings.endHour || task.end <= settings.startHour)
        return;
      const sortedDays = [...taskDays].sort((a, b) => a - b);
      let currentBlock = {
        startDay: sortedDays[0],
        endDay: sortedDays[0],
        task,
      };
      for (let i = 1; i < sortedDays.length; i++) {
        if (sortedDays[i] === currentBlock.endDay + 1) {
          currentBlock.endDay = sortedDays[i];
        } else {
          rawBlocks.push({ ...currentBlock });
          currentBlock = {
            startDay: sortedDays[i],
            endDay: sortedDays[i],
            task,
          };
        }
      }
      rawBlocks.push(currentBlock);
    });
    const blocksForLayout = rawBlocks.map((b, idx) => ({
      id: `${b.task.id}_${idx}`,
      startDay: b.startDay,
      endDay: b.endDay,
      start: b.task.start,
      end: b.task.end,
      task: b.task,
      spanDays: b.endDay - b.startDay + 1,
    }));
    return calculate2DLayout(blocksForLayout);
  }, [tasks, users, settings.startHour, settings.endHour, isExpanded]);

  const handleExport = () => {
    const data = { settings, users, tasks };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${settings.name}_备份.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadImage = async () => {
    if (!gridRef.current) return;
    setIsDownloading(true);
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const clone = gridRef.current.cloneNode(true) as HTMLElement;
      clone.querySelectorAll(".no-print").forEach((el) => el.remove());
      clone.style.position = "absolute";
      clone.style.top = "-9999px";
      clone.style.left = "0";
      clone.style.width = gridRef.current.scrollWidth + "px";
      clone.style.height = gridRef.current.scrollHeight + "px";
      clone.style.overflow = "visible";
      clone.style.backgroundColor = theme.bg;
      clone.style.backgroundImage = theme.bgImage;
      clone.style.backgroundSize = theme.bgSize;

      const origNodes = gridRef.current.querySelectorAll("*");
      const cloneNodes = clone.querySelectorAll("*");
      origNodes.forEach((orig, i) => {
        const c = cloneNodes[i] as HTMLElement;
        if (c) {
          const comp = window.getComputedStyle(orig);
          c.style.fontFamily = comp.fontFamily;
          if (orig.tagName.toLowerCase() === "svg") {
            c.style.width = comp.width;
            c.style.height = comp.height;
          }
        }
      });

      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: theme.bg,
        logging: false,
      });
      document.body.removeChild(clone);

      const link = document.createElement("a");
      link.download = `${settings.name}_图片.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("生成图片失败:", err);
      showAlert(tt("downloadImage.failed"));
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (printModalOpen && gridRef.current && printWrapperRef.current) {
      printWrapperRef.current.innerHTML = "";
      const clone = gridRef.current.cloneNode(true) as HTMLElement;
      clone.querySelectorAll(".no-print").forEach((el) => el.remove());
      clone.style.overflow = "visible";
      clone.style.height = "max-content";
      clone.style.width = "max-content";
      clone.classList.remove("flex-1");
      clone.style.padding = "2rem";

      if (printConfig.fillBackground) {
        clone.style.backgroundColor = "transparent";
        clone.style.backgroundImage = "none";
      } else {
        clone.style.backgroundColor = theme.bg;
        clone.style.backgroundImage = theme.bgImage;
        clone.style.backgroundSize = theme.bgSize;
      }

      const origNodes = gridRef.current.querySelectorAll("*");
      const clonedNodes = clone.querySelectorAll("*");
      origNodes.forEach((orig, idx) => {
        const c = clonedNodes[idx] as HTMLElement;
        if (c) {
          const comp = window.getComputedStyle(orig);
          c.dataset.origFs = comp.fontSize;
          if (orig.tagName.toLowerCase() === "svg") {
            c.dataset.origW = comp.width;
            c.dataset.origH = comp.height;
          }
        }
      });

      printWrapperRef.current.appendChild(clone);

      const isPortrait = printConfig.orientation === "portrait";
      const PW = isPortrait ? 793 : 1122;
      const PH = isPortrait ? 1122 : 793;

      const applyLayout = () => {
        const CW = clone.scrollWidth;
        const CH = clone.scrollHeight;
        if (CW > 0 && CH > 0) {
          const scaleToUse =
            printConfig.mode === "adaptive"
              ? Math.min(PW / CW, PH / CH) * (isPortrait ? 92 : 98)
              : printConfig.scale;
          const s = scaleToUse / 100;
          const tx = (PW - CW * s) / 2;
          const ty = PH - CH * s;
          setPrintConfig((prev) =>
            prev.mode === "adaptive"
              ? { ...prev, scale: Math.floor(scaleToUse) }
              : prev
          );
          setPrintView((prev) => ({ ...prev, tx, ty }));
        }
      };

      requestAnimationFrame(() => requestAnimationFrame(applyLayout));
    }
  }, [printModalOpen, printConfig.orientation, printConfig.mode]);

  useEffect(() => {
    const clone = printWrapperRef.current?.firstChild as HTMLElement | null;
    if (clone) {
      if (printConfig.fillBackground) {
        clone.style.backgroundColor = "transparent";
        clone.style.backgroundImage = "none";
      } else {
        clone.style.backgroundColor = theme.bg;
        clone.style.backgroundImage = theme.bgImage;
        clone.style.backgroundSize = theme.bgSize;
      }
    }
  }, [printConfig.fillBackground, theme.bg, theme.bgImage, theme.bgSize]);

  useEffect(() => {
    if (!printWrapperRef.current) return;
    const s = printConfig.scale / 100;
    const fontScale = s < 1 ? Math.min(1.8, 1 / Math.pow(s, 0.65)) : 1;
    const textNodes = printWrapperRef.current.querySelectorAll("*[data-orig-fs]");
    textNodes.forEach((node) => {
      const el = node as HTMLElement;
      const fs = parseFloat(el.dataset.origFs ?? "");
      if (!isNaN(fs) && fs > 0) el.style.fontSize = `${fs * fontScale}px`;
      if (el.tagName.toLowerCase() === "svg") {
        const w = parseFloat(el.dataset.origW ?? "");
        const h = parseFloat(el.dataset.origH ?? "");
        if (!isNaN(w) && !isNaN(h)) {
          el.style.width = `${w * fontScale}px`;
          el.style.height = `${h * fontScale}px`;
        }
      }
    });
  }, [printConfig.scale, printModalOpen]);

  const handlePrintDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - printView.tx, y: e.clientY - printView.ty });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPrintView((prev) => ({
          ...prev,
          tx: e.clientX - dragStart.x,
          ty: e.clientY - dragStart.y,
        }));
      }
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart.x, dragStart.y]);

  const handlePrintConfigChange = <K extends keyof typeof printConfig>(
    key: K,
    value: (typeof printConfig)[K]
  ) => {
    setPrintConfig((prev) => ({
      ...prev,
      [key]: value,
      mode: key === "scale" ? "original" : prev.mode,
    }));
  };

  const executePrint = () => {
    const isLand = printConfig.orientation === "landscape";
    const PW = isLand ? 1122 : 793;
    const PH = isLand ? 793 : 1122;
    const marginPct = isLand ? 98 : 92;

    let scaleToUse = printConfig.scale;
    let tx = printView.tx;
    let ty = printView.ty;

    if (printWrapperRef.current?.firstChild) {
      const clone = printWrapperRef.current.firstChild as HTMLElement;
      const CW = clone.scrollWidth;
      const CH = clone.scrollHeight;
      if (CW > 0 && CH > 0) {
        const fitScale = Math.min(PW / CW, PH / CH) * marginPct;
        scaleToUse = Math.floor(fitScale);
        const s = scaleToUse / 100;
        tx = (PW - CW * s) / 2;
        ty = PH - CH * s;
      }
    }

    const style = document.createElement("style");
    style.id = "dynamic-print-style";
    const s = scaleToUse / 100;
    const r = printConfig.rotate;
    const bgCss = printConfig.fillBackground
      ? `
        body, #print-page-outline-${id} {
            background-color: ${theme.bg} !important;
            background-image: ${theme.bgImage} !important;
            background-size: ${theme.bgSize} !important;
        }
    `
      : `
        body { background-color: white !important; background-image: none !important; }
    `;
    style.innerHTML = `
      @page { size: ${isLand ? "landscape" : "portrait"}; margin: 0; }
      @media print {
        ${bgCss}
        body * { visibility: hidden; }
        #print-page-outline-${id}, #print-page-outline-${id} * { visibility: visible; }
        #print-page-outline-${id} {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            transform: none !important;
            margin: 0 !important;
            box-shadow: none !important;
            width: ${isLand ? 1122 : 793}px !important;
            height: ${isLand ? 793 : 1122}px !important;
            overflow: hidden !important;
        }
        #print-content-wrapper-${id} {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            transform: translate(${tx}px, ${ty}px) scale(${s}) rotate(${r}deg) !important;
            transform-origin: top left !important;
            overflow: visible !important;
        }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }
    `;
    document.head.appendChild(style);
    setTimeout(() => {
      try {
        window.print();
      } catch (_e) {}
      setTimeout(() => {
        const el = document.getElementById("dynamic-print-style");
        if (el) document.head.removeChild(el);
      }, 1000);
    }, 100);
  };

  const openAddTask = () => {
    setTaskForm({
      userId: users[0]?.id ?? "",
      days: [0],
      start: settings.startHour,
      end: settings.startHour + 1,
      title: "",
      id: "",
    });
    setTaskModal({ isOpen: true, mode: "add", data: null });
  };
  const openEditTask = (task: ScheduleTask) => {
    setTaskForm({
      ...task,
      days: task.days ?? (task.day !== undefined ? [task.day] : [0]),
    });
    setTaskModal({ isOpen: true, mode: "edit", data: task });
  };
  const saveTask = () => {
    if (
      !taskForm.title.trim() ||
      !taskForm.userId ||
      taskForm.end <= taskForm.start
    )
      return;
    if (!taskForm.days?.length) {
      showAlert(tt("task.daysAtLeastOne"));
      return;
    }
    if (taskModal.mode === "add") {
      updateData({
        tasks: [
          ...tasks,
          {
            userId: taskForm.userId,
            days: taskForm.days,
            start: taskForm.start,
            end: taskForm.end,
            title: taskForm.title,
            id: Date.now().toString(),
          },
        ],
      });
    } else {
      updateData({
        tasks: tasks.map((t) =>
          t.id === taskForm.id ? { ...taskForm, id: t.id } : t
        ),
      });
    }
    setTaskModal({ isOpen: false, mode: "add", data: null });
  };
  const deleteTask = () => {
    updateData({ tasks: tasks.filter((t) => t.id !== taskForm.id) });
    setTaskModal({ isOpen: false, mode: "add", data: null });
  };

  const handleDayToggle = (dayIdx: number, isChecked: boolean) => {
    if (isChecked) {
      setTaskForm((prev) => ({
        ...prev,
        days: [...prev.days, dayIdx].sort((a, b) => a - b),
      }));
    } else {
      setTaskForm((prev) => ({
        ...prev,
        days: prev.days.filter((d) => d !== dayIdx),
      }));
    }
  };

  const openAddUser = () => {
    setUserForm({
      name: "",
      color:
        PRESET_COLORS[
          Math.floor(Math.random() * PRESET_COLORS.length)
        ] ?? "#1E90FF",
    });
    setUserModal({ isOpen: true, mode: "add", userId: null });
  };
  const openEditUser = (user: ScheduleUser) => {
    setUserForm({ name: user.name, color: user.color });
    setUserModal({ isOpen: true, mode: "edit", userId: user.id });
  };
  const toggleVisibility = (userId: string) => {
    updateData({
      users: users.map((u) =>
        u.id === userId
          ? { ...u, visible: u.visible === false ? true : false }
          : u
      ),
    });
  };
  const saveUser = () => {
    if (!userForm.name.trim()) return;
    if (userModal.mode === "add") {
      updateData({
        users: [
          ...users,
          {
            id: Date.now().toString(),
            name: userForm.name,
            color: userForm.color,
            visible: true,
          },
        ],
      });
    } else {
      updateData({
        users: users.map((u) =>
          u.id === userModal.userId
            ? { ...u, name: userForm.name, color: userForm.color }
            : u
        ),
      });
    }
    setUserModal({ isOpen: false, mode: "add", userId: null });
    setUserForm({ name: "", color: "#1E90FF" });
  };
  const confirmDeleteUser = (userId: string) => {
    setDeleteConfirmModal({ isOpen: true, userId });
  };
  const executeDeleteUser = () => {
    const userId = deleteConfirmModal.userId;
    if (userId) {
      updateData({
        users: users.filter((u) => u.id !== userId),
        tasks: tasks.filter((t) => t.userId !== userId),
      });
    }
    setDeleteConfirmModal({ isOpen: false, userId: null });
  };

  const openSettings = () => {
    setSettingsForm({ ...settings });
    setSettingsModal({ isOpen: true });
  };
  const saveSettings = () => {
    updateData({ settings: settingsForm });
    setSettingsModal({ isOpen: false });
  };

  const cornerIconHTML = useMemo(() => {
    if (isImageItem(theme.cornerIcon)) {
      return (
        <img
          src={getImageUrl(theme.cornerIcon)}
          alt="Corner Theme"
          className="w-12 h-12 object-contain drop-shadow-md hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://img.icons8.com/color/96/sun.png";
          }}
        />
      );
    }
    return (
      <span className="text-4xl drop-shadow-md hover:scale-110 transition-transform duration-300">
        {String(theme.cornerIcon)}
      </span>
    );
  }, [theme.cornerIcon]);

  return (
    <div
      className="relative rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-black/5 transition-all duration-500 flex flex-col"
      style={{
        backgroundColor: theme.bg,
        backgroundImage: theme.bgImage,
        backgroundSize: theme.bgSize,
        fontFamily: theme.font,
        maxHeight: isExpanded ? "none" : "auto",
      }}
    >
      <header
        className={`${theme.header} px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-30 transition-all`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => updateData({ isExpanded: !isExpanded })}
            className="p-1.5 hover:bg-black/10 rounded-xl transition-colors active:scale-95"
            title={isExpanded ? tt("collapseSchedule") : tt("expandSchedule")}
          >
            {isExpanded ? (
              <ChevronDown size={24} className="text-gray-600" />
            ) : (
              <ChevronRight size={24} className="text-gray-600" />
            )}
          </button>
          <h1
            className={`text-2xl sm:text-3xl font-black ${theme.title} flex items-center gap-3 drop-shadow-sm`}
          >
            {settings.name}
            {!isExpanded && (
              <span className="text-sm font-bold opacity-60 ml-2">
                {tt("containsTasks").replace("{count}", String(tasks.length))}
              </span>
            )}
          </h1>
        </div>

        {isExpanded && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-2 mr-2 no-print">
              <button
                onClick={handleDownloadImage}
                disabled={isDownloading}
                className={getBtn("icon1", "p-2.5")}
                title={tt("downloadAsImage")}
              >
                <ImageIcon
                  size={18}
                  strokeWidth={2.5}
                  className={isDownloading ? "animate-pulse opacity-50" : ""}
                />
              </button>
              <button
                onClick={handleExport}
                className={getBtn("icon1", "p-2.5")}
                title={tt("exportSchedule")}
              >
                <Download size={18} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => setPrintModalOpen(true)}
                className={getBtn("icon1", "p-2.5")}
                title={tt("advancedPrintPreview")}
              >
                <Printer size={18} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => {
                  showConfirm(
                    tt("confirmDeleteSchedule").replace(
                      "{name}",
                      settings.name
                    ),
                    () => onDelete(id)
                  );
                }}
                className={getBtn("dangerOutline", "p-2.5 ml-2")}
                title={tt("deleteSchedule")}
              >
                <Trash2 size={18} strokeWidth={2.5} />
              </button>
            </div>
            <div className="h-8 w-0.5 bg-gray-200/50 mx-1 no-print" />
            <button
              onClick={openSettings}
              className={getBtn("icon1", "p-2.5")}
              title={tt("themeAndSettings")}
            >
              <Settings size={20} strokeWidth={2.5} />
            </button>
            <button
              onClick={openAddUser}
              className={getBtn("icon2", "px-4 py-2.5 gap-2 text-sm")}
            >
              <UserPlus size={16} strokeWidth={2.5} />
              {tt("addMember")}
            </button>
            <button
              onClick={openAddTask}
              className={getBtn("primary", "px-5 py-2.5 gap-2 text-base")}
            >
              <Plus size={18} strokeWidth={3} />
              {tt("newTask")}
            </button>
          </div>
        )}
      </header>

      {isExpanded && (
        <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`${theme.legendBg} px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap gap-3 items-center z-20 transition-all`}
          >
            {users.map((user) => (
              <div
                key={user.id}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-black group transition-all cursor-pointer ${theme.cardRadius} ${
                  user.visible !== false
                    ? theme.legendTagActive
                    : theme.legendTagInactive
                }`}
                style={
                  user.visible !== false ? { backgroundColor: user.color } : {}
                }
              >
                <button
                  onClick={() => toggleVisibility(user.id)}
                  className="flex items-center gap-1.5"
                  title={tt("toggleVisibility")}
                >
                  {user.visible !== false ? (
                    <Eye size={16} strokeWidth={3} />
                  ) : (
                    <EyeOff size={16} strokeWidth={3} />
                  )}
                  <AutoScaleText align="left" style={{ maxWidth: 120 }}>
                    {user.name}
                  </AutoScaleText>
                </button>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-2 gap-1 bg-black/10 rounded-xl px-1 no-print">
                  <button
                    onClick={() => openEditUser(user)}
                    className={`p-1 rounded-lg hover:bg-black/20 transition-colors ${
                      user.visible !== false ? "text-white" : "text-gray-500"
                    }`}
                    title={tt("editMember")}
                  >
                    <Edit2 size={14} strokeWidth={3} />
                  </button>
                  <button
                    onClick={() => confirmDeleteUser(user.id)}
                    className={`p-1 rounded-lg hover:bg-black/20 transition-colors ${
                      user.visible !== false ? "text-white" : "text-gray-500"
                    }`}
                    title={tt("deleteMember")}
                  >
                    <X size={16} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <span className="text-sm font-bold text-gray-400 bg-white/50 px-3 py-1.5 rounded-xl">
                {tt("empty.addMemberHint")}
              </span>
            )}
          </div>

          <main
            id={`schedule-grid-target-${id}`}
            ref={gridRef}
            className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative w-full"
          >
            <div
              className={`${theme.container} overflow-hidden min-w-[1000px] transition-all relative z-10`}
            >
              <div className={`flex ${theme.gridHeaderBg}`}>
                <div className="w-24 flex-shrink-0 flex items-center justify-center">
                  {cornerIconHTML}
                </div>
                {dayLabels.map((day, idx) => (
                  <div key={`${idx}-${day}`} className="flex-1 py-4 text-center px-1">
                    <div className={`${theme.dayHeader} w-full`}>
                      <span className="translate-y-[0.5px]">{day}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex relative">
                <div
                  className={`w-24 flex-shrink-0 flex flex-col ${theme.timeColBg}`}
                >
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="h-[72px] relative flex justify-center"
                    >
                      <span
                        className={`absolute top-0 -translate-y-1/2 z-10 ${theme.timeLabel} whitespace-nowrap`}
                      >
                        <span className="translate-y-[0.5px]">
                          {formatTimeDisplay(hour, settings.timeFormat)}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>

                {dayLabels.map((day, idx) => (
                  <div
                    key={`${idx}-${day}`}
                    className={`flex-1 relative last:border-r-0 ${theme.gridCell}`}
                  >
                    {HOURS.map((hour) => (
                      <div
                        key={hour}
                        className={`h-[72px] w-full box-border border-b-2 last:border-b-0 ${theme.gridRowBorder}`}
                      />
                    ))}
                  </div>
                ))}

                <div className="absolute top-0 bottom-0 right-0 left-24 pointer-events-none z-10">
                  {layoutBlocks.map((block) => {
                    const task = block.task as ScheduleTask;
                    const user = users.find((u) => u.id === task.userId);
                    if (!user) return null;
                    const visibleStart = Math.max(
                      block.start,
                      settings.startHour
                    );
                    const visibleEnd = Math.min(block.end, settings.endHour);
                    const top = (visibleStart - settings.startHour) * 72;
                    const height = (visibleEnd - visibleStart) * 72;
                    const maxCols = block.maxCols ?? 1;
                    const col = block.col;
                    const maxShiftPercent = 45;
                    const shiftPerCol =
                      maxCols > 1
                        ? Math.min(12, maxShiftPercent / (maxCols - 1))
                        : 0;
                    const shiftGlobal = shiftPerCol / 7;
                    const reservedGlobal = ((maxCols - 1) * shiftPerCol) / 7;
                    const leftPercent = (block.startDay / 7) * 100;
                    const widthPercent = (block.spanDays / 7) * 100;
                    const finalLeft = `calc(${leftPercent}% + ${col * shiftGlobal}% + 3px)`;
                    const finalWidth = `calc(${widthPercent}% - ${reservedGlobal}% - 10px)`;
                    const isShort = height < 50;

                    return (
                      <div
                        key={block.id}
                        onClick={() => openEditTask(task)}
                        className={`absolute overflow-hidden flex flex-col transition-all cursor-pointer text-white box-border group pointer-events-auto ${theme.cardBorder} ${theme.cardRadius}`}
                        style={{
                          top: `${top + 1}px`,
                          height: `${height - 2}px`,
                          left: finalLeft,
                          width: finalWidth,
                          backgroundColor: user.color,
                          zIndex: 10 + col,
                          boxShadow: theme.cardShadow,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform =
                            "scale(1.02) translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            theme.cardShadowHover;
                          e.currentTarget.style.zIndex = "100";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "none";
                          e.currentTarget.style.boxShadow = theme.cardShadow;
                          e.currentTarget.style.zIndex = String(10 + col);
                        }}
                      >
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-15 transition-opacity z-[1]" />
                        <div
                          className={`h-full overflow-hidden flex flex-col relative z-10 ${
                            isShort ? "p-1.5" : "p-2.5"
                          }`}
                        >
                          <AutoScaleText
                            align="left"
                            minScale={0.6}
                            className={`${
                              isShort ? "text-xs" : "text-sm"
                            } font-black leading-tight drop-shadow-sm flex-none`}
                          >
                            {task.title}
                          </AutoScaleText>
                          {height >= 45 && (
                            <div className="mt-1.5 text-[10px] font-bold opacity-90 drop-shadow-sm bg-black/10 inline-flex items-center justify-center h-5 px-1.5 rounded-md w-max whitespace-nowrap flex-none gap-1">
                              <Clock size={10} strokeWidth={3} />
                              <span className="translate-y-[0.5px]">
                                {formatTimeDisplay(
                                  task.start,
                                  settings.timeFormat
                                )}{" "}
                                -{" "}
                                {formatTimeDisplay(
                                  task.end,
                                  settings.timeFormat
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* 打印预览 */}
      {printModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex">
          <div
            className={`flex-1 h-full overflow-hidden bg-gray-200/80 bg-[radial-gradient(#ccc_1px,transparent_1px)] [background-size:20px_20px] relative select-none ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            onMouseDown={handlePrintDragStart}
            onWheel={(e) =>
              setPrintView((p) => ({
                ...p,
                viewScale: Math.max(
                  0.1,
                  Math.min(3, p.viewScale + (e.deltaY > 0 ? -0.05 : 0.05))
                ),
              }))
            }
          >
            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg pointer-events-none z-50">
              {tt("print.hintDragZoom")}
            </div>
            <div
              id={`print-page-outline-${id}`}
              className="absolute bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden origin-center pointer-events-none border border-black/5"
              style={{
                width: printConfig.orientation === "landscape" ? 1122 : 793,
                height: printConfig.orientation === "landscape" ? 793 : 1122,
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) scale(${printView.viewScale})`,
                backgroundColor: printConfig.fillBackground ? theme.bg : "white",
                backgroundImage: printConfig.fillBackground
                  ? theme.bgImage
                  : "none",
                backgroundSize: printConfig.fillBackground
                  ? theme.bgSize
                  : "auto",
              }}
            >
              <div
                id={`print-content-wrapper-${id}`}
                ref={printWrapperRef}
                className="origin-top-left absolute left-0 top-0 w-full h-full pointer-events-none"
                style={{
                  transform: `translate(${printView.tx}px, ${printView.ty}px) scale(${printConfig.scale / 100}) rotate(${printConfig.rotate}deg)`,
                }}
              />
            </div>
            <div className="absolute right-8 bottom-8 flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-2 rounded-full shadow-xl border border-gray-200 pointer-events-auto z-50">
              <span className="text-xs font-bold text-gray-500 mr-2 hidden sm:inline">
                {tt("print.viewScale")}
              </span>
              <button
                onClick={() =>
                  setPrintView((p) => ({
                    ...p,
                    viewScale: Math.max(0.1, p.viewScale - 0.1),
                  }))
                }
                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full font-black text-gray-600 transition-colors text-lg pb-0.5"
              >
                -
              </button>
              <span className="text-sm font-black text-gray-700 w-12 text-center select-text">
                {Math.round(printView.viewScale * 100)}%
              </span>
              <button
                onClick={() =>
                  setPrintView((p) => ({
                    ...p,
                    viewScale: Math.min(3, p.viewScale + 0.1),
                  }))
                }
                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full font-black text-gray-600 transition-colors text-lg pb-0.5"
              >
                +
              </button>
            </div>
          </div>

          <div className="w-80 bg-white h-full p-6 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-10 overflow-y-auto print-sidebar shrink-0 border-l border-gray-200">
            <h2 className="text-2xl font-black mb-6 text-gray-800 flex items-center gap-2">
              <Printer size={24} strokeWidth={3} className="text-blue-500" />
              {tt("print.title")}
            </h2>
            <div className="mb-5">
              <label className="font-bold block mb-2 text-sm text-gray-600">
                {tt("print.paperOrientation")}
              </label>
              <select
                value={printConfig.orientation}
                onChange={(e) =>
                  handlePrintConfigChange(
                    "orientation",
                    e.target.value as "landscape" | "portrait"
                  )
                }
                className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl font-bold cursor-pointer outline-none focus:border-blue-400"
              >
                <option value="landscape">{tt("print.orientation.landscape")}</option>
                <option value="portrait">{tt("print.orientation.portrait")}</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="font-bold block mb-2 text-sm text-gray-600">
                {tt("print.contentMode")}
              </label>
              <select
                value={printConfig.mode}
                onChange={(e) =>
                  handlePrintConfigChange(
                    "mode",
                    e.target.value as "adaptive" | "original"
                  )
                }
                className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl font-bold cursor-pointer outline-none focus:border-blue-400"
              >
                <option value="adaptive">{tt("print.mode.adaptive")}</option>
                <option value="original">{tt("print.mode.original")}</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="font-bold block mb-2 text-sm text-gray-600">
                {tt("print.contentScale")}
              </label>
              <input
                type="number"
                value={printConfig.scale}
                onChange={(e) =>
                  handlePrintConfigChange(
                    "scale",
                    Number(e.target.value) || 100
                  )
                }
                className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl font-bold outline-none focus:border-blue-400"
              />
            </div>
            <div className="mb-8">
              <label className="font-bold block mb-2 text-sm text-gray-600">
                {tt("print.rotateCorrection")}
              </label>
              <input
                type="number"
                step={90}
                value={printConfig.rotate}
                onChange={(e) =>
                  handlePrintConfigChange("rotate", Number(e.target.value) || 0)
                }
                className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl font-bold outline-none focus:border-blue-400"
              />
            </div>
            <div className="mb-8 flex items-center justify-between bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
              <label
                className="font-bold text-sm text-gray-700 cursor-pointer select-none flex flex-col"
                htmlFor={`print-bg-fill-${id}`}
              >
                {tt("print.fillBackground")}
                <span className="text-xs font-normal text-gray-500 mt-1">
                  {tt("print.fillBackgroundHint")}
                </span>
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id={`print-bg-fill-${id}`}
                  checked={printConfig.fillBackground}
                  onChange={(e) =>
                    handlePrintConfigChange(
                      "fillBackground",
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500" />
              </label>
            </div>
            <div className="mt-auto flex gap-3 pt-4 border-t-2 border-gray-100">
              <button
                onClick={() => setPrintModalOpen(false)}
                className="flex-1 py-3 bg-white text-gray-500 border-2 border-gray-200 rounded-xl font-bold shadow-[0_4px_0_#e5e7eb] hover:translate-y-[2px] hover:shadow-[0_2px_0_#e5e7eb] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-1"
              >
                {tt("common.close")}
              </button>
              <button
                onClick={executePrint}
                className="flex-1 py-3 bg-blue-500 text-white border-2 border-blue-600 rounded-xl font-bold shadow-[0_4px_0_#2563eb] hover:translate-y-[2px] hover:shadow-[0_2px_0_#2563eb] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-1"
              >
                {tt("print.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 设置模态框 */}
      {settingsModal.isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`${theme.modalBg} w-full max-w-md overflow-hidden transform transition-all`}
          >
            <div
              className={`px-6 py-5 flex justify-between items-center ${theme.modalHeader}`}
            >
              <h2 className="text-xl font-black flex items-center gap-2">
                <Settings size={22} strokeWidth={3} /> {tt("settings.title")}
              </h2>
              <button
                onClick={() => setSettingsModal({ isOpen: false })}
                className="hover:opacity-70 bg-white/50 p-1 rounded-full shadow-sm"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>
            <div className="p-6 space-y-5 bg-white/50">
              <div>
                <label className={`block text-sm mb-3 ${theme.textLabel}`}>
                  {tt("settings.themeStyle")}
                </label>
                <div className="flex gap-3">
                  {Object.values(THEMES).map((t) => {
                    const isImg = isImageItem(t.cornerIcon);
                    const src = getImageUrl(t.cornerIcon);
                    const iconHTML = isImg ? (
                      <img
                        src={src}
                        className="max-w-full max-h-full object-contain drop-shadow-sm"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.style.opacity = "0";
                        }}
                        alt=""
                      />
                    ) : (
                      <span className="text-2xl drop-shadow-sm leading-none">
                        {String(t.cornerIcon ?? "")}
                      </span>
                    );
                    return (
                      <button
                        key={t.id}
                        onClick={() =>
                          setSettingsForm({ ...settingsForm, theme: t.id })
                        }
                        className={`flex-1 py-3 border-2 flex flex-col items-center gap-1 transition-all ${theme.cardRadius} ${
                          settingsForm.theme === t.id
                            ? theme.radioActive
                            : theme.radioInactive
                        }`}
                      >
                        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                          {iconHTML}
                        </div>
                        <span className="font-bold text-sm">{t.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className={`block text-sm mb-2 ${theme.textLabel}`}>
                  {tt("settings.scheduleName")}
                </label>
                <input
                  type="text"
                  value={settingsForm.name}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, name: e.target.value })
                  }
                  className={`w-full px-4 py-3 outline-none transition-colors ${theme.input}`}
                />
              </div>
              <div>
                <label className={`block text-sm mb-3 ${theme.textLabel}`}>
                  {tt("settings.timeFormat")}
                </label>
                <div className="flex gap-4">
                  <label
                    className={`flex-1 flex items-center justify-center gap-2 py-3 border-2 cursor-pointer font-bold transition-all ${theme.cardRadius} ${
                      settingsForm.timeFormat === "12h"
                        ? theme.radioActive
                        : theme.radioInactive
                    }`}
                  >
                    <input
                      type="radio"
                      value="12h"
                      className="hidden"
                      checked={settingsForm.timeFormat === "12h"}
                      onChange={() =>
                        setSettingsForm({
                          ...settingsForm,
                          timeFormat: "12h",
                        })
                      }
                    />
                    2:00 PM
                  </label>
                  <label
                    className={`flex-1 flex items-center justify-center gap-2 py-3 border-2 cursor-pointer font-bold transition-all ${theme.cardRadius} ${
                      settingsForm.timeFormat === "24h"
                        ? theme.radioActive
                        : theme.radioInactive
                    }`}
                  >
                    <input
                      type="radio"
                      value="24h"
                      className="hidden"
                      checked={settingsForm.timeFormat === "24h"}
                      onChange={() =>
                        setSettingsForm({
                          ...settingsForm,
                          timeFormat: "24h",
                        })
                      }
                    />
                    14:00
                  </label>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={`block text-sm mb-2 ${theme.textLabel}`}>
                    {tt("settings.startTime")}
                  </label>
                  <select
                    value={settingsForm.startHour}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        startHour: Number(e.target.value),
                      }))
                    }
                    className={`w-full px-4 py-3 outline-none cursor-pointer ${theme.input}`}
                  >
                    {FULL_TIME_OPTIONS.filter(
                      (opt) => opt.value < settingsForm.endHour
                    ).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {formatTimeDisplay(
                          opt.value,
                          settingsForm.timeFormat
                        )}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className={`block text-sm mb-2 ${theme.textLabel}`}>
                    {tt("settings.endTime")}
                  </label>
                  <select
                    value={settingsForm.endHour}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        endHour: Number(e.target.value),
                      }))
                    }
                    className={`w-full px-4 py-3 outline-none cursor-pointer ${theme.input}`}
                  >
                    {FULL_TIME_OPTIONS.filter(
                      (opt) => opt.value > settingsForm.startHour
                    ).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {formatTimeDisplay(
                          opt.value,
                          settingsForm.timeFormat
                        )}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 bg-white/50 flex justify-end gap-4 border-t-2 border-black/5">
              <button
                onClick={() => setSettingsModal({ isOpen: false })}
                className={getBtn("cancel", "px-6 py-3")}
              >
                {tt("common.cancel")}
              </button>
              <button
                onClick={saveSettings}
                className={getBtn("warning", "px-8 py-3 text-lg")}
              >
                {tt("settings.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 任务模态框 */}
      {taskModal.isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`${theme.modalBg} w-full max-w-md overflow-hidden`}
          >
            <div
              className={`px-6 py-5 flex justify-between items-center ${theme.modalHeader}`}
            >
              <h2 className="text-xl font-black flex items-center gap-2">
                {taskModal.mode === "add"
                  ? tt("task.modalTitleAdd")
                  : tt("task.modalTitleEdit")}
              </h2>
              <button
                onClick={() => setTaskModal({ isOpen: false, mode: "add", data: null })}
                className="hover:opacity-70 bg-white/50 p-1 rounded-full shadow-sm"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>
            <div className="p-6 space-y-5 bg-white/50">
              <div>
                <label className={`block text-sm mb-2 ${theme.textLabel}`}>
                  {tt("task.labelTitle")}
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                  className={`w-full px-4 py-3 outline-none ${theme.input}`}
                  placeholder={tt("task.placeholderTitle")}
                />
              </div>
              <div>
                <label className={`block text-sm mb-2 ${theme.textLabel}`}>
                  {tt("task.labelOwner")}
                </label>
                <select
                  value={taskForm.userId}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, userId: e.target.value })
                  }
                  className={`w-full px-4 py-3 outline-none cursor-pointer ${theme.input}`}
                >
                  {users.length === 0 && (
                    <option value="">{tt("task.noUsersOption")}</option>
                  )}
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm mb-2 ${theme.textLabel}`}>
                  {tt("task.labelDays")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {dayLabels.map((day, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-xl border transition-colors shadow-sm ${
                        taskForm.days.includes(idx)
                          ? "border-blue-400 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={taskForm.days.includes(idx)}
                        onChange={(e) =>
                          handleDayToggle(idx, e.target.checked)
                        }
                        className="w-4 h-4 rounded text-blue-500"
                      />
                      <span
                        className={`text-sm font-bold ${
                          taskForm.days.includes(idx)
                            ? "text-blue-600"
                            : "text-gray-700"
                        }`}
                      >
                        {day}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={`block text-sm mb-2 ${theme.textLabel}`}>
                    {tt("task.labelStart")}
                  </label>
                  <select
                    value={taskForm.start}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        start: Number(e.target.value),
                      })
                    }
                    className={`w-full px-4 py-3 outline-none cursor-pointer ${theme.input}`}
                  >
                    {FULL_TIME_OPTIONS.filter(
                      (opt) => opt.value < taskForm.end
                    ).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className={`block text-sm mb-2 ${theme.textLabel}`}>
                    {tt("task.labelEnd")}
                  </label>
                  <select
                    value={taskForm.end}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        end: Number(e.target.value),
                      })
                    }
                    className={`w-full px-4 py-3 outline-none cursor-pointer ${theme.input}`}
                  >
                    {FULL_TIME_OPTIONS.filter(
                      (opt) => opt.value > taskForm.start
                    ).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 bg-white flex justify-between items-center border-t-2 border-black/5">
              {taskModal.mode === "edit" ? (
                <button
                  onClick={deleteTask}
                  className={getBtn("dangerOutline", "px-3 py-2 gap-1")}
                >
                  <Trash2 size={16} strokeWidth={3} /> {tt("task.delete")}
                </button>
              ) : (
                <div />
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setTaskModal({ isOpen: false, mode: "add", data: null })}
                  className={getBtn("cancel", "px-5 py-2.5")}
                >
                  {tt("common.cancel")}
                </button>
                <button
                  onClick={saveTask}
                  disabled={
                    !taskForm.title.trim() ||
                    !taskForm.userId ||
                    (taskForm.days?.length ?? 0) === 0
                  }
                  className={getBtn("primary", "px-6 py-2.5")}
                >
                  {tt("task.save")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 用户模态框 */}
      {userModal.isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`${theme.modalBg} w-full max-w-md overflow-hidden`}
          >
            <div
              className={`px-6 py-5 flex justify-between items-center ${theme.modalHeader}`}
            >
              <h2 className="text-xl font-black flex items-center gap-2">
                {userModal.mode === "add"
                  ? tt("member.modalTitleAdd")
                  : tt("member.modalTitleEdit")}
              </h2>
              <button
                onClick={() =>
                  setUserModal({ isOpen: false, mode: "add", userId: null })
                }
                className="hover:opacity-70 bg-white/50 p-1 rounded-full shadow-sm"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>
            <div className="p-6 space-y-6 bg-white/50">
              <div>
                <label className={`block text-sm mb-2 ${theme.textLabel}`}>
                  {tt("member.labelName")}
                </label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) =>
                    setUserForm({ ...userForm, name: e.target.value })
                  }
                  className={`w-full px-4 py-3 outline-none ${theme.input}`}
                  placeholder={tt("member.placeholderName")}
                />
              </div>
              <div>
                <label className={`block text-sm mb-3 ${theme.textLabel}`}>
                  {tt("member.labelColor")}
                </label>
                <div className="flex items-center gap-4 bg-white/60 p-4 rounded-2xl border border-black/10">
                  <div className="relative cursor-pointer">
                    <input
                      type="color"
                      value={userForm.color}
                      onChange={(e) =>
                        setUserForm({ ...userForm, color: e.target.value })
                      }
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                    <div
                      className="w-12 h-12 rounded-full border-4 shadow-sm flex items-center justify-center text-white font-bold"
                      style={{
                        backgroundColor: userForm.color,
                        borderColor: "white",
                      }}
                    >
                      <Edit2 size={16} strokeWidth={3} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2.5 border-l-2 pl-4 border-black/10">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setUserForm({ ...userForm, color: c })}
                        className={`w-8 h-8 rounded-full border-2 transition-all shadow-sm ${
                          userForm.color === c
                            ? "border-white scale-125 ring-2 ring-blue-400"
                            : "border-transparent opacity-80 hover:opacity-100 hover:scale-110"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 bg-white flex justify-end gap-3 border-t-2 border-black/5">
              <button
                onClick={() =>
                  setUserModal({ isOpen: false, mode: "add", userId: null })
                }
                className={getBtn("cancel", "px-5 py-2.5")}
              >
                {tt("common.cancel")}
              </button>
              <button
                onClick={saveUser}
                disabled={!userForm.name.trim()}
                className={getBtn("success", "px-6 py-2.5")}
              >
                {userModal.mode === "add"
                  ? tt("member.confirmAdd")
                  : tt("member.confirmEdit")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认 */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`${theme.modalBg} w-full max-w-sm overflow-hidden`}
          >
            <div
              className={`px-6 py-5 flex justify-center items-center ${theme.modalHeader}`}
            >
              <h2 className="text-xl font-black flex items-center gap-2">
                {tt("member.deleteConfirm.title")}
              </h2>
            </div>
            <div className="p-6 text-center bg-white/50">
              <p className="text-gray-600 font-bold leading-relaxed text-base">
                {tt("member.deleteConfirm.line1")}
                <br />
                {tt("member.deleteConfirm.line2")}
              </p>
            </div>
            <div className="px-6 py-5 bg-white flex justify-center gap-4 border-t-2 border-black/5">
              <button
                onClick={() =>
                  setDeleteConfirmModal({ isOpen: false, userId: null })
                }
                className={getBtn("cancel", "px-6 py-2.5")}
              >
                {tt("member.deleteConfirm.cancel")}
              </button>
              <button
                onClick={executeDeleteUser}
                className={getBtn("danger", "px-6 py-2.5")}
              >
                {tt("member.deleteConfirm.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- 根组件：日程工作台 ---
export default function ScheduleWorkbench() {
  const { t } = useI18n();
  const tt = (key: string) => t(`tools.schedule-workbench.${key}`);
  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: "s1",
      isExpanded: true,
      settings: {
        name: "家庭大计划",
        timeFormat: "12h",
        startHour: 8,
        endHour: 22,
        theme: "classic",
      },
      users: [
        { id: "u1", name: "爸爸", color: "#1E90FF", visible: true },
        { id: "u2", name: "妈妈", color: "#FF6B81", visible: true },
        { id: "u3", name: "宝宝", color: "#FFD32A", visible: true },
      ],
      tasks: [
        {
          id: "t1",
          userId: "u1",
          days: [0, 1],
          start: 9,
          end: 11,
          title: "工作💻",
        },
        {
          id: "t3",
          userId: "u2",
          days: [0, 2],
          start: 10,
          end: 11.5,
          title: "瑜伽课🧘‍♀️",
        },
        {
          id: "t5",
          userId: "u3",
          days: [0, 1, 2, 3, 4],
          start: 8.5,
          end: 15,
          title: "开心幼儿园🎨",
        },
      ],
    },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    message: string;
    confirmText: string;
    cancelText?: string;
    onConfirm: () => void;
    variant?: "default" | "danger";
  }>({ open: false, message: "", confirmText: "", onConfirm: () => {} });

  const showAlert = (message: string) => {
    setConfirmDialog({
      open: true,
      message,
      confirmText: t("common.confirmOk"),
      onConfirm: () => {},
    });
  };
  const showConfirm = (message: string, onConfirm: () => void) => {
    setConfirmDialog({
      open: true,
      message,
      confirmText: t("common.confirmOk"),
      cancelText: t("common.confirmCancel"),
      variant: "danger",
      onConfirm,
    });
  };

  const handleGlobalImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(
          (event.target?.result as string) ?? "null"
        ) as
          | Schedule[]
          | { settings: unknown; users: unknown; tasks: unknown };
        if (Array.isArray(data)) {
          const imported = data.map((sch) => ({
            ...sch,
            id: "s_" + Date.now() + "_" + Math.random(),
            isExpanded: false,
          }));
          setSchedules((prev) => [...imported, ...prev]);
          showAlert(tt("import.successMultiple"));
        } else if (
          data &&
          typeof data === "object" &&
          "settings" in data &&
          "users" in data &&
          "tasks" in data
        ) {
          const newSch = {
            ...data,
            id: "s_" + Date.now(),
            isExpanded: true,
          } as Schedule;
          setSchedules((prev) => [newSch, ...prev]);
          showAlert(tt("import.successSingle"));
        } else {
          showAlert(tt("import.invalidData"));
        }
      } catch {
        showAlert(tt("import.parseFailed"));
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const createNewSchedule = () => {
    const newId = "s_" + Date.now();
    setSchedules((prev) => [
      {
        id: newId,
        isExpanded: true,
        settings: {
          name: "新日程表",
          timeFormat: "12h",
          startHour: 8,
          endHour: 22,
          theme: "classic",
        },
        users: [],
        tasks: [],
      },
      ...prev,
    ]);
  };

  const updateSchedule = (id: string, updates: Partial<Schedule>) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const filteredSchedules = schedules.filter((s) =>
    s.settings.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-800 relative">
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog((d) => ({ ...d, open: false }))}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        onConfirm={confirmDialog.onConfirm}
        variant={confirmDialog.variant}
      />
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleGlobalImport}
      />

      <header className="bg-white shadow-sm p-4 sticky top-0 z-50 flex flex-col md:flex-row justify-between items-center gap-4 no-print">
        <div className="flex items-center gap-3 w-full md:w-auto font-black text-blue-600 text-xl">
          <div className="p-2 bg-blue-50 rounded-xl shadow-[0_4px_0_#bfdbfe] border-2 border-blue-200 translate-y-[-2px]">
            <Calendar strokeWidth={3} />
          </div>
          {tt("appTitle")}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
              strokeWidth={3}
            />
            <input
              type="text"
              placeholder={tt("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-gray-200 outline-none focus:border-blue-400 focus:bg-blue-50 transition-colors font-bold text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
            />
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border-2 border-gray-200 text-gray-600 rounded-2xl font-bold shadow-[0_4px_0_#e5e7eb] hover:translate-y-[2px] hover:shadow-[0_2px_0_#e5e7eb] active:translate-y-[4px] active:shadow-none transition-all flex-shrink-0"
          >
            <Upload size={18} strokeWidth={2.5} />
            <span className="hidden sm:inline">{tt("importButton")}</span>
          </button>

          <button
            onClick={createNewSchedule}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-blue-500 text-white border-2 border-blue-600 rounded-2xl font-bold shadow-[0_4px_0_#2563eb] hover:translate-y-[2px] hover:shadow-[0_2px_0_#2563eb] active:translate-y-[4px] active:shadow-none transition-all flex-shrink-0"
          >
            <Plus size={18} strokeWidth={3} />
            <span className="hidden sm:inline">{tt("newSchedule")}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1800px] w-full mx-auto flex flex-col gap-8">
        {filteredSchedules.map((sch) => (
          <ScheduleItem
            key={sch.id}
            schedule={sch}
            onUpdate={updateSchedule}
            onDelete={deleteSchedule}
            showAlert={showAlert}
            showConfirm={showConfirm}
          />
        ))}

        {filteredSchedules.length === 0 && (
          <div className="text-center text-gray-400 py-32 flex flex-col items-center gap-4">
            <Calendar size={64} className="text-gray-300 opacity-50" />
            <p className="font-bold text-lg">{tt("empty.noResults")}</p>
          </div>
        )}
      </main>
    </div>
  );
}
