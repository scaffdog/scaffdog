module.exports = {
  files: ['src/**/*.test.ts'],
  timeout: '10s',
  snapshotDir: 'test/snapshots',
  extensions: ['ts'],
  require: ['ts-node/register'],
  verbose: true,
  ignoredByWatcher: ['test/tmp'],
};
