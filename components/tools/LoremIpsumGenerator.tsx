"use client";

import React from "react";
import { Button, Card, Form, Slider, Switch } from "antd";
import sample from "lodash/sample";
import { TextareaCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

const vocabulary = [
  "a",
  "ac",
  "accumsan",
  "ad",
  "adipiscing",
  "aenean",
  "aliquam",
  "aliquet",
  "amet",
  "ante",
  "aptent",
  "arcu",
  "at",
  "auctor",
  "bibendum",
  "blandit",
  "class",
  "commodo",
  "condimentum",
  "congue",
  "consectetur",
  "consequat",
  "conubia",
  "convallis",
  "cras",
  "cubilia",
  "cum",
  "curabitur",
  "curae",
  "dapibus",
  "diam",
  "dictum",
  "dictumst",
  "dignissim",
  "dolor",
  "donec",
  "dui",
  "duis",
  "egestas",
  "eget",
  "eleifend",
  "elementum",
  "elit",
  "enim",
  "erat",
  "eros",
  "est",
  "et",
  "etiam",
  "eu",
  "euismod",
  "facilisi",
  "faucibus",
  "felis",
  "fermentum",
  "feugiat",
  "fringilla",
  "fusce",
  "gravida",
  "habitant",
  "habitasse",
  "hac",
  "hendrerit",
  "himenaeos",
  "iaculis",
  "id",
  "imperdiet",
  "in",
  "inceptos",
  "integer",
  "interdum",
  "ipsum",
  "justo",
  "lacinia",
  "lacus",
  "laoreet",
  "lectus",
  "leo",
  "ligula",
  "litora",
  "lobortis",
  "lorem",
  "luctus",
  "maecenas",
  "magna",
  "magnis",
  "malesuada",
  "massa",
  "mattis",
  "mauris",
  "metus",
  "mi",
  "molestie",
  "mollis",
  "montes",
  "morbi",
  "mus",
  "nam",
  "nascetur",
  "natoque",
  "nec",
  "neque",
  "netus",
  "nisi",
  "nisl",
  "non",
  "nostra",
  "nulla",
  "nullam",
  "nunc",
  "odio",
  "orci",
  "ornare",
  "parturient",
  "pellentesque",
  "penatibus",
  "per",
  "pharetra",
  "phasellus",
  "placerat",
  "platea",
  "porta",
  "porttitor",
  "posuere",
  "potenti",
  "praesent",
  "pretium",
  "primis",
  "proin",
  "pulvinar",
  "purus",
  "quam",
  "quis",
  "quisque",
  "rhoncus",
  "ridiculus",
  "risus",
  "rutrum",
  "sagittis",
  "sapien",
  "scelerisque",
  "sed",
  "sem",
  "semper",
  "senectus",
  "sit",
  "sociis",
  "sociosqu",
  "sodales",
  "sollicitudin",
  "suscipit",
  "suspendisse",
  "taciti",
  "tellus",
  "tempor",
  "tempus",
  "tincidunt",
  "torquent",
  "tortor",
  "turpis",
  "ullamcorper",
  "ultrices",
  "ultricies",
  "urna",
  "varius",
  "vehicula",
  "vel",
  "velit",
  "venenatis",
  "vestibulum",
  "vitae",
  "vivamus",
  "viverra",
  "volutpat",
  "vulputate",
];

const firstSentence =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

function randIntFromInterval(min: number, max: number) {
  const mn = Math.ceil(min);
  const mx = Math.floor(max);
  return Math.floor(Math.random() * (mx - mn + 1)) + mn;
}

function generateSentence(length: number) {
  const words = Array.from({ length }).map(
    () => sample(vocabulary) ?? "lorem",
  );
  const sentence = words.join(" ");
  return `${sentence.charAt(0).toUpperCase() + sentence.slice(1)}.`;
}

function generateLoremIpsum(options: {
  paragraphCount: number;
  sentencePerParagraph: number;
  wordCount: number;
  startWithLoremIpsum: boolean;
  asHTML: boolean;
}) {
  const { paragraphCount, sentencePerParagraph, wordCount, startWithLoremIpsum, asHTML } =
    options;

  const paragraphs = Array.from({ length: paragraphCount }).map(() =>
    Array.from({ length: sentencePerParagraph }).map(() =>
      generateSentence(wordCount),
    ),
  );

  if (startWithLoremIpsum && paragraphs.length > 0 && paragraphs[0].length > 0) {
    paragraphs[0][0] = firstSentence;
  }

  if (asHTML) {
    return `<p>${paragraphs
      .map((s) => s.join(" "))
      .join("</p>\n\n<p>")}</p>`;
  }

  return paragraphs.map((s) => s.join(" ")).join("\n\n");
}

export function LoremIpsumGenerator() {
  const { t } = useI18n();
  const [paragraphs, setParagraphs] = React.useState(1);
  const [sentences, setSentences] = React.useState<[number, number]>([3, 8]);
  const [words, setWords] = React.useState<[number, number]>([8, 15]);
  const [startWithLoremIpsum, setStartWithLoremIpsum] = React.useState(true);
  const [asHTML, setAsHTML] = React.useState(false);
  const [version, setVersion] = React.useState(0);

  const loremIpsumText = React.useMemo(
    () =>
      generateLoremIpsum({
        paragraphCount: paragraphs,
        asHTML,
        sentencePerParagraph: randIntFromInterval(
          sentences[0],
          sentences[1],
        ),
        wordCount: randIntFromInterval(words[0], words[1]),
        startWithLoremIpsum,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paragraphs, sentences, words, startWithLoremIpsum, asHTML, version],
  );

  const refresh = () => {
    setVersion((v) => v + 1);
  };

  return (
    <Card>
      <Form layout="vertical">
        <Form.Item label={t("tools.lorem-ipsum-generator.paragraphs")}>
          <Slider
            min={1}
            max={20}
            step={1}
            value={paragraphs}
            onChange={(v) => setParagraphs(v as number)}
          />
        </Form.Item>

        <Form.Item label={t("tools.lorem-ipsum-generator.sentencesPerParagraph")}>
          <Slider
            range
            min={1}
            max={50}
            step={1}
            value={sentences}
            onChange={(v) => setSentences(v as [number, number])}
          />
        </Form.Item>

        <Form.Item label={t("tools.lorem-ipsum-generator.wordsPerSentence")}>
          <Slider
            range
            min={1}
            max={50}
            step={1}
            value={words}
            onChange={(v) => setWords(v as [number, number])}
          />
        </Form.Item>

        <Form.Item label={t("tools.lorem-ipsum-generator.startWithLoremIpsum")}>
          <Switch
            checked={startWithLoremIpsum}
            onChange={setStartWithLoremIpsum}
          />
        </Form.Item>

        <Form.Item label={t("tools.lorem-ipsum-generator.asHTML")}>
          <Switch checked={asHTML} onChange={setAsHTML} />
        </Form.Item>

        <Form.Item label={t("tools.lorem-ipsum-generator.placeholder")}>
          <TextareaCopyable
            value={loremIpsumText}
            rows={5}
            placeholder={t("tools.lorem-ipsum-generator.placeholder")}
            copyPlacement="outside"
          />
        </Form.Item>

        <Form.Item>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <Button onClick={refresh}>{t("tools.lorem-ipsum-generator.buttonRefresh")}</Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
}

