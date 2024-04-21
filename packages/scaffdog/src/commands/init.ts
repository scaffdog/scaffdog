import path from 'path';
import { extract } from '@scaffdog/core';
import { compile, createContext } from '@scaffdog/engine';
import chalk from 'chalk';
import symbols from 'log-symbols';
import { emojify } from 'node-emoji';
import { createCommand } from '../command.js';
import type { File } from '../file.js';

export default createCommand({
  name: 'init',
  summary:
    'Prepare to use scaffdog. Create a `.scaffdog` directory by default, and create a first document file.',
  args: {},
  flags: {},
})(async ({ cwd, logger, lib: { fs, prompt }, flags }) => {
  const { project } = flags;
  const dirname = path.resolve(cwd, project);

  // create project directory
  if (fs.directoryExists(dirname)) {
    const ok = await prompt.confirm(
      // prettier-ignore
      `"${chalk.bold.yellow(project)}" already exist. Do you want to continue the setup?`,
      false,
      {},
    );

    if (!ok) {
      logger.warn('Setup canceled!');
      return 1;
    }
  }

  await fs.mkdir(dirname, { recursive: true });

  // create first document file
  const { templates } = extract(
    `
# \`config.js\`

\`\`\`javascript
export default {
  files: ['*'],
};
\`\`\`

# \`{{ name }}.md\`

\`\`\`\`markdown
---
name: '{{ name }}'
root: '.'
output: '**/*'
ignore: []
questions:
  value: 'Please enter any text.'
---

# \`{{ placeholder }}.md\`

\`\`\`markdown
Let's make a document!
See scaffdog documentation for details.
https://scaff.dog/docs/templates
\`\`\`
\`\`\`\`
`.trim(),
    {},
  );

  const name = await prompt.prompt<string>({
    type: 'input',
    message: 'Please enter a document name.',
    validate: (v: string) => (v !== '' ? true : 'required input!'),
  });

  const context = createContext({});
  context.variables.set('name', name);
  context.variables.set('placeholder', `{{ inputs.value }}`);

  const files = await Promise.all(
    templates.map(async (tpl) => {
      const name = compile(tpl.filename, context);
      const file: File = {
        skip: false,
        path: path.resolve(dirname, name),
        name,
        content: compile(tpl.content, context),
      };

      await fs.writeFile(file.path, file.content);

      return file;
    }),
  );

  // success message
  const list = files
    .map((file) => {
      const relative = path.relative(cwd, file.path);
      return `  ${symbols.success} ${chalk.bold(relative)}`;
    })
    .join('\n');

  logger.log('');
  logger.log(
    emojify(
      `
Setup of ${chalk.bold.green('scaffdog')} :dog: is complete!

${list}

Now you can do scaffold by running ${chalk.bold.green('$ scaffdog generate')}.

Please refer to the following documents and customize it.
${chalk.underline('https://scaff.dog/docs/templates')}
      `.trim(),
    ),
  );

  return 0;
});
