"use client";

import React from "react";
import { Card, Form } from "antd";
import JSON5 from "json5";
import { InputCopyable, TextareaCopyable } from "@/components/ui";

const defaultJson = '{\n  "hello": [\n    "world"\n  ]\n}';

export function JsonMinify() {
  const [input, setInput] = React.useState(defaultJson);
  const { output, error } = React.useMemo(() => {
    if (!input.trim()) {
      return { output: "", error: null as string | null };
    }
    try {
      const parsed = JSON5.parse(input);
      return { output: JSON.stringify(parsed, null, 0), error: null };
    } catch {
      return { output: "", error: "Provided JSON is not valid." };
    }
  }, [input]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <Form layout="vertical">
          <Form.Item validateStatus={error ? "error" : undefined} help={error || undefined}>
            <InputCopyable
              value={input}
              onChange={setInput}
              label="Your raw JSON"
              placeholder="Paste your raw JSON here..."
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
            <TextareaCopyable value={output} rows={18} style={{ fontFamily: "monospace" }} label="Minified version of your JSON" />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
