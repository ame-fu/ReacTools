"use client";

import React from "react";
import { Card, Select, Form } from "antd";
import { format } from "sql-formatter";
import type { FormatOptionsWithLanguage } from "sql-formatter";
import { InputCopyable, TextareaCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

const dialectOptions = [
  { label: "GCP BigQuery", value: "bigquery" },
  { label: "IBM DB2", value: "db2" },
  { label: "Apache Hive", value: "hive" },
  { label: "MariaDB", value: "mariadb" },
  { label: "MySQL", value: "mysql" },
  { label: "Couchbase N1QL", value: "n1ql" },
  { label: "Oracle PL/SQL", value: "plsql" },
  { label: "PostgreSQL", value: "postgresql" },
  { label: "Amazon Redshift", value: "redshift" },
  { label: "Spark", value: "spark" },
  { label: "Standard SQL", value: "sql" },
  { label: "SQLite", value: "sqlite" },
  { label: "SQL Server T-SQL", value: "tsql" },
];

const keywordCaseOptions = [
  { label: "UPPERCASE", value: "upper" },
  { label: "lowercase", value: "lower" },
  { label: "Preserve", value: "preserve" },
];

const indentStyleOptions = [
  { label: "Standard", value: "standard" },
  { label: "Tabular left", value: "tabularLeft" },
  { label: "Tabular right", value: "tabularRight" },
];

export function SqlPrettify() {
  const { t } = useI18n();
  const [rawSQL, setRawSQL] = React.useState(
    "select field1,field2,field3 from my_table where my_condition;",
  );
  const [config, setConfig] = React.useState<FormatOptionsWithLanguage>({
    keywordCase: "upper",
    useTabs: false,
    language: "sql",
    indentStyle: "standard",
  });

  const prettySQL = React.useMemo(() => {
    try {
      return format(rawSQL, config);
    } catch {
      return rawSQL;
    }
  }, [rawSQL, config]);

  return (
    <div className="space-y-4">
      <div className="max-w-[600px] mx-auto flex flex-wrap gap-4 justify-center mb-4">
        <div className="min-w-[140px]">
          <label className="block text-sm opacity-80 mb-1">{t("tools.sql-prettify.labelDialect")}</label>
          <Select
            value={config.language}
            onChange={(v) => setConfig((c) => ({ ...c, language: v }))}
            options={dialectOptions}
            className="w-full"
          />
        </div>
        <div className="min-w-[140px]">
          <label className="block text-sm opacity-80 mb-1">{t("tools.sql-prettify.labelKeywordCase")}</label>
          <Select
            value={config.keywordCase}
            onChange={(v) => setConfig((c) => ({ ...c, keywordCase: v }))}
            options={keywordCaseOptions}
            className="w-full"
          />
        </div>
        <div className="min-w-[140px]">
          <label className="block text-sm opacity-80 mb-1">{t("tools.sql-prettify.labelIndentStyle")}</label>
          <Select
            value={config.indentStyle}
            onChange={(v) => setConfig((c) => ({ ...c, indentStyle: v }))}
            options={indentStyleOptions}
            className="w-full"
          />
        </div>
      </div>
      <Card>
        <Form layout="vertical">
          <Form.Item>
            <InputCopyable
              value={rawSQL}
              onChange={setRawSQL}
              label={t("tools.sql-prettify.labelQuery")}
              placeholder={t("tools.sql-prettify.placeholderQuery")}
              multiline
              rows={20}
              className="font-mono"
            />
          </Form.Item>
        </Form>
      </Card>
      <Card>
        <Form layout="vertical">
          <Form.Item>
            <TextareaCopyable value={prettySQL} rows={20} style={{ fontFamily: "monospace" }} label={t("tools.sql-prettify.labelPrettified")} />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
