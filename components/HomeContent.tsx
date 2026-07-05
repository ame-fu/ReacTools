"use client";

import React, { useMemo } from "react";
import { toolsByCategory } from "@/lib/tools.config";
import { useI18n } from "@/lib/i18n/context";
import { useFavorites } from "@/lib/favorites-context";
import { getCategoryLabel } from "@/lib/i18n/messages";
import { ToolCard } from "./ToolCard";

export default function HomeContent() {
  const { locale, t } = useI18n();
  const { favoriteSlugs } = useFavorites();

  const { favoriteTools, categoriesWithAllTools } = useMemo(() => {
    const favSet = new Set(favoriteSlugs);
    const fav: { category: string; tool: (typeof toolsByCategory)[0]["tools"][0] }[] = [];

    for (const cat of toolsByCategory) {
      cat.tools.filter((tool) => favSet.has(tool.slug)).forEach((tool) => fav.push({ category: cat.name, tool }));
    }

    return {
      favoriteTools: fav,
      categoriesWithAllTools: toolsByCategory,
    };
  }, [favoriteSlugs]);

  return (
    <div className="home-content" style={{ paddingTop: 8 }}>
      {favoriteTools.length > 0 && (
        <>
          <h2
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: "var(--ant-color-text-secondary)",
              marginBottom: 12,
            }}
          >
            {t("home.categories.favoriteTools")}
          </h2>
          <div
            className="home-tools-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 12,
              marginBottom: 28,
            }}
          >
            {favoriteTools.map(({ tool }) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </>
      )}

      <h2
        style={{
          fontSize: 15,
          fontWeight: 500,
          color: "var(--ant-color-text-secondary)",
          marginBottom: 12,
        }}
      >
        {t("home.categories.allTools")}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 28, paddingBottom: 32 }}>
        {categoriesWithAllTools.map((cat) => (
          <section key={cat.name}>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--ant-color-text-tertiary)",
                marginBottom: 12,
              }}
            >
              {getCategoryLabel(locale, cat.name)}
            </h3>
            <div
              className="home-tools-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 12,
              }}
            >
              {cat.tools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
