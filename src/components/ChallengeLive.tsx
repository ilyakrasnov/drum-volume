import { Button } from "@/components/ui/button";
import { Stars } from "@/components/ChallengeSetup";
import { type Moment, type Target, type TargetScore, starsFor, targetFor } from "@/lib/challenge";
import { cn } from "@/lib/utils";

type Props = {
  moment: Moment;
  target: Target;
  next: Target | null;
  counts: number;
  seq: number[];
  scores: TargetScore[];
  onStop: () => void;
};

const WARN_BEATS = 4;

const ChallengeLive = ({ moment, target, next, counts, seq, scores, onStop }: Props) => {
  const countIn = moment.phase === "countin";
  const beat = moment.phase === "done" ? counts : moment.beat;
  const beatsLeft = countIn ? 5 - beat : moment.phase === "play" ? moment.beatsLeft : 0;
  const current = moment.phase === "play" ? moment.index : -1;
  const warn = next && beatsLeft <= WARN_BEATS;

  return (
    <div className="flex flex-1 flex-col gap-[2dvh]">
      <div className="flex items-end gap-[4vw]">
        <div>
          <div className="text-[length:2.4dvmin] text-muted-foreground">{countIn ? "get ready" : "play"}</div>
          <div className="pl-[2dvmin] font-dynamic text-[length:16dvmin] font-bold italic leading-none text-zone-ok">
            {countIn ? beat : target.name}
          </div>
        </div>
        <div className={cn("pb-[2dvmin] transition-opacity", warn ? "opacity-100" : "opacity-30")}>
          <div className="text-[length:2.4dvmin] text-muted-foreground">{countIn ? "first" : "next"}</div>
          <div className="flex items-baseline gap-3">
            <span className="font-dynamic text-[length:10dvmin] font-bold italic leading-none">{next?.name ?? "end"}</span>
            {warn && <span className="text-[length:6dvmin] font-extrabold tabular-nums text-warn">{beatsLeft}</span>}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {Array.from({ length: countIn ? 4 : counts }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-[3dvmin] flex-1 rounded-full border",
              i < beat ? (countIn ? "bg-warn" : "bg-zone-ok") : "bg-card",
              i === beat - 1 && "scale-y-125",
            )}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {seq.map((d, i) => (
          <div
            key={i}
            className={cn(
              "flex min-w-14 flex-col items-center rounded-lg border px-3 py-1",
              i === current ? "border-zone-ok bg-zone-ok/15" : "bg-card",
              i > current && "opacity-50",
            )}
          >
            <span className="font-dynamic text-xl font-bold italic">{i <= current ? targetFor(d).name : "?"}</span>
            {i < current ? <Stars n={starsFor(scores[i])} className="text-xs" /> : <span className="text-xs">&nbsp;</span>}
          </div>
        ))}
      </div>

      <span className="flex-1" />
      <Button size="lg" variant="outline" className="w-fit text-base" onClick={onStop}>
        Stop
      </Button>
    </div>
  );
};

export default ChallengeLive;
