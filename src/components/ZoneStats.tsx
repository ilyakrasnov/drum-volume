import { type Band, type Score, inZonePercent } from "@/lib/volume";

type Props = { score: Score; band: Band };

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="text-[2.2vmin] text-muted-foreground">
    {label}
    <b className="block text-[5vmin] text-foreground">{value}</b>
  </div>
);

const ZoneStats = ({ score, band }: Props) => {
  const pct = inZonePercent(score);
  return (
    <div className="flex items-center gap-[3vw]">
      <div
        className="grid size-[18vmin] flex-none place-items-center rounded-full"
        style={{ background: `conic-gradient(hsl(var(--zone-ok)) ${pct}%, hsl(var(--border)) 0)` }}
      >
        <div className="grid size-[78%] place-items-center rounded-full bg-background text-center text-[4.5vmin] font-extrabold leading-tight">
          <span>
            {pct.toFixed(0)}%<small className="block text-[1.8vmin] font-medium text-muted-foreground">in the zone</small>
          </span>
        </div>
      </div>
      <Stat label="streak" value={`${score.streak.toFixed(0)}s`} />
      <Stat label="best" value={`${score.best.toFixed(0)}s`} />
      <Stat label="target" value={`${band.low}–${band.high}`} />
    </div>
  );
};

export default ZoneStats;
