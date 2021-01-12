import * as esprima from 'esprima';
import { error } from '@scaffdog/error';
import type { SourceLocation, SourcePosition } from '@scaffdog/types';
import type { AnyToken, Token } from './tokens';
import { createToken } from './tokens';

type EsprimaToken = {
  type: string;
  value: string;
  loc: SourceLocation;
};

function unexpected(input: string, loc: SourceLocation): never {
  throw error(`unexpected token`, {
    source: input,
    loc,
  });
}

const unclosed = (input: string, tokens: AnyToken[]) => {
  const tags = tokens.filter((token) => token.type === 'OPEN_TAG');
  const last = tags.length > 0 ? tags[tags.length - 1] : null;

  throw error('unclosed tag', {
    source: input,
    loc:
      last != null
        ? last.loc
        : {
            start: { line: 1, column: 1 },
            end: { line: 1, column: 1 },
          },
  });
};

const unopened = (input: string, token: Token<'CLOSE_TAG'>) => {
  throw error('unopend tag', {
    source: input,
    loc: token.loc,
  });
};

const parseNumeric = (value: string) => Number(value);

type TokenizationContext = {
  source: string;
  input: string;
  pos: SourcePosition;
};

const tokenizeUsingEsprima = ({ source, input, pos }: TokenizationContext) => {
  try {
    return esprima.tokenize(input, { loc: true }) as EsprimaToken[];
  } catch (e) {
    const p = {
      line: pos.line + e.lineNumber - 1,
      column: pos.column + e.index - input.length,
    };

    unexpected(source, {
      start: p,
      end: p,
    });
  }
};

const tokenizeInTag = ({ source, input, pos }: TokenizationContext) => {
  const output = [];
  const tokens = tokenizeUsingEsprima({ source, input, pos });

  const size = input.length;
  const length = tokens.length;
  let i = 0;

  const endOfSource = (index: number) => index + 1 > length;
  const lookahead = () => (endOfSource(i + 1) ? null : tokens[i + 1]);

  while (!endOfSource(i)) {
    const token = tokens[i];

    const loc: SourceLocation = {
      start: {
        line: pos.line - (token.loc.start.line - 1),
        column: pos.column - size + token.loc.start.column,
      },
      end: {
        line: pos.line - (token.loc.end.line - 1),
        column: pos.column - size + token.loc.end.column - 1,
      },
    };

    switch (token.type) {
      case 'Null':
        output.push(createToken('NULL', null, loc));
        break;

      case 'String':
        output.push(
          createToken(
            'STRING',
            token.value.slice(1, token.value.length - 1),
            loc,
          ),
        );
        break;

      case 'Boolean':
        output.push(createToken('BOOLEAN', token.value === 'true', loc));
        break;

      case 'Numeric':
        if (token.value.startsWith('.')) {
          unexpected(source, loc);
        }
        output.push(createToken('NUMBER', parseNumeric(token.value), loc));
        break;

      case 'Identifier':
        switch (token.value) {
          case 'undefined':
            output.push(createToken('UNDEFINED', undefined, loc));
            break;

          default:
            output.push(createToken('IDENT', token.value, loc));
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
                    start: {
                      line: pos.line - (next.loc.start.line - 1),
                      column: pos.column - size + next.loc.start.column - 1,
                    },
                    end: {
                      line: pos.line - (next.loc.end.line - 1),
                      column: pos.column - size + next.loc.end.column - 1,
                    },
                  },
                ),
              );
              i++;
            } else {
              unexpected(source, loc);
            }
            break;

          case '|':
            output.push(createToken('PIPE', '|', loc));
            break;

          case '.':
            output.push(createToken('DOT', '.', loc));
            break;

          case '[':
            output.push(createToken('OPEN_BRACKET', '[', loc));
            break;

          case ']':
            output.push(createToken('CLOSE_BRACKET', ']', loc));
            break;

          default:
            unexpected(source, loc);
        }
        break;

      default:
        unexpected(source, loc);
    }

    i++;
  }

  return output;
};

export const tokenize = (input: string): AnyToken[] => {
  const source = Array.from(input);
  const length = source.length;

  const pos: SourcePosition = { line: 1, column: 1 };
  const output: AnyToken[] = [];
  const buf: string[] = [];
  let bufPos: SourcePosition | null = null;
  let inTag = false;
  let i = 0;

  const endOfSource = (index: number) => index + 1 > length;
  const lookahead = (n = 1) => (endOfSource(i + n) ? '' : source[i + n]);

  const buf2str = () => buf.join('');

  const consumeBuffer = () => {
    if (buf.length > 0) {
      output.push(
        createToken('STRING', buf2str(), {
          start:
            bufPos != null
              ? bufPos
              : {
                  line: 1,
                  column: 1,
                },
          end: {
            ...pos,
            column: pos.column - 1,
          },
        }),
      );
      buf.length = 0;
      bufPos = null;
    }
  };

  while (!endOfSource(i)) {
    const str = source[i];

    switch (str) {
      case '{':
        if (lookahead() === '{') {
          if (inTag) {
            unclosed(input, output);
          }

          inTag = true;
          consumeBuffer();
          i++;
          pos.column++;

          if (lookahead() === '-') {
            output.push(
              createToken('OPEN_TAG', '{{-', {
                start: {
                  ...pos,
                  column: pos.column - 1,
                },
                end: {
                  ...pos,
                  column: pos.column + 1,
                },
              }),
            );
            i++;
            pos.column++;
          } else {
            output.push(
              createToken('OPEN_TAG', '{{', {
                start: {
                  ...pos,
                  column: pos.column - 1,
                },
                end: {
                  ...pos,
                },
              }),
            );
          }
        } else {
          buf.push(str);
        }
        break;

      case '-':
        if (lookahead() === '}' && lookahead(2) === '}') {
          const close = createToken('CLOSE_TAG', '-}}', {
            start: {
              ...pos,
            },
            end: {
              ...pos,
              column: pos.column + 2,
            },
          });

          if (!inTag) {
            unopened(input, close);
          }

          inTag = false;
          output.push(
            ...tokenizeInTag({ source: input, input: buf2str(), pos }),
            close,
          );
          i += 2;
          buf.length = 0;
        } else {
          buf.push(str);
        }
        break;

      case '}':
        if (lookahead() === '}') {
          const close = createToken('CLOSE_TAG', '}}', {
            start: {
              ...pos,
            },
            end: {
              ...pos,
              column: pos.column + 1,
            },
          });

          if (!inTag) {
            unopened(input, close);
          }

          inTag = false;
          output.push(
            ...tokenizeInTag({ source: input, input: buf2str(), pos }),
            close,
          );
          i++;
          pos.column++;
          buf.length = 0;
        } else {
          buf.push(str);
        }
        break;

      default:
        buf.push(str);
    }

    if (str === '\n') {
      pos.line++;
      pos.column = 0;
    }

    pos.column++;
    i++;
  }

  if (inTag) {
    unclosed(input, output);
  }

  consumeBuffer();

  return output;
};
