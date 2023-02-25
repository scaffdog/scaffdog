import { ExtensibleError } from './utils';

export class ScaffdogAggregateError extends ExtensibleError {
  private _errors: unknown[];

  public constructor(errors: unknown[], message?: string) {
    super('ScaffdogAggregateError', message);
    this._errors = errors;
  }

  public get errors() {
    return [...this._errors];
  }
}
