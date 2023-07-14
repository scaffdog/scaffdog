import { createContext } from '@scaffdog/engine';
import { describe, expect, test, vi } from 'vitest';
import { createPromptLibraryMock } from './prompt.mock';
import type { Question } from './question.js';
import {
  confirmIf,
  createQuestionLibrary,
  getInitialValue,
  parseAnswers,
  transformPromptQuestion,
} from './question.js';

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

  test.each<[string, Question, boolean]>([
    [
      'without if',
      {
        type: 'input',
        message: 'msg',
      },
      true,
    ],

    [
      'with literal (true)',
      {
        type: 'input',
        message: 'msg',
        if: true,
      },
      true,
    ],

    [
      'with literal (false)',
      {
        type: 'input',
        message: 'msg',
        if: false,
      },
      false,
    ],

    [
      'with expression (true)',
      {
        type: 'input',
        message: 'msg',
        if: 'inputs.key == "value"',
      },
      true,
    ],

    [
      'with expression (false)',
      {
        type: 'input',
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
          type: 'input',
          message: 'msg',
          if: '"string"',
        },
        context,
      ),
    ).toThrowError(/"questions\.\*\.if"/);
  });
});

describe('transformPromptQuestion', () => {
  test.each<[string, Question, any]>([
    [
      'confirm',
      {
        type: 'confirm',
        message: 'msg',
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
        type: 'confirm',
        message: 'msg',
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
        type: 'checkbox',
        message: 'msg',
        choices: ['a'],
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
        type: 'checkbox',
        message: 'msg',
        choices: ['a'],
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
        type: 'list',
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
        type: 'list',
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
        type: 'input',
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
        type: 'input',
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
  test.each<[string, Question, unknown]>([
    [
      'confirm',
      {
        type: 'confirm',
        message: 'msg',
      },
      false,
    ],

    [
      'confirm with initial',
      {
        type: 'confirm',
        message: 'msg',
        initial: true,
      },
      true,
    ],

    [
      'checkbox',
      {
        type: 'checkbox',
        message: 'msg',
        choices: ['a'],
      },
      [],
    ],

    [
      'checkbox with initial',
      {
        type: 'checkbox',
        message: 'msg',
        choices: ['a'],
        initial: ['a'],
      },
      ['a'],
    ],

    [
      'list',
      {
        type: 'list',
        message: 'msg',
        choices: ['a'],
      },
      '',
    ],

    [
      'list with initial',
      {
        type: 'list',
        message: 'msg',
        choices: ['a'],
        initial: 'a',
      },
      'a',
    ],

    [
      'input',
      {
        type: 'input',
        message: 'msg',
      },
      '',
    ],

    [
      'input with initial',
      {
        type: 'input',
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
  test.each<[string, Question, string[], unknown]>([
    [
      'input',
      {
        type: 'input',
        message: 'msg',
      },
      ['key:value'],
      'value',
    ],

    [
      'input (override)',
      {
        type: 'input',
        message: 'msg',
      },
      ['key:value', 'key:value2'],
      'value2',
    ],

    [
      'confirm (true)',
      {
        type: 'confirm',
        message: 'msg',
      },
      ['key:true'],
      true,
    ],

    [
      'confirm (false)',
      {
        type: 'confirm',
        message: 'msg',
      },
      ['key:false'],
      false,
    ],

    [
      'checkbox (single)',
      {
        type: 'checkbox',
        message: 'msg',
        choices: ['a', 'b'],
      },
      ['key:a'],
      ['a'],
    ],

    [
      'checkbox (double)',
      {
        type: 'checkbox',
        message: 'msg',
        choices: ['a', 'b'],
      },
      ['key:a', 'key:b'],
      ['a', 'b'],
    ],

    [
      'list',
      {
        type: 'list',
        message: 'msg',
        choices: ['a', 'b'],
      },
      ['key:a'],
      'a',
    ],

    [
      'list (override)',
      {
        type: 'list',
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

  test.each<[string, Question, string[], RegExp]>([
    [
      'input (empty)',
      {
        type: 'input',
        message: 'msg',
      },
      ['key:'],
      /empty value/,
    ],

    [
      'confirm (empty)',
      {
        type: 'confirm',
        message: 'msg',
      },
      ['key:'],
      /true or false/,
    ],

    [
      'confirm (invalid token)',
      {
        type: 'confirm',
        message: 'msg',
      },
      ['key:str'],
      /true or false/,
    ],

    [
      'checkbox (empty)',
      {
        type: 'checkbox',
        message: 'msg',
        choices: ['a', 'b'],
      },
      ['key:'],
      /value of "a, b"/,
    ],

    [
      'checkbox (invalid)',
      {
        type: 'checkbox',
        message: 'msg',
        choices: ['a', 'b'],
      },
      ['key:c'],
      /value of "a, b"/,
    ],

    [
      'list (empty)',
      {
        type: 'list',
        message: 'msg',
        choices: ['a', 'b'],
      },
      ['key:'],
      /one of "a, b"/,
    ],

    [
      'list (invalid)',
      {
        type: 'list',
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

describe('parse', () => {
  const prompt = createPromptLibraryMock();

  test.each([
    ['empty', {}, new Map()],

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
            type: 'input',
            message: 'msg1',
          },
        ],
        [
          'key2',
          {
            type: 'input',
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
        key4: {
          message: 'msg4',
          choices: ['a'],
          multiple: true,
        },
        key5: {
          message: 'msg5',
          choices: ['a'],
          multiple: false,
        },
      },
      new Map([
        [
          'key1',
          {
            type: 'input',
            message: 'msg1',
          },
        ],
        [
          'key2',
          {
            type: 'input',
            message: 'msg2',
          },
        ],
        [
          'key3',
          {
            type: 'confirm',
            message: 'msg3',
          },
        ],
        [
          'key4',
          {
            type: 'checkbox',
            message: 'msg4',
            choices: ['a'],
          },
        ],
        [
          'key5',
          {
            type: 'list',
            message: 'msg5',
            choices: ['a'],
          },
        ],
      ]),
    ],
  ])('%s', (_, questions, expected) => {
    expect(createQuestionLibrary(prompt).parse(questions)).toEqual(expected);
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
        questions: new Map(),
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
        questions: new Map([
          [
            'answer',
            {
              type: 'input',
              message: 'msg',
            },
          ],
          [
            'prompt',
            {
              type: 'input',
              message: 'msg',
            },
          ],
          [
            'initial',
            {
              type: 'input',
              message: 'msg',
              if: false,
              initial: 'initial',
            },
          ],
        ]),
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
