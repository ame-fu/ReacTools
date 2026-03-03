"use client";

import React from "react";
import { Card, Input } from "antd";
import { useI18n } from "@/lib/i18n/context";

function getCharsetLength(password: string): number {
  let charsetLength = 0;
  if (/[a-z]/.test(password)) charsetLength += 26;
  if (/[A-Z]/.test(password)) charsetLength += 26;
  if (/\d/.test(password)) charsetLength += 10;
  if (/\W|_/.test(password)) charsetLength += 32;
  return charsetLength;
}

function prettifyExponentialNotation(exponentialNotation: number): string {
  const [base, exponent] = exponentialNotation.toString().split("e");
  const baseAsNumber = Number.parseFloat(base);
  const prettyBase =
    baseAsNumber % 1 === 0
      ? baseAsNumber.toLocaleString()
      : baseAsNumber.toFixed(2);
  return exponent ? `${prettyBase}e${exponent}` : prettyBase;
}

const TIME_UNITS = [
  {
    unit: "millenium",
    secondsInUnit: 31536000000,
    plural: "millennia",
    format: prettifyExponentialNotation,
  },
  { unit: "century", secondsInUnit: 3153600000, plural: "centuries" },
  { unit: "decade", secondsInUnit: 315360000, plural: "decades" },
  { unit: "year", secondsInUnit: 31536000, plural: "years" },
  { unit: "month", secondsInUnit: 2592000, plural: "months" },
  { unit: "week", secondsInUnit: 604800, plural: "weeks" },
  { unit: "day", secondsInUnit: 86400, plural: "days" },
  { unit: "hour", secondsInUnit: 3600, plural: "hours" },
  { unit: "minute", secondsInUnit: 60, plural: "minutes" },
  { unit: "second", secondsInUnit: 1, plural: "seconds" },
];

function getHumanFriendlyDuration(seconds: number): string {
  if (seconds <= 0.001) return "Instantly";
  if (seconds <= 1) return "Less than a second";

  let remaining = seconds;
  const parts: string[] = [];

  for (const {
    unit,
    secondsInUnit,
    plural,
    format = (x: number) => x.toString(),
  } of TIME_UNITS) {
    const quantity = Math.floor(remaining / secondsInUnit);
    remaining %= secondsInUnit;
    if (quantity <= 0) continue;
    parts.push(
      `${format(quantity)} ${quantity > 1 ? plural : unit}`,
    );
    if (parts.length >= 2) break;
  }

  return parts.join(", ");
}

interface CrackEstimation {
  entropy: number;
  charsetLength: number;
  passwordLength: number;
  crackDurationFormatted: string;
  secondsToCrack: number;
  score: number;
}

function getPasswordCrackTimeEstimation(
  password: string,
  guessesPerSecond = 1e9,
): CrackEstimation {
  const charsetLength = getCharsetLength(password);
  const passwordLength = password.length;
  const entropy =
    password === ""
      ? 0
      : Math.log2(Math.max(charsetLength, 1)) * passwordLength;
  const secondsToCrack = 2 ** entropy / guessesPerSecond;
  const crackDurationFormatted = getHumanFriendlyDuration(secondsToCrack);
  const score = Math.min(entropy / 128, 1);

  return {
    entropy,
    charsetLength,
    passwordLength,
    crackDurationFormatted,
    secondsToCrack,
    score,
  };
}

export function PasswordStrengthAnalyser() {
  const { t } = useI18n();
  const [password, setPassword] = React.useState("");

  const estimation = React.useMemo(
    () => getPasswordCrackTimeEstimation(password),
    [password],
  );

  const details = [
    { label: t("tools.password-strength-analyser.passwordLength"), value: estimation.passwordLength },
    { label: t("tools.password-strength-analyser.entropy"), value: Math.round(estimation.entropy * 100) / 100 },
    { label: t("tools.password-strength-analyser.charsetSize"), value: estimation.charsetLength },
    {
      label: t("tools.password-strength-analyser.score"),
      value: `${Math.round(estimation.score * 100)} / 100`,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Input.Password
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t("tools.password-strength-analyser.placeholder")}
        size="large"
      />

      <Card style={{ textAlign: "center" }}>
        <div style={{ opacity: 0.7, marginBottom: 8 }}>
          {t("tools.password-strength-analyser.crackDuration")}
        </div>
        <div style={{ fontSize: 24, fontWeight: 600 }}>
          {estimation.crackDurationFormatted}
        </div>
      </Card>

      <Card>
        {details.map(({ label, value }) => (
          <div
            key={label}
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <div style={{ flex: 1, textAlign: "right", opacity: 0.7 }}>
              {label}
            </div>
            <div style={{ flex: 1, textAlign: "left" }}>{value}</div>
          </div>
        ))}
      </Card>

      <div style={{ opacity: 0.7 }}>
        {t("tools.password-strength-analyser.note")}
      </div>
    </div>
  );
}
