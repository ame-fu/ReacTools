"use client";

import React from "react";
import { Alert, Button, Card, Form, Input, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Netmask } from "netmask";

function getIPClass(ip: string | undefined) {
  if (!ip) return undefined;
  const [firstOctetStr] = ip.split(".");
  const firstOctet = Number(firstOctetStr);
  if (Number.isNaN(firstOctet)) return undefined;
  if (firstOctet < 128) return "A";
  if (firstOctet > 127 && firstOctet < 192) return "B";
  if (firstOctet > 191 && firstOctet < 224) return "C";
  if (firstOctet > 223 && firstOctet < 240) return "D";
  if (firstOctet > 239 && firstOctet < 256) return "E";
  return undefined;
}

interface SectionRow {
  key: string;
  label: string;
  value?: string;
  fallback?: string;
}

/** netmask package instance shape (no official types) */
interface NetmaskBlock {
  base?: string;
  mask?: string;
  bitmask?: number;
  size?: number;
  broadcast?: string;
  hostmask?: string;
  first?: string;
  last?: string;
  next?: (count: number) => Netmask | undefined;
}

export function Ipv4SubnetCalculator() {
  const [ip, setIp] = React.useState("192.168.0.1/24");
  const [error, setError] = React.useState<string | null>(null);

  const networkInfo = React.useMemo<Netmask | undefined>(() => {
    const trimmed = ip.trim();
    if (!trimmed) return undefined;
    try {
      return new Netmask(trimmed);
    } catch {
      return undefined;
    }
  }, [ip]);

  React.useEffect(() => {
    if (!ip.trim()) {
      setError(null);
      return;
    }
    try {
      new Netmask(ip.trim());
      setError(null);
    } catch {
      setError("We cannot parse this address, check the format");
    }
  }, [ip]);

  const sections: SectionRow[] = React.useMemo(() => {
    if (!networkInfo) return [];
    const block = networkInfo as unknown as NetmaskBlock;
    const bitmask = block.bitmask;
    const maskBinary =
      typeof bitmask === "number"
        ? `${"1".repeat(bitmask)}${"0".repeat(32 - bitmask)}`
            .match(/.{8}/g)
            ?.join(".")
        : undefined;

    const size = block.size;
    const broadcast = block.broadcast;
    const base = block.base;
    const mask = block.mask;
    const hostmask = block.hostmask;
    const first = block.first;
    const last = block.last;

    const ipClass = getIPClass(base);

    return [
      {
        key: "netmask",
        label: "Netmask",
        value: `${base}/${bitmask}`,
      },
      {
        key: "network-address",
        label: "Network address",
        value: base,
      },
      {
        key: "network-mask",
        label: "Network mask",
        value: mask,
      },
      {
        key: "network-mask-binary",
        label: "Network mask in binary",
        value: maskBinary,
      },
      {
        key: "cidr",
        label: "CIDR notation",
        value: bitmask != null ? `/${bitmask}` : undefined,
      },
      {
        key: "wildcard",
        label: "Wildcard mask",
        value: hostmask,
      },
      {
        key: "size",
        label: "Network size",
        value: size != null ? String(size) : undefined,
      },
      {
        key: "first",
        label: "First address",
        value: first,
      },
      {
        key: "last",
        label: "Last address",
        value: last,
      },
      {
        key: "broadcast",
        label: "Broadcast address",
        value: broadcast,
        fallback: "No broadcast address with this mask",
      },
      {
        key: "class",
        label: "IP class",
        value: ipClass,
        fallback: "Unknown class type",
      },
    ];
  }, [networkInfo]);

  const rows: SectionRow[] = sections;

  const columns: ColumnsType<SectionRow> = [
    {
      title: "Field",
      dataIndex: "label",
      key: "label",
      width: 200,
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      render: (_value, row) =>
        row.value ? (
          <span style={{ fontFamily: "monospace" }}>{row.value}</span>
        ) : (
          <span style={{ opacity: 0.7 }}>
            {row.fallback ?? "Unknown"}
          </span>
        ),
    },
  ];

  const onSwitchBlock = (count: number) => {
    if (!networkInfo) return;
    const block = networkInfo as unknown as NetmaskBlock;
    const next = block.next?.(count);
    if (!next) return;
    setIp(next.toString());
  };

  return (
    <div>
      <Form layout="vertical">
        <Form.Item
          label="An IPv4 address with or without mask"
          validateStatus={error ? "error" : undefined}
          help={error ? <Alert type="error" message={error} showIcon /> : undefined}
        >
          <Input
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="The ipv4 address..."
            status={error ? "error" : undefined}
          />
        </Form.Item>
      </Form>

      {networkInfo && !error && (
        <>
          <Card>
            <Table<SectionRow>
              dataSource={rows}
              columns={columns}
              pagination={false}
              size="small"
              rowKey={(row) => row.key}
            />
          </Card>

          <Space
            style={{
              marginTop: 16,
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Button onClick={() => onSwitchBlock(-1)}>Previous block</Button>
            <Button onClick={() => onSwitchBlock(1)}>Next block</Button>
          </Space>
        </>
      )}
    </div>
  );
}

