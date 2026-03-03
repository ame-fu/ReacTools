"use client";

import React from "react";
import { Button, Card, Form, Input, InputNumber, Select } from "antd";

function splitPrefix(prefix: string): string[] {
  const base =
    prefix.match(/[^0-9a-f]/i) === null
      ? prefix.match(/.{1,2}/g) ?? []
      : prefix.split(/[^0-9a-f]/i);
  return base.filter(Boolean).map((byte) => byte.padStart(2, "0"));
}

function generateRandomMacAddress({
  prefix: rawPrefix = "",
  separator = ":",
  getRandomByte = () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0"),
}: {
  prefix?: string;
  separator?: string;
  getRandomByte?: () => string;
} = {}) {
  const prefix = splitPrefix(rawPrefix);
  const randomBytes = Array.from(
    { length: Math.max(0, 6 - prefix.length) },
    () => getRandomByte(),
  );
  const bytes = [...prefix, ...randomBytes];
  return bytes.join(separator);
}

function isPartialMacValid(prefix: string) {
  if (!prefix.trim()) return true;
  const cleaned = prefix.replace(/[^0-9a-f]/gi, "");
  return /^[0-9a-fA-F]*$/.test(cleaned) && cleaned.length <= 12;
}

type CaseTransformer = "upper" | "lower";

export function MacAddressGenerator() {
  const [amount, setAmount] = React.useState<number>(1);
  const [prefix, setPrefix] = React.useState("64:16:7F");
  const [caseTransformer, setCaseTransformer] =
    React.useState<CaseTransformer>("upper");
  const [separator, setSeparator] = React.useState<string>(":");
  const [output, setOutput] = React.useState("");

  const prefixValid = React.useMemo(() => isPartialMacValid(prefix), [prefix]);

  const regenerate = React.useCallback(() => {
    if (!prefixValid) {
      setOutput("");
      return;
    }
    const list = Array.from({ length: Math.max(1, amount) }, () => {
      const raw = generateRandomMacAddress({
        prefix,
        separator,
      });
      return caseTransformer === "upper" ? raw.toUpperCase() : raw.toLowerCase();
    });
    setOutput(list.join("\n"));
  }, [amount, caseTransformer, prefix, prefixValid, separator]);

  React.useEffect(() => {
    regenerate();
  }, [regenerate]);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      // ignore
    }
  };

  return (
    <div>
      <Form layout="vertical">
        <Form.Item label="Quantity">
          <InputNumber
            min={1}
            max={100}
            value={amount}
            onChange={(v) => setAmount(v ?? 1)}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item label="MAC address prefix">
          <Input
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            placeholder="Set a prefix, e.g. 64:16:7F"
            status={prefixValid ? undefined : "error"}
            spellCheck={false}
          />
        </Form.Item>

        <Form.Item label="Case">
          <Select<CaseTransformer>
            style={{ width: "100%", minWidth: 160 }}
            value={caseTransformer}
            onChange={(v) => setCaseTransformer(v)}
            options={[
              { label: "Uppercase", value: "upper" },
              { label: "Lowercase", value: "lower" },
            ]}
          />
        </Form.Item>

        <Form.Item label="Separator">
          <Select<string>
            style={{ width: "100%", minWidth: 160 }}
            value={separator}
            onChange={(v) => setSeparator(v)}
            options={[
              { label: ":", value: ":" },
              { label: "-", value: "-" },
              { label: ".", value: "." },
              { label: "None", value: "" },
            ]}
          />
        </Form.Item>

        <Form.Item label="Generated MAC addresses">
          <Card>
            <pre style={{ margin: 0, fontFamily: "monospace" }}>{output}</pre>
          </Card>
        </Form.Item>

        <Form.Item>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Button onClick={regenerate}>Refresh</Button>
            <Button onClick={handleCopy}>Copy</Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}

