const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const startBtn = document.getElementById("start-btn");

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");
const oxygenEl = document.getElementById("oxygen");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const keys = {
  up: false,
  down: false,
  left: false,
  right: false,
  dash: false,
};

const STORAGE_KEY = "turbo_fishstick_high_score";

let lastTime = 0;
let running = false;

let player;
let score;
let oxygen;
let hazards;
let bubbles;
let spawnTimer;
let bubbleTimer;
let difficulty;

const highScore = Number(localStorage.getItem(STORAGE_KEY) || 0);
highScoreEl.textContent = String(highScore);

function createPlayer() {
  return {
    x: WIDTH * 0.22,
    y: HEIGHT * 0.5,
    radius: 22,
    speed: 240,
    dashEnergy: 100,
  };
}

function resetState() {
  player = createPlayer();
  score = 0;
  oxygen = 100;
  hazards = [];
  bubbles = [];
  spawnTimer = 0;
  bubbleTimer = 0;
  difficulty = 1;
  updateHud();
}

function updateHud() {
  scoreEl.textContent = String(Math.floor(score));
  oxygenEl.textContent = `${Math.max(0, Math.floor(oxygen))}%`;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function spawnHazard() {
  const type = Math.random() < 0.55 ? "hook" : "jelly";
  const size = type === "hook" ? randomBetween(16, 28) : randomBetween(20, 32);
  hazards.push({
    type,
    x: WIDTH + size + 12,
    y: randomBetween(size, HEIGHT - size),
    radius: size,
    speed: randomBetween(140, 250) + difficulty * 20,
    wobble: randomBetween(0.5, 2.2),
    seed: Math.random() * 100,
  });
}

function spawnBubble() {
  bubbles.push({
    x: WIDTH + 12,
    y: randomBetween(20, HEIGHT - 20),
    radius: randomBetween(9, 14),
    speed: randomBetween(120, 180),
  });
}

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function update(dt) {
  const vx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  const vy = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
  const moveLen = Math.hypot(vx, vy) || 1;

  const isDashing = keys.dash && player.dashEnergy > 0;
  const dashFactor = isDashing ? 1.8 : 1;

  player.x += (vx / moveLen) * player.speed * dashFactor * dt;
  player.y += (vy / moveLen) * player.speed * dashFactor * dt;

  player.x = Math.max(player.radius, Math.min(WIDTH - player.radius, player.x));
  player.y = Math.max(player.radius, Math.min(HEIGHT - player.radius, player.y));

  if (isDashing) {
    player.dashEnergy = Math.max(0, player.dashEnergy - 55 * dt);
  } else {
    player.dashEnergy = Math.min(100, player.dashEnergy + 25 * dt);
  }

  score += 8.5 * dt * difficulty;
  oxygen -= 4.2 * dt;

  difficulty += 0.035 * dt;
  spawnTimer -= dt;
  bubbleTimer -= dt;

  if (spawnTimer <= 0) {
    spawnHazard();
    spawnTimer = Math.max(0.24, randomBetween(0.55, 1.05) - difficulty * 0.045);
  }

  if (bubbleTimer <= 0) {
    spawnBubble();
    bubbleTimer = randomBetween(0.7, 1.5);
  }

  for (const hazard of hazards) {
    hazard.x -= hazard.speed * dt;
    hazard.y += Math.sin(performance.now() / 650 + hazard.seed) * hazard.wobble;

    if (distance(player, hazard) < player.radius + hazard.radius * 0.78) {
      oxygen -= hazard.type === "hook" ? 24 : 16;
      hazard.x = -100;
    }
  }

  for (const bubble of bubbles) {
    bubble.x -= bubble.speed * dt;
    if (distance(player, bubble) < player.radius + bubble.radius) {
      score += 22;
      oxygen = Math.min(100, oxygen + 13);
      bubble.x = -100;
    }
  }

  hazards = hazards.filter((h) => h.x > -80);
  bubbles = bubbles.filter((b) => b.x > -40);

  updateHud();

  if (oxygen <= 0) {
    endGame();
  }
}

function drawBackground() {
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  for (let i = 0; i < 48; i += 1) {
    const x = (i * 137 + performance.now() * 0.06) % (WIDTH + 20);
    const y = (i * 79 + performance.now() * 0.03) % (HEIGHT + 20);
    const r = 1 + (i % 3);
    ctx.beginPath();
    ctx.arc(WIDTH - x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);
  const angle = ((keys.down ? 1 : 0) - (keys.up ? 1 : 0)) * 0.18;
  ctx.rotate(angle);

  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.ellipse(0, 0, 30, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ff922b";
  ctx.beginPath();
  ctx.moveTo(-26, 0);
  ctx.lineTo(-44, -13);
  ctx.lineTo(-44, 13);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#0b1d29";
  ctx.beginPath();
  ctx.arc(13, -4, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  const barWidth = 100;
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(14, 14, barWidth, 10);
  ctx.fillStyle = "#79f2d0";
  ctx.fillRect(14, 14, (player.dashEnergy / 100) * barWidth, 10);
}

function drawHazard(hazard) {
  if (hazard.type === "hook") {
    ctx.strokeStyle = "#dce5ec";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(hazard.x - 6, hazard.y - 34);
    ctx.lineTo(hazard.x - 6, hazard.y - 8);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(hazard.x, hazard.y, hazard.radius * 0.62, 0.2, Math.PI * 1.6);
    ctx.stroke();
  } else {
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath();
    ctx.arc(hazard.x, hazard.y, hazard.radius * 0.75, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 233, 233, 0.8)";
    ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i += 1) {
      ctx.beginPath();
      ctx.moveTo(hazard.x + i * 5, hazard.y + hazard.radius * 0.45);
      ctx.lineTo(hazard.x + i * 6, hazard.y + hazard.radius + 6);
      ctx.stroke();
    }
  }
}

function drawBubble(bubble) {
  ctx.fillStyle = "rgba(184, 249, 255, 0.35)";
  ctx.strokeStyle = "rgba(220, 254, 255, 0.9)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "700 12px 'Space Grotesk'";
  ctx.textAlign = "center";
  ctx.fillText("+", bubble.x, bubble.y + 4);
}

function render() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawBackground();

  for (const bubble of bubbles) {
    drawBubble(bubble);
  }

  for (const hazard of hazards) {
    drawHazard(hazard);
  }

  drawPlayer();
}

function gameLoop(timestamp) {
  if (!running) {
    return;
  }

  const dt = Math.min(0.03, (timestamp - lastTime) / 1000 || 0.016);
  lastTime = timestamp;

  update(dt);
  render();
  requestAnimationFrame(gameLoop);
}

function startGame() {
  resetState();
  running = true;
  overlay.classList.remove("visible");
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function endGame() {
  running = false;

  const finalScore = Math.floor(score);
  const currentHigh = Number(localStorage.getItem(STORAGE_KEY) || 0);
  if (finalScore > currentHigh) {
    localStorage.setItem(STORAGE_KEY, String(finalScore));
    highScoreEl.textContent = String(finalScore);
  }

  overlayTitle.textContent = "Out of Air";
  overlayText.textContent = `Score: ${finalScore}. Try again and beat your record.`;
  startBtn.textContent = "Play Again";
  overlay.classList.add("visible");
}

function setKeyState(event, isDown) {
  const key = event.key.toLowerCase();
  if (key === "w" || key === "arrowup") keys.up = isDown;
  if (key === "s" || key === "arrowdown") keys.down = isDown;
  if (key === "a" || key === "arrowleft") keys.left = isDown;
  if (key === "d" || key === "arrowright") keys.right = isDown;
  if (key === "shift") keys.dash = isDown;
}

window.addEventListener("keydown", (event) => setKeyState(event, true));
window.addEventListener("keyup", (event) => setKeyState(event, false));

startBtn.addEventListener("click", () => {
  if (!running) {
    startGame();
  }
});

resetState();
render();