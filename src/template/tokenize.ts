import * as esprima from 'esprima';
import { AnyToken, createToken, TokenType, Loc, Token } from './tokens';
import { ErrorType, SyntaxError } from './error';

type EsprimaToken = {
  type: string;
  value: string;
  loc: {
    start: Loc;
    end: Loc;
  };
};

function unexpected(input: string, loc: Loc): never {
  throw new SyntaxError(ErrorType.UNEXPECTED, input, loc, loc);
}

const unclosed = (input: string, tokens: AnyToken[]) => {
  const open = tokens.find((token) => token.type === TokenType.OPEN_TAG);
  const err =
    open != null
      ? new SyntaxError(ErrorType.UNCLOSED, input, open.start, open.end)
      : new SyntaxError(ErrorType.UNCLOSED, input, { line: 1, column: 1 }, { line: 1, column: 1 });

  throw err;
};

const unopened = (input: string, token: Token<TokenType.CLOSE_TAG>) => {
  throw new SyntaxError(ErrorType.UNOPEND, input, token.start, token.end);
};

const parseNumeric = (value: string) => Number(value);

const tokenizeInTag = (source: string, input: string, loc: Loc) => {
  const output = [];
  let tokens: EsprimaToken[] = [];

  try {
    tokens = esprima.tokenize(input, { loc: true }) as any;
  } catch (e) {
    loc.line += e.lineNumber - 1;
    loc.column += e.index - input.length;
    unexpected(source, loc);
  }

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
        output.push(createToken(TokenType.NULL, null, start, end));
        break;

      case 'String':
        output.push(createToken(TokenType.STRING, token.value.slice(1, token.value.length - 1), start, end));
        break;

      case 'Boolean':
        output.push(createToken(TokenType.BOOLEAN, token.value === 'true', start, end));
        break;

      case 'Numeric':
        output.push(createToken(TokenType.NUMBER, parseNumeric(token.value), start, end));
        break;

      case 'Identifier':
        switch (token.value) {
          case 'undefined':
            output.push(createToken(TokenType.UNDEFINED, undefined, start, end));
            break;

          default:
            output.push(createToken(TokenType.IDENT, token.value, start, end));
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
                  TokenType.NUMBER,
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
            output.push(createToken(TokenType.PIPE, '|', start, end));
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

export const tokenize = (input: string) => {
  const source = Array.from(input);
  const length = source.length;

  const loc: Loc = { line: 1, column: 1 };
  let output: AnyToken[] = [];
  let buffer: string[] = [];
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
          TokenType.STRING,
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
      buffer = [];
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
                TokenType.OPEN_TAG,
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
                TokenType.OPEN_TAG,
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
            TokenType.CLOSE_TAG,
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
          output = [...output, ...tokenizeInTag(input, buf2str(), loc), close];
          pos += 2;
          buffer = [];
        } else {
          buffer.push(str);
        }
        break;

      case '}':
        if (lookahead() === '}') {
          const close = createToken(
            TokenType.CLOSE_TAG,
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
          output = [...output, ...tokenizeInTag(input, buf2str(), loc), close];
          pos++;
          loc.column++;
          buffer = [];
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
