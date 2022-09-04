import type {
  ArgumentList,
  BinaryExpression,
  CallExpression,
  Comment,
  ConditionalExpression,
  ExpressionKind,
  ExpressionStatement,
  ForStatement,
  Identifier,
  IfStatement,
  LeftHandSideExpressionKind,
  LiteralKind,
  LogicalExpression,
  MemberExpression,
  ParenthesizedExpression,
  PrimaryExpressionKind,
  Program,
  RawTemplate,
  StatementKind,
  Tag,
  TagTemplate,
  Template,
  UnaryExpression,
  UpdateExpression,
  VariableStatement,
} from './ast';
import {
  isCallExpression,
  isIfStatement,
  isLiteral,
  isNumericLiteral,
  isPrimaryExpression,
  isStringLiteral,
} from './ast';
import {
  unicodeIdContinueReg,
  unicodeIdStartReg,
} from './parser/unicode-regex';

/* eslint-disable @typescript-eslint/no-use-before-define */

const reservedWord = new Set([
  'null',
  'undefined',
  'true',
  'false',
  'if',
  'else',
  'for',
  'break',
  'continue',
  'end',
]);

/**
 * Utility
 */

const join = (arr: (string | boolean | null)[], separator: string) =>
  arr.filter(Boolean).join(separator);

const isValidIdentifierName = (value: string) => {
  if (reservedWord.has(value)) {
    return false;
  }

  const [first, ...rest] = [...value];

  return (
    unicodeIdStartReg.test(first) &&
    rest.every((v) => unicodeIdContinueReg.test(v))
  );
};

/**
 * Formatter
 */
type Formatter<T> = (node: T) => string;

const formatComment: Formatter<Comment> = (node) => {
  const lines = node.body.split('\n');

  if (lines.length > 1) {
    const body = lines.map((ln) => ln.trimEnd()).join('\n');
    return `/*${body}*/`;
  }

  return `/* ${node.body.trim()} */`;
};

const formatComments: Formatter<readonly Comment[]> = (comments) => {
  return comments.map((comment) => formatComment(comment)).join(' ');
};

const formatLiteral: Formatter<LiteralKind> = (node) => {
  const leading = formatComments(node.leadingComments);
  const trailing = formatComments(node.trailingComments);

  switch (node.type) {
    case 'NullLiteral':
      return join([leading, 'null', trailing], ' ');
    case 'UndefinedLiteral':
      return join([leading, 'undefined', trailing], ' ');
    case 'BooleanLiteral':
    case 'NumericLiteral':
      return join([leading, node.value.toString(), trailing], ' ');
    case 'StringLiteral':
      return join(
        [leading, `${node.quote}${node.value}${node.quote}`, trailing],
        ' ',
      );
  }
};

const formatIdentifier: Formatter<Identifier> = (node) => {
  return join(
    [
      formatComments(node.leadingComments),
      node.name,
      formatComments(node.trailingComments),
    ],
    ' ',
  );
};

const formatPrimaryExpression: Formatter<PrimaryExpressionKind> = (node) => {
  if (isLiteral(node)) {
    return formatLiteral(node);
  }

  switch (node.type) {
    case 'Identifier':
      return formatIdentifier(node);
    case 'ParenthesizedExpression':
      return formatParenthesizedExpression(node);
  }
};

const formatLeftHandSideExpression: Formatter<LeftHandSideExpressionKind> = (
  node,
) => {
  if (isPrimaryExpression(node)) {
    return formatPrimaryExpression(node);
  }

  switch (node.type) {
    case 'CallExpression':
      return formatCallExpression(node);
    case 'MemberExpression':
      return formatMemberExpression(node);
  }
};

function formatCallExpression(node: CallExpression): string {
  const callee = formatExpression(node.callee);

  const formatArgs = (args: ArgumentList, delimiter: string) => {
    return args.map((arg) => formatExpression(arg)).join(delimiter);
  };

  if (node.piped) {
    const [first, ...rest] = node.args;

    if (isCallExpression(first)) {
      return join(
        [formatCallExpression(first), '|', callee, formatArgs(rest, ' ')],
        ' ',
      );
    } else if (node.callee.range[0] > (first?.range[0] ?? 0)) {
      return join(
        [formatExpression(first), '|', callee, formatArgs(rest, ' ')],
        ' ',
      );
    } else {
      return join([callee, formatArgs(node.args, ' ')], ' ');
    }
  }

  return join(
    [
      callee,
      '(',
      formatArgs(node.args, ', '),
      formatComments(node.innerComments),
      ')',
    ],
    '',
  );
}

function formatMemberExpression(node: MemberExpression): string {
  let obj: string;
  if (isPrimaryExpression(node.object)) {
    obj = formatPrimaryExpression(node.object);
  } else {
    switch (node.object.type) {
      case 'MemberExpression':
        obj = formatMemberExpression(node.object);
        break;
      case 'CallExpression':
        obj = formatCallExpression(node.object);
        break;
    }
  }

  if (!node.computed) {
    switch (node.property.type) {
      case 'StringLiteral':
      case 'NumericLiteral':
        return `${obj}.${node.property.value}`;
      default: {
        const prop = formatExpression(node.property);
        return `${obj}.${prop}`;
      }
    }
  }

  if (
    ((isStringLiteral(node.property) &&
      isValidIdentifierName(node.property.value)) ||
      isNumericLiteral(node.property)) &&
    node.property.leadingComments.length < 1 &&
    node.property.trailingComments.length < 1
  ) {
    return `${obj}.${node.property.value}`;
  }

  const prop = join(
    [
      formatComments(node.leadingComments),
      formatExpression(node.property),
      formatComments(node.trailingComments),
    ],
    ' ',
  );

  return `${obj}[${prop}]`;
}

function formatParenthesizedExpression(node: ParenthesizedExpression): string {
  const body = join(
    [
      formatComments(node.leadingComments),
      formatExpression(node.expression),
      formatComments(node.trailingComments),
    ],
    ' ',
  );

  // FIXME Remove unnecessary parentheses in the future.
  return `(${body})`;
}

const formatUpdateExpression: Formatter<UpdateExpression> = (node) => {
  const arg = formatLeftHandSideExpression(node.argument);
  const expr = node.prefix
    ? `${node.operator}${arg}`
    : `${arg}${node.operator}`;
  return join(
    [
      formatComments(node.leadingComments),
      expr,
      formatComments(node.trailingComments),
    ],
    ' ',
  );
};

const formatUnaryExpression: Formatter<UnaryExpression> = (node) => {
  const arg = formatExpression(node.argument);
  return join(
    [
      formatComments(node.leadingComments),
      `${node.operator}${arg}`,
      formatComments(node.trailingComments),
    ],
    ' ',
  );
};

const formatBinaryExpression: Formatter<BinaryExpression> = (node) => {
  return join(
    [
      formatComments(node.leadingComments),
      formatExpression(node.left),
      node.operator,
      formatExpression(node.right),
      formatComments(node.trailingComments),
    ],
    ' ',
  );
};

const formatLogicalExpression: Formatter<LogicalExpression> = (node) => {
  return join(
    [
      formatComments(node.leadingComments),
      formatExpression(node.left),
      node.operator,
      formatExpression(node.right),
      formatComments(node.trailingComments),
    ],
    ' ',
  );
};

const formatConditionalExpression: Formatter<ConditionalExpression> = (
  node,
) => {
  return join(
    [
      formatComments(node.leadingComments),
      formatExpression(node.test),
      '?',
      formatExpression(node.consequent),
      ':',
      formatExpression(node.alternate),
      formatComments(node.trailingComments),
    ],
    ' ',
  );
};

function formatExpression(node: ExpressionKind): string {
  if (isPrimaryExpression(node)) {
    return formatPrimaryExpression(node);
  }

  switch (node.type) {
    case 'MemberExpression':
      return formatMemberExpression(node);
    case 'CallExpression':
      return formatCallExpression(node);
    case 'UpdateExpression':
      return formatUpdateExpression(node);
    case 'UnaryExpression':
      return formatUnaryExpression(node);
    case 'BinaryExpression':
      return formatBinaryExpression(node);
    case 'LogicalExpression':
      return formatLogicalExpression(node);
    case 'ConditionalExpression':
      return formatConditionalExpression(node);
  }
}

const formatExpressionStatement: Formatter<ExpressionStatement> = (node) => {
  return formatExpression(node.expression);
};

const formatVariableStatement: Formatter<VariableStatement> = (node) => {
  return join(
    [
      formatComments(node.leadingComments),
      formatIdentifier(node.left),
      ':=',
      formatExpression(node.right),
      formatComments(node.trailingComments),
    ],
    ' ',
  );
};

const formatIfStatement: Formatter<IfStatement> = (node) => {
  const output = join(
    [
      'if ',
      formatExpression(node.test),
      ' ',
      formatTag(node.tags.ifClose),
      formatTemplate(node.consequent),
    ],
    '',
  );

  if (node.alternate == null) {
    return join([output, formatTag(node.tags.endOpen!), ' end'], '');
  }

  if (isIfStatement(node.alternate)) {
    return join(
      [
        output,
        formatTag(node.tags.elseOpen!),
        ' else ',
        formatIfStatement(node.alternate),
      ],
      '',
    );
  }

  return join(
    [
      output,
      formatTag(node.tags.elseOpen!),
      ' else ',
      formatTag(node.tags.elseClose!),
      formatTemplate(node.alternate),
      formatTag(node.tags.endOpen!),
      ' end',
    ],
    '',
  );
};

const formatForStatement: Formatter<ForStatement> = (node) => {
  return join(
    [
      'for ',
      formatIdentifier(node.value),
      node.index && join([', ', formatIdentifier(node.index)], ''),
      ' in ',
      formatExpression(node.right),
      ' ',
      formatTag(node.tags.close),
      formatTemplate(node.body),
      formatTag(node.tags.open),
      ' end',
    ],
    '',
  );
};

const formatStatement: Formatter<StatementKind> = (node) => {
  switch (node.type) {
    case 'ExpressionStatement':
      return formatExpressionStatement(node);
    case 'VariableStatement':
      return formatVariableStatement(node);
    case 'IfStatement':
      return formatIfStatement(node);
    case 'ForStatement':
      return formatForStatement(node);
    case 'ContinueStatement':
      return join(
        [
          formatComments(node.leadingComments),
          'continue',
          formatComments(node.trailingComments),
        ],
        ' ',
      );
    case 'BreakStatement':
      return join(
        [
          formatComments(node.leadingComments),
          'break',
          formatComments(node.trailingComments),
        ],
        ' ',
      );
  }
};

const formatTag: Formatter<Tag> = (node) => {
  const leading = formatComments(node.leadingComments);
  const trailing = formatComments(node.trailingComments);
  const strip = node.strip ? '-' : '';

  switch (node.variant) {
    case 'open':
      return join([`${node.delimiter}${strip}`, trailing], ' ');
    case 'close':
      return join([leading, `${strip}${node.delimiter}`], ' ');
  }
};

const formatTagTemplate: Formatter<TagTemplate> = (node) => {
  const open = formatTag(node.open);
  const close = formatTag(node.close);

  return join(
    [
      open,
      formatComments(node.leadingComments),
      node.body != null ? formatStatement(node.body) : '',
      formatComments(node.trailingComments),
      close,
    ],
    ' ',
  );
};

const formatRawTemplate: Formatter<RawTemplate> = (node) => {
  return node.body;
};

const formatTemplate: Formatter<Template> = (nodes) => {
  return nodes.reduce((acc, cur) => {
    switch (cur.type) {
      case 'RawTemplate':
        return acc + formatRawTemplate(cur);
      case 'TagTemplate':
        return acc + formatTagTemplate(cur);
    }
  }, '');
};

export const format = (ast: Program): string => {
  return formatTemplate(ast.body);
};
