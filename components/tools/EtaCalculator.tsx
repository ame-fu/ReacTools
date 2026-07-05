"use client";

import React from "react";
import { Card, InputNumber, Select, Form, Row, Col, Input } from "antd";
import { addMilliseconds, formatRelative, formatDuration } from "date-fns";
import { enGB } from "date-fns/locale";
import { useI18n } from "@/lib/i18n/context";

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

const TIME_SPAN_OPTIONS_KEYS = [
  { key: "unitMs", value: 1 },
  { key: "unitSeconds", value: 1000 },
  { key: "unitMinutes", value: 1000 * 60 },
  { key: "unitHours", value: 1000 * 60 * 60 },
  { key: "unitDays", value: 1000 * 60 * 60 * 24 },
] as const;

export function EtaCalculator() {
  const { t } = useI18n();
  const timeSpanOptions = React.useMemo(
    () => TIME_SPAN_OPTIONS_KEYS.map(({ key, value }) => ({ label: t(`tools.eta-calculator.${key}`), value })),
    [t],
  );
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
      <Form layout="vertical">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label={t("tools.eta-calculator.labelAmount")}>
              <InputNumber
                min={1}
                value={unitCount}
                onChange={(v) => setUnitCount(v ?? 0)}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={t("tools.eta-calculator.labelStartedAt")}>
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

        <Form.Item label={t("tools.eta-calculator.labelConsumed")}>
          <Row gutter={8} align="middle">
            <Col>
              <InputNumber
                min={1}
                value={unitPerTimeSpan}
                onChange={(v) => setUnitPerTimeSpan(v ?? 1)}
              />
            </Col>
            <Col style={{ padding: "0 8px" }}>{t("tools.eta-calculator.in")}</Col>
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
                options={timeSpanOptions}
                style={{ minWidth: 140 }}
              />
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label={t("tools.eta-calculator.labelTotalDuration")}>
          <Card>
            <div style={{ fontSize: 18 }}>{formatMsDuration(durationMs)}</div>
          </Card>
        </Form.Item>

        <Form.Item label={t("tools.eta-calculator.labelWillEnd")}>
          <Card>
            <div style={{ fontSize: 18 }}>{endAt}</div>
          </Card>
        </Form.Item>
      </Form>
    </div>
  );
}
