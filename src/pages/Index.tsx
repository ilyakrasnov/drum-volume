import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import BandControls from "@/components/BandControls";
import HistoryChart from "@/components/HistoryChart";
import LevelReadout from "@/components/LevelReadout";
import SessionControls from "@/components/SessionControls";
import StartScreen from "@/components/StartScreen";
import VolumeMeter from "@/components/VolumeMeter";
import ZoneStats from "@/components/ZoneStats";
import { useDrumLevel } from "@/hooks/use-drum-level";
import { usePracticeSettings } from "@/hooks/use-practice-settings";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { bandAround } from "@/lib/volume";

const Index = () => {
  const demo = useSearchParams()[0].has("demo");
  const settings = usePracticeSettings();
  const drum = useDrumLevel({
    band: settings.band,
    sensitivity: settings.sensitivity,
    demo,
    onCalibrated: (level) => settings.setBand(bandAround(level)),
  });
  useWakeLock(drum.started);

  // demo mode needs no mic permission, so skip the tap
  const { start } = drum;
  useEffect(() => {
    if (demo) start();
  }, [demo, start]);

  return (
    <div className="absolute inset-0 grid grid-cols-[minmax(180px,30vw)_1fr] gap-[4vw] px-[max(4vw,env(safe-area-inset-left))] py-[max(3vh,env(safe-area-inset-top))]">
      <VolumeMeter
        level={drum.level}
        peak={drum.peak}
        zone={drum.zone}
        band={settings.band}
        onBandChange={settings.setBand}
      />
      <div className="flex min-w-0 flex-col gap-[3vh]">
        <LevelReadout level={drum.level} zone={drum.zone} paused={drum.paused} calibrateLeft={drum.calibrateLeft} />
        <ZoneStats score={drum.score} band={settings.band} />
        <HistoryChart history={drum.history} now={drum.t} />
        <p className="min-h-[1.3em] font-bold text-warn">
          {drum.clippedRecently && "The mic is maxed out. Move the iPad further from the drums."}
        </p>
        <BandControls band={settings.band} onBandChange={settings.setBand} onCalibrate={drum.calibrate} />
        <SessionControls
          sensitivity={settings.sensitivity}
          onSensitivity={settings.setSensitivity}
          paused={drum.paused}
          onTogglePause={drum.togglePause}
          onReset={drum.resetScore}
        />
      </div>
      {!drum.started && <StartScreen onStart={drum.start} error={drum.error} />}
    </div>
  );
};

export default Index;
