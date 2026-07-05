"use client";

import React from "react";
import { useI18n } from "@/lib/i18n/context";
import { getToolName, getToolDescription } from "@/lib/i18n/tool-labels";

interface ToolLayoutProps {
  slug: string;
  title: string;
  description?: string;
  headerIcon?: React.ReactNode;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
}

export function ToolLayout({
  slug,
  title,
  description,
  headerIcon,
  headerExtra,
  children,
}: ToolLayoutProps) {
  const { locale } = useI18n();
  const displayTitle = getToolName(locale, slug, title);
  const displayDescription = description
    ? getToolDescription(locale, slug, description)
    : undefined;

  return (
    <div className="tool-page-root" style={{ width: "100%" }}>
      <header
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          paddingBottom: 16,
          borderBottom: "1px solid var(--ant-color-border-secondary)",
          marginBottom: 24,
        }}
      >
        {headerIcon != null && (
          <div style={{ flexShrink: 0, marginTop: 2 }}>{headerIcon}</div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--ant-color-text-heading)",
              lineHeight: 1.3,
            }}
          >
            {displayTitle}
          </h1>
          {displayDescription && (
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 13,
                color: "var(--ant-color-text-secondary)",
                lineHeight: 1.4,
              }}
            >
              {displayDescription}
            </p>
          )}
        </div>
        {headerExtra && <div style={{ flexShrink: 0 }}>{headerExtra}</div>}
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {children}
      </div>
    </div>
  );
}

