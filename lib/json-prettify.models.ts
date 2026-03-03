import JSON5 from "json5";

export function sortObjectKeys<T>(obj: T): T {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sortObjectKeys) as unknown as T;
  return Object.keys(obj)
    .sort((a, b) => a.localeCompare(b))
    .reduce(
      (acc, key) => {
        acc[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
        return acc;
      },
      {} as Record<string, unknown>,
    ) as T;
}

export function formatJson(rawJson: string, sortKeys: boolean, indentSize: number): string {
  const parsed = JSON5.parse(rawJson);
  const data = sortKeys ? sortObjectKeys(parsed) : parsed;
  return JSON.stringify(data, null, indentSize);
}
