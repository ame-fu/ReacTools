"use client";

import React from "react";
import { Input } from "antd";
import Fuse from "fuse.js";
import { codesByCategories } from "@/lib/http-status-codes.constants";
import { useI18n } from "@/lib/i18n/context";

const flatCodes = codesByCategories.flatMap(({ codes, category }) =>
  codes.map((code) => ({ ...code, category })),
);

const fuse = new Fuse(flatCodes, {
  keys: [
    { name: "code", weight: 3 },
    { name: "name", weight: 2 },
    "description",
    "category",
  ],
  threshold: 0.4,
});

export function HttpStatusCodes() {
  const { t } = useI18n();
  const [search, setSearch] = React.useState("");
  const searchResult = React.useMemo(() => {
    if (!search.trim()) return codesByCategories;
    const hits = fuse.search(search.trim());
    return [{ category: t("tools.http-status-codes.searchResults"), codes: hits.map((h) => h.item) }];
  }, [search, t]);

  return (
    <div>
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("tools.http-status-codes.searchPlaceholder")}
        style={{ marginBottom: 24, fontFamily: "monospace" }}
        allowClear
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {searchResult.map(({ category, codes }) => (
          <div key={category}>
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>{category}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {codes.map(({ code, name, description, type }) => (
                <div key={code} style={{ padding: 12, border: "1px solid #f0f0f0", borderRadius: 4 }}>
                  <div style={{ fontWeight: 600, fontSize: 18 }}>
                    {code} {name}
                  </div>
                  <div style={{ opacity: 0.8, fontSize: 14 }}>
                    {description}
                    {type !== "HTTP" ? ` For ${type}.` : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
