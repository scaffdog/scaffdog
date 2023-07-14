import { char, choice, many, many1, map } from './combinators.js';
import type { Parser } from './types.js';

const whitespaceChar: Parser<string> = choice([...'\t\n\r '].map(char));
export const whitespace: Parser<null> = map(many(whitespaceChar), () => null);
export const whitespace1: Parser<null> = map(many1(whitespaceChar), () => null);
