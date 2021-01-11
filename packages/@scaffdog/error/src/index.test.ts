import test from 'ava';
import chalk from 'chalk';
import { error } from './';

const message = 'message';
const red = new chalk.Instance({ level: 1 }).red;

const defaults = {
  color: true,
};

test('default', (t) => {
  const e = error(message, { ...defaults });
  t.is(e.message, message);
});

test('single line - single character', (t) => {
  const e = error(message, {
    ...defaults,
    source: `{{ @ }}`,
    start: { line: 1, column: 4 },
    end: { line: 1, column: 4 },
  });

  t.is(
    e.message,
    `${red(message)}:

{{ ${red('@')} }}
   ${red('^')}`,
  );
});

test('single line - multiple character', (t) => {
  const e = error(message, {
    ...defaults,
    source: `before {{ after`,
    start: { line: 1, column: 8 },
    end: { line: 1, column: 9 },
  });

  t.is(
    e.message,
    `${red(message)}:

before ${red('{{')} after
       ${red('^^')}`,
  );
});

test('multi line', (t) => {
  const e = error(message, {
    ...defaults,
    source: `1
2
3
4
5
6 error! after text
7
8`,
    start: { line: 6, column: 3 },
    end: { line: 6, column: 8 },
  });

  t.is(
    e.message,
    `${red(message)}:

4
5
6 ${red('error!')} after text
  ${red('^^^^^^')}
7
8`,
  );
});

test('multi line - cross line', (t) => {
  const e = error(message, {
    ...defaults,
    source: `1
2
3
4 text
5
6 error! after text
7
8`,
    start: { line: 4, column: 3 },
    end: { line: 6, column: 8 },
  });

  t.is(
    e.message,
    `${red(message)}:

2
3
4 ${red('text')}
  ${red('^^^^')}
${red('5')}
${red('^')}
${red('6 error!')} after text
${red('^^^^^^^^')}
7
8`,
  );
});

test('multi line - cross line - 2', (t) => {
  const e = error(message, {
    ...defaults,
    source: `1
2
3
4 text after text
5
6 error! after text
7
8`,
    start: { line: 4, column: 14 },
    end: { line: 6, column: 8 },
  });

  t.is(
    e.message,
    `${red(message)}:

2
3
4 text after ${red('text')}
             ${red('^^^^')}
${red('5')}
${red('^')}
${red('6 error!')} after text
${red('^^^^^^^^')}
7
8`,
  );
});
