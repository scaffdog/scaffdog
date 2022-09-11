import { expect, test } from 'vitest';
import { createContext } from './context';
import { render } from './render';

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
