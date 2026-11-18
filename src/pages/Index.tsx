import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import BandControls from "@/components/BandControls";
import ChallengeLive from "@/components/ChallengeLive";
import ChallengeSetup from "@/components/ChallengeSetup";
import HistoryChart from "@/components/HistoryChart";
import LevelReadout from "@/components/LevelReadout";
import ModeSwitch from "@/components/ModeSwitch";
import SessionControls from "@/components/SessionControls";
import StartScreen from "@/components/StartScreen";
import VolumeMeter from "@/components/VolumeMeter";
import ZoneStats from "@/components/ZoneStats";
import { useChallenge } from "@/hooks/use-challenge";
import { useDrumLevel } from "@/hooks/use-drum-level";
import { type Mode, usePracticeSettings } from "@/hooks/use-practice-settings";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { bandAround } from "@/lib/volume";

const CHALLENGE_TARGETS = 8;

const Index = () => {
  const demo = useSearchParams()[0].has("demo");
  const settings = usePracticeSettings();
  const challenge = useChallenge({ bpm: settings.bpm, counts: settings.counts, targets: CHALLENGE_TARGETS }, settings.click);
  const band = challenge.target?.band ?? settings.band;
  const drum = useDrumLevel({
    band,
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

  useEffect(() => challenge.record(drum.zone));

  const switchMode = (mode: Mode) => {
    challenge.stop();
    settings.setMode(mode);
  };

  return (
    <div className="absolute inset-0 grid grid-cols-[minmax(180px,30vw)_1fr] gap-[4vw] px-[max(4vw,env(safe-area-inset-left))] py-[max(3vh,env(safe-area-inset-top))]">
      <VolumeMeter
        level={drum.level}
        peak={drum.peak}
        zone={drum.zone}
        band={band}
        onBandChange={challenge.running ? () => {} : settings.setBand}
      />
      <div className="flex min-w-0 flex-col gap-[3vh]">
        <ModeSwitch mode={settings.mode} onChange={switchMode} />
        <LevelReadout level={drum.level} zone={drum.zone} paused={drum.paused} calibrateLeft={drum.calibrateLeft} />
        {settings.mode === "practice" ? (
          <>
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
          </>
        ) : challenge.running && challenge.moment && challenge.target ? (
          <ChallengeLive
            moment={challenge.moment}
            target={challenge.target}
            next={challenge.next}
            counts={settings.counts}
            seq={challenge.seq}
            scores={challenge.scores}
            onStop={challenge.stop}
          />
        ) : (
          <ChallengeSetup
            bpm={settings.bpm}
            onBpm={settings.setBpm}
            counts={settings.counts}
            onCounts={settings.setCounts}
            click={settings.click}
            onClick={settings.setClick}
            result={challenge.result}
            onStart={challenge.start}
          />
        )}
      </div>
      {!drum.started && <StartScreen onStart={drum.start} error={drum.error} />}
    </div>
  );
};

export default Index;
