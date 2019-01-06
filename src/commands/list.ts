import { Command } from '@oclif/command';
import chalk from 'chalk';
import * as path from 'path';
import { commonFlags } from '../flags';
import { Reader } from '../template/reader';
import { truncate } from '../utils';

export default class ListCommand extends Command {
  public static description = 'Print a list of available templates.';

  public static flags = {
    ...commonFlags,
  };

  public async run() {
    const {
      flags: { templateDir },
    } = this.parse(ListCommand);

    const cwd = process.cwd();
    const reader = new Reader(path.resolve(cwd, templateDir as string));
    const documents = reader.readAll();

    for (const document of documents) {
      const { name, description } = document.attributes;
      const desc = truncate(description);

      this.log(`    - ${chalk.bold(name)} ${chalk.gray(`(${path.relative(cwd, document.path)})`)}`);

      if (desc !== '') {
        this.log(`        ${desc}`);
      }
    }

    this.log('');
  }
}
