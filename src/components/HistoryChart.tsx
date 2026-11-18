import { useEffect, useMemo, useRef } from "react";
import type { HistoryPoint } from "@/hooks/use-drum-level";
import { zoneColors } from "@/lib/zone-colors";

type Props = { history: HistoryPoint[]; now: number; seconds?: number };

/** The last 20 seconds: the band as it was at each moment, and his level coloured by zone. */
const HistoryChart = ({ history, now, seconds = 20 }: Props) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const colors = useMemo(zoneColors, []);

  useEffect(() => {
    const c = canvas.current!;
    const ratio = devicePixelRatio || 1;
    const w = c.clientWidth;
    const h = c.clientHeight;
    if (c.width !== w * ratio || c.height !== h * ratio) {
      c.width = w * ratio;
      c.height = h * ratio;
    }
    const g = c.getContext("2d")!;
    g.setTransform(ratio, 0, 0, ratio, 0, 0);
    g.clearRect(0, 0, w, h);
    const x = (t: number) => w - ((now - t) / seconds) * w;
    const y = (level: number) => h - (level / 100) * h;

    g.fillStyle = colors.ok.replace(")", " / 0.2)");
    for (let i = 1; i < history.length; i++) {
      const a = history[i - 1];
      const b = history[i];
      g.fillRect(x(a.t), y(b.band.high), x(b.t) - x(a.t) + 0.5, y(b.band.low) - y(b.band.high));
    }
    g.lineWidth = 3;
    g.lineCap = "round";
    for (let i = 1; i < history.length; i++) {
      const a = history[i - 1];
      const b = history[i];
      g.strokeStyle = colors[b.zone];
      g.beginPath();
      g.moveTo(x(a.t), y(a.level));
      g.lineTo(x(b.t), y(b.level));
      g.stroke();
    }
  });

  return <canvas ref={canvas} className="min-h-16 w-full flex-1 rounded-xl border bg-card" />;
};

export default HistoryChart;
