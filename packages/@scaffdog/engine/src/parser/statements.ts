/* eslint-disable @typescript-eslint/no-use-before-define */
import type {
  BreakStatement,
  ContinueStatement,
  EndStatement,
  ExpressionKind,
  ExpressionStatement,
  ForStatement,
  Identifier,
  IfStatement,
  RawTemplate,
  StatementKind,
  Tag,
  TagTemplate,
  Template,
  TemplateElementKind,
  VariableStatement,
} from '../ast';
import {
  createBreakStatement,
  createContinueStatement,
  createEndStatement,
  createExpressionStatement,
  createForStatement,
  createIfStatement,
  createRawTemplate,
  createTagTemplate,
  createVariableStatement,
} from '../ast';
import {
  any,
  attempt,
  char,
  choice,
  concat,
  cut,
  diff,
  expected,
  label,
  many,
  many1,
  manyTill,
  map,
  option,
  preceded,
  string,
} from './combinators';
import { whitespaceOrComment } from './comments';
import { expression, identifier } from './expressions';
import { tagClose, tagOpen } from './literals';
import type { Option, Parser, ParseResult, ParseState } from './types';

// end, continue, break
export const endStatement: Parser<EndStatement> = map(string('end'), (_, r) =>
  createEndStatement(r),
);

export const continueStatement: Parser<ContinueStatement> = map(
  string('continue'),
  (_, r) => createContinueStatement(r),
);

export const breakStatement: Parser<BreakStatement> = map(
  string('break'),
  (_, r) => createBreakStatement(r),
);

// variable
export const variableStatement: Parser<VariableStatement> = map(
  concat([
    identifier,
    whitespaceOrComment,
    string(':='),
    whitespaceOrComment,
    cut(expected(expression, 'Missing expression after ":="')),
  ]),
  ([left, trailing, , leading, right]) =>
    createVariableStatement(
      {
        ...left,
        trailingComments: [...left.trailingComments, ...trailing],
      },
      {
        ...right,
        leadingComments: [...right.leadingComments, ...leading],
      },
    ),
);

// if
export const ifStatement: Parser<IfStatement> = (state) => {
  const $head: Parser<[ExpressionKind, Tag]> = map(
    concat([
      string('if'),
      whitespaceOrComment,
      cut(expected(expression, 'Missing expression after "if" keyword')),
      whitespaceOrComment,
      cut(expected(tagClose, `Missing "${state.tags[1]}"`)),
    ]),
    ([, leading, expr, trailing, close]) => [
      {
        ...expr,
        leadingComments: [...expr.leadingComments, ...leading],
        trailingComments: [...expr.trailingComments, ...trailing],
      },
      close,
    ],
  );

  const $end: Parser<Tag> = map(
    concat([tagOpen, whitespaceOrComment, endStatement]),
    ([open, trailing]) => ({
      ...open,
      trailingComments: [...open.trailingComments, ...trailing],
    }),
  );

  const $else: Parser<Tag> = map(
    concat([tagOpen, whitespaceOrComment, string('else')]),
    ([open, leading]) => ({
      ...open,
      leadingComments: [...open.leadingComments, ...leading],
    }),
  );

  // FIXME Error handling
  return choice([
    // if <expr> }}<template>?{{ end
    attempt(
      map(
        concat([$head, manyTill(templateBody, $end)]),
        ([[test, ifClose], [consequent, endOpen]], range) =>
          createIfStatement(
            test,
            consequent,
            null,
            {
              ifClose,
              endOpen,
              elseOpen: null,
              elseClose: null,
            },
            range,
          ),
      ),
    ),
    // if <expr> }}<template>?{{ else }}<template>?{{ end
    attempt(
      map(
        concat([
          $head,
          manyTill(templateBody, $else),
          whitespaceOrComment,
          tagClose,
          manyTill(templateBody, $end),
        ]),
        (
          [
            [test, ifClose],
            [consequent, elseOpen],
            leading,
            elseClose,
            [alternate, endOpen],
          ],
          range,
        ) =>
          createIfStatement(
            test,
            consequent,
            alternate,
            {
              ifClose,
              elseOpen,
              elseClose: {
                ...elseClose,
                leadingComments: [...elseClose.leadingComments, ...leading],
              },
              endOpen,
            },
            range,
          ),
      ),
    ),
    // if <expr> }}<template>?{{ else <ifstatement>
    map(
      concat([
        $head,
        manyTill(templateBody, $else),
        whitespaceOrComment,
        ifStatement,
      ]),
      ([[test, ifClose], [consequent, elseOpen], leading, alternate], range) =>
        createIfStatement(
          test,
          consequent,
          {
            ...alternate,
            leadingComments: [...alternate.leadingComments, ...leading],
          },
          {
            ifClose,
            elseOpen,
            elseClose: null,
            endOpen: null,
          },
          range,
        ),
    ),
  ])(state);
};

// for
const forBinding: Parser<[Identifier, Option<Identifier>]> = map(
  concat([
    map(concat([identifier, whitespaceOrComment]), ([ident, trailing]) => ({
      ...ident,
      trailingComments: [...ident.trailingComments, ...trailing],
    })),
    option(
      map(
        preceded(char(','), concat([whitespaceOrComment, identifier])),
        ([leading, ident]) => ({
          ...ident,
          leadingComments: [...ident.leadingComments, ...leading],
        }),
      ),
    ),
  ]),
  ([v, k]) => [v, k],
);

export const forStatement: Parser<ForStatement> = (state) =>
  map(
    concat([
      string('for'),
      whitespaceOrComment,
      cut(expected(forBinding, 'Missing expression after "for" keyword')),
      whitespaceOrComment,
      cut(expected(string('in'), '"in" expected after expression')),
      whitespaceOrComment,
      cut(expected(expression, 'Missing expression after for ~ in')),
      whitespaceOrComment,
      cut(expected(tagClose, `Missing "${state.tags[1]}"`)),
      cut(
        label(
          manyTill(
            templateBody,
            concat([tagOpen, whitespaceOrComment, endStatement]),
          ),
          `Missing "${state.tags[0]} end ${state.tags[1]}" after for statement`,
        ),
      ),
    ]),
    (
      [
        ,
        leading1,
        [value, index],
        trailing1,
        ,
        leading2,
        right,
        trailing2,
        close,
        [body, [open, trailing3]],
      ],
      range,
    ) => {
      return createForStatement(
        {
          ...value,
          leadingComments: [...value.leadingComments, ...leading1],
          trailingComments:
            index.state === 'some'
              ? value.trailingComments
              : [...value.trailingComments, ...trailing1],
        },
        index.state === 'some'
          ? {
              ...index.value,
              trailingComments: [...index.value.trailingComments, ...trailing1],
            }
          : null,
        {
          ...right,
          leadingComments: [...right.leadingComments, ...leading2],
          trailingComments: [...right.trailingComments, ...trailing2],
        },
        body,
        {
          close: close,
          open: {
            ...open,
            trailingComments: [...open.trailingComments, ...trailing3],
          },
        },
        range,
      );
    },
  )(state);

// expression statement
export const expressionStatement: Parser<ExpressionStatement> = map(
  expression,
  (expr) => createExpressionStatement(expr),
);

// statement
const statement: Parser<StatementKind> = choice([
  attempt(variableStatement),
  attempt(ifStatement),
  attempt(forStatement),
  attempt(continueStatement),
  attempt(breakStatement),
  expressionStatement,
]);

// tag template
export const tagTemplate: Parser<TagTemplate> = (state) =>
  map(
    concat([
      tagOpen,
      whitespaceOrComment,
      option(statement),
      whitespaceOrComment,
      expected(tagClose, `Missing "${state.tags[1]}"`),
    ]),
    ([open, leading, stmt, trailing, close]) =>
      createTagTemplate(
        open,
        stmt.state === 'some' ? stmt.value : null,
        close,
        leading,
        trailing,
      ),
  )(state);

// raw
export const rawTemplate: Parser<RawTemplate> = map(
  many1(diff(any, attempt(tagOpen))),
  (body, r) => createRawTemplate(body.join(''), r),
);

export function templateBody(
  state: ParseState,
): ParseResult<TemplateElementKind> {
  return choice([attempt(rawTemplate), tagTemplate])(state);
}

export function template(state: ParseState): ParseResult<Template> {
  return many(templateBody)(state);
}
