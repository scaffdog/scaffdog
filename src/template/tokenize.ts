import * as esprima from 'esprima';
import { AnyToken, createToken, TokenType } from './tokens';

// TODO More appropriate error message
const unexpected = () => {
  throw new Error('unexpected token');
};

const unclosed = () => {
  throw new Error('unclosing tag');
};

const unopened = () => {
  throw new Error('unopened tag');
};

const parseNumeric = (value: string) => Number(value);

const tokenizeInTag = (input: string) => {
  const output = [];
  const tokens = esprima.tokenize(input);
  const length = tokens.length;
  let pos = 0;

  const endOfSource = (index: number) => index + 1 > length;
  const lookahead = () => (endOfSource(pos + 1) ? null : tokens[pos + 1]);

  while (!endOfSource(pos)) {
    const token = tokens[pos];

    switch (token.type) {
      case 'Null':
        output.push(createToken(TokenType.NULL, null));
        break;

      case 'String':
        output.push(createToken(TokenType.STRING, token.value.slice(1, token.value.length - 1)));
        break;

      case 'Boolean':
        output.push(createToken(TokenType.BOOLEAN, token.value === 'true'));
        break;

      case 'Numeric':
        output.push(createToken(TokenType.NUMBER, parseNumeric(token.value)));
        break;

      case 'Identifier':
        switch (token.value) {
          case 'undefined':
            output.push(createToken(TokenType.UNDEFINED, undefined));
            break;

          default:
            output.push(createToken(TokenType.IDENT, token.value));
        }
        break;

      case 'Punctuator':
        switch (token.value) {
          case '+':
          case '-':
            const next = lookahead();
            if (next != null && next.type === 'Numeric') {
              output.push(createToken(TokenType.NUMBER, parseNumeric(`${token.value}${next.value}`)));
              pos++;
            } else {
              unexpected();
            }
            break;

          case '|':
            output.push(createToken(TokenType.PIPE, '|'));
            break;

          default:
            unexpected();
        }
        break;

      default:
        unexpected();
    }

    pos++;
  }

  return output;
};

export const tokenize = (input: string) => {
  const source = Array.from(input);
  const length = source.length;

  let output: AnyToken[] = [];
  let buffer: string[] = [];
  let inTag = false;
  let pos = 0;

  const endOfSource = (index: number) => index + 1 > length;
  const lookahead = (n: number = 1) => (endOfSource(pos + n) ? '' : source[pos + n]);

  const buf2str = () => buffer.join('');

  const consumeBuffer = () => {
    if (buffer.length > 0) {
      output.push(createToken(TokenType.STRING, buf2str()));
      buffer = [];
    }
  };

  while (!endOfSource(pos)) {
    const str = source[pos];

    switch (str) {
      case '{':
        if (lookahead() === '{') {
          if (inTag) {
            unclosed();
          }

          inTag = true;
          consumeBuffer();
          pos++;

          if (lookahead() === '-') {
            output.push(createToken(TokenType.OPEN_TAG, '{{-'));
            pos++;
          } else {
            output.push(createToken(TokenType.OPEN_TAG, '{{'));
          }
        } else {
          buffer.push(str);
        }
        break;

      case '-':
        if (lookahead() === '}' && lookahead(2) === '}') {
          if (!inTag) {
            unopened();
          }

          inTag = false;
          output = [...output, ...tokenizeInTag(buf2str()), createToken(TokenType.CLOSE_TAG, '-}}')];
          pos += 2;
          buffer = [];
        } else {
          buffer.push(str);
        }
        break;

      case '}':
        if (lookahead() === '}') {
          if (!inTag) {
            unopened();
          }

          inTag = false;
          output = [...output, ...tokenizeInTag(buf2str()), createToken(TokenType.CLOSE_TAG, '}}')];
          pos++;
          buffer = [];
        } else {
          buffer.push(str);
        }
        break;

      default:
        buffer.push(str);
    }

    pos++;
  }

  if (inTag) {
    unclosed();
  }

  consumeBuffer();

  return output;
};
