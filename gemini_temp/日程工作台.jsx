import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, UserPlus, Calendar, Clock, Trash2, X, Users, Edit2, 
  Eye, EyeOff, Settings, Image as ImageIcon, Upload, Download, 
  Printer, Search, ChevronDown, ChevronRight 
} from 'lucide-react';

// --- 常量配置 ---
const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const PRESET_COLORS = ['#FF6B81', '#FFA502', '#FFD32A', '#2ED573', '#1E90FF', '#9C88FF', '#FF9FF3', '#06b6d4', '#f43f5e'];

// --- 主题配置引擎 ---
const THEMES = {
  classic: {
    id: 'classic', icon: '☁️', name: '清爽蓝白',
    legendIcon: '🐳', cornerIcon: 'img:https://img.icons8.com/fluency/96/clouds.png',
    bg: '#F0F8FF', bgImage: 'radial-gradient(#D3E4F6 3px, transparent 3px)', bgSize: '40px 40px',
    font: '"Nunito", "PingFang SC", sans-serif',
    header: 'bg-white/90 backdrop-blur-md border-b-4 border-blue-100 shadow-sm',
    title: 'text-blue-600', subtitle: 'text-blue-400',
    legendBg: 'bg-white/90 backdrop-blur-md border-b-4 border-blue-100 shadow-sm',
    legendTagActive: 'text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md border-2 border-transparent',
    legendTagInactive: 'text-blue-400 bg-blue-50 border-2 border-blue-100 hover:bg-blue-100',
    container: 'bg-white rounded-[2rem] shadow-xl shadow-blue-100/50 border-4 border-blue-100',
    gridHeaderBg: 'bg-blue-50 border-b-4 border-blue-100',
    dayHeader: 'bg-white mx-1 h-11 rounded-full border-2 border-blue-100 text-blue-500 font-bold text-base flex items-center justify-center',
    timeColBg: 'border-r-4 border-blue-50',
    timeLabel: 'bg-white px-2 h-6 rounded-full text-[11px] font-bold text-blue-500 border-2 border-blue-100 shadow-sm flex items-center justify-center',
    gridCell: 'border-r-2 border-dashed border-blue-100',
    gridRowBorder: 'border-dashed border-blue-100',
    cardBorder: 'border-[2px] border-white', cardRadius: 'rounded-[1.5rem]',
    cardShadow: '0 4px 6px rgba(59,130,246,0.2)', cardShadowHover: '0 8px 15px rgba(59,130,246,0.3)',
    modalBg: 'bg-white rounded-[2rem] shadow-2xl border-4 border-blue-100',
    modalHeader: 'bg-blue-50 border-b-4 border-blue-100 text-blue-600',
    input: 'bg-blue-50/50 border-2 border-blue-200 rounded-full px-4 py-2 focus:border-blue-400 focus:bg-white font-bold text-blue-700',
    textLabel: 'text-blue-600 font-bold',
    radioActive: 'border-blue-400 bg-blue-50 text-blue-600 translate-y-[4px] shadow-none',
    radioInactive: 'border-blue-200 bg-white text-blue-500 shadow-[0_4px_0_#bfdbfe] hover:translate-y-[2px] hover:shadow-[0_2px_0_#bfdbfe] active:translate-y-[4px] active:shadow-none', 
  },
  playful: {
    id: 'playful', icon: '🎈', name: '游乐园',
    legendIcon: '🌟',
    cornerIcon: 'img:https://img.icons8.com/color/96/rainbow.png',
    bg: '#FFF9E6', bgImage: 'radial-gradient(#FDE047 3px, transparent 3px)', bgSize: '40px 40px',
    font: '"Comic Sans MS", "Chalkboard SE", "Comic Neue", "Nunito", sans-serif',
    header: 'bg-white/90 backdrop-blur-md border-b-4 border-white shadow-sm',
    title: 'text-amber-600', subtitle: 'text-amber-500/80',
    legendBg: 'bg-white/90 backdrop-blur-md border-b-4 border-white shadow-sm',
    legendTagActive: 'text-white shadow-[0_3px_0_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:shadow-[0_5px_0_rgba(0,0,0,0.15)] border-2 border-white',
    legendTagInactive: 'text-gray-400 bg-gray-100 border-2 border-gray-200 shadow-none hover:bg-gray-200',
    container: 'bg-white rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.05)] border-4 border-white',
    gridHeaderBg: 'bg-white border-b-4 border-amber-50',
    dayHeader: 'bg-amber-50 mx-1 h-11 rounded-2xl border-2 border-amber-100 text-amber-600 font-black text-lg flex items-center justify-center',
    timeColBg: 'border-r-4 border-amber-50',
    timeLabel: 'bg-white px-2 h-6 rounded-xl text-[11px] font-black text-amber-400 border-2 border-amber-50 shadow-sm flex items-center justify-center',
    gridCell: 'border-r-2 border-dashed border-gray-100',
    gridRowBorder: 'border-dashed border-gray-100',
    cardBorder: 'border-[3px] border-white', cardRadius: 'rounded-[1.2rem]',
    cardShadow: '0 4px 10px rgba(0,0,0,0.1)', cardShadowHover: '0 8px 15px rgba(0,0,0,0.15)',
    modalBg: 'bg-white rounded-[2rem] shadow-2xl border-4 border-white',
    modalHeader: 'bg-amber-50 border-b-2 border-amber-100 text-amber-700',
    input: 'bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-amber-400 focus:bg-white font-bold text-gray-700',
    textLabel: 'text-gray-600 font-black',
    radioActive: 'border-amber-400 bg-amber-50 text-amber-600 translate-y-[4px] shadow-none',
    radioInactive: 'border-gray-300 bg-white text-gray-600 shadow-[0_4px_0_#d1d5db] hover:translate-y-[2px] hover:shadow-[0_2px_0_#d1d5db] active:translate-y-[4px] active:shadow-none',
  },
  hellokitty: {
    id: 'hellokitty', icon: '🎀', name: 'Hello Kitty',
    legendIcon: 'img:https://img.icons8.com/color/96/cherry-blossom.png',
    cornerIcon: 'img:https://img.icons8.com/color/96/hello-kitty.png',
    bg: '#FFF0F5', bgImage: 'radial-gradient(#FFC0CB 3px, transparent 3px)', bgSize: '30px 30px',
    font: '"Nunito", "Quicksand", "PingFang SC", sans-serif',
    header: 'bg-white/80 backdrop-blur-md border-b-4 border-pink-200 shadow-sm',
    title: 'text-pink-500', subtitle: 'text-pink-400',
    legendBg: 'bg-white/80 backdrop-blur-md border-b-4 border-pink-200 shadow-sm',
    legendTagActive: 'text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md border-2 border-transparent',
    legendTagInactive: 'text-pink-400 bg-pink-50 border-2 border-pink-100 hover:bg-pink-100',
    container: 'bg-white rounded-[2rem] shadow-xl shadow-pink-100/50 border-4 border-pink-100',
    gridHeaderBg: 'bg-pink-50 border-b-4 border-pink-100',
    dayHeader: 'bg-white mx-1 h-11 rounded-full border-2 border-pink-100 text-pink-500 font-bold text-base flex items-center justify-center',
    timeColBg: 'border-r-4 border-pink-50',
    timeLabel: 'bg-white px-2 h-6 rounded-full text-[11px] font-bold text-pink-500 border-2 border-pink-100 shadow-sm flex items-center justify-center',
    gridCell: 'border-r-2 border-dashed border-pink-100',
    gridRowBorder: 'border-dashed border-pink-100',
    cardBorder: 'border-[2px] border-white', cardRadius: 'rounded-[1.5rem]',
    cardShadow: '0 4px 6px rgba(244,114,182,0.2)', cardShadowHover: '0 8px 15px rgba(244,114,182,0.3)',
    modalBg: 'bg-white rounded-[2rem] shadow-2xl border-4 border-pink-100',
    modalHeader: 'bg-pink-50 border-b-4 border-pink-100 text-pink-600',
    input: 'bg-pink-50/50 border-2 border-pink-200 rounded-full px-4 py-2 focus:border-pink-400 focus:bg-white font-bold text-pink-700',
    textLabel: 'text-pink-600 font-bold',
    radioActive: 'border-pink-400 bg-pink-50 text-pink-600 translate-y-[4px] shadow-none',
    radioInactive: 'border-pink-200 bg-white text-pink-500 shadow-[0_4px_0_#fbcfe8] hover:translate-y-[2px] hover:shadow-[0_2px_0_#fbcfe8] active:translate-y-[4px] active:shadow-none',
  },
  labubu: {
    id: 'labubu', icon: '🐻', name: 'Labubu',
    legendIcon: 'img:https://img.icons8.com/color/96/teddy-bear.png',
    cornerIcon: 'img:https://img.icons8.com/color/96/bear.png',
    bg: '#FDFBF7', bgImage: 'radial-gradient(#DED6C9 3px, transparent 3px)', bgSize: '30px 30px',
    font: '"Nunito", "Quicksand", "PingFang SC", sans-serif',
    header: 'bg-[#FDFBF7]/90 backdrop-blur-md border-b-4 border-[#DED6C9] shadow-sm',
    title: 'text-[#5C4636]', subtitle: 'text-[#8C6B52]',
    legendBg: 'bg-[#FDFBF7]/90 backdrop-blur-md border-b-4 border-[#DED6C9] shadow-sm',
    legendTagActive: 'text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md border-2 border-transparent',
    legendTagInactive: 'text-[#8C6B52] bg-[#F5F0E6] border-2 border-[#DED6C9] hover:bg-[#EBE3D5]',
    container: 'bg-white rounded-[2rem] shadow-lg shadow-[#8C6B52]/10 border-4 border-[#DED6C9]',
    gridHeaderBg: 'bg-[#F5F0E6] border-b-4 border-[#DED6C9]',
    dayHeader: 'bg-white mx-1 h-11 rounded-full border-2 border-[#DED6C9] text-[#5C4636] font-bold text-base flex items-center justify-center',
    timeColBg: 'border-r-4 border-[#F5F0E6]',
    timeLabel: 'bg-white px-2 h-6 rounded-full text-[11px] font-bold text-[#8C6B52] border-2 border-[#DED6C9] shadow-sm flex items-center justify-center',
    gridCell: 'border-r-2 border-dashed border-[#EBE3D5]',
    gridRowBorder: 'border-dashed border-[#EBE3D5]',
    cardBorder: 'border-[2px] border-[#F5F0E6]', cardRadius: 'rounded-[1.5rem]',
    cardShadow: '0 4px 6px rgba(140,107,82,0.15)', cardShadowHover: '0 8px 15px rgba(140,107,82,0.25)',
    modalBg: 'bg-white rounded-[2rem] shadow-2xl border-4 border-[#DED6C9]',
    modalHeader: 'bg-[#F5F0E6] border-b-4 border-[#DED6C9] text-[#5C4636]',
    input: 'bg-[#F5F0E6]/50 border-2 border-[#DED6C9] rounded-full px-4 py-2 focus:border-[#8C6B52] focus:bg-white font-bold text-[#5C4636]',
    textLabel: 'text-[#5C4636] font-bold',
    radioActive: 'border-[#8C6B52] bg-[#F5F0E6] text-[#5C4636] translate-y-[4px] shadow-none',
    radioInactive: 'border-[#DED6C9] bg-white text-[#8C6B52] shadow-[0_4px_0_#DED6C9] hover:translate-y-[2px] hover:shadow-[0_2px_0_#DED6C9] active:translate-y-[4px] active:shadow-none',
  }
};

const BTN_STYLES = {
  classic: {
    primary: 'bg-blue-500 text-white rounded-full border-2 border-blue-600 shadow-[0_4px_0_#2563eb] hover:translate-y-[2px] hover:shadow-[0_2px_0_#2563eb] active:translate-y-[4px] active:shadow-none font-bold',
    success: 'bg-teal-400 text-white rounded-full border-2 border-teal-500 shadow-[0_4px_0_#0f766e] hover:translate-y-[2px] hover:shadow-[0_2px_0_#0f766e] active:translate-y-[4px] active:shadow-none font-bold',
    danger: 'bg-rose-400 text-white rounded-full border-2 border-rose-500 shadow-[0_4px_0_#be123c] hover:translate-y-[2px] hover:shadow-[0_2px_0_#be123c] active:translate-y-[4px] active:shadow-none font-bold',
    dangerOutline: 'text-red-500 bg-white hover:bg-red-50 border-2 border-red-200 rounded-full font-bold text-sm shadow-[0_4px_0_#fecaca] hover:translate-y-[2px] hover:shadow-[0_2px_0_#fecaca] active:translate-y-[4px] active:shadow-none',
    warning: 'bg-amber-400 text-white rounded-full border-2 border-amber-500 shadow-[0_4px_0_#d97706] hover:translate-y-[2px] hover:shadow-[0_2px_0_#d97706] active:translate-y-[4px] active:shadow-none font-bold',
    cancel: 'bg-blue-50 text-blue-600 rounded-full border-2 border-blue-200 shadow-[0_4px_0_#bfdbfe] hover:translate-y-[2px] hover:shadow-[0_2px_0_#bfdbfe] active:translate-y-[4px] active:shadow-none font-bold',
    icon1: 'bg-white text-blue-500 rounded-full border-2 border-blue-200 shadow-[0_4px_0_#bfdbfe] hover:translate-y-[2px] hover:shadow-[0_2px_0_#bfdbfe] active:translate-y-[4px] active:shadow-none',
    icon2: 'bg-cyan-50 text-cyan-600 rounded-full border-2 border-cyan-200 shadow-[0_4px_0_#a5f3fc] hover:translate-y-[2px] hover:shadow-[0_2px_0_#a5f3fc] active:translate-y-[4px] active:shadow-none font-bold',
  },
  playful: {
    primary: 'bg-blue-500 text-white rounded-2xl border-2 border-blue-600 shadow-[0_4px_0_#2563eb] hover:translate-y-[2px] hover:shadow-[0_2px_0_#2563eb] active:translate-y-[4px] active:shadow-none font-black',
    success: 'bg-green-500 text-white rounded-2xl border-2 border-green-600 shadow-[0_4px_0_#16a34a] hover:translate-y-[2px] hover:shadow-[0_2px_0_#16a34a] active:translate-y-[4px] active:shadow-none font-black',
    danger: 'bg-red-500 text-white rounded-2xl border-2 border-red-600 shadow-[0_4px_0_#dc2626] hover:translate-y-[2px] hover:shadow-[0_2px_0_#dc2626] active:translate-y-[4px] active:shadow-none font-black',
    dangerOutline: 'text-red-500 bg-white hover:bg-red-50 border-2 border-red-200 rounded-2xl font-black text-sm shadow-[0_4px_0_#fecaca] hover:translate-y-[2px] hover:shadow-[0_2px_0_#fecaca] active:translate-y-[4px] active:shadow-none',
    warning: 'bg-amber-400 text-white rounded-2xl border-2 border-amber-500 shadow-[0_4px_0_#d97706] hover:translate-y-[2px] hover:shadow-[0_2px_0_#d97706] active:translate-y-[4px] active:shadow-none font-black',
    cancel: 'bg-gray-100 text-gray-500 border-2 border-gray-300 rounded-2xl font-bold shadow-[0_4px_0_#d1d5db] hover:translate-y-[2px] hover:shadow-[0_2px_0_#d1d5db] active:translate-y-[4px] active:shadow-none',
    icon1: 'bg-amber-100 text-amber-600 rounded-2xl border-2 border-amber-200 shadow-[0_4px_0_#FDE047] hover:translate-y-[2px] hover:shadow-[0_2px_0_#FDE047] active:translate-y-[4px] active:shadow-none',
    icon2: 'bg-green-100 text-green-600 rounded-2xl border-2 border-green-200 shadow-[0_4px_0_#bbf7d0] hover:translate-y-[2px] hover:shadow-[0_2px_0_#bbf7d0] active:translate-y-[4px] active:shadow-none font-bold',
  },
  hellokitty: {
    primary: 'bg-pink-500 text-white rounded-full border-2 border-pink-600 shadow-[0_4px_0_#db2777] hover:translate-y-[2px] hover:shadow-[0_2px_0_#db2777] active:translate-y-[4px] active:shadow-none font-bold',
    success: 'bg-rose-400 text-white rounded-full border-2 border-rose-500 shadow-[0_4px_0_#e11d48] hover:translate-y-[2px] hover:shadow-[0_2px_0_#e11d48] active:translate-y-[4px] active:shadow-none font-bold',
    danger: 'bg-red-400 text-white rounded-full border-2 border-red-500 shadow-[0_4px_0_#dc2626] hover:translate-y-[2px] hover:shadow-[0_2px_0_#dc2626] active:translate-y-[4px] active:shadow-none font-bold',
    dangerOutline: 'text-red-500 bg-white hover:bg-red-50 border-2 border-red-200 rounded-full font-bold text-sm shadow-[0_4px_0_#fecaca] hover:translate-y-[2px] hover:shadow-[0_2px_0_#fecaca] active:translate-y-[4px] active:shadow-none',
    warning: 'bg-pink-500 text-white rounded-full border-2 border-pink-600 shadow-[0_4px_0_#db2777] hover:translate-y-[2px] hover:shadow-[0_2px_0_#db2777] active:translate-y-[4px] active:shadow-none font-bold',
    cancel: 'bg-pink-50 text-pink-600 rounded-full border-2 border-pink-200 shadow-[0_4px_0_#fbcfe8] hover:translate-y-[2px] hover:shadow-[0_2px_0_#fbcfe8] active:translate-y-[4px] active:shadow-none font-bold',
    icon1: 'bg-white text-pink-500 rounded-full border-2 border-pink-200 shadow-[0_4px_0_#fbcfe8] hover:translate-y-[2px] hover:shadow-[0_2px_0_#fbcfe8] active:translate-y-[4px] active:shadow-none',
    icon2: 'bg-rose-50 text-rose-600 rounded-full border-2 border-rose-200 shadow-[0_4px_0_#fecdd3] hover:translate-y-[2px] hover:shadow-[0_2px_0_#fecdd3] active:translate-y-[4px] active:shadow-none font-bold',
  },
  labubu: {
    primary: 'bg-[#8C6B52] text-white rounded-full border-2 border-[#5C4636] shadow-[0_4px_0_#5C4636] hover:translate-y-[2px] hover:shadow-[0_2px_0_#5C4636] active:translate-y-[4px] active:shadow-none font-bold',
    success: 'bg-[#A88B73] text-white rounded-full border-2 border-[#8C6B52] shadow-[0_4px_0_#8C6B52] hover:translate-y-[2px] hover:shadow-[0_2px_0_#8C6B52] active:translate-y-[4px] active:shadow-none font-bold',
    danger: 'bg-[#C27D7D] text-white rounded-full border-2 border-[#A85B5B] shadow-[0_4px_0_#A85B5B] hover:translate-y-[2px] hover:shadow-[0_2px_0_#A85B5B] active:translate-y-[4px] active:shadow-none font-bold',
    dangerOutline: 'text-[#C27D7D] bg-white hover:bg-[#FDFBF7] border-2 border-[#C27D7D] rounded-full font-bold text-sm shadow-[0_4px_0_#DED6C9] hover:translate-y-[2px] hover:shadow-[0_2px_0_#DED6C9] active:translate-y-[4px] active:shadow-none',
    warning: 'bg-[#8C6B52] text-white rounded-full border-2 border-[#5C4636] shadow-[0_4px_0_#5C4636] hover:translate-y-[2px] hover:shadow-[0_2px_0_#5C4636] active:translate-y-[4px] active:shadow-none font-bold',
    cancel: 'bg-[#F5F0E6] text-[#8C6B52] rounded-full border-2 border-[#DED6C9] shadow-[0_4px_0_#DED6C9] hover:translate-y-[2px] hover:shadow-[0_2px_0_#DED6C9] active:translate-y-[4px] active:shadow-none font-bold',
    icon1: 'bg-white text-[#8C6B52] rounded-full border-2 border-[#DED6C9] shadow-[0_4px_0_#DED6C9] hover:translate-y-[2px] hover:shadow-[0_2px_0_#DED6C9] active:translate-y-[4px] active:shadow-none',
    icon2: 'bg-[#F5F0E6] text-[#5C4636] rounded-full border-2 border-[#DED6C9] shadow-[0_4px_0_#DED6C9] hover:translate-y-[2px] hover:shadow-[0_2px_0_#DED6C9] active:translate-y-[4px] active:shadow-none font-bold',
  }
};

// 智能识别图片格式
const isImageItem = (val) => {
  if (!val) return false;
  const str = String(val).trim();
  if (str.startsWith('img:')) return true;
  if (/^https?:\/\//i.test(str) || /^data:image\//i.test(str)) return true;
  if (/\.(png|jpe?g|gif|svg|webp)(\?.*)?$/i.test(str)) return true;
  return false;
};

const getImageUrl = (val) => {
  const str = String(val).trim();
  return str.startsWith('img:') ? str.slice(4) : str;
};

// 格式化时间显示 (支持12/24小时制)
const formatTimeDisplay = (num, format) => {
  let totalMins = Math.round(num * 60);
  let h = Math.floor(totalMins / 60);
  let m = (totalMins % 60).toString().padStart(2, '0');
  
  if (format === '24h') {
    return `${h.toString().padStart(2, '0')}:${m}`;
  } else {
    if (h === 24) return `午夜12点`;
    const period = h < 12 ? '上午' : h === 12 ? '中午' : '下午';
    const displayH = h === 0 ? 12 : (h <= 12 ? h : h - 12);
    if (m === '00') {
      return `${period}${displayH}点`;
    }
    return `${period}${displayH}:${m}`;
  }
};

// 2D 瀑布流合并与碰撞布局算法 (2D Cascading Merge Overlap)
const calculate2DLayout = (blocks) => {
  if (blocks.length === 0) return [];

  // 1. 排序：按开始时间优先，跨越天数大的优先
  blocks.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.spanDays - a.spanDays;
  });

  let columns = []; 
  blocks.forEach(b => {
    let placed = false;
    for (let c = 0; c < columns.length; c++) {
      // 检查在时间和日期上是否与该列的已有块存在二维重叠
      let hasOverlap = columns[c].some(cb =>
        Math.max(b.start, cb.start) < Math.min(b.end, cb.end) &&
        Math.max(b.startDay, cb.startDay) <= Math.min(b.endDay, cb.endDay)
      );
      if (!hasOverlap) {
        columns[c].push(b);
        b.col = c;
        placed = true;
        break;
      }
    }
    if (!placed) {
      b.col = columns.length;
      columns.push([b]);
    }
  });

  // 2. 无向图连通分量：计算互相影响的最大列数 maxCols，保证同行卡片均分不遮挡
  let adjList = Array(blocks.length).fill().map(() => []);
  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      let a = blocks[i], b = blocks[j];
      // 如果二维相交，建立连接
      if (
        Math.max(a.start, b.start) < Math.min(a.end, b.end) &&
        Math.max(a.startDay, b.startDay) <= Math.min(a.endDay, b.endDay)
      ) {
        adjList[i].push(j);
        adjList[j].push(i);
      }
    }
  }

  let visited = Array(blocks.length).fill(false);
  blocks.forEach((b, i) => {
    if (!visited[i]) {
      let comp = [];
      let q = [i];
      visited[i] = true;
      while (q.length > 0) {
        let curr = q.shift();
        comp.push(curr);
        adjList[curr].forEach(n => {
          if (!visited[n]) {
            visited[n] = true;
            q.push(n);
          }
        });
      }
      let maxC = Math.max(...comp.map(idx => blocks[idx].col)) + 1;
      comp.forEach(idx => {
        blocks[idx].maxCols = maxC;
      });
    }
  });

  return blocks;
};

// ============================================================================
// 子组件：单个日程表项 (Schedule Item)
// ============================================================================
const ScheduleItem = ({ schedule, onUpdate, onDelete }) => {
  const { id, isExpanded, settings, users, tasks } = schedule;

  // 获取当前主题对象与按钮样式函数
  const theme = THEMES[settings.theme] || THEMES.classic;
  const getBtn = (type, extra = '') => `flex justify-center items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${BTN_STYLES[theme.id][type]} ${extra}`;

  // 更新父级状态
  const updateData = (updates) => onUpdate(id, updates);

  // 引用
  const gridRef = useRef(null);
  const printWrapperRef = useRef(null);

  const HOURS = useMemo(() => {
    const len = Math.ceil(settings.endHour - settings.startHour) + 1;
    return Array.from({ length: len }, (_, i) => settings.startHour + i);
  }, [settings.startHour, settings.endHour]);

  const FULL_TIME_OPTIONS = useMemo(() => {
    const options = [];
    for (let h = 0; h <= 24; h++) {
      if (h === 24) {
         options.push({ value: 24, label: formatTimeDisplay(24, settings.timeFormat) });
         break;
      }
      for (let m = 0; m < 60; m += 5) {
        const val = h + (m / 60);
        options.push({ value: val, label: formatTimeDisplay(val, settings.timeFormat) });
      }
    }
    return options;
  }, [settings.timeFormat]);

  // 本地模态框状态
  const [taskModal, setTaskModal] = useState({ isOpen: false, mode: 'add', data: null });
  const [userModal, setUserModal] = useState({ isOpen: false, mode: 'add', userId: null });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ isOpen: false, userId: null });
  const [settingsModal, setSettingsModal] = useState({ isOpen: false });

  // 独立表单状态
  const [taskForm, setTaskForm] = useState({ userId: '', days: [0], start: 9, end: 10, title: '' });
  const [userForm, setUserForm] = useState({ name: '', color: '#1E90FF' });
  const [settingsForm, setSettingsForm] = useState({ ...settings });

  // 打印相关状态
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printConfig, setPrintConfig] = useState({ orientation: 'landscape', mode: 'adaptive', scale: 100, rotate: 0, fillBackground: false });
  const [printView, setPrintView] = useState({ viewScale: 1, tx: 0, ty: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDownloading, setIsDownloading] = useState(false);

  // --- 核心渲染层：提取渲染方块逻辑 ---
  const layoutBlocks = useMemo(() => {
    if (!isExpanded) return [];
    let rawBlocks = [];
    tasks.forEach(task => {
      let taskDays = task.days || [task.day || 0];
      if (!taskDays || taskDays.length === 0) return;
      
      const user = users.find(u => u.id === task.userId);
      if (!user || user.visible === false) return;
      if (task.start >= settings.endHour || task.end <= settings.startHour) return;

      let sortedDays = [...taskDays].sort((a,b) => a - b);
      
      let currentBlock = { startDay: sortedDays[0], endDay: sortedDays[0], task: task };
      for (let i = 1; i < sortedDays.length; i++) {
        if (sortedDays[i] === currentBlock.endDay + 1) {
          currentBlock.endDay = sortedDays[i];
        } else {
          rawBlocks.push({ ...currentBlock });
          currentBlock = { startDay: sortedDays[i], endDay: sortedDays[i], task: task };
        }
      }
      rawBlocks.push(currentBlock);
    });

    let blocksForLayout = rawBlocks.map((b, idx) => ({
      id: `${b.task.id}_${idx}`,
      startDay: b.startDay,
      endDay: b.endDay,
      start: b.task.start,
      end: b.task.end,
      task: b.task,
      spanDays: b.endDay - b.startDay + 1
    }));

    return calculate2DLayout(blocksForLayout);
  }, [tasks, users, settings.startHour, settings.endHour, isExpanded]);

  // --- 高级功能操作 ---

  const handleExport = () => {
    // 仅导出当前单个日程表的数据
    const data = { settings, users, tasks };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${settings.name}_备份.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadImage = async () => {
    if (!gridRef.current) return;
    setIsDownloading(true);
    
    if (!window.html2canvas) {
      try {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      } catch (e) {
        alert('无法加载截图引擎，请检查网络连接。');
        setIsDownloading(false);
        return;
      }
    }

    try {
      const clone = gridRef.current.cloneNode(true);
      clone.querySelectorAll('.no-print').forEach(el => el.remove());
      clone.style.position = 'absolute';
      clone.style.top = '-9999px';
      clone.style.left = '0';
      clone.style.width = gridRef.current.scrollWidth + 'px'; 
      clone.style.height = gridRef.current.scrollHeight + 'px';
      clone.style.overflow = 'visible'; 
      clone.style.backgroundColor = theme.bg;
      clone.style.backgroundImage = theme.bgImage;
      clone.style.backgroundSize = theme.bgSize;

      const origNodes = gridRef.current.querySelectorAll('*');
      const cloneNodes = clone.querySelectorAll('*');
      origNodes.forEach((orig, i) => {
        const c = cloneNodes[i];
        if (c) {
          const comp = window.getComputedStyle(orig);
          c.style.fontFamily = comp.fontFamily;
          
          if (orig.tagName.toLowerCase() === 'svg') {
              c.style.width = comp.width;
              c.style.height = comp.height;
          }
        }
      });

      document.body.appendChild(clone);
      
      const canvas = await window.html2canvas(clone, {
        scale: 2, 
        useCORS: true,
        backgroundColor: theme.bg,
        logging: false
      });
      
      document.body.removeChild(clone);

      const link = document.createElement('a');
      link.download = `${settings.name}_图片.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('生成图片失败:', err);
      alert('生成图片失败，请重试！');
    } finally {
      setIsDownloading(false);
    }
  };

  // --- 打印沙盒机制 ---
  useEffect(() => {
    if (printModalOpen && gridRef.current && printWrapperRef.current) {
      printWrapperRef.current.innerHTML = '';
      const clone = gridRef.current.cloneNode(true);
      clone.querySelectorAll('.no-print').forEach(el => el.remove());
      clone.style.overflow = 'visible';
      clone.style.height = 'max-content';
      clone.style.width = 'max-content';
      clone.classList.remove('flex-1');
      clone.style.padding = '2rem';
      
      // 每次重新克隆快照时，为其附上正确的主题点阵背景
      if (printConfig.fillBackground) {
        clone.style.backgroundColor = 'transparent';
        clone.style.backgroundImage = 'none';
      } else {
        clone.style.backgroundColor = theme.bg;
        clone.style.backgroundImage = theme.bgImage;
        clone.style.backgroundSize = theme.bgSize;
      }
      
      const origNodes = gridRef.current.querySelectorAll('*');
      const clonedNodes = clone.querySelectorAll('*');
      origNodes.forEach((orig, idx) => {
          const c = clonedNodes[idx];
          if (c) {
              const comp = window.getComputedStyle(orig);
              c.dataset.origFs = comp.fontSize; 
              if (orig.tagName.toLowerCase() === 'svg') {
                  c.dataset.origW = comp.width;
                  c.dataset.origH = comp.height;
              }
          }
      });

      printWrapperRef.current.appendChild(clone);

      if (printConfig.mode === 'adaptive') {
        const CW = clone.scrollWidth;
        const CH = clone.scrollHeight;
        const PW = printConfig.orientation === 'landscape' ? 1122 : 793;
        const PH = printConfig.orientation === 'landscape' ? 793 : 1122;
        if (CW > 0 && CH > 0) {
            const s = Math.min(PW / CW, PH / CH) * 98; 
            setPrintConfig(prev => ({...prev, scale: Math.floor(s)}));
            setPrintView(prev => ({...prev, tx: 0, ty: 0}));
        }
      }
    }
  }, [printModalOpen, printConfig.orientation, printConfig.mode]);

  useEffect(() => {
    const clone = printWrapperRef.current?.firstChild;
    if (clone) {
      if (printConfig.fillBackground) {
        clone.style.backgroundColor = 'transparent';
        clone.style.backgroundImage = 'none';
      } else {
        clone.style.backgroundColor = theme.bg;
        clone.style.backgroundImage = theme.bgImage;
        clone.style.backgroundSize = theme.bgSize;
      }
    }
  }, [printConfig.fillBackground, theme]); 

  useEffect(() => {
    if (!printWrapperRef.current) return;
    const s = printConfig.scale / 100;
    const fontScale = s < 1 ? Math.min(1.8, 1 / Math.pow(s, 0.65)) : 1;
    
    const textNodes = printWrapperRef.current.querySelectorAll('*[data-orig-fs]');
    textNodes.forEach(node => {
        const fs = parseFloat(node.dataset.origFs);
        if (!isNaN(fs) && fs > 0) node.style.fontSize = `${fs * fontScale}px`;
        if (node.tagName.toLowerCase() === 'svg') {
            const w = parseFloat(node.dataset.origW);
            const h = parseFloat(node.dataset.origH);
            if (!isNaN(w) && !isNaN(h)) {
                node.style.width = `${w * fontScale}px`;
                node.style.height = `${h * fontScale}px`;
            }
        }
    });
  }, [printConfig.scale, printModalOpen]);

  const handlePrintDragStart = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - printView.tx, y: e.clientY - printView.ty });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
        if (isDragging) {
            setPrintView(prev => ({...prev, tx: e.clientX - dragStart.x, ty: e.clientY - dragStart.y}));
        }
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handlePrintConfigChange = (key, value) => {
    setPrintConfig(prev => ({ ...prev, [key]: value, mode: key === 'scale' ? 'original' : prev.mode }));
  };

  const executePrint = () => {
    const style = document.createElement('style');
    style.id = 'dynamic-print-style';
    const isLand = printConfig.orientation === 'landscape';
    const s = printConfig.scale / 100;
    const tx = printView.tx;
    const ty = printView.ty;
    const r = printConfig.rotate;
    
    const bgCss = printConfig.fillBackground ? `
        body, #print-page-outline-${id} {
            background-color: ${theme.bg} !important;
            background-image: ${theme.bgImage} !important;
            background-size: ${theme.bgSize} !important;
        }
    ` : `
        body { background-color: white !important; background-image: none !important; }
    `;
    
    style.innerHTML = `
      @page { size: ${isLand ? 'landscape' : 'portrait'}; margin: 0; }
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
            width: auto !important;
            height: auto !important;
        }
        
        #print-content-wrapper-${id} {
            transform: translate(${tx}px, ${ty}px) scale(${s}) rotate(${r}deg) !important;
            transform-origin: top left !important;
        }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
        try { window.print(); } catch(e) {}
        setTimeout(() => document.head.removeChild(style), 1000);
    }, 100);
  };

  // --- 常规操作函数 ---
  const openAddTask = () => {
    setTaskForm({ userId: users[0]?.id || '', days: [0], start: settings.startHour, end: settings.startHour + 1, title: '' });
    setTaskModal({ isOpen: true, mode: 'add', data: null });
  };
  const openEditTask = (task) => {
    setTaskForm({ ...task, days: task.days || [task.day || 0] });
    setTaskModal({ isOpen: true, mode: 'edit', data: task });
  };
  const saveTask = () => {
    if (!taskForm.title.trim() || !taskForm.userId || taskForm.end <= taskForm.start) return;
    if (!taskForm.days || taskForm.days.length === 0) return alert("请至少勾选一个星期！");

    if (taskModal.mode === 'add') {
      updateData({ tasks: [...tasks, { ...taskForm, id: Date.now().toString() }] });
    } else {
      updateData({ tasks: tasks.map(t => t.id === taskForm.id ? taskForm : t) });
    }
    setTaskModal({ isOpen: false, mode: 'add', data: null });
  };
  const deleteTask = () => {
    updateData({ tasks: tasks.filter(t => t.id !== taskForm.id) });
    setTaskModal({ isOpen: false, mode: 'add', data: null });
  };

  const handleDayToggle = (dayIdx, isChecked) => {
    if (isChecked) {
      setTaskForm(prev => ({ ...prev, days: [...prev.days, dayIdx].sort((a,b)=>a-b) }));
    } else {
      setTaskForm(prev => ({ ...prev, days: prev.days.filter(d => d !== dayIdx) }));
    }
  };

  const openAddUser = () => {
    setUserForm({ name: '', color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)] });
    setUserModal({ isOpen: true, mode: 'add', userId: null });
  };
  const openEditUser = (user) => {
    setUserForm({ name: user.name, color: user.color });
    setUserModal({ isOpen: true, mode: 'edit', userId: user.id });
  };
  const toggleVisibility = (userId) => {
    updateData({ users: users.map(u => u.id === userId ? { ...u, visible: u.visible === false ? true : false } : u) });
  };
  const saveUser = () => {
    if (!userForm.name.trim()) return;
    if (userModal.mode === 'add') {
      updateData({ users: [...users, { id: Date.now().toString(), name: userForm.name, color: userForm.color, visible: true }] });
    } else {
      updateData({ users: users.map(u => u.id === userModal.userId ? { ...u, name: userForm.name, color: userForm.color } : u) });
    }
    setUserModal({ isOpen: false, mode: 'add', userId: null });
    setUserForm({ name: '', color: '#1E90FF' });
  };
  const confirmDeleteUser = (userId) => {
    setDeleteConfirmModal({ isOpen: true, userId });
  };
  const executeDeleteUser = () => {
    const userId = deleteConfirmModal.userId;
    if (userId) {
      updateData({
         users: users.filter(u => u.id !== userId),
         tasks: tasks.filter(t => t.userId !== userId)
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

  // 生成主题的角标
  const cornerIconHTML = useMemo(() => {
    if (isImageItem(theme.cornerIcon)) {
      return (
        <img 
          src={getImageUrl(theme.cornerIcon)} 
          alt="Corner Theme" 
          className="w-12 h-12 object-contain drop-shadow-md hover:scale-110 transition-transform duration-300" 
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://img.icons8.com/color/96/sun.png'; }}
        />
      );
    }
    return <span className="text-4xl drop-shadow-md hover:scale-110 transition-transform duration-300">{theme.cornerIcon}</span>;
  }, [theme.cornerIcon]);

  return (
    <div 
      className="relative rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-black/5 transition-all duration-500 flex flex-col"
      style={{
        backgroundColor: theme.bg,
        backgroundImage: theme.bgImage, 
        backgroundSize: theme.bgSize,
        fontFamily: theme.font,
        maxHeight: isExpanded ? 'none' : 'auto'
      }}
    >
      {/* 日程表专属导航栏 */}
      <header className={`${theme.header} px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-30 transition-all`}>
        <div className="flex items-center gap-3">
          <button 
             onClick={() => updateData({ isExpanded: !isExpanded })} 
             className="p-1.5 hover:bg-black/10 rounded-xl transition-colors active:scale-95"
             title={isExpanded ? "收起日程表" : "展开日程表"}
          >
             {isExpanded ? <ChevronDown size={24} className="text-gray-600" /> : <ChevronRight size={24} className="text-gray-600" />}
          </button>
          
          <h1 className={`text-2xl sm:text-3xl font-black ${theme.title} flex items-center gap-3 drop-shadow-sm`}>
            {settings.name}
            {!isExpanded && <span className="text-sm font-bold opacity-60 ml-2">包含 {tasks.length} 个任务</span>}
          </h1>
        </div>

        {/* 收起时隐藏交互按钮，仅展开时可用 */}
        {isExpanded && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-2 mr-2 no-print">
              <button onClick={handleDownloadImage} disabled={isDownloading} className={getBtn('icon1', 'p-2.5')} title="下载为图片">
                <ImageIcon size={18} strokeWidth={2.5} className={isDownloading ? "animate-pulse opacity-50" : ""} />
              </button>
              <button onClick={handleExport} className={getBtn('icon1', 'p-2.5')} title="导出当前日程数据">
                <Download size={18} strokeWidth={2.5} />
              </button>
              <button onClick={() => setPrintModalOpen(true)} className={getBtn('icon1', 'p-2.5')} title="高级打印预览">
                <Printer size={18} strokeWidth={2.5} />
              </button>
              <button onClick={() => { if(window.confirm(`确定要删除【${settings.name}】吗？此操作不可恢复。`)) onDelete(id); }} className={getBtn('dangerOutline', 'p-2.5 ml-2')} title="删除整个日程表">
                <Trash2 size={18} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="h-8 w-0.5 bg-gray-200/50 mx-1 no-print"></div>
            
            <button onClick={openSettings} className={getBtn('icon1', 'p-2.5')} title="主题与设置">
              <Settings size={20} strokeWidth={2.5} />
            </button>
            <button onClick={openAddUser} className={getBtn('icon2', 'px-4 py-2.5 gap-2 text-sm')}>
              <UserPlus size={16} strokeWidth={2.5} />
              加成员
            </button>
            <button onClick={openAddTask} className={getBtn('primary', 'px-5 py-2.5 gap-2 text-base')}>
              <Plus size={18} strokeWidth={3} />
              新任务
            </button>
          </div>
        )}
      </header>

      {/* 以下为展开后的主体内容 */}
      {isExpanded && (
        <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-top-4 duration-300">
          {/* 成员图例栏 */}
          <div className={`${theme.legendBg} px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap gap-3 items-center z-20 transition-all`}>
            {users.map(user => {
              return (
                <div 
                  key={user.id} 
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-black group transition-all cursor-pointer ${theme.cardRadius}
                    ${user.visible !== false ? theme.legendTagActive : theme.legendTagInactive}`}
                  style={user.visible !== false ? { backgroundColor: user.color } : {}}
                >
                  <button onClick={() => toggleVisibility(user.id)} className="flex items-center gap-1.5" title="点击切换显示状态">
                    {user.visible !== false ? <Eye size={16} strokeWidth={3} /> : <EyeOff size={16} strokeWidth={3} />}
                    {user.name}
                  </button>
                  
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-2 gap-1 bg-black/10 rounded-xl px-1 no-print">
                    <button onClick={() => openEditUser(user)} className={`p-1 rounded-lg hover:bg-black/20 transition-colors ${user.visible !== false ? 'text-white' : 'text-gray-500'}`} title="编辑成员">
                      <Edit2 size={14} strokeWidth={3} />
                    </button>
                    <button onClick={() => confirmDeleteUser(user.id)} className={`p-1 rounded-lg hover:bg-black/20 transition-colors ${user.visible !== false ? 'text-white' : 'text-gray-500'}`} title="删除成员">
                      <X size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              );
            })}
            {users.length === 0 && <span className="text-sm font-bold text-gray-400 bg-white/50 px-3 py-1.5 rounded-xl">快来添加小伙伴吧 👉</span>}
          </div>

          {/* 主网格区域 */}
          <main id={`schedule-grid-target-${id}`} ref={gridRef} className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative w-full">
            <div className={`${theme.container} overflow-hidden min-w-[1000px] transition-all relative z-10`}>
              {/* 表头 (星期) */}
              <div className={`flex ${theme.gridHeaderBg}`}>
                <div className="w-24 flex-shrink-0 flex items-center justify-center">
                  {cornerIconHTML}
                </div>
                {DAYS.map((day) => (
                  <div key={day} className="flex-1 py-4 text-center px-1">
                    <div className={`${theme.dayHeader} w-full`}>
                      <span className="translate-y-[0.5px]">{day}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 表格主体 */}
              <div className="flex relative">
                {/* 左侧时间轴 */}
                <div className={`w-24 flex-shrink-0 flex flex-col ${theme.timeColBg}`}>
                  {HOURS.map(hour => (
                    <div key={hour} className="h-[72px] relative flex justify-center">
                      <span className={`absolute top-0 -translate-y-1/2 z-10 ${theme.timeLabel} whitespace-nowrap`}>
                        <span className="translate-y-[0.5px]">{formatTimeDisplay(hour, settings.timeFormat)}</span>
                      </span>
                    </div>
                  ))}
                </div>

                {/* 空白星期网格 (底层骨架) */}
                {DAYS.map((day) => (
                  <div key={day} className={`flex-1 relative last:border-r-0 ${theme.gridCell}`}>
                    {HOURS.map(hour => (
                      <div key={hour} className={`h-[72px] w-full box-border border-b-2 last:border-b-0 ${theme.gridRowBorder}`} />
                    ))}
                  </div>
                ))}

                {/* 核心渲染：全局浮窗渲染所有计算好的连续任务合并方块 */}
                <div className="absolute top-0 bottom-0 right-0 left-24 pointer-events-none z-10">
                    {layoutBlocks.map(block => {
                      const user = users.find(u => u.id === block.task.userId);
                      if (!user) return null;

                      const visibleStart = Math.max(block.start, settings.startHour);
                      const visibleEnd = Math.min(block.end, settings.endHour);

                      const top = (visibleStart - settings.startHour) * 72;
                      const height = (visibleEnd - visibleStart) * 72;
                      
                      const maxCols = block.maxCols;
                      const col = block.col;

                      const maxShiftPercent = 45; 
                      const shiftPerCol = maxCols > 1 ? Math.min(12, maxShiftPercent / (maxCols - 1)) : 0;
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
                          onClick={() => openEditTask(block.task)}
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
                            e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)';
                            e.currentTarget.style.boxShadow = theme.cardShadowHover;
                            e.currentTarget.style.zIndex = 100;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = theme.cardShadow;
                            e.currentTarget.style.zIndex = 10 + col;
                          }}
                        >
                          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-15 transition-opacity z-[1]" /> 
                          
                          <div className={`h-full overflow-hidden flex flex-col relative z-10 ${isShort ? 'p-1.5' : 'p-2.5'}`}>
                            <div className={`${isShort ? 'text-xs' : 'text-sm'} font-black leading-tight break-words drop-shadow-sm flex-none`}>
                              {block.task.title}
                            </div>
                            {height >= 45 && (
                              <div className="mt-1.5 text-[10px] font-bold opacity-90 drop-shadow-sm bg-black/10 inline-flex items-center justify-center h-5 px-1.5 rounded-md w-max whitespace-nowrap flex-none gap-1">
                                <Clock size={10} strokeWidth={3} />
                                <span className="translate-y-[0.5px]">
                                  {formatTimeDisplay(block.task.start, settings.timeFormat)} - {formatTimeDisplay(block.task.end, settings.timeFormat)}
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

      {/* --- 模态框组件组 --- */}
      
      {/* 1. 打印预览全屏沙盒抽屉 */}
      {printModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex">
          {/* 左侧拖放预览区 */}
          <div 
            className={`flex-1 h-full overflow-hidden bg-gray-200/80 bg-[radial-gradient(#ccc_1px,transparent_1px)] [background-size:20px_20px] relative select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handlePrintDragStart}
            onWheel={(e) => setPrintView(p => ({...p, viewScale: Math.max(0.1, Math.min(3, p.viewScale + (e.deltaY > 0 ? -0.05 : 0.05)))}))}
          >
             {/* 交互提示 - 移至顶部中间 */}
             <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg pointer-events-none z-50">
                 提示：在网格区域按住鼠标任意拖拽，或滚动滚轮缩放画布
             </div>

             {/* 虚拟打印纸张边界 */}
             <div 
               id={`print-page-outline-${id}`}
               className="absolute bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden origin-center pointer-events-none border border-black/5"
               style={{
                  width: printConfig.orientation === 'landscape' ? 1122 : 793,
                  height: printConfig.orientation === 'landscape' ? 793 : 1122,
                  top: '50%', left: '50%',
                  transform: `translate(-50%, -50%) scale(${printView.viewScale})`,
                  backgroundColor: printConfig.fillBackground ? theme.bg : 'white',
                  backgroundImage: printConfig.fillBackground ? theme.bgImage : 'none',
                  backgroundSize: printConfig.fillBackground ? theme.bgSize : 'auto'
               }}
             >
                {/* 克隆节点挂载容器 (包含位移缩放旋转属性) */}
                <div 
                  id={`print-content-wrapper-${id}`}
                  ref={printWrapperRef} 
                  className="origin-top-left absolute left-0 top-0 w-full h-full pointer-events-none"
                  style={{ transform: `translate(${printView.tx}px, ${printView.ty}px) scale(${printConfig.scale / 100}) rotate(${printConfig.rotate}deg)` }}
                />
             </div>
             
             {/* 缩放控制器 - 保持在右下角 */}
             <div className="absolute right-8 bottom-8 flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-2 rounded-full shadow-xl border border-gray-200 pointer-events-auto z-50">
                <span className="text-xs font-bold text-gray-500 mr-2 hidden sm:inline">视图缩放</span>
                <button onClick={() => setPrintView(p => ({...p, viewScale: Math.max(0.1, p.viewScale - 0.1)}))} className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full font-black text-gray-600 transition-colors text-lg pb-0.5">-</button>
                <span className="text-sm font-black text-gray-700 w-12 text-center select-text">{Math.round(printView.viewScale * 100)}%</span>
                <button onClick={() => setPrintView(p => ({...p, viewScale: Math.min(3, p.viewScale + 0.1)}))} className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full font-black text-gray-600 transition-colors text-lg pb-0.5">+</button>
             </div>
          </div>

          {/* 右侧抽屉配置区 */}
          <div className="w-80 bg-white h-full p-6 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-10 overflow-y-auto print-sidebar shrink-0 border-l border-gray-200">
            <h2 className="text-2xl font-black mb-6 text-gray-800 flex items-center gap-2">
              <Printer size={24} strokeWidth={3} className="text-blue-500" />
              高级打印沙盒
            </h2>
            
            <div className="mb-5">
              <label className="font-bold block mb-2 text-sm text-gray-600">纸张方向</label>
              <select value={printConfig.orientation} onChange={e => handlePrintConfigChange('orientation', e.target.value)} className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl font-bold cursor-pointer outline-none focus:border-blue-400">
                <option value="landscape">横向排版 (Landscape)</option>
                <option value="portrait">纵向排版 (Portrait)</option>
              </select>
            </div>
            
            <div className="mb-5">
              <label className="font-bold block mb-2 text-sm text-gray-600">内容显示方式</label>
              <select value={printConfig.mode} onChange={e => handlePrintConfigChange('mode', e.target.value)} className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl font-bold cursor-pointer outline-none focus:border-blue-400">
                <option value="adaptive">智能自适应铺满 (推荐)</option>
                <option value="original">保留网格原始尺寸</option>
              </select>
            </div>
            
            <div className="mb-5">
              <label className="font-bold block mb-2 text-sm text-gray-600">内容排版缩放 (%)</label>
              <input type="number" value={printConfig.scale} onChange={e => handlePrintConfigChange('scale', Number(e.target.value) || 100)} className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl font-bold outline-none focus:border-blue-400" />
            </div>
            
            <div className="mb-8">
              <label className="font-bold block mb-2 text-sm text-gray-600">页面旋转校正 (度)</label>
              <input type="number" step="90" value={printConfig.rotate} onChange={e => handlePrintConfigChange('rotate', Number(e.target.value) || 0)} className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl font-bold outline-none focus:border-blue-400" />
            </div>

            <div className="mb-8 flex items-center justify-between bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
              <label className="font-bold text-sm text-gray-700 cursor-pointer select-none flex flex-col" htmlFor={`print-bg-fill-${id}`}>
                  背景铺满整页纸
                  <span className="text-xs font-normal text-gray-500 mt-1">将当前主题底色延伸至边缘</span>
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id={`print-bg-fill-${id}`} checked={printConfig.fillBackground} onChange={e => handlePrintConfigChange('fillBackground', e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
            
            <div className="mt-auto flex gap-3 pt-4 border-t-2 border-gray-100">
              <button onClick={() => setPrintModalOpen(false)} className="flex-1 py-3 bg-white text-gray-500 border-2 border-gray-200 rounded-xl font-bold shadow-[0_4px_0_#e5e7eb] hover:translate-y-[2px] hover:shadow-[0_2px_0_#e5e7eb] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-1">关闭</button>
              <button onClick={executePrint} className="flex-1 py-3 bg-blue-500 text-white border-2 border-blue-600 rounded-xl font-bold shadow-[0_4px_0_#2563eb] hover:translate-y-[2px] hover:shadow-[0_2px_0_#2563eb] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-1">确认打印</button>
            </div>
          </div>
        </div>
      )}


      {/* 2. 模态框：全局设置 */}
      {settingsModal.isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${theme.modalBg} w-full max-w-md overflow-hidden transform transition-all`}>
            <div className={`px-6 py-5 flex justify-between items-center ${theme.modalHeader}`}>
              <h2 className="text-xl font-black flex items-center gap-2">
                <Settings size={22} strokeWidth={3}/> 日程表设置
              </h2>
              <button onClick={() => setSettingsModal({ isOpen: false })} className="hover:opacity-70 bg-white/50 p-1 rounded-full shadow-sm">
                <X size={20} strokeWidth={3} />
              </button>
            </div>
            
            <div className="p-6 space-y-5 bg-white/50">
              {/* 主题选择器 */}
              <div>
                <label className={`block text-sm mb-3 ${theme.textLabel}`}>主题风格 🎨</label>
                <div className="flex gap-3">
                  {Object.values(THEMES).map(t => {
                     const isImg = isImageItem(t.cornerIcon);
                     const src = getImageUrl(t.cornerIcon);
                     const iconHTML = isImg 
                       ? <img src={src} className="max-w-full max-h-full object-contain drop-shadow-sm" onError={(e) => { e.target.onerror = null; e.target.style.opacity = 0; }} />
                       : <span className="text-2xl drop-shadow-sm leading-none">{t.cornerIcon || ''}</span>;
                     
                     return (
                        <button
                          key={t.id}
                          onClick={() => setSettingsForm({...settingsForm, theme: t.id})}
                          className={`flex-1 py-3 border-2 flex flex-col items-center gap-1 transition-all ${theme.cardRadius} ${
                            settingsForm.theme === t.id ? theme.radioActive : theme.radioInactive
                          }`}
                        >
                          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">{iconHTML}</div>
                          <span className="font-bold text-sm">{t.name}</span>
                        </button>
                     )
                  })}
                </div>
              </div>

              <div>
                <label className={`block text-sm mb-2 ${theme.textLabel}`}>日程表大名 ✏️</label>
                <input 
                  type="text" 
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm({...settingsForm, name: e.target.value})}
                  className={`w-full px-4 py-3 outline-none transition-colors ${theme.input}`}
                />
              </div>

              <div>
                <label className={`block text-sm mb-3 ${theme.textLabel}`}>时间显示魔法 ⏰</label>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center justify-center gap-2 py-3 border-2 cursor-pointer font-bold transition-all ${theme.cardRadius} ${settingsForm.timeFormat === '12h' ? theme.radioActive : theme.radioInactive}`}>
                    <input type="radio" value="12h" className="hidden" checked={settingsForm.timeFormat === '12h'} onChange={() => setSettingsForm({...settingsForm, timeFormat: '12h'})} />
                    下午 2:00
                  </label>
                  <label className={`flex-1 flex items-center justify-center gap-2 py-3 border-2 cursor-pointer font-bold transition-all ${theme.cardRadius} ${settingsForm.timeFormat === '24h' ? theme.radioActive : theme.radioInactive}`}>
                    <input type="radio" value="24h" className="hidden" checked={settingsForm.timeFormat === '24h'} onChange={() => setSettingsForm({...settingsForm, timeFormat: '24h'})} />
                    14:00
                  </label>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={`block text-sm mb-2 ${theme.textLabel}`}>开始时间</label>
                  <select 
                    value={settingsForm.startHour}
                    onChange={(e) => setSettingsForm(prev => ({...prev, startHour: Number(e.target.value)}))}
                    className={`w-full px-4 py-3 outline-none cursor-pointer ${theme.input}`}
                  >
                    {FULL_TIME_OPTIONS.filter(opt => opt.value < settingsForm.endHour).map(opt => (
                      <option key={opt.value} value={opt.value}>{formatTimeDisplay(opt.value, settingsForm.timeFormat)}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className={`block text-sm mb-2 ${theme.textLabel}`}>结束时间</label>
                  <select 
                    value={settingsForm.endHour}
                    onChange={(e) => setSettingsForm(prev => ({...prev, endHour: Number(e.target.value)}))}
                    className={`w-full px-4 py-3 outline-none cursor-pointer ${theme.input}`}
                  >
                    {FULL_TIME_OPTIONS.filter(opt => opt.value > settingsForm.startHour).map(opt => (
                      <option key={opt.value} value={opt.value}>{formatTimeDisplay(opt.value, settingsForm.timeFormat)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 bg-white/50 flex justify-end gap-4 border-t-2 border-black/5">
              <button onClick={() => setSettingsModal({ isOpen: false })} className={getBtn('cancel', 'px-6 py-3')}>
                取消
              </button>
              <button onClick={saveSettings} className={getBtn('warning', 'px-8 py-3 text-lg')}>
                保存魔法 ✨
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. 模态框：添加/编辑任务 */}
      {taskModal.isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${theme.modalBg} w-full max-w-md overflow-hidden`}>
            <div className={`px-6 py-5 flex justify-between items-center ${theme.modalHeader}`}>
              <h2 className="text-xl font-black flex items-center gap-2">
                {taskModal.mode === 'add' ? '📝 新建好玩的任务' : '✏️ 修改任务'}
              </h2>
              <button onClick={() => setTaskModal({ isOpen: false, data: null })} className="hover:opacity-70 bg-white/50 p-1 rounded-full shadow-sm">
                <X size={20} strokeWidth={3} />
              </button>
            </div>
            
            <div className="p-6 space-y-5 bg-white/50">
              <div>
                <label className={`block text-sm mb-2 ${theme.textLabel}`}>要做什么事情呢？</label>
                <input 
                  type="text" 
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  className={`w-full px-4 py-3 outline-none ${theme.input}`}
                  placeholder="比如：去公园玩滑梯..."
                />
              </div>
              
              <div>
                <label className={`block text-sm mb-2 ${theme.textLabel}`}>这是谁的任务？ 👦👧</label>
                <select 
                  value={taskForm.userId}
                  onChange={(e) => setTaskForm({...taskForm, userId: e.target.value})}
                  className={`w-full px-4 py-3 outline-none cursor-pointer ${theme.input}`}
                >
                  {users.length === 0 && <option value="">请先添加成员</option>}
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>

              <div>
                <label className={`block text-sm mb-2 ${theme.textLabel}`}>星期几？ 📅 (可多选以合并卡片)</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day, idx) => (
                    <label key={idx} className={`flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-xl border transition-colors shadow-sm ${taskForm.days.includes(idx) ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input 
                        type="checkbox" 
                        checked={taskForm.days.includes(idx)}
                        onChange={(e) => handleDayToggle(idx, e.target.checked)}
                        className="w-4 h-4 rounded text-blue-500" 
                      />
                      <span className={`text-sm font-bold ${taskForm.days.includes(idx) ? 'text-blue-600' : 'text-gray-700'}`}>{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={`block text-sm mb-2 ${theme.textLabel}`}>开始时间</label>
                  <select 
                    value={taskForm.start}
                    onChange={(e) => setTaskForm({...taskForm, start: Number(e.target.value)})}
                    className={`w-full px-4 py-3 outline-none cursor-pointer ${theme.input}`}
                  >
                    {FULL_TIME_OPTIONS.filter(opt => opt.value < taskForm.end).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className={`block text-sm mb-2 ${theme.textLabel}`}>结束时间</label>
                  <select 
                    value={taskForm.end}
                    onChange={(e) => setTaskForm({...taskForm, end: Number(e.target.value)})}
                    className={`w-full px-4 py-3 outline-none cursor-pointer ${theme.input}`}
                  >
                    {FULL_TIME_OPTIONS.filter(opt => opt.value > taskForm.start).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 bg-white flex justify-between items-center border-t-2 border-black/5">
              {taskModal.mode === 'edit' ? (
                <button onClick={deleteTask} className={getBtn('dangerOutline', 'px-3 py-2 gap-1')}>
                  <Trash2 size={16} strokeWidth={3} /> 删除任务
                </button>
              ) : <div></div>}
              
              <div className="flex gap-3">
                <button onClick={() => setTaskModal({ isOpen: false, data: null })} className={getBtn('cancel', 'px-5 py-2.5')}>
                  取消
                </button>
                <button onClick={saveTask} disabled={!taskForm.title.trim() || !taskForm.userId || taskForm.days.length === 0} className={getBtn('primary', 'px-6 py-2.5')}>
                  保存记录 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. 模态框：添加/编辑用户 */}
      {userModal.isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${theme.modalBg} w-full max-w-md overflow-hidden`}>
            <div className={`px-6 py-5 flex justify-between items-center ${theme.modalHeader}`}>
              <h2 className="text-xl font-black flex items-center gap-2">
                {userModal.mode === 'add' ? '🐣 迎接新伙伴' : '🎨 给伙伴换装'}
              </h2>
              <button onClick={() => setUserModal({ isOpen: false, mode: 'add', userId: null })} className="hover:opacity-70 bg-white/50 p-1 rounded-full shadow-sm">
                <X size={20} strokeWidth={3} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 bg-white/50">
              <div>
                <label className={`block text-sm mb-2 ${theme.textLabel}`}>小伙伴的名字 🏷️</label>
                <input 
                  type="text" 
                  value={userForm.name}
                  onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                  className={`w-full px-4 py-3 outline-none ${theme.input}`}
                  placeholder="比如：爷爷、奶奶、小花..."
                />
              </div>
              
              <div>
                <label className={`block text-sm mb-3 ${theme.textLabel}`}>挑选一个幸运色 🌈</label>
                <div className="flex items-center gap-4 bg-white/60 p-4 rounded-2xl border border-black/10">
                  <div className="relative cursor-pointer">
                    <input
                      type="color"
                      value={userForm.color}
                      onChange={(e) => setUserForm({...userForm, color: e.target.value})}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                    <div className="w-12 h-12 rounded-full border-4 shadow-sm flex items-center justify-center text-white font-bold" style={{ backgroundColor: userForm.color, borderColor: 'white' }}>
                      <Edit2 size={16} strokeWidth={3} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2.5 border-l-2 pl-4 border-black/10">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setUserForm({...userForm, color: c})}
                        className={`w-8 h-8 rounded-full border-2 transition-all shadow-sm
                          ${userForm.color === c ? 'border-white scale-125 ring-2 ring-blue-400' : 'border-transparent opacity-80 hover:opacity-100 hover:scale-110'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 bg-white flex justify-end gap-3 border-t-2 border-black/5">
              <button onClick={() => setUserModal({ isOpen: false, mode: 'add', userId: null })} className={getBtn('cancel', 'px-5 py-2.5')}>
                取消
              </button>
              <button onClick={saveUser} disabled={!userForm.name.trim()} className={getBtn('success', 'px-6 py-2.5')}>
                {userModal.mode === 'add' ? '欢迎加入 🎉' : '保存修改 🎊'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. 删除确认模态框 */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${theme.modalBg} w-full max-w-sm overflow-hidden`}>
            <div className={`px-6 py-5 flex justify-center items-center ${theme.modalHeader}`}>
              <h2 className="text-xl font-black flex items-center gap-2">
                😲 哎呀！确定要删除吗？
              </h2>
            </div>
            <div className="p-6 text-center bg-white/50">
              <p className="text-gray-600 font-bold leading-relaxed text-base">
                真的要让这个小伙伴离开吗？<br/>TA 的所有日程都会消失不见，而且不能反悔哦！
              </p>
            </div>
            <div className="px-6 py-5 bg-white flex justify-center gap-4 border-t-2 border-black/5">
              <button onClick={() => setDeleteConfirmModal({ isOpen: false, userId: null })} className={getBtn('cancel', 'px-6 py-2.5')}>
                我点错了
              </button>
              <button onClick={executeDeleteUser} className={getBtn('danger', 'px-6 py-2.5')}>
                忍痛删除 💔
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// ============================================================================
// 根级组件：全局工作台 (App Workbench)
// ============================================================================
export default function App() {
  const [schedules, setSchedules] = useState([
    {
      id: 's1',
      isExpanded: true,
      settings: { name: '家庭大计划', timeFormat: '12h', startHour: 8, endHour: 22, theme: 'classic' },
      users: [
        { id: 'u1', name: '爸爸', color: '#1E90FF', visible: true },
        { id: 'u2', name: '妈妈', color: '#FF6B81', visible: true },
        { id: 'u3', name: '宝宝', color: '#FFD32A', visible: true },
      ],
      tasks: [
        { id: 't1', userId: 'u1', days: [0, 1], start: 9, end: 11, title: '工作💻' },
        { id: 't3', userId: 'u2', days: [0, 2], start: 10, end: 11.5, title: '瑜伽课🧘‍♀️' },
        { id: 't5', userId: 'u3', days: [0, 1, 2, 3, 4], start: 8.5, end: 15, title: '开心幼儿园🎨' },
      ]
    }
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  // 1. 全局导入
  const handleGlobalImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (Array.isArray(data)) {
           const imported = data.map(sch => ({ ...sch, id: 's_' + Date.now() + Math.random(), isExpanded: false }));
           setSchedules(prev => [...imported, ...prev]);
           alert('🎉 成功导入多个日程表！');
        } else if (data.settings && data.users && data.tasks) {
           // 兼容以前版本导出的单个日程表
           const newSch = { ...data, id: 's_' + Date.now(), isExpanded: true };
           setSchedules(prev => [newSch, ...prev]);
           alert('🎉 日程表导入成功！');
        } else {
           alert('⚠️ 数据格式不正确，导入失败。');
        }
      } catch (err) {
        alert('⚠️ 解析文件失败，请确认是不是正确的 JSON 文件。');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset
  };

  // 2. 新建日程表
  const createNewSchedule = () => {
    const newId = 's_' + Date.now();
    setSchedules([{
      id: newId,
      isExpanded: true,
      settings: { name: '新日程表', timeFormat: '12h', startHour: 8, endHour: 22, theme: 'classic' },
      users: [],
      tasks: []
    }, ...schedules]);
  };

  // 3. 更新单个日程表
  const updateSchedule = (id, updates) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // 4. 删除单个日程表
  const deleteSchedule = (id) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  // 搜索过滤
  const filteredSchedules = schedules.filter(s => s.settings.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-800 relative">
      {/* 隐藏的全局导入组件 */}
      <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleGlobalImport} />

      {/* 全局控制台导航栏 */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-50 flex flex-col md:flex-row justify-between items-center gap-4 no-print">
        <div className="flex items-center gap-3 w-full md:w-auto font-black text-blue-600 text-xl">
          <div className="p-2 bg-blue-50 rounded-xl shadow-[0_4px_0_#bfdbfe] border-2 border-blue-200 translate-y-[-2px]">
             <Calendar strokeWidth={3} />
          </div>
          日程工作台
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* 搜索框 */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} strokeWidth={3} />
            <input 
              type="text" 
              placeholder="搜索日程表名称..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-gray-200 outline-none focus:border-blue-400 focus:bg-blue-50 transition-colors font-bold text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]" 
            />
          </div>
          
          <button 
             onClick={() => fileInputRef.current?.click()} 
             className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border-2 border-gray-200 text-gray-600 rounded-2xl font-bold shadow-[0_4px_0_#e5e7eb] hover:translate-y-[2px] hover:shadow-[0_2px_0_#e5e7eb] active:translate-y-[4px] active:shadow-none transition-all flex-shrink-0"
          >
             <Upload size={18} strokeWidth={2.5} /> 
             <span className="hidden sm:inline">导入</span>
          </button>
          
          <button 
             onClick={createNewSchedule} 
             className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-blue-500 text-white border-2 border-blue-600 rounded-2xl font-bold shadow-[0_4px_0_#2563eb] hover:translate-y-[2px] hover:shadow-[0_2px_0_#2563eb] active:translate-y-[4px] active:shadow-none transition-all flex-shrink-0"
          >
             <Plus size={18} strokeWidth={3} /> 
             <span className="hidden sm:inline">新建日程</span>
          </button>
        </div>
      </header>

      {/* 日程表列表区 */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1800px] w-full mx-auto flex flex-col gap-8">
        {filteredSchedules.map(sch => (
           <ScheduleItem 
              key={sch.id} 
              schedule={sch} 
              onUpdate={updateSchedule} 
              onDelete={deleteSchedule} 
           />
        ))}

        {filteredSchedules.length === 0 && (
           <div className="text-center text-gray-400 py-32 flex flex-col items-center gap-4">
              <Calendar size={64} className="text-gray-300 opacity-50" />
              <p className="font-bold text-lg">没有找到相关的日程表</p>
           </div>
        )}
      </main>
    </div>
  );
}