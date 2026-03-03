"use client";

import React from "react";
import { Alert, Form, Input } from "antd";
import { SHA1 } from "crypto-js";

function isValidMac(mac: string) {
  const cleaned = mac.trim();
  return /^[0-9a-fA-F:. -]{2,}$/.test(cleaned);
}

export function Ipv6UlaGenerator() {
  const [macAddress, setMacAddress] = React.useState("20:37:06:12:34:56");
  const [timestamp, setTimestamp] = React.useState(() => Date.now());
  React.useEffect(() => {
    setTimestamp(Date.now());
  }, [macAddress]);

  const macValid = React.useMemo(() => isValidMac(macAddress), [macAddress]);

  const sections = React.useMemo(() => {
    const hex40bit = SHA1(`${timestamp}${macAddress}`)
      .toString()
      .substring(30);

    const ula = `fd${hex40bit.substring(0, 2)}:${hex40bit.substring(
      2,
      6,
    )}:${hex40bit.substring(6)}`;

    return [
      {
        label: "IPv6 ULA:",
        value: `${ula}::/48`,
      },
      {
        label: "First routable block:",
        value: `${ula}:0::/64`,
      },
      {
        label: "Last routable block:",
        value: `${ula}:ffff::/64`,
      },
    ];
  }, [macAddress, timestamp]);

  const effectiveSections = macValid
    ? sections
    : sections.map((s) => ({ ...s, value: "" }));

  return (
    <div>
      <Alert
        type="info"
        message="Info"
        description="This tool uses the first method suggested by IETF using the current timestamp plus the mac address, sha1 hashed, and the lower 40 bits to generate your random ULA."
        showIcon
      />

      <Form layout="vertical">
        <Form.Item label="MAC address">
          <Input
            value={macAddress}
            onChange={(e) => setMacAddress(e.target.value)}
            placeholder="Type a MAC address"
            status={macValid ? undefined : "error"}
          />
        </Form.Item>

        {macValid &&
          effectiveSections.map(({ label, value }) => (
            <Form.Item key={label} label={label.replace(":", "")}>
              <Input value={value} readOnly />
            </Form.Item>
          ))}
      </Form>
    </div>
  );
}

