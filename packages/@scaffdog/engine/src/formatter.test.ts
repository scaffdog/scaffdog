import { test, expect } from 'vitest';
import { format } from './formatter.js';
import { parse } from './parser';

test.each([
  [`raw`, `raw`],
  [`before {{       }} after`, `before {{ }} after`],
  [`before {{-       -}} after`, `before {{- -}} after`],
  [`before {{/*abc*/}} after`, `before {{ /* abc */ }} after`],
  [`before {{/*abc*//*def*/}} after`, `before {{ /* abc */ /* def */ }} after`],
  [
    `
  before {{  /**
* ln1
* ln2\t
*/}} after
      `.trim(),
    `
  before {{ /**
* ln1
* ln2
*/ }} after
      `.trim(),
  ],
  [`before {{null  }} after`, `before {{ null }} after`],
  [`before {{-null  -}} after`, `before {{- null -}} after`],
  [
    `before {{/*a*/null  /*b*/}} after`,
    `before {{ /* a */ null /* b */ }} after`,
  ],
  [`{{undefined}}`, `{{ undefined }}`],
  [`{{true   }}`, `{{ true }}`],
  [`{{ false}}`, `{{ false }}`],
  [`{{ "abc"}}`, `{{ "abc" }}`],
  [`{{ 'abc'}}`, `{{ 'abc' }}`],
  [`{{123}}`, `{{ 123 }}`],
  [`{{   ident   }}`, `{{ ident }}`],
  [`{{ (v  )}}`, `{{ (v) }}`],
  [`{{ ( /*a*/v  /*b*/)}}`, `{{ (/* a */ v /* b */) }}`],
  [`{{ ((v)  )}}`, `{{ ((v)) }}`], // FIXME Remove unnecessary parentheses in the future.
  [`{{ obj.0}}`, `{{ obj.0 }}`],
  [`{{ obj.key}}`, `{{ obj.key }}`],
  [`{{ obj["#key" ]}}`, `{{ obj["#key"] }}`],
  [`{{ obj["key#"]}}`, `{{ obj["key#"] }}`],
  [`{{ obj["else"]}}`, `{{ obj["else"] }}`],
  [`{{ obj["key"]}}`, `{{ obj.key }}`],
  [`{{ obj[0]}}`, `{{ obj.0 }}`],
  [`{{ obj[key]}}`, `{{ obj[key] }}`],
  [`{{ obj[/*a*/"key"/*b*/]}}`, `{{ obj[/* a */ "key" /* b */] }}`],
  [`{{ obj.nest1.nest2}}`, `{{ obj.nest1.nest2 }}`],
  [`{{fn()}}`, `{{ fn() }}`],
  [`{{ /*a*/fn(/*b*/ )}}`, `{{ /* a */ fn(/* b */) }}`],
  [`{{ fn1 "a" "b"}}`, `{{ fn1 "a" "b" }}`],
  [`{{ fn1 "a"|fn2}}`, `{{ fn1 "a" | fn2 }}`],
  [`{{ fn1 "a"|fn2 "b" }}`, `{{ fn1 "a" | fn2 "b" }}`],
  [`{{ inputs.name|fn1 "a"|  fn2}}`, `{{ inputs.name | fn1 "a" | fn2 }}`],
  [`{{ ++a}}`, `{{ ++a }}`],
  [`{{a--}}`, `{{ a-- }}`],
  [`{{  -+~!a}}`, `{{ -+~!a }}`],
  [`{{+(/*a*/ a)}}`, `{{ +(/* a */ a) }}`],
  [`{{ 5*10}}`, `{{ 5 * 10 }}`],
  [`{{1 && 2&& 3}}`, `{{ 1 && 2 && 3 }}`],
  [`{{ true ?"a":"b"        }}`, `{{ true ? "a" : "b" }}`],
  [`{{ /* a */break}}`, `{{ /* a */ break }}`],
  [`{{ v:= ident}}`, `{{ v := ident }}`],
  [
    `{{ /* a*/ v /*b*/:= /*c*/ident}}`,
    `{{ /* a */ v /* b */ := /* c */ ident }}`,
  ],
  [`{{if true }}{{ end}}`, `{{ if true }}{{ end }}`],
  [
    `{{if true }}foo{{ else}}bar{{ end}}`,
    `{{ if true }}foo{{ else }}bar{{ end }}`,
  ],
  [
    `{{if true }}foo{{ else if 1 == 2}}bar{{ end}}`,
    `{{ if true }}foo{{ else if 1 == 2 }}bar{{ end }}`,
  ],
  [
    `{{if /* a*/ true /*b*/ }}{{ /* c*/end}}`,
    `{{ if /* a */ true /* b */ }}{{ /* c */ end }}`,
  ],
  [
    `{{for v in list}}loop{{v-}}{{break}}{{ end}}`,
    `{{ for v in list }}loop{{ v -}}{{ break }}{{ end }}`,
  ],
  [
    `{{for v,index in list  }}loop{{end}}`,
    `{{ for v, index in list }}loop{{ end }}`,
  ],
])('%s -> %s', (source, expected) => {
  const ast = parse(source);
  expect(format(ast)).toBe(expected);
});
