import * as fs from 'fs';

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
