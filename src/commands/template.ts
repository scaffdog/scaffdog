import { Command } from '@oclif/command';
import chalk from 'chalk';
import * as fs from 'fs';
import { emojify } from 'node-emoji';
import * as path from 'path';
import { commonFlags } from '../flags';
import { createTemplate, fileExists } from '../utils';

export default class TemplateCommand extends Command {
  public static description = 'Creating a template with the specified name.';

  public static args = [
    {
      name: 'name',
      required: true,
      description: 'Template name.',
    },
  ];

  public static flags = {
    ...commonFlags,
  };

  public async run() {
    const {
      args,
      flags: { templateDir },
    } = this.parse(TemplateCommand);

    const name = args.name as string;

    const cwd = process.cwd();
    const root = path.resolve(cwd, templateDir as string);
    const file = path.join(root, `${name}.md`);

    if (fileExists(file)) {
      return this.error(`"${file}" already exists.`, { exit: 1 });
    }

    const content = createTemplate(name);

    fs.writeFileSync(file, content, 'utf8');

    this.log(
      emojify(`
:sparkles: Created template ${chalk.bold(`"${path.relative(cwd, file)}"`)} !
`),
    );

    return this.exit(0);
  }
}
