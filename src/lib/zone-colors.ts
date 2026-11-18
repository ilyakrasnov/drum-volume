import type { Zone } from "./volume";

export const zoneBg: Record<Zone, string> = { soft: "bg-zone-soft", ok: "bg-zone-ok", loud: "bg-zone-loud" };
export const zoneText: Record<Zone, string> = { soft: "text-zone-soft", ok: "text-zone-ok", loud: "text-zone-loud" };

/** Canvas can't use Tailwind classes, so read the same tokens from CSS. */
export function zoneColors(): Record<Zone, string> {
  const css = getComputedStyle(document.documentElement);
  const token = (name: string) => `hsl(${css.getPropertyValue(name).trim()})`;
  return { soft: token("--zone-soft"), ok: token("--zone-ok"), loud: token("--zone-loud") };
}
