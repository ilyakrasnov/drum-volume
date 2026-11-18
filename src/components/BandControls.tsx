import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Band, PRESETS, sameBand, setBand } from "@/lib/volume";

type Props = { band: Band; onBandChange: (band: Band) => void; onCalibrate: () => void };

const Nudge = ({ label, onDown, onUp }: { label: string; onDown: () => void; onUp: () => void }) => (
  <span className="flex items-center gap-2">
    <span className="ml-2 text-sm text-muted-foreground">{label}</span>
    <Button variant="outline" size="icon" className="size-11" onClick={onDown} aria-label={`${label} down`}>
      <Minus />
    </Button>
    <Button variant="outline" size="icon" className="size-11" onClick={onUp} aria-label={`${label} up`}>
      <Plus />
    </Button>
  </span>
);

const BandControls = ({ band, onBandChange, onCalibrate }: Props) => (
  <div className="flex flex-wrap items-center gap-2">
    {Object.entries(PRESETS).map(([name, preset]) => (
      <Button
        key={name}
        size="lg"
        className="px-5 text-base"
        variant={sameBand(band, preset) ? "default" : "outline"}
        onClick={() => onBandChange(preset)}
      >
        {name}
      </Button>
    ))}
    <Button size="lg" variant="outline" className="px-5 text-base" onClick={onCalibrate}>
      Set my level
    </Button>
    <span className="flex items-center gap-2">
      <Nudge
        label="bottom"
        onDown={() => onBandChange(setBand(band.low - 2, band.high))}
        onUp={() => onBandChange(setBand(Math.min(band.low + 2, band.high - 4), band.high))}
      />
      <Nudge
        label="top"
        onDown={() => onBandChange(setBand(band.low, Math.max(band.high - 2, band.low + 4)))}
        onUp={() => onBandChange(setBand(band.low, band.high + 2))}
      />
    </span>
  </div>
);

export default BandControls;
