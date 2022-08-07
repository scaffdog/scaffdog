import {
  atom,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
} from 'recoil';
import type { File } from '@scaffdog/types';
import { ScaffdogError } from '@scaffdog/error';
import { generate } from '../utils/scaffdog';

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
  const compile = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        try {
          const source = snapshot.getLoadable(playgroundSourceState).getValue();
          const inputs = snapshot.getLoadable(playgroundInputState).getValue();
          const vars = inputs.map(({ key, value }) => [key, value] as const);
          const files = generate(source, new Map(vars));

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

  return compile;
};
