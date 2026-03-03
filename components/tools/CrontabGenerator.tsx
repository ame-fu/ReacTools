"use client";

import React from "react";
import { Card, Input, Switch, Table } from "antd";
import cronstrue from "cronstrue";
import { isValidCron } from "cron-validator";

function isCronValid(v: string): boolean {
  return isValidCron(v, { allowBlankDay: true, alias: true, seconds: true });
}

const helpers = [
  { symbol: "*", meaning: "Any value", example: "* * * * *", equivalent: "Every minute" },
  { symbol: "-", meaning: "Range of values", example: "1-10 * * * *", equivalent: "Minutes 1 through 10" },
  { symbol: ",", meaning: "List of values", example: "1,10 * * * *", equivalent: "At minutes 1 and 10" },
  { symbol: "/", meaning: "Step values", example: "*/10 * * * *", equivalent: "Every 10 minutes" },
  { symbol: "@yearly", meaning: "Once every year at midnight of 1 January", example: "@yearly", equivalent: "0 0 1 1 *" },
  { symbol: "@monthly", meaning: "Once a month at midnight on the first day", example: "@monthly", equivalent: "0 0 1 * *" },
  { symbol: "@weekly", meaning: "Once a week at midnight on Sunday morning", example: "@weekly", equivalent: "0 0 * * 0" },
  { symbol: "@daily", meaning: "Once a day at midnight", example: "@daily", equivalent: "0 0 * * *" },
  { symbol: "@hourly", meaning: "Once an hour at the beginning of the hour", example: "@hourly", equivalent: "0 * * * *" },
];

export function CrontabGenerator() {
  const [cron, setCron] = React.useState("40 * * * *");
  const [verbose, setVerbose] = React.useState(true);
  const [use24Hour, setUse24Hour] = React.useState(true);
  const [dayStartZero, setDayStartZero] = React.useState(true);

  const cronString = React.useMemo(() => {
    if (!cron.trim()) return " ";
    if (!isCronValid(cron)) return " ";
    try {
      return cronstrue.toString(cron, {
        verbose,
        use24HourTimeFormat: use24Hour,
        dayOfWeekStartIndexZero: dayStartZero,
        throwExceptionOnParseError: true,
      });
    } catch {
      return " ";
    }
  }, [cron, verbose, use24Hour, dayStartZero]);

  const valid = isCronValid(cron);

  return (
    <div className="space-y-4">
      <Card>
        <div className="max-w-sm mx-auto mb-3">
          <Input
            value={cron}
            onChange={(e) => setCron(e.target.value)}
            placeholder="* * * * *"
            size="large"
            className="font-mono text-center text-lg"
            status={!valid && cron.trim() ? "error" : undefined}
          />
          {!valid && cron.trim() && <div className="text-red-500 text-sm mt-1">This cron is invalid</div>}
        </div>
        <div className="text-center text-xl opacity-80 my-2 mb-4">{cronString}</div>
        <hr className="my-4 border-border" />
        <div className="flex flex-wrap justify-center gap-6">
          <label className="flex items-center gap-2">
            <Switch checked={verbose} onChange={setVerbose} />
            Verbose
          </label>
          <label className="flex items-center gap-2">
            <Switch checked={use24Hour} onChange={setUse24Hour} />
            Use 24 hour time format
          </label>
          <label className="flex items-center gap-2">
            <Switch checked={dayStartZero} onChange={setDayStartZero} />
            Days start at 0
          </label>
        </div>
      </Card>
      <Card>
        <pre className="text-sm overflow-auto py-2 whitespace-pre">
{`┌──────────── [optional] seconds (0 - 59)
| ┌────────── minute (0 - 59)
| | ┌──────── hour (0 - 23)
| | | ┌────── day of month (1 - 31)
| | | | ┌──── month (1 - 12) OR jan,feb,mar,apr ...
| | | | | ┌── day of week (0 - 6, sunday=0) OR sun,mon ...
| | | | | |
* * * * * * command`}
        </pre>
        <Table
          dataSource={helpers}
          rowKey="symbol"
          pagination={false}
          size="small"
          columns={[
            { title: "Symbol", dataIndex: "symbol", key: "symbol", render: (t: string) => <strong>{t}</strong> },
            { title: "Meaning", dataIndex: "meaning", key: "meaning" },
            { title: "Example", dataIndex: "example", key: "example", render: (t: string) => <code>{t}</code> },
            { title: "Equivalent", dataIndex: "equivalent", key: "equivalent" },
          ]}
        />
      </Card>
    </div>
  );
}
