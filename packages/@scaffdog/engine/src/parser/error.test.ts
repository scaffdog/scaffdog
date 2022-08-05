import { describe, expect, test } from 'vitest';
import type { ParseErrorEntry } from './error';
import { parseError, ParseErrorStack } from './error';

describe('ParseErrorStack', () => {
  const errors3 = [
    parseError('msg1', [0, 0]),
    parseError('msg2', [0, 0]),
    parseError('msg3', [0, 0]),
  ];

  test('iterate', () => {
    const stack = ParseErrorStack.from(errors3);
    const errors: ParseErrorEntry[] = [];
    for (const entry of stack) {
      errors.push(entry);
    }
    expect(errors).toEqual(errors3);
  });

  test('all', () => {
    const stack = ParseErrorStack.from(errors3);
    expect(stack.all()).toBe(errors3);
  });

  test('clear', () => {
    const stack1 = ParseErrorStack.from(errors3);
    const stack2 = stack1.clear();
    expect(stack1).not.toBe(stack2);
    expect(stack2.all()).toEqual([]);
  });

  test('latest', () => {
    const stack = ParseErrorStack.from(errors3);
    expect(stack.latest()).toBe(errors3[2]);
  });

  test('append', () => {
    const error = parseError('msg', [0, 0]);
    const stack1 = ParseErrorStack.from(errors3);
    const stack2 = stack1.append(error);
    expect(stack1).not.toBe(stack2);
    expect(stack2.all()).toEqual([...errors3, error]);
  });

  describe('upsert', () => {
    const error = parseError('msg', [0, 0]);

    test('basic', () => {
      const stack1 = ParseErrorStack.from(errors3);
      const stack2 = stack1.upsert(errors3[1], error);
      expect(stack1).not.toBe(stack2);
      expect(stack2.all()).toEqual([errors3[0], error, errors3[2]]);
    });

    test('from null', () => {
      const stack1 = ParseErrorStack.from(errors3);
      const stack2 = stack1.upsert(null, error);
      expect(stack1).not.toBe(stack2);
      expect(stack2.all()).toEqual([...errors3, error]);
    });

    test('from not exists', () => {
      const stack1 = ParseErrorStack.from(errors3);
      const stack2 = stack1.upsert(parseError('not exists', [0, 0]), error);
      expect(stack1).not.toBe(stack2);
      expect(stack2.all()).toEqual([...errors3, error]);
    });
  });
});
