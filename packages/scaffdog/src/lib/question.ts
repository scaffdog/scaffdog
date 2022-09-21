import { createHelper, extendContext, render } from '@scaffdog/engine';
import type { Context, Variable, VariableRecord } from '@scaffdog/types';
import { isPlainObject } from 'is-plain-object';
import * as z from 'zod';
import type { PromptLibrary, PromptQuestion } from './prompt';

const questionIfSchema = z.union([z.boolean(), z.string()]);

export type QuestionCheckbox = z.infer<typeof questionCheckboxSchema>;
const questionCheckboxSchema = z
  .object({
    message: z.string(),
    choices: z.array(z.string()),
    multiple: z.boolean().optional(),
    initial: z.array(z.string()).optional(),
    if: questionIfSchema.optional(),
  })
  .strict();

export type QuestionList = z.infer<typeof questionListSchema>;
const questionListSchema = z
  .object({
    message: z.string(),
    choices: z.array(z.string()),
    multiple: z.boolean().optional(),
    initial: z.string().optional(),
    if: questionIfSchema.optional(),
  })
  .strict();

export type QuestionConfirm = z.infer<typeof questionConfirmSchema>;
const questionConfirmSchema = z
  .object({
    confirm: z.string(),
    initial: z.boolean().optional(),
    if: questionIfSchema.optional(),
  })
  .strict();

export type QuestionInput = z.infer<typeof questionInputSchema>;
const questionInputSchema = z
  .object({
    message: z.string(),
    initial: z.string().optional(),
    if: questionIfSchema.optional(),
  })
  .strict();

export type QuestionObject = z.infer<typeof questionObjectSchema>;
const questionObjectSchema = z.union([
  questionCheckboxSchema,
  questionListSchema,
  questionConfirmSchema,
  questionInputSchema,
]);

export type Question = z.infer<typeof questionSchema>;
const questionSchema = z.union([
  z.string(), // input syntax sugar
  questionObjectSchema,
]);

export type QuestionRecord = z.infer<typeof questionRecordSchema>;
export const questionRecordSchema = z.record(z.string(), questionSchema);

export type QuestionResolveOptions = {
  context: Context;
  questions: QuestionRecord;
  answers: string[];
};

/**
 * @internal
 */
const isQuestionObject = (v: unknown): v is QuestionObject => isPlainObject(v);

const isQuestionCheckbox = (v: unknown): v is QuestionCheckbox =>
  isQuestionObject(v) && 'choices' in v && v.multiple === true;

const isQuestionList = (v: unknown): v is QuestionList =>
  isQuestionObject(v) && 'choices' in v && v.multiple !== true;

const isQuestionConfirm = (v: unknown): v is QuestionConfirm =>
  isQuestionObject(v) && 'confirm' in v;

type NormalizedQuestionMap = Map<string, QuestionObject>;

export const normalizeQuestions = (
  questions: QuestionRecord,
): NormalizedQuestionMap =>
  Object.entries(questions).reduce((acc, [key, value]) => {
    if (typeof value === 'string') {
      acc.set(key, {
        message: value,
      });
    } else {
      acc.set(key, value);
    }
    return acc;
  }, new Map());

const questionIf = createHelper<[any]>((_, result) => {
  if (typeof result === 'boolean') {
    return result ? 'true' : 'false';
  }
  throw new Error(
    'evaluation value of "questions.*.if" must be a boolean value',
  );
});

export const confirmIf = (question: QuestionObject, context: Context) => {
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

export const transformPromptQuestion = (
  question: QuestionObject,
): PromptQuestion => {
  const validate = (v: string) => (v !== '' ? true : 'required input!');

  if (isQuestionConfirm(question)) {
    return {
      type: 'confirm',
      message: question.confirm,
      default: question.initial,
      validate,
    };
  }

  if (isQuestionCheckbox(question) || isQuestionList(question)) {
    return {
      type: question.multiple === true ? 'checkbox' : 'list',
      message: question.message,
      choices: question.choices,
      default: question.initial,
      validate,
    };
  }

  return {
    ...question,
    type: 'input',
    default: question.initial,
  };
};

export const getInitialValue = (question: QuestionObject): Variable => {
  if (isQuestionConfirm(question)) {
    return question.initial ?? false;
  }

  if (isQuestionCheckbox(question) || isQuestionList(question)) {
    return question.multiple ? question.initial ?? [] : question.initial ?? '';
  }

  return question.initial ?? '';
};

type AnswerMap = Map<string, Variable>;

export const parseAnswers = (
  questions: NormalizedQuestionMap,
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

    if (isQuestionCheckbox(question)) {
      if (!question.choices.includes(value)) {
        const expected = question.choices.join(', ');
        throw new Error(`"${key}" must be the value of "${expected}"`);
      }
      const previous = map.get(key) as string[] | undefined;
      map.set(key, previous == null ? [value] : [...previous, value]);
    } else if (isQuestionList(question)) {
      if (!question.choices.includes(value)) {
        const expected = question.choices.join(', ');
        throw new Error(`"${key}" must be one of "${expected}"`);
      }
      map.set(key, value);
    } else if (isQuestionConfirm(question)) {
      if (value !== 'true' && value !== 'false') {
        throw new Error(`"${key}" must be true or false, but found "${value}"`);
      }
      map.set(key, value === 'true');
    } else {
      if (value === '') {
        throw new Error(`"${key}" is required but found empty value`);
      }
      map.set(key, value);
    }
  }

  return map;
};

/**
 * @public
 */
export type QuestionLibrary = {
  resolve: (options: QuestionResolveOptions) => Promise<VariableRecord>;
};

export const createQuestionLibrary = (
  prompt: PromptLibrary,
): QuestionLibrary => ({
  resolve: async ({ context, questions, answers }) => {
    const inputs: VariableRecord = Object.create(null);
    const entries = normalizeQuestions(questions);
    if (entries.size === 0) {
      return inputs;
    }

    const answer = parseAnswers(entries, answers);

    for (const [name, question] of entries) {
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
