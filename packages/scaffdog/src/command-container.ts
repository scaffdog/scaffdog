import type { CommandModule, CommandList } from './command';

export class CommandContainer {
  private _commands: CommandList;

  public constructor(commands: CommandModule<any, any>[]) {
    const map = new Map();

    commands.forEach((module) => {
      map.set(module.name, module);

      if (module.commands != null) {
        module.commands.forEach((child) => {
          map.set(`${module.name}.${child.name}`, child);
        });
      }
    });

    this._commands = map;
  }

  public all(): CommandModule[] {
    return Array.from(this._commands.values());
  }

  public main(): CommandModule[] {
    const commands: CommandModule[] = [];

    this._commands.forEach((module, key) => {
      if (!key.includes('.')) {
        commands.push(module);
      }
    });

    return commands;
  }

  public get(name: string): CommandModule | undefined {
    return this._commands.get(name);
  }

  public mustGet(name: string): CommandModule {
    const module = this.get(name);
    if (module == null) {
      throw new ReferenceError(`"${name}" command does not exists`);
    }

    return module;
  }
}
