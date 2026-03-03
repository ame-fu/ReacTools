"use client";

import React from "react";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { Typography } from "antd";

const { Paragraph, Title } = Typography;

function H1(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <Title level={1} style={{ marginTop: 24, marginBottom: 16 }} {...props} />;
}
function H2(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <Title level={2} style={{ marginTop: 20, marginBottom: 12 }} {...props} />;
}
function H3(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <Title level={3} style={{ marginTop: 16, marginBottom: 8 }} {...props} />;
}
function P(props: React.HTMLAttributes<HTMLParagraphElement>) {
  return <Paragraph style={{ marginBottom: 12 }} {...props} />;
}

const defaultComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  p: P,
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

interface MdxArticleContentProps {
  source: MDXRemoteSerializeResult;
  components?: Record<string, React.ComponentType<unknown>>;
}

export function MdxArticleContent({ source, components }: MdxArticleContentProps) {
  const mergedComponents = React.useMemo(
    () => ({ ...defaultComponents, ...components }),
    [components],
  );
  return (
    <div className="article-content" style={{ maxWidth: 720, margin: "0 auto" }}>
      <MDXRemote
        compiledSource={source.compiledSource}
        scope={source.scope}
        frontmatter={source.frontmatter}
        components={mergedComponents}
      />
    </div>
  );
}
