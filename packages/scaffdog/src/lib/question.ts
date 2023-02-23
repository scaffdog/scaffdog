import { createHelper, extendContext, render } from '@scaffdog/engine';
import type { Context, Variable, VariableRecord } from '@scaffdog/types';
import { isPlainObject } from 'is-plain-object';
import * as z from 'zod';
import type { PromptLibrary, PromptQuestion } from './prompt';

const questionIfSchema = z.union([z.boolean(), z.string()]);

type RawQuestionCheckbox = z.infer<typeof rawQuestionCheckboxSchema>;
const rawQuestionCheckboxSchema = z
  .object({
    message: z.string(),
    choices: z.array(z.string()),
    multiple: z.boolean().optional(),
    initial: z.array(z.string()).optional(),
    if: questionIfSchema.optional(),
  })
  .strict();

type RawQuestionList = z.infer<typeof rawQuestionListSchema>;
const rawQuestionListSchema = z
  .object({
    message: z.string(),
    choices: z.array(z.string()),
    multiple: z.boolean().optional(),
    initial: z.string().optional(),
    if: questionIfSchema.optional(),
  })
  .strict();

type RawQuestionConfirm = z.infer<typeof rawQuestionConfirmSchema>;
const rawQuestionConfirmSchema = z
  .object({
    confirm: z.string(),
    initial: z.boolean().optional(),
    if: questionIfSchema.optional(),
  })
  .strict();

type RawQuestionInput = z.infer<typeof rawQuestionInputSchema>;
const rawQuestionInputSchema = z
  .object({
    message: z.string(),
    initial: z.string().optional(),
    if: questionIfSchema.optional(),
  })
  .strict();

type RawQuestionObject = z.infer<typeof rawQuestionObjectSchema>;
const rawQuestionObjectSchema = z.union([
  rawQuestionCheckboxSchema,
  rawQuestionListSchema,
  rawQuestionConfirmSchema,
  rawQuestionInputSchema,
]);

const rawQuestionSchema = z.union([
  z.string(), // input syntax sugar
  rawQuestionObjectSchema,
]);

export type RawQuestionRecord = z.infer<typeof rawQuestionRecordSchema>;
export const rawQuestionRecordSchema = z.record(z.string(), rawQuestionSchema);

export type QuestionCheckbox = Omit<RawQuestionCheckbox, 'multiple'> & {
  type: 'checkbox';
};

export type QuestionList = Omit<RawQuestionList, 'multiple'> & {
  type: 'list';
};

export type QuestionConfirm = Omit<RawQuestionConfirm, 'confirm'> & {
  type: 'confirm';
  message: string;
};

export type QuestionInput = RawQuestionInput & {
  type: 'input';
};

export type Question =
  | QuestionCheckbox
  | QuestionList
  | QuestionConfirm
  | QuestionInput;

export type QuestionMap = Map<string, Question>;

export type QuestionResolveOptions = {
  context: Context;
  questions: QuestionMap;
  answers: string[];
};

/**
 * @internal
 */
const isQuestionObject = (v: unknown): v is RawQuestionObject =>
  isPlainObject(v);

const isQuestionCheckbox = (v: unknown): v is RawQuestionCheckbox =>
  isQuestionObject(v) && 'choices' in v && v.multiple === true;

const isQuestionList = (v: unknown): v is RawQuestionList =>
  isQuestionObject(v) && 'choices' in v && v.multiple !== true;

const isQuestionConfirm = (v: unknown): v is RawQuestionConfirm =>
  isQuestionObject(v) && 'confirm' in v;

const questionIf = createHelper<[any]>((_, result) => {
  if (typeof result === 'boolean') {
    return result ? 'true' : 'false';
  }
  throw new Error(
    'evaluation value of "questions.*.if" must be a boolean value',
  );
});

export const confirmIf = (question: Question, context: Context) => {
  if (question.if != null) {
    if (typeof question.if === 'boolean') {
      return question.if;
    }

    const fn = '__internal_question_if__';
    const ctx = extendContext(context, {
      helpers: new Map([[fn, questionIf]]),
    });

    return render(`{{ ${fn}(${question.if}) }}`, ctx) === 'true';
  }

  return true;
};

export const transformPromptQuestion = (question: Question): PromptQuestion => {
  const validate = (v: string) => (v !== '' ? true : 'required input!');

  switch (question.type) {
    case 'confirm':
      return {
        type: 'confirm',
        message: question.message,
        default: question.initial,
        validate,
      };
    case 'checkbox':
    case 'list':
      return {
        type: question.type === 'checkbox' ? 'checkbox' : 'list',
        message: question.message,
        choices: question.choices,
        default: question.initial,
        validate,
      };
    default:
      return {
        type: 'input',
        message: question.message,
        default: question.initial,
        validate,
      };
  }
};

export const getInitialValue = (question: Question): Variable => {
  switch (question.type) {
    case 'confirm':
      return question.initial ?? false;
    case 'checkbox':
    case 'list':
      return question.type === 'checkbox'
        ? question.initial ?? []
        : question.initial ?? '';
    default:
      return question.initial ?? '';
  }
};

type AnswerMap = Map<string, Variable>;

export const parseAnswers = (
  questions: QuestionMap,
  answers: string[],
): AnswerMap => {
  const map: AnswerMap = new Map();

  for (const token of answers) {
    const index = token.indexOf(':');
    const key = token.slice(0, index).trim();
    const value = token.slice(index + 1);

    if (!questions.has(key)) {
      throw new Error(`"${key}" question is not defined`);
    }

    const question = questions.get(key)!;

    switch (question.type) {
      case 'checkbox': {
        if (!question.choices.includes(value)) {
          const expected = question.choices.join(', ');
          throw new Error(`"${key}" must be the value of "${expected}"`);
        }
        const previous = map.get(key) as string[] | undefined;
        map.set(key, previous == null ? [value] : [...previous, value]);
        break;
      }
      case 'list': {
        if (!question.choices.includes(value)) {
          const expected = question.choices.join(', ');
          throw new Error(`"${key}" must be one of "${expected}"`);
        }
        map.set(key, value);
        break;
      }
      case 'confirm': {
        if (value !== 'true' && value !== 'false') {
          throw new Error(
            `"${key}" must be true or false, but found "${value}"`,
          );
        }
        map.set(key, value === 'true');
        break;
      }
      default: {
        if (value === '') {
          throw new Error(`"${key}" is required but found empty value`);
        }
        map.set(key, value);
      }
    }
  }

  return map;
};

/**
 * @public
 */
export type QuestionLibrary = {
  parse: (questions: RawQuestionRecord) => QuestionMap;
  resolve: (options: QuestionResolveOptions) => Promise<VariableRecord>;
};

export const createQuestionLibrary = (
  prompt: PromptLibrary,
): QuestionLibrary => ({
  parse: (questions) => {
    const map: QuestionMap = new Map();

    Object.entries(questions).forEach(([key, value]) => {
      const raw =
        typeof value === 'string'
          ? {
              message: value,
            }
          : value;

      if (isQuestionCheckbox(raw)) {
        const { multiple, ...rest } = raw;
        map.set(key, {
          ...rest,
          type: 'checkbox',
        });
      } else if (isQuestionList(raw)) {
        const { multiple, ...rest } = raw;
        map.set(key, {
          ...rest,
          type: 'list',
        });
      } else if (isQuestionConfirm(raw)) {
        const { confirm, ...rest } = raw;
        map.set(key, {
          ...rest,
          type: 'confirm',
          message: confirm,
        });
      } else {
        map.set(key, {
          ...raw,
          type: 'input',
        });
      }
    });

    return map;
  },

  resolve: async ({ context, questions, answers }) => {
    const inputs: VariableRecord = Object.create(null);
    if (questions.size === 0) {
      return inputs;
    }

    const answer = parseAnswers(questions, answers);

    for (const [name, question] of questions) {
      const ctx = extendContext(context, {
        variables: new Map([['inputs', inputs]]),
      });

      if (answer.has(name)) {
        inputs[name] = answer.get(name)!;
      } else if (confirmIf(question, ctx)) {
        inputs[name] = await prompt.prompt<Variable>(
          transformPromptQuestion(question),
        );
      } else {
        inputs[name] = getInitialValue(question);
      }
    }

    return inputs;
  },
});
