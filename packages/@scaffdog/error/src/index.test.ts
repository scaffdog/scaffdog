import test from 'ava';
import chalk from 'chalk';
import { error } from './';

const chk = new chalk.Instance({ level: 1 });
const red = chk.red;
const gray = chk.gray;

const message = 'message';
const errorMessage = red(`${message}:`);
const r = red('>');
const s = ' ';
const l = gray('│');

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
    loc: {
      start: { line: 1, column: 4 },
      end: { line: 1, column: 4 },
    },
  });

  t.is(
    e.message,
    `   ${errorMessage}

 ${r} ${l} {{ ${red('@')} }}
 ${s} ${l}    ${red('^')}`,
  );
});

test('single line - multiple character', (t) => {
  const e = error(message, {
    ...defaults,
    source: `before {{ after`,
    loc: {
      start: { line: 1, column: 8 },
      end: { line: 1, column: 9 },
    },
  });

  t.is(
    e.message,
    `   ${errorMessage}

 ${r} ${l} before ${red('{{')} after
 ${s} ${l}        ${red('^^')}`,
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
    loc: {
      start: { line: 6, column: 3 },
      end: { line: 6, column: 8 },
    },
  });

  t.is(
    e.message,
    `   ${errorMessage}

 ${s} ${l} 4
 ${s} ${l} 5
 ${r} ${l} 6 ${red('error!')} after text
 ${s} ${l}   ${red('^^^^^^')}
 ${s} ${l} 7
 ${s} ${l} 8`,
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
    loc: {
      start: { line: 4, column: 3 },
      end: { line: 6, column: 8 },
    },
  });

  t.is(
    e.message,
    `   ${errorMessage}

 ${s} ${l} 2
 ${s} ${l} 3
 ${r} ${l} 4 ${red('text')}
 ${s} ${l}   ${red('^^^^')}
 ${r} ${l} ${red('5')}
 ${s} ${l} ${red('^')}
 ${r} ${l} ${red('6 error!')} after text
 ${s} ${l} ${red('^^^^^^^^')}
 ${s} ${l} 7
 ${s} ${l} 8`,
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
    loc: {
      start: { line: 4, column: 14 },
      end: { line: 6, column: 8 },
    },
  });

  t.is(
    e.message,
    `   ${errorMessage}

 ${s} ${l} 2
 ${s} ${l} 3
 ${r} ${l} 4 text after ${red('text')}
 ${s} ${l}              ${red('^^^^')}
 ${r} ${l} ${red('5')}
 ${s} ${l} ${red('^')}
 ${r} ${l} ${red('6 error!')} after text
 ${s} ${l} ${red('^^^^^^^^')}
 ${s} ${l} 7
 ${s} ${l} 8`,
  );
});
