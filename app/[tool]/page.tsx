import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import { AsciiTextDrawer } from "@/components/tools/AsciiTextDrawer";
import { EmojiPicker } from "@/components/tools/EmojiPicker";
import { LoremIpsumGenerator } from "@/components/tools/LoremIpsumGenerator";
import { StringObfuscator } from "@/components/tools/StringObfuscator";
import { NumeronymGenerator } from "@/components/tools/NumeronymGenerator";
import { BaseConverter } from "@/components/tools/BaseConverter";
import { Base64FileConverter } from "@/components/tools/Base64FileConverter";
import { Base64StringConverter } from "@/components/tools/Base64StringConverter";
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
import { MapCoordinateConverter } from "@/components/tools/MapCoordinateConverter";
import { getToolBySlug } from "@/lib/tools.config";

interface PageProps {
  params: Promise<{
    tool: string;
  }>;
}

export async function generateMetadata(
  props: PageProps,
): Promise<Metadata> {
  const { tool } = await props.params;
  const config = getToolBySlug(tool);
  if (!config) return {};

  return {
    title: `${config.name} - ReacTools`,
    description: config.description,
    keywords: config.keywords,
  };
}

export default async function ToolPage(props: PageProps) {
  const { tool } = await props.params;
  const config = getToolBySlug(tool);

  if (!config) {
    notFound();
  }

  let content: React.ReactNode = null;

  switch (config.slug) {
    case "lorem-ipsum-generator":
      content = <LoremIpsumGenerator />;
      break;
    case "numeronym-generator":
      content = <NumeronymGenerator />;
      break;
    case "emoji-picker":
      content = <EmojiPicker />;
      break;
    case "string-obfuscator":
      content = <StringObfuscator />;
      break;
    case "ascii-text-drawer":
      content = <AsciiTextDrawer />;
      break;
    case "epoch-converter":
      content = <EpochConverter />;
      break;
    case "date-converter":
      content = <DateConverter />;
      break;
    case "base-converter":
      content = <BaseConverter />;
      break;
    case "roman-numeral-converter":
      content = <RomanNumeralConverter />;
      break;
    case "base64-file-converter":
      content = <Base64FileConverter />;
      break;
    case "base64-string-converter":
      content = <Base64StringConverter />;
      break;
    case "color-converter":
      content = <ColorConverter />;
      break;
    case "case-converter":
      content = <CaseConverter />;
      break;
    case "text-to-nato-alphabet":
      content = <TextToNatoAlphabet />;
      break;
    case "text-to-binary":
      content = <TextToBinary />;
      break;
    case "text-to-unicode":
      content = <TextToUnicode />;
      break;
    case "text-diff":
      content = <TextDiff />;
      break;
    case "text-statistics":
      content = <TextStatistics />;
      break;
    case "yaml-to-json-converter":
      content = <YamlToJsonConverter />;
      break;
    case "yaml-to-toml":
      content = <YamlToToml />;
      break;
    case "json-to-yaml-converter":
      content = <JsonToYamlConverter />;
      break;
    case "json-to-toml":
      content = <JsonToToml />;
      break;
    case "list-converter":
      content = <ListConverter />;
      break;
    case "toml-to-json":
      content = <TomlToJson />;
      break;
    case "toml-to-yaml":
      content = <TomlToYaml />;
      break;
    case "xml-to-json":
      content = <XmlToJson />;
      break;
    case "json-to-xml":
      content = <JsonToXml />;
      break;
    case "markdown-to-html":
      content = <MarkdownToHtml />;
      break;
    case "basic-auth-generator":
      content = <BasicAuthGenerator />;
      break;
    case "phone-parser-and-formatter":
      content = <PhoneParserAndFormatter />;
      break;
    case "iban-validator-and-parser":
      content = <IbanValidatorAndParser />;
      break;
    case "email-normalizer":
      content = <EmailNormalizer />;
      break;
    case "math-evaluator":
      content = <MathEvaluator />;
      break;
    case "eta-calculator":
      content = <EtaCalculator />;
      break;
    case "percentage-calculator":
      content = <PercentageCalculator />;
      break;
    case "chronometer":
      content = <Chronometer />;
      break;
    case "temperature-converter":
      content = <TemperatureConverter />;
      break;
    case "benchmark-builder":
      content = <BenchmarkBuilder />;
      break;
    case "ipv4-subnet-calculator":
      content = <Ipv4SubnetCalculator />;
      break;
    case "ipv4-address-converter":
      content = <Ipv4AddressConverter />;
      break;
    case "ipv4-range-expander":
      content = <Ipv4RangeExpander />;
      break;
    case "mac-address-lookup":
      content = <MacAddressLookup />;
      break;
    case "mac-address-generator":
      content = <MacAddressGenerator />;
      break;
    case "map-coordinate-converter":
      content = <MapCoordinateConverter />;
      break;
    case "ipv6-ula-generator":
      content = <Ipv6UlaGenerator />;
      break;
    case "qrcode-generator":
      content = <QrCodeGenerator />;
      break;
    case "wifi-qrcode-generator":
      content = <WifiQrCodeGenerator />;
      break;
    case "svg-placeholder-generator":
      content = <SvgPlaceholderGenerator />;
      break;
    case "camera-recorder":
      content = <CameraRecorder />;
      break;
    case "token-generator":
      content = <TokenGenerator />;
      break;
    case "hash-text":
      content = <HashText />;
      break;
    case "bcrypt":
      content = <BcryptTool />;
      break;
    case "uuid-generator":
      content = <UuidGenerator />;
      break;
    case "ulid-generator":
      content = <UlidGenerator />;
      break;
    case "encryption":
      content = <Encryption />;
      break;
    case "bip39-generator":
      content = <Bip39Generator />;
      break;
    case "hmac-generator":
      content = <HmacGenerator />;
      break;
    case "rsa-key-pair-generator":
      content = <RsaKeyPairGenerator />;
      break;
    case "password-strength-analyser":
      content = <PasswordStrengthAnalyser />;
      break;
    case "pdf-signature-checker":
      content = <PdfSignatureChecker />;
      break;
    case "url-encoder":
      content = <UrlEncoder />;
      break;
    case "html-entities":
      content = <HtmlEntities />;
      break;
    case "url-parser":
      content = <UrlParser />;
      break;
    case "device-information":
      content = <DeviceInformation />;
      break;
    case "og-meta-generator":
      content = <OgMetaGenerator />;
      break;
    case "otp-generator":
      content = <OtpGenerator />;
      break;
    case "mime-types":
      content = <MimeTypes />;
      break;
    case "jwt-parser":
      content = <JwtParser />;
      break;
    case "keycode-info":
      content = <KeycodeInfo />;
      break;
    case "slugify-string":
      content = <SlugifyString />;
      break;
    case "html-wysiwyg-editor":
      content = <HtmlWysiwygEditor />;
      break;
    case "user-agent-parser":
      content = <UserAgentParser />;
      break;
    case "http-status-codes":
      content = <HttpStatusCodes />;
      break;
    case "json-diff":
      content = <JsonDiff />;
      break;
    case "safelink-decoder":
      content = <SafelinkDecoder />;
      break;
    case "query-string-builder":
      content = <QueryStringBuilder />;
      break;
    case "git-memo":
      content = <GitMemo />;
      break;
    case "random-port-generator":
      content = <RandomPortGenerator />;
      break;
    case "crontab-generator":
      content = <CrontabGenerator />;
      break;
    case "json-prettify":
      content = <JsonPrettify />;
      break;
    case "json-minify":
      content = <JsonMinify />;
      break;
    case "json-to-csv":
      content = <JsonToCsv />;
      break;
    case "sql-prettify":
      content = <SqlPrettify />;
      break;
    case "chmod-calculator":
      content = <ChmodCalculator />;
      break;
    case "docker-run-to-docker-compose-converter":
      content = <DockerRunToCompose />;
      break;
    case "xml-formatter":
      content = <XmlFormatter />;
      break;
    case "yaml-prettify":
      content = <YamlPrettify />;
      break;
    case "regex-tester":
      content = <RegexTester />;
      break;
    case "regex-memo":
      content = <RegexMemo />;
      break;
    case "semver-comparator":
      content = <SemVerComparator />;
      break;
    case "keyword-highlighter":
      content = <KeywordHighlighter />;
      break;
    case "line-ending-converter":
      content = <LineEndingConverter />;
      break;
    default:
      content = null;
  }

  return (
    <ToolLayout
      slug={config.slug}
      title={config.name}
      description={config.description}
    >
      {content}
    </ToolLayout>
  );
}


