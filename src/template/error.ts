import { Loc } from './tokens';

export enum ErrorType {
  UNEXPECTED = 'unexpected error',
  UNOPEND = 'unopened tag',
  UNCLOSED = 'unclosing tag',
}

export class SyntaxError extends Error {
  public type: ErrorType;
  public source: string;
  public start: Loc;
  public end: Loc;

  public constructor(type: ErrorType, source: string, start: Loc, end: Loc) {
    super(type);

    this.type = type;
    this.source = source;
    this.start = start;
    this.end = end;

    Object.defineProperty(this, 'name', {
      configurable: true,
      enumerable: false,
      value: this.constructor.name,
      writable: true,
    });

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SyntaxError);
    }
  }
}
