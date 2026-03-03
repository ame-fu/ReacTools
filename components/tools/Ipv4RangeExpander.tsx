"use client";

import React from "react";
import { Alert, Button, Card, Form, Input, Table } from "antd";
import type { ColumnsType } from "antd/es/table";

function isValidIpv4(ip: string) {
  const cleanIp = ip.trim();
  return /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/.test(cleanIp);
}

function ipv4ToInt(ip: string) {
  if (!isValidIpv4(ip)) {
    return 0;
  }
  return ip
    .trim()
    .split(".")
    .reduce((acc, part, index) => acc + Number(part) * 256 ** (3 - index), 0);
}

function convertBase({
  value,
  fromBase,
  toBase,
}: {
  value: string;
  fromBase: number;
  toBase: number;
}) {
  const range = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/".split(
    "",
  );
  const fromRange = range.slice(0, fromBase);
  const toRange = range.slice(0, toBase);
  let decValue = value
    .split("")
    .reverse()
    .reduce((carry: bigint, digit: string, index: number) => {
      if (!fromRange.includes(digit)) {
        throw new Error(`Invalid digit "${digit}" for base ${fromBase}.`);
      }
      return (
        carry +
        BigInt(fromRange.indexOf(digit)) * BigInt(fromBase) ** BigInt(index)
      );
    }, BigInt(0));

  let newValue = "";
  while (decValue > BigInt(0)) {
    newValue = toRange[Number(decValue % BigInt(toBase))] + newValue;
    decValue = (decValue - (decValue % BigInt(toBase))) / BigInt(toBase);
  }
  return newValue || "0";
}

function bits2ip(ipInt: number) {
  return `${ipInt >>> 24}.${(ipInt >> 16) & 255}.${(ipInt >> 8) & 255}.${ipInt & 255}`;
}

function getRangesize(start: string, end: string) {
  if (start == null || end == null) {
    return -1;
  }
  return 1 + parseInt(end, 2) - parseInt(start, 2);
}

function getCidr(start: string, end: string) {
  if (start == null || end == null) {
    return null;
  }
  const range = getRangesize(start, end);
  if (range < 1) {
    return null;
  }

  let mask = 32;
  for (let i = 0; i < 32; i += 1) {
    if (start[i] !== end[i]) {
      mask = i;
      break;
    }
  }

  const newStart = start.substring(0, mask) + "0".repeat(32 - mask);
  const newEnd = end.substring(0, mask) + "1".repeat(32 - mask);

  return { start: newStart, end: newEnd, mask };
}

interface Ipv4RangeExpanderResult {
  oldSize?: number;
  newStart?: string;
  newEnd?: string;
  newCidr?: string;
  newSize?: number;
}

function calculateCidr(startIp: string, endIp: string): Ipv4RangeExpanderResult | undefined {
  const start = convertBase({
    value: ipv4ToInt(startIp).toString(),
    fromBase: 10,
    toBase: 2,
  }).padStart(32, "0");
  const end = convertBase({
    value: ipv4ToInt(endIp).toString(),
    fromBase: 10,
    toBase: 2,
  }).padStart(32, "0");

  const cidr = getCidr(start, end);
  if (cidr != null) {
    const result: Ipv4RangeExpanderResult = {};
    result.newEnd = bits2ip(parseInt(cidr.end, 2));
    result.newStart = bits2ip(parseInt(cidr.start, 2));
    result.newCidr = `${result.newStart}/${cidr.mask}`;
    result.newSize = getRangesize(cidr.start, cidr.end);
    result.oldSize = getRangesize(start, end);
    return result;
  }
  return undefined;
}

interface Row {
  key: string;
  label: string;
  oldValue?: string;
  newValue?: string;
}

export function Ipv4RangeExpander() {
  const [startIp, setStartIp] = React.useState("192.168.1.1");
  const [endIp, setEndIp] = React.useState("192.168.6.255");

  const startValid = React.useMemo(() => isValidIpv4(startIp), [startIp]);
  const endValid = React.useMemo(() => isValidIpv4(endIp), [endIp]);

  const result = React.useMemo(
    () => calculateCidr(startIp, endIp),
    [startIp, endIp],
  );

  const showResult =
    startValid && endValid && result !== undefined && result !== null;

  const rows: Row[] = React.useMemo(
    () => [
      {
        key: "start",
        label: "Start address",
        oldValue: startIp,
        newValue: result?.newStart,
      },
      {
        key: "end",
        label: "End address",
        oldValue: endIp,
        newValue: result?.newEnd,
      },
      {
        key: "size",
        label: "Addresses in range",
        oldValue: result?.oldSize?.toLocaleString(),
        newValue: result?.newSize?.toLocaleString(),
      },
      {
        key: "cidr",
        label: "CIDR",
        oldValue: "",
        newValue: result?.newCidr,
      },
    ],
    [endIp, result, startIp],
  );

  const columns: ColumnsType<Row> = [
    {
      title: "",
      dataIndex: "label",
      key: "label",
      width: 180,
    },
    {
      title: "old value",
      dataIndex: "oldValue",
      key: "oldValue",
      render: (value: string | undefined) => (
        <span style={{ fontFamily: "monospace" }}>{value}</span>
      ),
    },
    {
      title: "new value",
      dataIndex: "newValue",
      key: "newValue",
      render: (value: string | undefined) => (
        <span style={{ fontFamily: "monospace" }}>{value}</span>
      ),
    },
  ];

  const invalidCombination =
    startValid &&
    endValid &&
    (!result || !showResult || ipv4ToInt(endIp) < ipv4ToInt(startIp));

  const switchStartEnd = () => {
    setStartIp(endIp);
    setEndIp(startIp);
  };

  return (
    <div>
      <Form layout="vertical">
        <Card>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <Form.Item label="Start address">
                <Input
                  value={startIp}
                  onChange={(e) => setStartIp(e.target.value)}
                  placeholder="Start IPv4 address..."
                  status={startValid ? undefined : "error"}
                />
              </Form.Item>
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <Form.Item label="End address">
                <Input
                  value={endIp}
                  onChange={(e) => setEndIp(e.target.value)}
                  placeholder="End IPv4 address..."
                  status={endValid ? undefined : "error"}
                />
              </Form.Item>
            </div>
          </div>
        </Card>
      </Form>

      {showResult && (
        <Card>
          <Table<Row>
            dataSource={rows}
            columns={columns}
            pagination={false}
            size="small"
            rowKey={(row) => row.key}
          />
        </Card>
      )}

      {!showResult && invalidCombination && (
        <Alert
          style={{ marginTop: 16 }}
          type="error"
          message="Invalid combination of start and end IPv4 address"
          description={
            <div>
              <div style={{ margin: "8px 0", opacity: 0.7 }}>
                The end IPv4 address is lower than the start IPv4 address. This
                is not valid and no result could be calculated. In most cases
                the solution is to change start and end address.
              </div>
              <Button onClick={switchStartEnd}>
                Switch start and end IPv4 address
              </Button>
            </div>
          }
        />
      )}
    </div>
  );
}

