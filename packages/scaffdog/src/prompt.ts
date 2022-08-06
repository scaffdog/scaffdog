/// <reference types="./types/inquirer-autocomplete-prompt" />
import Fuse from 'fuse.js';
import inquirer from 'inquirer';
import inquirerAutocompletePrompt from 'inquirer-autocomplete-prompt';

inquirer.registerPrompt('autocomplete', inquirerAutocompletePrompt);

export type PromptQuestion = inquirer.DistinctQuestion;

export const prompt = async <T>(question: PromptQuestion): Promise<T> => {
  const { value } = await inquirer.prompt<{ value: T }>([
    {
      ...question,
      name: 'value',
    },
  ]);

  if (question.when === false && question.default != null) {
    return question.default;
  }

  return value;
};

export type ConfirmArgs = Omit<PromptQuestion, 'type' | 'name' | 'default'>;
export const confirm = async (
  message: string,
  initial: boolean,
  args: ConfirmArgs = {},
): Promise<boolean> => {
  return await prompt({
    ...args,
    type: 'confirm',
    default: initial,
    message,
  });
};

export type AutocompleteArgs = Omit<PromptQuestion, 'type' | 'name'>;
export const autocomplete = async (
  message: string,
  list: string[],
  args: AutocompleteArgs = {},
): Promise<string> => {
  const fuse = new Fuse(list, {});

  return await prompt({
    ...args,
    type: 'autocomplete',
    message,
    pageSize: 20,
    source: (_: any, input: string) => {
      return !input ? list : fuse.search(input || '').map(({ item }) => item);
    },
  } as any);
};
