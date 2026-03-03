"use client";

import React from "react";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

const natoAlphabet = [
  "Alpha",
  "Bravo",
  "Charlie",
  "Delta",
  "Echo",
  "Foxtrot",
  "Golf",
  "Hotel",
  "India",
  "Juliet",
  "Kilo",
  "Lima",
  "Mike",
  "November",
  "Oscar",
  "Papa",
  "Quebec",
  "Romeo",
  "Sierra",
  "Tango",
  "Uniform",
  "Victor",
  "Whiskey",
  "X-ray",
  "Yankee",
  "Zulu",
];

function textToNatoAlphabet(text: string) {
  return text
    .split("")
    .map((character) => {
      const idx = character.toLowerCase().charCodeAt(0) - "a".charCodeAt(0);
      const natoWord = natoAlphabet[idx];
      return natoWord ?? character;
    })
    .join(" ");
}

export function TextToNatoAlphabet() {
  const { t } = useI18n();
  const [input, setInput] = React.useState("");
  const natoText = React.useMemo(() => textToNatoAlphabet(input), [input]);

  return (
    <div>
      <InputCopyable
        value={input}
        onChange={(v) => setInput(v)}
        placeholder={t("tools.text-to-nato-alphabet.inputPlaceholder")}
      />

      {natoText && (
        <div>
          <InputCopyable
            value={natoText}
            readOnly
            label={t("tools.text-to-nato-alphabet.outputLabel")}
          />
        </div>
      )}
    </div>
  );
}

