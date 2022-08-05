import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  clean: true,
  outDir: 'lib',
  declaration: true,
  rollup: {
    emitCJS: true,
  },
});
