# Change Log

## 4.1.0

### Minor Changes

- [#1278](https://github.com/scaffdog/scaffdog/pull/1278) [`69cab45`](https://github.com/scaffdog/scaffdog/commit/69cab458f5571a56892b1ede55936d306a5326ec) Thanks [@wadackel](https://github.com/wadackel)! - The `Config` type is now exported, allowing you to write configuration files in a type-safe manner.

### Patch Changes

- Updated dependencies [[`69cab45`](https://github.com/scaffdog/scaffdog/commit/69cab458f5571a56892b1ede55936d306a5326ec)]:
  - @scaffdog/engine@4.1.0
  - @scaffdog/types@4.1.0
  - @scaffdog/config@4.1.0

## 4.0.0

### Major Changes

- [#1144](https://github.com/scaffdog/scaffdog/pull/1144) [`c77d3cb`](https://github.com/scaffdog/scaffdog/commit/c77d3cbeab056640d9b3d211e94c92393afcb90f) Thanks [@wadackel](https://github.com/wadackel)! - Require Node.js 18

### Patch Changes

- Updated dependencies [[`757ccf1`](https://github.com/scaffdog/scaffdog/commit/757ccf1f3754498f250d4ed7ab7292ba7f063597), [`c77d3cb`](https://github.com/scaffdog/scaffdog/commit/c77d3cbeab056640d9b3d211e94c92393afcb90f)]:
  - @scaffdog/engine@4.0.0
  - @scaffdog/config@4.0.0
  - @scaffdog/types@4.0.0

## 3.0.0

### Major Changes

- [#832](https://github.com/scaffdog/scaffdog/pull/832) [`34243f9`](https://github.com/scaffdog/scaffdog/commit/34243f9da86edce9433db8fc1fe0f3734d400bfd) Thanks [@wadackel](https://github.com/wadackel)! - Node v14 support will be discontinued and switched to support from v16.

- [#832](https://github.com/scaffdog/scaffdog/pull/832) [`35c0a82`](https://github.com/scaffdog/scaffdog/commit/35c0a82ccaa2d0202378dd05946160aec65c6cfb) Thanks [@wadackel](https://github.com/wadackel)! - Migrated to ESM.
  Since scaffdog is often used as a CLI tool, there should be little negative impact from ESM migration in many cases.

### Patch Changes

- [`1697dea`](https://github.com/scaffdog/scaffdog/commit/1697dea092264da50999beee31a21ee2c36ba012) Thanks [@wadackel](https://github.com/wadackel)! - Update dependencies.

- Updated dependencies [[`34243f9`](https://github.com/scaffdog/scaffdog/commit/34243f9da86edce9433db8fc1fe0f3734d400bfd), [`35c0a82`](https://github.com/scaffdog/scaffdog/commit/35c0a82ccaa2d0202378dd05946160aec65c6cfb), [`1697dea`](https://github.com/scaffdog/scaffdog/commit/1697dea092264da50999beee31a21ee2c36ba012)]:
  - @scaffdog/config@3.0.0
  - @scaffdog/engine@3.0.0
  - @scaffdog/types@3.0.0

## 3.0.0-canary.1

### Patch Changes

- Updated dependencies []:
  - @scaffdog/config@3.0.0-canary.1
  - @scaffdog/engine@3.0.0-canary.1
  - @scaffdog/types@3.0.0-canary.1

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
  - @scaffdog/types@3.0.0-canary.0

## 2.5.1

### Patch Changes

- Updated dependencies [[`a9b4c0b`](https://github.com/scaffdog/scaffdog/commit/a9b4c0b10ba68f7bbb4f3b74d5454d8cda02db08)]:
  - @scaffdog/engine@2.5.1
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
- Updated dependencies [[`8ec6e42`](https://github.com/scaffdog/scaffdog/commit/8ec6e427e1a6c85d1726707cb7cc301ef8630bfb), [`12e2b48`](https://github.com/scaffdog/scaffdog/commit/12e2b4822e5a549244582078659a76665e0e6291)]:
  - @scaffdog/config@2.5.0
  - @scaffdog/engine@2.5.0
  - @scaffdog/types@2.5.0

## 2.5.0-canary.3

### Patch Changes

- Updated dependencies []:
  - @scaffdog/engine@2.5.0-canary.3
  - @scaffdog/config@2.5.0-canary.3
  - @scaffdog/types@2.5.0-canary.3

## 2.5.0-canary.2

### Patch Changes

- Updated dependencies []:
  - @scaffdog/config@2.5.0-canary.2
  - @scaffdog/engine@2.5.0-canary.2
  - @scaffdog/types@2.5.0-canary.2

## 2.5.0-canary.1

### Patch Changes

- [#686](https://github.com/scaffdog/scaffdog/pull/686) [`8ec6e42`](https://github.com/scaffdog/scaffdog/commit/8ec6e427e1a6c85d1726707cb7cc301ef8630bfb) Thanks [@wadackel](https://github.com/wadackel)! - - Add `version` export.
  - Report document parsing errors at an early stage.
- Updated dependencies [[`8ec6e42`](https://github.com/scaffdog/scaffdog/commit/8ec6e427e1a6c85d1726707cb7cc301ef8630bfb)]:
  - @scaffdog/config@2.5.0-canary.1
  - @scaffdog/engine@2.5.0-canary.1
  - @scaffdog/types@2.5.0-canary.1

## 2.5.0-canary.0

### Minor Changes

- [#665](https://github.com/scaffdog/scaffdog/pull/665) [`12e2b48`](https://github.com/scaffdog/scaffdog/commit/12e2b4822e5a549244582078659a76665e0e6291) Thanks [@wadackel](https://github.com/wadackel)! - Added two Node APIs.

  - `createScaffdog(options)`
  - `loadScaffdog(path, options)`

### Patch Changes

- Updated dependencies [[`12e2b48`](https://github.com/scaffdog/scaffdog/commit/12e2b4822e5a549244582078659a76665e0e6291)]:
  - @scaffdog/config@2.5.0-canary.0
  - @scaffdog/types@2.5.0-canary.0
  - @scaffdog/engine@2.5.0-canary.0

## 2.4.0

### Patch Changes

- Updated dependencies [[`f41a2b1`](https://github.com/scaffdog/scaffdog/commit/f41a2b1ab98e0ae2b55c47550b71c84eab759d40)]:
  - @scaffdog/engine@2.4.0
  - @scaffdog/config@2.4.0
  - @scaffdog/types@2.4.0

## 2.4.0-canary.0

### Patch Changes

- Updated dependencies [[`f41a2b1`](https://github.com/scaffdog/scaffdog/commit/f41a2b1ab98e0ae2b55c47550b71c84eab759d40)]:
  - @scaffdog/engine@2.4.0-canary.0
  - @scaffdog/config@2.4.0-canary.0
  - @scaffdog/types@2.4.0-canary.0

## [2.3.1](https://github.com/scaffdog/scaffdog/compare/v2.3.0...v2.3.1) (2022-09-22)

**Note:** Version bump only for package prettier-plugin-scaffdog

# [2.3.0](https://github.com/scaffdog/scaffdog/compare/v2.2.0...v2.3.0) (2022-09-20)

**Note:** Version bump only for package prettier-plugin-scaffdog

# [2.2.0](https://github.com/scaffdog/scaffdog/compare/v2.1.1...v2.2.0) (2022-09-05)

**Note:** Version bump only for package prettier-plugin-scaffdog

## [2.1.1](https://github.com/scaffdog/scaffdog/compare/v2.1.0...v2.1.1) (2022-09-04)

**Note:** Version bump only for package prettier-plugin-scaffdog

# [2.1.0](https://github.com/scaffdog/scaffdog/compare/v2.0.3...v2.1.0) (2022-09-04)

### Features

- **scaffdog:** add support for Fake ESM and TypeScript config file ([49e4427](https://github.com/scaffdog/scaffdog/commit/49e442739f68dbf7795c65fb94fc47572e8df454))

## [2.0.3](https://github.com/scaffdog/scaffdog/compare/v2.0.2...v2.0.3) (2022-08-24)

**Note:** Version bump only for package prettier-plugin-scaffdog

## [2.0.2](https://github.com/scaffdog/scaffdog/compare/v2.0.1...v2.0.2) (2022-08-17)

**Note:** Version bump only for package prettier-plugin-scaffdog

## [2.0.1](https://github.com/scaffdog/scaffdog/compare/v2.0.0...v2.0.1) (2022-08-13)

**Note:** Version bump only for package prettier-plugin-scaffdog

# [2.0.0](https://github.com/scaffdog/scaffdog/compare/v2.0.0-canary.7...v2.0.0) (2022-08-13)

**Note:** Version bump only for package prettier-plugin-scaffdog

# [2.0.0-canary.7](https://github.com/scaffdog/scaffdog/compare/v2.0.0-canary.6...v2.0.0-canary.7) (2022-08-13)

**Note:** Version bump only for package prettier-plugin-scaffdog

# [2.0.0-canary.6](https://github.com/scaffdog/scaffdog/compare/v2.0.0-canary.5...v2.0.0-canary.6) (2022-08-06)

**Note:** Version bump only for package prettier-plugin-scaffdog

# [2.0.0-canary.5](https://github.com/scaffdog/scaffdog/compare/v2.0.0-canary.4...v2.0.0-canary.5) (2022-08-06)

**Note:** Version bump only for package prettier-plugin-scaffdog

# [2.0.0-canary.4](https://github.com/scaffdog/scaffdog/compare/v2.0.0-canary.3...v2.0.0-canary.4) (2022-08-06)

**Note:** Version bump only for package prettier-plugin-scaffdog

# [2.0.0-canary.3](https://github.com/scaffdog/scaffdog/compare/v2.0.0-canary.2...v2.0.0-canary.3) (2022-08-06)

**Note:** Version bump only for package prettier-plugin-scaffdog

# [2.0.0-canary.2](https://github.com/scaffdog/scaffdog/compare/v2.0.0-canary.1...v2.0.0-canary.2) (2022-08-06)

**Note:** Version bump only for package prettier-plugin-scaffdog

# [2.0.0-canary.1](https://github.com/scaffdog/scaffdog/compare/v2.0.0-canary.0...v2.0.0-canary.1) (2022-08-06)

**Note:** Version bump only for package prettier-plugin-scaffdog

# [2.0.0-canary.0](https://github.com/scaffdog/scaffdog/compare/v1.5.0...v2.0.0-canary.0) (2022-08-06)

### Features

- **prettier-plugin-scaffdog:** implement syntax v2 ([4155872](https://github.com/scaffdog/scaffdog/commit/41558728401ff6f383b5fe97a78dbf7719afaadb))

# [1.5.0](https://github.com/scaffdog/scaffdog/compare/v1.4.0...v1.5.0) (2022-06-26)

**Note:** Version bump only for package prettier-plugin-scaffdog

# [1.4.0](https://github.com/scaffdog/scaffdog/compare/v1.3.0...v1.4.0) (2022-06-23)

**Note:** Version bump only for package prettier-plugin-scaffdog

# [1.3.0](https://github.com/scaffdog/scaffdog/compare/v1.2.1-canary.1...v1.3.0) (2022-06-22)

**Note:** Version bump only for package prettier-plugin-scaffdog

## [1.2.1-canary.1](https://github.com/scaffdog/scaffdog/compare/v1.2.1-canary.0...v1.2.1-canary.1) (2022-06-22)

**Note:** Version bump only for package prettier-plugin-scaffdog

## [1.2.1-canary.0](https://github.com/scaffdog/scaffdog/compare/v1.2.0...v1.2.1-canary.0) (2022-06-21)

**Note:** Version bump only for package prettier-plugin-scaffdog

# [1.2.0](https://github.com/scaffdog/scaffdog/compare/v1.1.0...v1.2.0) (2022-01-25)

### Features

- add prettier plugin for scaffdog ([aa37135](https://github.com/scaffdog/scaffdog/commit/aa371353fe81ee039db152bdd038d942ecccc6f5))
