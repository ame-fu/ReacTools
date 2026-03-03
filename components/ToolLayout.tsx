"use client";

import React from "react";
import { Typography, Divider } from "antd";
import { useI18n } from "@/lib/i18n/context";
import { getToolName, getToolDescription } from "@/lib/i18n/tool-labels";

const { Title, Paragraph } = Typography;

interface ToolLayoutProps {
  slug: string;
  title: string;
  description?: string;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
}

export function ToolLayout({
  slug,
  title,
  description,
  headerExtra,
  children,
}: ToolLayoutProps) {
  const { locale } = useI18n();
  const displayTitle = getToolName(locale, slug, title);
  const displayDescription = description
    ? getToolDescription(locale, slug, description)
    : undefined;

  return (
    <div>
      <div style={{ padding: "40px 0", width: "100%" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "nowrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <Title
            level={1}
            style={{ margin: 0, opacity: 0.9, fontWeight: 400, fontSize: 40 }}
          >
            {displayTitle}
          </Title>
          <div>{headerExtra}</div>
        </div>

        <Divider
          style={{
            width: 200,
            margin: "10px 0",
            opacity: 0.2,
          }}
        />

        {displayDescription && (
          <Paragraph style={{ margin: 0, opacity: 0.7 }}>
            {displayDescription}
          </Paragraph>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ flex: "0 1 600px" }}>{children}</div>
      </div>
    </div>
  );
}

