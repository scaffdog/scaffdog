import stripAnsi from 'strip-ansi';
import { describe, expect, test } from 'vitest';
import { buildUsage } from './usage.js';

describe('buildUsage', () => {
  test('empty', () => {
    const output = buildUsage([]);

    expect(output).toBe('');
  });

  test('sections', () => {
    const output = buildUsage([
      {
        content: 'This is simple content.',
      },
      {
        content: 'Raw content\nOne\nTwo',
        raw: true,
      },
      {
        header: 'Title line',
        content: 'This is simple content.',
      },
      {
        content: [
          {
            name: '-f, --force',
            summary: 'Summary 1',
          },
          {
            name: '    --flag',
            summary: 'Summary 2',
          },
        ],
      },
    ]);

    expect(stripAnsi(output)).toMatchSnapshot();
  });
});
