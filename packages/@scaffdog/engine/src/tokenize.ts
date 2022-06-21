import { error } from '@scaffdog/error';
import type { SourceLocation, SourcePosition, TagPair } from '@scaffdog/types';
import * as esprima from 'esprima';
import { defaults } from './syntax';
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
    return esprima.tokenize(input, {
      loc: true,
      comment: true,
    }) as EsprimaToken[];
  } catch (e) {
    const p = {
      line: pos.line + (e as any).lineNumber - 1,
      column: pos.column + (e as any).index - input.length,
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
      case 'BlockComment':
        output.push(createToken('COMMENT', token.value, loc));
        break;

      case 'Null':
        output.push(createToken('NULL', null, loc));
        break;

      case 'String':
        output.push(
          createToken(
            'STRING',
            {
              quote: token.value[0],
              value: token.value.slice(1, token.value.length - 1),
            },
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

export type TokenizeOptions = {
  tags: TagPair;
};

export const tokenize = (
  input: string,
  options?: Partial<TokenizeOptions>,
): AnyToken[] => {
  const opts = {
    tags: defaults.tags,
    ...(options ?? {}),
  };

  const tag = {
    open: {
      value: opts.tags[0],
      length: opts.tags[0].length,
    },
    close: {
      value: opts.tags[1],
      length: opts.tags[1].length,
    },
  };

  const source = Array.from(input);
  const length = source.length;

  const pos: SourcePosition = { line: 1, column: 1 };
  const output: AnyToken[] = [];
  const buf: string[] = [];
  let bufPos: SourcePosition | null = null;
  let i = 0;

  const state: {
    tag: boolean;
    string: string | null;
  } = {
    tag: false,
    string: null,
  };

  const endOfSource = (index: number) => index + 1 > length;
  const lookahead = (n = 1) => (endOfSource(i + n) ? '' : source[i + n]);

  const range = (index: number, relative: number) => {
    const end = index + relative;
    return endOfSource(end - 1) ? '' : source.slice(index, end).join('');
  };

  const buf2str = () => buf.join('');

  const consumeBuffer = () => {
    if (buf.length > 0) {
      output.push(
        createToken(
          'STRING',
          {
            quote: '',
            value: buf2str(),
          },
          {
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
          },
        ),
      );
      buf.length = 0;
      bufPos = null;
    }
  };

  while (!endOfSource(i)) {
    const str = source[i];
    const open = range(i, tag.open.length);
    const close = range(i, tag.close.length);

    if (open === tag.open.value && state.string == null) {
      if (state.tag) {
        unclosed(input, output);
      }

      state.tag = true;
      consumeBuffer();
      i += tag.open.length - 1;
      pos.column += tag.open.length - 1;

      const trim = lookahead() === '-';

      output.push(
        createToken('OPEN_TAG', open + (trim ? '-' : ''), {
          start: {
            ...pos,
            column: pos.column - (tag.open.length - 1),
          },
          end: {
            ...pos,
            column: pos.column + (trim ? 1 : 0),
          },
        }),
      );

      i += trim ? 1 : 0;
      pos.column += trim ? 1 : 0;
    } else if (close === tag.close.value && state.string == null) {
      const token = createToken('CLOSE_TAG', close, {
        start: {
          ...pos,
        },
        end: {
          ...pos,
          column: pos.column + (tag.close.length - 1),
        },
      });

      if (!state.tag) {
        unopened(input, token);
      }

      state.tag = false;
      output.push(
        ...tokenizeInTag({ source: input, input: buf2str(), pos }),
        token,
      );

      i += tag.close.length - 1;
      pos.column += tag.close.length - 1;
      buf.length = 0;
    } else if (str === '-') {
      const s = range(i + 1, tag.close.length);
      if (s === tag.close.value) {
        const token = createToken('CLOSE_TAG', `-${s}`, {
          start: {
            ...pos,
          },
          end: {
            ...pos,
            column: pos.column + tag.open.length,
          },
        });

        if (!state.tag) {
          unopened(input, token);
        }

        state.tag = false;
        output.push(
          ...tokenizeInTag({ source: input, input: buf2str(), pos }),
          token,
        );
        i += tag.close.length;
        pos.column += tag.close.length;
        buf.length = 0;
      } else {
        buf.push(str);
      }
    } else if (str === '"' || str === "'") {
      if (state.tag) {
        if (state.string == null) {
          state.string = str;
        } else if (state.string === str) {
          state.string = null;
        }
      }
      buf.push(str);
    } else {
      buf.push(str);
    }

    if (str === '\n') {
      pos.line++;
      pos.column = 0;
    }

    pos.column++;
    i++;
  }

  if (state.tag) {
    unclosed(input, output);
  }

  consumeBuffer();

  return output;
};
