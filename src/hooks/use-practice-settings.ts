import { useEffect, useState } from "react";
import { type Band, PRESETS } from "@/lib/volume";

const STORAGE_KEY = "drum-volume-v1";

type Settings = { band: Band; sensitivity: number };

const DEFAULTS: Settings = { band: PRESETS.Medium, sensitivity: 6 };

function load(): Settings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") };
  } catch {
    return DEFAULTS;
  }
}

/** Target band and mic sensitivity, remembered on this device. */
export function usePracticeSettings() {
  const [settings, setSettings] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // private mode or storage blocked: settings just won't survive a reload
    }
  }, [settings]);

  return {
    ...settings,
    setBand: (band: Band) => setSettings((s) => ({ ...s, band })),
    setSensitivity: (sensitivity: number) => setSettings((s) => ({ ...s, sensitivity })),
  };
}
