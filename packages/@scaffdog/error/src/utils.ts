export class ExtensibleError extends Error {
  public constructor(name: string, message?: string) {
    super(message);

    Object.defineProperty(this, 'name', {
      configurable: true,
      enumerable: false,
      value: name,
      writable: true,
    });

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
