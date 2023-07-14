import { test, expect } from 'vitest';
import { formatFile } from './format.js';

const defaults = {
  columns: 60,
  color: false,
};

test('short', () => {
  const output = formatFile(
    {
      name: 'FILENAME',
      path: '',
      content: ['A'.repeat(5)].join('\n'),
      skip: false,
    },
    { ...defaults },
  );

  expect(output).toMatchSnapshot();
});

test('long content', () => {
  const output = formatFile(
    {
      name: 'FILENAME',
      path: '',
      content: Array.from(Array(100).fill('line...')).join('\n'),
      skip: false,
    },
    { ...defaults },
  );

  expect(output).toMatchSnapshot();
});

test('long filename', () => {
  const output = formatFile(
    {
      name: 'X'.repeat(110),
      path: '',
      content: 'line...',
      skip: false,
    },
    { ...defaults },
  );

  expect(output).toMatchSnapshot();
});

test('wrap', () => {
  const output = formatFile(
    {
      name: 'FILENAME',
      path: '',
      content: [
        'A'.repeat(30),
        'B'.repeat(20),
        'C'.repeat(60),
        'D'.repeat(65),
        'E'.repeat(125),
      ].join('\n'),
      skip: false,
    },
    { ...defaults },
  );

  expect(output).toMatchSnapshot();
});

test('empty content', () => {
  const output = formatFile(
    {
      name: 'FILENAME',
      path: '',
      content: '',
      skip: false,
    },
    { ...defaults },
  );

  expect(output).toMatchSnapshot();
});

test('skip', () => {
  const output = formatFile(
    {
      name: 'FILENAME',
      path: '',
      content: ['A'.repeat(5)].join('\n'),
      skip: true,
    },
    { ...defaults },
  );

  expect(output).toMatchSnapshot();
});
