"use client";

import React from "react";
import { Button, Card, Form } from "antd";

function formatMs(msTotal: number) {
  const ms = msTotal % 1000;
  const secs = ((msTotal - ms) / 1000) % 60;
  const mins = (((msTotal - ms) / 1000 - secs) / 60) % 60;
  const hrs = (((msTotal - ms) / 1000 - secs) / 60 - mins) / 60;
  const hrsString = hrs > 0 ? `${hrs.toString().padStart(2, "0")}:` : "";

  return `${hrsString}${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
}

export function Chronometer() {
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const [isRunning, setIsRunning] = React.useState(false);
  const rafId = React.useRef<number | null>(null);
  const previousTime = React.useRef<number | null>(null);
  const tickRef = React.useRef<(time: number) => void>(() => {});

  const tick = React.useCallback((time: number) => {
    if (previousTime.current == null) {
      previousTime.current = time;
    }
    const delta = time - previousTime.current;
    previousTime.current = time;
    setElapsedMs((prev) => prev + delta);
    rafId.current = window.requestAnimationFrame((t) => tickRef.current(t));
  }, []);
  React.useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  const start = React.useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    previousTime.current = performance.now();
    rafId.current = window.requestAnimationFrame(tick);
  }, [isRunning, tick]);

  const stop = React.useCallback(() => {
    if (rafId.current != null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    setIsRunning(false);
    previousTime.current = null;
  }, []);

  const reset = React.useCallback(() => {
    setElapsedMs(0);
  }, []);

  React.useEffect(() => {
    return () => {
      if (rafId.current != null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return (
    <div>
      <Form layout="vertical">
        <Form.Item label="Time">
          <Card>
            <div
              style={{
                textAlign: "center",
                fontSize: 40,
                fontFamily: "monospace",
                margin: "20px 0",
              }}
            >
              {formatMs(Math.floor(elapsedMs))}
            </div>
          </Card>
        </Form.Item>

        <Form.Item>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
            }}
          >
            {!isRunning ? (
              <Button type="primary" onClick={start}>
                Start
              </Button>
            ) : (
              <Button danger onClick={stop}>
                Stop
              </Button>
            )}
            <Button onClick={reset}>Reset</Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}

