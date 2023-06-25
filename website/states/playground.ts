import { ScaffdogError } from '@scaffdog/error';
import {
  atom,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
} from 'recoil';
import { recoilPersist } from 'recoil-persist';
import type { InferType } from 'yup';
import { array, object, string } from 'yup';
import { compile, type File } from '../utils/scaffdog';

const { persistAtom } = recoilPersist({
  key: 'playground',
});

/**
 * input
 */
export const playgroundInputEntrySchema = object({
  key: string().required(),
  value: string().required(),
});
export type PlaygroundInputEntry = InferType<typeof playgroundInputEntrySchema>;

export const playgroundInputEntryListSchema = array()
  .of(playgroundInputEntrySchema)
  .required();
export type PlaygroundInputEntryList = InferType<
  typeof playgroundInputEntryListSchema
>;

const playgroundInputState = atom<PlaygroundInputEntryList>({
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

          const files = compile(source, vars);

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
