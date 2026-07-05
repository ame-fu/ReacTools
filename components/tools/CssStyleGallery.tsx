"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { Download, Upload, Plus, Edit2, Trash2, Copy, Check, X, Braces, CheckSquare, Square, ArrowLeft } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { scrollPastEnd } from "@codemirror/view";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import { formatHtmlOrCss } from "@/lib/format-html-css";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DEFAULT_STYLE_LIBRARY } from "@/lib/css-style-gallery-defaults";

type CssCategory = "loading" | "button" | "radio" | "checkbox" | "badge" | "other";

interface CssSnippet {
  id: string;
  name: string;
  category: CssCategory;
  description: string;
  html: string;
  css: string;
  createdAt: number;
}

const STORAGE_KEY = "reac-tools-css-style-gallery";
const PAGE_SIZE = 12;

/** 将 CSS 中的 </style> 转义，避免提前闭合 style 标签 */
function escapeCssForStyleTag(css: string): string {
  return css.replace(/<\/style>/gi, "</* */style>");
}

/** 卡片预览用：生成带基础布局的 srcDoc，保证内容居中、撑满父元素且可交互、可滚动 */
function buildCardPreviewDoc(html: string, css: string): string {
  const baseStyle = `
html,body{
  margin:0;
  padding:0;
  box-sizing:border-box;
  width:100%;
  height:100%;
}
*{
  box-sizing:inherit;
}
body{
  display:flex;
  align-items:center;
  justify-content:center;
  background:#f3f4f6;
  overflow:auto;
}
.__preview-root{
  max-width:100%;
  max-height:100%;
  display:flex;
  align-items:center;
  justify-content:center;
}
`;
  const safeCss = escapeCssForStyleTag(css);
  return `<!DOCTYPE html><html><head><style>${baseStyle}</style><style>${safeCss}</style></head><body><div class="__preview-root">${html}</div></body></html>`;
}

function generateId() {
  return Math.random().toString(36).slice(2, 12);
}

function getDefaultSnippets(): CssSnippet[] {
  return [...DEFAULT_STYLE_LIBRARY];
}

function loadSnippets(): CssSnippet[] {
  if (typeof window === "undefined") return getDefaultSnippets();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultSnippets();
    const parsed = JSON.parse(raw) as CssSnippet[];
    if (!Array.isArray(parsed) || parsed.length === 0) return getDefaultSnippets();
    return parsed;
  } catch {
    return getDefaultSnippets();
  }
}

function saveSnippets(list: CssSnippet[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

type EditorTab = "html" | "css" | "all";

function HtmlCssPreviewEditor({
  html,
  css,
  onHtmlChange,
  onCssChange,
  htmlPlaceholder,
  cssPlaceholder,
  copyTooltip,
  formatTooltip,
  tabLabels,
  previewTitle = "Preview",
}: {
  html: string;
  css: string;
  onHtmlChange: (v: string) => void;
  onCssChange: (v: string) => void;
  htmlPlaceholder?: string;
  cssPlaceholder?: string;
  copyTooltip?: string;
  formatTooltip?: string;
  tabLabels: { html: string; css: string; all: string };
  previewTitle?: string;
}) {
  const [activeTab, setActiveTab] = useState<EditorTab>("all");
  const [scale, setScale] = useState<1 | 0.5 | 0.25>(1);

  const showHtml = activeTab === "html" || activeTab === "all";
  const showCss = activeTab === "css" || activeTab === "all";

  return (
    <div className="flex flex-col flex-1 min-h-0 border border-gray-200 rounded-xl overflow-hidden">
      {/* 顶部 Tabs：中性灰，非蓝色 */}
      <div className="flex-shrink-0 flex border-b border-gray-200 bg-gray-100">
        <button
          type="button"
          onClick={() => setActiveTab("html")}
          className={`px-4 py-2 text-sm font-medium transition-colors bg-transparent border-0 ${
            activeTab === "html"
              ? "bg-white text-gray-800 border-b-2 border-gray-400 -mb-px"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          {tabLabels.html}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("css")}
          className={`px-4 py-2 text-sm font-medium transition-colors bg-transparent border-0 ${
            activeTab === "css"
              ? "bg-white text-gray-800 border-b-2 border-gray-400 -mb-px"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          {tabLabels.css}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-sm font-medium transition-colors bg-transparent border-0 ${
            activeTab === "all"
              ? "bg-white text-gray-800 border-b-2 border-gray-400 -mb-px"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          {tabLabels.all}
        </button>
      </div>

      {/* 编辑器区域：固定高度以支持滚动，背景与编辑器一致 */}
      <div className="flex-1 min-h-[120px] max-h-[350px] flex overflow-hidden bg-[#1a1b26]">
        {showHtml && (
          <div
            className={`flex-1 min-w-0 min-h-0 overflow-hidden border-r border-slate-700 flex flex-col bg-[#1a1b26]`}
          >
            <CodeMirrorEditor
              value={html}
              onChange={onHtmlChange}
              placeholder={htmlPlaceholder}
              language="html"
              copyable
              copyTooltip={copyTooltip}
              formatTooltip={formatTooltip}
              height="100%"
            />
          </div>
        )}
        {showCss && (
          <div className="flex-1 min-w-0 min-h-0 overflow-hidden flex flex-col bg-[#1a1b26]">
            <CodeMirrorEditor
              value={css}
              onChange={onCssChange}
              placeholder={cssPlaceholder}
              language="css"
              copyable
              copyTooltip={copyTooltip}
              formatTooltip={formatTooltip}
              height="100%"
            />
          </div>
        )}
      </div>

      {/* 预览区域：始终可见，右下角缩放 */}
      <div className="flex-shrink-0 border-t border-gray-200 flex flex-col">
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
          <span className="text-xs font-semibold text-gray-600">
            {previewTitle}
          </span>
          <div className="flex gap-1">
            {([1, 0.5, 0.25] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScale(s)}
                className={`px-2 py-1 text-xs font-medium rounded border-0 ${
                  scale === s
                    ? "bg-gray-600 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
        <div className="relative bg-white p-4 min-h-[120px] overflow-auto">
          <div style={{ zoom: scale }}>
            <iframe
              title="Preview"
              srcDoc={`<!DOCTYPE html><html><head><style>${escapeCssForStyleTag(css)}</style></head><body>${html}</body></html>`}
              className="w-full min-h-[100px] border-0"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CodeMirrorEditor({
  value,
  onChange,
  placeholder,
  language,
  copyable,
  copyTooltip,
  formatTooltip,
  height,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  language: "html" | "css";
  copyable?: boolean;
  copyTooltip?: string;
  formatTooltip?: string;
  height?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [formatting, setFormatting] = useState(false);

  const extensions = useMemo(
    () => [
      language === "html" ? html() : css(),
      scrollPastEnd(),
    ],
    [language]
  );

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const handleFormat = async () => {
    if (!value || formatting) return;
    setFormatting(true);
    try {
      const formatted = await formatHtmlOrCss(value, language);
      if (formatted !== value) onChange(formatted);
    } catch {
      // ignore
    } finally {
      setFormatting(false);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[120px] border rounded-xl overflow-hidden flex flex-col [&_.cm-editor]:flex-1 [&_.cm-editor]:min-h-0 [&_.cm-scroller]:overflow-y-auto [&_.cm-scroller]:overflow-x-hidden">
      <CodeMirror
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        theme={tokyoNight}
        extensions={extensions}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
        }}
        height={height ?? "100%"}
        minHeight="120px"
        className="flex-1 min-h-0 text-sm [&_.cm-editor]:rounded-xl"
      />
      <div className="absolute right-2 top-2 z-10 flex gap-0.5">
        <button
          type="button"
          onClick={handleFormat}
          title={formatTooltip}
          disabled={formatting || !value?.trim()}
          className="p-1.5 rounded-lg bg-transparent border-0 text-slate-400 hover:text-slate-100 hover:bg-slate-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Braces size={14} strokeWidth={2} />
        </button>
        {copyable && (
          <button
            type="button"
            onClick={handleCopy}
            title={copyTooltip}
            className="p-1.5 rounded-lg bg-transparent border-0 text-slate-400 hover:text-slate-100 hover:bg-slate-600/50 transition-colors"
          >
            {copied ? (
              <Check size={14} strokeWidth={2} className="text-emerald-400" />
            ) : (
              <Copy size={14} strokeWidth={2} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export function CssStyleGallery() {
  const { t } = useI18n();
  const tt = (key: string) => t(`tools.css-style-gallery.${key}`);

  const [snippets, setSnippets] = useState<CssSnippet[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState<CssCategory | "all">(
    "all"
  );

  const [draftName, setDraftName] = useState("");
  const [draftCategory, setDraftCategory] = useState<CssCategory>("button");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftHtml, setDraftHtml] = useState("");
  const [draftCss, setDraftCss] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title?: string;
    message: string;
    confirmText: string;
    cancelText?: string;
    onConfirm: () => void;
    variant?: "default" | "danger";
  }>({ open: false, message: "", confirmText: t("common.confirmOk"), onConfirm: () => {} });

  useEffect(() => {
    setSnippets(loadSnippets());
  }, []);

  useEffect(() => {
    if (snippets.length && !selectedId) {
      setSelectedId(snippets[0].id);
    }
  }, [snippets, selectedId]);

  const selectedSnippet = snippets.find((x) => x.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedSnippet || editingId !== selectedSnippet.id) return;
    setDraftName(selectedSnippet.name);
    setDraftCategory(selectedSnippet.category);
    setDraftDescription(selectedSnippet.description);
    setDraftHtml(selectedSnippet.html);
    setDraftCss(selectedSnippet.css);
  }, [editingId, selectedSnippet?.id]);

  useEffect(() => {
    saveSnippets(snippets);
  }, [snippets]);

  const filteredSnippets = useMemo(
    () =>
      snippets.filter((s) =>
        filterCategory === "all" ? true : s.category === filterCategory
      ),
    [snippets, filterCategory]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSnippets.length / PAGE_SIZE)
  );
  const pageSafe = Math.min(page, totalPages);
  const pageItems = filteredSnippets.slice(
    (pageSafe - 1) * PAGE_SIZE,
    pageSafe * PAGE_SIZE
  );

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setEditingId(id);
    setModalOpen(true);
  };

  const handleCreateNew = () => {
    const snippet: CssSnippet = {
      id: generateId(),
      name: tt("defaultNewName"),
      category: "button",
      description: "",
      html: "<button>New button</button>",
      css: "button { padding: 8px 16px; border-radius: 999px; border: none; background:#3b82f6; color:#fff; }",
      createdAt: Date.now(),
    };
    setSnippets((prev) => [snippet, ...prev]);
    setSelectedId(snippet.id);
    setEditingId(snippet.id);
    setNewlyCreatedId(snippet.id);
    setPage(1);
    setModalOpen(true);
  };

  const closeModal = useCallback((removeNewIfCreated = true) => {
    if (removeNewIfCreated && newlyCreatedId) {
      setSnippets((prev) => prev.filter((s) => s.id !== newlyCreatedId));
      setNewlyCreatedId(null);
      if (selectedId === newlyCreatedId) {
        setSelectedId(null);
      }
    }
    setModalOpen(false);
    setEditingId(null);
  }, [newlyCreatedId, selectedId]);

  const handleDelete = (id: string) => {
    const name = snippets.find((s) => s.id === id)?.name ?? "";
    setConfirmDialog({
      open: true,
      message: tt("deleteConfirm").replace("{name}", name),
      confirmText: tt("actions.delete"),
      cancelText: t("common.confirmCancel"),
      variant: "danger",
      onConfirm: () => {
        setSnippets((prev) => prev.filter((s) => s.id !== id));
        if (selectedId === id) setSelectedId(null);
      },
    });
  };

  const handleBatchDelete = () => {
    const count = selectedIds.size;
    setConfirmDialog({
      open: true,
      message: tt("deleteConfirmMultiple").replace("{count}", String(count)),
      confirmText: tt("actions.batchDelete"),
      cancelText: t("common.confirmCancel"),
      variant: "danger",
      onConfirm: () => {
        setSnippets((prev) => prev.filter((s) => !selectedIds.has(s.id)));
        setSelectedIds(new Set());
        if (selectedId && selectedIds.has(selectedId)) setSelectedId(null);
        setMultiSelectMode(false);
      },
    });
  };

  const exportSnippets = (list: CssSnippet[], filename: string) => {
    const blob = new Blob([JSON.stringify(list, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportOne = (e: React.MouseEvent, item: CssSnippet) => {
    e.stopPropagation();
    const safeName = item.name.replace(/[/\\?%*:|"]/g, "_").slice(0, 50);
    exportSnippets([item], `css-snippet-${safeName}.json`);
  };

  const handleBatchExport = () => {
    const list = snippets.filter((s) => selectedIds.has(s.id));
    if (list.length === 0) return;
    exportSnippets(list, "css-style-gallery-batch.json");
    setMultiSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleSaveCurrent = () => {
    if (!selectedSnippet || editingId !== selectedSnippet.id) return;
    setSnippets((prev) =>
      prev.map((s) =>
        s.id === selectedSnippet.id
          ? {
              ...s,
              name: draftName.trim() || s.name,
              category: draftCategory,
              description: draftDescription,
              html: draftHtml,
              css: draftCss,
            }
          : s
      )
    );
    setNewlyCreatedId(null);
    closeModal(false);
  };

  const handleReset = () => {
    if (!selectedSnippet || editingId !== selectedSnippet.id) return;
    setDraftName(selectedSnippet.name);
    setDraftCategory(selectedSnippet.category);
    setDraftDescription(selectedSnippet.description);
    setDraftHtml(selectedSnippet.html);
    setDraftCss(selectedSnippet.css);
  };

  const handleExport = () => {
    exportSnippets(snippets, "css-style-gallery.json");
  };

  const handleImport = (files: FileList | null) => {
    if (!files?.length) return;
    const readFile = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve((r.result as string) ?? "");
        r.onerror = () => reject(new Error("Read failed"));
        r.readAsText(file);
      });
    Promise.all(Array.from(files).map(readFile))
      .then((contents) => {
        const addedRef = { count: 0 };
        setSnippets((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          const toAdd: CssSnippet[] = [];
          for (const raw of contents) {
            try {
              const data = JSON.parse(raw || "null") as CssSnippet[] | CssSnippet;
              const list = Array.isArray(data) ? data : [data];
              for (const x of list) {
                const id = x.id ?? generateId();
                if (existingIds.has(id)) continue;
                existingIds.add(id);
                toAdd.push({
                  ...x,
                  id,
                  createdAt: x.createdAt ?? Date.now(),
                });
              }
            } catch {
              // skip invalid file
            }
          }
          addedRef.count = toAdd.length;
          return toAdd.length > 0 ? [...toAdd, ...prev] : prev;
        });
        if (addedRef.count > 0) setPage(1);
        setConfirmDialog({
          open: true,
          message: addedRef.count > 0 ? tt("import.success") : tt("import.invalid"),
          confirmText: t("common.confirmOk"),
          onConfirm: () => {},
        });
      })
      .catch(() => {
        setConfirmDialog({
          open: true,
          message: tt("import.invalid"),
          confirmText: t("common.confirmOk"),
          onConfirm: () => {},
        });
      });
  };

  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalOpen) closeModal(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalOpen, closeModal]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-semibold text-gray-600">
            {tt("categoryFilter")}
          </span>
          <select
            value={filterCategory}
            onChange={(e) =>
              setFilterCategory(e.target.value as CssCategory | "all")
            }
            className="px-3 py-1.5 rounded-xl border border-gray-300 text-sm font-medium bg-white shadow-sm"
          >
            <option value="all">{tt("category.all")}</option>
            <option value="loading">{tt("category.loading")}</option>
            <option value="button">{tt("category.button")}</option>
            <option value="radio">{tt("category.radio")}</option>
            <option value="checkbox">{tt("category.checkbox")}</option>
            <option value="badge">{tt("category.badge")}</option>
            <option value="other">{tt("category.other")}</option>
          </select>
          <span className="text-xs text-gray-400">
            {tt("totalCount").replace("{count}", String(filteredSnippets.length))}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {multiSelectMode ? (
            <>
              <button
                onClick={() => {
                  setMultiSelectMode(false);
                  setSelectedIds(new Set());
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-gray-700 text-sm font-semibold border border-gray-300 shadow-sm hover:bg-gray-50"
              >
                <ArrowLeft size={14} strokeWidth={2.2} />
                {tt("actions.return")}
              </button>
              <button
                onClick={handleBatchExport}
                disabled={selectedIds.size === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-gray-700 text-sm font-semibold border border-gray-300 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={14} strokeWidth={2.2} />
                {tt("actions.batchExport")}
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={selectedIds.size === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-red-600 text-sm font-semibold border border-red-200 shadow-sm hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={14} strokeWidth={2.2} />
                {tt("actions.batchDelete")}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setMultiSelectMode(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-gray-700 text-sm font-semibold border border-gray-300 shadow-sm hover:bg-gray-50"
              >
                <CheckSquare size={14} strokeWidth={2.2} />
                {tt("actions.multiSelect")}
              </button>
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500 text-white text-sm font-semibold shadow-[0_3px_0_#2563eb] hover:translate-y-[1px] hover:shadow-[0_2px_0_#2563eb] active:translate-y-[3px] active:shadow-none transition-all"
              >
                <Plus size={14} strokeWidth={2.5} />
                {tt("actions.new")}
              </button>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-gray-700 text-sm font-semibold border border-gray-300 shadow-sm cursor-pointer">
                <Upload size={14} strokeWidth={2.2} />
                {tt("actions.import")}
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  multiple
                  onClick={() => setImporting(true)}
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files?.length) handleImport(files);
                    e.target.value = "";
                    setImporting(false);
                  }}
                />
              </label>
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-gray-700 text-sm font-semibold border border-gray-300 shadow-sm hover:bg-gray-50"
              >
                <Download size={14} strokeWidth={2.2} />
                {tt("actions.export")}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0">
        <div className="w-full flex flex-col gap-3 min-h-0">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>{tt("gallery.title")}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={pageSafe <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2 py-1 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                {tt("pagination.prev")}
              </button>
              <span className="font-medium">
                {pageSafe}/{totalPages}
              </span>
              <button
                disabled={pageSafe >= totalPages}
                onClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
                className="px-2 py-1 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                {tt("pagination.next")}
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-auto p-2">
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
              {pageItems.map((item) => {
                const isSelected = selectedIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    className={`mb-3 break-inside-avoid rounded-2xl border-0 bg-[#f0f0f0] transition-shadow duration-200 ${
                      multiSelectMode ? "cursor-pointer" : ""
                    } ${
                      multiSelectMode && isSelected
                        ? "shadow-[inset_3px_3px_6px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.7)]"
                        : "shadow-[4px_4px_10px_rgba(0,0,0,0.08),-4px_-4px_10px_rgba(255,255,255,0.9)]"
                    }`}
                    onClick={() => {
                      if (multiSelectMode) {
                        setSelectedIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(item.id)) next.delete(item.id);
                          else next.add(item.id);
                          return next;
                        });
                      }
                    }}
                  >
                    <div className="px-2.5 pt-1.5 pb-1 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {multiSelectMode ? (
                          <span className="shrink-0 text-blue-500">
                            {isSelected ? (
                              <CheckSquare size={18} strokeWidth={2.4} />
                            ) : (
                              <Square size={18} strokeWidth={2.4} />
                            )}
                          </span>
                        ) : null}
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {tt(`category.${item.category}`)}
                          </span>
                          <span className="text-sm font-bold text-gray-800 truncate max-w-[180px]">
                            {item.name}
                          </span>
                        </div>
                      </div>
                      {!multiSelectMode && (
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            className="p-1.5 rounded-full hover:bg-blue-50 text-gray-500 hover:text-blue-600"
                            title={tt("actions.edit")}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelect(item.id);
                            }}
                          >
                            <Edit2 size={14} strokeWidth={2.4} />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
                            title={tt("actions.exportOne")}
                            onClick={(e) => handleExportOne(e, item)}
                          >
                            <Download size={14} strokeWidth={2.4} />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-600"
                            title={tt("actions.delete")}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
                            }}
                          >
                            <Trash2 size={14} strokeWidth={2.4} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="px-3 py-0.5">
                      <div className="text-[11px] text-gray-600 line-clamp-2 min-h-[1.5em] leading-tight">
                        {item.description || tt("noDescription")}
                      </div>
                    </div>
                    <div className="p-2">
                      <div className="rounded-xl overflow-hidden min-h-[100px] h-[120px] isolate">
                        <iframe
                          title={`Preview: ${item.name}`}
                          srcDoc={buildCardPreviewDoc(item.html, item.css)}
                          className="w-full h-full min-h-[100px] border-0 block bg-white"
                          sandbox="allow-same-origin"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              {pageItems.length === 0 && (
                <div className="text-center text-gray-400 py-16 text-sm">
                  {tt("gallery.empty")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog((d) => ({ ...d, open: false }))}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        onConfirm={confirmDialog.onConfirm}
        variant={confirmDialog.variant}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-white">
          <button
            type="button"
            onClick={() => closeModal()}
            className="absolute right-4 top-4 z-10 p-2 rounded-lg bg-transparent border-0 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={20} strokeWidth={2} />
          </button>
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* 顶部表单 */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600">
                    {tt("fields.name")}
                  </label>
                  <input
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600">
                    {tt("fields.category")}
                  </label>
                  <select
                    value={draftCategory}
                    onChange={(e) =>
                      setDraftCategory(e.target.value as CssCategory)
                    }
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  >
                    <option value="loading">{tt("category.loading")}</option>
                    <option value="button">{tt("category.button")}</option>
                    <option value="radio">{tt("category.radio")}</option>
                    <option value="checkbox">{tt("category.checkbox")}</option>
                    <option value="badge">{tt("category.badge")}</option>
                    <option value="other">{tt("category.other")}</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-gray-600">
                    {tt("fields.description")}
                  </label>
                  <textarea
                    value={draftDescription}
                    onChange={(e) => setDraftDescription(e.target.value)}
                    rows={2}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* CodePen 风格：HTML/CSS 编辑器 + 实时预览 */}
            <div className="flex-1 min-h-[300px] flex flex-col gap-0 px-6 py-4 overflow-hidden">
              <HtmlCssPreviewEditor
                html={draftHtml}
                css={draftCss}
                onHtmlChange={setDraftHtml}
                onCssChange={setDraftCss}
                htmlPlaceholder={tt("fields.htmlPlaceholder")}
                cssPlaceholder={tt("fields.cssPlaceholder")}
                copyTooltip={t("common.copyToClipboard")}
                formatTooltip={t("common.formatCode")}
                tabLabels={{
                  html: tt("preview.tabHtml"),
                  css: tt("preview.tabCss"),
                  all: tt("preview.tabAll"),
                }}
                previewTitle={tt("preview.title")}
              />
            </div>

            {/* 底部按钮组：仅保存为蓝色 */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-100"
              >
                {tt("actions.reset")}
              </button>
              <button
                type="button"
                onClick={() => closeModal()}
                className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-100"
              >
                {tt("actions.cancel")}
              </button>
              <button
                type="button"
                onClick={handleSaveCurrent}
                className="px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-semibold shadow-[0_3px_0_#2563eb] hover:translate-y-[1px] hover:shadow-[0_2px_0_#2563eb] active:translate-y-[3px] active:shadow-none transition-all"
              >
                {tt("actions.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

