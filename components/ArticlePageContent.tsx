"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Typography, Breadcrumb } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useI18n } from "@/lib/i18n/context";
import { MarkdownArticleContent } from "@/components/MarkdownArticleContent";

const { Title, Text } = Typography;

const TITLE_MAX_LEN = 24;

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max) + "…";
}

interface ArticlePageContentProps {
  title: string;
  updatedAt: string;
  tags: string[];
  content: string;
  prevSlug: string | null;
  prevTitle: string | null;
  nextSlug: string | null;
  nextTitle: string | null;
}

export function ArticlePageContent({
  title,
  updatedAt,
  tags,
  content,
  prevSlug,
  prevTitle,
  nextSlug,
  nextTitle,
}: ArticlePageContentProps) {
  const { t } = useI18n();

  useEffect(() => {
    document.title = title ? `${title} - ReacTools` : "ReacTools";
  }, [title]);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 48 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Breadcrumb
          items={[
            { title: <Link href="/">{t("articles.breadcrumbHome")}</Link> },
            { title: <Link href="/articles">{t("articles.breadcrumbBlog")}</Link> },
            { title },
          ]}
        />
        <Link
          href="/articles"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--ant-color-text-secondary)",
            transition: "color 0.2s",
          }}
          className="article-back-link"
        >
          <ArrowLeftOutlined />
          <Text type="secondary">{t("articles.backToBlog")}</Text>
        </Link>
      </div>

      <div
        style={{
          background: "var(--ant-color-bg-container)",
          border: "1px solid var(--ant-color-border)",
          borderRadius: 8,
          padding: "24px 24px 20px",
        }}
      >
        <Title level={1} style={{ marginTop: 0, marginBottom: 12 }}>
          {title}
        </Title>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  backgroundColor: "var(--ant-color-fill-tertiary)",
                  color: "var(--ant-color-text-secondary)",
                  fontSize: 12,
                  padding: "4px 10px",
                  borderRadius: 4,
                  lineHeight: "20px",
                  whiteSpace: "nowrap",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          {updatedAt && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t("articles.updatedAt")} {updatedAt}
            </Text>
          )}
        </div>

        <MarkdownArticleContent content={content} />

        <div
          style={{
            marginTop: 32,
            paddingTop: 20,
            borderTop: "1px solid var(--ant-color-border-secondary)",
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {prevSlug && prevTitle ? (
            <Link href={`/articles/${prevSlug}`} style={{ flex: 1, minWidth: 0 }}>
              <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
                {t("articles.prevArticle")}
              </Text>
              <Text ellipsis style={{ display: "block" }} title={prevTitle}>
                [{truncate(prevTitle, TITLE_MAX_LEN)}]
              </Text>
            </Link>
          ) : (
            <span />
          )}
          {nextSlug && nextTitle ? (
            <Link
              href={`/articles/${nextSlug}`}
              style={{ flex: 1, minWidth: 0, textAlign: "right" }}
            >
              <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
                {t("articles.nextArticle")}
              </Text>
              <Text ellipsis style={{ display: "block" }} title={nextTitle}>
                [{truncate(nextTitle, TITLE_MAX_LEN)}]
              </Text>
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}
