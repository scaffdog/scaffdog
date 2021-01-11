import test from 'ava';
import { formatFile } from './format';

const defaults = {
  columns: 60,
  color: false,
};

test('short', (t) => {
  const output = formatFile(
    {
      filename: 'FILENAME',
      output: '',
      content: ['A'.repeat(5)].join('\n'),
    },
    { ...defaults },
  );

  t.snapshot(output);
});

test('long content', (t) => {
  const output = formatFile(
    {
      filename: 'FILENAME',
      output: '',
      content: Array.from(Array(100).fill('line...')).join('\n'),
    },
    { ...defaults },
  );

  t.snapshot(output);
});

test('long filename', (t) => {
  const output = formatFile(
    {
      filename: 'X'.repeat(110),
      output: '',
      content: 'line...',
    },
    { ...defaults },
  );

  t.snapshot(output);
});

test('wrap', (t) => {
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

  t.snapshot(output);
});

test('empty content', (t) => {
  const output = formatFile(
    {
      filename: 'FILENAME',
      output: '',
      content: '',
    },
    { ...defaults },
  );

  t.snapshot(output);
});
