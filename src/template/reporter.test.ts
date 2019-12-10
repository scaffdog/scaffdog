import test, { ExecutionContext } from 'ava';
import chalk from 'chalk';
import { Reporter } from './reporter';
import { SyntaxError, ErrorType } from './error';

const header = `
${chalk.red('Template parsing error:')}

`;

const footer = '\n\n';

const report = (
  t: ExecutionContext,
  type: ErrorType,
  start: [number, number],
  end: [number, number],
  input: string,
  expected: string,
) => {
  const err = new SyntaxError(
    type,
    input,
    {
      line: start[0],
      column: start[1],
    },
    {
      line: end[0],
      column: end[1],
    },
  );

  const output: string[] = [];
  const mock = (out: string) => {
    output.push(out);
  };

  t.throws(() => {
    new Reporter(mock).report(err);
  });

  t.is(`${header}${expected}${footer}`, output.join('\n'));
};

test(
  'single line - single character',
  report,
  ErrorType.UNEXPECTED,
  [1, 4],
  [1, 4],
  `{{ @ }}`,
  `{{ ${chalk.red(`@`)} }}
   ${chalk.red('^ unexpected error')}`,
);

test(
  'single line - multiple character',
  report,
  ErrorType.UNCLOSED,
  [1, 8],
  [1, 9],
  `before {{ after`,
  `before ${chalk.red('{{')} after
       ${chalk.red('^^ unclosing tag')}`,
);

test(
  'multiple line - basic',
  report,
  ErrorType.UNEXPECTED,
  [7, 3],
  [7, 8],
  `
1
2
3
4
5
6 error! after text
7
8
9
`,
  `4
5
6 ${chalk.red('error!')} after text
  ${chalk.red('^^^^^^ unexpected error')}
7
8`,
);

test(
  'multiple line - cross line',
  report,
  ErrorType.UNEXPECTED,
  [5, 1],
  [7, 8],
  `
1
2
3
4 text
5
6 error! after text
7
8
9
`,
  `2
3
${chalk.red('4 text')}
${chalk.red('5')}
${chalk.red('6 error!')} after text
${chalk.red('^^^^^^^^ unexpected error')}
7
8`,
);
