import { useCallback, useEffect, useRef, useState } from "react";
import {
  COUNT_IN,
  type ChallengeConfig,
  type TargetScore,
  beatSeconds,
  makeChallenge,
  momentAt,
  recordFrame,
  targetFor,
} from "@/lib/challenge";
import type { Zone } from "@/lib/volume";

type Run = { seq: number[]; ctx: AudioContext; t0: number };
export type ChallengeResult = { seq: number[]; scores: TargetScore[] };

const emptyScores = (n: number) => Array.from({ length: n }, () => ({ inZone: 0, total: 0 }));

/** Schedules every click of the run up front on the audio clock, so the beat never drifts. */
function scheduleClicks(ctx: AudioContext, t0: number, cfg: ChallengeConfig) {
  const beat = beatSeconds(cfg);
  const total = COUNT_IN + cfg.counts * cfg.targets;
  for (let i = 0; i < total; i++) {
    const when = t0 + i * beat;
    const accent = i < COUNT_IN || (i - COUNT_IN) % cfg.counts === 0;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = accent ? 1500 : 1000;
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(accent ? 0.8 : 0.4, when + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.05);
    osc.connect(gain).connect(ctx.destination);
    osc.start(when);
    osc.stop(when + 0.06);
  }
}

/**
 * Runs one challenge on the audio clock. The page re-renders every frame (the mic level changes),
 * so the current moment is read straight from the clock during render.
 */
export function useChallenge(cfg: ChallengeConfig, click: boolean) {
  const [run, setRun] = useState<Run | null>(null);
  const [scores, setScores] = useState<TargetScore[]>([]);
  const [result, setResult] = useState<ChallengeResult | null>(null);
  const lastT = useRef(0);

  const t = run ? Math.max(0, run.ctx.currentTime - run.t0) : 0;
  const moment = run ? momentAt(t, cfg) : null;
  const playing = moment?.phase === "play" ? moment.index : 0;
  const target = run ? targetFor(run.seq[playing]) : null;
  const next = run && moment?.phase === "play" ? run.seq[moment.index + 1] : run?.seq[0];

  // the effect below closes the audio context, which also cancels the clicks still scheduled
  const stop = useCallback(() => setRun(null), []);

  const start = useCallback(async () => {
    const ctx = new AudioContext();
    await ctx.resume();
    const t0 = ctx.currentTime + 0.15;
    if (click) scheduleClicks(ctx, t0, cfg);
    lastT.current = 0;
    setScores(emptyScores(cfg.targets));
    setResult(null);
    setRun({ seq: makeChallenge(cfg.targets), ctx, t0 });
  }, [cfg, click]);

  /** Call once per frame with the zone he's in right now. */
  const record = (zone: Zone) => {
    if (!run || !moment) return;
    const dt = t - lastT.current;
    lastT.current = t;
    if (dt > 0 && dt < 0.25) setScores((s) => recordFrame(s, moment, zone, dt));
  };

  const done = moment?.phase === "done";
  useEffect(() => {
    if (!done || !run) return;
    setResult({ seq: run.seq, scores });
    stop();
  }, [done, run, scores, stop]);

  useEffect(() => () => void run?.ctx.close().catch(() => {}), [run]);

  return {
    running: !!run,
    moment,
    target,
    next: next === undefined ? null : targetFor(next),
    seq: run?.seq ?? [],
    scores,
    result,
    start,
    stop,
    record,
  };
}
