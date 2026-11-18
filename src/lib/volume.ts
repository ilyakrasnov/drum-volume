// Loudness math and scoring for the drum volume trainer. All levels are 0..100.

export type Zone = "soft" | "ok" | "loud";
export type Band = { low: number; high: number };
export type Score = { streak: number; best: number; outFor: number; inZone: number; total: number };

export const DYNAMICS: [name: string, level: number][] = [
  ["pp", 18],
  ["p", 32],
  ["mp", 46],
  ["mf", 58],
  ["f", 70],
  ["ff", 84],
];

export const PRESETS: Record<string, Band> = {
  Soft: { low: 26, high: 40 },
  Medium: { low: 50, high: 64 },
  Loud: { low: 66, high: 80 },
};

const MIN_WIDTH = 4;
const WINDOW_DB = 60;
const SMOOTHING_S = 0.35;
const SLIP_GRACE_S = 0.6;

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** Loudness of one block of mic samples. Sensitivity (dB) slides the 60 dB window down so quiet rooms still read. */
export function samplesToLevel(samples: Float32Array, sensitivity: number) {
  let sum = 0;
  let peak = 0;
  for (const v of samples) {
    sum += v * v;
    peak = Math.max(peak, Math.abs(v));
  }
  const db = 20 * Math.log10(Math.sqrt(sum / samples.length) + 1e-9);
  const top = -sensitivity;
  return { level: clamp(((db - (top - WINDOW_DB)) / WINDOW_DB) * 100, 0, 100), clipped: peak > 0.98 };
}

/** Eases toward the raw level so single hits don't make the meter jump. */
export const smooth = (prev: number, raw: number, dt: number) => prev + (raw - prev) * (1 - Math.exp(-dt / SMOOTHING_S));

export const zoneOf = (level: number, band: Band): Zone => (level < band.low ? "soft" : level > band.high ? "loud" : "ok");

export const dynamicName = (level: number) =>
  DYNAMICS.reduce((best, d) => (Math.abs(d[1] - level) < Math.abs(best[1] - level) ? d : best))[0];

export function setBand(low: number, high: number): Band {
  const lo = clamp(low, 0, 100 - MIN_WIDTH);
  return { low: lo, high: clamp(high, lo + MIN_WIDTH, 100) };
}

/** The band "Set my level" picks from what he just played. */
export const bandAround = (level: number): Band => setBand(Math.round(level - 7), Math.round(level + 7));

export const sameBand = (a: Band, b: Band) => a.low === b.low && a.high === b.high;

type Drag = { mode: "low" | "high" } | { mode: "move"; offset: number; width: number };

/** Dragging on the meter: grab an edge to stretch the band, grab the middle to slide it. */
export const dragBand = {
  start(band: Band, value: number): Drag {
    const toLow = Math.abs(value - band.low);
    const toHigh = Math.abs(value - band.high);
    if (value > band.low && value < band.high && Math.min(toLow, toHigh) > MIN_WIDTH) {
      return { mode: "move", offset: value - band.low, width: band.high - band.low };
    }
    return { mode: toLow < toHigh ? "low" : "high" };
  },
  move(band: Band, drag: Drag, value: number): Band {
    const v = Math.round(value);
    if (drag.mode === "move") {
      const low = clamp(Math.round(value - drag.offset), 0, 100 - drag.width);
      return { low, high: low + drag.width };
    }
    if (drag.mode === "low") return setBand(Math.min(v, band.high - MIN_WIDTH), band.high);
    return setBand(band.low, Math.max(v, band.low + MIN_WIDTH));
  },
};

export const emptyScore = (): Score => ({ streak: 0, best: 0, outFor: 0, inZone: 0, total: 0 });

/** Short slips out of the band don't break the streak; anything longer than 0.6 s does. */
export function updateScore(s: Score, zone: Zone, dt: number): Score {
  const total = s.total + dt;
  if (zone === "ok") {
    const streak = s.streak + dt;
    return { streak, best: Math.max(s.best, streak), outFor: 0, inZone: s.inZone + dt, total };
  }
  const outFor = s.outFor + dt;
  return { ...s, outFor, total, streak: outFor > SLIP_GRACE_S ? 0 : s.streak };
}

export const inZonePercent = (s: Score) => (s.total ? (s.inZone / s.total) * 100 : 0);
