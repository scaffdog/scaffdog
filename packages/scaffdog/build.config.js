import config from '../../build.config';

export default {
  ...config,
  entries: ['./src/bin'],
  declaration: false,
};
