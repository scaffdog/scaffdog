import path from 'path';
import { extract } from '@scaffdog/core';
import { compile, createContext, extendContext } from '@scaffdog/engine';
import { ScaffdogError } from '@scaffdog/error';
import {
  atom,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
} from 'recoil';
import { recoilPersist } from 'recoil-persist';

export type File = {
  skip: boolean;
  path: string;
  content: string;
};

const { persistAtom } = recoilPersist({
  key: 'playground',
});

/**
 * input
 */
export type PlaygroundInputEntry = {
  key: string;
  value: string;
};

const playgroundInputState = atom<PlaygroundInputEntry[]>({
  key: 'playground.input',
  default: [
    {
      key: 'name',
      value: 'scaffdog',
    },
  ],
  effects: [persistAtom],
});

export const usePlaygroundInputState = () => {
  return useRecoilState(playgroundInputState);
};

/**
 * source
 */
const defaultSource = `# \`{{ inputs.name | kebab }}.ts\`

\`\`\`typescript
export const {{ inputs.name | camel }} = () => 'todo';
\`\`\`

# \`{{ inputs.name | kebab }}.test.ts\`

\`\`\`typescript
import { {{ inputs.name | camel }} } from './{{ inputs.name | kebab }}';

test('todo', () => {
  expect({{ inputs.name | camel }}()).toBe('todo');
});
\`\`\`
`;

const playgroundSourceState = atom({
  key: 'playground.source',
  default: defaultSource,
  effects: [persistAtom],
});

export const usePlaygroundSourceState = () => {
  return useRecoilState(playgroundSourceState);
};

/**
 * compile
 */
export type PlaygroundSuccessResult = {
  state: 'success';
  value: File[];
};

export type PlaygroundFailureResult = {
  state: 'failure';
  message: string;
};

export type PlaygroundResult =
  | PlaygroundSuccessResult
  | PlaygroundFailureResult;

const playgroundCompileState = atom<PlaygroundResult | null>({
  key: 'playground.compile',
  default: null,
});

export const usePlaygroundCompileState = () => {
  return useRecoilValue(playgroundCompileState);
};

export const usePlaygroundCompile = () => {
  const fn = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        try {
          const source = snapshot.getLoadable(playgroundSourceState).getValue();
          const inputs = snapshot.getLoadable(playgroundInputState).getValue();
          const vars = inputs.reduce(
            (acc, { key, value }) => Object.assign(acc, { [key]: value }),
            Object.create(null),
          );

          const { variables, templates } = extract(source, {});
          const cwd = '/workspace';
          const context = createContext({
            cwd,
          });

          context.variables.set('cwd', cwd);
          context.variables.set('inputs', vars);
          context.variables.set('document', {
            name: 'playground.md',
            dir: '.scaffdog',
            path: path.join(cwd, '.scaffdog'),
          });

          for (const [key, ast] of variables) {
            context.variables.set(key, compile(ast, context));
          }

          const files = templates.map((tpl) => {
            const filename = compile(tpl.filename, context);
            if (/^!/.test(filename)) {
              return {
                skip: true,
                path: path.resolve(cwd, filename.slice(1)),
                content: '',
              };
            }

            const absolute = path.resolve(cwd, filename);
            const relative = path.relative(cwd, absolute);
            const info = path.parse(relative);

            const ctx = extendContext(context, {
              variables: new Map([
                [
                  'output',
                  {
                    root: '.',
                    path: filename,
                    abs: absolute,
                    name: info.name,
                    base: info.base,
                    ext: info.ext,
                    dir: info.dir,
                  },
                ],
              ]),
            });

            return {
              skip: false,
              path: filename,
              content: compile(tpl.content, ctx),
            };
          });

          set(playgroundCompileState, {
            state: 'success',
            value: files,
          });
        } catch (e) {
          let message: string;
          if (e instanceof ScaffdogError) {
            message = e.format({ color: false });
          } else {
            message = (e as Error | undefined)?.message ?? 'Unknown error';
          }
          set(playgroundCompileState, {
            state: 'failure',
            message,
          });
        }
      },
    [],
  );

  return fn;
};
