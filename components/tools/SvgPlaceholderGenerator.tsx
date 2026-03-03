"use client";

import React from "react";
import { Button, Card, Col, Form, Input, InputNumber, Row, Switch } from "antd";
import { TextareaCopyable } from "@/components/ui";

function textToBase64(text: string) {
  if (typeof window === "undefined") {
    return Buffer.from(text, "utf-8").toString("base64");
  }
  return window.btoa(unescape(encodeURIComponent(text)));
}

export function SvgPlaceholderGenerator() {
  const [width, setWidth] = React.useState(600);
  const [height, setHeight] = React.useState(350);
  const [fontSize, setFontSize] = React.useState(26);
  const [bgColor, setBgColor] = React.useState("#cccccc");
  const [fgColor, setFgColor] = React.useState("#333333");
  const [useExactSize, setUseExactSize] = React.useState(true);
  const [customText, setCustomText] = React.useState("");

  const svgString = React.useMemo(() => {
    const w = width;
    const h = height;
    const text = customText.length > 0 ? customText : `${w}x${h}`;
    const size = useExactSize ? ` width="${w}" height="${h}"` : "";

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"${size}>
  <rect width="${w}" height="${h}" fill="${bgColor}"></rect>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="${fontSize}px" fill="${fgColor}">${text}</text>   
</svg>`.trim();
  }, [bgColor, customText, fgColor, fontSize, height, useExactSize, width]);

  const base64 = React.useMemo(
    () => `data:image/svg+xml;base64,${textToBase64(svgString)}`,
    [svgString],
  );

  const download = () => {
    const a = document.createElement("a");
    a.href = base64;
    a.download = "placeholder.svg";
    a.click();
  };

  return (
    <div>
      <Form layout="vertical">
        <Card>
          <Row gutter={[12, 12]}>
            <Col xs={24} md={12}>
              <Form.Item label="Width (in px)">
                <InputNumber
                  min={1}
                  value={width}
                  onChange={(v) => setWidth(v ?? 1)}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Background">
                <Input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  style={{ width: 80, padding: 0, border: "none" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[12, 12]}>
            <Col xs={24} md={12}>
              <Form.Item label="Height (in px)">
                <InputNumber
                  min={1}
                  value={height}
                  onChange={(v) => setHeight(v ?? 1)}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Text color">
                <Input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  style={{ width: 80, padding: 0, border: "none" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[12, 12]}>
            <Col xs={24} md={12}>
              <Form.Item label="Font size">
                <InputNumber
                  min={1}
                  value={fontSize}
                  onChange={(v) => setFontSize(v ?? 1)}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Custom text">
                <Input
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder={`Default is ${width}x${height}`}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Use exact size">
            <Switch
              checked={useExactSize}
              onChange={(checked) => setUseExactSize(checked)}
            />
          </Form.Item>
        </Card>

        <Form.Item label="SVG HTML element">
          <TextareaCopyable
            value={svgString}
            rows={3}
            style={{ fontFamily: "monospace" }}
          />
        </Form.Item>

        <Form.Item label="SVG in Base64">
          <TextareaCopyable
            value={base64}
            rows={3}
            style={{ fontFamily: "monospace" }}
          />
        </Form.Item>

        <Form.Item>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Button onClick={download}>Download svg</Button>
          </div>
        </Form.Item>
      </Form>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={base64} alt="Image" />
    </div>
  );
}

