import * as fs from 'fs';
import * as windowSize from 'window-size';

const MAX_DISPLAY_DESCRIPTION = windowSize.width - 15;

export const createTemplate = (name: string) =>
  `
---
name: '${name}'
description: '${name} of description'
message: 'Please enter any text.'
root: '.'
output: '**/*'
ignore: []
---

# \`{{ input }}.md\`

\`\`\`markdown
Let's create a template with reference to the document!
https://github.com/cats-oss/scaffdog/#templates
\`\`\`
`.trim();

export const truncate = (value: string) =>
  `${value.slice(0, MAX_DISPLAY_DESCRIPTION)}${value.length > MAX_DISPLAY_DESCRIPTION ? '...' : ''}`;

export const fstat = (path: string) => {
  try {
    return fs.statSync(path);
  } catch (e) {
    return null;
  }
};

export const fileExists = (path: string) => {
  const stat = fstat(path);

  return stat == null ? false : stat.isFile();
};

export const directoryExists = (path: string) => {
  const stat = fstat(path);

  return stat == null ? false : stat.isDirectory();
};
