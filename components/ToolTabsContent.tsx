"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { getToolByPath } from "@/lib/tools.config";
import { ToolLayout } from "@/components/ToolLayout";
import { ToolContent } from "@/components/ToolContent";
import { useToolTabs } from "@/lib/tool-tabs-context";

const MAX_TABS = 20;

/**
 * Renders cached tool panels: one panel per open tab, only the active one visible.
 * Keeps tool component state when switching tabs.
 */
export function ToolTabsContent() {
  const pathname = usePathname();
  const { openTabs } = useToolTabs();
  const isCurrentTool = !!getToolByPath(pathname);
  const effectiveTabs = (
    isCurrentTool && !openTabs.includes(pathname)
      ? [pathname, ...openTabs]
      : openTabs
  ).slice(0, MAX_TABS);

  return (
    <>
      {effectiveTabs.map((path) => {
        const config = getToolByPath(path);
        if (!config) return null;
        const isActive = pathname === path;
        return (
          <div
            key={path}
            role="tabpanel"
            hidden={!isActive}
            style={{
              display: isActive ? "block" : "none",
              height: "100%",
              overflow: "auto",
            }}
          >
            <ToolLayout
              slug={config.slug}
              title={config.name}
              description={config.description}
            >
              <ToolContent slug={config.slug} />
            </ToolLayout>
          </div>
        );
      })}
    </>
  );
}
