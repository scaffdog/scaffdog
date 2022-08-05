import type { Comment } from '../ast';
import { createComment } from '../ast';
import {
  any,
  concat,
  cut,
  diff,
  label,
  many,
  map,
  peek,
  preceded,
  string,
} from './combinators';
import { whitespace } from './spaces';
import type { Parser } from './types';

export const comment: Parser<Comment> = map(
  concat([
    peek(string('/*')),
    preceded(
      string('/*'),
      cut(
        concat([
          many(diff(any, string('*/'))),
          label(string('*/'), 'Missing "*/"'),
        ]),
      ),
    ),
  ]),
  ([, [body]], r) => createComment(body.join(''), r),
);

export const whitespaceOrComment: Parser<readonly Comment[]> = map(
  concat([whitespace, many(concat([comment, whitespace]))]),
  ([, d]) => d.map(([c]) => c),
);
