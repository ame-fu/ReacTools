"use client";

import React, { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";

export default function AboutContent() {
  const { t } = useI18n();
  const content = t("about.content");
  const [html, setHtml] = useState("");

  useEffect(() => {
    import("markdown-it").then(({ default: MarkdownIt }) => {
      const md = new MarkdownIt({ html: true });
      let html = md.render(content);
      html = html.replace(/<ul>([\s\S]*?)<\/ul>/gi, (_, inner) => {
        const liMatches = inner.match(/<li>([\s\S]*?)<\/li>/gi) ?? [];
        const parts = liMatches.map((li: string) => {
          const m = /<li>([\s\S]*?)<\/li>/i.exec(li);
          return (m?.[1] ?? "").trim();
        });
        return `<p style="margin-bottom: 0.75rem;">${parts.join(" ")}</p>`;
      });
      setHtml(html);
    });
  }, [content]);

  if (!html) {
    return (
      <div style={{ maxWidth: 600, margin: "48px auto 0", padding: 24 }}>
        <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{content}</pre>
      </div>
    );
  }

  return (
    <div
      className="about-markdown"
      style={{
        maxWidth: 600,
        margin: "48px auto 0",
        padding: 24,
        lineHeight: 1.6,
      }}
    >
      <div
        style={{
          background: "var(--ant-color-bg-container)",
          borderRadius: 8,
          border: "1px solid var(--ant-color-border)",
          padding: 24,
          boxSizing: "border-box",
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
