/**
 * Noise Weave — vertical lines whose x position is pulled by a travelling
 * noise field. Two passes at different spacings interfere, which is where the
 * moiré comes from.
 */

const SPACING = 11;
const T_STEP = 0.006;

let t = 0;

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent(document.body);
  pixelDensity(Math.min(2, window.devicePixelRatio || 1));
  strokeCap(SQUARE);
}

function draw() {
  // Cleared each frame: what you see is one instant of the field. The moiré
  // comes from the interference between the two passes, not from trails.
  background(12, 13, 16);

  weave(SPACING, 0.004, 0, 150, 200, 255);
  weave(SPACING * 0.5, 0.0045, 100, 255, 176, 120);

  t += T_STEP;
}

function weave(spacing, frequency, offset, r, g, b) {
  noFill();
  for (let x = 0; x <= width + spacing; x += spacing) {
    const n = noise(x * frequency + offset, t);
    const drift = map(n, 0, 1, -28, 28);
    const alpha = map(n, 0, 1, 60, 210);

    strokeWeight(1.2);
    stroke(r, g, b, alpha);
    line(x + drift, 0, x + drift, height);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) noLoop();
  else loop();
});
