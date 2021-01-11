import * as esprima from 'esprima';
import { error } from '@scaffdog/error';
import type { AnyToken, Loc, Token } from './tokens';
import { createToken } from './tokens';

type EsprimaToken = {
  type: string;
  value: string;
  loc: {
    start: Loc;
    end: Loc;
  };
};

function unexpected(input: string, loc: Loc): never {
  throw error(`unexpected token`, {
    source: input,
    start: loc,
    end: loc,
  });
}

const unclosed = (input: string, tokens: AnyToken[]) => {
  const tags = tokens.filter((token) => token.type === 'OPEN_TAG');
  const last = tags.length > 0 ? tags[tags.length - 1] : null;

  throw error('unclosed tag', {
    source: input,
    start: last != null ? last.start : { line: 1, column: 1 },
    end: last != null ? last.end : { line: 1, column: 1 },
  });
};

const unopened = (input: string, token: Token<'CLOSE_TAG'>) => {
  throw error('unopend tag', {
    source: input,
    start: token.start,
    end: token.end,
  });
};

const parseNumeric = (value: string) => Number(value);

type TokenizationContext = {
  source: string;
  input: string;
  loc: Loc;
};

const tokenizeUsingEsprima = ({ source, input, loc }: TokenizationContext) => {
  try {
    return esprima.tokenize(input, { loc: true }) as EsprimaToken[];
  } catch (e) {
    unexpected(source, {
      line: loc.line + e.lineNumber - 1,
      column: loc.column + e.index - input.length,
    });
  }
};

const tokenizeInTag = ({ source, input, loc }: TokenizationContext) => {
  const output = [];
  const tokens = tokenizeUsingEsprima({ source, input, loc });

  const size = input.length;
  const length = tokens.length;
  let pos = 0;

  const endOfSource = (index: number) => index + 1 > length;
  const lookahead = () => (endOfSource(pos + 1) ? null : tokens[pos + 1]);

  while (!endOfSource(pos)) {
    const token = tokens[pos];

    const start: Loc = {
      line: loc.line - (token.loc.start.line - 1),
      column: loc.column - size + token.loc.start.column,
    };

    const end: Loc = {
      line: loc.line - (token.loc.end.line - 1),
      column: loc.column - size + token.loc.end.column - 1,
    };

    switch (token.type) {
      case 'Null':
        output.push(createToken('NULL', null, start, end));
        break;

      case 'String':
        output.push(
          createToken(
            'STRING',
            token.value.slice(1, token.value.length - 1),
            start,
            end,
          ),
        );
        break;

      case 'Boolean':
        output.push(createToken('BOOLEAN', token.value === 'true', start, end));
        break;

      case 'Numeric':
        if (token.value.startsWith('.')) {
          unexpected(source, loc);
        }
        output.push(
          createToken('NUMBER', parseNumeric(token.value), start, end),
        );
        break;

      case 'Identifier':
        switch (token.value) {
          case 'undefined':
            output.push(createToken('UNDEFINED', undefined, start, end));
            break;

          default:
            output.push(createToken('IDENT', token.value, start, end));
        }
        break;

      case 'Punctuator':
        switch (token.value) {
          case '+':
          case '-':
            const next = lookahead();
            if (next != null && next.type === 'Numeric') {
              output.push(
                createToken(
                  'NUMBER',
                  parseNumeric(`${token.value}${next.value}`),
                  {
                    line: loc.line - (next.loc.start.line - 1),
                    column: loc.column - size + next.loc.start.column - 1,
                  },
                  {
                    line: loc.line - (next.loc.end.line - 1),
                    column: loc.column - size + next.loc.end.column - 1,
                  },
                ),
              );
              pos++;
            } else {
              unexpected(source, loc);
            }
            break;

          case '|':
            output.push(createToken('PIPE', '|', start, end));
            break;

          case '.':
            output.push(createToken('DOT', '.', start, end));
            break;

          case '[':
            output.push(createToken('OPEN_BRACKET', '[', start, end));
            break;

          case ']':
            output.push(createToken('CLOSE_BRACKET', ']', start, end));
            break;

          default:
            unexpected(source, loc);
        }
        break;

      default:
        unexpected(source, loc);
    }

    pos++;
  }

  return output;
};

export const tokenize = (input: string): AnyToken[] => {
  const source = Array.from(input);
  const length = source.length;

  const loc: Loc = { line: 1, column: 1 };
  const output: AnyToken[] = [];
  const buffer: string[] = [];
  let bufLoc: Loc | null = null;
  let inTag = false;
  let pos = 0;

  const endOfSource = (index: number) => index + 1 > length;
  const lookahead = (n = 1) => (endOfSource(pos + n) ? '' : source[pos + n]);

  const buf2str = () => buffer.join('');

  const consumeBuffer = () => {
    if (buffer.length > 0) {
      output.push(
        createToken(
          'STRING',
          buf2str(),
          bufLoc != null
            ? bufLoc
            : {
                line: 1,
                column: 1,
              },
          { ...loc, column: loc.column - 1 },
        ),
      );
      buffer.length = 0;
      bufLoc = null;
    }
  };

  while (!endOfSource(pos)) {
    const str = source[pos];

    switch (str) {
      case '{':
        if (lookahead() === '{') {
          if (inTag) {
            unclosed(input, output);
          }

          inTag = true;
          consumeBuffer();
          pos++;
          loc.column++;

          if (lookahead() === '-') {
            output.push(
              createToken(
                'OPEN_TAG',
                '{{-',
                {
                  ...loc,
                  column: loc.column - 1,
                },
                {
                  ...loc,
                  column: loc.column + 1,
                },
              ),
            );
            pos++;
            loc.column++;
          } else {
            output.push(
              createToken(
                'OPEN_TAG',
                '{{',
                {
                  ...loc,
                  column: loc.column - 1,
                },
                {
                  ...loc,
                },
              ),
            );
          }
        } else {
          buffer.push(str);
        }
        break;

      case '-':
        if (lookahead() === '}' && lookahead(2) === '}') {
          const close = createToken(
            'CLOSE_TAG',
            '-}}',
            { ...loc },
            {
              ...loc,
              column: loc.column + 2,
            },
          );

          if (!inTag) {
            unopened(input, close);
          }

          inTag = false;
          output.push(
            ...tokenizeInTag({ source: input, input: buf2str(), loc }),
            close,
          );
          pos += 2;
          buffer.length = 0;
        } else {
          buffer.push(str);
        }
        break;

      case '}':
        if (lookahead() === '}') {
          const close = createToken(
            'CLOSE_TAG',
            '}}',
            { ...loc },
            {
              ...loc,
              column: loc.column + 1,
            },
          );

          if (!inTag) {
            unopened(input, close);
          }

          inTag = false;
          output.push(
            ...tokenizeInTag({ source: input, input: buf2str(), loc }),
            close,
          );
          pos++;
          loc.column++;
          buffer.length = 0;
        } else {
          buffer.push(str);
        }
        break;

      default:
        buffer.push(str);
    }

    if (str === '\n') {
      loc.line++;
      loc.column = 0;
    }

    loc.column++;
    pos++;
  }

  if (inTag) {
    unclosed(input, output);
  }

  consumeBuffer();

  return output;
};
