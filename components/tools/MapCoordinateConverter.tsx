"use client";

import React from "react";
import { Form, Select, InputNumber } from "antd";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

const X_PI = (3.14159265358979324 * 3000) / 180;
const A = 6378245.0;
const EE = 0.00669342162296594323;

function transformLat(x: number, y: number): number {
  let ret =
    -100 +
    2 * x +
    3 * y +
    0.2 * y * y +
    0.1 * x * y +
    0.2 * Math.sqrt(Math.abs(x));
  ret +=
    ((20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2) / 3;
  ret +=
    ((20 * Math.sin(y * Math.PI) + 40 * Math.sin((y / 3) * Math.PI)) * 2) / 3;
  return ret;
}

function transformLng(x: number, y: number): number {
  let ret =
    300 +
    x +
    2 * y +
    0.1 * x * x +
    0.1 * x * y +
    0.1 * Math.sqrt(Math.abs(x));
  ret +=
    ((20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2) / 3;
  ret +=
    ((20 * Math.sin(x * Math.PI) + 40 * Math.sin((x / 3) * Math.PI)) * 2) / 3;
  return ret;
}

function wgs84ToGcj02(lng: number, lat: number): [number, number] {
  let dLat = transformLat(lng - 105, lat - 35);
  let dLng = transformLng(lng - 105, lat - 35);
  const radLat = (lat / 180) * Math.PI;
  let magic = Math.sin(radLat);
  magic = 1 - EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180) / (((A * (1 - EE)) / (magic * sqrtMagic)) * Math.PI);
  dLng = (dLng * 180) / ((A / sqrtMagic) * Math.cos(radLat) * Math.PI);
  return [lng + dLng, lat + dLat];
}

function gcj02ToWgs84(lng: number, lat: number): [number, number] {
  const [gLng, gLat] = wgs84ToGcj02(lng, lat);
  return [lng * 2 - gLng, lat * 2 - gLat];
}

function gcj02ToBd09(lng: number, lat: number): [number, number] {
  const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * X_PI);
  const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * X_PI);
  return [z * Math.cos(theta) + 0.0065, z * Math.sin(theta) + 0.006];
}

function bd09ToGcj02(lng: number, lat: number): [number, number] {
  const x = lng - 0.0065;
  const y = lat - 0.006;
  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI);
  const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI);
  return [z * Math.cos(theta), z * Math.sin(theta)];
}

type CoordSystem = "WGS84" | "GCJ02" | "BD09";

function convert(
  lng: number,
  lat: number,
  from: CoordSystem,
  to: CoordSystem,
): [number, number] {
  if (from === to) return [lng, lat];
  let gcj: [number, number] = [lng, lat];
  if (from === "WGS84") gcj = wgs84ToGcj02(lng, lat);
  else if (from === "BD09") gcj = bd09ToGcj02(lng, lat);
  if (to === "GCJ02") return gcj;
  if (to === "WGS84") return gcj02ToWgs84(gcj[0], gcj[1]);
  return gcj02ToBd09(gcj[0], gcj[1]);
}

export function MapCoordinateConverter() {
  const { t } = useI18n();
  const [from, setFrom] = React.useState<CoordSystem>("WGS84");
  const [to, setTo] = React.useState<CoordSystem>("GCJ02");
  const [lng, setLng] = React.useState<number | null>(116.404);
  const [lat, setLat] = React.useState<number | null>(39.915);

  const result = React.useMemo(() => {
    if (lng == null || lat == null) return null;
    const [outLng, outLat] = convert(lng, lat, from, to);
    return { lng: outLng, lat: outLat };
  }, [lng, lat, from, to]);

  return (
    <div>
      <Form layout="vertical">
        <Form.Item label={t("tools.map-coordinate-converter.fromSystem")}>
          <Select
            value={from}
            onChange={(v) => setFrom(v as CoordSystem)}
            options={(["WGS84", "GCJ02", "BD09"] as const).map((s) => ({
              value: s,
              label: s,
            }))}
            style={{ width: 160 }}
          />
        </Form.Item>
        <Form.Item label={t("tools.map-coordinate-converter.longitude")}>
          <InputNumber
            value={lng ?? undefined}
            onChange={(v) => setLng(v ?? null)}
            placeholder="116.404"
            style={{ width: "100%", maxWidth: 240 }}
            step={0.000001}
          />
        </Form.Item>
        <Form.Item label={t("tools.map-coordinate-converter.latitude")}>
          <InputNumber
            value={lat ?? undefined}
            onChange={(v) => setLat(v ?? null)}
            placeholder="39.915"
            style={{ width: "100%", maxWidth: 240 }}
            step={0.000001}
          />
        </Form.Item>
        <Form.Item label={t("tools.map-coordinate-converter.toSystem")}>
          <Select
            value={to}
            onChange={(v) => setTo(v as CoordSystem)}
            options={(["WGS84", "GCJ02", "BD09"] as const).map((s) => ({
              value: s,
              label: s,
            }))}
            style={{ width: 160 }}
          />
        </Form.Item>
        {result && (
          <>
            <Form.Item label={t("tools.map-coordinate-converter.resultLongitude")}>
              <InputCopyable
                value={String(result.lng)}
                readOnly
                style={{ fontFamily: "monospace" }}
              />
            </Form.Item>
            <Form.Item label={t("tools.map-coordinate-converter.resultLatitude")}>
              <InputCopyable
                value={String(result.lat)}
                readOnly
                style={{ fontFamily: "monospace" }}
              />
            </Form.Item>
          </>
        )}
      </Form>
    </div>
  );
}
