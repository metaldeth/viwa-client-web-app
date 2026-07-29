const CABINET_SHELL_ROUTE =
  /^(\/home|\/register|\/auth(?:\/sms\/[^/]+\/[^/]+)?|\/m\/[^/]+\/(?:home|auth(?:\/sms\/[^/]+\/[^/]+)?))$/;

/**
 * Returns true for cabinet/auth shell routes that hide the legacy FLOW header.
 * Examples: `/home`, `/auth`, `/register`, `/m/VIWA-001/home`.
 */
export function isViwaCabinetShellRoute(pathname: string): boolean {
  return CABINET_SHELL_ROUTE.test(pathname);
}
