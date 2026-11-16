---
title: Noise Weave
description: Vertical lines whose horizontal position is pulled by a travelling noise field, building a slow moiré.
year: 2026
tags:
  - Generative
  - p5.js
sketch: /experiments/noise-weave/sketch.html
poster: /experiments/noise-weave/poster.svg
order: 2
---

The idea came from watching a printer head scan across a page: one axis moves mechanically, the other is free to drift. Here the drift is noise, sampled per line and offset by time.

## How it works

The canvas is divided into evenly spaced columns. Each frame, every column's x position is offset by a noise value sampled at its index and the current time, then a vertical line is drawn from top to bottom in a translucent colour.

Because neighbouring columns sample nearby noise values, the offsets are correlated — the lines lean together. As time advances, the correlation drifts, which is what produces the slow wave across the frame.

## Tuning

The spacing between columns is the whole sketch. Too wide and you see individual lines; too narrow and the moiré aliases into noise. Somewhere around eleven pixels on a normal display it reads as a single surface.

The canvas is cleared every frame, so the image is one instant of the field rather than an accumulation. The depth comes from the second pass at half the spacing, drawn in a warmer colour — its edges land between the first pass's lines, and that interference is what you see moving.
