"use client";

import React from "react";
import { Card, Switch, Form } from "antd";
import JSON5 from "json5";
import _ from "lodash";
import { diff, type Difference } from "@/lib/json-diff.models";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

function formatValue(value: unknown): string {
  if (_.isNull(value)) return "null";
  return JSON.stringify(value);
}

function DiffViewer({
  diff: d,
  showKeys = true,
}: {
  diff: Difference;
  showKeys?: boolean;
}) {
  const { type, status } = d;

  if (status === "updated" && "value" in d && "oldValue" in d) {
    return (
      <li className="updated-line">
        {showKeys && d.key !== "" && (
          <>
            <span className="font-medium text-foreground">{d.key}</span>
            {": "}
          </>
        )}
        <span className="bg-red-500/20 text-red-600 dark:text-red-400 px-1 rounded">{formatValue((d as { oldValue: unknown }).oldValue)}</span>
        <span className="bg-green-500/20 text-green-600 dark:text-green-400 px-1 rounded ml-1">{formatValue(d.value)}</span>,
      </li>
    );
  }

  if (type === "array") {
    const children = (d as { children: Difference[] }).children;
    return (
      <li>
        <span className={`inline-block ${status === "added" ? "bg-green-500/20 text-green-600" : status === "removed" ? "bg-red-500/20 text-red-600" : ""}`}>
          {showKeys && d.key !== "" && <span className="font-medium">{d.key}</span>}
          {" ["}
          {children.length > 0 && (
            <ul className="list-none pl-5">
              {children.map((child, i) => (
                <DiffViewer key={i} diff={child} showKeys={true} />
              ))}
            </ul>
          )}
          {"]"} ,
        </span>
      </li>
    );
  }

  if (type === "object") {
    const children = (d as { children: Difference[] }).children;
    return (
      <li>
        <span className={`inline-block ${status === "added" ? "bg-green-500/20 text-green-600" : status === "removed" ? "bg-red-500/20 text-red-600" : ""}`}>
          {showKeys && d.key !== "" && <span className="font-medium">{d.key}</span>}
          {" {"}
          {children.length > 0 && (
            <ul className="list-none pl-5">
              {children.map((child, i) => (
                <DiffViewer key={i} diff={child} showKeys={true} />
              ))}
            </ul>
          )}
          {"}"} ,
        </span>
      </li>
    );
  }

  const valueToDisplay = status === "removed" ? (d as { oldValue: unknown }).oldValue : (d as { value: unknown }).value;
  const copy = () => {
    try {
      navigator.clipboard.writeText(formatValue(valueToDisplay));
    } catch {
      // ignore
    }
  };
  return (
    <li>
      <span className={`${status === "added" ? "bg-green-500/20 text-green-600" : status === "removed" ? "bg-red-500/20 text-red-600" : ""} px-1 rounded cursor-pointer`} onClick={copy}>
        {showKeys && d.key !== "" && (
          <>
            <span className="font-medium">{d.key}</span>
            {": "}
          </>
        )}
        {formatValue(valueToDisplay)}
      </span>
      ,
    </li>
  );
}

export function JsonDiff() {
  const { t } = useI18n();
  const [rawLeft, setRawLeft] = React.useState("");
  const [rawRight, setRawRight] = React.useState("");
  const [onlyShowDifferences, setOnlyShowDifferences] = React.useState(false);

  const leftJson = React.useMemo(() => {
    if (!rawLeft.trim()) return undefined;
    try {
      return JSON5.parse(rawLeft);
    } catch {
      return undefined;
    }
  }, [rawLeft]);

  const rightJson = React.useMemo(() => {
    if (!rawRight.trim()) return undefined;
    try {
      return JSON5.parse(rawRight);
    } catch {
      return undefined;
    }
  }, [rawRight]);

  const result = React.useMemo(
    () => (leftJson !== undefined && rightJson !== undefined ? diff(leftJson, rightJson, { onlyShowDifferences }) : null),
    [leftJson, rightJson, onlyShowDifferences],
  );

  const jsonAreTheSame = React.useMemo(() => _.isEqual(leftJson, rightJson), [leftJson, rightJson]);
  const showResults = leftJson !== undefined && rightJson !== undefined;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      <div style={{ flex: "1 1 300px" }}>
        <Form layout="vertical">
          <Form.Item>
            <InputCopyable
              value={rawLeft}
              onChange={setRawLeft}
              label={t("tools.json-diff.firstJson")}
              placeholder={t("tools.json-diff.firstPlaceholder")}
              multiline
              rows={20}
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
        </Form>
      </div>
      <div style={{ flex: "1 1 300px" }}>
        <Form layout="vertical">
          <Form.Item>
            <InputCopyable
              value={rawRight}
              onChange={setRawRight}
              label={t("tools.json-diff.compareJson")}
              placeholder={t("tools.json-diff.comparePlaceholder")}
              multiline
              rows={20}
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
        </Form>
      </div>
      {showResults && (
        <div style={{ width: "100%", flexBasis: "100%" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Switch checked={onlyShowDifferences} onChange={setOnlyShowDifferences} />
              {t("tools.json-diff.onlyShowDiff")}
            </label>
          </div>
          <Card>
            {jsonAreTheSame ? (
              <div style={{ textAlign: "center", opacity: 0.7 }}>{t("tools.json-diff.sameJson")}</div>
            ) : result ? (
              <ul style={{ listStyle: "none", paddingLeft: 0, fontSize: 14 }} className="diffs-viewer">
                <DiffViewer diff={result} showKeys={false} />
              </ul>
            ) : null}
          </Card>
        </div>
      )}
    </div>
  );
}
