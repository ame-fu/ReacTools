/**
 * 默认样式库：独立维护，参考 uiverse.io 风格。
 * 供 CSS 样式库工具在本地无数据时使用。
 */

export type CssCategory = "loading" | "button" | "radio" | "checkbox" | "badge" | "other";

export interface CssSnippetSeed {
  id: string;
  name: string;
  category: CssCategory;
  description: string;
  html: string;
  css: string;
  createdAt: number;
}

export const DEFAULT_STYLE_LIBRARY: CssSnippetSeed[] = [
  {
    id: "default-1",
    name: "Spinner loading",
    category: "loading",
    description: "Simple rotating circle spinner.",
    html: '<div class="spinner-uiverse"></div>',
    css: `.spinner-uiverse {
  width: 28px;
  height: 28px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin-uiverse 0.8s linear infinite;
}
@keyframes spin-uiverse {
  to { transform: rotate(360deg); }
}`,
    createdAt: 0,
  },
  {
    id: "default-2",
    name: "Pulsing dots",
    category: "loading",
    description: "Three dots bounce loading.",
    html: '<div class="dots-uiverse"><span></span><span></span><span></span></div>',
    css: `.dots-uiverse {
  display: inline-flex;
  gap: 6px;
}
.dots-uiverse span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3b82f6;
  animation: bounce-uiverse 0.6s ease-in-out infinite;
}
.dots-uiverse span:nth-child(2) { animation-delay: 0.1s; }
.dots-uiverse span:nth-child(3) { animation-delay: 0.2s; }
@keyframes bounce-uiverse {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}`,
    createdAt: 0,
  },
  {
    id: "default-3",
    name: "Progress bar loading",
    category: "loading",
    description: "Indeterminate progress bar.",
    html: '<div class="bar-uiverse"><div class="bar-fill"></div></div>',
    css: `.bar-uiverse {
  width: 120px;
  height: 6px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}
.bar-uiverse .bar-fill {
  height: 100%;
  width: 30%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 999px;
  animation: bar-uiverse 1.2s ease-in-out infinite;
}
@keyframes bar-uiverse {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}`,
    createdAt: 0,
  },
  {
    id: "default-4",
    name: "Gradient button",
    category: "button",
    description: "Gradient fill with hover glow.",
    html: '<button class="btn-gradient-uiverse">Get started</button>',
    css: `.btn-gradient-uiverse {
  padding: 10px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-gradient-uiverse:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
}`,
    createdAt: 0,
  },
  {
    id: "default-5",
    name: "Glass button",
    category: "button",
    description: "Glassmorphism style button.",
    html: '<button class="btn-glass-uiverse">Glass</button>',
    css: `.btn-glass-uiverse {
  padding: 10px 22px;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 12px;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(8px);
  color: #1e293b;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.btn-glass-uiverse:hover {
  background: rgba(255,255,255,0.35);
  border-color: rgba(255,255,255,0.5);
}`,
    createdAt: 0,
  },
  {
    id: "default-6",
    name: "Outline button",
    category: "button",
    description: "Outlined with hover fill.",
    html: '<button class="btn-outline-uiverse">Outline</button>',
    css: `.btn-outline-uiverse {
  padding: 10px 24px;
  border: 2px solid #3b82f6;
  border-radius: 10px;
  background: transparent;
  color: #3b82f6;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.btn-outline-uiverse:hover {
  background: #3b82f6;
  color: white;
}`,
    createdAt: 0,
  },
  {
    id: "default-7",
    name: "Neumorphic button",
    category: "button",
    description: "Soft neumorphism press effect.",
    html: '<button class="btn-neo-uiverse">Press me</button>',
    css: `.btn-neo-uiverse {
  padding: 12px 28px;
  border: none;
  border-radius: 14px;
  background: #e8e8e8;
  color: #555;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 6px 6px 12px #ccc, -6px -6px 12px #fff;
  transition: box-shadow 0.2s;
}
.btn-neo-uiverse:hover {
  box-shadow: 4px 4px 8px #ccc, -4px -4px 8px #fff;
}
.btn-neo-uiverse:active {
  box-shadow: inset 3px 3px 6px #ccc, inset -2px -2px 4px #fff;
}`,
    createdAt: 0,
  },
  {
    id: "default-8",
    name: "Icon button",
    category: "button",
    description: "Round icon-style button.",
    html: '<button class="btn-icon-uiverse">♥</button>',
    css: `.btn-icon-uiverse {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #ec4899, #f43f5e);
  color: white;
  font-size: 18px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(236, 72, 153, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-icon-uiverse:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(236, 72, 153, 0.5);
}`,
    createdAt: 0,
  },
  {
    id: "default-9",
    name: "Pill radio group",
    category: "radio",
    description: "Segmented pill radios.",
    html: `<div class="pill-radio-uiverse">
  <label><input type="radio" name="r" checked><span>S</span></label>
  <label><input type="radio" name="r"><span>M</span></label>
  <label><input type="radio" name="r"><span>L</span></label>
</div>`,
    css: `.pill-radio-uiverse {
  display: inline-flex;
  padding: 4px;
  border-radius: 999px;
  background: #f1f5f9;
  gap: 2px;
}
.pill-radio-uiverse label { cursor: pointer; }
.pill-radio-uiverse input { position: absolute; opacity: 0; pointer-events: none; }
.pill-radio-uiverse span {
  display: block;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  transition: all 0.2s;
}
.pill-radio-uiverse input:checked + span {
  background: white;
  color: #0f172a;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}`,
    createdAt: 0,
  },
  {
    id: "default-10",
    name: "Card radio group",
    category: "radio",
    description: "Card-style radio selection.",
    html: `<div class="card-radio-uiverse">
  <label><input type="radio" name="c" checked><span>Option A</span></label>
  <label><input type="radio" name="c"><span>Option B</span></label>
</div>`,
    css: `.card-radio-uiverse {
  display: inline-flex;
  gap: 8px;
}
.card-radio-uiverse label { cursor: pointer; }
.card-radio-uiverse input { position: absolute; opacity: 0; pointer-events: none; }
.card-radio-uiverse span {
  display: block;
  padding: 10px 18px;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  transition: all 0.2s;
}
.card-radio-uiverse input:checked + span {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #1d4ed8;
}`,
    createdAt: 0,
  },
  {
    id: "default-11",
    name: "Toggle switch",
    category: "checkbox",
    description: "iOS-style toggle switch.",
    html: '<label class="toggle-uiverse"><input type="checkbox" checked><span></span></label>',
    css: `.toggle-uiverse {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}
.toggle-uiverse input { position: absolute; opacity: 0; pointer-events: none; }
.toggle-uiverse span {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 999px;
  background: #cbd5e1;
  transition: background 0.2s;
}
.toggle-uiverse span::after {
  content: "";
  position: absolute;
  left: 2px;
  top: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: transform 0.2s;
}
.toggle-uiverse input:checked + span {
  background: #22c55e;
}
.toggle-uiverse input:checked + span::after {
  transform: translateX(20px);
}`,
    createdAt: 0,
  },
  {
    id: "default-12",
    name: "Minimal checkbox",
    category: "checkbox",
    description: "Simple checkmark box.",
    html: '<label class="minimal-cb-uiverse"><input type="checkbox" checked><span></span>Accept</label>',
    css: `.minimal-cb-uiverse {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #334155;
}
.minimal-cb-uiverse input { position: absolute; opacity: 0; pointer-events: none; }
.minimal-cb-uiverse span {
  width: 18px;
  height: 18px;
  border: 2px solid #94a3b8;
  border-radius: 4px;
  position: relative;
  transition: all 0.2s;
}
.minimal-cb-uiverse input:checked + span {
  background: #3b82f6;
  border-color: #3b82f6;
}
.minimal-cb-uiverse input:checked + span::after {
  content: "";
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}`,
    createdAt: 0,
  },
  {
    id: "default-13",
    name: "Pill badge",
    category: "badge",
    description: "Rounded pill badge.",
    html: '<span class="badge-pill-uiverse">New</span>',
    css: `.badge-pill-uiverse {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  background: #3b82f6;
  color: white;
  font-size: 12px;
  font-weight: 600;
}`,
    createdAt: 0,
  },
  {
    id: "default-14",
    name: "Count badge",
    category: "badge",
    description: "Numeric notification badge.",
    html: '<span class="badge-count-uiverse">9</span>',
    css: `.badge-count-uiverse {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 700;
}`,
    createdAt: 0,
  },
  {
    id: "default-15",
    name: "Soft card",
    category: "other",
    description: "Simple card with shadow.",
    html: '<div class="card-soft-uiverse"><h4 class="card-title">Title</h4><p class="card-p">Short description.</p></div>',
    css: `.card-soft-uiverse {
  padding: 16px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 14px rgba(0,0,0,0.06);
  max-width: 200px;
}
.card-soft-uiverse .card-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}
.card-soft-uiverse .card-p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}`,
    createdAt: 0,
  },
  {
    id: "default-16",
    name: "Rounded input",
    category: "other",
    description: "Single line input with focus ring.",
    html: '<input type="text" class="input-uiverse" placeholder="Type here...">',
    css: `.input-uiverse {
  width: 180px;
  padding: 10px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.input-uiverse:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}`,
    createdAt: 0,
  },
  {
    id: "default-17",
    name: "Tag / chip",
    category: "other",
    description: "Deletable tag chip.",
    html: '<span class="tag-uiverse">React <button type="button" class="tag-close">×</button></span>',
    css: `.tag-uiverse {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  font-weight: 500;
}
.tag-uiverse .tag-close {
  padding: 0;
  margin: 0;
  border: none;
  background: none;
  color: #94a3b8;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  border-radius: 50%;
}
.tag-uiverse .tag-close:hover {
  color: #64748b;
  background: #e2e8f0;
}`,
    createdAt: 0,
  },
  {
    id: "default-18",
    name: "Progress bar",
    category: "other",
    description: "Determinate progress bar.",
    html: '<div class="progress-uiverse"><div class="progress-fill" style="width:60%"></div></div>',
    css: `.progress-uiverse {
  width: 160px;
  height: 8px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}
.progress-uiverse .progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 999px;
  transition: width 0.3s ease;
}`,
    createdAt: 0,
  },
  {
    id: "default-19",
    name: "Tooltip trigger",
    category: "other",
    description: "Hover to show tooltip.",
    html: '<span class="tooltip-uiverse">Hover me<span class="tooltip-text">Tooltip text</span></span>',
    css: `.tooltip-uiverse {
  position: relative;
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  border-radius: 8px;
  font-size: 13px;
  cursor: default;
}
.tooltip-uiverse .tooltip-text {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-6px);
  padding: 6px 10px;
  background: #1e293b;
  color: white;
  font-size: 12px;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s, transform 0.2s;
}
.tooltip-uiverse:hover .tooltip-text {
  opacity: 1;
  transform: translateX(-50%) translateY(-4px);
}`,
    createdAt: 0,
  },
  {
    id: "default-20",
    name: "Divider with text",
    category: "other",
    description: "Horizontal divider with label.",
    html: '<div class="divider-uiverse"><span>or</span></div>',
    css: `.divider-uiverse {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 200px;
}
.divider-uiverse::before,
.divider-uiverse::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}
.divider-uiverse span {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}`,
    createdAt: 0,
  },
];
