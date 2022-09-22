import { createContext } from '@scaffdog/engine';
import { describe, expect, test, vi } from 'vitest';
import { createPromptLibraryMock } from './prompt.mock';
import {
  confirmIf,
  createQuestionLibrary,
  getInitialValue,
  normalizeQuestions,
  parseAnswers,
  transformPromptQuestion,
} from './question';

describe('normalizeQuestions', () => {
  test.each([
    [
      'string only',
      {
        key1: 'msg1',
        key2: 'msg2',
      },
      new Map([
        [
          'key1',
          {
            message: 'msg1',
          },
        ],
        [
          'key2',
          {
            message: 'msg2',
          },
        ],
      ]),
    ],

    [
      'mixed',
      {
        key1: 'msg1',
        key2: {
          message: 'msg2',
        },
        key3: {
          confirm: 'msg3',
        },
      },
      new Map([
        [
          'key1',
          {
            message: 'msg1',
          },
        ],
        [
          'key2',
          {
            message: 'msg2',
          },
        ],
        [
          'key3',
          {
            confirm: 'msg3',
          },
        ],
      ]),
    ],
  ])('%s', (_, questions, expected) => {
    expect(normalizeQuestions(questions)).toEqual(expected);
  });
});

describe('confirmIf', () => {
  const context = createContext({
    variables: new Map([
      [
        'inputs',
        {
          key: 'value',
        },
      ],
    ]),
  });

  test.each([
    [
      'without if',
      {
        message: 'msg',
      },
      true,
    ],

    [
      'with literal (true)',
      {
        message: 'msg',
        if: true,
      },
      true,
    ],

    [
      'with literal (false)',
      {
        message: 'msg',
        if: false,
      },
      false,
    ],

    [
      'with expression (true)',
      {
        message: 'msg',
        if: 'inputs.key == "value"',
      },
      true,
    ],

    [
      'with expression (false)',
      {
        message: 'msg',
        if: 'inputs.key != "value"',
      },
      false,
    ],
  ])('success - %s', (_, question, expected) => {
    expect(confirmIf(question, context)).toBe(expected);
  });

  test('failure', () => {
    expect(() =>
      confirmIf(
        {
          message: 'msg',
          if: '"string"',
        },
        context,
      ),
    ).toThrowError(/"questions\.\*\.if"/);
  });
});

describe('transformPromptQuestion', () => {
  test.each([
    [
      'confirm',
      {
        confirm: 'msg',
      },
      {
        type: 'confirm',
        message: 'msg',
        default: undefined,
      },
    ],

    [
      'confirm with initial',
      {
        confirm: 'msg',
        initial: true,
      },
      {
        type: 'confirm',
        message: 'msg',
        default: true,
      },
    ],

    [
      'checkbox',
      {
        message: 'msg',
        choices: ['a'],
        multiple: true,
      },
      {
        type: 'checkbox',
        message: 'msg',
        choices: ['a'],
        default: undefined,
      },
    ],

    [
      'checkbox with initial',
      {
        message: 'msg',
        choices: ['a'],
        multiple: true,
        initial: ['a'],
      },
      {
        type: 'checkbox',
        message: 'msg',
        choices: ['a'],
        default: ['a'],
      },
    ],

    [
      'list',
      {
        message: 'msg',
        choices: ['a'],
      },
      {
        type: 'list',
        message: 'msg',
        choices: ['a'],
        default: undefined,
      },
    ],

    [
      'list with initial',
      {
        message: 'msg',
        choices: ['a'],
        initial: 'a',
      },
      {
        type: 'list',
        message: 'msg',
        choices: ['a'],
        default: 'a',
      },
    ],

    [
      'input',
      {
        message: 'msg',
      },
      {
        type: 'input',
        message: 'msg',
        default: undefined,
      },
    ],

    [
      'input with initial',
      {
        message: 'msg',
        initial: 'a',
      },
      {
        type: 'input',
        message: 'msg',
        default: 'a',
      },
    ],
  ])('%s', (_, question, expected) => {
    expect(transformPromptQuestion(question)).toEqual(
      expect.objectContaining(expected),
    );
  });
});

describe('getInitialValue', () => {
  test.each([
    [
      'confirm',
      {
        confirm: 'msg',
      },
      false,
    ],

    [
      'confirm with initial',
      {
        confirm: 'msg',
        initial: true,
      },
      true,
    ],

    [
      'checkbox',
      {
        message: 'msg',
        choices: ['a'],
        multiple: true,
      },
      [],
    ],

    [
      'checkbox with initial',
      {
        message: 'msg',
        choices: ['a'],
        multiple: true,
        initial: ['a'],
      },
      ['a'],
    ],

    [
      'list',
      {
        message: 'msg',
        choices: ['a'],
      },
      '',
    ],

    [
      'list with initial',
      {
        message: 'msg',
        choices: ['a'],
        initial: 'a',
      },
      'a',
    ],

    [
      'input',
      {
        message: 'msg',
      },
      '',
    ],

    [
      'input with initial',
      {
        message: 'msg',
        initial: 'a',
      },
      'a',
    ],
  ])('%s', (_, question, expected) => {
    expect(getInitialValue(question)).toEqual(expected);
  });
});

describe('parseAnswers', () => {
  test.each([
    [
      'input',
      {
        message: 'msg',
      },
      ['key:value'],
      'value',
    ],

    [
      'input (override)',
      {
        message: 'msg',
      },
      ['key:value', 'key:value2'],
      'value2',
    ],

    [
      'confirm (true)',
      {
        confirm: 'msg',
      },
      ['key:true'],
      true,
    ],

    [
      'confirm (false)',
      {
        confirm: 'msg',
      },
      ['key:false'],
      false,
    ],

    [
      'checkbox (single)',
      {
        message: 'msg',
        choices: ['a', 'b'],
        multiple: true,
      },
      ['key:a'],
      ['a'],
    ],

    [
      'checkbox (double)',
      {
        message: 'msg',
        choices: ['a', 'b'],
        multiple: true,
      },
      ['key:a', 'key:b'],
      ['a', 'b'],
    ],

    [
      'list',
      {
        message: 'msg',
        choices: ['a', 'b'],
      },
      ['key:a'],
      'a',
    ],

    [
      'list (override)',
      {
        message: 'msg',
        choices: ['a', 'b'],
      },
      ['key:a', 'key:b'],
      'b',
    ],
  ])('success - %s', (_, question, answers, expected) => {
    expect(parseAnswers(new Map([['key', question]]), answers)).toEqual(
      new Map([['key', expected]]),
    );
  });

  test.each([
    [
      'input (empty)',
      {
        message: 'msg',
      },
      ['key:'],
      /empty value/,
    ],

    [
      'confirm (empty)',
      {
        confirm: 'msg',
      },
      ['key:'],
      /true or false/,
    ],

    [
      'confirm (invalid token)',
      {
        confirm: 'msg',
      },
      ['key:str'],
      /true or false/,
    ],

    [
      'checkbox (empty)',
      {
        message: 'msg',
        choices: ['a', 'b'],
        multiple: true,
      },
      ['key:'],
      /value of "a, b"/,
    ],

    [
      'checkbox (invalid)',
      {
        message: 'msg',
        choices: ['a', 'b'],
        multiple: true,
      },
      ['key:c'],
      /value of "a, b"/,
    ],

    [
      'list (empty)',
      {
        message: 'msg',
        choices: ['a', 'b'],
      },
      ['key:'],
      /one of "a, b"/,
    ],

    [
      'list (invalid)',
      {
        message: 'msg',
        choices: ['a', 'b'],
      },
      ['key:c'],
      /one of "a, b"/,
    ],
  ])('failure - %s', (_, question, answers, expected) => {
    expect(() =>
      parseAnswers(new Map([['key', question]]), answers),
    ).toThrowError(expected);
  });
});

describe('resolve', () => {
  const context = createContext({});

  test('empty', async () => {
    const prompt = createPromptLibraryMock({
      prompt: vi.fn().mockResolvedValue('mock'),
    });

    expect(
      await createQuestionLibrary(prompt).resolve({
        context,
        questions: {},
        answers: [],
      }),
    ).toEqual({});
  });

  test('success', async () => {
    const prompt = createPromptLibraryMock({
      prompt: vi.fn().mockResolvedValue('mock'),
    });

    expect(
      await createQuestionLibrary(prompt).resolve({
        context,
        questions: {
          answer: 'msg',
          prompt: {
            message: 'msg',
          },
          initial: {
            message: 'msg',
            if: false,
            initial: 'initial',
          },
        },
        answers: ['answer:value'],
      }),
    ).toEqual({
      answer: 'value',
      prompt: 'mock',
      initial: 'initial',
    });

    expect(prompt.prompt).toBeCalledWith({
      type: 'input',
      message: 'msg',
      default: undefined,
      validate: expect.objectContaining({ name: 'validate' }),
    });
  });
});
