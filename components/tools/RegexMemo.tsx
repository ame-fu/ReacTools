"use client";

import React from "react";
import { Card } from "antd";

const content = `### Normal characters

Expression | Description
:--|:--
\`.\` or \`[^\\n\\r]\` | any character *excluding* a newline or carriage return
\`[A-Za-z]\` | alphabet
\`[a-z]\` | lowercase alphabet
\`[A-Z]\` | uppercase alphabet
\`\\d\` or \`[0-9]\` | digit
\`\\D\` or \`[^0-9]\` | non-digit
\`_\` | underscore
\`\\w\` or \`[A-Za-z0-9_]\` | alphabet, digit or underscore
\`\\W\` or \`[^A-Za-z0-9_]\` | inverse of \\w
\`\\S\` | inverse of \\s

### Whitespace characters

Expression | Description
:--|:--
\` \` | space
\`\\t\` | tab
\`\\n\` | newline
\`\\r\` | carriage return
\`\\s\` | space, tab, newline or carriage return

### Character set

Expression | Description
:--|:--
\`[xyz]\` | either x, y or z
\`[^xyz]\` | neither x, y nor z
\`[1-3]\` | either 1, 2 or 3
\`[^1-3]\` | neither 1, 2 nor 3

### Quantifiers

Expression | Description
:--|:--
\`{2}\` | exactly 2
\`{2,}\` | at least 2
\`{2,7}\` | at least 2 but no more than 7
\`*\` | 0 or more
\`+\` | 1 or more
\`?\` | exactly 0 or 1

### Boundaries

Expression | Description
:--|:--
\`^\` | start of string
\`$\` | end of string
\`\\b\` | word boundary

### Matching

Expression | Description
:--|:--
\`foo|bar\` | match either foo or bar
\`foo(?=bar)\` | match foo if it's before bar
\`foo(?!bar)\` | match foo if it's *not* before bar
\`(?<=bar)foo\` | match foo if it's after bar
\`(?<!bar)foo\` | match foo if it's *not* after bar

### Grouping and capturing

Expression | Description
:--|:--
\`(foo)\` | capturing group
\`(?:foo)\` | non-capturing group
\`(foo)bar\\\\1\` | \\\\1 is a backreference to the 1st capturing group

## References

- [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
- [RegExplained](https://leaverou.github.io/regexplained/)
`;

export function RegexMemo() {
  return (
    <Card className="prose dark:prose-invert max-w-none">
      <pre className="bg-muted/30 p-4 rounded overflow-auto whitespace-pre-wrap text-sm">
        {content}
      </pre>
    </Card>
  );
}
