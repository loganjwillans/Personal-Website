---
title: Flow Field
description: Nine hundred particles drifting through a Perlin noise field, each one remembering only its last position.
year: 2026
tags:
  - Generative
  - p5.js
sketch: /projects/flow-field/sketch.html
poster: /projects/flow-field/poster.svg
order: 1
---

The first version was sixteen lines: pick a random point, read the noise field, move a little, draw a line. Everything since has been tuning.

## How it works

Each particle samples Perlin noise at its own coordinates, plus a slowly advancing third dimension. That third value is the only thing that changes over time â€” the field itself is static, so the movement reads as a current rather than a jitter.

The trail comes from drawing a single line per particle per frame with a very low alpha. New lines are almost transparent; old ones accumulate until they read as solid. When a particle leaves the canvas it resets to a random edge, so the composition never empties.

## The three numbers that matter

- **Noise scale** controls how tight the curves are. Above 0.004 everything becomes a scribble; below 0.0008 it's nearly straight lines.
- **Particle count** controls density. Nine hundred fills a laptop screen; beyond about two thousand the frame rate starts to show on integrated graphics.
- **Trail alpha** controls the exposure. Fourteen out of 255 is the point where the image builds up without turning into a grey wash.

## What I'd change

The colour is arbitrary. It's two hues from the site palette, and the sketch would be more interesting if the hue drifted with the noise value too. I left it alone because the first version looked good and I didn't want to re-tune the alpha.
