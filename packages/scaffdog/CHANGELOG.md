# Change Log

## 3.0.0-canary.0

### Major Changes

- [#832](https://github.com/scaffdog/scaffdog/pull/832) [`34243f9`](https://github.com/scaffdog/scaffdog/commit/34243f9da86edce9433db8fc1fe0f3734d400bfd) Thanks [@wadackel](https://github.com/wadackel)! - Node v14 support will be discontinued and switched to support from v16.

- [#832](https://github.com/scaffdog/scaffdog/pull/832) [`35c0a82`](https://github.com/scaffdog/scaffdog/commit/35c0a82ccaa2d0202378dd05946160aec65c6cfb) Thanks [@wadackel](https://github.com/wadackel)! - Migrated to ESM.
  Since scaffdog is often used as a CLI tool, there should be little negative impact from ESM migration in many cases.

### Patch Changes

- [`1697dea`](https://github.com/scaffdog/scaffdog/commit/1697dea092264da50999beee31a21ee2c36ba012) Thanks [@wadackel](https://github.com/wadackel)! - Update dependencies.

- Updated dependencies [[`34243f9`](https://github.com/scaffdog/scaffdog/commit/34243f9da86edce9433db8fc1fe0f3734d400bfd), [`35c0a82`](https://github.com/scaffdog/scaffdog/commit/35c0a82ccaa2d0202378dd05946160aec65c6cfb), [`1697dea`](https://github.com/scaffdog/scaffdog/commit/1697dea092264da50999beee31a21ee2c36ba012)]:
  - @scaffdog/config@3.0.0-canary.0
  - @scaffdog/engine@3.0.0-canary.0
  - @scaffdog/error@3.0.0-canary.0
  - @scaffdog/types@3.0.0-canary.0
  - @scaffdog/core@3.0.0-canary.0

## 2.5.1

### Patch Changes

- [#784](https://github.com/scaffdog/scaffdog/pull/784) [`a9b4c0b`](https://github.com/scaffdog/scaffdog/commit/a9b4c0b10ba68f7bbb4f3b74d5454d8cda02db08) Thanks [@wadackel](https://github.com/wadackel)! - Fixes for `safe-eval` vulnerability issues.
  Fixes to remove `safe-eval` as a dependency and use `vm.runInNewContext` instead.
  Since scaffdog is intended to be used in a development environment, it is assumed that the input code is safe. Do not use the `eval` helper function in situations where it receives input from third parties.

  Fixes: #766

- Updated dependencies [[`a9b4c0b`](https://github.com/scaffdog/scaffdog/commit/a9b4c0b10ba68f7bbb4f3b74d5454d8cda02db08), [`7659ec1`](https://github.com/scaffdog/scaffdog/commit/7659ec176125d213cd03ffec7cfac6066a8716b1)]:
  - @scaffdog/engine@2.5.1
  - @scaffdog/error@2.5.1
  - @scaffdog/core@2.5.1
  - @scaffdog/config@2.5.1
  - @scaffdog/types@2.5.1

## 2.5.0

### Minor Changes

- [#665](https://github.com/scaffdog/scaffdog/pull/665) [`12e2b48`](https://github.com/scaffdog/scaffdog/commit/12e2b4822e5a549244582078659a76665e0e6291) Thanks [@wadackel](https://github.com/wadackel)! - Added two Node APIs.

  - `createScaffdog(options)`
  - `loadScaffdog(path, options)`

### Patch Changes

- [#686](https://github.com/scaffdog/scaffdog/pull/686) [`8ec6e42`](https://github.com/scaffdog/scaffdog/commit/8ec6e427e1a6c85d1726707cb7cc301ef8630bfb) Thanks [@wadackel](https://github.com/wadackel)! - - Add `version` export.

  - Report document parsing errors at an early stage.

- [#695](https://github.com/scaffdog/scaffdog/pull/695) [`0c32135`](https://github.com/scaffdog/scaffdog/commit/0c32135b6fbc1b9871b887c98eb751efdf95886c) Thanks [@wadackel](https://github.com/wadackel)! - Add `ScaffdogAggregateError` custom error class.

  ```typescript
  import { ScaffdogAggregateError } from '@scaffdog/error';
  // or
  // import { ScaffdogAggregateError } from 'scaffdog';
  ```

- [#691](https://github.com/scaffdog/scaffdog/pull/691) [`b325ef5`](https://github.com/scaffdog/scaffdog/commit/b325ef5d6cecb60aa1b0ee23b1e5da9a1792bf39) Thanks [@wadackel](https://github.com/wadackel)! - Add missing exports.

  - `Variable`
  - `Question*`
  - `DocumentAttributes`

- Updated dependencies [[`8ec6e42`](https://github.com/scaffdog/scaffdog/commit/8ec6e427e1a6c85d1726707cb7cc301ef8630bfb), [`0c32135`](https://github.com/scaffdog/scaffdog/commit/0c32135b6fbc1b9871b887c98eb751efdf95886c), [`12e2b48`](https://github.com/scaffdog/scaffdog/commit/12e2b4822e5a549244582078659a76665e0e6291)]:
  - @scaffdog/config@2.5.0
  - @scaffdog/engine@2.5.0
  - @scaffdog/error@2.5.0
  - @scaffdog/types@2.5.0
  - @scaffdog/core@2.5.0

## 2.5.0-canary.3

### Patch Changes

- [#695](https://github.com/scaffdog/scaffdog/pull/695) [`0c32135`](https://github.com/scaffdog/scaffdog/commit/0c32135b6fbc1b9871b887c98eb751efdf95886c) Thanks [@wadackel](https://github.com/wadackel)! - Add `ScaffdogAggregateError` custom error class.

  ```typescript
  import { ScaffdogAggregateError } from '@scaffdog/error';
  // or
  // import { ScaffdogAggregateError } from 'scaffdog';
  ```

- Updated dependencies [[`0c32135`](https://github.com/scaffdog/scaffdog/commit/0c32135b6fbc1b9871b887c98eb751efdf95886c)]:
  - @scaffdog/error@2.5.0-canary.3
  - @scaffdog/engine@2.5.0-canary.3
  - @scaffdog/core@2.5.0-canary.3
  - @scaffdog/config@2.5.0-canary.3
  - @scaffdog/types@2.5.0-canary.3

## 2.5.0-canary.2

### Patch Changes

- [#691](https://github.com/scaffdog/scaffdog/pull/691) [`b325ef5`](https://github.com/scaffdog/scaffdog/commit/b325ef5d6cecb60aa1b0ee23b1e5da9a1792bf39) Thanks [@wadackel](https://github.com/wadackel)! - Add missing exports.

  - `Variable`
  - `Question*`
  - `DocumentAttributes`

- Updated dependencies []:
  - @scaffdog/config@2.5.0-canary.2
  - @scaffdog/core@2.5.0-canary.2
  - @scaffdog/engine@2.5.0-canary.2
  - @scaffdog/error@2.5.0-canary.2
  - @scaffdog/types@2.5.0-canary.2

## 2.5.0-canary.1

### Patch Changes

- [#686](https://github.com/scaffdog/scaffdog/pull/686) [`8ec6e42`](https://github.com/scaffdog/scaffdog/commit/8ec6e427e1a6c85d1726707cb7cc301ef8630bfb) Thanks [@wadackel](https://github.com/wadackel)! - - Add `version` export.
  - Report document parsing errors at an early stage.
- Updated dependencies [[`8ec6e42`](https://github.com/scaffdog/scaffdog/commit/8ec6e427e1a6c85d1726707cb7cc301ef8630bfb)]:
  - @scaffdog/config@2.5.0-canary.1
  - @scaffdog/engine@2.5.0-canary.1
  - @scaffdog/error@2.5.0-canary.1
  - @scaffdog/types@2.5.0-canary.1
  - @scaffdog/core@2.5.0-canary.1

## 2.5.0-canary.0

### Minor Changes

- [#665](https://github.com/scaffdog/scaffdog/pull/665) [`12e2b48`](https://github.com/scaffdog/scaffdog/commit/12e2b4822e5a549244582078659a76665e0e6291) Thanks [@wadackel](https://github.com/wadackel)! - Added two Node APIs.

  - `createScaffdog(options)`
  - `loadScaffdog(path, options)`

### Patch Changes

- Updated dependencies [[`12e2b48`](https://github.com/scaffdog/scaffdog/commit/12e2b4822e5a549244582078659a76665e0e6291)]:
  - @scaffdog/config@2.5.0-canary.0
  - @scaffdog/types@2.5.0-canary.0
  - @scaffdog/core@2.5.0-canary.0
  - @scaffdog/engine@2.5.0-canary.0
  - @scaffdog/error@2.5.0-canary.0

## 2.4.0

### Minor Changes

- [#502](https://github.com/scaffdog/scaffdog/pull/502) [`f41a2b1`](https://github.com/scaffdog/scaffdog/commit/f41a2b1ab98e0ae2b55c47550b71c84eab759d40) Thanks [@wadackel](https://github.com/wadackel)! - Add `plur` helper function.

  ```clike
  {{ "dog" | plur }}
  --> dogs

  {{ "dog" | plur 1 }}
  --> dog

  {{ "dog" | plur 2 }}
  --> dogs
  ```

### Patch Changes

- Updated dependencies [[`f41a2b1`](https://github.com/scaffdog/scaffdog/commit/f41a2b1ab98e0ae2b55c47550b71c84eab759d40)]:
  - @scaffdog/engine@2.4.0
  - @scaffdog/core@2.4.0
  - @scaffdog/config@2.4.0
  - @scaffdog/error@2.4.0
  - @scaffdog/types@2.4.0

## 2.4.0-canary.0

### Patch Changes

- Updated dependencies [[`f41a2b1`](https://github.com/scaffdog/scaffdog/commit/f41a2b1ab98e0ae2b55c47550b71c84eab759d40)]:
  - @scaffdog/engine@2.4.0-canary.0
  - @scaffdog/core@2.4.0-canary.0
  - @scaffdog/config@2.4.0-canary.0
  - @scaffdog/error@2.4.0-canary.0
  - @scaffdog/types@2.4.0-canary.0

## [2.3.1](https://github.com/scaffdog/scaffdog/compare/v2.3.0...v2.3.1) (2022-09-22)

### Bug Fixes

- **scaffdog:** fix a validation miss in input prompt ([ca11b67](https://github.com/scaffdog/scaffdog/commit/ca11b67b195f76c990e75e5d7c147da203ad7401))

# [2.3.0](https://github.com/scaffdog/scaffdog/compare/v2.2.0...v2.3.0) (2022-09-20)

### Features

- **scaffdog:** add `answer` flag ([4e726be](https://github.com/scaffdog/scaffdog/commit/4e726bea5fc7ed6c4a5d8e4501a122bd324c5125))
- **scaffdog:** add `output` flag ([5d4e723](https://github.com/scaffdog/scaffdog/commit/5d4e723b0acf37465d87361668cc2ad222cb1968))
- **scaffdog:** change to report syntax error earlier ([2778d28](https://github.com/scaffdog/scaffdog/commit/2778d282b1236ec70f6898dbe4924abeef78b208))

# [2.2.0](https://github.com/scaffdog/scaffdog/compare/v2.1.1...v2.2.0) (2022-09-05)

**Note:** Version bump only for package scaffdog

## [2.1.1](https://github.com/scaffdog/scaffdog/compare/v2.1.0...v2.1.1) (2022-09-04)

**Note:** Version bump only for package scaffdog

# [2.1.0](https://github.com/scaffdog/scaffdog/compare/v2.0.3...v2.1.0) (2022-09-04)

### Features

- **scaffdog:** add support for Fake ESM and TypeScript config file ([49e4427](https://github.com/scaffdog/scaffdog/commit/49e442739f68dbf7795c65fb94fc47572e8df454))

## [2.0.3](https://github.com/scaffdog/scaffdog/compare/v2.0.2...v2.0.3) (2022-08-24)

### Bug Fixes

- **scaffdog:** fix a bug that `inputs` could not be referenced in the variables section ([40531e3](https://github.com/scaffdog/scaffdog/commit/40531e39be50e77799b012f9a9c67ba95dc576af))

## [2.0.2](https://github.com/scaffdog/scaffdog/compare/v2.0.1...v2.0.2) (2022-08-17)

### Features

- **scaffdog:** add `if` field to `questions` attribute ([2baea63](https://github.com/scaffdog/scaffdog/commit/2baea63dc4e89b6709a9752d666df7374daeb3c5))

## [2.0.1](https://github.com/scaffdog/scaffdog/compare/v2.0.0...v2.0.1) (2022-08-13)

### Bug Fixes

- update initial template url ([f055ae3](https://github.com/scaffdog/scaffdog/commit/f055ae37e36eaaab2cd470d8911e5dd7709f416c))

# [2.0.0](https://github.com/scaffdog/scaffdog/compare/v2.0.0-canary.7...v2.0.0) (2022-08-13)

### Bug Fixes

- **scaffdog:** fix document parse bug ([77dcf67](https://github.com/scaffdog/scaffdog/commit/77dcf6767744f6272cbb9be32c81c73bbf8ef95a))

# [2.0.0-canary.7](https://github.com/scaffdog/scaffdog/compare/v2.0.0-canary.6...v2.0.0-canary.7) (2022-08-13)

**Note:** Version bump only for package scaffdog

# [2.0.0-canary.6](https://github.com/scaffdog/scaffdog/compare/v2.0.0-canary.5...v2.0.0-canary.6) (2022-08-06)

**Note:** Version bump only for package scaffdog

# [2.0.0-canary.5](https://github.com/scaffdog/scaffdog/compare/v2.0.0-canary.4...v2.0.0-canary.5) (2022-08-06)

### Features

- **scaffdog:** add file generation skip token ([e413dc9](https://github.com/scaffdog/scaffdog/commit/e413dc99e4f15bcf873ec677b95802c8ae952dfb))

# [2.0.0-canary.4](https://github.com/scaffdog/scaffdog/compare/v2.0.0-canary.3...v2.0.0-canary.4) (2022-08-06)

**Note:** Version bump only for package scaffdog

# [2.0.0-canary.3](https://github.com/scaffdog/scaffdog/compare/v2.0.0-canary.2...v2.0.0-canary.3) (2022-08-06)

**Note:** Version bump only for package scaffdog

# [2.0.0-canary.2](https://github.com/scaffdog/scaffdog/compare/v2.0.0-canary.1...v2.0.0-canary.2) (2022-08-06)

**Note:** Version bump only for package scaffdog

# [2.0.0-canary.1](https://github.com/scaffdog/scaffdog/compare/v2.0.0-canary.0...v2.0.0-canary.1) (2022-08-06)

**Note:** Version bump only for package scaffdog

# [2.0.0-canary.0](https://github.com/scaffdog/scaffdog/compare/v1.5.0...v2.0.0-canary.0) (2022-08-06)

### Features

- **engine:** add `len` helper function ([9454a89](https://github.com/scaffdog/scaffdog/commit/9454a89de05714a1f17fcc4678345e8391b0ea4f))
- **engine:** add `s2n` & `n2s` helper functions ([c9d16e4](https://github.com/scaffdog/scaffdog/commit/c9d16e44647648cc81d40309a26a656375c08219))
- **engine:** add `seq` helper function ([829782d](https://github.com/scaffdog/scaffdog/commit/829782db12c0821aaca2c6826083dc580a70fd06))
- **engine:** add `slice` helper function ([a1cc461](https://github.com/scaffdog/scaffdog/commit/a1cc4613ac65acd1982353409cd3d12d3f8c816f))
- **engine:** add helper utils ([6875df4](https://github.com/scaffdog/scaffdog/commit/6875df45c53fd7af4ab34f8784aa49e84ef869e5))
- **engine:** renew template engine ([4553a25](https://github.com/scaffdog/scaffdog/commit/4553a25bbae43c38dcaebb97cbe28fa4a24a16fa))
- **scaffdog:** add confirm and checkbox question type ([512adfc](https://github.com/scaffdog/scaffdog/commit/512adfc0369a6dffe72fac43ed9c073de43dab3e))
- **scaffdog:** improve document parsing error message ([9774dd7](https://github.com/scaffdog/scaffdog/commit/9774dd75229b9cfdd48f49e6bbedc80b73f3f74c))

# [1.5.0](https://github.com/scaffdog/scaffdog/compare/v1.4.0...v1.5.0) (2022-06-26)

### Features

- **core:** add `output.root` variable ([57baef8](https://github.com/scaffdog/scaffdog/commit/57baef84bde86c92976416a738e5c28ef397f47e))
- **scaffdog:** add `--force` flag ([142e8c1](https://github.com/scaffdog/scaffdog/commit/142e8c1bb2629737930c2e1844072e46596f3986))

# [1.4.0](https://github.com/scaffdog/scaffdog/compare/v1.3.0...v1.4.0) (2022-06-23)

### Features

- **scaffdog:** add `cwd` variable ([ada5d96](https://github.com/scaffdog/scaffdog/commit/ada5d96e6a82e411fe5cf6d4cf8ec641a6c750e5))
- **scaffdog:** add `document.dir` variable ([f538027](https://github.com/scaffdog/scaffdog/commit/f5380274e6eb4fc4d6cc3fc94a60a64e8e1e8285))
- **scaffdog:** add `resolve` helper function ([440bc50](https://github.com/scaffdog/scaffdog/commit/440bc507d7be9a86325eb5cff24386e78500d792))

# [1.3.0](https://github.com/scaffdog/scaffdog/compare/v1.2.1-canary.1...v1.3.0) (2022-06-22)

**Note:** Version bump only for package scaffdog

## [1.2.1-canary.1](https://github.com/scaffdog/scaffdog/compare/v1.2.1-canary.0...v1.2.1-canary.1) (2022-06-22)

### Features

- **engine:** add `after` helper function ([ff2f1c3](https://github.com/scaffdog/scaffdog/commit/ff2f1c3e793eff429f17e21f7003e9281804aa1a))
- **engine:** add `before` helper function ([9a1002a](https://github.com/scaffdog/scaffdog/commit/9a1002a628d230bd1bae0a4bcea40972c7ac181c))

## [1.2.1-canary.0](https://github.com/scaffdog/scaffdog/compare/v1.2.0...v1.2.1-canary.0) (2022-06-21)

### Features

- **engine:** add `head` helper function ([f34fb67](https://github.com/scaffdog/scaffdog/commit/f34fb678dde9c39c3f13a7477e7144976da5a371))
- **engine:** add `tail` helper function ([be3c7a1](https://github.com/scaffdog/scaffdog/commit/be3c7a1dc442d34226a3ec694970b32d6c3e4e6b))

# [1.2.0](https://github.com/scaffdog/scaffdog/compare/v1.1.0...v1.2.0) (2022-01-25)

**Note:** Version bump only for package scaffdog

# [1.1.0](https://github.com/scaffdog/scaffdog/compare/v1.1.0-canary.0...v1.1.0) (2021-12-19)

**Note:** Version bump only for package scaffdog

# [1.1.0-canary.0](https://github.com/scaffdog/scaffdog/compare/v1.0.1...v1.1.0-canary.0) (2021-12-19)

### Features

- add custom tags ([e761c54](https://github.com/scaffdog/scaffdog/commit/e761c546eb3265ef879454d4a29fcc3972397c43))

## [1.0.1](https://github.com/scaffdog/scaffdog/compare/v1.0.1-canary.0...v1.0.1) (2021-04-11)

**Note:** Version bump only for package scaffdog

## [1.0.1-canary.0](https://github.com/scaffdog/scaffdog/compare/v1.0.0...v1.0.1-canary.0) (2021-04-11)

### Bug Fixes

- move @scaffdog/types to dependencies from devDependencies ([8ee5eed](https://github.com/scaffdog/scaffdog/commit/8ee5eedd59bf8e0ccbf12a3884e662fe387980b6))
- update dependency inquirer to v8 ([6270eaf](https://github.com/scaffdog/scaffdog/commit/6270eaf539f8fb028666a401b60ed3500be6d82e))

### Features

- **error:** add `format` method ([a161ffd](https://github.com/scaffdog/scaffdog/commit/a161ffd8f7620a12c3348a45350f641e7a8ae48d))

# [1.0.0](https://github.com/scaffdog/scaffdog/compare/v1.0.0-canary.8...v1.0.0) (2021-01-12)

**Note:** Version bump only for package scaffdog

# [1.0.0-canary.8](https://github.com/scaffdog/scaffdog/compare/v1.0.0-canary.7...v1.0.0-canary.8) (2021-01-12)

### Bug Fixes

- **scaffdog:** fix searching directories behavior when using magic pattern ([8052b4b](https://github.com/scaffdog/scaffdog/commit/8052b4baf65dbfa264bb6af813b7193bf1525332))

# [1.0.0-canary.7](https://github.com/scaffdog/scaffdog/compare/v1.0.0-canary.6...v1.0.0-canary.7) (2021-01-12)

### Bug Fixes

- **scaffdog:** fix output field handling ([4b90771](https://github.com/scaffdog/scaffdog/commit/4b90771e36cf39f70434401d289ec051dc5bfc0d))

# [1.0.0-canary.6](https://github.com/scaffdog/scaffdog/compare/v1.0.0-canary.5...v1.0.0-canary.6) (2021-01-12)

### Features

- **scaffdog:** improve dry-run output ([67d2977](https://github.com/scaffdog/scaffdog/commit/67d2977f311987a510bf9c0663acb85c99ec49e6))
- **scaffdog:** support multiple output ([7410dc4](https://github.com/scaffdog/scaffdog/commit/7410dc4db2b7cacbd1beea461343696b01b7f534))

# [1.0.0-canary.5](https://github.com/scaffdog/scaffdog/compare/v1.0.0-canary.4...v1.0.0-canary.5) (2021-01-12)

**Note:** Version bump only for package scaffdog

# [1.0.0-canary.4](https://github.com/scaffdog/scaffdog/compare/v1.0.0-canary.3...v1.0.0-canary.4) (2021-01-12)

**Note:** Version bump only for package scaffdog

# [1.0.0-canary.3](https://github.com/scaffdog/scaffdog/compare/v1.0.0-canary.2...v1.0.0-canary.3) (2021-01-12)

**Note:** Version bump only for package scaffdog

# [1.0.0-canary.2](https://github.com/scaffdog/scaffdog/compare/v1.0.0-canary.1...v1.0.0-canary.2) (2021-01-12)

### Features

- update define helper function ([8caeb68](https://github.com/scaffdog/scaffdog/commit/8caeb680d666421a3ff42595bdfb3296130c60c9))

# [1.0.0-canary.1](https://github.com/scaffdog/scaffdog/compare/v1.0.0-canary.0...v1.0.0-canary.1) (2021-01-12)

**Note:** Version bump only for package scaffdog

# [1.0.0-canary.0](https://github.com/scaffdog/scaffdog/compare/v0.3.0...v1.0.0-canary.0) (2021-01-11)

### Features

- v1 ([4080ec1](https://github.com/scaffdog/scaffdog/commit/4080ec14ef4397bd9061afca92eaf742926e58ac))
