import type {
  BooleanLiteral,
  LiteralKind,
  NullLiteral,
  NumericLiteral,
  StringLiteral,
  Tag,
  UndefinedLiteral,
} from '../ast.js';
import {
  createBooleanLiteral,
  createNullLiteral,
  createNumericLiteral,
  createStringLiteral,
  createTag,
  createUndefinedLiteral,
} from '../ast.js';
import {
  any,
  attempt,
  char,
  choice,
  concat,
  cut,
  diff,
  digit,
  expected,
  label,
  many,
  many1,
  map,
  option,
  peek,
  preceded,
  satisfy,
  string,
} from './combinators.js';
import type { Parser } from './types.js';

// null
export const nullLiteral: Parser<NullLiteral> = map(
  expected(string('null'), 'null literal expected'),
  (_, r) => createNullLiteral(r),
);

// undefined
export const undefinedLiteral: Parser<UndefinedLiteral> = map(
  expected(string('undefined'), 'undefined literal expected'),
  (_, r) => createUndefinedLiteral(r),
);

// boolean
export const booleanLiteral: Parser<BooleanLiteral> = map(
  expected(
    choice([
      map(string('true'), () => true),
      map(string('false'), () => false),
    ]),
    'boolean literal expected',
  ),
  (v, r) => createBooleanLiteral(v, r),
);

// binary
const binaryDigitPrefix: Parser<'0b'> = map(
  concat([char('0'), choice([char('b'), char('B')])]),
  () => '0b',
);
const binaryDigit: Parser<string> = choice([char('0'), char('1')]);
const binaryDigits: Parser<string> = map(
  label(many1(binaryDigit), 'Invalid binary digit'),
  (rest) => rest.join(''),
);

const binaryIntegerLiteral: Parser<number> = map(
  concat([
    peek(binaryDigitPrefix),
    preceded(binaryDigitPrefix, cut(binaryDigits)),
  ]),
  (rest) => Number(rest.join('')),
);

// octal
const octalDigitPrefix: Parser<'0o'> = map(
  concat([char('0'), choice([char('o'), char('O')])]),
  () => '0o',
);
const octalDigit: Parser<string> = satisfy((c) => /^[0-7]$/.test(c));
const octalDigits: Parser<string> = map(
  label(many1(octalDigit), 'Invalid octal digit'),
  (rest) => rest.join(''),
);

const octalIntegerLiteral: Parser<number> = map(
  concat([
    peek(octalDigitPrefix),
    preceded(octalDigitPrefix, cut(octalDigits)),
  ]),
  (rest) => Number(rest.join('')),
);

// hex
const hexDigitPrefix: Parser<'0x'> = map(
  concat([char('0'), choice([char('x'), char('X')])]),
  () => '0x',
);
const hexDigit: Parser<string> = satisfy((c) => /^([0-9]|[a-f])$/i.test(c));
const hexDigits: Parser<string> = map(
  label(many1(hexDigit), 'Invalid hex digit'),
  (rest) => rest.join(''),
);

const hexIntegerLiteral: Parser<number> = map(
  concat([peek(hexDigitPrefix), preceded(hexDigitPrefix, cut(hexDigits))]),
  (rest) => Number(rest.join('')),
);

// decimal
const nonZeroDigit: Parser<string> = diff(digit, char('0'));

const decimalDigits: Parser<string> = map(many1(digit), (rest) =>
  rest.join(''),
);

const decimalInteger: Parser<string> = choice([
  char('0'),
  map(concat([nonZeroDigit, option(decimalDigits)]), ([first, rest]) =>
    [first, rest.state === 'some' ? rest.value : ''].join(''),
  ),
]);

const signedInteger: Parser<string> = choice([
  map(concat([char('+'), decimalDigits]), (rest) => rest.join('')),
  map(concat([char('-'), decimalDigits]), (rest) => rest.join('')),
  decimalDigits,
]);

const exponentIndicator: Parser<string> = choice([char('e'), char('E')]);

const exponentPart: Parser<string> = map(
  concat([
    exponentIndicator,
    cut(label(signedInteger, 'Invalid exponent part')),
  ]),
  (rest) => rest.join(''),
);

const decimalLiteral: Parser<number> = choice([
  // "." DecimalDigits ExponentPart?
  map(
    concat([
      peek(concat([char('.'), decimalDigits])),
      preceded(concat([char('.'), decimalDigits]), option(exponentPart)),
    ]),
    ([[, fraction], exponent]) =>
      Number(
        [
          '0',
          '.',
          fraction,
          exponent.state === 'some' ? exponent.value : '',
        ].join(''),
      ),
  ),
  // DecimalIntegerLiteral "." DecimalDigits? ExponentPart?
  map(
    concat([
      peek(concat([decimalInteger, char('.')])),
      preceded(
        concat([decimalInteger, char('.')]),
        concat([option(decimalDigits), option(exponentPart)]),
      ),
    ]),
    ([[integer], [fraction, exponent]]) =>
      Number(
        [
          integer,
          '.',
          fraction.state === 'some' ? fraction.value : '',
          exponent.state === 'some' ? exponent.value : '',
        ].join(''),
      ),
  ),
  // DecimalIntegerLiteral ExponentPart?
  map(
    concat([
      peek(decimalInteger),
      preceded(decimalInteger, option(exponentPart)),
    ]),
    ([integer, exponent]) =>
      Number(
        [integer, exponent.state === 'some' ? exponent.value : ''].join(''),
      ),
  ),
]);

// numeric
export const numericLiteral: Parser<NumericLiteral> = map(
  choice([
    binaryIntegerLiteral,
    octalIntegerLiteral,
    hexIntegerLiteral,
    decimalLiteral,
  ]),
  (v, r) => createNumericLiteral(v, r),
);

// string
const doubleQuote: Parser<string> = char(`"`);
const singleQuote: Parser<string> = char(`'`);
const escape: Parser<string> = choice([
  attempt(map(string(`\\"`), () => `"`)),
  map(string(`\\'`), () => `'`),
]);

const doubleStringChars: Parser<string> = map(
  many(choice([attempt(escape), diff(any, doubleQuote)])),
  (rest) => rest.join(''),
);

const singleStringChars: Parser<string> = map(
  many(choice([attempt(escape), diff(any, singleQuote)])),
  (rest) => rest.join(''),
);

const doubleStringLiteral: Parser<StringLiteral> = map(
  concat([
    doubleQuote,
    doubleStringChars,
    expected(cut(doubleQuote), 'Missing double quote'),
  ]),
  ([, s], r) => createStringLiteral(s, `"`, r),
);

const singleStringLiteral: Parser<StringLiteral> = map(
  concat([
    singleQuote,
    singleStringChars,
    expected(cut(singleQuote), 'Missing single quote'),
  ]),
  ([, s], r) => createStringLiteral(s, `'`, r),
);

export const stringLiteral: Parser<StringLiteral> = choice([
  attempt(doubleStringLiteral),
  singleStringLiteral,
]);

// literal
export const literal: Parser<LiteralKind> = choice([
  nullLiteral,
  undefinedLiteral,
  booleanLiteral,
  numericLiteral,
  stringLiteral,
]);

// tag
export const tagOpen: Parser<Tag> = (state) =>
  map(
    concat([string(state.tags[0]), option(char('-'))]),
    ([delimiter, strip], r) =>
      createTag('open', delimiter, strip.state === 'some', r),
  )(state);

export const tagClose: Parser<Tag> = (state) =>
  map(
    attempt(concat([option(char('-')), string(state.tags[1])])),
    ([strip, delimiter], r) =>
      createTag('close', delimiter, strip.state === 'some', r),
  )(state);
