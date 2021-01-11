# Migration Guide

- [To v1 from v0](#to-v1-from-v0)

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
