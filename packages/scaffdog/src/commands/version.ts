import { createCommand } from '../command.js';

export default createCommand({
  name: 'version',
  summary: 'Output the version number.',
  args: {},
  flags: {},
})(async ({ pkg, logger }) => {
  logger.log(`v${pkg.version}`);
  return 0;
});
