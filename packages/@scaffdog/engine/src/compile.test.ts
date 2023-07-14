import type { HelperRecord, VariableRecord } from '@scaffdog/types';
import { test, expect } from 'vitest';
import { compile } from './compile.js';
import { createContext, extendContext } from './context.js';
import { parse } from './parser';

type TestContext = {
  variables?: VariableRecord;
  helpers?: HelperRecord;
};

const obj2map = <T>(obj: Record<string, T>) => {
  return new Map(Object.entries(obj));
};

const context = createContext({
  variables: new Map(),
  helpers: new Map(),
});

test.each<[string, string, TestContext | null]>([
  /**
   * RawTemplate
   */
  [``, ``, null],
  [`raw`, `raw`, null],

  /**
   * Expressions
   */
  [`{{}}`, ``, null],
  [`{{ null }}`, ``, null],
  [`{{ undefined }}`, ``, null],
  [`{{ true }}`, ``, null],
  [`{{ false }}`, ``, null],
  [`{{ 123 }}`, `123`, null],
  [`{{ "str" }}`, `str`, null],
  [
    `{{ ident }}`,
    `dog`,
    {
      variables: {
        ident: 'dog',
      },
    },
  ],
  [
    `{{ fn }}`,
    `scaffdog`,
    {
      helpers: {
        fn: () => 'scaffdog',
      },
    },
  ],
  [
    `{{ d.g }}`,
    `dog`,
    {
      variables: {
        d: { g: 'dog' },
      },
    },
  ],
  [
    `{{ arr.1 }}`,
    `2`,
    {
      variables: {
        arr: [1, 2, 3],
      },
    },
  ],
  [
    `{{ arr.100 }}`,
    ``,
    {
      variables: {
        arr: [1, 2, 3],
      },
    },
  ],
  [
    `{{ fn() }}`,
    `dog`,
    {
      helpers: {
        fn: () => 'dog',
      },
    },
  ],
  [
    `{{ fn("scaff", a, 1, inner(23)) }}`,
    `scaffdog123`,
    {
      variables: { a: 'dog' },
      helpers: {
        fn: (_: any, ...args: any[]) => args.join(''),
        inner: (_: any, n: any) => n.toString(),
      },
    },
  ],
  [
    `{{ fn("d")("o", "g") }}`,
    `dog`,
    {
      helpers: {
        fn: (_: any, s1: any) => (_: any, s2: string, s3: string) =>
          s1 + s2 + s3,
      },
    },
  ],
  [
    `{{ (fn)() }}`,
    `dog`,
    {
      helpers: {
        fn: () => 'dog',
      },
    },
  ],
  [
    `{{ fn("a dog").a }}`,
    `Hi I'm a dog.`,
    {
      helpers: {
        fn: (_: any, v: any) => ({ a: `Hi I'm ${v}.` }),
      },
    },
  ],
  [
    `{{ "a" | fn }}`,
    `a`,
    {
      helpers: {
        fn: (_: any, ...args: any[]) => args.join(''),
      },
    },
  ],
  [
    `{{ "a" | fn "b" -10 }}`,
    `ab-10`,
    {
      helpers: {
        fn: (_: any, ...args: any[]) => args.join(''),
      },
    },
  ],
  [
    `{{ a++ }}{{ a }}`,
    `12`,
    {
      variables: {
        a: 1,
      },
    },
  ],
  [
    `{{ ++a.b }}{{ a.b }}`,
    `22`,
    {
      variables: {
        a: {
          b: 1,
        },
      },
    },
  ],
  [
    `{{ a[key]++ }}{{ a[key] }}`,
    `12`,
    {
      variables: {
        a: {
          b: 1,
        },
        key: 'b',
      },
    },
  ],
  [
    `{{ ++a.b[fn()]["d"] }}{{ a.b.c.d }}`,
    `22`,
    {
      variables: {
        a: {
          b: {
            c: {
              d: 1,
            },
          },
        },
      },
      helpers: {
        fn: () => 'c',
      },
    },
  ],
  [
    `{{ ++a[++b] }}{{ a.3 }}{{ b }}`,
    `443`,
    {
      variables: {
        a: [0, 1, 2, 3],
        b: 2,
      },
      helpers: {
        fn: () => 'c',
      },
    },
  ],
  [`{{ +123 }}`, `123`, null],
  [`{{ -123 }}`, `-123`, null],
  [`{{ ~123 }}`, `-124`, null],
  [`{{ !true }}`, ``, null],
  [`{{ true ? "a" : "b" }}`, `a`, null],
  [`{{ false ? "a" : "b" }}`, `b`, null],
  [`{{ !true ? "a" : "b" }}`, `b`, null],
  [`{{ 1 - 1 }}`, `0`, null],
  [`{{ 1 * 5 }}`, `5`, null],
  [`{{ 1 * -5 }}`, `-5`, null],
  [`{{ 12 / 2 }}`, `6`, null],
  [`{{ 3 / 2 }}`, `1.5`, null],
  [`{{ 2 / 0 }}`, `Infinity`, null],
  [`{{ 13 % 5 }}`, `3`, null],
  [`{{ -13 % 5 }}`, `-3`, null],
  [`{{ 1 > 2 ? "a" : "b" }}`, `b`, null],
  [`{{ 1 < 2 ? "a" : "b" }}`, `a`, null],
  [`{{ 2 <= 1 ? "a" : "b" }}`, `b`, null],
  [`{{ 2 <= 2 ? "a" : "b" }}`, `a`, null],
  [`{{ 2 <= 3 ? "a" : "b" }}`, `a`, null],
  [`{{ 2 >= 1 ? "a" : "b" }}`, `a`, null],
  [`{{ 2 >= 2 ? "a" : "b" }}`, `a`, null],
  [`{{ 2 >= 3 ? "a" : "b" }}`, `b`, null],
  [`{{ 1 + 2 }}`, `3`, null],
  [`{{ "a" + "b" }}`, `ab`, null],
  [`{{ 1 == 1 ? "a" : "b" }}`, `a`, null],
  [`{{ 1 == 2 ? "a" : "b" }}`, `b`, null],
  [`{{ 1 != 1 ? "a" : "b" }}`, `b`, null],
  [`{{ 1 != 2 ? "a" : "b" }}`, `a`, null],
  [`{{ 3 > 0 && 2 > 0 ? "a" : "b" }}`, `a`, null],
  [`{{ 3 > 0 && -2 > 0 ? "a" : "b" }}`, `b`, null],
  [`{{ 3 > 0 || -2 > 0 ? "a" : "b" }}`, `a`, null],
  [`{{ -3 > 0 || -2 > 0 ? "a" : "b" }}`, `b`, null],
  [`{{ (123) }}`, `123`, null],
  [`{{ ("str") }}`, `str`, null],
  [`{{ ("scaf" + "f") + ("do" + "g") }}`, `scaffdog`, null],

  /**
   * Statements
   */
  [` {{ "a" }} `, ` a `, null],
  [` {{- "a" }} `, `a `, null],
  [` {{ "a" -}} `, ` a`, null],
  [` {{- "a" -}} `, `a`, null],
  [
    `
    {{- "a" -}}
    {{- "b" -}}
    `,
    `ab`,
    null,
  ],
  [` befor {{- "e" }} after `, ` before after `, null],
  [` before {{ "a" -}}  fter `, ` before after `, null],
  [`{{ v := "abc" }}`, ``, null],
  [`{{ v := "abc" }}{{ v }}`, `abc`, null],
  [`{{ v := "a" + "bc" }}{{ v }}`, `abc`, null],
  [`{{ v := 123 }}{{ v }}`, `123`, null],
  [`{{ v := 1 + 23 }}{{ v }}`, `24`, null],
  [`{{ v := true }}{{ v ? "a" : "b" }}`, `a`, null],
  [`{{ v := 1 }}{{ v := v + 1 }}{{ v }}`, `2`, null],
  [`{{ if true }} a {{ end }}`, ` a `, null],
  [`{{ if true -}} a {{- end }}`, `a`, null],
  [`{{ if false }} a {{ end }}`, ``, null],
  [`{{ if true }} a {{ else }} b {{ end }}`, ` a `, null],
  [`{{ if true -}} a {{- else -}} b {{- end }}`, `a`, null],
  [`{{ if false }} a {{ else }} b {{ end }}`, ` b `, null],
  [`{{ if false -}} a {{- else -}} b {{- end }}`, `b`, null],
  [`{{ if false }} a {{ else if false }} b {{ end }}`, ``, null],
  [`{{ if false }} a {{ else if true }} b {{ end }}`, ` b `, null],
  [`{{ if false -}} a {{- else if true -}} b {{- end -}}`, `b`, null],
  [`{{ if true }} a {{ if true }} b {{ end }}{{ end }}`, ` a  b `, null],
  [`{{ if true -}} a {{- if true -}} b {{- end -}}{{- end }}`, `ab`, null],
  [
    `{{ for v in arr }} {{ v }} {{ end }}`,
    ` 1  2  3 `,
    {
      variables: {
        arr: [1, 2, 3],
      },
    },
  ],
  [
    `{{ for v in arr -}} {{ v }} {{- end }}`,
    `123`,
    {
      variables: {
        arr: [1, 2, 3],
      },
    },
  ],
  [
    `{{ for v, i in arr }}{{ v + i }}{{ end }}`,
    `135`,
    {
      variables: {
        arr: [1, 2, 3],
      },
    },
  ],
  [
    `{{ v := "v" }}{{ i := "i" }}{{ for v, i in arr }}{{ v }}{{ i }}{{ end }}{{ v }}{{ i }}`,
    `102132vi`,
    {
      variables: {
        arr: [1, 2, 3],
      },
    },
  ],
  [
    `{{ for v in arr }}{{ if v == 2 }}a{{ continue }}{{ end }}{{ v }}{{ end }}`,
    `1a3`,
    {
      variables: {
        arr: [1, 2, 3],
      },
    },
  ],
  [
    `{{ for v in arr }}{{ if v == 2 }}a{{ break }}{{ end }}{{ v }}{{ end }}`,
    `1a`,
    {
      variables: {
        arr: [1, 2, 3],
      },
    },
  ],
  [
    `{{ for v in arr }}{{ if v == 2 }}a {{- break -}} {{ end }}{{ v }} {{- end }}`,
    `1a`,
    {
      variables: {
        arr: [1, 2, 3],
      },
    },
  ],
  [
    `
    {{"a"-}}
    |
    {{"b"-}}
    |
    {{"c"-}}
    `,
    `
    a|
    b|
    c`,
    null,
  ],
  [
    `
    {{-"a"}}
    |
    {{-"b"}}
    |
    {{-"c"}}
    `,
    `a
    |b
    |c
    `,
    null,
  ],
  [
    `
    {{-"a"-}}
    |
    {{-"b"-}}
    |
    {{-"c"-}}
    `,
    `a|b|c`,
    null,
  ],
  [
    `
    {{- for v1 in arr -}}
      {{- v1 -}}
      {{- for v2 in arr -}}
        {{- if v1 == 2 && v2 == 2 -}}{{- "." -}}{{- break -}}{{- end -}}
        {{- v2 -}}
      {{- end -}}
      {{- if v1 == 2 -}}{{- "/" -}}{{- continue -}}{{- end -}}
      {{- "|" -}}
    {{- end -}}
    `,
    `1123|21./3123|`,
    {
      variables: {
        arr: [1, 2, 3],
      },
    },
  ],
])('compile - %s', (source, expected, extend) => {
  expect(
    compile(
      parse(source, { tags: context.tags }),
      extendContext(context, {
        variables: obj2map(extend?.variables ?? {}),
        helpers: obj2map(extend?.helpers ?? {}),
      }),
    ),
  ).toBe(expected);
});

test.each<[string, RegExp, TestContext | null]>([
  /**
   * Expressions
   */
  [`{{ ident }}`, /"ident".*is not defined/, null],
  [`{{ d.g }}`, /"d".*is not defined/, null],
  [
    `{{ d.g }}`,
    /Property access.*actual: "null"/,
    {
      variables: {
        d: null,
      },
    },
  ],
  [
    `{{ d.__proto__ }}`,
    /Invalid property access/,
    {
      variables: {
        d: null,
      },
    },
  ],
  [
    `{{ d["g"] }}`,
    /Property access.*actual: "null"/,
    {
      variables: {
        d: null,
      },
    },
  ],
  [
    `{{ o[true] }}`,
    /must be string or numeric/,
    {
      variables: {
        o: null,
      },
    },
  ],
  [
    `{{ fn() }}`,
    /"fn" helper function is not defined/,
    {
      helpers: {
        fn: null as any,
      },
    },
  ],
  [
    `{{ fn()() }}`,
    /"undefined" is not a function/,
    {
      helpers: {
        fn: () => {},
      },
    },
  ],
  [
    `{{ ++a }}`,
    /"a".*is not defined/,
    {
      helpers: {
        fn: () => {},
      },
    },
  ],
  [
    `{{ ++a.b }}`,
    /Cannot read properties of "undefined".*reading "b"/,
    {
      variables: {
        a: {},
      },
    },
  ],
  [`{{ +"str" }}`, /Unary operator "\+" cannot be.*"string"/, null],
  [`{{ -null }}`, /Unary operator "-" cannot be.*"null"/, null],
  [
    `{{ ~a }}`,
    /Unary operator "~" cannot be.*"object"/,
    {
      variables: {
        a: {},
      },
    },
  ],
  [`{{ "a" + null }}`, /same data type.*left: "string", right: "null"/, null],
  [`{{ null + "a" }}`, /same data type.*left: "null", right: "string"/, null],
  [`{{ null + null }}`, /Operator "\+" cannot be.*"null" and "null"/, null],
  [`{{ 1 - null }}`, /same data type.*left: "number", right: "null"/, null],
  [`{{ null - 1 }}`, /same data type.*left: "null", right: "number"/, null],
  [`{{ null - null }}`, /Operator "-" cannot be.*"null" and "null"/, null],
  [`{{ 1 * null }}`, /same data type.*left: "number", right: "null"/, null],
  [`{{ null * 1 }}`, /same data type.*left: "null", right: "number"/, null],
  [`{{ null * null }}`, /Operator "\*" cannot be.*"null" and "null"/, null],
  [`{{ 1 / null }}`, /same data type.*left: "number", right: "null"/, null],
  [`{{ null / 1 }}`, /same data type.*left: "null", right: "number"/, null],
  [`{{ null / null }}`, /Operator "\/" cannot be.*"null" and "null"/, null],
  [`{{ 1 % null }}`, /same data type.*left: "number", right: "null"/, null],
  [`{{ null % 1 }}`, /same data type.*left: "null", right: "number"/, null],
  [`{{ null % null }}`, /Operator "%" cannot be.*"null" and "null"/, null],
  [`{{ 1 > null }}`, /same data type.*left: "number", right: "null"/, null],
  [`{{ null < 1 }}`, /same data type.*left: "null", right: "number"/, null],
  [`{{ null < null }}`, /Operator "<" cannot be.*"null" and "null"/, null],
  [`{{ 1 > null }}`, /same data type.*left: "number", right: "null"/, null],
  [`{{ null > 1 }}`, /same data type.*left: "null", right: "number"/, null],
  [`{{ null > null }}`, /Operator ">" cannot be.*"null" and "null"/, null],
  [`{{ 1 >= null }}`, /same data type.*left: "number", right: "null"/, null],
  [`{{ null >= 1 }}`, /same data type.*left: "null", right: "number"/, null],
  [`{{ null >= null }}`, /Operator ">=" cannot be.*"null" and "null"/, null],
  [`{{ 1 <= null }}`, /same data type.*left: "number", right: "null"/, null],
  [`{{ null <= 1 }}`, /same data type.*left: "null", right: "number"/, null],
  [`{{ null <= null }}`, /Operator "<=" cannot be.*"null" and "null"/, null],
])('compile error - %s', (source, expected, extend) => {
  expect(() =>
    compile(
      parse(source, { tags: context.tags }),
      extendContext(context, {
        variables: obj2map(extend?.variables ?? {}),
        helpers: obj2map(extend?.helpers ?? {}),
      }),
    ),
  ).toThrowError(expected);
});
