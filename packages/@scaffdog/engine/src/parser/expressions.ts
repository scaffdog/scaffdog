/* eslint-disable @typescript-eslint/no-use-before-define */
import type { SourceRange } from '@scaffdog/types';
import type {
  ArgumentList,
  BinaryExpressionOperandKind,
  CallExpression,
  Comment,
  ConditionalExpression,
  ExpressionKind,
  Identifier,
  LeftHandSideExpressionKind,
  LogicalExpressionOperandKind,
  MemberExpression,
  ParenthesizedExpression,
  PipeArgumentList,
  PipeBodyKind,
  PipeHeadKind,
  PrimaryExpressionKind,
  StaticMemberAccessorKind,
  UnaryExpression,
  UnaryExpressionOperator,
  UpdateExpression,
} from '../ast.js';
import {
  createBinaryExpression,
  createCallExpression,
  createConditionalExpression,
  createIdentifier,
  createLogicalExpression,
  createMemberExpression,
  createParenthesizedExpression,
  createUnaryExpression,
  createUpdateExpression,
} from '../ast.js';
import {
  attempt,
  char,
  choice,
  concat,
  cut,
  expected,
  list,
  many,
  many1,
  map,
  not,
  option,
  peek,
  preceded,
  satisfy,
  string,
} from './combinators.js';
import { whitespaceOrComment } from './comments.js';
import { literal, numericLiteral, tagClose } from './literals.js';
import { whitespace1 } from './spaces.js';
import type { ParseData, Parser, ParseResult, ParseState } from './types.js';
import { error, success } from './types.js';
import { unicodeIdContinueReg, unicodeIdStartReg } from './unicode-regex.js';

// identifier
const unicodeIdStart: Parser<string> = satisfy((c) =>
  unicodeIdStartReg.test(c),
);
const unicodeIdContinue: Parser<string> = satisfy((c) =>
  unicodeIdContinueReg.test(c),
);

const identifierStart: Parser<string> = choice([
  char('$'),
  char('_'),
  unicodeIdStart,
]);

const identifierPart: Parser<string> = choice([
  char('$'),
  char('_'),
  unicodeIdContinue,
]);

const reservedWord: Parser<string> = choice([
  attempt(string('null')),
  attempt(string('undefined')),
  attempt(string('true')),
  attempt(string('false')),
  attempt(string('if')),
  attempt(string('else')),
  attempt(string('for')),
  attempt(string('break')),
  attempt(string('continue')),
  string('end'),
]);

const identifierName: Parser<string> = map(
  expected(
    concat([identifierStart, many(choice([identifierStart, identifierPart]))]),
    'Invalid identifier name',
  ),
  ([first, rest]) => [first, ...rest].join(''),
);

export const identifier: Parser<Identifier> = (state) => {
  const r1 = identifierName(state);
  if (r1.type === 'error') {
    return r1;
  }

  const r2 = reservedWord(state);
  if (r2.type === 'success' && r1.data === r2.data) {
    return error('error', false, {
      ...r2.state,
      errors: r2.state.errors.append({
        message: `"${r2.data}" is a reserved word and cannot be used as an identifier`,
        range: [state.offset, r2.state.offset - 1],
      }),
    });
  }

  return success(
    createIdentifier(r1.data, [state.offset, r1.state.offset - 1]),
    true,
    r1.state,
  );
};

// primaryExpression
export const primaryExpression: Parser<PrimaryExpressionKind> = choice([
  attempt(literal),
  attempt(identifier),
  parenthesizedExpression,
]);

// memberExpression
const staticMemberAccessor: Parser<StaticMemberAccessorKind> = choice([
  attempt(identifier),
  numericLiteral,
]);

export function memberExpression(
  state: ParseState,
): ParseResult<MemberExpression | PrimaryExpressionKind> {
  return map(
    concat([
      primaryExpression,
      many(
        choice([
          attempt(
            map(
              preceded(
                char('.'),
                cut(expected(staticMemberAccessor, 'Missing member property')),
              ),
              (p) => [p, false] as const,
            ),
          ),
          map(
            concat([
              char('['),
              whitespaceOrComment,
              cut(expected(expression, 'Missing expression after "["')),
              whitespaceOrComment,
              cut(expected(char(']'), 'Missing "]"')),
            ]),
            ([, leading, expr, trailing]) =>
              [
                {
                  ...expr,
                  leadingComments: [...expr.leadingComments, ...leading],
                  trailingComments: [...expr.trailingComments, ...trailing],
                },
                true,
              ] as const,
          ),
        ]),
      ),
    ]),
    ([obj, props]) => {
      if (props.length === 0) {
        return obj;
      }
      return props
        .slice(1)
        .reduce<MemberExpression | PrimaryExpressionKind>(
          (acc, [expr, computed]) =>
            createMemberExpression(acc, expr, computed),
          createMemberExpression(obj, props[0]![0], props[0]![1]),
        );
    },
  )(state);
}

// leftHandSideExpression
const leftHandSideExpression: Parser<LeftHandSideExpressionKind> = choice([
  attempt(callExpression),
  memberExpression,
]);

// updateExpression
const incrementOperator: Parser<'++'> = string('++');
const decrementOperator: Parser<'--'> = string('--');

export const updateExpression: Parser<
  UpdateExpression | LeftHandSideExpressionKind
> = (state) => {
  const r = choice([
    attempt(
      map(
        concat([
          choice([incrementOperator, decrementOperator]),
          cut(
            expected(
              leftHandSideExpression,
              'Missing left-hand side expression',
            ),
          ),
        ]),
        ([op, arg]) => createUpdateExpression(arg, op, true),
      ),
    ),
    map(
      concat([
        leftHandSideExpression,
        option(choice([incrementOperator, decrementOperator])),
      ]),
      ([arg, op]) =>
        op.state === 'some'
          ? createUpdateExpression(arg, op.value, false)
          : arg,
    ),
  ])(state);

  if (r.type === 'success' && r.data.type === 'UpdateExpression') {
    const valid = (function check(
      node: UpdateExpression | LeftHandSideExpressionKind,
    ): boolean {
      switch (node.type) {
        case 'Identifier':
        case 'MemberExpression':
          return true;
        case 'ParenthesizedExpression':
          switch (node.expression.type) {
            case 'Identifier':
            case 'MemberExpression':
            case 'ParenthesizedExpression':
              return check(node.expression);
            default:
              return false;
          }
        default:
          return false;
      }
    })(r.data.argument);

    if (!valid) {
      return error('failure', true, {
        ...r.state,
        errors: r.state.errors.append({
          message: 'Invalid left-hand side expression in prefix operation',
          range: [state.offset, r.state.offset - 1],
        }),
      });
    }
  }

  return r;
};

// unaryExpression
const unaryExpressionOperator: Parser<UnaryExpressionOperator> = choice([
  char('+'),
  char('-'),
  char('~'),
  char('!'),
]);

export const unaryExpression: Parser<
  UnaryExpression | UpdateExpression | LeftHandSideExpressionKind
> = (state) => {
  return choice([
    updateExpression,
    map(
      many1(
        concat([
          preceded(peek(not(tagClose)), unaryExpressionOperator),
          choice([updateExpression, unaryExpression]),
        ]),
      ),
      ([[op, arg]]) => createUnaryExpression(op, arg),
    ),
  ])(state);
};

// binaryExpression
type OperatorFn = <T extends string>(op: T) => Parser<T>;
const operator: OperatorFn = (op) =>
  preceded(not(peek(tagClose)), op.length === 1 ? char(op) : string(op));

// NOTE: v3
type BinaryExpressionFn = <T extends Parser<any>, U extends Parser<any>, V>(
  expr: T,
  operators: U,
  factory: (left: V, op: ParseData<U>, right: ParseData<T>) => V,
) => Parser<V>;
const binaryExpression: BinaryExpressionFn = (expr, operators, factory) =>
  map(
    concat([
      expr,
      option(
        preceded(
          peek(concat([whitespaceOrComment, operators])),
          concat([
            whitespaceOrComment,
            many(
              map(
                concat([
                  operators,
                  whitespaceOrComment,
                  cut(expected(expr, 'Missing right operand')),
                  whitespaceOrComment,
                ]),
                ([op, leading, operand, trailing]) =>
                  [
                    op,
                    {
                      ...operand,
                      leadingComments: [...operand.leadingComments, ...leading],
                      trailingComments: [
                        ...operand.trailingComments,
                        ...trailing,
                      ],
                    },
                  ] as const,
              ),
            ),
          ]),
        ),
      ),
    ]),
    ([left, opt]) => {
      if (opt.state === 'none') {
        return left;
      }

      const [trailing, rest] = opt.value;

      return rest.reduce<ReturnType<typeof factory>>(
        (acc, [op, right]) => factory(acc, op, right),
        { ...left, trailingComments: [...left.trailingComments, ...trailing] },
      );
    },
  );

export const multiplicativeExpression: Parser<BinaryExpressionOperandKind> =
  binaryExpression(
    unaryExpression,
    choice([operator('*'), operator('/'), operator('%')]),
    createBinaryExpression,
  );

export const additiveExpression: Parser<BinaryExpressionOperandKind> =
  binaryExpression(
    multiplicativeExpression,
    choice([operator('+'), operator('-')]),
    createBinaryExpression,
  );

export const relationalExpression: Parser<BinaryExpressionOperandKind> =
  binaryExpression(
    additiveExpression,
    choice([
      attempt(operator('<=')),
      attempt(operator('>=')),
      operator('<'),
      operator('>'),
    ]),
    createBinaryExpression,
  );

export const equalityExpression: Parser<BinaryExpressionOperandKind> =
  binaryExpression(
    relationalExpression,
    choice([operator('=='), operator('!=')]),
    createBinaryExpression,
  );

// logicalExpression
export const logicalANDExpression: Parser<LogicalExpressionOperandKind> =
  binaryExpression(equalityExpression, operator('&&'), createLogicalExpression);

export const logicalORExpression: Parser<LogicalExpressionOperandKind> =
  binaryExpression(
    logicalANDExpression,
    attempt(operator('||')), // May be pipe delimiter
    createLogicalExpression,
  );

// conditionalExpression
export const conditionalExpression: Parser<
  ConditionalExpression | LogicalExpressionOperandKind
> = (state) => {
  return map(
    concat([
      logicalORExpression,
      option(
        preceded(
          peek(concat([whitespaceOrComment, char('?')])),
          cut(
            concat([
              whitespaceOrComment,
              char('?'),
              map(
                concat([
                  whitespaceOrComment,
                  expected(conditionalExpression, 'Missing expression'),
                  whitespaceOrComment,
                ]),
                ([leading, cond, trailing]) => ({
                  ...cond,
                  leadingComments: [...cond.leadingComments, ...leading],
                  trailingComments: [...cond.trailingComments, ...trailing],
                }),
              ),
              expected(char(':'), '":" expected after expression'),
              map(
                concat([
                  whitespaceOrComment,
                  expected(
                    conditionalExpression,
                    'Missing expression after ":"',
                  ),
                ]),
                ([leading, cond]) => ({
                  ...cond,
                  leadingComments: [...cond.leadingComments, ...leading],
                }),
              ),
            ]),
          ),
        ),
      ),
    ]),
    ([test, opt]) => {
      if (opt.state === 'none') {
        return test;
      }

      const [trailing, , consequent, , alternate] = opt.value;

      return createConditionalExpression(
        {
          ...test,
          trailingComments: [...test.trailingComments, ...trailing],
        },
        consequent,
        alternate,
      );
    },
  )(state);
};

// callExpression
const argumentList: Parser<ArgumentList> = list(
  map(
    concat([whitespaceOrComment, conditionalExpression, whitespaceOrComment]),
    ([leading, expr, trailing]) => ({
      ...expr,
      leadingComments: [...expr.leadingComments, ...leading],
      trailingComments: [...expr.trailingComments, ...trailing],
    }),
  ),
  char(','),
);

const parseArguments: Parser<{
  args: ArgumentList;
  range: SourceRange;
  comments: readonly Comment[];
}> = map(
  concat([
    char('('),
    choice([
      attempt(
        map(argumentList, (args) => ({
          args,
          comments: [],
        })),
      ),
      map(whitespaceOrComment, (comments) => ({
        args: [],
        comments,
      })),
    ]),
    cut(expected(char(')'), 'Missing ")" after function call')),
  ]),
  ([, { args, comments }], range) => ({
    args,
    range,
    comments,
  }),
);

const callExpressionCallee: Parser<CallExpression> = map(
  concat([memberExpression, many1(parseArguments)]),
  ([callee, [first, ...rest]]) => {
    return rest.reduce<CallExpression>(
      (acc, cur) =>
        createCallExpression(acc, cur.args, false, [
          acc.range[0],
          cur.range[1],
        ]),
      createCallExpression(
        callee,
        first!.args,
        false,
        [callee.range[0], first!.range[1]],
        [],
        first!.comments,
      ),
    );
  },
);

export function callExpression(
  state: ParseState,
): ParseResult<CallExpression | MemberExpression> {
  return map(
    concat([
      callExpressionCallee,
      many(
        choice([
          attempt(
            map(
              preceded(
                char('.'),
                cut(expected(staticMemberAccessor, 'Missing member property')),
              ),
              (p) => [p, false] as const,
            ),
          ),
          map(
            concat([
              char('['),
              whitespaceOrComment,
              cut(expected(expression, 'Missing expression after "["')),
              whitespaceOrComment,
              cut(expected(char(']'), 'Missing "]"')),
            ]),
            ([, leading, expr, trailing]) =>
              [
                {
                  ...expr,
                  leadingComments: [...expr.leadingComments, ...leading],
                  trailingComments: [...expr.trailingComments, ...trailing],
                },
                true,
              ] as const,
          ),
        ]),
      ),
    ]),
    ([callee, props]) => {
      if (props.length === 0) {
        return callee;
      }
      return props
        .slice(1)
        .reduce(
          (acc, [expr, computed]) =>
            createMemberExpression(acc, expr, computed),
          createMemberExpression(callee, props[0]![0], props[0]![1]),
        );
    },
  )(state);
}

// pipeExpression
const pipeArgumentList: Parser<PipeArgumentList> = (state) =>
  many(preceded(whitespace1, unaryExpression))(state);

const pipeHeadCallee: Parser<PipeHeadKind> = choice([
  attempt(conditionalExpression),
  leftHandSideExpression,
]);

const pipeHead: Parser<CallExpression | PipeHeadKind> = map(
  concat([pipeHeadCallee, pipeArgumentList]),
  ([callee, args], range) =>
    args.length < 1 ? callee : createCallExpression(callee, args, true, range),
);

const pipeBody: Parser<CallExpression | PipeBodyKind> = map(
  concat([memberExpression, pipeArgumentList]),
  ([callee, args], range) =>
    args.length < 1 ? callee : createCallExpression(callee, args, true, range),
);

export const pipeExpression: Parser<CallExpression | PipeHeadKind> = map(
  concat([
    map(concat([pipeHead, whitespaceOrComment]), ([head, trailing]) => ({
      ...head,
      trailingComments: [...head.trailingComments, ...trailing],
    })),
    many(
      map(
        concat([
          char('|'),
          whitespaceOrComment,
          expected(pipeBody, 'Missing argument after pipe delimiter'),
          whitespaceOrComment,
        ]),
        ([, leading, body, trailing]) => ({
          ...body,
          leadingComments: [...body.leadingComments, ...leading],
          trailingComments: [...body.trailingComments, ...trailing],
        }),
      ),
    ),
  ]),
  ([head, rest]) => {
    if (rest.length === 0) {
      return head;
    }
    return rest.reduce<CallExpression | PipeHeadKind>((acc, cur) => {
      if (cur.type === 'CallExpression') {
        return {
          ...cur,
          args: [acc, ...cur.args],
          range: [acc.range[0], cur.range[1]],
        };
      } else {
        return createCallExpression(cur, [acc], true, [
          acc.range[0],
          cur.range[1],
        ]);
      }
    }, head);
  },
);

export function parenthesizedExpression(
  state: ParseState,
): ParseResult<ParenthesizedExpression> {
  return map(
    concat([
      char('('),
      whitespaceOrComment,
      expression,
      whitespaceOrComment,
      cut(expected(char(')'), 'Missing ")" after expression')),
    ]),
    ([, leading, expr, trailing], r) =>
      createParenthesizedExpression(expr, r, leading, trailing),
  )(state);
}

export function expression(state: ParseState): ParseResult<ExpressionKind> {
  return pipeExpression(state);
}
