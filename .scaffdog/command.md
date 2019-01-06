---
name: 'command'
description: 'Create a class for the new command.'
message: 'Please enter the command name.'
root: 'src/commands'
output: '**/*'
ignore: []
---

# {{ input }}.ts

```typescript
import { Command } from '@oclif/command';
import { commonFlags } from '{{ relative "../src/flags.ts" | replace ".ts$" "" }}';

export default class {{ input | pascal }}Command extends Command {
  public static description = 'describe the {{ input }} command here.';

  public static args = [{ name: 'mame' }];

  public static flags = {
    ...commonFlags,
  };

  public async run() {
    this.log('TODO: implement {{ input }} command.');
  }
}
```
