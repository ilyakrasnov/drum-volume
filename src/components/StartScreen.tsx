import { Button } from "@/components/ui/button";

type Props = { onStart: () => void; error: string | null };

/** iOS only opens the mic after a tap, so the app starts behind this screen. */
const StartScreen = ({ onStart, error }: Props) => (
  <div className="fixed inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-background/95 p-6 text-center">
    <h1 className="text-5xl font-bold">Drum Volume</h1>
    <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
      Put the iPad where it can hear the whole kit, about 1–2 meters away. Play inside the green band.
    </p>
    <Button className="h-auto rounded-xl bg-zone-ok px-10 py-4 text-2xl text-white hover:bg-zone-ok/90" onClick={onStart}>
      Start listening
    </Button>
    {error && <p className="max-w-lg text-lg text-zone-loud">{error}</p>}
  </div>
);

export default StartScreen;
