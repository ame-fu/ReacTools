import { generatedMessages } from "./messages.generated";

export const messages = generatedMessages;

export type Messages = typeof generatedMessages;
export type Locale = keyof Messages;

export function getCategoryLabel(locale: Locale, categoryName: string): string {
  const key = `category.${categoryName}`;
  const toolsKey = `tools.categories.${categoryName.toLowerCase()}`;
  const dict = messages[locale] as Record<string, string>;
  const enDict = messages.en as Record<string, string>;
  return dict[key] ?? dict[toolsKey] ?? enDict[toolsKey] ?? categoryName;
}

