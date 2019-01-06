import { flags } from '@oclif/command';

export const commonFlags = {
  help: flags.help({ char: 'h' }),

  templateDir: flags.string({
    char: 'd',
    description: 'Directory where to load scaffdog templates from.',
    default: '.scaffdog',
  }),
};
