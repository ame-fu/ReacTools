"use client";

import React, { useMemo, useState, useDeferredValue } from "react";
import { Card, Col, Form, Input, Row, message } from "antd";
import Fuse, { type IFuseOptions } from "fuse.js";
import emojiUnicodeData from "unicode-emoji-json";
import emojiKeywords from "emojilib";

interface EmojiItem {
  emoji: string;
  name: string;
  group: string;
  title: string;
  keywords: string[];
  keywordsStr: string;
  codePoints: string | undefined;
  unicode: string;
}

function escapeUnicode(emoji: string) {
  return emoji
    .split("")
    .map((unit) => `\\u${unit.charCodeAt(0).toString(16).padStart(4, "0")}`)
    .join("");
}

function getEmojiCodePoints(emoji: string) {
  const cp = emoji.codePointAt(0);
  return cp != null ? `0x${cp.toString(16)}` : undefined;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function buildEmojiList(): EmojiItem[] {
  const list: EmojiItem[] = [];
  for (const [emoji, info] of Object.entries(emojiUnicodeData as Record<string, { name: string; group: string }>)) {
    const keywords: string[] = (emojiKeywords as Record<string, string[] | undefined>)[emoji] ?? [];
    list.push({
      emoji,
      name: info.name,
      group: info.group,
      title: capitalize(info.name),
      keywords,
      keywordsStr: keywords.join(" "),
      codePoints: getEmojiCodePoints(emoji),
      unicode: escapeUnicode(emoji),
    });
  }
  return list;
}

const EMOJI_LIST = buildEmojiList();

const FUSE_OPTIONS: IFuseOptions<EmojiItem> = {
  keys: [
    "group",
    { name: "name", weight: 3 },
    "keywordsStr",
    "unicode",
    "codePoints",
    "emoji",
  ],
  threshold: 0.3,
  ignoreLocation: true,
};

function EmojiCard({
  item,
  onCopy,
}: {
  item: EmojiItem;
  onCopy: (text: string, msg: string) => void;
}) {
  return (
    <Card
      size="small"
      style={{ cursor: "default" }}
      styles={{ body: { padding: "8px 12px", display: "flex", alignItems: "center", gap: 12 } }}
    >
      <span
        role="button"
        tabIndex={0}
        style={{ fontSize: 28, cursor: "pointer" }}
        onClick={() => onCopy(item.emoji, `Emoji ${item.emoji} copied to the clipboard`)}
        onKeyDown={(e) => e.key === "Enter" && onCopy(item.emoji, `Emoji ${item.emoji} copied`)}
      >
        {item.emoji}
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.title}
        </div>
        <div style={{ fontSize: 12, opacity: 0.7, fontFamily: "monospace", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {item.codePoints && (
            <span
              role="button"
              tabIndex={0}
              style={{ cursor: "pointer" }}
              onClick={() => onCopy(item.codePoints!, `Code points copied`)}
              onKeyDown={(e) => e.key === "Enter" && onCopy(item.codePoints!, "")}
            >
              {item.codePoints}
            </span>
          )}
          <span
            role="button"
            tabIndex={0}
            style={{ cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis" }}
            onClick={() => onCopy(item.unicode, `Unicode copied`)}
            onKeyDown={(e) => e.key === "Enter" && onCopy(item.unicode, "")}
          >
            {item.unicode}
          </span>
        </div>
      </div>
    </Card>
  );
}

export function EmojiPicker() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const fuse = useMemo(() => new Fuse(EMOJI_LIST, FUSE_OPTIONS), []);
  const searchResult = useMemo(() => {
    const q = deferredSearch.trim();
    if (q === "") return [];
    return fuse.search(q).map((r) => r.item);
  }, [deferredSearch, fuse]);

  const grouped = useMemo(() => {
    const map = new Map<string, EmojiItem[]>();
    for (const item of EMOJI_LIST) {
      const list = map.get(item.group) ?? [];
      list.push(item);
      map.set(item.group, list);
    }
    return Array.from(map.entries()).map(([group, emojiInfos]) => ({ group, emojiInfos }));
  }, []);

  const copy = (text: string, msg: string) => {
    navigator.clipboard.writeText(text).then(
      () => message.success(msg || "Copied to clipboard"),
      () => message.error("Copy failed"),
    );
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <Form layout="vertical">
        <Form.Item label="Search emojis">
          <Input.Search
            placeholder="Search emojis (e.g. 'smile')..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ maxWidth: 600 }}
          />
        </Form.Item>
      </Form>

      {deferredSearch.trim().length > 0 ? (
        <>
          {searchResult.length === 0 ? (
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 16 }}>No results</div>
          ) : (
            <>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Search result</div>
              <Row gutter={[8, 8]}>
                {searchResult.map((item) => (
                  <Col xs={24} sm={12} md={8} lg={6} xl={4} key={`${item.emoji}-${item.name}`}>
                    <EmojiCard item={item} onCopy={copy} />
                  </Col>
                ))}
              </Row>
            </>
          )}
        </>
      ) : (
        grouped.map(({ group, emojiInfos }) => (
          <div key={group} style={{ marginTop: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{group}</div>
            <Row gutter={[8, 8]}>
              {emojiInfos.map((item) => (
                <Col xs={24} sm={12} md={8} lg={6} xl={4} key={`${item.emoji}-${item.name}`}>
                  <EmojiCard item={item} onCopy={copy} />
                </Col>
              ))}
            </Row>
          </div>
        ))
      )}
    </div>
  );
}
