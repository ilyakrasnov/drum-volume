import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChallengeResult } from "@/hooks/use-challenge";
import { COUNT_OPTIONS, starsFor, targetFor } from "@/lib/challenge";
import { clamp } from "@/lib/volume";

type Props = {
  bpm: number;
  onBpm: (bpm: number) => void;
  counts: number;
  onCounts: (counts: number) => void;
  click: boolean;
  onClick: (click: boolean) => void;
  result: ChallengeResult | null;
  onStart: () => void;
};

const Stars = ({ n, className = "" }: { n: number; className?: string }) => (
  <span className={`tracking-widest text-warn ${className}`}>
    {"★".repeat(n)}
    <span className="text-muted-foreground/50">{"★".repeat(3 - n)}</span>
  </span>
);

const Results = ({ result }: { result: ChallengeResult }) => {
  const stars = result.scores.map(starsFor);
  const total = stars.reduce((a, b) => a + b, 0);
  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-card p-5">
      <div className="text-[length:4dvmin] font-extrabold">
        {total} <span className="text-muted-foreground">/ {stars.length * 3} stars</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {result.seq.map((d, i) => (
          <div key={i} className="flex flex-col items-center rounded-lg border bg-background px-3 py-2">
            <span className="font-dynamic text-2xl font-bold italic">{targetFor(d).name}</span>
            <Stars n={stars[i]} className="text-sm" />
          </div>
        ))}
      </div>
    </div>
  );
};

const ChallengeSetup = ({ bpm, onBpm, counts, onCounts, click, onClick, result, onStart }: Props) => (
  <div className="flex flex-1 flex-col gap-[2dvh]">
    {result ? (
      <Results result={result} />
    ) : (
      <p className="max-w-xl text-[length:2.6dvmin] leading-snug text-muted-foreground">
        Eight random targets, from <i className="font-dynamic">pp</i> to <i className="font-dynamic">ff</i>. Each one
        lasts {counts} counts. Watch for <b className="text-foreground">next</b> and switch on the first count. Up to 3
        stars per target.
      </p>
    )}
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <span className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">tempo</span>
        <Button variant="outline" size="icon" className="size-11" onClick={() => onBpm(clamp(bpm - 5, 40, 220))} aria-label="slower">
          <Minus />
        </Button>
        <span className="w-20 text-center text-2xl font-bold tabular-nums">
          {bpm}
          <small className="ml-1 text-xs font-normal text-muted-foreground">bpm</small>
        </span>
        <Button variant="outline" size="icon" className="size-11" onClick={() => onBpm(clamp(bpm + 5, 40, 220))} aria-label="faster">
          <Plus />
        </Button>
      </span>
      <span className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">counts each</span>
        {COUNT_OPTIONS.map((c) => (
          <Button key={c} size="lg" className="w-14 text-base" variant={counts === c ? "default" : "outline"} onClick={() => onCounts(c)}>
            {c}
          </Button>
        ))}
      </span>
      <Button size="lg" className="text-base" variant={click ? "default" : "outline"} onClick={() => onClick(!click)}>
        Click {click ? "on" : "off"}
      </Button>
    </div>
    <Button className="h-auto w-fit rounded-xl bg-zone-ok px-10 py-4 text-2xl text-white hover:bg-zone-ok/90" onClick={onStart}>
      {result ? "Play again" : "Start challenge"}
    </Button>
  </div>
);

export { Stars };
export default ChallengeSetup;
