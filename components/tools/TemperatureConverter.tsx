"use client";

import React from "react";
import { Card, Form, InputNumber } from "antd";
import { useI18n } from "@/lib/i18n/context";

type TemperatureScale =
  | "kelvin"
  | "celsius"
  | "fahrenheit"
  | "rankine"
  | "delisle"
  | "newton"
  | "reaumur"
  | "romer";

function convertCelsiusToKelvin(temperature: number) {
  return temperature + 273.15;
}

function convertKelvinToCelsius(temperature: number) {
  return temperature - 273.15;
}

function convertFahrenheitToKelvin(temperature: number) {
  return (temperature + 459.67) * (5 / 9);
}

function convertKelvinToFahrenheit(temperature: number) {
  return temperature * (9 / 5) - 459.67;
}

function convertRankineToKelvin(temperature: number) {
  return temperature * (5 / 9);
}

function convertKelvinToRankine(temperature: number) {
  return temperature * (9 / 5);
}

function convertDelisleToKelvin(temperature: number) {
  return 373.15 - (2 / 3) * temperature;
}

function convertKelvinToDelisle(temperature: number) {
  return (3 / 2) * (373.15 - temperature);
}

function convertNewtonToKelvin(temperature: number) {
  return temperature * (100 / 33) + 273.15;
}

function convertKelvinToNewton(temperature: number) {
  return (temperature - 273.15) * (33 / 100);
}

function convertReaumurToKelvin(temperature: number) {
  return temperature * (5 / 4) + 273.15;
}

function convertKelvinToReaumur(temperature: number) {
  return (temperature - 273.15) * (4 / 5);
}

function convertRomerToKelvin(temperature: number) {
  return (temperature - 7.5) * (40 / 21) + 273.15;
}

function convertKelvinToRomer(temperature: number) {
  return (temperature - 273.15) * (21 / 40) + 7.5;
}

interface UnitConfig {
  key: TemperatureScale;
  title: string;
  unit: string;
  toKelvin: (v: number) => number;
  fromKelvin: (v: number) => number;
}

const UNIT_CONFIGS: UnitConfig[] = [
  {
    key: "kelvin",
    title: "Kelvin",
    unit: "K",
    toKelvin: (v) => v,
    fromKelvin: (v) => v,
  },
  {
    key: "celsius",
    title: "Celsius",
    unit: "°C",
    toKelvin: convertCelsiusToKelvin,
    fromKelvin: convertKelvinToCelsius,
  },
  {
    key: "fahrenheit",
    title: "Fahrenheit",
    unit: "°F",
    toKelvin: convertFahrenheitToKelvin,
    fromKelvin: convertKelvinToFahrenheit,
  },
  {
    key: "rankine",
    title: "Rankine",
    unit: "°R",
    toKelvin: convertRankineToKelvin,
    fromKelvin: convertKelvinToRankine,
  },
  {
    key: "delisle",
    title: "Delisle",
    unit: "°De",
    toKelvin: convertDelisleToKelvin,
    fromKelvin: convertKelvinToDelisle,
  },
  {
    key: "newton",
    title: "Newton",
    unit: "°N",
    toKelvin: convertNewtonToKelvin,
    fromKelvin: convertKelvinToNewton,
  },
  {
    key: "reaumur",
    title: "Réaumur",
    unit: "°Ré",
    toKelvin: convertReaumurToKelvin,
    fromKelvin: convertKelvinToReaumur,
  },
  {
    key: "romer",
    title: "Rømer",
    unit: "°Rø",
    toKelvin: convertRomerToKelvin,
    fromKelvin: convertKelvinToRomer,
  },
];

const UNIT_CONFIGS_MAP: Record<TemperatureScale, UnitConfig> = UNIT_CONFIGS.reduce(
  (acc, cfg) => {
    acc[cfg.key] = cfg;
    return acc;
  },
  {} as Record<TemperatureScale, UnitConfig>,
);

export function TemperatureConverter() {
  const { t } = useI18n();
  const [values, setValues] = React.useState<Record<TemperatureScale, number>>(
    () => {
      const initialKelvin = 0;
      const next: Partial<Record<TemperatureScale, number>> = {};
      UNIT_CONFIGS.forEach((cfg) => {
        next[cfg.key] = Math.floor(cfg.fromKelvin(initialKelvin) * 100) / 100;
      });
      return next as Record<TemperatureScale, number>;
    },
  );

  const handleChange = (scale: TemperatureScale, value: number | null) => {
    const numericValue = value ?? 0;
    const { toKelvin } = UNIT_CONFIGS_MAP[scale];
    const kelvins = toKelvin(numericValue) ?? 0;

    const next: Record<TemperatureScale, number> = { ...values };
    UNIT_CONFIGS.forEach((cfg) => {
      const converted = cfg.fromKelvin(kelvins) ?? 0;
      next[cfg.key] = Math.floor(converted * 100) / 100;
    });

    setValues(next);
  };

  return (
    <div>
      <Form layout="vertical">
        <Card>
          {UNIT_CONFIGS.map(({ key, title, unit }) => (
            <Form.Item key={key} label={`${t(`tools.temperature-converter.${key}`)} (${unit})`}>
              <InputNumber
                style={{ width: "100%" }}
                value={values[key]}
                onChange={(v) => handleChange(key, v)}
              />
            </Form.Item>
          ))}
        </Card>
      </Form>
    </div>
  );
}

