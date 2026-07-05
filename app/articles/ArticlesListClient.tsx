"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Input, Card, Typography, Empty, Pagination } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailOutlined, GithubOutlined, CustomerServiceOutlined } from "@ant-design/icons";
import { useI18n } from "@/lib/i18n/context";
import { withBasePath } from "@/lib/base-path";
import type { ArticleMeta } from "@/lib/articles";

const { Text } = Typography;

const DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;

const TAG_STYLE = {
  backgroundColor: "var(--ant-color-fill-tertiary)",
  color: "var(--ant-color-text-secondary)",
  fontSize: 12,
  padding: "4px 10px",
  borderRadius: 4,
  lineHeight: "20px",
  whiteSpace: "nowrap" as const,
};

interface Item extends ArticleMeta {
  slug: string;
  excerpt?: string;
  firstImage?: string;
  pinned?: boolean;
  showExcerpt?: boolean;
}

interface ArticlesListClientProps {
  initialList: Item[];
  initialTag?: string | null;
}

export function ArticlesListClient({ initialList, initialTag = null }: ArticlesListClientProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(initialTag ?? null);
  const [currentPage, setCurrentPage] = useState(1);
  const prevInitialTagRef = React.useRef(initialTag);
  if (prevInitialTagRef.current !== initialTag) {
    prevInitialTagRef.current = initialTag;
    setSelectedTag(initialTag ?? null);
  }

  useEffect(() => {
    const id = window.setTimeout(() => {
      setSearchDebounced(search);
    }, DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [search]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    initialList.forEach((a) => a.tags.forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
  }, [initialList]);

  const filtered = useMemo(() => {
    let list = initialList;
    if (selectedTag) {
      list = list.filter((a) => a.tags.includes(selectedTag));
    }
    const q = searchDebounced.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.tags.some((tag) => tag.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [initialList, selectedTag, searchDebounced]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const clampedPage = totalPages >= 1 ? Math.min(currentPage, totalPages) : 1;

  const paginated = useMemo(() => {
    const start = (clampedPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, clampedPage]);

  return (
    <div className="articles-list-layout" style={{ maxWidth: 960, margin: "0 auto", display: "flex", gap: 24, flexWrap: "wrap" }}>
      {/* 左侧：搜索 + 文章列表 + 分页 */}
      <div className="articles-list-main" style={{ flex: 1, minWidth: 280 }}>
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder={t("articles.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{
              maxWidth: 400,
              height: 40,
              borderRadius: 20,
              backgroundColor: "var(--ant-color-fill-quaternary)",
              border: "none",
            }}
          />
        </div>

        {filtered.length === 0 ? (
          <Empty description={t("articles.noResults")} />
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {paginated.map((item) => (
                <Link key={item.slug} href={`/articles/${item.slug}`}>
                  <Card
                    size="small"
                    hoverable
                    style={{ position: "relative", overflow: "hidden" }}
                  >
                    {item.pinned && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          background: "var(--ant-color-primary)",
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "2px 10px",
                          borderBottomLeftRadius: 6,
                          zIndex: 1,
                        }}
                      >
                        {t("articles.topBadge")}
                      </div>
                    )}
                    <div style={{ paddingRight: item.pinned ? 36 : 0 }}>
                      <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 0 }}>
                        {item.title}
                      </Typography.Title>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 8,
                          marginTop: 10,
                          marginBottom: item.showExcerpt && (item.excerpt || item.firstImage) ? 12 : 0,
                        }}
                      >
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {item.tags.map((tag) => (
                            <span key={tag} style={TAG_STYLE}>
                              {tag}
                            </span>
                          ))}
                        </div>
                        {item.updatedAt && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {t("articles.updatedAt")} {item.updatedAt}
                          </Text>
                        )}
                      </div>
                      {item.showExcerpt && (item.excerpt || item.firstImage) && (
                        <>
                          {item.excerpt && (
                            <div
                              style={{
                                fontSize: 13,
                                color: "var(--ant-color-text-secondary)",
                                marginBottom: item.firstImage ? 10 : 0,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                lineHeight: 1.4,
                              }}
                            >
                              {item.excerpt}
                            </div>
                          )}
                          {item.firstImage && (
                            <div
                              style={{
                                width: "100%",
                                maxWidth: 200,
                                borderRadius: 8,
                                overflow: "hidden",
                                background: "var(--ant-color-fill-quaternary)",
                              }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.firstImage}
                                alt=""
                                style={{
                                  width: "100%",
                                  height: "auto",
                                  display: "block",
                                }}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
            {totalPages > 1 && (
              <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
                <Pagination
                  current={clampedPage}
                  total={filtered.length}
                  pageSize={PAGE_SIZE}
                  onChange={setCurrentPage}
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* 右侧：个人信息卡片 + 标签卡片 */}
      <div className="articles-list-sidebar" style={{ width: 260, flexShrink: 0 }}>
        <Card
          style={{
            overflow: "hidden",
            marginBottom: 16,
          }}
          styles={{ body: { padding: 0 } }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "100%",
                aspectRatio: "1",
                overflow: "hidden",
                background: "var(--ant-color-fill-quaternary)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={withBasePath("/avatar.jpeg")}
                alt="AME"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            <div style={{ padding: "16px 12px", display: "flex", justifyContent: "center", gap: 16 }}>
              <a
                href="mailto:fuyc625@gmail.com"
                aria-label="Email"
                style={{ color: "var(--ant-color-text-secondary)", fontSize: 20 }}
              >
                <MailOutlined />
              </a>
              <a
                href="https://github.com/ame-fu"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                style={{ color: "var(--ant-color-text-secondary)", fontSize: 20 }}
              >
                <GithubOutlined />
              </a>
              <a
                href="https://music.163.com/#/playlist?id=142781707"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Music"
                style={{ color: "var(--ant-color-text-secondary)", fontSize: 20 }}
              >
                <CustomerServiceOutlined />
              </a>
            </div>
            <div style={{ padding: "0 12px 16px" }}>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>AME</div>
              <div style={{ fontSize: 13, color: "var(--ant-color-text-secondary)" }}>
                面相互联网，拥抱AI
              </div>
            </div>
          </div>
        </Card>

        {initialList.length > 0 && (
          <Card title={t("articles.filterByTag")} size="small">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {allTags.map((tag) => (
                <span
                  key={tag}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    const next = selectedTag === tag ? null : tag;
                    setSelectedTag(next);
                    setCurrentPage(1);
                    router.replace(next ? `/articles?tag=${encodeURIComponent(next)}` : "/articles");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      const next = selectedTag === tag ? null : tag;
                      setSelectedTag(next);
                      setCurrentPage(1);
                      router.replace(next ? `/articles?tag=${encodeURIComponent(next)}` : "/articles");
                    }
                  }}
                  style={{
                    ...TAG_STYLE,
                    cursor: "pointer",
                    display: "inline-block",
                    backgroundColor: selectedTag === tag ? "var(--ant-color-primary-bg)" : TAG_STYLE.backgroundColor,
                    color: selectedTag === tag ? "var(--ant-color-primary)" : TAG_STYLE.color,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
