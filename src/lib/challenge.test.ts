import { describe, expect, it } from "vitest";
import { COUNT_IN, challengeSeconds, makeChallenge, momentAt, recordFrame, starsFor, targetFor } from "./challenge";

const cfg = { bpm: 120, counts: 8, targets: 8 }; // one beat = 0.5 s

describe("makeChallenge", () => {
  it("makes the asked number of targets", () => {
    expect(makeChallenge(8)).toHaveLength(8);
  });

  it("always jumps at least two dynamics away from the last target", () => {
    for (let run = 0; run < 200; run++) {
      const seq = makeChallenge(8);
      for (let i = 1; i < seq.length; i++) expect(Math.abs(seq[i] - seq[i - 1])).toBeGreaterThanOrEqual(2);
    }
  });

  it("comes out different between games", () => {
    const games = new Set(Array.from({ length: 20 }, () => makeChallenge(8).join()));
    expect(games.size).toBeGreaterThan(15);
  });
});

describe("targetFor", () => {
  it("puts a 14-wide band around the dynamic's level", () => {
    expect(targetFor(3)).toEqual({ name: "mf", band: { low: 51, high: 65 } });
  });
});

describe("momentAt", () => {
  it("counts in for four beats first", () => {
    expect(momentAt(0, cfg)).toEqual({ phase: "countin", beat: 1 });
    expect(momentAt(1.99, cfg)).toEqual({ phase: "countin", beat: 4 });
  });

  it("steps through each target's counts", () => {
    expect(momentAt(2, cfg)).toEqual({ phase: "play", index: 0, beat: 1, beatsLeft: 8 });
    expect(momentAt(5.6, cfg)).toEqual({ phase: "play", index: 0, beat: 8, beatsLeft: 1 });
    expect(momentAt(6, cfg)).toEqual({ phase: "play", index: 1, beat: 1, beatsLeft: 8 });
  });

  it("is done after the last target", () => {
    expect(momentAt(challengeSeconds(cfg), cfg)).toEqual({ phase: "done" });
    expect(challengeSeconds(cfg)).toBe((COUNT_IN + 64) * 0.5);
  });
});

describe("recordFrame", () => {
  const empty = () => Array.from({ length: 8 }, () => ({ inZone: 0, total: 0 }));

  it("scores the target that's playing", () => {
    const scores = recordFrame(empty(), { phase: "play", index: 2, beat: 3, beatsLeft: 6 }, "ok", 0.1);
    expect(scores[2]).toEqual({ inZone: 0.1, total: 0.1 });
    expect(recordFrame(scores, { phase: "play", index: 2, beat: 3, beatsLeft: 6 }, "loud", 0.1)[2].total).toBeCloseTo(0.2);
  });

  it("doesn't score the first beat of a target or the count-in", () => {
    const start = empty();
    expect(recordFrame(start, { phase: "play", index: 0, beat: 1, beatsLeft: 8 }, "loud", 0.1)).toBe(start);
    expect(recordFrame(start, { phase: "countin", beat: 2 }, "loud", 0.1)).toBe(start);
  });
});

describe("starsFor", () => {
  it("gives 3 stars at 80% in the zone, down to none under 40%", () => {
    expect(starsFor({ inZone: 8, total: 10 })).toBe(3);
    expect(starsFor({ inZone: 6, total: 10 })).toBe(2);
    expect(starsFor({ inZone: 4, total: 10 })).toBe(1);
    expect(starsFor({ inZone: 3.9, total: 10 })).toBe(0);
    expect(starsFor({ inZone: 0, total: 0 })).toBe(0);
  });
});
