# Change Log

## 2.5.0

### Minor Changes

- [#665](https://github.com/scaffdog/scaffdog/pull/665) [`12e2b48`](https://github.com/scaffdog/scaffdog/commit/12e2b4822e5a549244582078659a76665e0e6291) Thanks [@wadackel](https://github.com/wadackel)! - Added two Node APIs.

  - `createScaffdog(options)`
  - `loadScaffdog(path, options)`

### Patch Changes

- [#686](https://github.com/scaffdog/scaffdog/pull/686) [`8ec6e42`](https://github.com/scaffdog/scaffdog/commit/8ec6e427e1a6c85d1726707cb7cc301ef8630bfb) Thanks [@wadackel](https://github.com/wadackel)! - - Add `version` export.
  - Report document parsing errors at an early stage.
- Updated dependencies [[`8ec6e42`](https://github.com/scaffdog/scaffdog/commit/8ec6e427e1a6c85d1726707cb7cc301ef8630bfb), [`0c32135`](https://github.com/scaffdog/scaffdog/commit/0c32135b6fbc1b9871b887c98eb751efdf95886c), [`12e2b48`](https://github.com/scaffdog/scaffdog/commit/12e2b4822e5a549244582078659a76665e0e6291)]:
  - @scaffdog/error@2.5.0
  - @scaffdog/types@2.5.0

## 2.5.0-canary.3

### Patch Changes

- Updated dependencies [[`0c32135`](https://github.com/scaffdog/scaffdog/commit/0c32135b6fbc1b9871b887c98eb751efdf95886c)]:
  - @scaffdog/error@2.5.0-canary.3
  - @scaffdog/types@2.5.0-canary.3

## 2.5.0-canary.2

### Patch Changes

- Updated dependencies []:
  - @scaffdog/error@2.5.0-canary.2
  - @scaffdog/types@2.5.0-canary.2

## 2.5.0-canary.1

### Patch Changes

- [#686](https://github.com/scaffdog/scaffdog/pull/686) [`8ec6e42`](https://github.com/scaffdog/scaffdog/commit/8ec6e427e1a6c85d1726707cb7cc301ef8630bfb) Thanks [@wadackel](https://github.com/wadackel)! - - Add `version` export.
  - Report document parsing errors at an early stage.
- Updated dependencies [[`8ec6e42`](https://github.com/scaffdog/scaffdog/commit/8ec6e427e1a6c85d1726707cb7cc301ef8630bfb)]:
  - @scaffdog/error@2.5.0-canary.1
  - @scaffdog/types@2.5.0-canary.1

## 2.5.0-canary.0

### Minor Changes

- [#665](https://github.com/scaffdog/scaffdog/pull/665) [`12e2b48`](https://github.com/scaffdog/scaffdog/commit/12e2b4822e5a549244582078659a76665e0e6291) Thanks [@wadackel](https://github.com/wadackel)! - Added two Node APIs.

  - `createScaffdog(options)`
  - `loadScaffdog(path, options)`

### Patch Changes

- Updated dependencies [[`12e2b48`](https://github.com/scaffdog/scaffdog/commit/12e2b4822e5a549244582078659a76665e0e6291)]:
  - @scaffdog/types@2.5.0-canary.0
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

- Updated dependencies []:
  - @scaffdog/error@2.4.0
  - @scaffdog/types@2.4.0

## 2.4.0-canary.0

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

- Updated dependencies []:
  - @scaffdog/error@2.4.0-canary.0
  - @scaffdog/types@2.4.0-canary.0

## [2.3.1](https://github.com/scaffdog/scaffdog/compare/v2.3.0...v2.3.1) (2022-09-22)

**Note:** Version bump only for package @scaffdog/engine

# [2.3.0](https://github.com/scaffdog/scaffdog/compare/v2.2.0...v2.3.0) (2022-09-20)

### Features

- **scaffdog:** change to report syntax error earlier ([2778d28](https://github.com/scaffdog/scaffdog/commit/2778d282b1236ec70f6898dbe4924abeef78b208))

# [2.2.0](https://github.com/scaffdog/scaffdog/compare/v2.1.1...v2.2.0) (2022-09-05)

### Features

- **engine:** add `append` helper function ([5c0dcc4](https://github.com/scaffdog/scaffdog/commit/5c0dcc4bb5818f596553b61e0d98caa3f793bfbe))
- **engine:** add `uniq` helper function ([4229d61](https://github.com/scaffdog/scaffdog/commit/4229d6128afdb1b018a6d05a1a68ea7950f2ae3d))

## [2.1.1](https://github.com/scaffdog/scaffdog/compare/v2.1.0...v2.1.1) (2022-09-04)

**Note:** Version bump only for package @scaffdog/engine

# [2.1.0](https://github.com/scaffdog/scaffdog/compare/v2.0.3...v2.1.0) (2022-09-04)

**Note:** Version bump only for package @scaffdog/engine

## [2.0.3](https://github.com/scaffdog/scaffdog/compare/v2.0.2...v2.0.3) (2022-08-24)

**Note:** Version bump only for package @scaffdog/engine

## [2.0.2](https://github.com/scaffdog/scaffdog/compare/v2.0.1...v2.0.2) (2022-08-17)

### Features

- **engine:** add `contains` helper function ([5a5d534](https://github.com/scaffdog/scaffdog/commit/5a5d534788df7981a02bd4c285f78893ab5efe55))

## [2.0.1](https://github.com/scaffdog/scaffdog/compare/v2.0.0...v2.0.1) (2022-08-13)

**Note:** Version bump only for package @scaffdog/engine

# [2.0.0](https://github.com/scaffdog/scaffdog/compare/v2.0.0-canary.7...v2.0.0) (2022-08-13)

**Note:** Version bump only for package @scaffdog/engine

# [2.0.0-canary.7](https://github.com/scaffdog/scaffdog/compare/v2.0.0-canary.6...v2.0.0-canary.7) (2022-08-13)

**Note:** Version bump only for package @scaffdog/engine

# [2.0.0-canary.6](https://github.com/scaffdog/scaffdog/compare/v2.0.0-canary.5...v2.0.0-canary.6) (2022-08-06)

**Note:** Version bump only for package @scaffdog/engine

# [2.0.0-canary.5](https://github.com/scaffdog/scaffdog/compare/v2.0.0-canary.4...v2.0.0-canary.5) (2022-08-06)

**Note:** Version bump only for package @scaffdog/engine

# [2.0.0-canary.4](https://github.com/scaffdog/scaffdog/compare/v2.0.0-canary.3...v2.0.0-canary.4) (2022-08-06)

**Note:** Version bump only for package @scaffdog/engine

# [2.0.0-canary.3](https://github.com/scaffdog/scaffdog/compare/v2.0.0-canary.2...v2.0.0-canary.3) (2022-08-06)

**Note:** Version bump only for package @scaffdog/engine

# [2.0.0-canary.2](https://github.com/scaffdog/scaffdog/compare/v2.0.0-canary.1...v2.0.0-canary.2) (2022-08-06)

**Note:** Version bump only for package @scaffdog/engine

# [2.0.0-canary.1](https://github.com/scaffdog/scaffdog/compare/v2.0.0-canary.0...v2.0.0-canary.1) (2022-08-06)

**Note:** Version bump only for package @scaffdog/engine

# [2.0.0-canary.0](https://github.com/scaffdog/scaffdog/compare/v1.5.0...v2.0.0-canary.0) (2022-08-06)

### Features

- **engine:** add `len` helper function ([9454a89](https://github.com/scaffdog/scaffdog/commit/9454a89de05714a1f17fcc4678345e8391b0ea4f))
- **engine:** add `s2n` & `n2s` helper functions ([c9d16e4](https://github.com/scaffdog/scaffdog/commit/c9d16e44647648cc81d40309a26a656375c08219))
- **engine:** add `seq` helper function ([829782d](https://github.com/scaffdog/scaffdog/commit/829782db12c0821aaca2c6826083dc580a70fd06))
- **engine:** add `slice` helper function ([a1cc461](https://github.com/scaffdog/scaffdog/commit/a1cc4613ac65acd1982353409cd3d12d3f8c816f))
- **engine:** add helper utils ([6875df4](https://github.com/scaffdog/scaffdog/commit/6875df45c53fd7af4ab34f8784aa49e84ef869e5))
- **engine:** renew template engine ([4553a25](https://github.com/scaffdog/scaffdog/commit/4553a25bbae43c38dcaebb97cbe28fa4a24a16fa))

# [1.5.0](https://github.com/scaffdog/scaffdog/compare/v1.4.0...v1.5.0) (2022-06-26)

**Note:** Version bump only for package @scaffdog/engine

# [1.4.0](https://github.com/scaffdog/scaffdog/compare/v1.3.0...v1.4.0) (2022-06-23)

**Note:** Version bump only for package @scaffdog/engine

# [1.3.0](https://github.com/scaffdog/scaffdog/compare/v1.2.1-canary.1...v1.3.0) (2022-06-22)

**Note:** Version bump only for package @scaffdog/engine

## [1.2.1-canary.1](https://github.com/scaffdog/scaffdog/compare/v1.2.1-canary.0...v1.2.1-canary.1) (2022-06-22)

### Features

- **engine:** add `after` helper function ([ff2f1c3](https://github.com/scaffdog/scaffdog/commit/ff2f1c3e793eff429f17e21f7003e9281804aa1a))
- **engine:** add `before` helper function ([9a1002a](https://github.com/scaffdog/scaffdog/commit/9a1002a628d230bd1bae0a4bcea40972c7ac181c))

## [1.2.1-canary.0](https://github.com/scaffdog/scaffdog/compare/v1.2.0...v1.2.1-canary.0) (2022-06-21)

### Bug Fixes

- **engine:** fix parser error when using tag keyword in string ([244fd52](https://github.com/scaffdog/scaffdog/commit/244fd527fc4de3761b4ec4a33f7bde0ec40ef222))

### Features

- **engine:** add `head` helper function ([f34fb67](https://github.com/scaffdog/scaffdog/commit/f34fb678dde9c39c3f13a7477e7144976da5a371))
- **engine:** add `tail` helper function ([be3c7a1](https://github.com/scaffdog/scaffdog/commit/be3c7a1dc442d34226a3ec694970b32d6c3e4e6b))

# [1.2.0](https://github.com/scaffdog/scaffdog/compare/v1.1.0...v1.2.0) (2022-01-25)

### Features

- **engine:** add syntax formatter ([b8006ef](https://github.com/scaffdog/scaffdog/commit/b8006eff94a365b0a230fca0422fafbe85eda8ca))

# [1.1.0](https://github.com/scaffdog/scaffdog/compare/v1.1.0-canary.0...v1.1.0) (2021-12-19)

**Note:** Version bump only for package @scaffdog/engine

# [1.1.0-canary.0](https://github.com/scaffdog/scaffdog/compare/v1.0.1...v1.1.0-canary.0) (2021-12-19)

### Features

- add custom tags ([e761c54](https://github.com/scaffdog/scaffdog/commit/e761c546eb3265ef879454d4a29fcc3972397c43))

## [1.0.1](https://github.com/scaffdog/scaffdog/compare/v1.0.1-canary.0...v1.0.1) (2021-04-11)

**Note:** Version bump only for package @scaffdog/engine

## [1.0.1-canary.0](https://github.com/scaffdog/scaffdog/compare/v1.0.0...v1.0.1-canary.0) (2021-04-11)

### Bug Fixes

- move @scaffdog/types to dependencies from devDependencies ([8ee5eed](https://github.com/scaffdog/scaffdog/commit/8ee5eedd59bf8e0ccbf12a3884e662fe387980b6))

# [1.0.0](https://github.com/scaffdog/scaffdog/compare/v1.0.0-canary.8...v1.0.0) (2021-01-12)

**Note:** Version bump only for package @scaffdog/engine

# [1.0.0-canary.8](https://github.com/scaffdog/scaffdog/compare/v1.0.0-canary.7...v1.0.0-canary.8) (2021-01-12)

**Note:** Version bump only for package @scaffdog/engine

# [1.0.0-canary.7](https://github.com/scaffdog/scaffdog/compare/v1.0.0-canary.6...v1.0.0-canary.7) (2021-01-12)

**Note:** Version bump only for package @scaffdog/engine

# [1.0.0-canary.6](https://github.com/scaffdog/scaffdog/compare/v1.0.0-canary.5...v1.0.0-canary.6) (2021-01-12)

**Note:** Version bump only for package @scaffdog/engine

# [1.0.0-canary.5](https://github.com/scaffdog/scaffdog/compare/v1.0.0-canary.4...v1.0.0-canary.5) (2021-01-12)

**Note:** Version bump only for package @scaffdog/engine

# [1.0.0-canary.4](https://github.com/scaffdog/scaffdog/compare/v1.0.0-canary.3...v1.0.0-canary.4) (2021-01-12)

**Note:** Version bump only for package @scaffdog/engine

# [1.0.0-canary.3](https://github.com/scaffdog/scaffdog/compare/v1.0.0-canary.2...v1.0.0-canary.3) (2021-01-12)

**Note:** Version bump only for package @scaffdog/engine

# [1.0.0-canary.2](https://github.com/scaffdog/scaffdog/compare/v1.0.0-canary.1...v1.0.0-canary.2) (2021-01-12)

### Features

- update define helper function ([8caeb68](https://github.com/scaffdog/scaffdog/commit/8caeb680d666421a3ff42595bdfb3296130c60c9))

# [1.0.0-canary.1](https://github.com/scaffdog/scaffdog/compare/v1.0.0-canary.0...v1.0.0-canary.1) (2021-01-12)

### Features

- improve error message ([4b66723](https://github.com/scaffdog/scaffdog/commit/4b667232ecd6cef7e33a145e7d0f35e8afb2fb81))

# [1.0.0-canary.0](https://github.com/scaffdog/scaffdog/compare/v0.3.0...v1.0.0-canary.0) (2021-01-11)

### Features

- v1 ([4080ec1](https://github.com/scaffdog/scaffdog/commit/4080ec14ef4397bd9061afca92eaf742926e58ac))
