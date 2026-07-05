/**
 * 日程工作台 - 工具函数，与 gemini_temp/日程工作台.jsx 完全一致
 */

export function isImageItem(val: unknown): boolean {
  if (val == null) return false;
  const str = String(val).trim();
  if (str.startsWith("img:")) return true;
  if (/^https?:\/\//i.test(str) || /^data:image\//i.test(str)) return true;
  if (/\.(png|jpe?g|gif|svg|webp)(\?.*)?$/i.test(str)) return true;
  return false;
}

export function getImageUrl(val: unknown): string {
  const str = String(val).trim();
  return str.startsWith("img:") ? str.slice(4) : str;
}

export type TimeFormat = "12h" | "24h";

export function formatTimeDisplay(num: number, format: TimeFormat): string {
  const totalMins = Math.round(num * 60);
  const h = Math.floor(totalMins / 60);
  const m = (totalMins % 60).toString().padStart(2, "0");

  if (format === "24h") {
    return `${h.toString().padStart(2, "0")}:${m}`;
  }
  // 12h format: always render with AM/PM (avoid locale-specific 上午/下午 parsing issues)
  const hh = ((h % 24) + 24) % 24;
  const period = hh < 12 ? "AM" : "PM";
  const displayH = hh % 12 === 0 ? 12 : hh % 12;
  return `${displayH}:${m} ${period}`;
}

export interface LayoutBlockInput {
  id: string;
  startDay: number;
  endDay: number;
  start: number;
  end: number;
  task: unknown;
  spanDays: number;
}

export interface LayoutBlock extends LayoutBlockInput {
  col: number;
  maxCols?: number;
}

export function calculate2DLayout(blocks: LayoutBlockInput[]): LayoutBlock[] {
  if (blocks.length === 0) return [];

  const list = blocks.map((b) => ({ ...b })) as LayoutBlock[];

  list.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return (b.spanDays ?? b.endDay - b.startDay + 1) - (a.spanDays ?? a.endDay - a.startDay + 1);
  });

  const columns: LayoutBlock[][] = [];
  list.forEach((b) => {
    let placed = false;
    for (let c = 0; c < columns.length; c++) {
      const hasOverlap = columns[c].some(
        (cb) =>
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

  const adjList: number[][] = list.map(() => []);
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i];
      const b = list[j];
      if (
        Math.max(a.start, b.start) < Math.min(a.end, b.end) &&
        Math.max(a.startDay, b.startDay) <= Math.min(a.endDay, b.endDay)
      ) {
        adjList[i].push(j);
        adjList[j].push(i);
      }
    }
  }

  const visited = new Array(list.length).fill(false);
  list.forEach((_b, i) => {
    if (visited[i]) return;
    const comp: number[] = [];
    const q = [i];
    visited[i] = true;
    while (q.length > 0) {
      const curr = q.shift()!;
      comp.push(curr);
      adjList[curr].forEach((n) => {
        if (!visited[n]) {
          visited[n] = true;
          q.push(n);
        }
      });
    }
    const maxC = Math.max(...comp.map((idx) => list[idx].col)) + 1;
    comp.forEach((idx) => {
      list[idx].maxCols = maxC;
    });
  });

  return list;
}

export interface TimeOption {
  value: number;
  label: string;
}

export function getFullTimeOptions(timeFormat: TimeFormat): TimeOption[] {
  const options: TimeOption[] = [];
  for (let h = 0; h <= 24; h++) {
    if (h === 24) {
      options.push({ value: 24, label: formatTimeDisplay(24, timeFormat) });
      break;
    }
    for (let m = 0; m < 60; m += 5) {
      const val = h + m / 60;
      options.push({ value: val, label: formatTimeDisplay(val, timeFormat) });
    }
  }
  return options;
}
