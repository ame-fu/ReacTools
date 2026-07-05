"use client";

import React from "react";
import { Alert, Form, Input } from "antd";
import { SHA1 } from "crypto-js";
import { useI18n } from "@/lib/i18n/context";

function isValidMac(mac: string) {
  const cleaned = mac.trim();
  return /^[0-9a-fA-F:. -]{2,}$/.test(cleaned);
}

const slug = "ipv6-ula-generator";

export function Ipv6UlaGenerator() {
  const { t } = useI18n();
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
      { label: t(`tools.${slug}.labelUla`) + ":", value: `${ula}::/48` },
      { label: t(`tools.${slug}.labelFirstBlock`) + ":", value: `${ula}:0::/64` },
      { label: t(`tools.${slug}.labelLastBlock`) + ":", value: `${ula}:ffff::/64` },
    ];
  }, [macAddress, timestamp, t]);

  const effectiveSections = macValid
    ? sections
    : sections.map((s) => ({ ...s, value: "" }));

  return (
    <div>
      <Alert
        type="info"
        title={t(`tools.${slug}.infoMessage`)}
        description={t(`tools.${slug}.infoDescription`)}
        showIcon
      />

      <Form layout="vertical">
        <Form.Item label={t(`tools.${slug}.labelMac`)}>
          <Input
            value={macAddress}
            onChange={(e) => setMacAddress(e.target.value)}
            placeholder={t(`tools.${slug}.placeholderMac`)}
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

