import { flags } from '@oclif/command';

export const commonFlags = {
  help: flags.help({ char: 'h' }),

  templateDir: flags.string({
    char: 'd',
    description: 'Directory to load the scaffdog template.',
    default: '.scaffdog',
  }),
};
