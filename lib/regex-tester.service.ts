interface GroupCapture {
  name: string;
  value: string;
  start: number;
  end: number;
}

interface MatchResult {
  index: number;
  value: string;
  captures: GroupCapture[];
  groups: GroupCapture[];
}

interface RegExpIndices extends Array<[number, number]> {
  groups?: Record<string, [number, number]>;
}

interface RegExpExecArrayWithIndices extends RegExpExecArray {
  indices?: RegExpIndices;
}

export function matchRegex(regex: string, text: string, flags: string): MatchResult[] {
  const results: MatchResult[] = [];
  const re = new RegExp(regex, flags);
  let lastIndex = -1;
  let match = re.exec(text) as RegExpExecArrayWithIndices | null;

  while (match !== null) {
    if (re.lastIndex === lastIndex || match[0] === "") break;
    const indices = match.indices;
    const captures: GroupCapture[] = [];
    Object.entries(match).forEach(([name, value]) => {
      if (name !== "0" && /^\d+$/.test(name)) {
        const idx = indices?.[Number(name)];
        captures.push({
          name,
          value: String(value ?? ""),
          start: idx?.[0] ?? -1,
          end: idx?.[1] ?? -1,
        });
      }
    });
    const groups: GroupCapture[] = [];
    if (match.groups && indices?.groups) {
      Object.entries(match.groups).forEach(([groupName, groupValue]) => {
        const idx = indices.groups?.[groupName];
        groups.push({
          name: groupName,
          value: String(groupValue ?? ""),
          start: idx?.[0] ?? -1,
          end: idx?.[1] ?? -1,
        });
      });
    }
    results.push({
      index: match.index,
      value: match[0],
      captures,
      groups,
    });
    lastIndex = re.lastIndex;
    match = re.exec(text) as RegExpExecArrayWithIndices | null;
  }
  return results;
}
