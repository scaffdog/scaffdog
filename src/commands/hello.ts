import { Command } from '@oclif/command';
import { commonFlags } from '../flags';

export default class HelloCommand extends Command {
  public static description = 'describe the hello command here.';

  public static args = [{ name: 'mame' }];

  public static flags = {
    ...commonFlags,
  };

  public async run() {
    this.log('TODO: implement hello command.');
  }
}
