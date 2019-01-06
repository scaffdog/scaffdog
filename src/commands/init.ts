import { Command } from '@oclif/command';
import chalk from 'chalk';
import * as fs from 'fs';
import * as symbols from 'log-symbols';
import mkdirp from 'mkdirp';
import { emojify } from 'node-emoji';
import * as path from 'path';
import { commonFlags } from '../flags';
import { createTemplate, directoryExists, fileExists } from '../utils';

export default class InitCommand extends Command {
  public static description =
    'Prepare for using scaffdog. By default it creates a `.scaffdog` directory and creates a simple template.';

  public static flags = {
    ...commonFlags,
  };

  public async run() {
    const {
      flags: { templateDir },
    } = this.parse(InitCommand);

    const cwd = process.cwd();
    const dir = path.resolve(cwd, templateDir as string);

    // create template directory
    if (fileExists(dir)) {
      return this.error(`"${dir}" already exists.`);
    }

    if (directoryExists(dir)) {
      this.log(`${symbols.info} skipping directory creation.`);
    } else {
      mkdirp.sync(dir);
    }

    // create first template
    const file = path.join(dir, 'hello.md');
    if (fileExists(file)) {
      return this.error(`"${file}" already exists.`);
    }

    fs.writeFileSync(file, createTemplate('hello'), 'utf8');

    this.log(
      emojify(`
:tada: ${chalk.green(`Created template for the first time! ${chalk.bold(`("${path.relative(cwd, file)}")`)}.`)}

Ready :dog: !!
You can scaffolding with ${chalk.bold('`$ scaffdog generate hello`')}.

Please refer to the following documents and customize it.
https://github.com/cats-oss/scaffdog/#templates
`),
    );

    return this.exit(0);
  }
}
