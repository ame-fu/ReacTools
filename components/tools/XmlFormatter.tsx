"use client";

import React from "react";
import { Card, Switch, InputNumber, Form } from "antd";
import xmlFormat from "xml-formatter";
import { InputCopyable, TextareaCopyable } from "@/components/ui";

const defaultXml = "<hello><world>foo</world><world>bar</world></hello>";

function isValidXML(raw: string): boolean {
  const cleaned = raw.trim();
  if (!cleaned) return true;
  try {
    xmlFormat(cleaned);
    return true;
  } catch {
    return false;
  }
}

export function XmlFormatter() {
  const [input, setInput] = React.useState(defaultXml);
  const [indentSize, setIndentSize] = React.useState(2);
  const [collapseContent, setCollapseContent] = React.useState(true);

  const { output, error } = React.useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      return { output: "", error: null as string | null };
    }
    if (!isValidXML(trimmed)) {
      return { output: "", error: "Provided XML is not valid." };
    }
    try {
      return {
        output:
          xmlFormat(trimmed, {
            indentation: " ".repeat(indentSize),
            collapseContent,
            lineSeparator: "\n",
          }) ?? "",
        error: null,
      };
    } catch {
      return { output: "", error: "Provided XML is not valid." };
    }
  }, [input, indentSize, collapseContent]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-center gap-6">
        <label className="flex items-center gap-2">
          <Switch checked={collapseContent} onChange={setCollapseContent} />
          Collapse content
        </label>
        <label className="flex items-center gap-2">
          <span>Indent size</span>
          <InputNumber min={0} max={10} value={indentSize} onChange={(v) => setIndentSize(v ?? 2)} className="w-24" />
        </label>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <Form layout="vertical">
            <Form.Item validateStatus={error ? "error" : undefined} help={error || undefined}>
              <InputCopyable
                value={input}
                onChange={setInput}
                label="Your XML"
                placeholder="Paste your XML here..."
                multiline
                rows={18}
                className="font-mono"
                status={error ? "error" : undefined}
              />
            </Form.Item>
          </Form>
        </Card>
        <Card>
          <Form layout="vertical">
            <Form.Item>
              <TextareaCopyable value={output} rows={18} style={{ fontFamily: "monospace" }} label="Formatted XML" />
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
