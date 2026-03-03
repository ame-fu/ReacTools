"use client";

import React from "react";
import { Card, Col, Form, Row } from "antd";
import { diffLines, type Change } from "diff";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

function buildDiff(oldText: string, newText: string): Change[] {
  return diffLines(oldText, newText);
}

export function TextDiff() {
  const { t } = useI18n();
  const [left, setLeft] = React.useState("");
  const [right, setRight] = React.useState("");

  const diff = React.useMemo(() => buildDiff(left, right), [left, right]);

  return (
    <Card>
      <Form layout="vertical">
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label={t("tools.text-diff.originalLabel")}>
              <InputCopyable
                value={left}
                onChange={(v) => setLeft(v)}
                placeholder={t("tools.text-diff.originalPlaceholder")}
                multiline
                rows={10}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t("tools.text-diff.modifiedLabel")}>
              <InputCopyable
                value={right}
                onChange={(v) => setRight(v)}
                placeholder={t("tools.text-diff.modifiedPlaceholder")}
                multiline
                rows={10}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label={t("tools.text-diff.diffResult")}>
          <div
            style={{
              maxHeight: 400,
              overflow: "auto",
              fontFamily: "monospace",
              fontSize: 13,
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: 4,
            }}
          >
            {diff.map((part, index) => {
              const backgroundColor = part.added
                ? "rgba(76, 175, 80, 0.15)"
                : part.removed
                ? "rgba(244, 67, 54, 0.15)"
                : "transparent";
              const prefix = part.added ? "+ " : part.removed ? "- " : "  ";
              return (
                <div
                  key={`${index}-${part.count}-${part.added}-${part.removed}`}
                  style={{ backgroundColor, whiteSpace: "pre-wrap" }}
                >
                  {part.value.split("\n").map((line, i) =>
                    line === "" && i === part.value.split("\n").length - 1
                      ? null
                      : (
                        <div key={i}>
                          {prefix}
                          {line}
                        </div>
                      ),
                  )}
                </div>
              );
            })}
            </div>
        </Form.Item>
      </Form>
    </Card>
  );
}

