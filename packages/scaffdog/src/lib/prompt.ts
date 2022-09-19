/// <reference types="../types/inquirer-autocomplete-prompt" />
import Fuse from 'fuse.js';
import inquirer from 'inquirer';
import inquirerAutocompletePrompt from 'inquirer-autocomplete-prompt';

inquirer.registerPrompt('autocomplete', inquirerAutocompletePrompt);

export type PromptQuestion = inquirer.DistinctQuestion;

export type ConfirmArgs = Omit<PromptQuestion, 'type' | 'name' | 'default'>;

export type AutocompleteArgs = Omit<PromptQuestion, 'type' | 'name'>;

export type PromptLibrary = {
  prompt: <T>(question: PromptQuestion) => Promise<T>;

  confirm: (
    message: string,
    initial: boolean,
    args: ConfirmArgs,
  ) => Promise<boolean>;

  autocomplete: (
    message: string,
    list: string[],
    args: AutocompleteArgs,
  ) => Promise<string>;
};

export const createPromptLibrary = (): PromptLibrary => {
  const prompt: PromptLibrary['prompt'] = async (question) => {
    const { value } = await inquirer.prompt([
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

  return {
    prompt,

    confirm: async (message, initial, args) => {
      return await prompt({
        ...args,
        type: 'confirm',
        default: initial,
        message,
      });
    },

    autocomplete: async (message, list, args) => {
      const fuse = new Fuse(list, {});

      return await prompt({
        ...args,
        type: 'autocomplete',
        message,
        pageSize: 20,
        source: (_: any, input: string) => {
          return !input
            ? list
            : fuse.search(input || '').map(({ item }) => item);
        },
      } as any);
    },
  };
};
