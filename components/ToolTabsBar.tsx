"use client";

import React from "react";
import { CloseOutlined } from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import { useToolTabs } from "@/lib/tool-tabs-context";
import { getToolByPath } from "@/lib/tools.config";
import { getToolName } from "@/lib/i18n/tool-labels";
import { useI18n } from "@/lib/i18n/context";

const MAX_TABS = 20;

export function ToolTabsBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useI18n();
  const { openTabs, removeTab } = useToolTabs();

  const isCurrentTool = !!getToolByPath(pathname);
  const effectiveTabs = (
    isCurrentTool && !openTabs.includes(pathname)
      ? [pathname, ...openTabs]
      : openTabs
  ).slice(0, MAX_TABS);

  if (effectiveTabs.length === 0) return null;

  return (
    <div
      className="tool-tabs-bar"
      style={{
        flexShrink: 0,
        padding: "8px 12px",
        background: "var(--ant-color-fill-quaternary)",
        overflowX: "auto",
        overflowY: "hidden",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 4,
          minWidth: "min-content",
        }}
      >
        {effectiveTabs.map((path) => {
          const config = getToolByPath(path);
          const label = config
            ? getToolName(locale, config.slug, config.name)
            : path.slice(1);
          const active = pathname === path;
          return (
            <button
              key={path}
              type="button"
              className="tool-tab"
              onClick={() => router.replace(path)}
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 10px",
                margin: 0,
                border: "none",
                borderRadius: 0,
                background: "transparent",
                color: active ? "var(--ant-color-primary)" : "var(--ant-color-text)",
                fontSize: 12,
                lineHeight: 1.4,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  maxWidth: 140,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {label}
              </span>
              <span
                role="button"
                tabIndex={0}
                aria-label="Close tab"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 2,
                  cursor: "pointer",
                  opacity: 0.6,
                  flexShrink: 0,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  removeTab(path);
                  if (pathname === path) {
                    const rest = effectiveTabs.filter((p) => p !== path);
                    if (rest.length > 0) {
                      router.replace(rest[0]);
                    } else {
                      router.replace("/");
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    removeTab(path);
                    if (pathname === path) {
                      const rest = effectiveTabs.filter((p) => p !== path);
                      if (rest.length > 0) router.replace(rest[0]);
                      else router.replace("/");
                    }
                  }
                }}
              >
                <CloseOutlined style={{ fontSize: 10 }} />
              </span>
              {active && (
                <span
                  className="tool-tab-indicator"
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: 0,
                    width: "80%",
                    height: 2,
                    background: "var(--ant-color-primary)",
                    transform: "translateX(-50%) skewX(-12deg)",
                    borderRadius: 1,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
