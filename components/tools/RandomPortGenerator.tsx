"use client";

import React from "react";
import { Card, Button, Form } from "antd";
import { InputCopyable } from "@/components/ui";

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePort(): number {
  return randInt(1024, 65535);
}

export function RandomPortGenerator() {
  const [port, setPort] = React.useState(() => String(generatePort()));

  const refresh = () => setPort(String(generatePort()));

  return (
    <Card>
      <Form layout="vertical">
        <Form.Item>
          <div className="max-w-xs mx-auto">
            <InputCopyable
              value={port}
              readOnly
              style={{ textAlign: "center", fontSize: 26, fontWeight: 400 }}
            />
          </div>
        </Form.Item>
        <Form.Item>
          <div className="flex justify-center">
            <Button onClick={refresh}>Refresh</Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
}
