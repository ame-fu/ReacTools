"use client";

import React from "react";
import { Button, Card, Form } from "antd";
import { evaluate } from "mathjs";
import { InputCopyable } from "@/components/ui";

export function MathEvaluator() {
  const [expression, setExpression] = React.useState("");

  const result = React.useMemo(() => {
    if (!expression.trim()) return "";
    try {
      const value = evaluate(expression);
      return value != null ? String(value) : "";
    } catch {
      return "";
    }
  }, [expression]);

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
    } catch {
      // ignore
    }
  };

  return (
    <div>
      <Form layout="vertical">
        <Form.Item label="Math expression">
          <InputCopyable
            value={expression}
            onChange={setExpression}
            placeholder="Your math expression (ex: 2*sqrt(6) )..."
            multiline
            rows={3}
            style={{ fontFamily: "monospace" }}
          />
        </Form.Item>

        {result !== "" && (
          <Form.Item label="Result">
            <Card
              extra={
                <Button size="small" onClick={handleCopy}>
                  Copy
                </Button>
              }
            >
              <span style={{ fontFamily: "monospace" }}>{result}</span>
            </Card>
          </Form.Item>
        )}
      </Form>
    </div>
  );
}
