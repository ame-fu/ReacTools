"use client";

import React from "react";
import figlet from "figlet";
import { Alert, Card, Divider, Form, InputNumber, Select, Spin } from "antd";
import { InputCopyable, TextareaCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

const FONT_STORAGE_KEY = "ascii-text-drawer:font";
const WIDTH_STORAGE_KEY = "ascii-text-drawer:width";

// 同步自原 Vue 版本的字体列表
const fonts = [
  "1Row",
  "3-D",
  "3D Diagonal",
  "3D-ASCII",
  "3x5",
  "4Max",
  "5 Line Oblique",
  "AMC 3 Line",
  "AMC 3 Liv1",
  "AMC AAA01",
  "AMC Neko",
  "AMC Razor",
  "AMC Razor2",
  "AMC Slash",
  "AMC Slider",
  "AMC Thin",
  "AMC Tubes",
  "AMC Untitled",
  "ANSI Shadow",
  "ASCII New Roman",
  "Acrobatic",
  "Alligator",
  "Alligator2",
  "Alpha",
  "Alphabet",
  "Arrows",
  "Avatar",
  "B1FF",
  "B1FF",
  "Banner",
  "Banner3-D",
  "Banner3",
  "Banner4",
  "Barbwire",
  "Basic",
  "Bear",
  "Bell",
  "Benjamin",
  "Big Chief",
  "Big Money-ne",
  "Big Money-nw",
  "Big Money-se",
  "Big Money-sw",
  "Big",
  "Bigfig",
  "Binary",
  "Block",
  "Blocks",
  "Bloody",
  "Bolger",
  "Braced",
  "Bright",
  "Broadway KB",
  "Broadway",
  "Bubble",
  "Bulbhead",
  "Caligraphy",
  "Caligraphy2",
  "Calvin S",
  "Cards",
  "Catwalk",
  "Chiseled",
  "Chunky",
  "Coinstak",
  "Cola",
  "Colossal",
  "Computer",
  "Contessa",
  "Contrast",
  "Cosmike",
  "Crawford",
  "Crawford2",
  "Crazy",
  "Cricket",
  "Cursive",
  "Cyberlarge",
  "Cybermedium",
  "Cybersmall",
  "Cygnet",
  "DANC4",
  "DOS Rebel",
  "DWhistled",
  "Dancing Font",
  "Decimal",
  "Def Leppard",
  "Delta Corps Priest 1",
  "Diamond",
  "Diet Cola",
  "Digital",
  "Doh",
  "Doom",
  "Dot Matrix",
  "Double Shorts",
  "Double",
  "Dr Pepper",
  "Efti Chess",
  "Efti Font",
  "Efti Italic",
  "Efti Piti",
  "Efti Robot",
  "Efti Wall",
  "Efti Water",
  "Electronic",
  "Elite",
  "Epic",
  "Fender",
  "Filter",
  "Fire Font-k",
  "Fire Font-s",
  "Flipped",
  "Flower Power",
  "Four Tops",
  "Fraktur",
  "Fun Face",
  "Fun Faces",
  "Fuzzy",
  "Georgi16",
  "Georgia11",
  "Ghost",
  "Ghoulish",
  "Glenyn",
  "Goofy",
  "Gothic",
  "Graceful",
  "Gradient",
  "Graffiti",
  "Greek",
  "Heart Left",
  "Heart Right",
  "Henry 3D",
  "Hex",
  "Hieroglyphs",
  "Hollywood",
  "Horizontal Left",
  "Horizontal Right",
  "ICL-1900",
  "Impossible",
  "Invita",
  "Isometric1",
  "Isometric2",
  "Isometric3",
  "Isometric4",
  "Italic",
  "Ivrit",
  "JS Block Letters",
  "JS Bracket Letters",
  "JS Capital Curves",
  "JS Cursive",
  "JS Stick Letters",
  "Jacky",
  "Jazmine",
  "Jerusalem",
  "Katakana",
  "Kban",
  "Keyboard",
  "Knob",
  "Konto Slant",
  "Konto",
  "LCD",
  "Larry 3D 2",
  "Larry 3D",
  "Lean",
  "Letters",
  "Lil Devil",
  "Line Blocks",
  "Linux",
  "Lockergnome",
  "Madrid",
  "Marquee",
  "Maxfour",
  "Merlin1",
  "Merlin2",
  "Mike",
  "Mini",
  "Mirror",
  "Mnemonic",
  "Modular",
  "Morse",
  "Morse2",
  "Moscow",
  "Mshebrew210",
  "Muzzle",
  "NScript",
  "NT Greek",
  "NV Script",
  "Nancyj-Fancy",
  "Nancyj-Improved",
  "Nancyj-Underlined",
  "Nancyj",
  "Nipples",
  "O8",
  "OS2",
  "Octal",
  "Ogre",
  "Old Banner",
  "Patorjk's Cheese",
  "Patorjk-HeX",
  "Pawp",
  "Peaks Slant",
  "Peaks",
  "Pebbles",
  "Pepper",
  "Poison",
  "Puffy",
  "Puzzle",
  "Pyramid",
  "Rammstein",
  "Rectangles",
  "Red Phoenix",
  "Relief",
  "Relief2",
  "Reverse",
  "Roman",
  "Rot13",
  "Rot13",
  "Rotated",
  "Rounded",
  "Rowan Cap",
  "Rozzo",
  "Runic",
  "Runyc",
  "S Blood",
  "SL Script",
  "Santa Clara",
  "Script",
  "Serifcap",
  "Shadow",
  "Shimrod",
  "Short",
  "Slant Relief",
  "Slant",
  "Slide",
  "Small Caps",
  "Small Isometric1",
  "Small Keyboard",
  "Small Poison",
  "Small Script",
  "Small Shadow",
  "Small Slant",
  "Small Tengwar",
  "Small",
  "Soft",
  "Speed",
  "Spliff",
  "Stacey",
  "Stampate",
  "Stampatello",
  "Standard",
  "Star Strips",
  "Star Wars",
  "Stellar",
  "Stforek",
  "Stick Letters",
  "Stop",
  "Straight",
  "Stronger Than All",
  "Sub-Zero",
  "Swamp Land",
  "Swan",
  "Sweet",
  "THIS",
  "Tanja",
  "Tengwar",
  "Term",
  "Test1",
  "The Edge",
  "Thick",
  "Thin",
  "Thorned",
  "Three Point",
  "Ticks Slant",
  "Ticks",
  "Tiles",
  "Tinker-Toy",
  "Tombstone",
  "Train",
  "Trek",
  "Tsalagi",
  "Tubular",
  "Twisted",
  "Two Point",
  "USA Flag",
  "Univers",
  "Varsity",
  "Wavy",
  "Weird",
  "Wet Letter",
  "Whimsy",
  "Wow",
];

figlet.defaults({ fontPath: "//unpkg.com/figlet@1.6.0/fonts/" });

export function AsciiTextDrawer() {
  const { t } = useI18n();
  const [input, setInput] = React.useState("Ascii ART");
  const [font, setFont] = React.useState<string>(() => {
    if (typeof window === "undefined") return "Standard";
    return window.localStorage.getItem(FONT_STORAGE_KEY) ?? "Standard";
  });
  const [width, setWidth] = React.useState<number>(() => {
    if (typeof window === "undefined") return 80;
    const stored = window.localStorage.getItem(WIDTH_STORAGE_KEY);
    return stored ? Number(stored) || 80 : 80;
  });
  const [output, setOutput] = React.useState("");
  const [errored, setErrored] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(FONT_STORAGE_KEY, font);
  }, [font]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(WIDTH_STORAGE_KEY, String(width));
  }, [width]);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      setProcessing(true);
      try {
        const options = {
          font: font as figlet.Fonts,
          width,
          whitespaceBreak: true,
        };
        const text = await new Promise<string>((resolve, reject) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- figlet Options vs FigletOptions type mismatch
          figlet.text(input, options as any, (err, result) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(result ?? "");
          });
        });
        if (!cancelled) {
          setOutput(text);
          setErrored(false);
        }
      } catch {
        if (!cancelled) {
          setErrored(true);
        }
      } finally {
        if (!cancelled) {
          setProcessing(false);
        }
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [input, font, width]);

  return (
    <Card style={{ maxWidth: 600 }}>
      <Form layout="vertical">
        <Form.Item label={t("tools.ascii-text-drawer.inputPlaceholder")}>
          <InputCopyable
            value={input}
            onChange={(v) => setInput(v)}
            multiline
            rows={4}
            placeholder={t("tools.ascii-text-drawer.inputPlaceholder")}
          />
        </Form.Item>

        <Divider />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          <Form.Item label={t("tools.ascii-text-drawer.fontLabel")}>
            <Select
              showSearch
              value={font}
              onChange={setFont}
              style={{ width: "100%" }}
              placeholder={t("tools.ascii-text-drawer.fontPlaceholder")}
              options={fonts.map((f) => ({ label: f, value: f }))}
            />
          </Form.Item>
          <Form.Item label={t("tools.ascii-text-drawer.widthLabel")}>
            <InputNumber
              min={0}
              max={10000}
              value={width}
              onChange={(value) => setWidth(value ?? 0)}
              style={{ width: "100%" }}
              placeholder={t("tools.ascii-text-drawer.widthPlaceholder")}
            />
          </Form.Item>
        </div>

        <Divider />

        {processing && (
          <Form.Item>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Spin size="small" />
              <span>{t("tools.ascii-text-drawer.loadingFont")}</span>
            </div>
          </Form.Item>
        )}

        {errored && (
          <Form.Item>
            <Alert
              style={{ textAlign: "center" }}
              type="error"
              title={t("tools.ascii-text-drawer.errorMessage")}
            />
          </Form.Item>
        )}

        {!processing && !errored && (
          <Form.Item label={t("tools.ascii-text-drawer.outputLabel")}>
            <TextareaCopyable
              value={output}
              rows={10}
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
        )}
      </Form>
    </Card>
  );
}

