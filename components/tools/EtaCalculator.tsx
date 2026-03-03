"use client";

import React from "react";
import { Card, InputNumber, Select, Form, Row, Col, Input } from "antd";
import { addMilliseconds, formatRelative, formatDuration } from "date-fns";
import { enGB } from "date-fns/locale";

function formatMsDuration(duration: number): string {
  const ms = Math.floor(duration % 1000);
  const secs = Math.floor(((duration - ms) / 1000) % 60);
  const mins = Math.floor((((duration - ms) / 1000 - secs) / 60) % 60);
  const hrs = Math.floor((((duration - ms) / 1000 - secs) / 60 - mins) / 60);
  return (
    formatDuration({ hours: hrs, minutes: mins, seconds: secs }) +
    (ms > 0 ? ` ${ms} ms` : "")
  );
}

function toDatetimeLocalString(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

const TIME_SPAN_OPTIONS = [
  { label: "milliseconds", value: 1 },
  { label: "seconds", value: 1000 },
  { label: "minutes", value: 1000 * 60 },
  { label: "hours", value: 1000 * 60 * 60 },
  { label: "days", value: 1000 * 60 * 60 * 24 },
];

export function EtaCalculator() {
  const [unitCount, setUnitCount] = React.useState(186);
  const [unitPerTimeSpan, setUnitPerTimeSpan] = React.useState(3);
  const [timeSpan, setTimeSpan] = React.useState(5);
  const [timeSpanUnitMultiplier, setTimeSpanUnitMultiplier] = React.useState(60000);
  const [startedAt, setStartedAt] = React.useState<number>(() => Date.now());
  const [endAt, setEndAt] = React.useState<string>("");

  const durationMs = React.useMemo(() => {
    const timeSpanMs = timeSpan * timeSpanUnitMultiplier;
    return unitCount / (unitPerTimeSpan / timeSpanMs);
  }, [unitCount, unitPerTimeSpan, timeSpan, timeSpanUnitMultiplier]);

  React.useEffect(() => {
    const endTs = addMilliseconds(startedAt, durationMs);
    setEndAt(formatRelative(endTs, new Date(), { locale: enGB }));
  }, [startedAt, durationMs]);

  return (
    <div>
      <p style={{ textAlign: "justify", opacity: 0.7, marginBottom: 16 }}>
        With a concrete example, if you wash 5 plates in 3 minutes and you have
        500 plates to wash, it will take you 5 hours to wash them all.
      </p>

      <Form layout="vertical">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Amount of element to consume">
              <InputNumber
                min={1}
                value={unitCount}
                onChange={(v) => setUnitCount(v ?? 0)}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="The consumption started at">
              <Input
                type="datetime-local"
                value={toDatetimeLocalString(startedAt)}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v) setStartedAt(new Date(v).getTime());
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Amount of unit consumed by time span">
          <Row gutter={8} align="middle">
            <Col>
              <InputNumber
                min={1}
                value={unitPerTimeSpan}
                onChange={(v) => setUnitPerTimeSpan(v ?? 1)}
              />
            </Col>
            <Col style={{ padding: "0 8px" }}>in</Col>
            <Col>
              <InputNumber
                min={1}
                value={timeSpan}
                onChange={(v) => setTimeSpan(v ?? 1)}
                style={{ minWidth: 130 }}
              />
            </Col>
            <Col>
              <Select
                value={timeSpanUnitMultiplier}
                onChange={setTimeSpanUnitMultiplier}
                options={TIME_SPAN_OPTIONS}
                style={{ minWidth: 140 }}
              />
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label="Total duration">
          <Card>
            <div style={{ fontSize: 18 }}>{formatMsDuration(durationMs)}</div>
          </Card>
        </Form.Item>

        <Form.Item label="It will end">
          <Card>
            <div style={{ fontSize: 18 }}>{endAt}</div>
          </Card>
        </Form.Item>
      </Form>
    </div>
  );
}
