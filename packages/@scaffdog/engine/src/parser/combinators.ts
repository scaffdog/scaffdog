import type { SourceRange } from '@scaffdog/types';
import { parseError } from './error.js';
import type { Option, ParseData, Parser } from './types.js';
import { none, some, error, success } from './types.js';

export type SatisfyFn = (fn: (c: string) => boolean) => Parser<string>;
export const satisfy: SatisfyFn = (fn) => (state) => {
  if (
    state.input.length > 0 &&
    typeof state.input[0] === 'string' &&
    fn(state.input[0])
  ) {
    const [data, ...rest] = state.input;
    return success(data, true, {
      ...state,
      rest,
      offset: state.offset + 1,
    });
  }
  return error('error', false, {
    ...state,
    rest: state.input,
  });
};

export const eof: Parser<null> = (state) => {
  return state.input.length === 0
    ? success(null, false, state)
    : error('error', false, {
        ...state,
        rest: state.input,
      });
};

export const any: Parser<string> = satisfy(() => true);

export type CharFn = <T extends string>(c: T) => Parser<T>;
export const char: CharFn = (c) => (state) => {
  const r = satisfy((v) => v === c)(state);
  if (r.type === 'error') {
    const found = state.input[0];
    const msg =
      found != null
        ? `"${c}" expected but "${found}" found`
        : `"${c}" expected`;
    return error(r.kind, r.committed, {
      ...r.state,
      errors: r.state.errors.append(
        parseError(msg, [state.offset, state.offset]),
      ),
    });
  }
  return success(r.data as ParseData<CharFn>, true, r.state);
};

export type LabelFn = <T extends Parser<any>>(
  p: T,
  msg: string,
) => Parser<ParseData<T>>;
export const label: LabelFn = (p, msg) => (state) => {
  const r = p(state);
  if (r.type === 'error') {
    return error(r.kind, false, {
      ...r.state,
      errors: r.state.errors.append({
        message: msg,
        range: [state.offset, r.state.offset],
      }),
    });
  }
  return r;
};

export type ExpectedFn = <T extends Parser<any>>(
  p: T,
  msg: string,
) => Parser<ParseData<T>>;
export const expected: ExpectedFn = (p, msg) => (state) => {
  const r = p(state);
  if (r.type === 'error' && !r.committed) {
    return error(r.kind, false, {
      ...r.state,
      errors: r.state.errors.upsert(
        r.state.errors.latest(),
        parseError(msg, [state.offset, r.state.offset]),
      ),
    });
  }
  return r;
};

export type PeekFn = <T extends Parser<any>>(p: T) => Parser<ParseData<T>>;
export const peek: PeekFn = (p) => (state) => {
  const r = p(state);
  const s = {
    ...state,
    rest: state.input,
  };
  return r.type === 'error'
    ? error('error', false, s)
    : success(r.data, false, s);
};

export type CutFn = <T extends Parser<any>>(p: T) => Parser<ParseData<T>>;
export const cut: CutFn = (p) => (state) => {
  const r = p(state);
  if (r.type === 'error' && r.kind === 'error') {
    return error('failure', r.committed, r.state);
  }
  return r;
};

export type AttemptFn = <T extends Parser<any>>(p: T) => Parser<ParseData<T>>;
export const attempt: AttemptFn = (p) => (state) => {
  const r = p(state);
  if (r.type === 'error') {
    if (r.kind === 'failure') {
      return r;
    }
    if (r.committed) {
      return error('error', false, r.state);
    }
  }
  return r;
};

export type MapFn = <T, U>(
  p: Parser<T>,
  f: (d: T, r: SourceRange) => U,
) => Parser<U>;
export const map: MapFn = (p, f) => (state) => {
  const r = p(state);
  if (r.type === 'error') {
    return r;
  }
  return success(f(r.data, [state.offset, r.state.offset - 1]), true, r.state);
};

export type ConcatFn = <T extends Parser<any>[]>(
  ps: [...T],
) => Parser<{ [P in keyof T]: ParseData<T[P]> }>;
export const concat: ConcatFn = (ps) => (state) => {
  const rs = [];
  let s = state;
  for (const p of ps) {
    const r = p(s);
    if (r.type === 'error') {
      return error(r.kind, r.committed || rs.length > 0, {
        ...r.state,
        input: state.input,
      });
    }
    rs.push(r.data);
    s = {
      ...r.state,
      input: r.state.rest,
    };
  }
  return success(
    rs as ParseData<ReturnType<ReturnType<ConcatFn>>>,
    rs.length > 0,
    {
      ...s,
      input: state.input,
      rest: s.input,
    },
  );
};

export type PrecededFn = <T extends Parser<any>>(
  p1: Parser<any>,
  p2: T,
) => Parser<ParseData<T>>;
export const preceded: PrecededFn = (p1, p2) => (state) => {
  const r = p1(state);
  if (r.type === 'error') {
    return r;
  }
  return p2({
    ...r.state,
    input: r.state.rest,
  });
};

export type ChoiceFn = <T extends readonly Parser<any>[]>(
  ps: T,
) => Parser<ParseData<T[number]>>;
export const choice: ChoiceFn = (ps) => (state) => {
  let s = state;
  for (const p of ps) {
    const r = p(state);
    if ((r.type === 'error' && r.kind === 'failure') || r.committed) {
      return r;
    }
    s = r.state;
  }
  return error('error', false, s);
};

export const digit: Parser<string> = label(
  satisfy((c) => /^\d$/.test(c)),
  'Expected a number from 0 to 9',
);

export type StringFn = <T extends string>(s: T) => Parser<T>;
export const string: StringFn = (s) => (state) => {
  const r = concat([...s].map(char))(state);
  if (r.type === 'error') {
    const latest = r.state.errors.latest();
    const msg =
      latest == null
        ? `"${s}" expected`
        : `"${s}" expected (${latest.message})`;
    return error(r.kind, r.committed, {
      ...r.state,
      errors: r.state.errors.upsert(latest, {
        message: msg,
        range: [state.offset, r.state.offset],
      }),
    });
  }
  return success(s, true, r.state);
};

export type OptionFn = <T>(p: Parser<T>) => Parser<Option<T>>;
export const option: OptionFn = (p) => (state) => {
  const r = p(state);
  if (r.type === 'error') {
    if (r.kind === 'failure' || r.committed) {
      return r;
    }
    return success(none(), false, {
      ...r.state,
      errors: state.errors,
    });
  }
  return success(some(r.data), true, r.state);
};

export type NotF = (p: Parser<unknown>) => Parser<null>;
export const not: NotF = (p) => (state) => {
  const r = p(state);
  if (r.type === 'success') {
    return error('error', false, {
      ...state,
      rest: state.input,
    });
  }
  return success(null, false, {
    ...state,
    rest: state.input,
  });
};

export type DiffFn = <T, U>(p: Parser<T>, q: Parser<U>) => Parser<T>;
export const diff: DiffFn = (p, q) =>
  map(attempt(concat([not(q), p])), ([, r]) => r);

export type ManyFn = <T>(p: Parser<T>) => Parser<T[]>;
export const many: ManyFn = (p) => (state) => {
  const rs: ParseData<typeof p>[] = [];
  let s = state;

  for (let i = 0; i < Number.POSITIVE_INFINITY; i++) {
    const r = p(s);
    if (r.type === 'error') {
      if (r.kind === 'failure' || r.committed) {
        return error(r.kind, r.committed, {
          ...r.state,
          input: state.input,
        });
      }
      break;
    }
    rs.push(r.data);
    s = {
      ...r.state,
      input: r.state.rest,
    };
  }

  return success(rs, rs.length > 0, {
    ...s,
    input: state.input,
    rest: s.input,
  });
};

export type Many1Fn = <T>(p: Parser<T>) => Parser<T[]>;
export const many1: Many1Fn = (p) => (state) => {
  const r = many(p)(state);
  if (r.type === 'error') {
    return r;
  }
  if (r.data.length === 0) {
    return error('error', false, r.state);
  }
  return r;
};

export type ManyTillFn = <T, U>(p: Parser<T>, q: Parser<U>) => Parser<[T[], U]>;
export const manyTill: ManyTillFn = (p, q) => (state) => {
  const rs: ParseData<typeof p>[] = [];
  let s = state;

  while (true) {
    const qr = q(s);
    if (qr.type === 'success') {
      return success([rs, qr.data], true, {
        ...qr.state,
        input: state.input,
        rest: qr.state.rest,
      });
    }

    const pr = p(s);
    if (pr.type === 'error') {
      return error(pr.kind, pr.committed || rs.length > 0, {
        ...pr.state,
        input: state.input,
      });
    }
    rs.push(pr.data);
    s = {
      ...pr.state,
      input: pr.state.rest,
    };
  }
};

export type ListFn = <T>(
  p: Parser<T>,
  delimiter: Parser<unknown>,
) => Parser<T[]>;
export const list: ListFn = (p, delimiter) =>
  map(concat([p, many(concat([delimiter, p]))]), ([first, rest]) => [
    first,
    ...rest.map(([, r]) => r),
  ]);
