"use client";

import React from "react";
import { AsciiTextDrawer } from "@/components/tools/AsciiTextDrawer";
import { EmojiPicker } from "@/components/tools/EmojiPicker";
import { LoremIpsumGenerator } from "@/components/tools/LoremIpsumGenerator";
import { StringObfuscator } from "@/components/tools/StringObfuscator";
import { NumeronymGenerator } from "@/components/tools/NumeronymGenerator";
import { BaseConverter } from "@/components/tools/BaseConverter";
import { Base64FileConverter } from "@/components/tools/Base64FileConverter";
import { Base64StringConverter } from "@/components/tools/Base64StringConverter";
import { HexPreview } from "@/components/tools/HexPreview";
import { BasicAuthGenerator } from "@/components/tools/BasicAuthGenerator";
import { CaseConverter } from "@/components/tools/CaseConverter";
import { ColorConverter } from "@/components/tools/ColorConverter";
import { DateConverter } from "@/components/tools/DateConverter";
import { EmailNormalizer } from "@/components/tools/EmailNormalizer";
import { JsonToToml } from "@/components/tools/JsonToToml";
import { JsonToXml } from "@/components/tools/JsonToXml";
import { JsonToYamlConverter } from "@/components/tools/JsonToYamlConverter";
import { EtaCalculator } from "@/components/tools/EtaCalculator";
import { ListConverter } from "@/components/tools/ListConverter";
import { MarkdownToHtml } from "@/components/tools/MarkdownToHtml";
import { MathEvaluator } from "@/components/tools/MathEvaluator";
import { PercentageCalculator } from "@/components/tools/PercentageCalculator";
import { Chronometer } from "@/components/tools/Chronometer";
import { TemperatureConverter } from "@/components/tools/TemperatureConverter";
import { BenchmarkBuilder } from "@/components/tools/BenchmarkBuilder";
import { PhoneParserAndFormatter } from "@/components/tools/PhoneParserAndFormatter";
import { IbanValidatorAndParser } from "@/components/tools/IbanValidatorAndParser";
import { Ipv4SubnetCalculator } from "@/components/tools/Ipv4SubnetCalculator";
import { Ipv4AddressConverter } from "@/components/tools/Ipv4AddressConverter";
import { Ipv4RangeExpander } from "@/components/tools/Ipv4RangeExpander";
import { MacAddressLookup } from "@/components/tools/MacAddressLookup";
import { MacAddressGenerator } from "@/components/tools/MacAddressGenerator";
import { Ipv6UlaGenerator } from "@/components/tools/Ipv6UlaGenerator";
import { QrCodeGenerator } from "@/components/tools/QrCodeGenerator";
import { WifiQrCodeGenerator } from "@/components/tools/WifiQrCodeGenerator";
import { SvgPlaceholderGenerator } from "@/components/tools/SvgPlaceholderGenerator";
import { CameraRecorder } from "@/components/tools/CameraRecorder";
import { RomanNumeralConverter } from "@/components/tools/RomanNumeralConverter";
import { TextToBinary } from "@/components/tools/TextToBinary";
import { TextToNatoAlphabet } from "@/components/tools/TextToNatoAlphabet";
import { TextDiff } from "@/components/tools/TextDiff";
import { TextStatistics } from "@/components/tools/TextStatistics";
import { TextToUnicode } from "@/components/tools/TextToUnicode";
import { TomlToJson } from "@/components/tools/TomlToJson";
import { TomlToYaml } from "@/components/tools/TomlToYaml";
import { XmlToJson } from "@/components/tools/XmlToJson";
import { YamlToJsonConverter } from "@/components/tools/YamlToJsonConverter";
import { YamlToToml } from "@/components/tools/YamlToToml";
import { TokenGenerator } from "@/components/tools/TokenGenerator";
import { HashText } from "@/components/tools/HashText";
import { BcryptTool } from "@/components/tools/BcryptTool";
import { UuidGenerator } from "@/components/tools/UuidGenerator";
import { UlidGenerator } from "@/components/tools/UlidGenerator";
import { Encryption } from "@/components/tools/Encryption";
import { Bip39Generator } from "@/components/tools/Bip39Generator";
import { HmacGenerator } from "@/components/tools/HmacGenerator";
import { RsaKeyPairGenerator } from "@/components/tools/RsaKeyPairGenerator";
import { PasswordStrengthAnalyser } from "@/components/tools/PasswordStrengthAnalyser";
import { PdfSignatureChecker } from "@/components/tools/PdfSignatureChecker";
import { UrlEncoder } from "@/components/tools/UrlEncoder";
import { HtmlEntities } from "@/components/tools/HtmlEntities";
import { UrlParser } from "@/components/tools/UrlParser";
import { DeviceInformation } from "@/components/tools/DeviceInformation";
import { OgMetaGenerator } from "@/components/tools/OgMetaGenerator";
import { OtpGenerator } from "@/components/tools/OtpGenerator";
import { MimeTypes } from "@/components/tools/MimeTypes";
import { JwtParser } from "@/components/tools/JwtParser";
import { KeycodeInfo } from "@/components/tools/KeycodeInfo";
import { SlugifyString } from "@/components/tools/SlugifyString";
import { HtmlWysiwygEditor } from "@/components/tools/HtmlWysiwygEditor";
import { UserAgentParser } from "@/components/tools/UserAgentParser";
import { HttpStatusCodes } from "@/components/tools/HttpStatusCodes";
import { JsonDiff } from "@/components/tools/JsonDiff";
import { SafelinkDecoder } from "@/components/tools/SafelinkDecoder";
import { GitMemo } from "@/components/tools/GitMemo";
import { RandomPortGenerator } from "@/components/tools/RandomPortGenerator";
import { CrontabGenerator } from "@/components/tools/CrontabGenerator";
import { JsonPrettify } from "@/components/tools/JsonPrettify";
import { JsonMinify } from "@/components/tools/JsonMinify";
import { JsonToCsv } from "@/components/tools/JsonToCsv";
import { SqlPrettify } from "@/components/tools/SqlPrettify";
import { ChmodCalculator } from "@/components/tools/ChmodCalculator";
import { DockerRunToCompose } from "@/components/tools/DockerRunToCompose";
import { XmlFormatter } from "@/components/tools/XmlFormatter";
import { YamlPrettify } from "@/components/tools/YamlPrettify";
import { RegexTester } from "@/components/tools/RegexTester";
import { RegexMemo } from "@/components/tools/RegexMemo";
import { QueryStringBuilder } from "@/components/tools/QueryStringBuilder";
import { EpochConverter } from "@/components/tools/EpochConverter";
import { KeywordHighlighter } from "@/components/tools/KeywordHighlighter";
import { LineEndingConverter } from "@/components/tools/LineEndingConverter";
import { SemVerComparator } from "@/components/tools/SemVerComparator";
import { StringPipeline } from "@/components/tools/StringPipeline";
import { Base64HexMessageDecoder } from "@/components/tools/Base64HexMessageDecoder";
import { MapCoordinateConverter } from "@/components/tools/MapCoordinateConverter";
import ScheduleWorkbench from "@/components/tools/schedule-workbench/ScheduleWorkbench";
import { CssStyleGallery } from "@/components/tools/CssStyleGallery";
import DailyGrow from "@/components/tools/daily-grow/DailyGrow";

const TOOL_CONTENT_MAP: Record<string, React.ComponentType> = {
  "lorem-ipsum-generator": LoremIpsumGenerator,
  "numeronym-generator": NumeronymGenerator,
  "emoji-picker": EmojiPicker,
  "string-obfuscator": StringObfuscator,
  "ascii-text-drawer": AsciiTextDrawer,
  "epoch-converter": EpochConverter,
  "date-converter": DateConverter,
  "base-converter": BaseConverter,
  "roman-numeral-converter": RomanNumeralConverter,
  "base64-file-converter": Base64FileConverter,
  "base64-string-converter": Base64StringConverter,
  "hex-preview": HexPreview,
  "color-converter": ColorConverter,
  "case-converter": CaseConverter,
  "text-to-nato-alphabet": TextToNatoAlphabet,
  "text-to-binary": TextToBinary,
  "text-to-unicode": TextToUnicode,
  "text-diff": TextDiff,
  "text-statistics": TextStatistics,
  "yaml-to-json-converter": YamlToJsonConverter,
  "yaml-to-toml": YamlToToml,
  "json-to-yaml-converter": JsonToYamlConverter,
  "json-to-toml": JsonToToml,
  "list-converter": ListConverter,
  "toml-to-json": TomlToJson,
  "toml-to-yaml": TomlToYaml,
  "xml-to-json": XmlToJson,
  "json-to-xml": JsonToXml,
  "markdown-to-html": MarkdownToHtml,
  "basic-auth-generator": BasicAuthGenerator,
  "phone-parser-and-formatter": PhoneParserAndFormatter,
  "iban-validator-and-parser": IbanValidatorAndParser,
  "email-normalizer": EmailNormalizer,
  "math-evaluator": MathEvaluator,
  "eta-calculator": EtaCalculator,
  "percentage-calculator": PercentageCalculator,
  "chronometer": Chronometer,
  "temperature-converter": TemperatureConverter,
  "benchmark-builder": BenchmarkBuilder,
  "ipv4-subnet-calculator": Ipv4SubnetCalculator,
  "ipv4-address-converter": Ipv4AddressConverter,
  "ipv4-range-expander": Ipv4RangeExpander,
  "mac-address-lookup": MacAddressLookup,
  "mac-address-generator": MacAddressGenerator,
  "map-coordinate-converter": MapCoordinateConverter,
  "ipv6-ula-generator": Ipv6UlaGenerator,
  "qrcode-generator": QrCodeGenerator,
  "wifi-qrcode-generator": WifiQrCodeGenerator,
  "svg-placeholder-generator": SvgPlaceholderGenerator,
  "camera-recorder": CameraRecorder,
  "token-generator": TokenGenerator,
  "hash-text": HashText,
  bcrypt: BcryptTool,
  "uuid-generator": UuidGenerator,
  "ulid-generator": UlidGenerator,
  encryption: Encryption,
  "bip39-generator": Bip39Generator,
  "hmac-generator": HmacGenerator,
  "rsa-key-pair-generator": RsaKeyPairGenerator,
  "password-strength-analyser": PasswordStrengthAnalyser,
  "pdf-signature-checker": PdfSignatureChecker,
  "url-encoder": UrlEncoder,
  "html-entities": HtmlEntities,
  "url-parser": UrlParser,
  "device-information": DeviceInformation,
  "og-meta-generator": OgMetaGenerator,
  "otp-generator": OtpGenerator,
  "mime-types": MimeTypes,
  "jwt-parser": JwtParser,
  "keycode-info": KeycodeInfo,
  "slugify-string": SlugifyString,
  "html-wysiwyg-editor": HtmlWysiwygEditor,
  "user-agent-parser": UserAgentParser,
  "http-status-codes": HttpStatusCodes,
  "json-diff": JsonDiff,
  "safelink-decoder": SafelinkDecoder,
  "query-string-builder": QueryStringBuilder,
  "git-memo": GitMemo,
  "random-port-generator": RandomPortGenerator,
  "crontab-generator": CrontabGenerator,
  "json-prettify": JsonPrettify,
  "json-minify": JsonMinify,
  "json-to-csv": JsonToCsv,
  "sql-prettify": SqlPrettify,
  "chmod-calculator": ChmodCalculator,
  "docker-run-to-docker-compose-converter": DockerRunToCompose,
  "xml-formatter": XmlFormatter,
  "yaml-prettify": YamlPrettify,
  "regex-tester": RegexTester,
  "regex-memo": RegexMemo,
  "semver-comparator": SemVerComparator,
  "keyword-highlighter": KeywordHighlighter,
  "line-ending-converter": LineEndingConverter,
  "string-pipeline": StringPipeline,
  "base64-hex-message-decoder": Base64HexMessageDecoder,
  "schedule-workbench": ScheduleWorkbench,
  "css-style-gallery": CssStyleGallery,
  "daily-grow": DailyGrow,
};

export interface ToolContentProps {
  slug: string;
}

export function ToolContent({ slug }: ToolContentProps) {
  const Component = TOOL_CONTENT_MAP[slug];
  if (!Component) return null;
  return <Component />;
}
