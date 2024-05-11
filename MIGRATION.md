# Migration Guide

- [To v4 from v3](#to-v4-from-v3)
- [To v3 from v2](#to-v3-from-v2)
- [To v2 from v1](#to-v2-from-v1)
- [To v1 from v0](#to-v1-from-v0)

## To v4 from v3

### Node.js version

Support has been changed to `v18.0.0` or later to match the Node.js release cycle. This is the only breaking change.

## To v3 from v2

This will be a major update with minimal impact on many users who use scaffdog as a CLI.

### Node.js version

Support has been changed to `v16.0.0` or later to match the Node.js release cycle. This is the only breaking change.

### Pure ESM package

This package is now the Pure ESM package.  
Please see [sindresorhus/esm-package.md](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).

If you are using scaffdog as API, please migrate to ESM.

#### VSCode User

Users of [scaffdog/vscode](https://github.com/scaffdog/vscode) should use `v0.1.0` or later version. This version supports ESM and CommonJS. If you are using a version less than `v0.1.0`, you will not be able to load the ESM and an error will occur.

## To v2 from v1

This Major update is hardly disruptive :clap:

### Node.js version

Support has been changed to `v14.16.0` or later to match the Node.js release cycle. This is the only breaking change.

### Variable Declaration

Syntax support has been added, whereas previously only variable definitions using the `define` helper function were supported.

**Before:**

```
{{ inputs.value | camel | define "name" }}
```

**After:**

```
{{ name := inputs.value | camel }}
```

You can still use `define` for some use cases.

## To v1 from v0

scaffdog has reached its first major version :tada:

### Configuration

Configuration file is now required. To reproduce the same behavior as v0, write the following configuration in `.scaffdog/config.js`.

```typescript
module.exports = {
  files: ['./*'],
};
```

### CLI

The CLI options and subcommands have changed as follows:

| From                       | To                       |
| :------------------------- | :----------------------- |
| `--templateDir`            | `--project`              |
| `scaffdog template [name]` | `scaffdog create [name]` |

### Templates

#### Structure

##### `message`

The `message` field has been removed. Use the `questions` field instead.

```diff
  ---
  name: 'utility'
  root: 'src/utils'
  output: '**/*'
- message: 'Please enter a filename.'
+ questions:
+   value: 'Please enter a filename.'
  ---
```

##### `description`

The `description` field has been removed.

```diff
  ---
  name: 'utility'
- description: 'Generate utility function.'
  root: 'src/utils'
  output: '**/*'
  questions:
    value: 'Please enter a filename.'
  ---
```

##### `output`

The `output` field is backwards compatible.  
As a behavior addition, you can now also receive string arrays.

```markdown
---
name: 'utility'
root: '.'
output: ['**/internal', 'utilities/**/*']
---
```

or

```markdown
---
name: 'utility'
root: '.'
output: '(**/internal|utilities/**/*)'
---
```

#### Variables

The built-in variables of scaffdog have changed significantly. The changed variables are:

| From       | To            |
| :--------- | :------------ |
| `input`    | `inputs.XXX`  |
| `output`   | `output.path` |
| `filename` | `output.name` |
| `dirname`  | `output.dir`  |
| `basename` | `output.base` |
| `extname`  | `output.ext`  |
| `root`     | **REMOVED**   |

Here is an example of variables migration.

````diff
  ---
  name: 'utility'
  root: 'src/utils'
  output: '**/*'
  ignore: []
  questions:
    name: 'Please enter a filename.'
  ---

- # `{{ input }}.js`
+ # `{{ inputs.name }}.js`

  ```javascript
- export const {{ input | camel }} = () => true;
+ export const {{ inputs.name | camel }} = () => true;
  ```
````
