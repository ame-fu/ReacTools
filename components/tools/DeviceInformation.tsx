"use client";

import React from "react";
import { Card } from "antd";
import { useI18n } from "@/lib/i18n/context";

function useWindowSize() {
  const [size, setSize] = React.useState({ width: typeof window !== "undefined" ? window.innerWidth : 0, height: typeof window !== "undefined" ? window.innerHeight : 0 });
  React.useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
}

const infoStyle = { borderRadius: 4, padding: 12, background: "rgba(0,0,0,0.02)" };

export function DeviceInformation() {
  const { t } = useI18n();
  const { width, height } = useWindowSize();
  const sections = React.useMemo(
    () => [
      {
        name: t("tools.device-information.screen"),
        information: [
          { label: t("tools.device-information.screenSize"), value: typeof window !== "undefined" ? `${window.screen.availWidth} x ${window.screen.availHeight}` : "—" },
          { label: t("tools.device-information.orientation"), value: typeof window !== "undefined" ? window.screen.orientation?.type ?? "—" : "—" },
          { label: t("tools.device-information.orientationAngle"), value: typeof window !== "undefined" ? `${window.screen.orientation?.angle ?? 0}°` : "—" },
          { label: t("tools.device-information.colorDepth"), value: typeof window !== "undefined" ? `${window.screen.colorDepth} bits` : "—" },
          { label: t("tools.device-information.pixelRatio"), value: typeof window !== "undefined" ? `${window.devicePixelRatio} dppx` : "—" },
          { label: t("tools.device-information.windowSize"), value: `${width} x ${height}` },
        ],
      },
      {
        name: t("tools.device-information.device"),
        information: [
          { label: t("tools.device-information.browserVendor"), value: typeof navigator !== "undefined" ? navigator.vendor : "—" },
          { label: t("tools.device-information.languages"), value: typeof navigator !== "undefined" ? navigator.languages?.join(", ") ?? "—" : "—" },
          { label: t("tools.device-information.platform"), value: typeof navigator !== "undefined" ? navigator.platform : "—" },
          { label: t("tools.device-information.userAgent"), value: typeof navigator !== "undefined" ? navigator.userAgent : "—" },
        ],
      },
    ],
    [width, height, t],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {sections.map(({ name, information }) => (
        <Card key={name} title={name}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {information.map(({ label, value }) => (
              <div key={label} style={infoStyle}>
                <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 18, wordBreak: "break-all" }}>{value || "unknown"}</div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
