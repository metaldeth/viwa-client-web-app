import { spawnSync } from 'node:child_process';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { projectRoot, resolveFromRoot } from './projectRoot.mjs';
import {
  DEV_TELEMETRY_API_FALLBACK,
  TELEMETRY_API_ENV_VAR,
  assertProductionTelemetryApiUrl,
  validateTelemetryApiUrl,
} from './telemetry-api-url.mjs';

const CABINET_URL = 'https://cabinet.vitamin-water.ru/api/v1';
const VITE_BIN = resolveFromRoot('node_modules/vite/bin/vite.js');

function collectJsFiles(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectJsFiles(fullPath, acc);
    } else if (entry.name.endsWith('.js')) {
      acc.push(fullPath);
    }
  }
  return acc;
}

function runProductionViteBuild(envOverrides = {}) {
  return spawnSync(process.execPath, [VITE_BIN, 'build', '--mode', 'production'], {
    cwd: projectRoot,
    env: { ...process.env, ...envOverrides },
    encoding: 'utf8',
    shell: false,
  });
}

describe('validateTelemetryApiUrl', () => {
  it('accepts cabinet production https URL', () => {
    const result = validateTelemetryApiUrl(CABINET_URL, { production: true });
    assert.equal(result.ok, true);
    assert.equal(result.value, CABINET_URL);
  });

  it('rejects missing, blank, and invalid values in production', () => {
    for (const value of [undefined, '', '   ', 'not-a-url', 'ftp://cabinet.vitamin-water.ru/api/v1']) {
      const result = validateTelemetryApiUrl(value, { production: true });
      assert.equal(result.ok, false, `expected invalid: ${String(value)}`);
    }
  });

  it('rejects http and localhost in production', () => {
    assert.equal(validateTelemetryApiUrl('http://localhost:3000/api/v1', { production: true }).ok, false);
    assert.equal(
      validateTelemetryApiUrl('http://cabinet.vitamin-water.ru/api/v1', { production: true }).ok,
      false,
    );
  });

  it('allows localhost http outside production', () => {
    const result = validateTelemetryApiUrl(DEV_TELEMETRY_API_FALLBACK, { production: false });
    assert.equal(result.ok, true);
    assert.equal(result.value, DEV_TELEMETRY_API_FALLBACK);
  });

  it('requires /api/v1 path suffix', () => {
    const result = validateTelemetryApiUrl('https://cabinet.vitamin-water.ru/api', { production: true });
    assert.equal(result.ok, false);
  });
});

describe('assertProductionTelemetryApiUrl', () => {
  it('does not exit for non-production mode', () => {
    assert.doesNotThrow(() => assertProductionTelemetryApiUrl({}, { mode: 'development' }));
  });
});

describe('production vite build telemetry env guard', () => {
  it('fails fast when production telemetry URL is missing', () => {
    const result = runProductionViteBuild({ [TELEMETRY_API_ENV_VAR]: '' });
    assert.notEqual(result.status, 0);
    const output = `${result.stdout}\n${result.stderr}`;
    assert.match(output, /VITE_VIWA_TELEMETRY_API_URL/);
    assert.match(output, /missing or blank/);
  });

  it('builds bundle with cabinet URL and no undefinedapi when env is explicit', () => {
    const distDir = resolveFromRoot('dist');
    if (existsSync(distDir)) {
      rmSync(distDir, { recursive: true, force: true });
    }

    const result = runProductionViteBuild({ [TELEMETRY_API_ENV_VAR]: CABINET_URL });
    const output = `${result.stdout}\n${result.stderr}`;
    assert.equal(result.status, 0, output);

    const jsFiles = collectJsFiles(distDir);
    assert.ok(jsFiles.length > 0, 'expected built JS chunks in dist/');

    const bundleText = jsFiles.map((file) => readFileSync(file, 'utf8')).join('\n');
    assert.match(bundleText, /cabinet\.vitamin-water\.ru\/api\/v1/);
    assert.doesNotMatch(bundleText, /undefinedapi/);
  });
});
