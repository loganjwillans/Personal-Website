/**
 * Flow Field — p5.js port of a Processing sketch.
 *
 * Particles sample a static Perlin noise field; only the third noise
 * dimension advances, so the movement reads as a current rather than jitter.
 * Each particle draws exactly one line per frame at low alpha, which is what
 * builds the trail.
 */

const PARTICLE_COUNT = 900;
const NOISE_SCALE = 0.0016;
const TRAIL_ALPHA = 14;
const Z_STEP = 0.0008;

let particles = [];
let zoff = 0;

class Particle {
  constructor() {
    this.reset();
    this.warm = random() < 0.12;
  }

  reset() {
    this.x = random(-20, width + 20);
    this.y = random(-20, height + 20);
    this.prevX = this.x;
    this.prevY = this.y;
    this.speed = random(0.6, 1.9);
  }

  step() {
    const angle = noise(this.x * NOISE_SCALE, this.y * NOISE_SCALE, zoff) * TAU * 2;

    this.prevX = this.x;
    this.prevY = this.y;
    this.x += cos(angle) * this.speed;
    this.y += sin(angle) * this.speed;

    if (this.x < -20 || this.x > width + 20 || this.y < -20 || this.y > height + 20) {
      this.reset();
    }
  }

  show() {
    if (this.warm) stroke(255, 176, 120, TRAIL_ALPHA);
    else stroke(120, 190, 255, TRAIL_ALPHA);
    line(this.prevX, this.prevY, this.x, this.y);
  }
}

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent(document.body);
  pixelDensity(Math.min(2, window.devicePixelRatio || 1));
  noFill();
  strokeCap(ROUND);
  reset();
}

function reset() {
  background(12, 13, 16);
  particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  zoff = 0;
}

function draw() {
  for (const particle of particles) {
    particle.step();
    particle.show();
  }
  zoff += Z_STEP;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  reset();
}

// Stop burning frames when the tab is hidden.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) noLoop();
  else loop();
});
