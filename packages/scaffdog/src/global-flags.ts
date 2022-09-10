export const globalFlags = {
  project: {
    type: 'string',
    alias: 'p',
    description: 'Directory to load the scaffdog project.',
    default: '.scaffdog' as string,
    global: true,
  },
  verbose: {
    type: 'boolean',
    alias: 'v',
    description: 'Enable logging.',
    global: true,
  },
  help: {
    type: 'boolean',
    description: 'Show help.',
    global: true,
  },
  version: {
    type: 'boolean',
    description: 'Output the version number.',
    global: true,
  },
} as const;
