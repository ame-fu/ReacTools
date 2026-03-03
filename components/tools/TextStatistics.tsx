"use client";

import React from "react";
import { Card, Col, Form, Row, Statistic } from "antd";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

function getStringSizeInBytes(text: string): number {
  return new TextEncoder().encode(text).buffer.byteLength;
}

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(decimals))} ${sizes[i]}`;
}

export function TextStatistics() {
  const { t } = useI18n();
  const [text, setText] = React.useState("");

  const characterCount = text.length;
  const wordCount = text === "" ? 0 : text.trim().split(/\s+/).filter(Boolean).length;
  const lineCount = text === "" ? 0 : text.split(/\r\n|\r|\n/).length;
  const byteSize = formatBytes(getStringSizeInBytes(text));

  return (
    <Card>
      <Form layout="vertical">
        <Form.Item label={t("tools.text-statistics.placeholder")}>
          <InputCopyable
            value={text}
            onChange={(v) => setText(v)}
            placeholder={t("tools.text-statistics.placeholder")}
            multiline
            rows={8}
          />
        </Form.Item>

        <Form.Item>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Statistic title={t("tools.text-statistics.characterCount")} value={characterCount} />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic title={t("tools.text-statistics.wordCount")} value={wordCount} />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic title={t("tools.text-statistics.lineCount")} value={lineCount} />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic title={t("tools.text-statistics.byteSize")} value={byteSize} />
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </Card>
  );
}
