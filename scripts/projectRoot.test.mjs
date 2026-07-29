import fs from 'fs';
import path from 'path';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { projectRoot, resolveFromRoot } from './projectRoot.mjs';

describe('projectRoot (junction-safe)', () => {
  it('points at the repo root with package.json and src/', () => {
    assert.ok(fs.existsSync(path.join(projectRoot, 'package.json')));
    assert.ok(fs.existsSync(resolveFromRoot('src')));
    assert.ok(fs.existsSync(resolveFromRoot('index.html')));
  });

  it('matches realpath of package.json', () => {
    const packageJsonReal = fs.realpathSync.native(path.join(projectRoot, 'package.json'));
    assert.equal(path.dirname(packageJsonReal), projectRoot);
  });
});
