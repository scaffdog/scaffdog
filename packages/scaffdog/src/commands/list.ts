import path from 'path';
import { loadConfig } from '@scaffdog/config';
import chalk from 'chalk';
import plur from 'plur';
import { createCommand } from '../command';

const count = (word: string, cnt: number) => `${cnt} ${plur(word, cnt)}`;

export default createCommand({
  name: 'list',
  summary: 'Print a list of available documents.',
  args: {},
  flags: {},
})(async ({ cwd, logger, lib, flags }) => {
  const document = lib.resolve('document');

  const { project } = flags;
  const config = loadConfig(cwd, { project });
  const dirname = path.resolve(cwd, project);
  const documents = await document.resolve(dirname, config.files, {
    tags: config.tags,
  });

  if (documents.length === 0) {
    logger.log('Document file not found.');
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
