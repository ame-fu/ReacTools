"use client";

import React from "react";
import { Card, Button, Alert, Form } from "antd";
import { InputCopyable, TextareaCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";
import { withBasePath } from "@/lib/base-path";

const MsgType = {
  notImplemented: "notImplemented",
  notTranslatable: "notTranslatable",
  errorDuringConversion: "errorDuringConversion",
} as const;

const defaultDockerRun =
  "docker run -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro --restart always --log-opt max-size=1g nginx";

function textToBase64(text: string): string {
  if (typeof window === "undefined") return "";
  return btoa(unescape(encodeURIComponent(text)));
}

type Message = { type: string; value: string };

export function DockerRunToCompose() {
  const { t } = useI18n();
  const [dockerRun, setDockerRun] = React.useState(defaultDockerRun);
  const [result, setResult] = React.useState<{ yaml: string; messages: Message[] }>({ yaml: "", messages: [] });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const trimmed = dockerRun.trim();
    if (!trimmed) {
      setResult({ yaml: "", messages: [] });
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(withBasePath("/api/docker-run-to-compose"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: trimmed }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setResult({
            yaml: data.yaml ?? "",
            messages: Array.isArray(data.messages) ? data.messages : [],
          });
        }
      })
      .catch(() => {
        if (!cancelled) setResult({ yaml: "", messages: [] });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dockerRun]);

  const notImplemented = result.messages.filter((m) => m.type === MsgType.notImplemented).map((m) => m.value);
  const notComposable = result.messages.filter((m) => m.type === MsgType.notTranslatable).map((m) => m.value);
  const errors = result.messages.filter((m) => m.type === MsgType.errorDuringConversion).map((m) => m.value);

  const download = () => {
    if (!result.yaml) return;
    const dataUrl = `data:application/yaml;base64,${textToBase64(result.yaml)}`;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "docker-compose.yml";
    a.click();
  };

  return (
    <div className="space-y-4">
      <Card>
        <Form layout="vertical">
          <Form.Item>
            <InputCopyable
              value={dockerRun}
              onChange={setDockerRun}
              label={t("tools.docker-run-to-docker-compose-converter.labelCommand")}
              placeholder={t("tools.docker-run-to-docker-compose-converter.placeholderCommand")}
              multiline
              rows={4}
              className="font-mono"
            />
          </Form.Item>
        </Form>
      </Card>
      <Card>
        <Form layout="vertical">
          <Form.Item>
            <TextareaCopyable
              value={result.yaml}
              rows={16}
              label={t("tools.docker-run-to-docker-compose-converter.labelCompose")}
              placeholder={loading ? t("tools.docker-run-to-docker-compose-converter.placeholderConverting") : undefined}
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
          <Form.Item>
            <div className="flex justify-center">
              <Button disabled={!result.yaml || loading} onClick={download} loading={loading}>
                {t("tools.docker-run-to-docker-compose-converter.buttonDownload")}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
      {notComposable.length > 0 && (
        <Alert
          type="info"
          title="These options are not translatable to docker-compose"
          description={<ul className="list-disc pl-5 mt-1">{notComposable.map((m, i) => <li key={i}>{m}</li>)}</ul>}
          showIcon
        />
      )}
      {notImplemented.length > 0 && (
        <Alert
          type="warning"
          message="These options are not yet implemented and therefore have not been translated"
          description={<ul className="list-disc pl-5 mt-1">{notImplemented.map((m, i) => <li key={i}>{m}</li>)}</ul>}
          showIcon
        />
      )}
      {errors.length > 0 && (
        <Alert
          type="error"
          title="The following errors occurred"
          description={<ul className="list-disc pl-5 mt-1">{errors.map((m, i) => <li key={i}>{m}</li>)}</ul>}
          showIcon
        />
      )}
    </div>
  );
}
