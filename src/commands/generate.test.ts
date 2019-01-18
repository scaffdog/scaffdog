import test from 'ava';
import * as fs from 'fs';
import globby from 'globby';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as rimraf from 'rimraf';

const nixt = require('nixt'); // tslint:disable-line: no-var-requires

const CWD = path.resolve(__dirname, '../..');
const PATH = path.resolve(CWD, 'tmp');

const exec = (input: string): any =>
  nixt()
    .cwd(CWD)
    .run('node ./bin/run generate test')
    .on(/Please select the output/)
    .respond('\n')
    .on(/Please enter any text/)
    .respond(`${input}\n`);

test.beforeEach(() => {
  rimraf.sync(PATH);
  mkdirp.sync(PATH);
});

test.after(() => {
  rimraf.sync(PATH);
});

test.serial('basic', (t) => {
  return new Promise((resolve) => {
    exec('generate command test')
      .code(0)
      .end((err: any) => {
        t.falsy(err);

        const contents = globby
          .sync(PATH, { onlyFiles: true })
          .map((file) => `${path.relative(CWD, file)}\n${fs.readFileSync(file, 'utf8')}`)
          .join('\n\n');

        t.snapshot(contents);

        resolve();
      });
  });
});

test.serial('overwrite', (t) => {
  return new Promise((resolve) => {
    fs.writeFileSync(path.resolve(PATH, 'functions.md'), 'old functions');
    fs.writeFileSync(path.resolve(PATH, 'paths.md'), 'old paths');

    exec('overwrite test')
      .on(/overwrite .*"tmp\/paths\.md"/)
      .respond('y\n')
      .on(/overwrite .*"tmp\/functions\.md"/)
      .respond('n\n')
      .code(0)
      .end((err: any) => {
        t.falsy(err);

        const contents = globby
          .sync(PATH, { onlyFiles: true })
          .map((file) => `${path.relative(CWD, file)}\n${fs.readFileSync(file, 'utf8')}`)
          .join('\n\n');

        t.snapshot(contents);

        resolve();
      });
  });
});
