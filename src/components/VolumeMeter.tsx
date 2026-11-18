import { useRef } from "react";
import { type Band, type Zone, DYNAMICS, clamp, dragBand } from "@/lib/volume";
import { zoneBg } from "@/lib/zone-colors";
import { cn } from "@/lib/utils";

type Props = {
  level: number;
  peak: number;
  zone: Zone;
  band: Band;
  onBandChange: (band: Band) => void;
};

const VolumeMeter = ({ level, peak, zone, band, onBandChange }: Props) => {
  const meter = useRef<HTMLDivElement>(null);
  const drag = useRef<ReturnType<typeof dragBand.start> | null>(null);

  const valueAt = (e: React.PointerEvent) => {
    const r = meter.current!.getBoundingClientRect();
    return clamp(((r.bottom - e.clientY) / r.height) * 100, 0, 100);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    meter.current!.setPointerCapture(e.pointerId);
    const v = valueAt(e);
    drag.current = dragBand.start(band, v);
    onBandChange(dragBand.move(band, drag.current, v));
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (drag.current) onBandChange(dragBand.move(band, drag.current, valueAt(e)));
  };
  const onPointerUp = () => (drag.current = null);

  return (
    <div className="flex h-full flex-col gap-1">
      <div className="flex min-h-0 flex-1 gap-3">
        <div className="relative w-11">
          {DYNAMICS.map(([name, v]) => (
            <span
              key={name}
              className="absolute right-0 translate-y-1/2 font-dynamic text-xl font-bold italic text-muted-foreground"
              style={{ bottom: `${v}%` }}
            >
              {name}
            </span>
          ))}
        </div>
        <div
          ref={meter}
          className="relative flex-1 cursor-ns-resize touch-none overflow-hidden rounded-2xl border bg-card"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div
            className="absolute inset-x-0 border-y-[3px] border-zone-ok bg-zone-ok/20"
            style={{ bottom: `${band.low}%`, height: `${band.high - band.low}%` }}
          />
          <div
            className={cn("pointer-events-none absolute inset-x-[14%] bottom-0 rounded-t-lg", zoneBg[zone])}
            style={{ height: `${level}%` }}
          />
          <div
            className="pointer-events-none absolute inset-x-[6%] h-1 rounded-sm bg-foreground"
            style={{ bottom: `${peak}%` }}
          />
        </div>
      </div>
      <p className="pl-14 text-center text-xs text-muted-foreground">drag the green band to change the target</p>
    </div>
  );
};

export default VolumeMeter;
