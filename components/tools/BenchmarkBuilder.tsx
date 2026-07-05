"use client";

import React from "react";
import { Button, Card, Form, Input, InputNumber, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useI18n } from "@/lib/i18n/context";

interface Suite {
  title: string;
  data: Array<number | null>;
}

interface ResultRow {
  position: number;
  title: string;
  size: number;
  mean: string;
  variance: string;
}

const DEFAULT_SUITES: Suite[] = [
  { title: "Suite 1", data: [5, 10] },
  { title: "Suite 2", data: [8, 12] },
];

const STORAGE_KEY_SUITES = "benchmark-builder:suites";
const STORAGE_KEY_UNIT = "benchmark-builder:unit";

function computeAverage(data: number[]) {
  if (data.length === 0) return 0;
  const sum = data.reduce((acc, v) => acc + v, 0);
  return sum / data.length;
}

function computeVariance(data: number[]) {
  const mean = computeAverage(data);
  const squaredDiffs = data.map((value) => (value - mean) ** 2);
  return computeAverage(squaredDiffs);
}

function arrayToMarkdownTable({
  data,
  headerMap = {},
}: {
  data: Record<string, unknown>[];
  headerMap?: Record<string, string>;
}) {
  if (!Array.isArray(data) || data.length === 0) {
    return "";
  }

  const headers = Object.keys(data[0]);
  const rows = data.map((obj) => Object.values(obj));

  const headerRow = `| ${headers
    .map((header) => headerMap[header] ?? header)
    .join(" | ")} |`;
  const separatorRow = `| ${headers.map(() => "---").join(" | ")} |`;
  const dataRows = rows.map((row) => `| ${row.join(" | ")} |`).join("\n");

  return `${headerRow}\n${separatorRow}\n${dataRows}`;
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

export function BenchmarkBuilder() {
  const { t } = useI18n();
  const [suites, setSuites] = React.useState<Suite[]>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_SUITES;
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_SUITES);
      if (!raw) return DEFAULT_SUITES;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return DEFAULT_SUITES;
      return parsed;
    } catch {
      return DEFAULT_SUITES;
    }
  });

  const [unit, setUnit] = React.useState<string>(() => {
    if (typeof window === "undefined") {
      return "";
    }
    try {
      return window.localStorage.getItem(STORAGE_KEY_UNIT) ?? "";
    } catch {
      return "";
    }
  });

  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY_SUITES, JSON.stringify(suites));
    } catch {
      // ignore
    }
  }, [suites]);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY_UNIT, unit);
    } catch {
      // ignore
    }
  }, [unit]);

  const results = React.useMemo<ResultRow[]>(() => {
    const cleaned = suites
      .map(({ data, title }) => {
        const numericData = data.filter(
          (v): v is number => typeof v === "number" && !Number.isNaN(v),
        );
        return {
          title,
          size: numericData.length,
          mean: computeAverage(numericData),
          variance: computeVariance(numericData),
        };
      })
      .sort((a, b) => a.mean - b.mean)
      .map(({ mean, variance, size, title }, index, all) => {
        const cleanUnit = unit.trim();
        const bestMean = all[0]?.mean ?? 0;
        const deltaWithBestMean = mean - bestMean;
        const ratioWithBestMean =
          bestMean === 0 ? "∞" : round(mean / bestMean).toString();

        const comparisonValues =
          index !== 0 && bestMean !== mean
            ? ` (+${round(deltaWithBestMean)}${cleanUnit}; x${ratioWithBestMean})`
            : "";

        return {
          position: index + 1,
          title,
          mean: `${round(mean)}${cleanUnit}${comparisonValues}`,
          variance: `${round(variance)}${cleanUnit}${
            cleanUnit ? "²" : ""
          }`,
          size,
        };
      });

    return cleaned;
  }, [suites, unit]);

  const copy = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  const headerMap: Record<keyof ResultRow, string> = {
    position: "Position",
    title: "Suite",
    size: "Samples",
    mean: "Mean",
    variance: "Variance",
  };

  const copyAsMarkdown = () => {
    const markdown = arrayToMarkdownTable({
      data: results as unknown as Record<string, unknown>[],
      headerMap,
    });
    void copy(markdown);
  };

  const copyAsBulletList = () => {
    if (!results.length) return;
    const bulletList = results
      .flatMap(({ title, ...sections }) => {
        return [
          `- ${title}`,
          ...Object.entries(sections).map(([key, value]) => {
            const label =
              headerMap[key as keyof ResultRow] ?? (key as string);
            return `  - ${label}: ${value}`;
          }),
        ];
      })
      .join("\n");

    void copy(bulletList);
  };

  const updateSuiteTitle = (index: number, title: string) => {
    setSuites((prev) =>
      prev.map((suite, i) => (i === index ? { ...suite, title } : suite)),
    );
  };

  const updateSuiteDataValue = (
    suiteIndex: number,
    valueIndex: number,
    value: number | null,
  ) => {
    setSuites((prev) =>
      prev.map((suite, i) => {
        if (i !== suiteIndex) return suite;
        const nextData = [...suite.data];
        nextData[valueIndex] = value;
        return { ...suite, data: nextData };
      }),
    );
  };

  const addSuite = (index: number) => {
    setSuites((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, {
        title: `Suite ${prev.length + 1}`,
        data: [0],
      });
      return next;
    });
  };

  const removeSuite = (index: number) => {
    setSuites((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const resetSuites = () => {
    setSuites([
      { title: "Suite 1", data: [] },
      { title: "Suite 2", data: [] },
    ]);
  };

  const addValue = (suiteIndex: number) => {
    setSuites((prev) =>
      prev.map((suite, i) =>
        i === suiteIndex ? { ...suite, data: [...suite.data, null] } : suite,
      ),
    );
  };

  const removeValue = (suiteIndex: number, valueIndex: number) => {
    setSuites((prev) =>
      prev.map((suite, i) => {
        if (i !== suiteIndex) return suite;
        const nextData = suite.data.filter((_, idx) => idx !== valueIndex);
        return { ...suite, data: nextData };
      }),
    );
  };

  const columns: ColumnsType<ResultRow> = [
    {
      title: headerMap.position,
      dataIndex: "position",
      key: "position",
      width: 90,
    },
    {
      title: headerMap.title,
      dataIndex: "title",
      key: "title",
    },
    {
      title: headerMap.size,
      dataIndex: "size",
      key: "size",
      width: 110,
    },
    {
      title: headerMap.mean,
      dataIndex: "mean",
      key: "mean",
    },
    {
      title: headerMap.variance,
      dataIndex: "variance",
      key: "variance",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          paddingBottom: 8,
        }}
      >
        {suites.map((suite, index) => (
          <div key={index} style={{ minWidth: 280 }}>
            <Card style={{ width: 294 }}>
              <Form layout="vertical">
                <Form.Item label={t("tools.benchmark-builder.suiteName")}>
                  <Input
                    value={suite.title}
                    onChange={(e) => updateSuiteTitle(index, e.target.value)}
                    placeholder={t("tools.benchmark-builder.placeholderSuiteName")}
                  />
                </Form.Item>

                <Form.Item label={t("tools.benchmark-builder.suiteValues")}>
                  <Space
                    orientation="vertical"
                    style={{ width: "100%" }}
                    size="small"
                  >
                    {suite.data.map((value, valueIndex) => (
                      <Space
                        key={valueIndex}
                        align="center"
                        style={{ width: "100%" }}
                      >
                        <InputNumber
                          style={{ flex: 1 }}
                          placeholder={t("tools.benchmark-builder.placeholderValues")}
                          value={value ?? undefined}
                          onChange={(v) =>
                            updateSuiteDataValue(index, valueIndex, v)
                          }
                        />
                        <Button
                          danger
                          type="text"
                          onClick={() => removeValue(index, valueIndex)}
                        >
                          {t("tools.benchmark-builder.delete")}
                        </Button>
                      </Space>
                    ))}
                    <Button type="dashed" onClick={() => addValue(index)}>
                      {t("tools.benchmark-builder.addMeasure")}
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 8,
                gap: 8,
              }}
            >
              {suites.length > 1 && (
                <Button type="text" danger onClick={() => removeSuite(index)}>
                  {t("tools.benchmark-builder.deleteSuite")}
                </Button>
              )}
              <Button type="text" onClick={() => addSuite(index)}>
                {t("tools.benchmark-builder.addSuite")}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", width: "100%" }}>
        <Form layout="vertical">
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              marginBottom: 16,
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            <Form.Item label={t("tools.benchmark-builder.unit")} style={{ flex: 1, maxWidth: 260, marginBottom: 0 }}>
              <Input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder={t("tools.benchmark-builder.unitPlaceholder")}
              />
            </Form.Item>

            <Button onClick={resetSuites}>{t("tools.benchmark-builder.buttonReset")}</Button>
          </div>
        </Form>

        <Table<ResultRow>
          dataSource={results}
          columns={columns}
          rowKey={(row) => row.title + row.position}
          pagination={false}
          size="small"
        />

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            marginTop: 20,
          }}
        >
          <Button onClick={copyAsMarkdown}>{t("tools.benchmark-builder.buttonCopyMd")}</Button>
          <Button onClick={copyAsBulletList}>{t("tools.benchmark-builder.buttonCopyList")}</Button>
        </div>
      </div>
    </div>
  );
}

