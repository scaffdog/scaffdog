/* eslint-disable no-console */
import path from 'path';
import { Project, Node } from 'ts-morph';

const run = async () => {
  const project = new Project();

  project.addSourceFilesAtPaths(['src/lib/**/*']);

  await Promise.all(
    project.getSourceFiles().map(async (source) => {
      const basename = source.getBaseNameWithoutExtension();
      if (
        /\.mock$/.test(basename) ||
        /\.test/.test(basename) ||
        /index/.test(basename)
      ) {
        return;
      }

      const decls = source.getExportedDeclarations();
      const factoryName = [...decls.keys()].find((name) =>
        name.startsWith('create'),
      );
      if (factoryName == null) {
        return;
      }

      const factory = decls.get(factoryName)![0]!;
      if (!Node.isVariableDeclaration(factory)) {
        return;
      }

      const init = factory.getInitializer();
      if (!Node.isArrowFunction(init)) {
        return;
      }

      const alias = init.getReturnType().getAliasSymbol();
      if (alias == null) {
        return;
      }

      const decl = alias.getDeclarations()[0]!;
      if (!Node.isTypeAliasDeclaration(decl)) {
        return;
      }

      const type = decl.getTypeNode();
      if (!Node.isTypeLiteral(type)) {
        return;
      }

      const members = type.getMembers().reduce<string[]>((acc, cur) => {
        if (!Node.isPropertySignature(cur)) {
          return acc;
        }
        acc.push(cur.getName());
        return acc;
      }, []);

      const name = decl.getName();
      const dirname = source.getDirectoryPath();

      const mock = project.createSourceFile(
        path.join(dirname, `${basename}.mock.ts`),
        `
// NOTE: This is auto-generated file.
import { vi } from 'vitest';
import type { ${name} } from './${basename}.js';
export const create${name}Mock = (mocks: { [P in keyof ${name}]?: any } = {}): ${name} => ({
${members.map((p) => `${p}: vi.fn(),`).join('\n')}
...mocks,
});
        `.trim(),
        {
          overwrite: true,
        },
      );

      await mock.save();
    }),
  );

  return 0;
};

run()
  .then(process.exit)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
