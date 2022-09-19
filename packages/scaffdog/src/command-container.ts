import type { CommandModule } from './command';

export type CommandContainer = {
  all: () => CommandModule[];
  main: () => CommandModule[];
  get: (name: string) => CommandModule | null;
  mustGet: (name: string) => CommandModule;
};

export const createCommandContainer = (
  commands: CommandModule<any, any>[],
): CommandContainer => {
  const map = new Map();

  commands.forEach((mod) => {
    map.set(mod.name, mod);
    if (mod.commands != null) {
      mod.commands.forEach((child) => {
        map.set(`${mod.name}.${child.name}`, child);
      });
    }
  });

  return {
    all: () => {
      return Array.from(map.values());
    },

    main: () => {
      const results: CommandModule[] = [];

      map.forEach((module, key) => {
        if (!key.includes('.')) {
          results.push(module);
        }
      });

      return results;
    },

    get: (name) => {
      return map.get(name) ?? null;
    },

    mustGet: (name) => {
      const mod = map.get(name);
      if (mod == null) {
        throw new ReferenceError(`"${name}" command does not exists`);
      }
      return mod;
    },
  };
};
