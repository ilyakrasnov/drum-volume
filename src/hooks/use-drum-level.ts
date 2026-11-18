import { useCallback, useEffect, useRef, useState } from "react";
import {
  type Band,
  type Score,
  type Zone,
  clamp,
  emptyScore,
  samplesToLevel,
  smooth,
  updateScore,
  zoneOf,
} from "@/lib/volume";

export type HistoryPoint = { t: number; level: number; zone: Zone; band: Band };

const HISTORY_S = 20;
const CALIBRATE_S = 3;
const PEAK_FALL_PER_S = 15;

type Options = {
  band: Band;
  sensitivity: number;
  /** Fake drummer that drifts in and out of the band, for trying the app without a kit. */
  demo: boolean;
  /** Called with his average level after "Set my level". */
  onCalibrated: (level: number) => void;
};

type Calibration = { sum: number; time: number };

/** Listens to the mic and turns it into a smoothed level, a zone and a running score, once per frame. */
export function useDrumLevel({ band, sensitivity, demo, onCalibrated }: Options) {
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [frame, setFrame] = useState({ t: 0, level: 0, peak: 0, zone: "ok" as Zone, clippedAt: -Infinity });
  const [score, setScore] = useState<Score>(emptyScore);
  const [calibrateLeft, setCalibrateLeft] = useState<number | null>(null);

  const live = useRef({ band, sensitivity, paused, onCalibrated });
  live.current = { band, sensitivity, paused, onCalibrated };
  const audio = useRef<{ ctx: AudioContext; analyser: AnalyserNode; buf: Float32Array<ArrayBuffer> } | null>(null);
  const history = useRef<HistoryPoint[]>([]);
  const scoreRef = useRef<Score>(emptyScore());
  const calibration = useRef<Calibration | null>(null);

  const start = useCallback(async () => {
    setError(null);
    if (!demo) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        });
        const ctx = new AudioContext();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        ctx.createMediaStreamSource(stream).connect(analyser);
        await ctx.resume();
        audio.current = { ctx, analyser, buf: new Float32Array(analyser.fftSize) };
      } catch (err) {
        console.warn(err);
        setError(
          window.isSecureContext
            ? "The mic is blocked. On iPad: Settings › Safari › Microphone › Allow, then reload this page."
            : "The mic only works when this page is opened from an https:// address.",
        );
        return;
      }
    }
    setStarted(true);
  }, [demo]);

  useEffect(() => {
    if (!started) return;
    let t = 0;
    let level = 0;
    let peak = 0;
    let clippedAt = -Infinity;
    let last = performance.now();
    let raf = 0;

    const read = () => {
      if (audio.current) {
        const { analyser, buf } = audio.current;
        analyser.getFloatTimeDomainData(buf);
        const r = samplesToLevel(buf, live.current.sensitivity);
        if (r.clipped) clippedAt = t;
        return r.level;
      }
      const { low, high } = live.current.band;
      const drift = (low + high) / 2 + 13 * Math.sin(t * 0.45) + 5 * Math.sin(t * 1.7);
      const hit = 16 * Math.exp(-((t * 8) % 1) * 6);
      return clamp(drift - 8 + hit + (Math.random() - 0.5) * 8, 0, 100);
    };

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      t += dt;
      level = smooth(level, read(), dt);
      peak = Math.max(level, peak - dt * PEAK_FALL_PER_S);
      const { band, paused } = live.current;
      const zone = zoneOf(level, band);

      if (!paused) {
        scoreRef.current = updateScore(scoreRef.current, zone, dt);
        history.current.push({ t, level, zone, band });
        while (history.current[0].t < t - HISTORY_S) history.current.shift();

        const cal = calibration.current;
        if (cal) {
          cal.sum += level * dt;
          cal.time += dt;
          if (cal.time >= CALIBRATE_S) {
            calibration.current = null;
            live.current.onCalibrated(cal.sum / cal.time);
          }
        }
      }

      setFrame({ t, level, peak, zone, clippedAt });
      setScore(scoreRef.current);
      setCalibrateLeft(calibration.current ? CALIBRATE_S - calibration.current.time : null);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // iOS suspends audio when he switches apps
    const onVisible = () => document.visibilityState === "visible" && audio.current?.ctx.resume();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [started]);

  const resetScore = useCallback(() => {
    scoreRef.current = emptyScore();
    setScore(scoreRef.current);
  }, []);

  // a new target is a new exercise
  useEffect(resetScore, [band.low, band.high, resetScore]);

  return {
    started,
    error,
    start,
    ...frame,
    clippedRecently: frame.t - frame.clippedAt < 2,
    score,
    history: history.current,
    paused,
    togglePause: () => setPaused((p) => !p),
    resetScore: () => {
      resetScore();
      history.current = [];
    },
    calibrateLeft,
    calibrate: () => {
      calibration.current = { sum: 0, time: 0 };
    },
  };
}
