import { type Zone, dynamicName } from "@/lib/volume";
import { zoneText } from "@/lib/zone-colors";
import { cn } from "@/lib/utils";

type Props = { level: number; zone: Zone; paused: boolean; calibrateLeft: number | null };

const HINT: Record<Zone, string> = { soft: "▲ a bit louder", ok: "right there", loud: "▼ a bit softer" };

const LevelReadout = ({ level, zone, paused, calibrateLeft }: Props) => {
  const hint =
    calibrateLeft !== null ? `play at your level… ${Math.ceil(calibrateLeft)}` : paused ? "paused" : HINT[zone];
  const neutral = calibrateLeft !== null || paused;

  return (
    <div className="flex items-center gap-[4vw]">
      <div className={cn("min-w-[2ch] text-[16vmin] font-extrabold leading-none tabular-nums", zoneText[zone])}>
        {level.toFixed(0)}
      </div>
      <div>
        <div className="font-dynamic text-[9vmin] font-bold italic leading-tight">{dynamicName(level)}</div>
        <div className={cn("text-[3.4vmin] font-bold", neutral ? "text-foreground" : zoneText[zone])}>{hint}</div>
      </div>
    </div>
  );
};

export default LevelReadout;
