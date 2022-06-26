import path from 'path';
import fs from 'fs';
import test, { afterEach, before } from 'ava';
import sinon from 'sinon';
import { cwd, runCommand } from '../mocks/command-test-utils';
import * as prompt from '../prompt';

const defaults = {
  name: undefined,
  'dry-run': false,
  force: false,
};

const clear = () => {
  try {
    fs.rmdirSync(path.resolve(cwd, 'tmp'), {
      recursive: true,
    });
  } catch (e) {}
};

before(clear);
afterEach(clear);

test.serial('document - prompt', async (t) => {
  const stub = sinon
    .stub(prompt, 'prompt')
    .onCall(0)
    .resolves('a') // name
    .rejects(new Error('unexpected'));

  const { default: cmd } = await import('./generate');

  const { code, stdout, stderr } = await runCommand(cmd, {
    ...defaults,
  });

  stub.restore();

  t.is(stderr, '');
  t.snapshot(stdout);
  t.is(code, 0);
  t.snapshot(fs.readFileSync(path.resolve(cwd, 'tmp/nest/dump.txt'), 'utf8'));
});

test.serial('document - name options', async (t) => {
  const { default: cmd } = await import('./generate');

  const { code, stdout, stderr } = await runCommand(cmd, {
    ...defaults,
    name: 'a',
  });

  t.is(code, 0);
  t.is(stderr, '');
  t.snapshot(stdout);
});

test.serial('document - overwrite files', async (t) => {
  const stub = sinon
    .stub(prompt, 'confirm')
    .onCall(0)
    .resolves(true) // dump.txt
    .onCall(1)
    .resolves(false) // generate.txt (skipped)
    .rejects(new Error('unexpected'));

  const { default: cmd } = await import('./generate');
  const file = {
    dump: {
      path: path.resolve(cwd, 'tmp/nest/dump.txt'),
      content: 'dump',
    },
    generate: {
      path: path.resolve(cwd, 'tmp/generate.txt'),
      content: 'generate',
    },
  };

  fs.mkdirSync(path.resolve(cwd, 'tmp/nest'), { recursive: true });

  for (const entry of Object.values(file)) {
    fs.writeFileSync(entry.path, entry.content, 'utf8');
  }

  const { code, stdout, stderr } = await runCommand(cmd, {
    ...defaults,
    name: 'a',
  });

  stub.restore();

  t.is(stderr, '');
  t.snapshot(stdout);
  t.is(code, 0);

  t.not(fs.readFileSync(file.dump.path, 'utf8'), file.dump.content);
  t.is(fs.readFileSync(file.generate.path, 'utf8'), file.generate.content);
});

test.serial('document - force overwrite', async (t) => {
  const stub = sinon.stub(prompt, 'confirm').rejects(new Error('unexpected'));

  const { default: cmd } = await import('./generate');
  const file = {
    dump: {
      path: path.resolve(cwd, 'tmp/nest/dump.txt'),
      content: 'dump',
    },
    generate: {
      path: path.resolve(cwd, 'tmp/generate.txt'),
      content: 'generate',
    },
  };

  fs.mkdirSync(path.resolve(cwd, 'tmp/nest'), { recursive: true });

  for (const entry of Object.values(file)) {
    fs.writeFileSync(entry.path, entry.content, 'utf8');
  }

  const { code, stdout, stderr } = await runCommand(cmd, {
    ...defaults,
    name: 'a',
    force: true,
  });

  stub.restore();

  t.is(stderr, '');
  t.snapshot(stdout);
  t.is(code, 0);

  t.not(fs.readFileSync(file.dump.path, 'utf8'), file.dump.content);
  t.not(fs.readFileSync(file.generate.path, 'utf8'), file.generate.content);
});

test.serial('document - not found', async (t) => {
  const { default: cmd } = await import('./generate');

  const { code, stdout, stderr } = await runCommand(cmd, {
    ...defaults,
    name: 'not-found',
  });

  t.snapshot(stderr);
  t.is(stdout, '');
  t.is(code, 1);
});

test.serial('has magic and question', async (t) => {
  fs.mkdirSync(path.resolve(cwd, 'tmp/root'), { recursive: true });

  const stub1 = sinon.stub(prompt, 'autocomplete');
  stub1.onCall(0).resolves('root');
  stub1.rejects(new Error('unexpected (1)'));

  const stub2 = sinon.stub(prompt, 'prompt');
  stub2.onCall(0).resolves('value');
  stub2.onCall(1).resolves('B');
  stub2.rejects(new Error('unexpected (2)'));

  const { default: cmd } = await import('./generate');

  const { code, stdout, stderr } = await runCommand(cmd, {
    ...defaults,
    name: 'b',
  });

  stub1.restore();
  stub2.restore();

  t.is(stderr, '');
  t.snapshot(stdout);
  t.is(code, 0);
});

test.serial('dry run', async (t) => {
  const { default: cmd } = await import('./generate');

  const { code, stdout, stderr } = await runCommand(cmd, {
    ...defaults,
    name: 'a',
    'dry-run': true,
  });

  t.is(stderr, '');
  t.snapshot(stdout);
  t.is(code, 0);
});
