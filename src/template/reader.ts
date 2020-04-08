import fm from 'front-matter';
import * as fs from 'fs';
import globby from 'globby';
import marked from 'marked';
import * as path from 'path';

export type Resource = {
  filename: string;
  content: string;
};

export type Attributes = {
  extends: string; // TODO
  name: string;
  description: string;
  message: string;
  root: string;
  output: string;
  ignore: string[];
  hooks: string[]; // TODO
};

export type Document = {
  path: string;
  attributes: Attributes;
  resources: Resource[];
};

export class Reader {
  public constructor(private dir: string) {}

  public readAll(): Document[] {
    return this.list().map((filename) => this.read(filename));
  }

  private read(filename: string): Document {
    const template = path.resolve(this.dir, filename);
    const markdown = fs.readFileSync(template, { encoding: 'utf8' });
    const { attributes, body } = fm(markdown);
    const resources = this.collect(marked.lexer(body));

    return {
      path: template,
      attributes: {
        extends: '',
        name: '',
        description: '',
        message: '',
        root: '',
        output: '',
        ignore: [],
        hooks: [],
        ...attributes,
      },
      resources,
    };
  }

  private list() {
    return globby.sync(path.posix.join(this.dir, '*.md'), { onlyFiles: true }).map((file) => path.basename(file));
  }

  private collect(tokens: marked.TokensList) {
    const resources = [];
    let filename: string | null = null;

    for (const token of tokens) {
      switch (token.type) {
        case 'heading':
          if (token.depth === 1) {
            filename = token.text.trim().replace(/^`|`$/g, '');
          }
          break;
        case 'code':
          if (filename != null) {
            resources.push({
              filename,
              content: token.text,
            });

            filename = null;
          }
          break;
      }
    }

    return resources;
  }
}
