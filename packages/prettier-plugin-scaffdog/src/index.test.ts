import path from 'path';
import test from 'ava';
import prettier from 'prettier';

const format = (
  code: string,
  {
    project: scaffdogProject,
    ...options
  }: {
    project?: string;
  } & prettier.Options,
) => {
  const opts = {
    ...options,
    scaffdogProject,
    parser: 'markdown',
    plugins: ['.'],
    filepath: path.resolve(
      __dirname,
      '../fixtures',
      options.filepath as string,
    ),
  };

  return prettier.format(code, opts).trim();
};

test('format', (t) => {
  const source = '{{ident  }}';
  const expect = '{{ ident }}';

  t.is(
    format(source, {
      filepath: '.scaffdog/template.md',
    }),
    expect,
  );
});

test('without target file', (t) => {
  const source = '{{ident  }}';
  const expect = source;

  t.is(
    format(source, {
      filepath: 'README.md',
    }),
    expect,
  );
});

test('custom project', (t) => {
  const source = '{{ident  }}';
  const expect = '{{ ident }}';

  t.is(
    format(source, {
      project: '.templates',
      filepath: '.templates/template.md',
    }),
    expect,
  );
});
