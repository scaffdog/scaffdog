import path from 'path';

const languages = {
  markup: ['html', 'xml', 'svg', 'atom', 'rss'],
  bash: [
    'sh',
    'bash',
    'bats',
    'cgi',
    'command',
    'fcgi',
    'ksh',
    'shin',
    'tmux',
    'tool',
    'zsh',
  ],
  c: ['c', 'h'],
  cpp: [
    'cpp',
    'c++',
    'cc',
    'cp',
    'cxx',
    'h',
    'h++',
    'hh',
    'hpp',
    'hxx',
    'inc',
    'inl',
    'ipp',
    'tcc',
    'tpp',
  ],
  css: ['css'],
  javascript: ['js', 'mjs', 'cjs'],
  jsx: ['js', 'jsx'],
  coffeescript: ['coffee', 'cjsx', 'cson'],
  actionscript: ['as'],
  diff: ['diff', 'patch'],
  go: ['go'],
  graphql: ['graphql'],
  handlebars: ['handlebars', 'hbs'],
  json: ['json', 'lock'],
  less: ['less'],
  makefile: ['mk', 'mkfile'],
  markdown: ['md', 'markdown', 'mkd', 'mkdn', 'mkdown'],
  objectivec: ['m', 'mm'],
  ocaml: ['ml', 'eliom', 'eliomi', 'ml4', 'mli', 'mll', 'mly'],
  python: [
    'py',
    'bzl',
    'cgi',
    'fcgi',
    'gyp',
    'lmi',
    'pyde',
    'pyp',
    'pyt',
    'pyw',
    'rpy',
    'tac',
    'wsgi',
    'xpy',
  ],
  sass: ['sass'],
  scss: ['scss'],
  sql: ['sql', 'cql', 'ddl', 'inc', 'prc', 'tab', 'udf', 'viw'],
  stylus: ['styl'],
  tsx: ['tsx'],
  typescript: ['ts', 'cts', 'mts'],
  yaml: ['yml', 'yaml'],
};

const map = new Map(
  Object.entries(languages).flatMap(([lang, extensions]) => {
    return extensions.map((ext) => [ext, lang]);
  }),
);

export const detectPrismLanguage = (filepath: string): string => {
  const { ext: raw, base } = path.parse(filepath);
  const ext = raw.slice(1);
  if (map.has(ext)) {
    return map.get(ext)!;
  }

  switch (base) {
    case 'Makefile':
      return 'makefile';
  }

  return 'clike';
};
