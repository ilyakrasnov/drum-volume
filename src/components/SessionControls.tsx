import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

type Props = {
  sensitivity: number;
  onSensitivity: (value: number) => void;
  paused: boolean;
  onTogglePause: () => void;
  onReset: () => void;
};

const SessionControls = ({ sensitivity, onSensitivity, paused, onTogglePause, onReset }: Props) => (
  <div className="flex flex-wrap items-center gap-2">
    <label className="flex items-center gap-3 text-sm text-muted-foreground">
      mic sensitivity
      <Slider
        className="w-44"
        min={0}
        max={30}
        step={1}
        value={[sensitivity]}
        onValueChange={([v]) => onSensitivity(v)}
      />
    </label>
    <span className="flex-1" />
    <span className="flex gap-2">
      <Button size="lg" className="text-base" variant={paused ? "default" : "outline"} onClick={onTogglePause}>
        {paused ? "Resume" : "Pause"}
      </Button>
      <Button size="lg" className="text-base" variant="outline" onClick={onReset}>
        Reset score
      </Button>
    </span>
  </div>
);

export default SessionControls;
