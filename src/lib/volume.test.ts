import { describe, expect, it } from "vitest";
import {
  bandAround,
  dragBand,
  dynamicName,
  emptyScore,
  inZonePercent,
  samplesToLevel,
  setBand,
  smooth,
  updateScore,
  zoneOf,
} from "./volume";

const sine = (amplitude: number, n = 2048) =>
  Float32Array.from({ length: n }, (_, i) => amplitude * Math.sin((i / n) * 2 * Math.PI * 20));

describe("samplesToLevel", () => {
  it("maps silence to 0", () => {
    expect(samplesToLevel(new Float32Array(2048), 0).level).toBe(0);
  });

  it("puts a full-scale signal at the top when sensitivity is 0", () => {
    // full-scale sine has RMS -3 dBFS, so it lands 3 dB under the top of the 60 dB window
    expect(samplesToLevel(sine(1), 0).level).toBeCloseTo(95, 0);
  });

  it("reads higher when sensitivity goes up", () => {
    const quiet = sine(0.01);
    expect(samplesToLevel(quiet, 20).level).toBeGreaterThan(samplesToLevel(quiet, 0).level);
  });

  it("flags clipping only when a sample reaches the edge", () => {
    expect(samplesToLevel(sine(0.5), 0).clipped).toBe(false);
    expect(samplesToLevel(sine(1), 0).clipped).toBe(true);
  });
});

describe("smooth", () => {
  it("moves part of the way toward the new value", () => {
    const next = smooth(0, 100, 0.1);
    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThan(100);
  });

  it("gets there after a long gap", () => {
    expect(smooth(0, 100, 5)).toBeCloseTo(100, 3);
  });
});

describe("zoneOf", () => {
  const band = { low: 50, high: 64 };
  it("tells soft, ok and loud apart, with the edges counting as ok", () => {
    expect(zoneOf(49.9, band)).toBe("soft");
    expect(zoneOf(50, band)).toBe("ok");
    expect(zoneOf(64, band)).toBe("ok");
    expect(zoneOf(64.1, band)).toBe("loud");
  });
});

describe("dynamicName", () => {
  it("picks the nearest marking", () => {
    expect(dynamicName(0)).toBe("pp");
    expect(dynamicName(58)).toBe("mf");
    expect(dynamicName(100)).toBe("ff");
  });
});

describe("setBand", () => {
  it("keeps the band at least 4 wide and inside 0..100", () => {
    expect(setBand(60, 61)).toEqual({ low: 60, high: 64 });
    expect(setBand(-5, 120)).toEqual({ low: 0, high: 100 });
    expect(setBand(99, 100)).toEqual({ low: 96, high: 100 });
  });
});

describe("bandAround", () => {
  it("centres a 14-wide band on the level he played", () => {
    expect(bandAround(55.4)).toEqual({ low: 48, high: 62 });
  });
});

describe("dragBand", () => {
  const band = { low: 40, high: 60 };

  it("grabbing near the top edge moves only the top", () => {
    const drag = dragBand.start(band, 61);
    expect(drag.mode).toBe("high");
    expect(dragBand.move(band, drag, 70)).toEqual({ low: 40, high: 70 });
  });

  it("grabbing near the bottom edge moves only the bottom", () => {
    const drag = dragBand.start(band, 38);
    expect(dragBand.move(band, drag, 30)).toEqual({ low: 30, high: 60 });
  });

  it("grabbing the middle moves the whole band and keeps its width", () => {
    const drag = dragBand.start(band, 50);
    expect(drag.mode).toBe("move");
    expect(dragBand.move(band, drag, 60)).toEqual({ low: 50, high: 70 });
    expect(dragBand.move(band, drag, 100)).toEqual({ low: 80, high: 100 });
  });

  it("an edge can't cross the other edge", () => {
    const drag = dragBand.start(band, 61);
    expect(dragBand.move(band, drag, 10)).toEqual({ low: 40, high: 44 });
  });
});

describe("updateScore", () => {
  it("counts time in the zone and builds a streak", () => {
    let s = emptyScore();
    for (let i = 0; i < 10; i++) s = updateScore(s, "ok", 0.5);
    expect(s.streak).toBeCloseTo(5);
    expect(s.best).toBeCloseTo(5);
    expect(inZonePercent(s)).toBeCloseTo(100);
  });

  it("keeps the streak through a slip shorter than 0.6 s", () => {
    let s = emptyScore();
    s = updateScore(s, "ok", 3);
    s = updateScore(s, "loud", 0.5);
    expect(s.streak).toBeCloseTo(3);
    s = updateScore(s, "ok", 1);
    expect(s.streak).toBeCloseTo(4);
  });

  it("breaks the streak after a longer slip but keeps the best", () => {
    let s = emptyScore();
    s = updateScore(s, "ok", 3);
    s = updateScore(s, "soft", 0.4);
    s = updateScore(s, "soft", 0.4);
    expect(s.streak).toBe(0);
    expect(s.best).toBeCloseTo(3);
    expect(inZonePercent(s)).toBeCloseTo((3 / 3.8) * 100);
  });

  it("reports 0% before anything was played", () => {
    expect(inZonePercent(emptyScore())).toBe(0);
  });
});
