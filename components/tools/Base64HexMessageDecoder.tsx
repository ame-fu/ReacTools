"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card, Button, Input } from "antd";
import { CopyButton } from "@/components/ui/CopyButton";
import { useI18n } from "@/lib/i18n/context";

/* 与 app/11.html 一致的 SVG 图标 */
const SvgCodeArrows = () => (
  <svg className="w-8 h-8" style={{ color: "var(--ant-color-primary)" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
);
const SvgAlertCircle = () => (
  <svg className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
);
const SvgArrowDown = () => (
  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>
);
const SvgShieldCheck = () => (
  <svg className="w-3.5 h-3.5" style={{ width: 14, height: 14 }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>
);
const SvgClock = () => (
  <svg className="w-3.5 h-3.5" style={{ width: 14, height: 14 }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const SvgActivity = () => (
  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l3-9 5 18 3-9h5" /></svg>
);
const SvgRefreshCw = () => (
  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
);
const SvgCopy = () => (
  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
);

/** 工具页头部图标，与 11.html 一致 */
export function Base64HexMessageDecoderHeaderIcon() {
  return <SvgCodeArrows />;
}

const CRC_CCITT_INIT = 0x1d0f;
const CRC_POLY = 0x1021;

function crcCcitt1d0f(bytes: number[]): number {
  let crc = CRC_CCITT_INIT;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i] << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ CRC_POLY) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc & 0xffff;
}

/** 下一分钟 00 秒的 Unix 秒 */
function getNextMinuteUnixSeconds(): number {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 1);
  d.setSeconds(0, 0);
  return Math.floor(d.getTime() / 1000);
}

function timestampToFourBytesBe(sec: number): number[] {
  return [
    Math.floor(sec / 16777216) & 0xff,
    Math.floor(sec / 65536) & 0xff,
    Math.floor(sec / 256) & 0xff,
    sec & 0xff,
  ];
}

/** 单行 Base64 → 空格分隔的 hex */
function base64LineToHexLine(base64: string): string {
  const binary = atob(base64.replace(/\s/g, ""));
  const hexArr: string[] = [];
  for (let i = 0; i < binary.length; i++) {
    hexArr.push((binary.charCodeAt(i) & 0xff).toString(16).padStart(2, "0"));
  }
  return hexArr.join(" ");
}

/** 多行 Base64 解码为多行 hex（每行独立） */
function decodeBase64ToHexLines(input: string): string[] {
  const lines = input.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines.map((line) => base64LineToHexLine(line));
}

/** 格式化单行 hex：只保留 0-9a-fA-F，每两个字符加空格 */
function formatHexLine(line: string): string {
  const clean = line.replace(/[^0-9a-fA-F]/g, "");
  const pairs = clean.match(/.{1,2}/g) || [];
  return pairs.join(" ");
}

/** 从一行 hex 字符串解析出字节数组 */
function parseHexLineToBytes(line: string): number[] {
  const clean = line.replace(/[^0-9a-fA-F]/g, "");
  const bytes: number[] = [];
  for (let i = 0; i + 2 <= clean.length; i += 2) {
    bytes.push(parseInt(clean.slice(i, i + 2), 16));
  }
  return bytes;
}

/** 字节数组 → 空格分隔 hex 行 */
function bytesToHexLine(bytes: number[]): string {
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join(" ");
}

/** 字节数组 → Base64 */
function bytesToBase64(bytes: number[]): string {
  return btoa(String.fromCharCode(...bytes));
}

/** 根据当前 hex 文本计算光标所在字节（从 1 开始） */
function getCursorByteIndex(text: string | undefined | null, cursorOffset: number): number {
  if (text == null || typeof text !== "string") return 1;
  const before = text.slice(0, Math.max(0, cursorOffset));
  const hexChars = before.replace(/[^0-9a-fA-F]/g, "").length;
  return Math.floor(hexChars / 2) + 1;
}

export function Base64HexMessageDecoder() {
  const { t } = useI18n();
  const [base64Input, setBase64Input] = useState("");
  const [hexLines, setHexLines] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [base64Output, setBase64Output] = useState("");
  const [cursorByte, setCursorByte] = useState(1);
  const [targetTimestamp, setTargetTimestamp] = useState(0);
  const [targetTimeStr, setTargetTimeStr] = useState("");
  const [targetHexStr, setTargetHexStr] = useState("");
  const hexInputRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);

  const updateTargetTime = useCallback(() => {
    const sec = getNextMinuteUnixSeconds();
    setTargetTimestamp(sec);
    const d = new Date(sec * 1000);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    setTargetTimeStr(`${hh}:${mm}:${ss}`);
    const hex = sec.toString(16).padStart(8, "0");
    setTargetHexStr(
      `${hex.slice(0, 2)} ${hex.slice(2, 4)} ${hex.slice(4, 6)} ${hex.slice(6, 8)}`,
    );
  }, []);

  useEffect(() => {
    updateTargetTime();
    const id = setInterval(updateTargetTime, 1000);
    return () => clearInterval(id);
  }, [updateTargetTime]);

  const handleDecode = useCallback(() => {
    setErrorMsg(null);
    const raw = base64Input.trim();
    if (!raw) {
      setHexLines("");
      setBase64Output("");
      return;
    }
    try {
      const lines = decodeBase64ToHexLines(raw);
      setHexLines(lines.join("\n"));
      setBase64Output("");
    } catch {
      setErrorMsg(t("tools.base64-hex-message-decoder.invalidBase64"));
    }
  }, [base64Input, t]);

  const formatHexInput = useCallback(() => {
    const lines = hexLines.split("\n");
    const formatted = lines.map(formatHexLine).filter(Boolean);
    setHexLines(formatted.join("\n"));
  }, [hexLines]);

  const handleEncode = useCallback(() => {
    setErrorMsg(null);
    const formattedLines = hexLines
      .split("\n")
      .map((l) => formatHexLine(l.trim()))
      .filter(Boolean);
    if (formattedLines.length === 0) {
      setErrorMsg(t("tools.base64-hex-message-decoder.needHexData"));
      return;
    }
    try {
      const updatedLines: string[] = [];
      const outB64: string[] = [];
      const ts = getNextMinuteUnixSeconds();
      const tsBytes = timestampToFourBytesBe(ts);

      for (let lineIdx = 0; lineIdx < formattedLines.length; lineIdx++) {
        const line = formattedLines[lineIdx];
        const hexClean = line.replace(/[^0-9a-fA-F]/g, "");
        if (hexClean.length % 2 !== 0) {
          setErrorMsg(
            t("tools.base64-hex-message-decoder.evenLength").replace("{line}", String(lineIdx + 1)),
          );
          return;
        }
        let bytes = parseHexLineToBytes(line);
        if (bytes.length < 10) {
          setErrorMsg(
            t("tools.base64-hex-message-decoder.min10Bytes").replace("{line}", String(lineIdx + 1)),
          );
          return;
        }
        const len = bytes.length;
        const payloadForCrc = bytes.slice(0, len - 10);
        const crc = crcCcitt1d0f(payloadForCrc);
        bytes = [...bytes];
        bytes[len - 10] = (crc >> 8) & 0xff;
        bytes[len - 9] = crc & 0xff;
        bytes[len - 8] = tsBytes[0];
        bytes[len - 7] = tsBytes[1];
        bytes[len - 6] = tsBytes[2];
        bytes[len - 5] = tsBytes[3];
        updatedLines.push(bytesToHexLine(bytes));
        outB64.push(bytesToBase64(bytes));
      }
      setHexLines(updatedLines.join("\n"));
      setBase64Output(outB64.join("\n"));
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : t("tools.base64-hex-message-decoder.encodeFailed"));
    }
  }, [hexLines, t]);

  const syncScroll = useCallback(() => {
    const ta = hexInputRef.current;
    const back = backdropRef.current;
    const ruler = rulerRef.current;
    if (ta && back) {
      back.scrollTop = ta.scrollTop;
      back.scrollLeft = ta.scrollLeft;
    }
    if (ta && ruler) {
      ruler.scrollLeft = ta.scrollLeft;
    }
  }, []);

  const updateCursorPos = useCallback(() => {
    const ta = hexInputRef.current;
    if (!ta) return;
    const idx = getCursorByteIndex(ta.value ?? "", ta.selectionStart ?? 0);
    setCursorByte(idx);
  }, []);

  const highlightHtml = useCallback((text: string) => {
    const lines = text.split("\n");
    const crcStyle = "color:#047857;background:#d1fae5;border-radius:2px;";
    const tsStyle = "color:#b45309;background:#fef3c7;border-radius:2px;";
    const last4Style = "color:#6d28d9;background:#ede9fe;border-radius:2px;";
    const defaultStyle = "color:#0f172a;";
    return lines
      .map((line) => {
        const hexPairs = line.match(/[0-9a-fA-F]{1,2}/g) || [];
        const total = hexPairs.length;
        let byteIdx = 0;
        const parts: string[] = [];
        const regex = /([0-9a-fA-F]{1,2})|([^0-9a-fA-F]+)/gi;
        let m: RegExpExecArray | null;
        while ((m = regex.exec(line)) !== null) {
          if (m[1]) {
            const i = byteIdx++;
            let style = defaultStyle;
            if (total >= 10) {
              if (i === total - 10 || i === total - 9) style = crcStyle;
              else if (i >= total - 8 && i <= total - 5) style = tsStyle;
              else if (i >= total - 4) style = last4Style;
            }
            parts.push(`<span style="${style}">${m[1]}</span>`);
          } else if (m[2]) {
            parts.push(
              `<span>${m[2].replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>`,
            );
          }
        }
        return parts.join("");
      })
      .join("\n");
  }, []);

  const rulerLength = (() => {
    const lines = hexLines.split("\n");
    let max = 16;
    for (const line of lines) {
      const n = line.replace(/[^0-9a-fA-F]/g, "").length / 2;
      if (n > max) max = Math.ceil(n);
    }
    return max + 4;
  })();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {errorMsg && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: 16,
            color: "var(--ant-color-error)",
            background: "var(--ant-color-error-bg)",
            borderRadius: 8,
            border: "1px solid var(--ant-color-error-border)",
          }}
        >
          <SvgAlertCircle />
          <p style={{ margin: 0, fontSize: 14 }}>{errorMsg}</p>
        </div>
      )}

      <Card title={t("tools.base64-hex-message-decoder.decodeTitle")}>
        <Input.TextArea
          value={base64Input}
          onChange={(e) => setBase64Input(e.target.value)}
          placeholder={t("tools.base64-hex-message-decoder.base64Placeholder")}
          rows={3}
          style={{ fontFamily: "monospace", marginBottom: 12 }}
        />
        <Button type="primary" onClick={handleDecode} icon={<SvgArrowDown />}>
          {t("tools.base64-hex-message-decoder.decode")}
        </Button>
      </Card>

      <Card
        title={
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
            <span>{t("tools.base64-hex-message-decoder.hexTitle")}</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 400,
                color: "var(--ant-color-text-tertiary)",
              }}
            >
              {t("tools.base64-hex-message-decoder.multiLineHint")}
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                padding: "4px 12px",
                borderRadius: 9999,
                background: "var(--ant-color-success-bg)",
                color: "var(--ant-color-success)",
                border: "1px solid var(--ant-color-success-border)",
              }}
            >
              <SvgShieldCheck />
              {t("tools.base64-hex-message-decoder.autoCrc")}
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                padding: "4px 12px",
                borderRadius: 9999,
                background: "var(--ant-color-warning-bg)",
                color: "var(--ant-color-warning)",
                border: "1px solid var(--ant-color-warning-border)",
              }}
            >
              <SvgClock />
              {t("tools.base64-hex-message-decoder.injectTime")}: {targetHexStr}
            </span>
          </div>
        }
      >
        {/* 图例 (Legend)：与 11.html 一致，色块 + 文字 */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, fontSize: 12, marginBottom: 4 }}>
          <span style={{ color: "var(--ant-color-text-secondary)" }}>{t("tools.base64-hex-message-decoder.legend")}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 12, height: 12, background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: 2 }} />
            <span style={{ color: "#047857" }}>{t("tools.base64-hex-message-decoder.legendCrc")}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 12, height: 12, background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 2 }} />
            <span style={{ color: "#b45309" }}>{t("tools.base64-hex-message-decoder.legendTs")}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 12, height: 12, background: "#ede9fe", border: "1px solid #c4b5fd", borderRadius: 2 }} />
            <span style={{ color: "#6d28d9" }}>{t("tools.base64-hex-message-decoder.legendLast4")}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 12, height: 12, background: "var(--ant-color-fill-tertiary)", border: "1px solid var(--ant-color-border)", borderRadius: 2 }} />
            <span style={{ color: "var(--ant-color-text)" }}>{t("tools.base64-hex-message-decoder.legendOther")}</span>
          </div>
        </div>
        {/* 报文标尺和带高亮的输入框：与 11.html 一致，包含着色层和文本区域的相对容器 */}
        <div
          className="hex-decoder-box"
          style={{
            border: "1px solid var(--ant-color-border)",
            borderRadius: 8,
            overflow: "hidden",
            background: "var(--ant-color-bg-container)",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
            transition: "box-shadow 0.2s, border-color 0.2s",
          }}
        >
          <div
            ref={rulerRef}
            style={{
              padding: "8px 12px",
              fontFamily: "monospace",
              fontSize: 14,
              color: "var(--ant-color-text-tertiary)",
              borderBottom: "1px solid var(--ant-color-border)",
              overflowX: "hidden",
              whiteSpace: "nowrap",
              userSelect: "none",
              background: "var(--ant-color-fill-quaternary)",
            }}
          >
            {Array.from({ length: rulerLength }, (_, i) => (i + 1).toString().padStart(2, "0")).join(" ")}
          </div>
          <div
            className="hex-decoder-scroll"
            style={{
              position: "relative",
              width: "100%",
              height: 128,
              background: "var(--ant-color-fill-quaternary)",
              overflow: "hidden",
            }}
          >
            {/* 着色层 (Backdrop)：与 11.html 一致，与容器同尺寸，通过 syncScroll 同步 scrollTop/scrollLeft */}
            <div
              ref={backdropRef}
              className="hex-decoder-backdrop"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                padding: "8px 12px",
                fontFamily: "monospace",
                fontSize: 14,
                whiteSpace: "pre",
                overflow: "hidden",
                pointerEvents: "none",
                lineHeight: 1.5,
                zIndex: 0,
              }}
              aria-hidden
              dangerouslySetInnerHTML={{
                __html: hexLines
                  ? highlightHtml(hexLines)
                  : '<span style="color: var(--ant-color-text-tertiary)">0d 07 84 f0 02 01 9a 71 69 51 0b 3e 31 37 34 31...</span>',
              }}
            />
            {/* 真实输入框 (透明文本，真实光标)，与 11.html 一致 */}
            <textarea
              ref={hexInputRef}
              className="hex-decoder-scroll"
              value={hexLines}
              onChange={(e) => setHexLines(e.target.value)}
              onBlur={formatHexInput}
              onScroll={syncScroll}
              onClick={updateCursorPos}
              onKeyUp={updateCursorPos}
              onSelect={updateCursorPos}
              onInput={() => {
                syncScroll();
                updateCursorPos();
              }}
              placeholder="0d 07 84 f0 02 01 9a 71 69 51 0b 3e 31 37 34 31..."
              wrap="off"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: "100%",
                height: "100%",
                fontFamily: "monospace",
                fontSize: 14,
                lineHeight: 1.5,
                background: "transparent",
                color: "transparent",
                caretColor: "var(--ant-color-text)",
                resize: "none",
                border: "none",
                padding: "8px 12px",
                outline: "none",
                overflow: "auto",
              }}
            />
          </div>
        </div>
        {/* 光标位置提示：与 11.html 一致，带图标与说明 */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 8, fontSize: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "var(--ant-color-primary)",
              fontWeight: 500,
              padding: "4px 12px",
              borderRadius: 9999,
              background: "var(--ant-color-primary-bg)",
              border: "1px solid var(--ant-color-primary-border)",
            }}
          >
            <SvgActivity />
            <span>{t("tools.base64-hex-message-decoder.cursorAt").replace("{n}", String(cursorByte))}</span>
          </div>
          <span style={{ fontSize: 12, color: "var(--ant-color-text-tertiary)" }}>（{t("tools.base64-hex-message-decoder.clickToTrack")}）</span>
        </div>
        <p style={{ fontSize: 12, color: "var(--ant-color-text-secondary)", marginTop: 12, marginBottom: 12 }}>
          {t("tools.base64-hex-message-decoder.encodeHint")}
          <span style={{ fontFamily: "monospace", background: "var(--ant-color-fill-quaternary)", padding: "0 4px", borderRadius: 4 }}>
            {targetTimeStr}
          </span>
        </p>
        <Button type="primary" block size="large" onClick={handleEncode} icon={<SvgRefreshCw />}>
          {t("tools.base64-hex-message-decoder.injectAndEncode")}
        </Button>
      </Card>

      <Card title={t("tools.base64-hex-message-decoder.encodedTitle")}>
        <div
          style={{
            minHeight: 64,
            padding: 16,
            background: "var(--ant-color-fill-quaternary)",
            borderRadius: 8,
            border: "1px solid var(--ant-color-border)",
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {base64Output ? (
            <>
              <span style={{ fontFamily: "monospace", fontSize: 13, wordBreak: "break-all", flex: 1 }}>
                {base64Output}
              </span>
              <CopyButton value={base64Output} size="small" variant="default">
                <SvgCopy /> {t("tools.base64-hex-message-decoder.copyResult")}
              </CopyButton>
            </>
          ) : (
            <span style={{ color: "var(--ant-color-text-tertiary)" }}>
              {t("tools.base64-hex-message-decoder.waitingEncode")}
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}
