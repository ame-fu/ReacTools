"use client";

import React from "react";
import { Card, Input, Select, Form } from "antd";
import { generateMeta } from "@it-tools/oggen";
import { TextareaCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

const typeOptions = [
  { label: "Website", value: "website" },
  { label: "Article", value: "article" },
  { label: "Book", value: "book" },
  { label: "Profile", value: "profile" },
  {
    label: "Music",
    options: [
      { label: "Song", value: "music.song" },
      { label: "Album", value: "music.album" },
      { label: "Playlist", value: "music.playlist" },
      { label: "Radio station", value: "music.radio_station" },
    ],
  },
  {
    label: "Video",
    options: [
      { label: "Movie", value: "video.movie" },
      { label: "Episode", value: "video.episode" },
      { label: "TV show", value: "video.tv_show" },
      { label: "Other video", value: "video.other" },
    ],
  },
];

const twitterCardOptions = [
  { label: "Summary", value: "summary" },
  { label: "Summary with large image", value: "summary_large_image" },
  { label: "Application", value: "app" },
  { label: "Player", value: "player" },
];

const defaultMetadata: Record<string, string> = {
  type: "website",
  "twitter:card": "summary_large_image",
  title: "",
  description: "",
  url: "",
  image: "",
  "image:alt": "",
  "image:width": "",
  "image:height": "",
  "twitter:site": "",
  "twitter:creator": "",
};

export function OgMetaGenerator() {
  const { t } = useI18n();
  const [metadata, setMetadata] = React.useState<Record<string, string>>(defaultMetadata);

  const update = (key: string, value: string) => {
    setMetadata((prev) => ({ ...prev, [key]: value }));
  };

  const metaTags = React.useMemo(() => {
    const twitterKeys = Object.keys(metadata).filter((k) => k.startsWith("twitter:"));
    const twitterMeta: Record<string, string> = {};
    twitterKeys.forEach((k) => {
      twitterMeta[k.replace(/^twitter:/, "")] = metadata[k];
    });
    const otherMeta: Record<string, string> = {};
    Object.entries(metadata).forEach(([k, v]) => {
      if (!k.startsWith("twitter:") && v !== undefined && v !== "") otherMeta[k] = v;
    });
    try {
      return generateMeta(
        { ...otherMeta, twitter: twitterMeta },
        { generateTwitterCompatibleMeta: true, indentation: 2 },
      );
    } catch {
      return "";
    }
  }, [metadata]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Card title={t("tools.og-meta-generator.generalInfo")}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4, fontSize: 14, opacity: 0.8 }}>{t("tools.og-meta-generator.pageType")}</label>
          <Select
            value={metadata.type}
            onChange={(v) => update("type", v)}
            options={typeOptions}
            style={{ width: "100%" }}
            placeholder={t("tools.og-meta-generator.pageTypePlaceholder")}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4, fontSize: 14, opacity: 0.8 }}>{t("tools.og-meta-generator.pageTitle")}</label>
          <Input
            value={metadata.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder={t("tools.og-meta-generator.pageTitlePlaceholder")}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4, fontSize: 14, opacity: 0.8 }}>{t("tools.og-meta-generator.pageDescription")}</label>
          <Input
            value={metadata.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder={t("tools.og-meta-generator.pageDescriptionPlaceholder")}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 4, fontSize: 14, opacity: 0.8 }}>{t("tools.og-meta-generator.pageUrl")}</label>
          <Input
            value={metadata.url}
            onChange={(e) => update("url", e.target.value)}
            placeholder={t("tools.og-meta-generator.urlPlaceholder")}
          />
        </div>
      </Card>
      <Card title={t("tools.og-meta-generator.image")}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4, fontSize: 14, opacity: 0.8 }}>{t("tools.og-meta-generator.imageUrl")}</label>
          <Input
            value={metadata.image}
            onChange={(e) => update("image", e.target.value)}
            placeholder={t("tools.og-meta-generator.imageUrlPlaceholder")}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4, fontSize: 14, opacity: 0.8 }}>{t("tools.og-meta-generator.imageAlt")}</label>
          <Input
            value={metadata["image:alt"]}
            onChange={(e) => update("image:alt", e.target.value)}
            placeholder={t("tools.og-meta-generator.imageAltPlaceholder")}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ display: "block", marginBottom: 4, fontSize: 14, opacity: 0.8 }}>{t("tools.og-meta-generator.width")}</label>
            <Input
              value={metadata["image:width"]}
              onChange={(e) => update("image:width", e.target.value)}
              placeholder={t("tools.og-meta-generator.widthPlaceholder")}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 4, fontSize: 14, opacity: 0.8 }}>{t("tools.og-meta-generator.height")}</label>
            <Input
              value={metadata["image:height"]}
              onChange={(e) => update("image:height", e.target.value)}
              placeholder={t("tools.og-meta-generator.heightPlaceholder")}
            />
          </div>
        </div>
      </Card>
      <Card title={t("tools.og-meta-generator.twitter")}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4, fontSize: 14, opacity: 0.8 }}>{t("tools.og-meta-generator.cardType")}</label>
          <Select
            value={metadata["twitter:card"]}
            onChange={(v) => update("twitter:card", v)}
            options={twitterCardOptions}
            style={{ width: "100%" }}
            placeholder={t("tools.og-meta-generator.cardTypePlaceholder")}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4, fontSize: 14, opacity: 0.8 }}>{t("tools.og-meta-generator.siteAccount")}</label>
          <Input
            value={metadata["twitter:site"]}
            onChange={(e) => update("twitter:site", e.target.value)}
            placeholder={t("tools.og-meta-generator.sitePlaceholder")}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 4, fontSize: 14, opacity: 0.8 }}>{t("tools.og-meta-generator.creatorAccount")}</label>
          <Input
            value={metadata["twitter:creator"]}
            onChange={(e) => update("twitter:creator", e.target.value)}
            placeholder={t("tools.og-meta-generator.creatorPlaceholder")}
          />
        </div>
      </Card>
      <Card title={t("tools.og-meta-generator.metaTags")}>
        <Form layout="vertical">
          <Form.Item>
            <TextareaCopyable
              value={metaTags}
              rows={16}
              style={{ fontFamily: "monospace", fontSize: 12 }}
            />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
