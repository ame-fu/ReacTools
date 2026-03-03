"use client";

import React from "react";
import { Button, Card, Col, Form, Input, InputNumber, Row } from "antd";

export function PercentageCalculator() {
  const [percentageX, setPercentageX] = React.useState<number | null>(null);
  const [percentageY, setPercentageY] = React.useState<number | null>(null);
  const [numberX, setNumberX] = React.useState<number | null>(null);
  const [numberY, setNumberY] = React.useState<number | null>(null);
  const [numberFrom, setNumberFrom] = React.useState<number | null>(null);
  const [numberTo, setNumberTo] = React.useState<number | null>(null);

  const percentageResult = React.useMemo(() => {
    if (percentageX == null || percentageY == null) return "";
    return ((percentageX / 100) * percentageY).toString();
  }, [percentageX, percentageY]);

  const numberResult = React.useMemo(() => {
    if (numberX == null || numberY == null) return "";
    const result = (100 * numberX) / numberY;
    return Number.isFinite(result) && !Number.isNaN(result) ? result.toString() : "";
  }, [numberX, numberY]);

  const percentageIncreaseDecrease = React.useMemo(() => {
    if (numberFrom == null || numberTo == null) return "";
    const result = ((numberTo - numberFrom) / numberFrom) * 100;
    return Number.isFinite(result) && !Number.isNaN(result) ? result.toString() : "";
  }, [numberFrom, numberTo]);

  const copy = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <Form layout="vertical">
        <Form.Item label="What is">
          <Card>
            <Row gutter={8} align="middle">
              <Col>
                <InputNumber
                  placeholder="X"
                  value={percentageX}
                  onChange={(v) => setPercentageX(v)}
                />
              </Col>
              <Col>% of</Col>
              <Col>
                <InputNumber
                  placeholder="Y"
                  value={percentageY}
                  onChange={(v) => setPercentageY(v)}
                />
              </Col>
              <Col>
                <Input
                  readOnly
                  value={percentageResult}
                  placeholder="Result"
                  style={{ maxWidth: 150 }}
                />
              </Col>
              <Col>
                <Button size="small" onClick={() => copy(percentageResult)} disabled={!percentageResult}>
                  Copy
                </Button>
              </Col>
            </Row>
          </Card>
        </Form.Item>

        <Form.Item label="X is what percent of Y">
          <Card>
            <Row gutter={8} align="middle">
              <Col>
                <InputNumber placeholder="X" value={numberX} onChange={(v) => setNumberX(v)} />
              </Col>
              <Col>is what percent of</Col>
              <Col>
                <InputNumber placeholder="Y" value={numberY} onChange={(v) => setNumberY(v)} />
              </Col>
              <Col>
                <Input
                  readOnly
                  value={numberResult}
                  placeholder="Result"
                  style={{ maxWidth: 150 }}
                />
              </Col>
              <Col>
                <Button size="small" onClick={() => copy(numberResult)} disabled={!numberResult}>
                  Copy
                </Button>
              </Col>
            </Row>
          </Card>
        </Form.Item>

        <Form.Item label="What is the percentage increase/decrease">
          <Card>
            <Row gutter={8} align="middle">
              <Col>
                <InputNumber
                  placeholder="From"
                  value={numberFrom}
                  onChange={(v) => setNumberFrom(v)}
                />
              </Col>
              <Col>
                <InputNumber placeholder="To" value={numberTo} onChange={(v) => setNumberTo(v)} />
              </Col>
              <Col>
                <Input
                  readOnly
                  value={percentageIncreaseDecrease}
                  placeholder="Result"
                  style={{ maxWidth: 150 }}
                />
              </Col>
              <Col>
                <Button
                  size="small"
                  onClick={() => copy(percentageIncreaseDecrease)}
                  disabled={!percentageIncreaseDecrease}
                >
                  Copy
                </Button>
              </Col>
            </Row>
          </Card>
        </Form.Item>
      </Form>
    </div>
  );
}
