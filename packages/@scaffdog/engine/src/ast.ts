import type { SourceRange } from '@scaffdog/types';
import { isObject } from './utils';

export type Node =
  | Comment
  | NullLiteral
  | UndefinedLiteral
  | BooleanLiteral
  | NumericLiteral
  | StringLiteral
  | Identifier
  | MemberExpression
  | UpdateExpression
  | UnaryExpression
  | BinaryExpression
  | LogicalExpression
  | ConditionalExpression
  | CallExpression
  | ParenthesizedExpression
  | Tag
  | EndStatement
  | ContinueStatement
  | BreakStatement
  | ExpressionStatement
  | VariableStatement
  | IfStatement
  | ForStatement
  | TagTemplate
  | RawTemplate
  | Program;

export type BaseNode = {
  type: string;
  range: SourceRange;
};

export type NodeProps<T extends BaseNode> = Omit<T, 'type' | 'range'>;

const isNodeLike = (node: unknown): node is BaseNode => {
  if (!isObject(node)) {
    return false;
  }
  return typeof node.type === 'string';
};

const nodeGuard =
  <T extends Node['type']>(type: T) =>
  (node: unknown): node is Extract<Node, { type: T }> => {
    return isNodeLike(node) && node.type === type;
  };

const composeGuard =
  <T>(list: ((node: unknown) => boolean)[]) =>
  (node: unknown): node is T =>
    list.some((fn) => fn(node));

/**
 * Base
 */

// Comment
export type Comment = Omit<BaseNode, 'type'> & {
  type: 'Comment';
  body: string;
};

export const createComment = (body: string, range: SourceRange): Comment => ({
  type: 'Comment',
  body,
  range,
});

export const isComment = nodeGuard('Comment');

export type WithComment<T> = T & {
  leadingComments: readonly Comment[];
  trailingComments: readonly Comment[];
};

// NullLiteral
export type NullLiteral = Omit<BaseNode, 'type'> &
  WithComment<{
    type: 'NullLiteral';
  }>;

export const createNullLiteral = (
  range: SourceRange,
  leadingComments: readonly Comment[] = [],
  trailingComments: readonly Comment[] = [],
): NullLiteral => ({
  type: 'NullLiteral',
  range,
  leadingComments,
  trailingComments,
});

export const isNullLiteral = nodeGuard('NullLiteral');

// UndefinedLiteral
export type UndefinedLiteral = Omit<BaseNode, 'type'> &
  WithComment<{
    type: 'UndefinedLiteral';
  }>;

export const createUndefinedLiteral = (
  range: SourceRange,
  leadingComments: readonly Comment[] = [],
  trailingComments: readonly Comment[] = [],
): UndefinedLiteral => ({
  type: 'UndefinedLiteral',
  range,
  leadingComments,
  trailingComments,
});

export const isUndefinedLiteral = nodeGuard('UndefinedLiteral');

// BooleanLiteral
export type BooleanLiteral = Omit<BaseNode, 'type'> &
  WithComment<{
    type: 'BooleanLiteral';
    value: boolean;
  }>;

export const createBooleanLiteral = (
  value: boolean,
  range: SourceRange,
  leadingComments: readonly Comment[] = [],
  trailingComments: readonly Comment[] = [],
): BooleanLiteral => ({
  type: 'BooleanLiteral',
  value,
  range,
  leadingComments,
  trailingComments,
});

export const isBooleanLiteral = nodeGuard('BooleanLiteral');

// NumericLiteral
export type NumericLiteral = Omit<BaseNode, 'type'> &
  WithComment<{
    type: 'NumericLiteral';
    value: number;
  }>;

export const createNumericLiteral = (
  value: number,
  range: SourceRange,
  leadingComments: readonly Comment[] = [],
  trailingComments: readonly Comment[] = [],
): NumericLiteral => ({
  type: 'NumericLiteral',
  value,
  range,
  leadingComments,
  trailingComments,
});

export const isNumericLiteral = nodeGuard('NumericLiteral');

// StringLiteral
export type StringLiteral = Omit<BaseNode, 'type'> &
  WithComment<{
    type: 'StringLiteral';
    value: string;
    quote: string;
  }>;

export const createStringLiteral = (
  value: string,
  quote: string,
  range: SourceRange,
  leadingComments: readonly Comment[] = [],
  trailingComments: readonly Comment[] = [],
): StringLiteral => ({
  type: 'StringLiteral',
  value,
  quote,
  range,
  leadingComments,
  trailingComments,
});

export const isStringLiteral = nodeGuard('StringLiteral');

// Literal
export type LiteralKind =
  | NullLiteral
  | UndefinedLiteral
  | BooleanLiteral
  | NumericLiteral
  | StringLiteral;

export const isLiteral = composeGuard<LiteralKind>([
  isNullLiteral,
  isUndefinedLiteral,
  isBooleanLiteral,
  isNumericLiteral,
  isStringLiteral,
]);

// Identifier
export type Identifier = Omit<BaseNode, 'type'> &
  WithComment<{
    type: 'Identifier';
    name: string;
  }>;

export const createIdentifier = (
  name: string,
  range: SourceRange,
  leadingComments: readonly Comment[] = [],
  trailingComments: readonly Comment[] = [],
): Identifier => ({
  type: 'Identifier',
  name,
  range,
  leadingComments,
  trailingComments,
});

export const isIdentifier = nodeGuard('Identifier');

/**
 * Expressions
 */

// StaticMemberAccessor
export type StaticMemberAccessorKind = Identifier | NumericLiteral;

// MemberExpression
export type MemberExpressionObjectKind =
  | PrimaryExpressionKind
  | MemberExpression
  | CallExpression;
export type MemberExpressionPropertyKind =
  | ExpressionKind
  | PrimaryExpressionKind;
export type MemberExpression = Omit<BaseNode, 'type'> &
  WithComment<{
    type: 'MemberExpression';
    object: MemberExpressionObjectKind;
    property: MemberExpressionPropertyKind;
    computed: boolean;
  }>;

export const createMemberExpression = (
  object: MemberExpressionObjectKind,
  property: MemberExpressionPropertyKind,
  computed: boolean,
  leadingComments: readonly Comment[] = [],
  trailingComments: readonly Comment[] = [],
): MemberExpression => ({
  type: 'MemberExpression',
  object,
  property,
  computed,
  range: [object.range[0], property?.range[1] ?? object.range[0]],
  leadingComments,
  trailingComments,
});

export const isMemberExpression = nodeGuard('MemberExpression');

// UpdateExpression
export type UpdateExpressionOperator = '++' | '--';

export type UpdateExpression = Omit<BaseNode, 'type'> &
  WithComment<{
    type: 'UpdateExpression';
    argument: LeftHandSideExpressionKind;
    operator: UpdateExpressionOperator;
    prefix: boolean;
  }>;

export const createUpdateExpression = (
  argument: LeftHandSideExpressionKind,
  operator: UpdateExpressionOperator,
  prefix: boolean,
  leadingComments: readonly Comment[] = [],
  trailingComments: readonly Comment[] = [],
): UpdateExpression => ({
  type: 'UpdateExpression',
  argument,
  operator,
  prefix,
  range: [
    argument.range[0] + (prefix ? -2 : 0),
    argument.range[1] + (prefix ? 0 : 2),
  ],
  leadingComments,
  trailingComments,
});

export const isUpdateExpression = nodeGuard('UpdateExpression');

// UnaryExpression
export type UnaryExpressionOperator = '+' | '-' | '~' | '!';
export type UnaryExpressionArgumentKind =
  | LeftHandSideExpressionKind
  | UpdateExpression
  | UnaryExpression;

export type UnaryExpression = Omit<BaseNode, 'type'> &
  WithComment<{
    type: 'UnaryExpression';
    operator: UnaryExpressionOperator;
    argument: UnaryExpressionArgumentKind;
  }>;

export const createUnaryExpression = (
  operator: UnaryExpressionOperator,
  argument: UnaryExpressionArgumentKind,
  leadingComments: readonly Comment[] = [],
  trailingComments: readonly Comment[] = [],
): UnaryExpression => ({
  type: 'UnaryExpression',
  operator,
  argument,
  range: [argument.range[0] - 1, argument.range[1]],
  leadingComments,
  trailingComments,
});

export const isUnaryExpression = nodeGuard('UnaryExpression');

// BinaryExpression
export type BinaryExpressionOperator =
  | '+'
  | '-'
  | '*'
  | '/'
  | '%'
  | '<'
  | '>'
  | '<='
  | '>='
  | '=='
  | '!=';
export type BinaryExpressionOperandKind =
  | LeftHandSideExpressionKind
  | UnaryExpression
  | UpdateExpression
  | BinaryExpression;

export type BinaryExpression = Omit<BaseNode, 'type'> &
  WithComment<{
    type: 'BinaryExpression';
    left: BinaryExpressionOperandKind;
    operator: BinaryExpressionOperator;
    right: BinaryExpressionOperandKind;
  }>;

export const createBinaryExpression = (
  left: BinaryExpressionOperandKind,
  operator: BinaryExpressionOperator,
  right: BinaryExpressionOperandKind,
  leadingComments: readonly Comment[] = [],
  trailingComments: readonly Comment[] = [],
): BinaryExpression => ({
  type: 'BinaryExpression',
  left,
  operator,
  right,
  range: [left.range[0], right.range[1]],
  leadingComments,
  trailingComments,
});

export const isBinaryExpression = nodeGuard('BinaryExpression');

// LogicalExpression
export type LogicalExpressionOperator = '&&' | '||';
export type LogicalExpressionOperandKind =
  | BinaryExpressionOperandKind
  | LogicalExpression;

export type LogicalExpression = Omit<BaseNode, 'type'> &
  WithComment<{
    type: 'LogicalExpression';
    left: LogicalExpressionOperandKind;
    operator: LogicalExpressionOperator;
    right: LogicalExpressionOperandKind;
  }>;

export const createLogicalExpression = (
  left: LogicalExpressionOperandKind,
  operator: LogicalExpressionOperator,
  right: LogicalExpressionOperandKind,
  leadingComments: readonly Comment[] = [],
  trailingComments: readonly Comment[] = [],
): LogicalExpression => ({
  type: 'LogicalExpression',
  left,
  operator,
  right,
  range: [left.range[0], right.range[1]],
  leadingComments,
  trailingComments,
});

export const isLogicalExpression = nodeGuard('LogicalExpression');

// ConditionalExpression
export type ConditionalExpressionTestKind = LogicalExpressionOperandKind;
export type ConditionalExpressionBodyKind =
  | ConditionalExpressionTestKind
  | ConditionalExpression;

export type ConditionalExpression = Omit<BaseNode, 'type'> &
  WithComment<{
    type: 'ConditionalExpression';
    test: LogicalExpressionOperandKind;
    consequent: ConditionalExpressionBodyKind;
    alternate: ConditionalExpressionBodyKind;
  }>;

export const createConditionalExpression = (
  test: LogicalExpressionOperandKind,
  consequent: ConditionalExpressionBodyKind,
  alternate: ConditionalExpressionBodyKind,
  leadingComments: readonly Comment[] = [],
  trailingComments: readonly Comment[] = [],
): ConditionalExpression => ({
  type: 'ConditionalExpression',
  test,
  consequent,
  alternate,
  range: [test.range[0], alternate.range[1]],
  leadingComments,
  trailingComments,
});

export const isConditionalExpression = nodeGuard('ConditionalExpression');

// ArgumentList
export type ArgumentKind =
  | ConditionalExpression
  | LogicalExpressionOperandKind
  | CallExpression;

export type ArgumentList = ArgumentKind[];

// CallExpression
export type CallExpressionCalleeKind =
  | LeftHandSideExpressionKind
  | ConditionalExpression
  | LogicalExpressionOperandKind;

export type CallExpression = Omit<BaseNode, 'type'> &
  WithComment<{
    type: 'CallExpression';
    callee: CallExpressionCalleeKind;
    args: ArgumentList;
    piped: boolean;
    innerComments: readonly Comment[];
  }>;

export const createCallExpression = (
  callee: CallExpressionCalleeKind,
  args: ArgumentList,
  piped: boolean,
  range: SourceRange,
  leadingComments: readonly Comment[] = [],
  innerComments: readonly Comment[] = [],
  trailingComments: readonly Comment[] = [],
): CallExpression => ({
  type: 'CallExpression',
  callee,
  args,
  piped,
  range,
  leadingComments,
  innerComments,
  trailingComments,
});

export const isCallExpression = nodeGuard('CallExpression');

// PipeExpression
export type PipeArgumentKind = UnaryExpressionArgumentKind | UnaryExpression;
export type PipeArgumentList = PipeArgumentKind[];
export type PipeHeadKind = LogicalExpressionOperandKind | ConditionalExpression;
export type PipeBodyKind = PrimaryExpressionKind | MemberExpression;

// ParenthesizedExpression
export type ParenthesizedExpression = Omit<BaseNode, 'type'> &
  WithComment<{
    type: 'ParenthesizedExpression';
    expression: ExpressionKind;
  }>;

export const createParenthesizedExpression = (
  expression: ExpressionKind,
  range: SourceRange,
  leadingComments: readonly Comment[] = [],
  trailingComments: readonly Comment[] = [],
): ParenthesizedExpression => ({
  type: 'ParenthesizedExpression',
  expression,
  range,
  leadingComments,
  trailingComments,
});

export const isParenthesizedExpression = nodeGuard('ParenthesizedExpression');

// PrimaryExpression
export type PrimaryExpressionKind =
  | Identifier
  | LiteralKind
  | ParenthesizedExpression;

export const isPrimaryExpression = composeGuard<PrimaryExpressionKind>([
  isIdentifier,
  isLiteral,
  isParenthesizedExpression,
]);

// LeftHandSideExpression
export type LeftHandSideExpressionKind =
  | PrimaryExpressionKind
  | MemberExpression
  | CallExpression;

export const isLeftHandSideExpression =
  composeGuard<LeftHandSideExpressionKind>([
    isPrimaryExpression,
    isMemberExpression,
    isCallExpression,
  ]);

// Expression
export type ExpressionKind =
  | PrimaryExpressionKind
  | MemberExpression
  | UpdateExpression
  | UnaryExpression
  | BinaryExpression
  | LogicalExpression
  | ConditionalExpression
  | CallExpression;

export const isExpression = composeGuard<ExpressionKind>([
  isPrimaryExpression,
  isCallExpression,
  isMemberExpression,
  isUpdateExpression,
  isUnaryExpression,
  isBinaryExpression,
  isLogicalExpression,
  isConditionalExpression,
  isCallExpression,
]);

/**
 * Statements
 */

// Statement
export type StatementKind =
  | ContinueStatement
  | BreakStatement
  | VariableStatement
  | ExpressionStatement
  | IfStatement
  | ForStatement;

// Tag
export type TagVariant = 'open' | 'close';
export type Tag = Omit<BaseNode, 'type'> &
  WithComment<{
    type: 'Tag';
    variant: TagVariant;
    delimiter: string;
    strip: boolean;
    range: SourceRange;
  }>;

export const createTag = (
  variant: TagVariant,
  delimiter: string,
  strip: boolean,
  range: SourceRange,
  leadingComments: readonly Comment[] = [],
  trailingComments: readonly Comment[] = [],
): Tag => ({
  type: 'Tag',
  variant,
  delimiter,
  strip,
  range,
  leadingComments,
  trailingComments,
});

export const isTag = nodeGuard('Tag');

// EndStatement
export type EndStatement = Omit<BaseNode, 'type'> &
  WithComment<{
    type: 'EndStatement';
  }>;

export const createEndStatement = (
  range: SourceRange,
  leadingComments: readonly Comment[] = [],
  trailingComments: readonly Comment[] = [],
): EndStatement => ({
  type: 'EndStatement',
  range,
  leadingComments,
  trailingComments,
});

export const isEndStatement = nodeGuard('EndStatement');

// ContinueStatement
export type ContinueStatement = Omit<BaseNode, 'type'> &
  WithComment<{
    type: 'ContinueStatement';
  }>;

export const createContinueStatement = (
  range: SourceRange,
  leadingComments: readonly Comment[] = [],
  trailingComments: readonly Comment[] = [],
): ContinueStatement => ({
  type: 'ContinueStatement',
  range,
  leadingComments,
  trailingComments,
});

export const isContinueStatement = nodeGuard('ContinueStatement');

// BreakStatement
export type BreakStatement = Omit<BaseNode, 'type'> &
  WithComment<{
    type: 'BreakStatement';
  }>;

export const createBreakStatement = (
  range: SourceRange,
  leadingComments: readonly Comment[] = [],
  trailingComments: readonly Comment[] = [],
): BreakStatement => ({
  type: 'BreakStatement',
  range,
  leadingComments,
  trailingComments,
});

export const isBreakStatement = nodeGuard('BreakStatement');

// ExpressionStatement
export type ExpressionStatement = Omit<BaseNode, 'type'> &
  WithComment<{
    type: 'ExpressionStatement';
    expression: ExpressionKind;
  }>;

export const createExpressionStatement = (
  expression: ExpressionKind,
  leadingComments: readonly Comment[] = [],
  trailingComments: readonly Comment[] = [],
): ExpressionStatement => ({
  type: 'ExpressionStatement',
  expression,
  range: [...expression.range],
  leadingComments,
  trailingComments,
});

export const isExpressionStatement = nodeGuard('ExpressionStatement');

// VariableStatement
export type VariableStatement = Omit<BaseNode, 'type'> &
  WithComment<{
    type: 'VariableStatement';
    left: Identifier;
    right: ExpressionKind;
  }>;

export const createVariableStatement = (
  left: Identifier,
  right: ExpressionKind,
  leadingComments: readonly Comment[] = [],
  trailingComments: readonly Comment[] = [],
): VariableStatement => ({
  type: 'VariableStatement',
  left,
  right,
  range: [left.range[0], right.range[1]],
  leadingComments,
  trailingComments,
});

export const isVariableStatement = nodeGuard('VariableStatement');

// IfStatement
export type IfStatement = Omit<BaseNode, 'type'> &
  WithComment<{
    type: 'IfStatement';
    test: ExpressionKind;
    consequent: Template;
    alternate: IfStatement | Template | null;
    tags: {
      ifClose: Tag;
      elseOpen: Tag | null;
      elseClose: Tag | null;
      endOpen: Tag | null;
    };
  }>;

export const createIfStatement = (
  test: ExpressionKind,
  consequent: Template,
  alternate: IfStatement | Template | null,
  tags: IfStatement['tags'],
  range: SourceRange,
  leadingComments: readonly Comment[] = [],
  trailingComments: readonly Comment[] = [],
): IfStatement => ({
  type: 'IfStatement',
  test,
  consequent,
  alternate,
  tags,
  range,
  leadingComments,
  trailingComments,
});

export const isIfStatement = nodeGuard('IfStatement');

// ForStatement
export type ForStatement = Omit<BaseNode, 'type'> &
  WithComment<{
    type: 'ForStatement';
    value: Identifier;
    index: Identifier | null;
    right: ExpressionKind;
    body: Template;
    tags: {
      close: Tag;
      open: Tag;
    };
  }>;

export const createForStatement = (
  value: Identifier,
  index: Identifier | null,
  right: ExpressionKind,
  body: Template,
  tags: ForStatement['tags'],
  range: SourceRange,
  leadingComments: readonly Comment[] = [],
  trailingComments: readonly Comment[] = [],
): ForStatement => ({
  type: 'ForStatement',
  value,
  index,
  right,
  body,
  tags,
  range,
  leadingComments,
  trailingComments,
});

export const isForStatement = nodeGuard('ForStatement');

/**
 * Templates
 */

// Template
export type TemplateElementKind = TagTemplate | RawTemplate;
export type Template = TemplateElementKind[];

// TagTemplate
export type TagTemplate = Omit<BaseNode, 'type'> &
  WithComment<{
    type: 'TagTemplate';
    open: Tag;
    body: StatementKind | null;
    close: Tag;
  }>;

export const createTagTemplate = (
  open: Tag,
  body: StatementKind | null,
  close: Tag,
  leadingComments: readonly Comment[] = [],
  trailingComments: readonly Comment[] = [],
): TagTemplate => ({
  type: 'TagTemplate',
  open,
  body,
  close,
  range: [open.range[0], close.range[1]],
  leadingComments,
  trailingComments,
});

export const isTagTemplate = nodeGuard('TagTemplate');

// RawTemplate
export type RawTemplate = Omit<BaseNode, 'type'> & {
  type: 'RawTemplate';
  body: string;
  range: SourceRange;
};

export const createRawTemplate = (
  body: string,
  range: SourceRange,
): RawTemplate => ({
  type: 'RawTemplate',
  body,
  range,
});

export const isRawTemplate = nodeGuard('RawTemplate');

/**
 * Program
 */
export type Program = Omit<BaseNode, 'type'> & {
  type: 'Program';
  body: Template;
};

export const createProgram = (body: Template): Program => ({
  type: 'Program',
  body,
  range: [body[0]?.range[0] ?? 0, body[body.length - 1]?.range[0] ?? 0],
});

export const isProgram = nodeGuard('Program');
