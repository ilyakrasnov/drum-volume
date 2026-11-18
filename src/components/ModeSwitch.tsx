import { Button } from "@/components/ui/button";
import type { Mode } from "@/hooks/use-practice-settings";

type Props = { mode: Mode; onChange: (mode: Mode) => void };

const MODES: [Mode, string][] = [
  ["practice", "Practice"],
  ["challenge", "Challenge"],
];

const ModeSwitch = ({ mode, onChange }: Props) => (
  <div className="flex w-fit gap-1 rounded-xl border bg-card p-1">
    {MODES.map(([value, label]) => (
      <Button
        key={value}
        size="sm"
        className="px-4 text-sm"
        variant={mode === value ? "default" : "ghost"}
        onClick={() => onChange(value)}
      >
        {label}
      </Button>
    ))}
  </div>
);

export default ModeSwitch;
