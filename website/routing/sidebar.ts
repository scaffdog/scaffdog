import type { RouteItem } from './types';

export const sidebar: RouteItem[] = [
  {
    title: 'Getting Started',
    path: '/docs',
  },
  {
    title: 'Templates',
    path: '/docs/templates',
    children: [
      {
        title: 'Attributes',
        path: '/docs/templates/attributes',
      },
      {
        title: 'Template Engine',
        path: '/docs/templates/template-engine',
      },
      {
        title: 'Built-in Variables',
        path: '/docs/templates/variables',
      },
      {
        title: 'Built-in Helpers',
        path: '/docs/templates/helpers',
      },
      {
        title: 'Injection',
        path: '/docs/templates/injection',
      },
    ],
  },
  {
    title: 'Config',
    path: '/docs/config',
  },
  {
    title: 'CLI',
    path: '/docs/cli',
  },
  {
    title: 'Integration',
    path: '/docs/integration',
  },
  {
    title: 'Migration',
    path: 'https://github.com/scaffdog/scaffdog/blob/canary/MIGRATION.md',
  },
  {
    title: 'Changelog',
    path: 'https://github.com/scaffdog/scaffdog/blob/canary/CHANGELOG.md',
  },
];
