# react-particle-emitter

[![License: Apache 2.0](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](./LICENSE)
![Platforms: iOS · Android · Web](https://img.shields.io/badge/platforms-iOS%20·%20Android%20·%20Web-lightgrey)
![Rendered with Skia](https://img.shields.io/badge/rendered%20with-Skia-ff69b4)

A physics-based **particle emitter for React Native, rendered with native [Skia](https://shopify.github.io/react-native-skia/)**. Build confetti, fireworks, sparkles, rain, glowing orbs, fountains, and ambient effects — on iOS, Android, and the Web from a single codebase.

This is a port of the Compose Multiplatform [ParticleEmitter](https://github.com/PiotrPrus/ParticleEmitter) library: same API concepts, same physics, same angle conventions, now for the React Native ecosystem.

<p align="center">
  <img src="https://raw.githubusercontent.com/PiotrPrus/react-native-particle-emitter/main/media/hero.gif" width="900" alt="Particle Emitter sample app" />
</p>

## Why

- **Native Skia rendering.** Particles are drawn straight into an `SkPicture` by [`@shopify/react-native-skia`](https://shopify.github.io/react-native-skia/) — no per-particle React views, no layout passes.
- **Runs on the UI thread.** The whole simulation (emission, physics integration, edge collisions, tweens) lives in a single [Reanimated](https://docs.swmansion.com/react-native-reanimated/) frame callback. The JS thread does zero per-frame work, so animations stay smooth even while React is busy.
- **Truly cross-platform.** The same component runs on iOS, Android, and the Web (Skia compiles to WebAssembly/CanvasKit there).

## Features

- **Two rendering engines**
  - `CanvasParticleEmitter` — Skia-rendered, high-performance, handles thousands of particles
  - `ParticlesEmitter` — animates arbitrary React elements (text, images, views) along ballistic trajectories, for when you need custom particle content
- **Physics simulation** — directional gravity, initial force, spread, rotation; incremental integration (`v += g·dt`, `p += v·dt`)
- **Configurable gravity** — strength + direction for falling confetti, rising bubbles, wind, attractors, …
- **Particle shapes** — circles, custom Skia paths, images (with color tinting), text / emoji
- **Edge behavior** — bounce (with damping), stick, wrap, or pass-through at the canvas boundary
- **Blend modes** — `screen`, `plus`, and every other Skia blend mode for additive glow effects
- **Emitter source shapes** — point, oval, rectangle, horizontal / vertical line
- **Multi-emitter orchestration** — sequential bursts with `MultiEmitter`
- **Runtime-safe config** — drive any config value from sliders/state and live particles keep flowing (no resets or flicker)
- **Presets** — `glowPreset`, `confettiPreset`, `emojiRainPreset`, `ringPreset`

## Installation

```sh
npm install react-particle-emitter @shopify/react-native-skia react-native-reanimated
```

`@shopify/react-native-skia` (>= 1.0) and `react-native-reanimated` (>= 3.0) are peer dependencies — follow their installation guides (Reanimated needs its Babel plugin, and Reanimated 4 also needs `react-native-worklets`).

## Quick start

### Canvas emitter (recommended for performance)

```tsx
import { StyleSheet } from 'react-native';
import { CanvasParticleEmitter } from 'react-particle-emitter';

<CanvasParticleEmitter
  style={StyleSheet.absoluteFill}
  config={{
    particlePerSecond: 50,
    emitterCenter: { x: 200, y: 400 },
    particleShapes: [{ type: 'circle' }],
    lifespanRange: [800, 1200],
    colors: ['cyan', 'magenta', 'yellow'],
    particleSizes: [{ width: 8, height: 8 }, { width: 12, height: 12 }],
    spread: [-90, 90],
    blendMode: 'screen',
    initialForce: [50, 150],
  }}
/>
```

Distances are in density-independent points (standard RN units), durations in milliseconds, angles in degrees.

### React-element particles

```tsx
import { Text } from 'react-native';
import { ParticlesEmitter } from 'react-particle-emitter';

<ParticlesEmitter
  style={StyleSheet.absoluteFill}
  config={{ particlesCount: 30, emitDurationMillis: 1000, initialForce: 80, gravityStrength: 1, spread: [-45, 45] }}
>
  <Text style={{ fontSize: 20 }}>✨</Text>
</ParticlesEmitter>
```

## Samples

The [`example/`](./example) folder is a full Expo app showcasing every feature, behind a web-style layout with a sample sidebar and a live fps meter. It runs on iOS, Android, and the Web:

```sh
cd example
npm install
npx expo start --web      # or: npx expo run:ios / run:android
```

<table>
<tr>
<td width="50%">
<img src="https://raw.githubusercontent.com/PiotrPrus/react-native-particle-emitter/main/media/canvas.gif" alt="Canvas Emitter" /><br/>
<b>Canvas Emitter</b><br/>
Star-image particles tinted and screen-blended around an avatar, with a live <code>0–1000/s</code> birth-rate slider. Shows image shapes, blend modes, and changing config at runtime.
</td>
<td width="50%">
<img src="https://raw.githubusercontent.com/PiotrPrus/react-native-particle-emitter/main/media/confetti.gif" alt="Confetti" /><br/>
<b>Confetti</b><br/>
Two <code>MultiEmitter</code> bursts of <i>React-element</i> particles — emoji and glowing, color-animating stars. Shows custom composable particles and sequential emitters.
</td>
</tr>
<tr>
<td width="50%">
<img src="https://raw.githubusercontent.com/PiotrPrus/react-native-particle-emitter/main/media/glow.gif" alt="Glow Particles" /><br/>
<b>Glow Particles</b><br/>
Slowly drifting orbs with pulsing halos that breathe between colors — Reanimated-animated React views as particles.
</td>
<td width="50%">
<img src="https://raw.githubusercontent.com/PiotrPrus/react-native-particle-emitter/main/media/gravity.gif" alt="Gravity" /><br/>
<b>Gravity</b><br/>
A fountain of circles and star images with a gravity on/off switch. Shows directional gravity bending trajectories into arcs.
</td>
</tr>
<tr>
<td width="50%">
<img src="https://raw.githubusercontent.com/PiotrPrus/react-native-particle-emitter/main/media/gravity-point.gif" alt="Gravity Point" /><br/>
<b>Gravity Point</b><br/>
A <b>draggable attractor</b> — the gravity angle and strength are recomputed each frame from the emitter to the point. Shows a dynamic gravity vector driven by touch.
</td>
<td width="50%">
<img src="https://raw.githubusercontent.com/PiotrPrus/react-native-particle-emitter/main/media/magic-wand.gif" alt="Magic Wand" /><br/>
<b>Magic Wand</b><br/>
<b>Drag the wand</b> to leave a sparkling trail of Skia <code>path</code> stars; the emission rate multiplies while moving. Shows path shapes and an emitter that follows touch.
</td>
</tr>
<tr>
<td width="50%">
<img src="https://raw.githubusercontent.com/PiotrPrus/react-native-particle-emitter/main/media/emoji-rain.gif" alt="Emoji Rain" /><br/>
<b>Emoji Rain</b><br/>
Full-screen emoji falling from a horizontal line under gravity, with a rate slider and a 3-second burst. Shows text/emoji particles and a line-shaped emitter region.
</td>
<td width="50%">
<img src="https://raw.githubusercontent.com/PiotrPrus/react-native-particle-emitter/main/media/ring.gif" alt="Ring Emitter" /><br/>
<b>Ring Emitter</b><br/>
An oval start region with a 360° spread, plus a <code>hideInStartRegion</code> toggle that keeps the ring's interior clean. Shows emitter region shapes.
</td>
</tr>
<tr>
<td width="50%">
<img src="https://raw.githubusercontent.com/PiotrPrus/react-native-particle-emitter/main/media/sticky-edges.gif" alt="Sticky Edges" /><br/>
<b>Sticky Edges</b><br/>
Long-lived particles under gravity with selectable edge behavior: <code>None</code> / <code>Bounce</code> / <code>Stick</code> / <code>Wrap</code>.
</td>
<td width="50%">
<img src="https://raw.githubusercontent.com/PiotrPrus/react-native-particle-emitter/main/media/benchmark.gif" alt="Benchmark" /><br/>
<b>Benchmark</b><br/>
A 2×5 grid of emitters, each pushing <code>1000/s</code>, with a +/- active count and the fps meter. Stress-tests throughput.
</td>
</tr>
<tr>
<td width="50%">
<img src="https://raw.githubusercontent.com/PiotrPrus/react-native-particle-emitter/main/media/single-benchmark.gif" alt="Single Emitter Benchmark" /><br/>
<b>Single Emitter Benchmark</b><br/>
One emitter with a <code>0 → 10,000/s</code> slider, to see how far a single emitter scales.
</td>
<td width="50%"></td>
</tr>
</table>

## Core concepts

### Gravity

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `gravityStrength` | `number` | `0` (canvas) / `1` (element) | Canvas: points/s². Element emitter: multiplier of ≈1 g. `0` = no gravity. |
| `gravityAngle` | `number` | `0` | Direction in degrees. `0` = down, `180` = up, `-90` = right, `90` = left. |

```ts
{ gravityStrength: 120, gravityAngle: 0 }    // falling confetti
{ gravityStrength: 50,  gravityAngle: 180 }  // rising bubbles
{ gravityStrength: 80,  gravityAngle: -90 }  // wind to the right
```

### Particle shapes

```tsx
import { Skia, useImage, matchFont } from '@shopify/react-native-skia';

{ type: 'circle' }                                              // filled with the particle color
{ type: 'image', image: useImage(require('./star.png')), tint: true }  // tinted with the particle color
{ type: 'path', path: Skia.Path.MakeFromSVGString('M0 0 L20 0 L10 18 Z')! }
{ type: 'text', text: '🎉', font: matchFont({ fontSize: 28 }) }
```

### Edge behavior

| Behavior | Description |
|----------|-------------|
| `{ type: 'none' }` | Particles pass through edges freely (default) |
| `{ type: 'bounce', damping: 0.7 }` | Reflect off edges; `damping` = velocity retained per bounce (0–1) |
| `{ type: 'stick' }` | Stop at the edge for the rest of the lifespan |
| `{ type: 'wrap' }` | Exit one edge, reappear on the opposite side |

Collision accounts for particle size — the visual edge touches the boundary, not the center.

### Hide in start region

With a ring emitter (`startRegionShape: 'oval'`) and a 360° spread, particles crossing the interior clutter the center. Set `hideInStartRegion: true` to skip drawing particles while their position is inside the start region — physics is untouched.

### Easing

`alphaEasing` and `scaleEasing` run on the UI thread, so they **must be worklets**. The exported curves (`linearEasing`, `fastOutSlowInEasing`, `easeOutCubic`, …) already are. Custom ones need the directive:

```ts
const myEasing = (t: number) => { 'worklet'; return t * t; };
```

## API parity with the Compose library

| Compose | React Native |
|---------|--------------|
| `CanvasParticleEmitter` + `CanvasEmitterConfig` | `CanvasParticleEmitter` + `CanvasEmitterConfig` |
| `ParticlesEmitter` + `EmitterConfig` + trailing composable | `ParticlesEmitter` + `EmitterConfig` + `children` / `renderParticle` |
| `MultiEmitter` | `MultiEmitter` |
| `ParticleShape.Circle / Image / PathShape / Text` | `{ type: 'circle' \| 'image' \| 'path' \| 'text' }` |
| `EdgeBehavior.None / Bounce / Stick / Wrap` | `{ type: 'none' \| 'bounce' \| 'stick' \| 'wrap' }` |
| `IntRange` | `[min, max]` tuple |
| `DpOffset` / `DpSize` | `{ x, y }` / `{ width, height }` in points |
| `BlendMode.Screen` … | `'screen'` … (string names) |

## Performance notes

- The whole simulation runs in one Reanimated `useFrameCallback` on the UI thread; drawing is recorded into an `SkPicture` consumed directly by the Skia canvas. The JS thread does no per-frame work.
- `maxParticles` (default 5000) caps the live particle count as a safety valve.
- **Changing `config` at runtime is smooth** — drive `particlePerSecond`, gravity, colors, edge behavior, etc. from sliders/state and live particles keep flowing without resetting. The simulation runs on a monotonic clock the emitter owns (not Reanimated's `timeSinceFirstFrame`, which resets whenever the frame callback re-registers), and the frame callback is kept referentially stable so config edits don't tear it down.
- Pass a memoized `config` object (`useMemo`). A new config identity is handled gracefully, but it re-runs `resolveConfig` (rebuilding Skia color filters, re-measuring text), so memoizing avoids that work on unrelated re-renders.

## Web

Skia renders on the Web via CanvasKit (WebAssembly). The example app shows the full setup; the essentials:

- Install `react-native-web`, `react-dom`, and run `npx setup-skia-web public` to copy `canvaskit.wasm`, then load it with `WithSkiaWeb` (see [`example/App.tsx`](./example/App.tsx)).
- CanvasKit ships no emoji font, so on the Web the Emoji Rain sample rasterizes emoji through a DOM canvas into `SkImage` particles ([`example/src/shapes.ts`](./example/src/shapes.ts)); on native it uses Skia text shapes via `matchFont`.
- React 19's dev-only Component Performance Track serializes component props, and Skia host objects reference the entire CanvasKit module — serializing one freezes the main thread. The example disables it ([`example/disableReactPerfTrack.ts`](./example/disableReactPerfTrack.ts), the first import in `index.ts`); add the same shim if you pass image/path/text shapes and develop on Web. Production builds are unaffected.

## Roadmap

- [ ] Publish to npm
- [ ] Prebuilt bundle via `react-native-builder-bob`
- [ ] Animated GIF previews in this README

## License

[Apache License 2.0](./LICENSE) © Piotr Prus
