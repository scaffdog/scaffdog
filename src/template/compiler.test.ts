import test, { ExecutionContext } from 'ava';
import { Compiler } from './compiler';
import { TemplateFunction } from './funcs';
import { Parser } from './parser';
import { tokenize } from './tokenize';

const valid = (
  t: ExecutionContext,
  input: string,
  vars: Array<[string, string]>,
  funcs: Array<[string, TemplateFunction]>,
  expected: string,
) => {
  const parser = new Parser(tokenize(input));

  const compiler = new Compiler({
    document: { path: '', attributes: {} as any, resources: [] },
    vars: new Map(vars),
    funcs: new Map(funcs),
  });

  const output = compiler.compile(parser.parse());

  t.is(output, expected);
};

const invalid = (
  t: ExecutionContext,
  input: string,
  vars: Array<[string, string]>,
  funcs: Array<[string, TemplateFunction]>,
) => {
  const parser = new Parser(tokenize(input));

  const compiler = new Compiler({
    document: { path: '', attributes: {} as any, resources: [] },
    vars: new Map(vars),
    funcs: new Map(funcs),
  });

  t.throws(() => {
    compiler.compile(parser.parse());
  });
};

test('raw', valid, 'foo bar baz', [], [], 'foo bar baz');

test('null', valid, '{{ null }}', [], [], '');
test('undefined', valid, '{{ undefined }}', [], [], '');
test('true', valid, '{{ true }}', [], [], '');
test('false', valid, '{{ false }}', [], [], '');
test('string', valid, '{{ "string" }}', [], [], 'string');
test('number', valid, '{{ 123 }}', [], [], '123');
test('comment out', valid, '{{ /* a comment */ }}', [], [], '');

test('trim - before spaces', valid, 'before {{- "text" }} after', [], [], 'beforetext after');
test(
  'trim - before spaces & newlines',
  valid,
  `before 
    {{- "text" }}  
after`,
  [],
  [],
  `beforetext  
after`,
);

test('trim - after spaces', valid, 'before {{ "text" -}} after', [], [], 'before textafter');
test(
  'trim - after spaces & newlines',
  valid,
  `before 
    {{ "text" -}}  
after`,
  [],
  [],
  `before 
    textafter`,
);

test(
  'trim',
  valid,
  `before 
  {{- "text" -}}    
 after`,
  [],
  [],
  `beforetextafter`,
);

test('identifier - variables', valid, '{{key}}', [['key', 'value']], [], 'value');
test('identifier - function', valid, '{{key}}', [], [['key', () => 'result']], 'result');
test('identifier - identifier (invalid)', invalid, '{{key1 | key2}}', [['key1', 'key1'], ['key2', 'key2']], []);

test('function - string', valid, '{{ fn "arg" }}', [], [['fn', (_: any, arg: any) => `result=${arg}`]], 'result=arg');
test('function - number', valid, '{{ fn 123 }}', [], [['fn', (_: any, arg: any) => `result=${arg}`]], 'result=123');

test(
  'function - identifier',
  valid,
  '{{ fn input }}',
  [['input', 'ident']],
  [['fn', (_: any, arg: any) => `result=${arg}`]],
  'result=ident',
);

test(
  'pipe call - 0 argument',
  valid,
  '{{ key | upper }}',
  [['key', 'value']],
  [['upper', (_: any, value: string) => value.toUpperCase()]],
  'VALUE',
);

test(
  'pipe call - 1 argument',
  valid,
  '{{ key | join "arg" }}',
  [['key', 'value']],
  [['join', (_: any, ...args: any[]) => args.join(', ')]],
  'value, arg',
);

test(
  'pipe call - 1 argument x identifier',
  valid,
  '{{ key1 | join "arg" key2 }}',
  [['key1', 'value1'], ['key2', 'value2']],
  [['join', (_: any, ...args: any[]) => args.join(', ')]],
  'value1, arg, value2',
);

test(
  'pipe call - chain function',
  valid,
  '{{ key | fn1 | fn2 "fn2-arg" | fn3 123 }}',
  [['key', 'value']],
  [
    ['fn1', (_: any, v: any) => `fn1(${v})`],
    ['fn2', (_: any, s: string, v: any) => `fn2(${s}, ${v})`],
    ['fn3', (_: any, n: number, v: any) => `fn3(${n}, ${v})`],
  ],
  'fn3(fn2(fn1(value), fn2-arg), 123)',
);

test(
  'pipe call - 0 argument function to function chain',
  valid,
  '{{ fn1 | fn2 }}',
  [],
  [['fn1', () => `fn1()`], ['fn2', (_: any, v: any) => `fn2(${v})`]],
  'fn2(fn1())',
);

test(
  'pipe call - 1 argument function to function chain',
  valid,
  '{{ fn1 "arg1" | fn2 }}',
  [],
  [['fn1', (_: any, s: string) => `fn1(${s})`], ['fn2', (_: any, v: any) => `fn2(${v})`]],
  'fn2(fn1(arg1))',
);
