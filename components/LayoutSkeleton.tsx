"use client";

import React from "react";

const SIDER_WIDTH = 240;
const SIDER_HEADER_HEIGHT = 150;

function SkeletonBlock({
  width,
  height,
  style,
}: {
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="layout-skeleton-block"
      style={{
        width: width ?? "100%",
        height: height ?? 16,
        borderRadius: 4,
        ...style,
      }}
    />
  );
}

export function LayoutSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--background, #f5f5f5)",
      }}
    >
      {/* 左侧菜单骨架 - 移动端隐藏 */}
      <div
        className="layout-skeleton-sider"
        style={{
          width: SIDER_WIDTH,
          flexShrink: 0,
          height: "100vh",
          background: "var(--ant-color-bg-container, #fff)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            height: SIDER_HEADER_HEIGHT,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SkeletonBlock width={80} height={80} style={{ borderRadius: 12 }} />
        </div>
        <div style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SkeletonBlock width={12} height={12} />
              <SkeletonBlock width={`${60 + i * 10}%`} height={24} />
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 16px", textAlign: "center" }}>
          <SkeletonBlock width={80} height={12} style={{ margin: "0 auto" }} />
        </div>
      </div>

      {/* 右侧区域骨架 */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        {/* 顶部栏骨架 */}
        <div
          style={{
            flexShrink: 0,
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "0 16px",
            background: "var(--ant-color-bg-container, #fff)",
            borderBottom: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SkeletonBlock width={32} height={32} />
            <SkeletonBlock width={32} height={32} />
          </div>
          <SkeletonBlock width="40%" height={36} style={{ maxWidth: 280 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <SkeletonBlock width={32} height={32} />
            <SkeletonBlock width={32} height={32} />
          </div>
        </div>

        {/* 内容区骨架 */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: 24,
            background: "var(--ant-color-bg-layout, #f5f5f5)",
          }}
        >
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <SkeletonBlock width="60%" height={28} style={{ marginBottom: 16 }} />
            <SkeletonBlock width="80%" height={16} style={{ marginBottom: 24 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    padding: 20,
                    borderRadius: 8,
                    background: "var(--ant-color-bg-container, #fff)",
                  }}
                >
                  <SkeletonBlock width={`${70 + i * 5}%`} height={20} style={{ marginBottom: 12 }} />
                  <SkeletonBlock width="100%" height={14} style={{ marginBottom: 8 }} />
                  <SkeletonBlock width="95%" height={14} style={{ marginBottom: 8 }} />
                  <SkeletonBlock width="80%" height={14} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
