import config from '../../build.config.js';

export default {
  ...config,
  entries: ['./src/bin', './src/index'],
  declaration: true,
};
