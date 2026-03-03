"use client";

import React from "react";
import { Card, Select, Button, Form } from "antd";
import * as bip39 from "bip39";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

const LANGUAGES: Record<string, string[]> = {
  English: bip39.wordlists.english,
  "Chinese simplified": bip39.wordlists.chinese_simplified,
  "Chinese traditional": bip39.wordlists.chinese_traditional,
  Czech: bip39.wordlists.czech,
  French: bip39.wordlists.french,
  Italian: bip39.wordlists.italian,
  Japanese: bip39.wordlists.japanese,
  Korean: bip39.wordlists.korean,
  Portuguese: bip39.wordlists.portuguese,
  Spanish: bip39.wordlists.spanish,
};

function generateEntropy(): string {
  const bytes = new Uint8Array(16); // 128-bit for 12 words
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function Bip39Generator() {
  const { t } = useI18n();
  const [language, setLanguage] = React.useState<string>("English");
  const [entropy, setEntropy] = React.useState("");
  const [passphraseInput, setPassphraseInput] = React.useState("");

  const wordlist = LANGUAGES[language] ?? bip39.wordlists.english;

  const entropyToMnemonicSafe = (ent: string) => {
    if (!ent || !/^[a-fA-F0-9]*$/.test(ent)) return "";
    if (ent.length !== 32 && ent.length !== 64) return "";
    try {
      return bip39.entropyToMnemonic(ent, wordlist);
    } catch {
      return "";
    }
  };

  const mnemonicToEntropySafe = (phrase: string) => {
    if (!phrase.trim()) return "";
    try {
      return bip39.mnemonicToEntropy(phrase, wordlist);
    } catch {
      return "";
    }
  };

  const displayMnemonic =
    passphraseInput !== ""
      ? passphraseInput
      : entropyToMnemonicSafe(entropy);

  const displayEntropy =
    entropy !== "" ? entropy : mnemonicToEntropySafe(passphraseInput);

  const setMnemonic = (value: string) => {
    setPassphraseInput(value);
    const ent = mnemonicToEntropySafe(value);
    if (ent) setEntropy(ent);
  };

  const setEntropyFromInput = (value: string) => {
    setEntropy(value);
    const phrase = entropyToMnemonicSafe(value);
    if (phrase) setPassphraseInput(phrase);
  };

  const entropyError =
    entropy &&
    (entropy.length !== 32 && entropy.length !== 64 || !/^[a-fA-F0-9]*$/.test(entropy))
      ? t("tools.bip39-generator.entropyError")
      : null;

  const refreshEntropy = () => {
    const newEnt = generateEntropy();
    setEntropy(newEnt);
    setPassphraseInput(entropyToMnemonicSafe(newEnt));
  };

  return (
    <div>
      <Card>
        <Form layout="vertical">
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
            <div style={{ minWidth: 200 }}>
              <Form.Item label={t("tools.bip39-generator.language")}>
                <Select<string>
                  value={language}
                  onChange={setLanguage}
                  options={Object.keys(LANGUAGES).map((k) => ({
                    label: k,
                    value: k,
                  }))}
                  style={{ width: "100%" }}
                  showSearch
                />
              </Form.Item>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <Form.Item
                label={t("tools.bip39-generator.entropy")}
                validateStatus={entropyError ? "error" : undefined}
                help={entropyError || undefined}
              >
                <div style={{ display: "flex", gap: 8 }}>
                  <InputCopyable
                    value={displayEntropy}
                    onChange={setEntropyFromInput}
                    placeholder={t("tools.bip39-generator.entropyPlaceholder")}
                    status={entropyError ? "error" : undefined}
                    style={{ flex: 1 }}
                  />
                  <Button onClick={refreshEntropy}>{t("tools.bip39-generator.refresh")}</Button>
                </div>
              </Form.Item>
            </div>
          </div>

          <Form.Item>
            <InputCopyable
              value={displayMnemonic}
              onChange={setMnemonic}
              label={t("tools.bip39-generator.passphrase")}
              placeholder={t("tools.bip39-generator.passphrasePlaceholder")}
              multiline
              rows={2}
            />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
