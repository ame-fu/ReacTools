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

  const { favoriteTools, restByCategory } = useMemo(() => {
    const favSet = new Set(favoriteSlugs);
    const fav: { category: string; tool: (typeof toolsByCategory)[0]["tools"][0] }[] = [];
    const rest: typeof toolsByCategory = [];

    for (const cat of toolsByCategory) {
      const favInCat = cat.tools.filter((tool) => favSet.has(tool.slug));
      const restInCat = cat.tools.filter((tool) => !favSet.has(tool.slug));
      favInCat.forEach((tool) => fav.push({ category: cat.name, tool }));
      if (restInCat.length > 0) {
        rest.push({ name: cat.name, tools: restInCat });
      }
    }

    return {
      favoriteTools: fav,
      restByCategory: rest,
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
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
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
        {restByCategory.map((cat) => (
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
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
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
