/**
 * 日程工作台 - 主题与按钮样式，与 gemini_temp/日程工作台.jsx 完全一致
 */

export const DAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

export const PRESET_COLORS = [
  "#FF6B81",
  "#FFA502",
  "#FFD32A",
  "#2ED573",
  "#1E90FF",
  "#9C88FF",
  "#FF9FF3",
  "#06b6d4",
  "#f43f5e",
];

export type ThemeId = "classic" | "playful" | "hellokitty" | "labubu";

export type ThemeIcon = string | { type: "img"; src: string };

export interface ThemeDef {
  id: ThemeId;
  name: string;
  icon: ThemeIcon;
  legendIcon: ThemeIcon;
  cornerIcon: ThemeIcon;
  bg: string;
  bgImage: string;
  bgSize: string;
  font: string;
  header: string;
  title: string;
  subtitle: string;
  legendBg: string;
  legendTagActive: string;
  legendTagInactive: string;
  container: string;
  gridHeaderBg: string;
  dayHeader: string;
  timeColBg: string;
  timeLabel: string;
  gridCell: string;
  gridRowBorder: string;
  cardBorder: string;
  cardRadius: string;
  cardShadow: string;
  cardShadowHover: string;
  modalBg: string;
  modalHeader: string;
  input: string;
  textLabel: string;
  radioActive: string;
  radioInactive: string;
}

export const THEMES: Record<ThemeId, ThemeDef> = {
  classic: {
    id: "classic",
    name: "清爽蓝白",
    icon: "☁️",
    legendIcon: "🐳",
    cornerIcon: "img:https://img.icons8.com/fluency/96/clouds.png",
    bg: "#F0F8FF",
    bgImage: "radial-gradient(#D3E4F6 3px, transparent 3px)",
    bgSize: "40px 40px",
    font: '"Nunito", "PingFang SC", sans-serif',
    header:
      "bg-white/90 backdrop-blur-md border-b-4 border-blue-100 shadow-sm",
    title: "text-blue-600",
    subtitle: "text-blue-400",
    legendBg:
      "bg-white/90 backdrop-blur-md border-b-4 border-blue-100 shadow-sm",
    legendTagActive:
      "text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md border-2 border-transparent",
    legendTagInactive:
      "text-blue-400 bg-blue-50 border-2 border-blue-100 hover:bg-blue-100",
    container:
      "bg-white rounded-[2rem] shadow-xl shadow-blue-100/50 border-4 border-blue-100",
    gridHeaderBg: "bg-blue-50 border-b-4 border-blue-100",
    dayHeader:
      "bg-white mx-1 h-11 rounded-full border-2 border-blue-100 text-blue-500 font-bold text-base flex items-center justify-center",
    timeColBg: "border-r-4 border-blue-50",
    timeLabel:
      "bg-white px-2 h-6 rounded-full text-[11px] font-bold text-blue-500 border-2 border-blue-100 shadow-sm flex items-center justify-center",
    gridCell: "border-r-2 border-dashed border-blue-100",
    gridRowBorder: "border-dashed border-blue-100",
    cardBorder: "border-[2px] border-white",
    cardRadius: "rounded-[1.5rem]",
    cardShadow: "0 4px 6px rgba(59,130,246,0.2)",
    cardShadowHover: "0 8px 15px rgba(59,130,246,0.3)",
    modalBg: "bg-white rounded-[2rem] shadow-2xl border-4 border-blue-100",
    modalHeader: "bg-blue-50 border-b-4 border-blue-100 text-blue-600",
    input:
      "bg-blue-50/50 border-2 border-blue-200 rounded-full px-4 py-2 focus:border-blue-400 focus:bg-white font-bold text-blue-700",
    textLabel: "text-blue-600 font-bold",
    radioActive:
      "border-blue-400 bg-blue-50 text-blue-600 translate-y-[4px] shadow-none",
    radioInactive:
      "border-blue-200 bg-white text-blue-500 shadow-[0_4px_0_#bfdbfe] hover:translate-y-[2px] hover:shadow-[0_2px_0_#bfdbfe] active:translate-y-[4px] active:shadow-none",
  },
  playful: {
    id: "playful",
    name: "游乐园",
    icon: "🎈",
    legendIcon: "🌟",
    cornerIcon: "img:https://img.icons8.com/color/96/rainbow.png",
    bg: "#FFF9E6",
    bgImage: "radial-gradient(#FDE047 3px, transparent 3px)",
    bgSize: "40px 40px",
    font: '"Comic Sans MS", "Chalkboard SE", "Comic Neue", "Nunito", sans-serif',
    header:
      "bg-white/90 backdrop-blur-md border-b-4 border-white shadow-sm",
    title: "text-amber-600",
    subtitle: "text-amber-500/80",
    legendBg:
      "bg-white/90 backdrop-blur-md border-b-4 border-white shadow-sm",
    legendTagActive:
      "text-white shadow-[0_3px_0_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:shadow-[0_5px_0_rgba(0,0,0,0.15)] border-2 border-white",
    legendTagInactive:
      "text-gray-400 bg-gray-100 border-2 border-gray-200 shadow-none hover:bg-gray-200",
    container:
      "bg-white rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.05)] border-4 border-white",
    gridHeaderBg: "bg-white border-b-4 border-amber-50",
    dayHeader:
      "bg-amber-50 mx-1 h-11 rounded-2xl border-2 border-amber-100 text-amber-600 font-black text-lg flex items-center justify-center",
    timeColBg: "border-r-4 border-amber-50",
    timeLabel:
      "bg-white px-2 h-6 rounded-xl text-[11px] font-black text-amber-400 border-2 border-amber-50 shadow-sm flex items-center justify-center",
    gridCell: "border-r-2 border-dashed border-gray-100",
    gridRowBorder: "border-dashed border-gray-100",
    cardBorder: "border-[3px] border-white",
    cardRadius: "rounded-[1.2rem]",
    cardShadow: "0 4px 10px rgba(0,0,0,0.1)",
    cardShadowHover: "0 8px 15px rgba(0,0,0,0.15)",
    modalBg: "bg-white rounded-[2rem] shadow-2xl border-4 border-white",
    modalHeader: "bg-amber-50 border-b-2 border-amber-100 text-amber-700",
    input:
      "bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-amber-400 focus:bg-white font-bold text-gray-700",
    textLabel: "text-gray-600 font-black",
    radioActive:
      "border-amber-400 bg-amber-50 text-amber-600 translate-y-[4px] shadow-none",
    radioInactive:
      "border-gray-300 bg-white text-gray-600 shadow-[0_4px_0_#d1d5db] hover:translate-y-[2px] hover:shadow-[0_2px_0_#d1d5db] active:translate-y-[4px] active:shadow-none",
  },
  hellokitty: {
    id: "hellokitty",
    name: "Hello Kitty",
    icon: "🎀",
    legendIcon: "img:https://img.icons8.com/color/96/cherry-blossom.png",
    cornerIcon: "img:https://img.icons8.com/color/96/hello-kitty.png",
    bg: "#FFF0F5",
    bgImage: "radial-gradient(#FFC0CB 3px, transparent 3px)",
    bgSize: "30px 30px",
    font: '"Nunito", "Quicksand", "PingFang SC", sans-serif',
    header:
      "bg-white/80 backdrop-blur-md border-b-4 border-pink-200 shadow-sm",
    title: "text-pink-500",
    subtitle: "text-pink-400",
    legendBg:
      "bg-white/80 backdrop-blur-md border-b-4 border-pink-200 shadow-sm",
    legendTagActive:
      "text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md border-2 border-transparent",
    legendTagInactive:
      "text-pink-400 bg-pink-50 border-2 border-pink-100 hover:bg-pink-100",
    container:
      "bg-white rounded-[2rem] shadow-xl shadow-pink-100/50 border-4 border-pink-100",
    gridHeaderBg: "bg-pink-50 border-b-4 border-pink-100",
    dayHeader:
      "bg-white mx-1 h-11 rounded-full border-2 border-pink-100 text-pink-500 font-bold text-base flex items-center justify-center",
    timeColBg: "border-r-4 border-pink-50",
    timeLabel:
      "bg-white px-2 h-6 rounded-full text-[11px] font-bold text-pink-500 border-2 border-pink-100 shadow-sm flex items-center justify-center",
    gridCell: "border-r-2 border-dashed border-pink-100",
    gridRowBorder: "border-dashed border-pink-100",
    cardBorder: "border-[2px] border-white",
    cardRadius: "rounded-[1.5rem]",
    cardShadow: "0 4px 6px rgba(244,114,182,0.2)",
    cardShadowHover: "0 8px 15px rgba(244,114,182,0.3)",
    modalBg: "bg-white rounded-[2rem] shadow-2xl border-4 border-pink-100",
    modalHeader: "bg-pink-50 border-b-4 border-pink-100 text-pink-600",
    input:
      "bg-pink-50/50 border-2 border-pink-200 rounded-full px-4 py-2 focus:border-pink-400 focus:bg-white font-bold text-pink-700",
    textLabel: "text-pink-600 font-bold",
    radioActive:
      "border-pink-400 bg-pink-50 text-pink-600 translate-y-[4px] shadow-none",
    radioInactive:
      "border-pink-200 bg-white text-pink-500 shadow-[0_4px_0_#fbcfe8] hover:translate-y-[2px] hover:shadow-[0_2px_0_#fbcfe8] active:translate-y-[4px] active:shadow-none",
  },
  labubu: {
    id: "labubu",
    name: "Labubu",
    icon: "🐻",
    legendIcon: "img:https://img.icons8.com/color/96/teddy-bear.png",
    cornerIcon: "img:https://img.icons8.com/color/96/bear.png",
    bg: "#FDFBF7",
    bgImage: "radial-gradient(#DED6C9 3px, transparent 3px)",
    bgSize: "30px 30px",
    font: '"Nunito", "Quicksand", "PingFang SC", sans-serif',
    header:
      "bg-[#FDFBF7]/90 backdrop-blur-md border-b-4 border-[#DED6C9] shadow-sm",
    title: "text-[#5C4636]",
    subtitle: "text-[#8C6B52]",
    legendBg:
      "bg-[#FDFBF7]/90 backdrop-blur-md border-b-4 border-[#DED6C9] shadow-sm",
    legendTagActive:
      "text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md border-2 border-transparent",
    legendTagInactive:
      "text-[#8C6B52] bg-[#F5F0E6] border-2 border-[#DED6C9] hover:bg-[#EBE3D5]",
    container:
      "bg-white rounded-[2rem] shadow-lg shadow-[#8C6B52]/10 border-4 border-[#DED6C9]",
    gridHeaderBg: "bg-[#F5F0E6] border-b-4 border-[#DED6C9]",
    dayHeader:
      "bg-white mx-1 h-11 rounded-full border-2 border-[#DED6C9] text-[#5C4636] font-bold text-base flex items-center justify-center",
    timeColBg: "border-r-4 border-[#F5F0E6]",
    timeLabel:
      "bg-white px-2 h-6 rounded-full text-[11px] font-bold text-[#8C6B52] border-2 border-[#DED6C9] shadow-sm flex items-center justify-center",
    gridCell: "border-r-2 border-dashed border-[#EBE3D5]",
    gridRowBorder: "border-dashed border-[#EBE3D5]",
    cardBorder: "border-[2px] border-[#F5F0E6]",
    cardRadius: "rounded-[1.5rem]",
    cardShadow: "0 4px 6px rgba(140,107,82,0.15)",
    cardShadowHover: "0 8px 15px rgba(140,107,82,0.25)",
    modalBg: "bg-white rounded-[2rem] shadow-2xl border-4 border-[#DED6C9]",
    modalHeader:
      "bg-[#F5F0E6] border-b-4 border-[#DED6C9] text-[#5C4636]",
    input:
      "bg-[#F5F0E6]/50 border-2 border-[#DED6C9] rounded-full px-4 py-2 focus:border-[#8C6B52] focus:bg-white font-bold text-[#5C4636]",
    textLabel: "text-[#5C4636] font-bold",
    radioActive:
      "border-[#8C6B52] bg-[#F5F0E6] text-[#5C4636] translate-y-[4px] shadow-none",
    radioInactive:
      "border-[#DED6C9] bg-white text-[#8C6B52] shadow-[0_4px_0_#DED6C9] hover:translate-y-[2px] hover:shadow-[0_2px_0_#DED6C9] active:translate-y-[4px] active:shadow-none",
  },
};

export const BTN_STYLES: Record<ThemeId, Record<string, string>> = {
  classic: {
    primary:
      "bg-blue-500 text-white rounded-full border-2 border-blue-600 shadow-[0_4px_0_#2563eb] hover:translate-y-[2px] hover:shadow-[0_2px_0_#2563eb] active:translate-y-[4px] active:shadow-none font-bold",
    success:
      "bg-teal-400 text-white rounded-full border-2 border-teal-500 shadow-[0_4px_0_#0f766e] hover:translate-y-[2px] hover:shadow-[0_2px_0_#0f766e] active:translate-y-[4px] active:shadow-none font-bold",
    danger:
      "bg-rose-400 text-white rounded-full border-2 border-rose-500 shadow-[0_4px_0_#be123c] hover:translate-y-[2px] hover:shadow-[0_2px_0_#be123c] active:translate-y-[4px] active:shadow-none font-bold",
    dangerOutline:
      "text-red-500 bg-white hover:bg-red-50 border-2 border-red-200 rounded-full font-bold text-sm shadow-[0_4px_0_#fecaca] hover:translate-y-[2px] hover:shadow-[0_2px_0_#fecaca] active:translate-y-[4px] active:shadow-none",
    warning:
      "bg-amber-400 text-white rounded-full border-2 border-amber-500 shadow-[0_4px_0_#d97706] hover:translate-y-[2px] hover:shadow-[0_2px_0_#d97706] active:translate-y-[4px] active:shadow-none font-bold",
    cancel:
      "bg-blue-50 text-blue-600 rounded-full border-2 border-blue-200 shadow-[0_4px_0_#bfdbfe] hover:translate-y-[2px] hover:shadow-[0_2px_0_#bfdbfe] active:translate-y-[4px] active:shadow-none font-bold",
    icon1:
      "bg-white text-blue-500 rounded-full border-2 border-blue-200 shadow-[0_4px_0_#bfdbfe] hover:translate-y-[2px] hover:shadow-[0_2px_0_#bfdbfe] active:translate-y-[4px] active:shadow-none",
    icon2:
      "bg-cyan-50 text-cyan-600 rounded-full border-2 border-cyan-200 shadow-[0_4px_0_#a5f3fc] hover:translate-y-[2px] hover:shadow-[0_2px_0_#a5f3fc] active:translate-y-[4px] active:shadow-none font-bold",
  },
  playful: {
    primary:
      "bg-blue-500 text-white rounded-2xl border-2 border-blue-600 shadow-[0_4px_0_#2563eb] hover:translate-y-[2px] hover:shadow-[0_2px_0_#2563eb] active:translate-y-[4px] active:shadow-none font-black",
    success:
      "bg-green-500 text-white rounded-2xl border-2 border-green-600 shadow-[0_4px_0_#16a34a] hover:translate-y-[2px] hover:shadow-[0_2px_0_#16a34a] active:translate-y-[4px] active:shadow-none font-black",
    danger:
      "bg-red-500 text-white rounded-2xl border-2 border-red-600 shadow-[0_4px_0_#dc2626] hover:translate-y-[2px] hover:shadow-[0_2px_0_#dc2626] active:translate-y-[4px] active:shadow-none font-black",
    dangerOutline:
      "text-red-500 bg-white hover:bg-red-50 border-2 border-red-200 rounded-2xl font-black text-sm shadow-[0_4px_0_#fecaca] hover:translate-y-[2px] hover:shadow-[0_2px_0_#fecaca] active:translate-y-[4px] active:shadow-none",
    warning:
      "bg-amber-400 text-white rounded-2xl border-2 border-amber-500 shadow-[0_4px_0_#d97706] hover:translate-y-[2px] hover:shadow-[0_2px_0_#d97706] active:translate-y-[4px] active:shadow-none font-black",
    cancel:
      "bg-gray-100 text-gray-500 border-2 border-gray-300 rounded-2xl font-bold shadow-[0_4px_0_#d1d5db] hover:translate-y-[2px] hover:shadow-[0_2px_0_#d1d5db] active:translate-y-[4px] active:shadow-none",
    icon1:
      "bg-amber-100 text-amber-600 rounded-2xl border-2 border-amber-200 shadow-[0_4px_0_#FDE047] hover:translate-y-[2px] hover:shadow-[0_2px_0_#FDE047] active:translate-y-[4px] active:shadow-none",
    icon2:
      "bg-green-100 text-green-600 rounded-2xl border-2 border-green-200 shadow-[0_4px_0_#bbf7d0] hover:translate-y-[2px] hover:shadow-[0_2px_0_#bbf7d0] active:translate-y-[4px] active:shadow-none font-bold",
  },
  hellokitty: {
    primary:
      "bg-pink-500 text-white rounded-full border-2 border-pink-600 shadow-[0_4px_0_#db2777] hover:translate-y-[2px] hover:shadow-[0_2px_0_#db2777] active:translate-y-[4px] active:shadow-none font-bold",
    success:
      "bg-rose-400 text-white rounded-full border-2 border-rose-500 shadow-[0_4px_0_#e11d48] hover:translate-y-[2px] hover:shadow-[0_2px_0_#e11d48] active:translate-y-[4px] active:shadow-none font-bold",
    danger:
      "bg-red-400 text-white rounded-full border-2 border-red-500 shadow-[0_4px_0_#dc2626] hover:translate-y-[2px] hover:shadow-[0_2px_0_#dc2626] active:translate-y-[4px] active:shadow-none font-bold",
    dangerOutline:
      "text-red-500 bg-white hover:bg-red-50 border-2 border-red-200 rounded-full font-bold text-sm shadow-[0_4px_0_#fecaca] hover:translate-y-[2px] hover:shadow-[0_2px_0_#fecaca] active:translate-y-[4px] active:shadow-none",
    warning:
      "bg-pink-500 text-white rounded-full border-2 border-pink-600 shadow-[0_4px_0_#db2777] hover:translate-y-[2px] hover:shadow-[0_2px_0_#db2777] active:translate-y-[4px] active:shadow-none font-bold",
    cancel:
      "bg-pink-50 text-pink-600 rounded-full border-2 border-pink-200 shadow-[0_4px_0_#fbcfe8] hover:translate-y-[2px] hover:shadow-[0_2px_0_#fbcfe8] active:translate-y-[4px] active:shadow-none font-bold",
    icon1:
      "bg-white text-pink-500 rounded-full border-2 border-pink-200 shadow-[0_4px_0_#fbcfe8] hover:translate-y-[2px] hover:shadow-[0_2px_0_#fbcfe8] active:translate-y-[4px] active:shadow-none",
    icon2:
      "bg-rose-50 text-rose-600 rounded-full border-2 border-rose-200 shadow-[0_4px_0_#fecdd3] hover:translate-y-[2px] hover:shadow-[0_2px_0_#fecdd3] active:translate-y-[4px] active:shadow-none font-bold",
  },
  labubu: {
    primary:
      "bg-[#8C6B52] text-white rounded-full border-2 border-[#5C4636] shadow-[0_4px_0_#5C4636] hover:translate-y-[2px] hover:shadow-[0_2px_0_#5C4636] active:translate-y-[4px] active:shadow-none font-bold",
    success:
      "bg-[#A88B73] text-white rounded-full border-2 border-[#8C6B52] shadow-[0_4px_0_#8C6B52] hover:translate-y-[2px] hover:shadow-[0_2px_0_#8C6B52] active:translate-y-[4px] active:shadow-none font-bold",
    danger:
      "bg-[#C27D7D] text-white rounded-full border-2 border-[#A85B5B] shadow-[0_4px_0_#A85B5B] hover:translate-y-[2px] hover:shadow-[0_2px_0_#A85B5B] active:translate-y-[4px] active:shadow-none font-bold",
    dangerOutline:
      "text-[#C27D7D] bg-white hover:bg-[#FDFBF7] border-2 border-[#C27D7D] rounded-full font-bold text-sm shadow-[0_4px_0_#DED6C9] hover:translate-y-[2px] hover:shadow-[0_2px_0_#DED6C9] active:translate-y-[4px] active:shadow-none",
    warning:
      "bg-[#8C6B52] text-white rounded-full border-2 border-[#5C4636] shadow-[0_4px_0_#5C4636] hover:translate-y-[2px] hover:shadow-[0_2px_0_#5C4636] active:translate-y-[4px] active:shadow-none font-bold",
    cancel:
      "bg-[#F5F0E6] text-[#8C6B52] rounded-full border-2 border-[#DED6C9] shadow-[0_4px_0_#DED6C9] hover:translate-y-[2px] hover:shadow-[0_2px_0_#DED6C9] active:translate-y-[4px] active:shadow-none font-bold",
    icon1:
      "bg-white text-[#8C6B52] rounded-full border-2 border-[#DED6C9] shadow-[0_4px_0_#DED6C9] hover:translate-y-[2px] hover:shadow-[0_2px_0_#DED6C9] active:translate-y-[4px] active:shadow-none",
    icon2:
      "bg-[#F5F0E6] text-[#5C4636] rounded-full border-2 border-[#DED6C9] shadow-[0_4px_0_#DED6C9] hover:translate-y-[2px] hover:shadow-[0_2px_0_#DED6C9] active:translate-y-[4px] active:shadow-none font-bold",
  },
};
