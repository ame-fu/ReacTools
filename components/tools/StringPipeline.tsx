"use client";

import React, { useState, useCallback } from "react";
import { Card, Button, Modal, Input, message } from "antd";
import { PlusOutlined, ImportOutlined, ExportOutlined, EditOutlined, CloseOutlined, HolderOutlined, DeleteOutlined } from "@ant-design/icons";
import { CopyButton } from "@/components/ui/CopyButton";
import { useI18n } from "@/lib/i18n/context";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const PIPELINE_STORAGE_KEY = "reac-tools-string-pipeline";

export interface PipelineStepDef {
  id: string;
  label: string;
  run: (input: string) => string;
}

const base64Encode = (s: string) => btoa(unescape(encodeURIComponent(s)));

/** Base64 解码为二进制字符串（每字符表示一字节 0–255），便于后续「字节转16进制」等步骤 */
function base64Decode(s: string): string {
  return atob(s);
}

/** 将二进制字符串（每字符一字节）转为十六进制字符串；接在 base64 解码后使用 */
function bytesToHex(s: string): string {
  return [...s].map((c) => c.charCodeAt(0).toString(16).padStart(2, "0")).join("");
}

/** 将十六进制字符串转为二进制字符串（每字符一字节）；可与「字节转base64」组成 16 进制→base64 */
function hexToBytes(s: string): string {
  const hex = s.replace(/\s/g, "");
  if (hex.length % 2 !== 0) throw new Error("Hex string length must be even");
  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.slice(i, i + 2), 16));
  }
  return String.fromCharCode(...bytes);
}

/** 将二进制字符串（每字符一字节）转为 base64；接在「16进制转字节」后使用 */
function bytesToBase64(s: string): string {
  return btoa(s);
}

/** 数字进制互转：整数字符串（可含空格）从 from 进制转到 to 进制，支持大数 */
function convertBase(s: string, from: 2 | 8 | 10 | 16, to: 2 | 8 | 10 | 16): string {
  const trimmed = s.replace(/\s/g, "");
  if (!trimmed) return "";
  const prefix = from === 2 ? "0b" : from === 8 ? "0o" : from === 16 ? "0x" : "";
  const n = BigInt(prefix + trimmed);
  return n.toString(to);
}

const numHexToDec = (s: string) => convertBase(s, 16, 10);
const numDecToHex = (s: string) => convertBase(s, 10, 16);
const numBinToDec = (s: string) => convertBase(s, 2, 10);
const numDecToBin = (s: string) => convertBase(s, 10, 2);
const numHexToBin = (s: string) => convertBase(s, 16, 2);
const numBinToHex = (s: string) => convertBase(s, 2, 16);
const numOctToDec = (s: string) => convertBase(s, 8, 10);
const numDecToOct = (s: string) => convertBase(s, 10, 8);
const numOctToHex = (s: string) => convertBase(s, 8, 16);
const numHexToOct = (s: string) => convertBase(s, 16, 8);

const AVAILABLE_STEPS: PipelineStepDef[] = [
  { id: "input", label: "输入数据", run: (s) => s },
  { id: "base64", label: "base64", run: base64Encode },
  { id: "base64-encode", label: "base64编码", run: base64Encode },
  { id: "base64-decode", label: "base64解码", run: base64Decode },
  { id: "bytes-to-hex", label: "字节转16进制", run: bytesToHex },
  { id: "hex-to-bytes", label: "16进制转字节", run: hexToBytes },
  { id: "bytes-to-base64", label: "字节转base64", run: bytesToBase64 },
  { id: "num-hex-to-dec", label: "16进制→10进制", run: numHexToDec },
  { id: "num-dec-to-hex", label: "10进制→16进制", run: numDecToHex },
  { id: "num-bin-to-dec", label: "2进制→10进制", run: numBinToDec },
  { id: "num-dec-to-bin", label: "10进制→2进制", run: numDecToBin },
  { id: "num-hex-to-bin", label: "16进制→2进制", run: numHexToBin },
  { id: "num-bin-to-hex", label: "2进制→16进制", run: numBinToHex },
  { id: "num-oct-to-dec", label: "8进制→10进制", run: numOctToDec },
  { id: "num-dec-to-oct", label: "10进制→8进制", run: numDecToOct },
  { id: "num-oct-to-hex", label: "8进制→16进制", run: numOctToHex },
  { id: "num-hex-to-oct", label: "16进制→8进制", run: numHexToOct },
  { id: "char-to-bin", label: "字符→2进制码点", run: (s) => s.split("").map((c) => c.charCodeAt(0).toString(2).padStart(8, "0")).join(" ") },
  { id: "char-to-oct", label: "字符→8进制码点", run: (s) => s.split("").map((c) => c.charCodeAt(0).toString(8).padStart(3, "0")).join(" ") },
  { id: "char-to-dec", label: "字符→10进制码点", run: (s) => s.split("").map((c) => c.charCodeAt(0).toString()).join(" ") },
  { id: "char-to-hex", label: "字符→16进制(UTF-8)", run: (s) => Array.from(new TextEncoder().encode(s)).map((b) => b.toString(16).padStart(2, "0")).join("") },
  { id: "ascii-decode", label: "10进制码点→字符", run: (s) => s.split(/\s+/).filter(Boolean).map((n) => String.fromCharCode(Number(n))).join("") },
  { id: "decodeURI", label: "解码-decodeURI", run: (s) => decodeURI(s) },
  { id: "encodeURI", label: "编码-encodeURI", run: (s) => encodeURI(s) },
  { id: "decodeURIComponent", label: "解码-decodeURIComponent", run: (s) => decodeURIComponent(s) },
  { id: "encodeURIComponent", label: "编码-encodeURIComponent", run: (s) => encodeURIComponent(s) },
];

const STEP_MAP = new Map(AVAILABLE_STEPS.map((x) => [x.id, x]));
STEP_MAP.set("hex-to-dec", { id: "hex-to-dec", label: "16进制→10进制", run: numHexToDec });
STEP_MAP.set("dec-to-hex", { id: "dec-to-hex", label: "10进制→16进制", run: numDecToHex });
STEP_MAP.set("bin", { id: "bin", label: "字符→2进制码点", run: AVAILABLE_STEPS.find((x) => x.id === "char-to-bin")!.run });
STEP_MAP.set("oct", { id: "oct", label: "字符→8进制码点", run: AVAILABLE_STEPS.find((x) => x.id === "char-to-oct")!.run });
STEP_MAP.set("dec", { id: "dec", label: "字符→10进制码点", run: AVAILABLE_STEPS.find((x) => x.id === "char-to-dec")!.run });
STEP_MAP.set("hex", { id: "hex", label: "字符→16进制(UTF-8)", run: AVAILABLE_STEPS.find((x) => x.id === "char-to-hex")!.run });
STEP_MAP.set("ascii-encode", { id: "ascii-encode", label: "字符→10进制码点", run: AVAILABLE_STEPS.find((x) => x.id === "char-to-dec")!.run });

/** 流程项分组（弹窗左侧展示用），仅包含在列表中显示的 stepId；旧 id 保留兼容由 STEP_MAP 与 migrate 处理 */
const STEP_GROUPS: { title: string; stepIds: string[] }[] = [
  {
    title: "数字进制转换",
    stepIds: [
      "num-hex-to-dec",
      "num-dec-to-hex",
      "num-bin-to-dec",
      "num-dec-to-bin",
      "num-hex-to-bin",
      "num-bin-to-hex",
      "num-oct-to-dec",
      "num-dec-to-oct",
      "num-oct-to-hex",
      "num-hex-to-oct",
    ],
  },
  {
    title: "Base64 与字节",
    stepIds: ["base64-encode", "base64-decode", "hex-to-bytes", "bytes-to-hex", "bytes-to-base64"],
  },
  {
    title: "字符与码点",
    stepIds: ["char-to-bin", "char-to-oct", "char-to-dec", "char-to-hex", "ascii-decode"],
  },
  {
    title: "URI 编解码",
    stepIds: ["decodeURI", "encodeURI", "decodeURIComponent", "encodeURIComponent"],
  },
];

export interface PipelineConfig {
  id: string;
  name: string;
  steps: string[];
}

function generateId() {
  return Math.random().toString(36).slice(2, 12);
}

const DEFAULT_PIPELINES: PipelineConfig[] = [
  { id: generateId(), name: "base64解码→字节转16进制", steps: ["base64-decode", "bytes-to-hex"] },
  { id: generateId(), name: "16进制转字节→base64编码", steps: ["hex-to-bytes", "bytes-to-base64"] },
];

function normalizeSteps(steps: string[]): string[] {
  return steps.filter((id) => id !== "input");
}

const LEGACY_STEP_IDS: Record<string, string> = {
  "hex-to-dec": "num-hex-to-dec",
  "dec-to-hex": "num-dec-to-hex",
  bin: "char-to-bin",
  oct: "char-to-oct",
  dec: "char-to-dec",
  hex: "char-to-hex",
  base64: "base64-encode",
  "ascii-encode": "char-to-dec",
};

/** 迁移旧默认配置的名称与步骤为新默认 */
function migratePipeline(p: PipelineConfig): PipelineConfig {
  const rawSteps = normalizeSteps(p.steps);
  if (p.name === "base64解码得16转10" && rawSteps.join(",") === "base64-decode,dec") {
    return { ...p, name: "base64解码→字节转16进制", steps: ["base64-decode", "bytes-to-hex"] };
  }
  if (p.name === "10转16转base64编码" && rawSteps.join(",") === "hex,base64-encode") {
    return { ...p, name: "16进制转字节→base64编码", steps: ["hex-to-bytes", "bytes-to-base64"] };
  }
  const steps = rawSteps.map((id) => LEGACY_STEP_IDS[id] ?? id);
  return { ...p, steps };
}

function loadPipelines(): PipelineConfig[] {
  if (typeof window === "undefined") return DEFAULT_PIPELINES;
  try {
    const raw = localStorage.getItem(PIPELINE_STORAGE_KEY);
    if (!raw) return DEFAULT_PIPELINES;
    const parsed = JSON.parse(raw) as PipelineConfig[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_PIPELINES;
    const list = parsed.map((p) => migratePipeline({ ...p, steps: p.steps ?? [] }));
    const onlyNormalized = parsed.map((p) => ({ ...p, steps: normalizeSteps(p.steps ?? []) }));
    const changed = list.some((p, i) => p.name !== onlyNormalized[i]?.name || p.steps.join(",") !== onlyNormalized[i]?.steps.join(","));
    if (changed) savePipelines(list);
    return list;
  } catch {
    return DEFAULT_PIPELINES;
  }
}

function savePipelines(list: PipelineConfig[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(list));
}

function runPipeline(config: PipelineConfig, input: string): { result: string; error?: { stepIndex: number; message: string } } {
  let current = input;
  for (let i = 0; i < config.steps.length; i++) {
    const stepId = config.steps[i];
    const step = STEP_MAP.get(stepId);
    if (!step) {
      return { result: "", error: { stepIndex: i, message: `Unknown step: ${stepId}` } };
    }
    try {
      current = step.run(current);
    } catch (e) {
      return {
        result: "",
        error: { stepIndex: i, message: e instanceof Error ? e.message : String(e) },
      };
    }
  }
  return { result: current };
}

function getStepLabel(id: string): string {
  return STEP_MAP.get(id)?.label ?? id;
}

function getPipelineDescription(steps: string[]): string {
  const rest = steps.filter((id) => id !== "input").map(getStepLabel);
  return rest.length === 0 ? "输入数据" : "输入数据 → " + rest.join(" → ");
}

const CARD_STYLE: React.CSSProperties = {
  background: "#fff",
  borderRadius: 8,
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "var(--ant-color-border)",
  color: "var(--ant-color-text-secondary)",
};
const CARD_HOVER_STYLE: React.CSSProperties = {
  color: "rgba(22, 119, 255, 0.85)",
  borderColor: "rgba(22, 119, 255, 0.5)",
};
const ERROR_TEXT_COLOR = "rgba(255, 77, 79, 0.7)";

function SortableStepChip({
  id,
  label,
  onRemove,
}: {
  id: string;
  label: string;
  onRemove: () => void;
}) {
  const [hover, setHover] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    ...CARD_STYLE,
    ...(hover ? CARD_HOVER_STYLE : {}),
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    padding: "6px 12px",
    position: "relative",
    cursor: "grab",
    whiteSpace: "nowrap",
    width: "fit-content",
    flexShrink: 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {hover && (
        <button
          type="button"
          aria-label="Remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 14,
            height: 14,
            transform: "translate(50%, -50%)",
            borderRadius: "50%",
            border: "none",
            background: "#ff4d4f",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            fontSize: 10,
          }}
        >
          <CloseOutlined />
        </button>
      )}
      {label}
    </div>
  );
}

function SortablePipelineCard({
  config,
  onEdit,
}: {
  config: PipelineConfig;
  onEdit: () => void;
}) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<{ stepIndex: number; message: string } | null>(null);
  const { t } = useI18n();

  const handleConvert = useCallback(() => {
    setError(null);
    const { result, error: err } = runPipeline(config, input);
    setOutput(result);
    if (err) setError(err);
  }, [config, input]);

  const description = getPipelineDescription(config.steps);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: config.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
    >
      <Card
        style={{ marginBottom: 16 }}
        styles={{ body: { padding: 16 } }}
        title={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span
              {...attributes}
              {...listeners}
              role="button"
              tabIndex={0}
              aria-label={t("tools.string-pipeline.dragHandle") ?? "Drag to reorder"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px 2px",
                cursor: "grab",
                color: "var(--ant-color-text-tertiary)",
                borderRadius: 4,
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <HolderOutlined style={{ fontSize: 16 }} />
            </span>
            {config.name || t("tools.string-pipeline.untitled")}
          </span>
        }
        extra={
          <Button type="text" size="small" icon={<EditOutlined />} onClick={onEdit}>
            {t("tools.string-pipeline.edit")}
          </Button>
        }
      >
        <div
          style={{
            fontSize: 12,
            color: "var(--ant-color-text-secondary)",
            marginBottom: 12,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
          title={description}
        >
          {description}
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <Input.TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("tools.string-pipeline.input")}
              rows={4}
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", paddingTop: 24 }}>
            <Button type="primary" size="small" onClick={handleConvert}>
              {t("tools.string-pipeline.convert")}
            </Button>
          </div>
          <div style={{ flex: 1, minWidth: 180, position: "relative" }}>
            <Input.TextArea readOnly value={output} placeholder={t("tools.string-pipeline.output")} rows={4} style={{ width: "100%", paddingRight: 40 }} />
            <div style={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}>
              <CopyButton value={output} size="small" variant="text" circle />
            </div>
          </div>
        </div>
        {error && (
          <div
            style={{
              marginTop: 12,
              fontSize: 12,
              color: ERROR_TEXT_COLOR,
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              maxHeight: 80,
              overflow: "hidden",
            }}
          >
            <span style={{ display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical", overflow: "hidden", flex: 1 }}>
              Step {error.stepIndex + 1}: {error.message}
            </span>
            <CopyButton
              value={`Step ${error.stepIndex + 1}: ${error.message}`}
              size="small"
              variant="text"
              className="error-copy-btn"
            >
              <span style={{ color: "rgba(22, 119, 255, 0.85)" }}>{t("common.copyToClipboard")}</span>
            </CopyButton>
          </div>
        )}
      </Card>
    </div>
  );
}

export function StringPipeline() {
  const { t } = useI18n();
  const [pipelines, setPipelines] = useState<PipelineConfig[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftSteps, setDraftSteps] = useState<string[]>([]);
  const [draftStepIds, setDraftStepIds] = useState<string[]>([]);
  const [importInputRef, setImportInputRef] = useState<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setPipelines(loadPipelines());
  }, []);

  const saveList = useCallback((list: PipelineConfig[]) => {
    setPipelines(list);
    savePipelines(list);
  }, []);

  const openAdd = useCallback(() => {
    setEditingId(null);
    setDraftName(t("tools.string-pipeline.untitled"));
    setDraftSteps([]);
    setDraftStepIds([]);
    setModalOpen(true);
  }, [t]);

  const openEdit = useCallback((config: PipelineConfig) => {
    setEditingId(config.id);
    setDraftName(config.name);
    const steps = normalizeSteps(config.steps);
    setDraftSteps(steps);
    setDraftStepIds(steps.map(() => generateId()));
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingId(null);
  }, []);

  const handleSaveModal = useCallback(() => {
    const name = draftName.trim() || t("tools.string-pipeline.untitled");
    const next = editingId
      ? pipelines.map((p) => (p.id === editingId ? { ...p, name, steps: draftSteps } : p))
      : [...pipelines, { id: generateId(), name, steps: draftSteps }];
    setPipelines(next);
    savePipelines(next);
    closeModal();
  }, [editingId, draftName, draftSteps, pipelines, t, closeModal]);

  const openDeleteConfirm = useCallback(() => {
    if (editingId) setDeleteConfirmOpen(true);
  }, [editingId]);

  const handleConfirmDelete = useCallback(() => {
    if (!editingId) return;
    const next = pipelines.filter((p) => p.id !== editingId);
    setPipelines(next);
    savePipelines(next);
    setDeleteConfirmOpen(false);
    closeModal();
  }, [editingId, pipelines, closeModal]);

  const addStep = useCallback((stepId: string) => {
    setDraftSteps((prev) => [...prev, stepId]);
    setDraftStepIds((prev) => [...prev, generateId()]);
  }, []);

  const removeStep = useCallback((index: number) => {
    setDraftSteps((prev) => prev.filter((_, i) => i !== index));
    setDraftStepIds((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(pipelines, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "string-pipeline-config.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [pipelines]);

  const handleImport = useCallback(() => {
    importInputRef?.click();
  }, [importInputRef]);

  const onImportFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = reader.result as string;
          const parsed = JSON.parse(text) as PipelineConfig[];
          if (!Array.isArray(parsed)) throw new Error("Not an array");
          const normalized = parsed.map((p) => ({
            id: p.id || generateId(),
            name: p.name ?? t("tools.string-pipeline.untitled"),
            steps: normalizeSteps(Array.isArray(p.steps) ? p.steps : []),
          }));
          setPipelines((prev) => {
            const next = [...prev, ...normalized];
            savePipelines(next);
            return next;
          });
          message.success(t("tools.string-pipeline.importSuccess"));
        } catch {
          message.error(t("tools.string-pipeline.importError"));
        }
      };
      reader.readAsText(file);
    },
    [t]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handlePipelineDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const from = pipelines.findIndex((p) => p.id === active.id);
      const to = pipelines.findIndex((p) => p.id === over.id);
      if (from === -1 || to === -1) return;
      const next = arrayMove(pipelines, from, to);
      saveList(next);
    },
    [pipelines, saveList]
  );

  const handleStepDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = draftStepIds.indexOf(active.id as string);
    const to = draftStepIds.indexOf(over.id as string);
    if (from === -1 || to === -1) return;
    setDraftSteps((prev) => arrayMove(prev, from, to));
    setDraftStepIds((prev) => arrayMove(prev, from, to));
  }, [draftStepIds]);

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
          {t("tools.string-pipeline.add")}
        </Button>
        <Button icon={<ImportOutlined />} onClick={handleImport}>
          {t("tools.string-pipeline.import")}
        </Button>
        <input
          ref={setImportInputRef}
          type="file"
          accept=".json,application/json"
          style={{ display: "none" }}
          onChange={onImportFile}
        />
        <Button icon={<ExportOutlined />} onClick={handleExport}>
          {t("tools.string-pipeline.export")}
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePipelineDragEnd}>
        <SortableContext items={pipelines.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          {pipelines.map((config) => (
            <SortablePipelineCard key={config.id} config={config} onEdit={() => openEdit(config)} />
          ))}
        </SortableContext>
      </DndContext>

      <Modal
        title={editingId ? t("tools.string-pipeline.edit") : t("tools.string-pipeline.add")}
        open={modalOpen}
        onCancel={closeModal}
        mask={{ closable: false }}
        width={720}
        style={{ minHeight: 400, maxHeight: "85vh" }}
        styles={{ body: { maxHeight: "calc(85vh - 110px)", overflow: "auto" } }}
        footer={
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div>
              {editingId ? (
                <Button key="delete" type="primary" danger icon={<DeleteOutlined />} onClick={openDeleteConfirm}>
                  {t("tools.string-pipeline.delete")}
                </Button>
              ) : null}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button key="cancel" onClick={closeModal}>
                {t("tools.string-pipeline.cancel")}
              </Button>
              <Button key="save" type="primary" onClick={handleSaveModal}>
                {t("tools.string-pipeline.save")}
              </Button>
            </div>
          </div>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder={t("tools.string-pipeline.nameLabel")}
          />
        </div>
        <div style={{ display: "flex", gap: 16, minHeight: 320 }}>
          <div
            style={{
              flex: "0 0 200px",
              border: "1px solid var(--ant-color-border)",
              borderRadius: 8,
              padding: 8,
              overflowY: "auto",
              maxHeight: 320,
            }}
          >
            {STEP_GROUPS.map((group) => (
              <div key={group.title} style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--ant-color-text-tertiary)",
                    marginBottom: 6,
                    paddingLeft: 4,
                    fontWeight: 600,
                  }}
                >
                  {group.title}
                </div>
                {group.stepIds.map((stepId) => {
                  const step = STEP_MAP.get(stepId);
                  if (!step) return null;
                  return (
                    <div
                      key={stepId}
                      role="button"
                      tabIndex={0}
                      onClick={() => addStep(stepId)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          addStep(stepId);
                        }
                      }}
                      style={{
                        padding: "6px 10px",
                        marginBottom: 4,
                        borderRadius: 6,
                        cursor: "pointer",
                        background: "var(--ant-color-fill-quaternary)",
                        fontSize: 12,
                      }}
                    >
                      {step.label}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div
            style={{
              flex: 1,
              border: "1px solid var(--ant-color-border)",
              borderRadius: 8,
              padding: 8,
              paddingTop: 14,
              paddingRight: 14,
              overflowY: "auto",
              maxHeight: 320,
              minHeight: 120,
              display: "flex",
              flexWrap: "wrap",
              alignContent: "flex-start",
              gap: 8,
            }}
          >
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleStepDragEnd}>
              <SortableContext items={draftStepIds} strategy={rectSortingStrategy}>
                {draftSteps.map((stepId, idx) => {
                  const sortableId = draftStepIds[idx] ?? `step-${idx}`;
                  return (
                    <SortableStepChip
                      key={sortableId}
                      id={sortableId}
                      label={getStepLabel(stepId)}
                      onRemove={() => removeStep(idx)}
                    />
                  );
                })}
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </Modal>

      <Modal
        title={t("tools.string-pipeline.deleteConfirm")}
        open={deleteConfirmOpen}
        onCancel={() => setDeleteConfirmOpen(false)}
        onOk={handleConfirmDelete}
        okText={t("tools.string-pipeline.delete")}
        okType="danger"
        cancelText={t("tools.string-pipeline.cancel")}
      />
    </div>
  );
}
