export declare const TELEMETRY_API_ENV_VAR: 'VITE_VIWA_TELEMETRY_API_URL';
export declare const DEV_TELEMETRY_API_FALLBACK: string;

export declare function validateTelemetryApiUrl(
  value: string | undefined,
  options?: { production?: boolean },
): { ok: true; value: string } | { ok: false; error: string };

export declare function assertProductionTelemetryApiUrl(
  env: Record<string, string | undefined>,
  options?: { mode?: string },
): void;
