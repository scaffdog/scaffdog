/* eslint-disable @typescript-eslint/no-use-before-define */
import { error } from '@scaffdog/error';
import type {
  Context,
  Helper,
  SourceRange,
  Variable,
  VariableMap,
} from '@scaffdog/types';
import { isPlainObject } from 'is-plain-object';
import type {
  BinaryExpression,
  BreakStatement,
  CallExpression,
  ConditionalExpression,
  ContinueStatement,
  ExpressionKind,
  ExpressionStatement,
  ForStatement,
  Identifier,
  IfStatement,
  LiteralKind,
  LogicalExpression,
  MemberExpression,
  PrimaryExpressionKind,
  Program,
  RawTemplate,
  TagTemplate,
  Template,
  UnaryExpression,
  UpdateExpression,
  VariableStatement,
} from './ast';
import {
  isExpression,
  isIdentifier,
  isIfStatement,
  isLiteral,
  isParenthesizedExpression,
  isPrimaryExpression,
} from './ast';
import {
  isArray,
  isBoolean,
  isFunction,
  isNumber,
  isObject,
  isString,
  typeOf,
} from './utils';

class IterateState {
  private previous: symbol | null = null;
  private current: symbol | null = null;
  private map: Map<symbol, string> = new Map();

  public alive(): boolean {
    return this.current != null;
  }

  public begin(): void {
    this.previous = this.current;
    this.current = Symbol();
  }

  public finish(): void {
    if (this.current == null) {
      return;
    }
    this.map.delete(this.current);
    this.current = this.previous;
  }

  public get(): string | null {
    if (this.current == null) {
      return null;
    }
    return this.map.get(this.current) ?? null;
  }

  public set(value: string): void {
    if (this.current != null) {
      this.map.set(this.current, value);
    }
  }

  public flush(): string | null {
    const value = this.get();
    this.set('');
    return value;
  }
}

type CompileState = {
  source: string;
  iterate: IterateState;
  context: Context;
};

type CompileResult = Variable | Helper;

type Compiler<T> = (data: T, state: CompileState) => CompileResult;

type ErrorState = {
  source: string;
  range: SourceRange;
};

type PropertyAccessor = string | number;

const isPropertyAccessor = (v: unknown): v is PropertyAccessor =>
  isString(v) || isNumber(v);

const NOT_DEFINED_VALUE = Symbol();
const ITERATE_CONTINUE = Symbol('continue');
const ITERATE_BREAK = Symbol('break');

const toString = (value: CompileResult, state: ErrorState): string => {
  if (isFunction(value)) {
    throw error('a function cannot be output as string', state);
  }

  if (value == null) {
    return '';
  } else if (isPlainObject(value)) {
    return JSON.stringify(value);
  } else if (isArray(value)) {
    return value.join(',');
  } else if (isBoolean(value)) {
    return '';
  } else {
    return `${value}`;
  }
};

const strip = (value: string, start: boolean, end: boolean): string => {
  let v = value;
  if (start) v = v.trimStart();
  if (end) v = v.trimEnd();
  return v;
};

const compileLiteral: Compiler<LiteralKind> = (node) => {
  switch (node.type) {
    case 'NullLiteral':
      return null;
    case 'UndefinedLiteral':
      return undefined;
    case 'BooleanLiteral':
    case 'NumericLiteral':
    case 'StringLiteral':
      return node.value;
  }
};

const compileIdentifier: Compiler<Identifier> = (node, state) => {
  const {
    source,
    context: { variables, helpers },
  } = state;

  if (variables.has(node.name)) {
    return variables.get(node.name)!;
  }

  if (helpers.has(node.name)) {
    return helpers.get(node.name)!;
  }

  throw error(`"${node.name}" variable or helper function is not defined`, {
    source,
    range: node.range,
  });
};

const compileMemberExpression: Compiler<MemberExpression> = (node, state) => {
  const { source } = state;
  const object: CompileResult = compileExpression(node.object, state);
  let property: PropertyAccessor;

  if (node.computed) {
    const v = compileExpression(node.property, state);
    if (!isPropertyAccessor(v)) {
      const t = typeOf(v);
      throw error(
        `Property access must be string or numeric (actual: "${t}")`,
        {
          source,
          range: node.property.range,
        },
      );
    }
    property = v;
  } else {
    switch (node.property.type) {
      case 'Identifier':
        property = node.property.name;
        break;
      case 'NumericLiteral':
        property = node.property.value;
        break;
      default: {
        const t = node.property.type;
        throw error(
          `Static property access must be identifier or numeric (actual: "${t}")`,
          {
            source,
            range: node.property.range,
          },
        );
      }
    }
  }

  assertDisallowedPath(property, {
    source,
    range: node.property.range,
  });

  if (isObject(object)) {
    return object[property];
  } else if (isArray(object)) {
    return object[Number(property)];
  } else {
    const t = typeOf(object);
    throw error(
      `Property access is not available for data types other than object or array (actual: "${t}")`,
      {
        source,
        range: node.object.range,
      },
    );
  }
};

function compileCallExpression(
  node: CallExpression,
  state: CompileState,
): CompileResult {
  const {
    source,
    context: { helpers },
  } = state;

  let helper: Helper;

  if (isIdentifier(node.callee)) {
    const v = helpers.get(node.callee.name);
    if (v == null) {
      throw error(`"${node.callee.name}" helper function is not defined`, {
        source,
        range: node.callee.range,
      });
    }
    helper = v;
  } else if (isExpression(node.callee)) {
    const v = compileExpression(node.callee, state);
    if (!isFunction(v)) {
      const s = toString(v, {
        source,
        range: node.callee.range,
      });
      const t = typeOf(v);
      throw error(`"${s !== '' ? s : t}" is not a function`, {
        source,
        range: node.callee.range,
      });
    }
    helper = v;
  } else {
    throw error('Unexpected non-callable expression', {
      source,
      range: node.range,
    });
  }

  const args = node.args.map((arg) => {
    return compileExpression(arg, state);
  });

  return helper(state.context, ...args);
}

function compilePrimaryExpression(
  node: PrimaryExpressionKind,
  state: CompileState,
): CompileResult {
  const { range } = node;
  if (isLiteral(node)) {
    return compileLiteral(node, state);
  } else if (isIdentifier(node)) {
    return compileIdentifier(node, state);
  } else if (isParenthesizedExpression(node)) {
    return compileExpression(node.expression, state);
  }
  throw error('Invalid node', {
    source: state.source,
    range,
  });
}

function resolveVariablePaths(
  node: ExpressionKind,
  paths: PropertyAccessor[],
  state: CompileState,
): PropertyAccessor[] | null {
  switch (node.type) {
    case 'Identifier': {
      return [...paths, node.name];
    }
    case 'MemberExpression': {
      const p1 = resolveVariablePaths(node.object, paths, state);
      if (p1 == null) {
        return null;
      }
      if (node.computed) {
        const v = compileExpression(node.property, state);
        return isPropertyAccessor(v) ? [...p1, v] : null;
      }
      return resolveVariablePaths(node.property, p1, state);
    }
    default: {
      const v = compileExpression(node, state);
      return isPropertyAccessor(v) ? [...paths, v] : null;
    }
  }
}

const disallowedPaths = new Set(['__proto__', 'prototype', 'constructor']);

const assertDisallowedPath = (
  path: PropertyAccessor,
  state: ErrorState,
): void => {
  if (isString(path) && disallowedPaths.has(path)) {
    throw error(`Invalid property access`, state);
  }
};

const getVariable = (
  obj: VariableMap | Variable,
  paths: PropertyAccessor[],
  state: ErrorState,
): Variable => {
  if (!isObject(obj) && !isArray(obj) && !(obj instanceof Map)) {
    const t = typeOf(obj);
    throw error(
      `Property access is not available for data types other than object or array (actual: "${t}")`,
      state,
    );
  }

  let o: any = obj;

  const get = (key: PropertyAccessor) => {
    if (o instanceof Map) {
      return o.get(key);
    }
    return o instanceof Map ? o.get(key) : o[key];
  };

  for (let i = 0; i < paths.length; i++) {
    const key = paths[i];
    assertDisallowedPath(key, state);

    if (get(key) == null) {
      throw error(
        `Cannot read properties of "${o[key]}" (reading "${key}")`,
        state,
      );
    }

    o = get(key);
  }

  return o;
};

const updateVariable = (
  obj: VariableMap | Variable,
  paths: PropertyAccessor[],
  value: Variable,
  state: ErrorState,
): void => {
  if (!isObject(obj) && !isArray(obj) && !(obj instanceof Map)) {
    const t = typeOf(obj);
    throw error(
      `Property access is not available for data types other than object or array (actual: "${t}")`,
      state,
    );
  }

  let o: any = obj;

  const get = (key: PropertyAccessor) => {
    if (o instanceof Map) {
      return o.get(key);
    }
    return o instanceof Map ? o.get(key) : o[key];
  };

  for (let i = 0; i < paths.length; i++) {
    const key = paths[i];
    assertDisallowedPath(key, state);

    if (get(key) == null) {
      throw error(
        `Cannot read properties of "${o[key]}" (reading "${key}")`,
        state,
      );
    }
    if (i === paths.length - 1) {
      if (o instanceof Map) {
        o.set(key, value);
      } else {
        o[key] = value;
      }
    }
    o = get(key);
  }
};

const compileUpdateExpression: Compiler<UpdateExpression> = (node, state) => {
  const {
    source,
    context: { variables },
  } = state;

  const paths = resolveVariablePaths(node.argument, [], state);
  if (paths == null || paths.length === 0) {
    throw error('Invalid left-hand side expression in prefix operation', {
      source,
      range: node.argument.range,
    });
  }

  if (!variables.has(paths[0] as string)) {
    throw error(`"${paths[0]}" is not defined`, {
      source,
      range: node.argument.range,
    });
  }

  const old = getVariable(variables, paths, {
    source,
    range: node.argument.range,
  });

  if (!isNumber(old)) {
    throw error(`"${old}" is not a number`, {
      source,
      range: node.argument.range,
    });
  }

  let v: number;
  switch (node.operator) {
    case '++':
      v = old + 1;
      break;
    case '--':
      v = old - 1;
      break;
  }

  updateVariable(variables, paths, v, {
    source,
    range: node.argument.range,
  });

  return node.prefix ? v : old;
};

const compileUnaryExpression: Compiler<UnaryExpression> = (node, state) => {
  const { source } = state;
  const arg = compileExpression(node.argument, state);

  switch (node.operator) {
    case '+':
    case '-':
    case '~': {
      if (isNumber(arg)) {
        switch (node.operator) {
          case '+':
            return +arg;
          case '-':
            return -arg;
          case '~':
            return ~arg;
        }
      }
      const t = typeOf(arg);
      throw error(
        `Unary operator "${node.operator}" cannot be applied to type "${t}"`,
        {
          source,
          range: node.argument.range,
        },
      );
    }
    case '!':
      if (isBoolean(arg)) {
        return !arg;
      }
      const t = typeOf(arg);
      throw error(`Unary operator "!" cannot be applied to type "${t}"`, {
        source,
        range: node.argument.range,
      });
  }
};

const compileBinaryExpression: Compiler<BinaryExpression> = (node, state) => {
  const { source } = state;
  const left = compileExpression(node.left, state);
  const leftType = typeOf(left);
  const right = compileExpression(node.right, state);
  const rightType = typeOf(right);

  if (leftType !== rightType) {
    throw error(
      `The left and right values must be of the same data type (left: "${leftType}", right: "${rightType}")`,
      {
        source,
        range: node.range,
      },
    );
  }

  switch (node.operator) {
    case '-':
    case '*':
    case '/':
    case '%':
    case '<':
    case '>':
    case '<=':
    case '>=': {
      if (isNumber(left) && isNumber(right)) {
        switch (node.operator) {
          case '-':
            return left - right;
          case '*':
            return left * right;
          case '/':
            if (right === 0) {
              return 'Infinity';
            }
            return left / right;
          case '%':
            return left % right;
          case '<':
            return left < right;
          case '>':
            return left > right;
          case '<=':
            return left <= right;
          case '>=':
            return left >= right;
        }
      }
      throw error(
        `Operator "${node.operator}" cannot be applied to types "${leftType}" and "${rightType}"`,
        {
          source,
          range: node.range,
        },
      );
    }
    case '+': {
      if (isString(left) && isString(right)) {
        return left + right;
      }
      if (isNumber(left) && isNumber(right)) {
        return left + right;
      }
      throw error(
        `Operator "+" cannot be applied to types "${leftType}" and "${rightType}"`,
        {
          source,
          range: node.range,
        },
      );
    }
    case '==':
      return left === right;
    case '!=':
      return left !== right;
  }
};

const compileLogicalExpression: Compiler<LogicalExpression> = (node, state) => {
  const { source } = state;
  const left = compileExpression(node.left, state);
  const leftType = typeOf(left);
  const right = compileExpression(node.right, state);
  const rightType = typeOf(right);

  if (!isBoolean(left) && !isBoolean(right)) {
    throw error(
      `Operator "${node.operator}" cannot be applied to types "${leftType}" and "${rightType}"`,
      {
        source,
        range: node.range,
      },
    );
  }

  switch (node.operator) {
    case '&&':
      return left && right;
    case '||':
      return left || right;
  }
};

const compileConditionalExpression: Compiler<ConditionalExpression> = (
  node,
  state,
) => {
  const { source } = state;

  const test = compileExpression(node.test, state);
  if (!isBoolean(test)) {
    throw error(
      `The result of evaluation of the conditional expression should be a boolean (actual: "${typeOf(
        test,
      )}")`,
      {
        source,
        range: node.test.range,
      },
    );
  }

  return compileExpression(test ? node.consequent : node.alternate, state);
};

function compileExpression(
  node: ExpressionKind,
  state: CompileState,
): CompileResult {
  if (isPrimaryExpression(node)) {
    return compilePrimaryExpression(node, state);
  }

  switch (node.type) {
    case 'CallExpression':
      return compileCallExpression(node, state);
    case 'MemberExpression':
      return compileMemberExpression(node, state);
    case 'UpdateExpression':
      return compileUpdateExpression(node, state);
    case 'UnaryExpression':
      return compileUnaryExpression(node, state);
    case 'BinaryExpression':
      return compileBinaryExpression(node, state);
    case 'LogicalExpression':
      return compileLogicalExpression(node, state);
    case 'ConditionalExpression':
      return compileConditionalExpression(node, state);
  }
}

const compileExpressionStatement: Compiler<ExpressionStatement> = (
  node,
  state,
) => {
  const { source } = state;

  const v = compileExpression(node.expression, state);
  if (isFunction(v)) {
    return v(state.context);
  }

  return toString(v, {
    source,
    range: node.expression.range,
  });
};

const compileVariableStatement: Compiler<VariableStatement> = (node, state) => {
  const {
    source,
    context: { variables },
  } = state;

  const name = node.left.name;
  const v = compileExpression(node.right, state);
  if (isFunction(v)) {
    throw error('Variable assignment of functions is not allowed', {
      source,
      range: node.right.range,
    });
  }

  variables.set(name, v);

  return '';
};

const compileIfStatement: Compiler<IfStatement> = (node, state) => {
  const { source } = state;
  const { ifClose, elseOpen, elseClose, endOpen } = node.tags;

  const test = compileExpression(node.test, state);
  if (!isBoolean(test)) {
    throw error(
      `The result of evaluation of the conditional expression should be a boolean (actual: "${typeOf(
        test,
      )}")`,
      {
        source,
        range: node.test.range,
      },
    );
  }

  if (test) {
    return strip(
      toString(compileTemplate(node.consequent, state), {
        source,
        range: node.range,
      }),
      ifClose.strip,
      (elseOpen?.strip || endOpen?.strip) ?? false,
    );
  }

  if (isIfStatement(node.alternate)) {
    return compileIfStatement(node.alternate, state);
  } else if (isArray(node.alternate)) {
    return strip(
      toString(compileTemplate(node.alternate, state), {
        source,
        range: node.range,
      }),
      elseClose!.strip,
      endOpen!.strip,
    );
  } else {
    return '';
  }
};

const compileForStatement: Compiler<ForStatement> = (node, state) => {
  const {
    source,
    iterate,
    context: { variables },
  } = state;

  const { close, open } = node.tags;

  iterate.begin();

  const refs = {
    value: node.value.name,
    index: node.index?.name ?? null,
  };

  const vars = {
    value: variables.has(refs.value)
      ? variables.get(refs.value)
      : NOT_DEFINED_VALUE,
    index:
      refs.index != null && variables.has(refs.index)
        ? variables.get(refs.index)
        : NOT_DEFINED_VALUE,
  };

  const right = compileExpression(node.right, state);
  if (!isArray(right)) {
    const t = typeOf(right);
    throw error(
      `Right-hand side expression must be iterable (actual: "${t}")`,
      {
        source,
        range: node.right.range,
      },
    );
  }

  let result = '';

  for (let i = 0; i < right.length; i++) {
    const v = right[i];

    variables.set(refs.value, v);
    if (refs.index != null) {
      variables.set(refs.index, i);
    }

    try {
      result += strip(
        toString(compileTemplate(node.body, state), {
          source,
          range: node.range,
        }),
        close.strip,
        open.strip,
      );
      iterate.set('');
    } catch (e) {
      if (e === ITERATE_CONTINUE) {
        result += iterate.flush() ?? '';
        continue;
      }
      if (e === ITERATE_BREAK) {
        result += iterate.flush() ?? '';
        break;
      }
      throw e;
    }
  }

  if (vars.value !== NOT_DEFINED_VALUE) {
    variables.set(refs.value, vars.value as Variable);
  }

  if (vars.index !== NOT_DEFINED_VALUE && refs.index != null) {
    variables.set(refs.index, vars.index as Variable);
  }

  iterate.finish();

  return strip(result, close.strip, open.strip);
};

const compileContinueStatement: Compiler<ContinueStatement> = () => {
  throw ITERATE_CONTINUE;
};

const compileBreakStatement: Compiler<BreakStatement> = () => {
  throw ITERATE_BREAK;
};

const compileTagTemplate: Compiler<TagTemplate> = (node, state) => {
  if (node.body == null) {
    return '';
  }

  switch (node.body.type) {
    case 'ExpressionStatement':
      return compileExpressionStatement(node.body, state);
    case 'VariableStatement':
      return compileVariableStatement(node.body, state);
    case 'IfStatement':
      return compileIfStatement(node.body, state);
    case 'ForStatement':
      return compileForStatement(node.body, state);
    case 'ContinueStatement':
      return compileContinueStatement(node.body, state);
    case 'BreakStatement':
      return compileBreakStatement(node.body, state);
  }
};

const compileRawTemplate: Compiler<RawTemplate> = (node) => {
  return node.body;
};

const compileTemplate: Compiler<Template> = (nodes, state) => {
  const { source, iterate } = state;

  if (nodes.length === 0) {
    return '';
  }

  type TemplateBuffer = [string, boolean | null, boolean | null];

  const buffer = nodes.reduce<TemplateBuffer[]>((acc, node) => {
    let current: string;
    let open: boolean | null = null;
    let close: boolean | null = null;

    switch (node.type) {
      case 'RawTemplate':
        current = toString(compileRawTemplate(node, state), {
          source,
          range: node.range,
        });
        break;
      case 'TagTemplate':
        open = node.open.strip;
        close = node.close.strip;
        current = toString(compileTagTemplate(node, state), {
          source,
          range: node.range,
        });
        break;
    }

    if (iterate.alive()) {
      const previous = strip(iterate.get() ?? '', false, open != null);
      iterate.set(previous + current);
    }

    acc.push([current, open, close]);

    return acc;
  }, []);

  const output = buffer.reduce((acc, [str, open, close], index) => {
    if (open == null && close == null) {
      if (buffer[index + 1]?.[1]) {
        str = str.trimEnd();
      }
      if (buffer[index - 1]?.[2]) {
        acc = acc.trimEnd();
        str = str.trimStart();
      }
    } else {
      if (open) {
        acc = acc.trimEnd();
        str = str.trimStart();
      }
      if (close) {
        str = str.trimEnd();
      }
    }
    return acc + str;
  }, '');

  return output;
};

const compileProgram: Compiler<Program> = (node, state) => {
  return compileTemplate(node.body, state);
};

export const compile = (ast: Program, context: Context): string => {
  return toString(
    compileProgram(ast, {
      source: ast.source,
      iterate: new IterateState(),
      context,
    }),
    {
      source: ast.source,
      range: ast.range,
    },
  );
};
