/**
 * Production guard for VITE_VIWA_TELEMETRY_API_URL.
 * Prevents shipping bundles with `undefinedapi/v1` when env is missing.
 */

export const TELEMETRY_API_ENV_VAR = 'VITE_VIWA_TELEMETRY_API_URL';

/** Safe local fallback for dev/tests when env files omit the telemetry URL. */
export const DEV_TELEMETRY_API_FALLBACK = 'http://localhost:3000/api/v1';

const CABINET_PRODUCTION_EXAMPLE = 'https://cabinet.vitamin-water.ru/api/v1';

/**
 * @param {string | undefined} value
 * @param {{ production?: boolean }} [options]
 * @returns {{ ok: true; value: string } | { ok: false; error: string }}
 */
export function validateTelemetryApiUrl(value, { production = false } = {}) {
  if (value === undefined || value === null || typeof value !== 'string' || !value.trim()) {
    return { ok: false, error: 'missing or blank' };
  }

  const trimmed = value.trim();
  let url;

  try {
    url = new URL(trimmed);
  } catch {
    return { ok: false, error: 'not a valid absolute URL' };
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return { ok: false, error: 'URL must use http:// or https://' };
  }

  const pathname = url.pathname.replace(/\/$/, '');
  if (!pathname.endsWith('/api/v1')) {
    return { ok: false, error: 'URL path must end with /api/v1' };
  }

  const host = url.hostname.toLowerCase();
  const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '[::1]';

  if (production) {
    if (url.protocol !== 'https:') {
      return { ok: false, error: 'production requires an https:// URL' };
    }
    if (isLocalhost) {
      return { ok: false, error: 'production cannot use localhost' };
    }
  } else if (url.protocol === 'http:' && !isLocalhost) {
    return { ok: false, error: 'http:// is allowed only for localhost outside production' };
  }

  return { ok: true, value: trimmed.replace(/\/$/, '') };
}

/**
 * @param {Record<string, string | undefined>} env
 * @param {{ mode?: string }} [options]
 */
export function assertProductionTelemetryApiUrl(env, { mode = 'production' } = {}) {
  if (mode !== 'production') {
    return;
  }

  const result = validateTelemetryApiUrl(env[TELEMETRY_API_ENV_VAR], { production: true });
  if (result.ok) {
    return;
  }

  console.error('');
  console.error(`[build] ${TELEMETRY_API_ENV_VAR} is ${result.error}.`);
  console.error('Production bundles must embed a valid telemetry API base URL.');
  console.error(`Set it in .env.production (see .env.production.example) or export inline, e.g.:`);
  console.error(`  ${TELEMETRY_API_ENV_VAR}=${CABINET_PRODUCTION_EXAMPLE}`);
  console.error('');
  process.exit(1);
}
