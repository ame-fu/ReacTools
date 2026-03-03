import { messages, type Locale } from "./messages";

export function getToolName(
  locale: Locale,
  slug: string,
  fallback: string,
): string {
  const key = `tools.${slug}.title`;
  const dict = messages[locale] as Record<string, string>;
  const enDict = messages.en as Record<string, string>;
  return dict[key] ?? enDict[key] ?? fallback;
}

export function getToolDescription(
  locale: Locale,
  slug: string,
  fallback: string,
): string {
  const key = `tools.${slug}.description`;
  const dict = messages[locale] as Record<string, string>;
  const enDict = messages.en as Record<string, string>;
  return dict[key] ?? enDict[key] ?? fallback;
}

