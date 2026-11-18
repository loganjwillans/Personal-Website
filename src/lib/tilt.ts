export interface PinValues {
  kind: 'tack' | 'pushpin';
  color: 'red' | 'blue' | 'green' | 'yellow';
}

export interface TiltValues {
  tilt: number;
  jitterX: number;
  jitterY: number;
  pin: PinValues;
  /** Second fastener, used by the corner-pinned (.pin--corners) variant. */
  pinAlt: PinValues;
}

const PALETTE = ['red', 'blue', 'green', 'yellow'] as const;
const MARKER_COLORS = ['yellow', 'blue', 'green', 'red'] as const;

export interface MarkerValues {
  color: (typeof MARKER_COLORS)[number];
}

function hashSeed(seed: string): number {
  let hash = 0;
  for (const char of seed) {
    hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  }
  return hash;
}

// Mix the high bits down too: ids that share a prefix otherwise land on the
// same low digits and end up with near-identical angles.
function mix(value: number): number {
  let h = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  return (h ^ (h >>> 16)) >>> 0;
}

function unit(hash: number, salt: number): number {
  return (mix(hash + salt) % 1000) / 1000;
}

/**
 * Deterministic pseudo-random tilt and pins derived from a stable id.
 * Tilt: roughly -0.8deg to +0.8deg. Jitter: roughly -6px to +6px.
 * Pins: a stable kind and (for pushpins) palette colour, one per corner.
 */
export function hashTilt(seed: string): TiltValues {
  const hash = hashSeed(seed);
  const pin = (kindSalt: number, colorSalt: number): PinValues => ({
    kind: unit(hash, kindSalt) < 0.5 ? 'tack' : 'pushpin',
    color: PALETTE[Math.floor(unit(hash, colorSalt) * PALETTE.length)],
  });

  return {
    tilt: -0.8 + unit(hash, 37) * 1.6,
    jitterX: -6 + unit(hash, 97) * 12,
    jitterY: -6 + unit(hash, 137) * 12,
    pin: pin(17, 29),
    pinAlt: pin(41, 53),
  };
}

/** A button's own marker colour, stable for its seed. */
export function hashMarker(seed: string): MarkerValues {
  const hash = hashSeed(seed);
  return {
    color: MARKER_COLORS[Math.floor(unit(hash, 7) * MARKER_COLORS.length)],
  };
}

/** Inline custom properties for .button: --marker.
 *  Pass a colour (a token like 'var(--yellow)' or any CSS colour) to pin the
 *  marker to it; without one the seed picks from the palette. */
export function markerStyle(seed: string, color?: string): string {
  const marker = hashMarker(seed);
  const fill = color ?? `var(--marker-${marker.color})`;
  return `--marker: ${fill}`;
}

function pinHead(pin: PinValues): string {
  if (pin.kind === 'tack') {
    // Pressed steel tack: a satin disc with a light band where the skirt is
    // pressed (inside the 1px rim from global.css), a low brushed sheen and a
    // tight specular off centre. Kept smooth so it still reads at ~18px.
    return [
      'radial-gradient(circle at 33% 24%, var(--pin-highlight) 0%, var(--pin-highlight) 6%, transparent 30%)',
      'radial-gradient(circle at 50% 50%, transparent 66%, color-mix(in srgb, var(--pin-metal-light) 55%, transparent) 88%, color-mix(in srgb, var(--pin-metal-dark) 45%, transparent) 100%)',
      'conic-gradient(from 205deg, var(--pin-metal-dark), var(--pin-metal-light) 15%, var(--pin-metal) 33%, var(--pin-metal-dark) 51%, var(--pin-metal-light) 71%, var(--pin-metal) 87%, var(--pin-metal-dark))',
    ].join(', ');
  }
  // Moulded plastic pushpin: a dome lit from the upper left, its body darkening
  // into the coloured rim, under a broad sheen and a small catchlight.
  const base = `var(--pin-${pin.color})`;
  const dark = `var(--pin-${pin.color}-dark)`;
  return [
    'radial-gradient(circle at 30% 23%, var(--pin-highlight) 0%, var(--pin-highlight) 8%, transparent 26%)',
    'radial-gradient(circle at 40% 34%, color-mix(in srgb, var(--pin-highlight) 45%, transparent) 0%, transparent 50%)',
    `radial-gradient(circle at 38% 30%, color-mix(in srgb, ${base} 55%, var(--paper)) 0%, ${base} 52%, ${dark} 100%)`,
  ].join(', ');
}

function pinShadow(pin: PinValues): string {
  return pin.kind === 'tack' ? 'var(--pin-shadow-tack)' : 'var(--pin-shadow-pushpin)';
}

function pinVars(pin: PinValues, prefix: string): string[] {
  return [
    `${prefix}-size: var(--pin-size-${pin.kind})`,
    `${prefix}-head: ${pinHead(pin)}`,
    `${prefix}-ring: ${pin.kind === 'tack' ? 'var(--pin-rim)' : `var(--pin-${pin.color}-dark)`}`,
    `${prefix}-shadow: ${pinShadow(pin)}`,
  ];
}

export function pinStyle(values: TiltValues): string {
  // --pin-* draws the first pin, --pin-b-* the second corner pin. Which one is
  // drawn where is decided entirely by .pin / .pin--corners in global.css.
  return [...pinVars(values.pin, '--pin'), ...pinVars(values.pinAlt, '--pin-b')].join('; ');
}

export function tiltStyle(values: TiltValues): string {
  return [
    `--tilt: ${values.tilt.toFixed(3)}deg`,
    `--jitter-x: ${values.jitterX.toFixed(1)}px`,
    `--jitter-y: ${values.jitterY.toFixed(1)}px`,
    pinStyle(values),
  ].join('; ');
}

/**
 * A page-scoped view transition name: `vt-home-work-<id>`, `vt-work-head`.
 * The route prefix means the same item on two pages never shares a name, so the
 * browser never morphs one page's paper into the next: it peels and re-pins.
 */
export function viewName(pathname: string, item: string): string {
  const slug = (value: string) =>
    value.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
  return `vt-${slug(pathname) || 'home'}-${slug(item)}`;
}
