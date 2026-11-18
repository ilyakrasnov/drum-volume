import { useEffect, useState } from "react";
import { type Band, PRESETS } from "@/lib/volume";

const STORAGE_KEY = "drum-volume-v1";

export type Mode = "practice" | "challenge";

type Settings = { band: Band; sensitivity: number; mode: Mode; bpm: number; counts: number; click: boolean };

const DEFAULTS: Settings = { band: PRESETS.Medium, sensitivity: 6, mode: "practice", bpm: 90, counts: 8, click: true };

function load(): Settings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") };
  } catch {
    return DEFAULTS;
  }
}

/** Target band, mic sensitivity and challenge setup, remembered on this device. */
export function usePracticeSettings() {
  const [settings, setSettings] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // private mode or storage blocked: settings just won't survive a reload
    }
  }, [settings]);

  const set =
    <K extends keyof Settings>(key: K) =>
    (value: Settings[K]) =>
      setSettings((s) => ({ ...s, [key]: value }));

  return {
    ...settings,
    setBand: set("band"),
    setSensitivity: set("sensitivity"),
    setMode: set("mode"),
    setBpm: set("bpm"),
    setCounts: set("counts"),
    setClick: set("click"),
  };
}
