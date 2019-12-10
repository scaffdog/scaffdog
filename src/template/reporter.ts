import chalk from 'chalk';
import { SyntaxError } from './error';

type Output = (...args: any[]) => any;

export class Reporter {
  private output: Output;

  public constructor(output: Output) {
    this.output = output;
  }

  public report(err: Error) {
    if (err instanceof SyntaxError) {
      this.printSyntaxError(err);
    }

    throw err;
  }

  private printSyntaxError(err: SyntaxError) {
    this.output('');
    this.output(chalk.red('Template parsing error:'));
    this.output('');

    const lines = err.source.split(/\n/);
    const base = Math.max(err.start.line - 3, 0);

    // trim
    lines.splice(0, base);
    lines.splice(err.end.line - err.start.line + 5);

    const start = err.start.line - 1 - base;
    const end = err.end.line - 1 - base;

    const results: string[] = [];

    lines.forEach((line, index) => {
      if (start <= index && index <= end) {
        results.push(
          line.substring(0, err.start.column - 1) +
            chalk.red(line.substring(err.start.column - 1, err.end.column)) +
            line.substring(err.end.column),
        );
      } else {
        results.push(line);
      }

      if (index === end) {
        results.push(
          ' '.repeat(err.start.column - 1) +
            chalk.red(`${'^'.repeat(err.end.column - err.start.column + 1)} ${err.message}`),
        );
      }
    });

    this.output(results.join('\n'));
    this.output('');
    this.output('');
  }
}
