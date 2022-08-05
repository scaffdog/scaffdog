import { test, expect } from 'vitest';
import { formatFile } from './format';

const defaults = {
  columns: 60,
  color: false,
};

test('short', () => {
  const output = formatFile(
    {
      filename: 'FILENAME',
      output: '',
      content: ['A'.repeat(5)].join('\n'),
    },
    { ...defaults },
  );

  expect(output).toMatchSnapshot();
});

test('long content', () => {
  const output = formatFile(
    {
      filename: 'FILENAME',
      output: '',
      content: Array.from(Array(100).fill('line...')).join('\n'),
    },
    { ...defaults },
  );

  expect(output).toMatchSnapshot();
});

test('long filename', () => {
  const output = formatFile(
    {
      filename: 'X'.repeat(110),
      output: '',
      content: 'line...',
    },
    { ...defaults },
  );

  expect(output).toMatchSnapshot();
});

test('wrap', () => {
  const output = formatFile(
    {
      filename: 'FILENAME',
      output: '',
      content: [
        'A'.repeat(30),
        'B'.repeat(20),
        'C'.repeat(60),
        'D'.repeat(65),
        'E'.repeat(125),
      ].join('\n'),
    },
    { ...defaults },
  );

  expect(output).toMatchSnapshot();
});

test('empty content', () => {
  const output = formatFile(
    {
      filename: 'FILENAME',
      output: '',
      content: '',
    },
    { ...defaults },
  );

  expect(output).toMatchSnapshot();
});
