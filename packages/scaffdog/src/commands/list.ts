import path from 'path';
import chalk from 'chalk';
import plur from 'plur';
import { createCommand } from '../command.js';

const count = (word: string, cnt: number) => `${cnt} ${plur(word, cnt)}`;

export default createCommand({
  name: 'list',
  summary: 'Print a list of available documents.',
  args: {},
  flags: {},
})(async ({ cwd, logger, lib: { config }, api, flags }) => {
  const { project } = flags;
  const dirname = path.resolve(cwd, project);
  const cfg = config.load(dirname);
  if (cfg == null) {
    return 1;
  }

  const scaffdog = api({
    ...cfg,
    cwd,
  });

  const documents = await scaffdog.list();

  if (documents.length === 0) {
    logger.warn('Document file not found.');
    return 1;
  }

  documents.forEach((doc) => {
    const relative = path.relative(cwd, doc.path);
    const t = count('template', doc.templates.length);
    const q = count('question', doc.questions.size);
    const meta = [relative, t, q].join(', ');
    logger.log(`- ${chalk.bold(doc.name)} ${chalk.gray(`(${meta})`)}`);
  });

  const total = documents.length;
  logger.log('');
  logger.log(`${chalk.bold.green(total)} ${plur('file', total)} found.`);

  return 0;
});
