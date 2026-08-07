import { readFileSync } from 'node:fs';

/** Canonical wordmark viewBox (includes inner scaleY in SVG markup). */
export const LOGO_VIEWBOX_W = 277;
export const LOGO_VIEWBOX_H = 150;

/** Square icon center offset tolerance (% of canvas size). */
export const ICON_CENTER_TOLERANCE_PCT = 2;
/** Square icon left/right and top/bottom padding asymmetry tolerance (% of canvas size). */
export const ICON_PADDING_ASYMMETRY_PCT = 3;

/**
 * Extract root SVG children preserving nested transforms (e.g. scaleY).
 * Does not strip <g transform="..."> wrappers.
 */
export function readCanonicalLogoInner(svgPath, { fill = '#ffffff' } = {}) {
  const svgText = readFileSync(svgPath, 'utf8');
  const inner = svgText
    .replace(/<\?xml[^?]*\?>\s*/i, '')
    .replace(/^[\s\S]*?<svg[^>]*>/i, '')
    .replace(/<\/svg>\s*$/i, '')
    .trim();

  if (!inner.includes('<path')) {
    throw new Error(`Could not parse logo mark from ${svgPath}`);
  }

  return inner
    .replace(/\bcolor="#fff"/g, '')
    .replace(/fill="currentColor"/g, `fill="${fill}"`);
}

/** Layout wordmark inside a square canvas with uniform padding. */
export function computeSquareIconLogoTransform(size, { padRatio = 0.14 } = {}) {
  const pad = Math.round(size * padRatio);
  const innerW = size - pad * 2;
  const scale = innerW / LOGO_VIEWBOX_W;
  const renderedW = LOGO_VIEWBOX_W * scale;
  const renderedH = LOGO_VIEWBOX_H * scale;
  const tx = (size - renderedW) / 2;
  const ty = (size - renderedH) / 2;
  return { pad, scale, tx, ty, renderedW, renderedH };
}

export function buildSquareIconSvg(size, logoInner, { padRatio = 0.14, rxRatio = 0.12 } = {}) {
  const { scale, tx, ty } = computeSquareIconLogoTransform(size, { padRatio });
  const rx = Math.round(size * rxRatio);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${rx}" fill="#000000"/>
  <g transform="translate(${tx} ${ty}) scale(${scale})">
    ${logoInner}
  </g>
</svg>`;
}

export function buildLogoOverlaySvg(width, height, logoInner) {
  const scale = width / LOGO_VIEWBOX_W;
  const markH = LOGO_VIEWBOX_H * scale;
  const y = (height - markH) / 2;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <g transform="translate(0 ${y}) scale(${scale})">
    ${logoInner}
  </g>
</svg>`;
}

export function buildOgCardSvgFallback(logoInner, cardW = 1200, cardH = 630) {
  const logoScale = 0.72;
  const logoW = LOGO_VIEWBOX_W * logoScale;
  const logoH = LOGO_VIEWBOX_H * logoScale;
  const logoX = (cardW - logoW) / 2;
  const logoY = cardH * 0.28;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${cardW}" height="${cardH}" viewBox="0 0 ${cardW} ${cardH}">
  <defs>
    <radialGradient id="cabinetGlow" cx="50%" cy="0%" r="75%">
      <stop offset="0%" stop-color="#7f5af0" stop-opacity="0.35"/>
      <stop offset="42%" stop-color="#5028a0" stop-opacity="0.12"/>
      <stop offset="72%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${cardW}" height="${cardH}" fill="#000000"/>
  <ellipse cx="${cardW / 2}" cy="${cardH * 0.08}" rx="${cardW * 0.42}" ry="${cardH * 0.38}" fill="url(#cabinetGlow)"/>
  <g transform="translate(${logoX} ${logoY}) scale(${logoScale})">
    ${logoInner}
  </g>
  <text x="${cardW / 2}" y="${cardH * 0.72}" text-anchor="middle" fill="#ffffff"
        font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
        font-size="42" font-weight="600" letter-spacing="0.02em">Личный кабинет</text>
</svg>`;
}

export function readPngDimensions(filePath) {
  const buf = readFileSync(filePath);
  if (buf.length < 24 || buf.toString('ascii', 1, 4) !== 'PNG') {
    return null;
  }
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

export function patchLogoMarkManifestDimensions(manifest, width = LOGO_VIEWBOX_W, height = LOGO_VIEWBOX_H) {
  const asset = manifest.assets.find((entry) => entry.id === 'logo-viwa-mark');
  if (!asset) {
    throw new Error('logo-viwa-mark missing from manifest');
  }
  for (const format of ['svg', 'png', 'webp']) {
    if (asset.files?.[format]) {
      asset.files[format].width = width;
      asset.files[format].height = height;
    }
  }
  return manifest;
}

/** Analyze non-background alpha bbox for square icon centering checks. */
export function analyzeIconForegroundBbox({ width, height, minX, minY, maxX, maxY }) {
  const bboxW = maxX - minX + 1;
  const bboxH = maxY - minY + 1;
  const centerX = minX + bboxW / 2;
  const centerY = minY + bboxH / 2;
  const canvasCenterX = width / 2;
  const canvasCenterY = height / 2;

  const centerOffsetXPct = (Math.abs(centerX - canvasCenterX) / width) * 100;
  const centerOffsetYPct = (Math.abs(centerY - canvasCenterY) / height) * 100;

  const padLeftPct = (minX / width) * 100;
  const padRightPct = ((width - maxX - 1) / width) * 100;
  const padTopPct = (minY / height) * 100;
  const padBottomPct = ((height - maxY - 1) / height) * 100;

  const horizontalAsymPct = Math.abs(padLeftPct - padRightPct);
  const verticalAsymPct = Math.abs(padTopPct - padBottomPct);

  return {
    bbox: { minX, minY, maxX, maxY, width: bboxW, height: bboxH },
    center: { x: centerX, y: centerY },
    centerOffsetXPct,
    centerOffsetYPct,
    padLeftPct,
    padRightPct,
    padTopPct,
    padBottomPct,
    horizontalAsymPct,
    verticalAsymPct,
  };
}

export function validateIconGeometry(analysis, label) {
  const issues = [];
  if (analysis.centerOffsetXPct > ICON_CENTER_TOLERANCE_PCT) {
    issues.push(
      `${label}: horizontal center offset ${analysis.centerOffsetXPct.toFixed(2)}% > ${ICON_CENTER_TOLERANCE_PCT}%`,
    );
  }
  if (analysis.centerOffsetYPct > ICON_CENTER_TOLERANCE_PCT) {
    issues.push(
      `${label}: vertical center offset ${analysis.centerOffsetYPct.toFixed(2)}% > ${ICON_CENTER_TOLERANCE_PCT}%`,
    );
  }
  if (analysis.horizontalAsymPct > ICON_PADDING_ASYMMETRY_PCT) {
    issues.push(
      `${label}: horizontal padding asymmetry ${analysis.horizontalAsymPct.toFixed(2)}% > ${ICON_PADDING_ASYMMETRY_PCT}%`,
    );
  }
  if (analysis.verticalAsymPct > ICON_PADDING_ASYMMETRY_PCT) {
    issues.push(
      `${label}: vertical padding asymmetry ${analysis.verticalAsymPct.toFixed(2)}% > ${ICON_PADDING_ASYMMETRY_PCT}%`,
    );
  }
  return issues;
}
