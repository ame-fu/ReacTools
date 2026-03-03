"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Form, ColorPicker, Input, Button, Space, Select } from "antd";
import type { Color } from "antd/es/color-picker";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

const DEBOUNCE_MS = 300;
const DEFAULT_COLOR_FIRST = "#c00000";
const DEFAULT_COLOR_AGAIN = "#ed7d31";
const FONT_SIZE_OPTIONS = [12, 14, 16, 18, 20, 24];
const DEFAULT_FONT_SIZE = 16;
const LINE_HEIGHT = 1.5;

const SAMPLE_TEXT =
  "小老虎在草地上修了一间美美的房子，房子上还有自己的头像。小老虎在房子里香香的睡了一觉。早上，阳光把小老虎晒醒了。呀！我的房子去哪了？小老虎很伤心。他到处跑着找房子，呀！对不起，我太着急了我的房子不见了！呀，房子怎么会不见呢？我也不明白，早上我一醒来就不见了。明天是我的生日，狮子哥哥要来我家，没有地方住，怎么办？没事，我们帮你一起找。大家来到草地上的小狼家。小狼正在做面包。你们来得正好，快来吃我做的面包。朋友们一起吃小狼做的面包，香香地，很好吃。呀，别总是吃，我的房子还没找到呢！别急，我们好好地找，总会找到的。小狼也和大家一起来到大树下，找到了小猴子的家。小猴子正在洗水果。大家快来吃水果呀！我有好多好多水果。朋友们一起吃小猴子的水果，甜甜的，很好吃。呀，别总是吃，小老虎的房子还没找到呢！别急，我们一起找，总会找到的。小猴子也和大家一起来到小山里，找到了大狗熊的家。大狗熊正在冲甜甜水。你们来得正好，快来尝尝我的甜甜水。朋友们一起喝大狗熊的甜甜水，大家好开心。呀，别总是喝，小老虎的房子还没找到呢！别急，我和你们一起找。大狗熊也和大家一起来到花园里，找到了小狐狸的家。小狐狸正在给七色花洒水。大家快来看七色花呀！小狐狸给了大家好多七色花。大家把七色花别在衣服上，好开心。呀，小老虎的房子还没找到呢！别急，我和你们一起找。小狐狸也和大家一起找。现在，森林里的朋友们都来帮小老虎找房子了。一只小鹿跑来了。我看见小老虎的房子了，它到海滩去了。大家马上跑到海滩。呀，小老虎的房子出现了，还在走呢！呀，我的房子自己会走！我们快去抓住它！呀——这是谁？房子下面伸出了一个头！原来，小老虎把房子修在了大乌龟身上！房子一动，正在睡觉的小老虎就飞出去了！呀！没想到我身上有个房子！小老虎的房子找到了。朋友们都来小老虎家开生日会，狮子哥哥也来了，大家好开心。可是，小鹿怎么没有来呢？";
const DEFAULT_KEYWORDS = ["熊", "猴", "鹿", "虎", "狮", "狐", "狸", "狼", "现", "总"];

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripBorderStyles(html: string): string {
  return html.replace(
    /style="([^"]*)"/gi,
    (_, style) => {
      const cleaned = style
        .split(";")
        .map((decl: string) => decl.trim())
        .filter((decl: string) => {
          const prop = decl.split(":")[0].trim().toLowerCase();
          return prop && !/^border|^outline|^border-|^outline-|^-webkit-border|^-moz-border/.test(prop);
        })
        .join("; ");
      return `style="${cleaned}"`;
    },
  );
}

interface Range {
  start: number;
  end: number;
  firstOccurrence: boolean;
}

function getRanges(text: string, keywords: string[]): Range[] {
  const ranges: Range[] = [];
  for (const kw of keywords) {
    const k = kw.trim();
    if (!k) continue;
    let pos = 0;
    let first = true;
    while (true) {
      const i = text.indexOf(k, pos);
      if (i === -1) break;
      ranges.push({ start: i, end: i + k.length, firstOccurrence: first });
      first = false;
      pos = i + 1;
    }
  }
  ranges.sort((a, b) => a.start - b.start);
  return ranges;
}

function mergeRanges(ranges: Range[]): Range[] {
  const out: Range[] = [];
  for (const r of ranges) {
    let start = r.start;
    const end = r.end;
    while (out.length && out[out.length - 1].end > start) {
      start = out[out.length - 1].end;
      if (start >= end) break;
    }
    if (start < end) out.push({ start, end, firstOccurrence: r.firstOccurrence });
  }
  return out;
}

function getSegments(
  text: string,
  keywords: string[],
  colorFirst: string,
  colorAgain: string,
): { text: string; color?: string }[] {
  const ranges = mergeRanges(getRanges(text, keywords));
  const segments: { text: string; color?: string }[] = [];
  let pos = 0;
  for (const r of ranges) {
    if (pos < r.start) segments.push({ text: text.slice(pos, r.start) });
    segments.push({
      text: text.slice(r.start, r.end),
      color: r.firstOccurrence ? colorFirst : colorAgain,
    });
    pos = r.end;
  }
  if (pos < text.length) segments.push({ text: text.slice(pos) });
  return segments;
}

export function KeywordHighlighter() {
  const { t } = useI18n();
  const [inputText, setInputText] = useState(SAMPLE_TEXT);
  const [debouncedText, setDebouncedText] = useState(SAMPLE_TEXT);
  const [colorFirst, setColorFirst] = useState(DEFAULT_COLOR_FIRST);
  const [colorAgain, setColorAgain] = useState(DEFAULT_COLOR_AGAIN);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [keywords, setKeywords] = useState<string[]>(DEFAULT_KEYWORDS);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedText(inputText);
      debounceRef.current = null;
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputText]);

  const segments = useMemo(
    () => getSegments(debouncedText, keywords, colorFirst, colorAgain),
    [debouncedText, keywords, colorFirst, colorAgain],
  );

  const [hoveredDeleteIndex, setHoveredDeleteIndex] = useState<number | null>(null);
  const addKeyword = () => setKeywords((prev) => [...prev, ""]);
  const removeKeyword = (index: number) =>
    setKeywords((prev) => prev.filter((_, i) => i !== index));
  const setKeywordAt = (index: number, value: string) =>
    setKeywords((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });

  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!previewRef.current) return;
    const htmlParts = segments.map((seg) =>
      seg.color
        ? `<span style="color:${seg.color};font-size:${fontSize}px">${escapeHtml(seg.text)}</span>`
        : escapeHtml(seg.text),
    );
    const bodyStyle = [
      "font-size:" + fontSize + "px",
      "line-height:" + LINE_HEIGHT,
      "white-space:pre-wrap",
      "word-break:break-word",
      "margin:0",
      "padding:0",
    ].join(";");
    previewRef.current.innerHTML = `<div style="${bodyStyle}">${htmlParts.join("")}</div>`;
  }, [segments, fontSize]);

  return (
    <div>
      <Form layout="vertical">
        <Form.Item label={<span style={{ fontWeight: 600 }}>{t("tools.keyword-highlighter.inputLabel")}</span>}>
          <InputCopyable
            value={inputText}
            onChange={setInputText}
            multiline
            rows={5}
            placeholder={t("tools.keyword-highlighter.inputPlaceholder")}
            style={{ fontFamily: "inherit" }}
          />
        </Form.Item>

        <Form.Item
          label={
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 12 }}>
              <span style={{ fontWeight: 600 }}>{t("tools.keyword-highlighter.keywordsLabel")}</span>
              <Button type="dashed" size="small" onClick={addKeyword} icon={<PlusOutlined />}>
                {t("tools.keyword-highlighter.addShort")}
              </Button>
            </div>
          }
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 8,
              width: "100%",
              justifyItems: "start",
            }}
          >
            {keywords.map((kw, index) => (
              <Input
                key={index}
                value={kw}
                onChange={(e) => setKeywordAt(index, e.target.value)}
                placeholder={t("tools.keyword-highlighter.keywordPlaceholder")}
                maxLength={20}
                style={{ width: "100%", maxWidth: 140 }}
                suffix={
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeKeyword(index);
                    }}
                    onMouseEnter={() => setHoveredDeleteIndex(index)}
                    onMouseLeave={() => setHoveredDeleteIndex(null)}
                    aria-label={t("tools.keyword-highlighter.removeKeyword")}
                    style={{
                      minWidth: 28,
                      padding: "0 6px",
                      background: hoveredDeleteIndex === index
                        ? "color-mix(in srgb, var(--ant-color-warning) 50%, transparent)"
                        : "color-mix(in srgb, var(--ant-color-warning) 70%, transparent)",
                      color: "#fff",
                    }}
                  />
                }
              />
            ))}
          </div>
        </Form.Item>

        <Form.Item label={<span style={{ fontWeight: 600 }}>{t("tools.keyword-highlighter.settingsLabel")}</span>}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              alignItems: "flex-end",
            }}
          >
            <Space orientation="horizontal" size="small" align="center">
              <span style={{ opacity: 0.85, fontWeight: 600 }}>{t("tools.keyword-highlighter.firstColorLabel")}</span>
              <ColorPicker
                value={colorFirst}
                onChange={(_: Color, hex: string) => setColorFirst(hex)}
                showText
              />
            </Space>
            <Space orientation="horizontal" size="small" align="center">
              <span style={{ opacity: 0.85, fontWeight: 600 }}>{t("tools.keyword-highlighter.againColorLabel")}</span>
              <ColorPicker
                value={colorAgain}
                onChange={(_: Color, hex: string) => setColorAgain(hex)}
                showText
              />
            </Space>
            <Space orientation="horizontal" size="small" align="center">
              <span style={{ opacity: 0.85, fontWeight: 600 }}>{t("tools.keyword-highlighter.fontSizeLabel")}</span>
              <Select
                value={fontSize}
                onChange={setFontSize}
                options={FONT_SIZE_OPTIONS.map((n) => ({ value: n, label: `${n}px` }))}
                style={{ width: 90 }}
              />
            </Space>
          </div>
        </Form.Item>

        <Form.Item label={<span style={{ fontWeight: 600 }}>{t("tools.keyword-highlighter.previewLabel")}</span>}>
          <div
            ref={previewRef}
            contentEditable
            suppressContentEditableWarning
            style={{
              minHeight: 60,
              padding: "12px 16px",
              backgroundColor: "#fff",
              borderRadius: 8,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          />
        </Form.Item>
      </Form>
    </div>
  );
}
