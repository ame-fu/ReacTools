"use client";

import React from "react";
import { Card, Checkbox, Form } from "antd";
import RandExp from "randexp";
import Link from "next/link";
import { matchRegex } from "@/lib/regex-tester.service";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

export function RegexTester() {
  const { t } = useI18n();
  const [regex, setRegex] = React.useState("");
  const [text, setText] = React.useState("");
  const [global, setGlobal] = React.useState(true);
  const [ignoreCase, setIgnoreCase] = React.useState(false);
  const [multiline, setMultiline] = React.useState(false);
  const [dotAll, setDotAll] = React.useState(true);
  const [unicode, setUnicode] = React.useState(true);
  const [unicodeSets, setUnicodeSets] = React.useState(false);

  const flags = React.useMemo(() => {
    let f = "d"; // hasIndices
    if (global) f += "g";
    if (ignoreCase) f += "i";
    if (multiline) f += "m";
    if (dotAll) f += "s";
    if (unicode) f += "u";
    else if (unicodeSets) f += "v";
    return f;
  }, [global, ignoreCase, multiline, dotAll, unicode, unicodeSets]);

  const { results, regexError } = React.useMemo(() => {
    try {
      new RegExp(regex);
      return { results: matchRegex(regex, text, flags), regexError: null as string | null };
    } catch (e) {
      return {
        results: [] as ReturnType<typeof matchRegex>,
        regexError: e instanceof Error ? e.message : "Invalid regex",
      };
    }
  }, [regex, text, flags]);

  const sample = React.useMemo(() => {
    if (!regex.trim()) return "";
    try {
      const sanitized = regex.replace(/\(\?<[^>]*>/g, "(?:");
      const randexp = new RandExp(new RegExp(sanitized));
      return randexp.gen();
    } catch {
      return "";
    }
  }, [regex]);

  return (
    <div className="max-w-[600px] space-y-4">
      <Card title="Regex">
        <Form layout="vertical">
          <Form.Item validateStatus={regexError ? "error" : undefined} help={regexError || undefined}>
            <InputCopyable
              value={regex}
              onChange={setRegex}
              label={t("tools.regex-tester.labelRegex")}
              placeholder={t("tools.regex-tester.placeholderRegex")}
              multiline
              rows={3}
              className="font-mono"
              status={regexError ? "error" : undefined}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 8 }}>
            <Link href="/regex-memo" target="_blank" className="text-sm text-primary inline-block">
              See Regular Expression Cheatsheet
            </Link>
          </Form.Item>
          <Form.Item>
            <div className="flex flex-wrap gap-4">
              <Checkbox checked={global} onChange={(e) => setGlobal(e.target.checked)}>
                Global (g)
              </Checkbox>
              <Checkbox checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)}>
                Case-insensitive (i)
              </Checkbox>
              <Checkbox checked={multiline} onChange={(e) => setMultiline(e.target.checked)}>
                Multiline (m)
              </Checkbox>
              <Checkbox checked={dotAll} onChange={(e) => setDotAll(e.target.checked)}>
                Singleline (s)
              </Checkbox>
              <Checkbox checked={unicode} onChange={(e) => setUnicode(e.target.checked)}>
                Unicode (u)
              </Checkbox>
              <Checkbox checked={unicodeSets} onChange={(e) => setUnicodeSets(e.target.checked)}>
                Unicode Sets (v)
              </Checkbox>
            </div>
          </Form.Item>
          <Form.Item>
            <InputCopyable
              value={text}
              onChange={setText}
              label={t("tools.regex-tester.labelText")}
              placeholder={t("tools.regex-tester.placeholderText")}
              multiline
              rows={5}
              className="font-mono"
            />
          </Form.Item>
        </Form>
      </Card>
      <Card title="Matches">
        {results.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2">Index</th>
                <th className="text-left py-2">Value</th>
                <th className="text-left py-2">Captures</th>
                <th className="text-left py-2">Groups</th>
              </tr>
            </thead>
            <tbody>
              {results.map((m, i) => (
                <tr key={i}>
                  <td className="py-2">{m.index}</td>
                  <td className="py-2 font-mono">{m.value}</td>
                  <td className="py-2">
                    <ul className="list-none text-xs">
                      {m.captures.map((c) => (
                        <li key={c.name}>
                          &quot;{c.name}&quot; = {c.value} [{c.start} - {c.end}]
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-2">
                    <ul className="list-none text-xs">
                      {m.groups.map((g) => (
                        <li key={g.name}>
                          &quot;{g.name}&quot; = {g.value} [{g.start} - {g.end}]
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="opacity-70">No match</div>
        )}
      </Card>
      <Card title="Sample matching text">
        <pre className="whitespace-pre-wrap break-all font-mono text-sm">{sample || " "}</pre>
      </Card>
    </div>
  );
}
