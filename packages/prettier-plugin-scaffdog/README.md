# prettier-plugin-scaffdog

A [Prettier](https://prettier.io) plugin for scaffdog templates that automatically format syntax :dog:

```diff
- {{inputs["name"]    | camel   }}
+ {{ inputs.name | camel }}
```

## Installation

Install via npm:

```bash
$ npm install --save-dev prettier-plugin-scaffdog
```

This plugin is [automatically resolved by Prettier](https://prettier.io/docs/en/plugins.html#using-plugins), so you can start using it immediately after installation.

## Resolving your scaffdog configuration

This plugin reads the [scaffdog project configuration](https://github.com/scaffdog/scaffdog#configuration). This behavior is necessary to resolve custom tags and Markdown file paths. By default, it searches for `.scaffdog` in the same directory as the Prettier configuration file (e.g. `prettier.config.js`).

If the project path cannot be resolved automatically, e.g. the scaffdog project exists in a different file path, use the `scaffdogProject` option to specify a path relative to the Prettier configuration file.

```javascript
// prettier.config.js
module.exports = {
  scaffdogProject: './relative/path/.scaffdog',
};
```
