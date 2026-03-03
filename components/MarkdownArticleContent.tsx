"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Typography, Image } from "antd";

const { Paragraph, Title } = Typography;

const components = {
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <Image
      src={typeof props.src === "string" ? props.src : undefined}
      alt={props.alt ?? ""}
      style={{ maxWidth: "100%", margin: "12px 0" }}
      preview
    />
  ),
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <Title level={1} style={{ marginTop: 24, marginBottom: 16 }} {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <Title level={2} style={{ marginTop: 20, marginBottom: 12 }} {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <Title level={3} style={{ marginTop: 16, marginBottom: 8 }} {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <Paragraph style={{ marginBottom: 12 }} {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => {
    const { className } = props;
    const isBlock = className?.startsWith("language-");
    if (isBlock) {
      return (
        <pre
          style={{
            background: "var(--ant-color-fill-quaternary)",
            padding: 16,
            borderRadius: 8,
            overflow: "auto",
            margin: "12px 0",
            fontSize: 13,
          }}
        >
          <code {...props} />
        </pre>
      );
    }
    return (
      <code
        style={{
          background: "var(--ant-color-fill-quaternary)",
          padding: "2px 6px",
          borderRadius: 4,
          fontSize: "0.9em",
        }}
        {...props}
      />
    );
  },
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul style={{ marginBottom: 12, paddingLeft: 24 }} {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol style={{ marginBottom: 12, paddingLeft: 24 }} {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      style={{
        borderLeft: "4px solid var(--ant-color-primary)",
        margin: "12px 0",
        paddingLeft: 16,
        color: "var(--ant-color-text-secondary)",
      }}
      {...props}
    />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a target="_blank" rel="noopener noreferrer" {...props} />
  ),
};

interface MarkdownArticleContentProps {
  content: string;
}

export function MarkdownArticleContent({ content }: MarkdownArticleContentProps) {
  return (
    <Image.PreviewGroup>
      <div className="article-content" style={{ maxWidth: 720, margin: "0 auto" }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {content}
        </ReactMarkdown>
      </div>
    </Image.PreviewGroup>
  );
}
