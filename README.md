# Drum Volume

Live volume trainer for drum practice on an iPad. The mic listens to the kit and a meter shows whether he's playing inside a green target band: too soft, right there, or too loud.

Same stack as loop-buddy: Vite, React, TypeScript, Tailwind, shadcn.

## Run

```sh
npm install
npm run dev        # http://localhost:8080
npm test
npm run build      # static files in dist/
```

Add `?demo` to the URL to try it without a kit: a fake drummer drifts in and out of the band.

## Notes

- The iPad only allows the mic on an `https://` address (or `localhost`), so it must be hosted to use on the iPad.
- Echo cancellation, noise suppression and auto gain are turned off. Auto gain would flatten exactly the loudness we're measuring.
- Levels are 0–100 over a 60 dB window. "mic sensitivity" slides that window for quieter or louder rooms.
- To host under a sub-path, build with `BASE_PATH=/drum-volume/ npm run build`.
- The three looks explored before this one are on the `prototype/intensity-ui` branch.
