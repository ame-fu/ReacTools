"use client";

import React from "react";
import Link from "next/link";
import { Card } from "antd";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import type { ToolConfig } from "@/lib/tools.config";
import { useI18n } from "@/lib/i18n/context";
import { getToolName, getToolDescription } from "@/lib/i18n/tool-labels";
import { useFavorites } from "@/lib/favorites-context";

export function ToolCard({ tool }: { tool: ToolConfig }) {
  const { locale, t } = useI18n();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isNew, setIsNew] = React.useState(false);

  React.useEffect(() => {
    if (!tool.createdAt) {
      setIsNew(false);
      return;
    }
    const created = new Date(tool.createdAt).getTime();
    const days =
      (Date.now() - created) / (1000 * 60 * 60 * 24);
    setIsNew(days < 30);
  }, [tool.createdAt]);
  const favorited = isFavorite(tool.slug);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(tool.slug);
  };

  const name = getToolName(locale, tool.slug, tool.name);
  const description = getToolDescription(locale, tool.slug, tool.description);

  return (
    <Link href={tool.path} style={{ textDecoration: "none" }}>
      <Card
        hoverable
        style={{
          height: "100%",
          borderWidth: 2,
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
        styles={{
          body: { padding: 16 },
        }}
        className="tool-card-hover"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  color: "var(--ant-color-text)",
                  marginBottom: 4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {name}
              </div>
              {isNew && (
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 12,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "var(--ant-color-primary)",
                    color: "#fff",
                  }}
                >
                  {t("toolCard.new")}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleHeartClick}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                padding: 4,
                lineHeight: 1,
                color: favorited ? "#ff4d4f" : "var(--ant-color-text-tertiary)",
              }}
              aria-label={favorited ? t("favoriteButton.remove") : t("favoriteButton.add")}
            >
              {favorited ? (
                <HeartFilled style={{ fontSize: 18 }} />
              ) : (
                <HeartOutlined style={{ fontSize: 18 }} />
              )}
            </button>
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--ant-color-text-secondary)",
              lineHeight: 1.45,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </div>
        </div>
      </Card>
    </Link>
  );
}
