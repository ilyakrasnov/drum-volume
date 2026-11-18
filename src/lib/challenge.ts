// Challenge mode: a random run of dynamics, each held for a few counts, scored with stars.

import { type Band, type Zone, DYNAMICS, setBand } from "./volume";

export type ChallengeConfig = { bpm: number; counts: number; targets: number };
export type Target = { name: string; band: Band };
export type TargetScore = { inZone: number; total: number };
export type Moment =
  | { phase: "countin"; beat: number }
  | { phase: "play"; index: number; beat: number; beatsLeft: number }
  | { phase: "done" };

export const COUNT_IN = 4;
export const COUNT_OPTIONS = [4, 8, 16];
const MIN_JUMP = 2;
const HALF_WIDTH = 7;

export const targetFor = (dynamicIndex: number): Target => {
  const [name, level] = DYNAMICS[dynamicIndex];
  return { name, band: setBand(level - HALF_WIDTH, level + HALF_WIDTH) };
};

/** Random dynamics, each at least two steps from the one before, so every change is a real jump. */
export function makeChallenge(length: number, random = Math.random): number[] {
  const seq: number[] = [];
  for (let i = 0; i < length; i++) {
    const prev = seq[i - 1];
    const options = DYNAMICS.map((_, j) => j).filter((j) => prev === undefined || Math.abs(j - prev) >= MIN_JUMP);
    seq.push(options[Math.floor(random() * options.length)]);
  }
  return seq;
}

export const beatSeconds = (cfg: ChallengeConfig) => 60 / cfg.bpm;
export const challengeSeconds = (cfg: ChallengeConfig) => (COUNT_IN + cfg.counts * cfg.targets) * beatSeconds(cfg);

/** Where the challenge is, `t` seconds after the first count-in beat. Beats count from 1. */
export function momentAt(t: number, cfg: ChallengeConfig): Moment {
  const b = Math.floor(t / beatSeconds(cfg));
  if (b < COUNT_IN) return { phase: "countin", beat: b + 1 };
  const played = b - COUNT_IN;
  const index = Math.floor(played / cfg.counts);
  if (index >= cfg.targets) return { phase: "done" };
  const beat = (played % cfg.counts) + 1;
  return { phase: "play", index, beat, beatsLeft: cfg.counts - beat + 1 };
}

/** Adds one frame to the playing target's score. The first beat of each target is free, to give him time to react. */
export function recordFrame(scores: TargetScore[], moment: Moment, zone: Zone, dt: number): TargetScore[] {
  if (moment.phase !== "play" || moment.beat === 1) return scores;
  const next = [...scores];
  const s = scores[moment.index];
  next[moment.index] = { inZone: s.inZone + (zone === "ok" ? dt : 0), total: s.total + dt };
  return next;
}

export function starsFor(s: TargetScore) {
  const pct = s.total ? s.inZone / s.total : 0;
  return pct >= 0.8 ? 3 : pct >= 0.6 ? 2 : pct >= 0.4 ? 1 : 0;
}
