import { test, expect } from 'vitest';
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

test('default', () => {
  const e = error(message);
  expect(e.message).toBe(message);
});

test('single line - single character', () => {
  const e = error(message, {
    source: `{{ @ }}`,
    range: [3, 3],
  });

  expect(e.format({ ...defaults })).toBe(`   ${errorMessage}

 ${r} ${l} {{ ${red('@')} }}
 ${s} ${l}    ${red('^')}`);
});

test('single line - emoji', () => {
  const e = error(message, {
    source: `{{ 🦄 }}`,
    range: [3, 3],
  });

  expect(e.format({ ...defaults })).toBe(`   ${errorMessage}

 ${r} ${l} {{ ${red('🦄')} }}
 ${s} ${l}    ${red('^')}`);
});

test('single line - multiple character', () => {
  const e = error(message, {
    source: `before {{ after`,
    range: [7, 8],
  });

  expect(e.format({ ...defaults })).toBe(`   ${errorMessage}

 ${r} ${l} before ${red('{{')} after
 ${s} ${l}        ${red('^^')}`);
});

test('multi line', () => {
  const e = error(message, {
    source: `1
2
3
4
5
6 error! after text
7
8`,
    range: [12, 17],
  });

  expect(e.format({ ...defaults })).toBe(`   ${errorMessage}

 ${s} ${l} 4
 ${s} ${l} 5
 ${r} ${l} 6 ${red('error!')} after text
 ${s} ${l}   ${red('^^^^^^')}
 ${s} ${l} 7
 ${s} ${l} 8`);
});

test('multi line - cross line', () => {
  const e = error(message, {
    source: `1
2
3
4 text
5
6 error! after text
7
8`,
    range: [8, 22],
  });

  expect(e.format({ ...defaults })).toBe(`   ${errorMessage}

 ${s} ${l} 2
 ${s} ${l} 3
 ${r} ${l} 4 ${red('text')}
 ${s} ${l}   ${red('^^^^')}
 ${r} ${l} ${red('5')}
 ${s} ${l} ${red('^')}
 ${r} ${l} ${red('6 error!')} after text
 ${s} ${l} ${red('^^^^^^^^')}
 ${s} ${l} 7
 ${s} ${l} 8`);
});

test('multi line - cross line - 2', () => {
  const e = error(message, {
    source: `1
2
3
4 text after text
5
6 error! after text
7
8
9`,
    range: [19, 33],
  });

  expect(e.format({ ...defaults })).toBe(
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
