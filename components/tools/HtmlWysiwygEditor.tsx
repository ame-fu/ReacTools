"use client";

import React, { useRef, useEffect } from "react";
import { Card, Form } from "antd";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

const DEFAULT_HTML = "<h1>Hey!</h1><p>Welcome to this html wysiwyg editor</p>";

const STORAGE_KEY = "html-wysiwyg-editor--html";

function getInitialHtml(): string {
  if (typeof localStorage === "undefined") return DEFAULT_HTML;
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_HTML;
  } catch {
    return DEFAULT_HTML;
  }
}

export function HtmlWysiwygEditor() {
  const { t } = useI18n();
  const [html, setHtml] = React.useState(getInitialHtml);
  const [rawHtml, setRawHtml] = React.useState(getInitialHtml);
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
  }, [html]);

  const handleEditorInput = () => {
    if (!editorRef.current) return;
    isInternalUpdate.current = true;
    const newHtml = editorRef.current.innerHTML;
    setHtml(newHtml);
    setRawHtml(newHtml);
    try {
      localStorage.setItem(STORAGE_KEY, newHtml);
    } catch {
      // ignore
    }
    isInternalUpdate.current = false;
  };

  const handleRawChange = (v: string) => {
    setRawHtml(v);
    try {
      if (editorRef.current) {
        editorRef.current.innerHTML = v;
        setHtml(v);
        try {
          localStorage.setItem(STORAGE_KEY, v);
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card title={t("tools.html-wysiwyg-editor.editor")} style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: 16, minHeight: 200 }}>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            style={{
              outline: "none",
              minHeight: 120,
              fontFamily: "inherit",
            }}
            className="prose dark:prose-invert max-w-none [&_p]:my-2 [&_h1]:text-2xl [&_h2]:text-xl [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded"
            onInput={handleEditorInput}
          />
        </div>
      </Card>
      <Card title={t("tools.html-wysiwyg-editor.htmlOutput")}>
        <Form layout="vertical">
          <Form.Item>
            <InputCopyable
              value={rawHtml}
              onChange={handleRawChange}
              label={t("tools.html-wysiwyg-editor.formattedHtml")}
              multiline
              rows={14}
              style={{ fontFamily: "monospace", fontSize: 12 }}
            />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
