import { expect, test } from 'vitest';
import { createContext } from './context.js';
import { render } from './render.js';

test('success', () => {
  expect(
    render(
      'I am {{ name }}!',
      createContext({
        variables: new Map([['name', 'scaffdog']]),
      }),
    ),
  ).toBe('I am scaffdog!');
});
