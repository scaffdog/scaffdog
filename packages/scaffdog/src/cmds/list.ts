import path from 'path';
import { loadConfig } from '@scaffdog/config';
import plur from 'plur';
import chalk from 'chalk';
import { createCommand } from '../command';
import { resolveDocuments } from '../document';

const count = (word: string, cnt: number) => `${cnt} ${plur(word, cnt)}`;

export default createCommand({
  name: 'list',
  key: 'list',
  description: 'Print a list of available templates.',
  build: (yargs) =>
    yargs.options({
      foo: {
        type: 'boolean',
        description: '',
      },
    }),
})(async ({ cwd, logger, options }) => {
  const { project } = options;
  const config = loadConfig(cwd, { project });
  const dirname = path.resolve(cwd, project);
  const documents = await resolveDocuments(dirname, config.files);

  if (documents.length === 0) {
    logger.log('File not found.');
    return 0;
  }

  documents.forEach((doc) => {
    const relative = path.relative(cwd, doc.path);
    const t = count('template', doc.templates.length);
    const q = count('question', Object.keys(doc.questions ?? {}).length);
    const meta = [relative, t, q].join(', ');
    logger.log(chalk`- {bold ${doc.name}} {gray (${meta})}`);
  });

  const total = documents.length;
  logger.log('');
  logger.log(chalk`{bold.green ${total}} ${plur('file', total)} found.`);

  return 0;
});
