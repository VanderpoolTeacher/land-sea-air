import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, STATES } from './config.js';

// --- Game State ---
const game = {
  state: STATES.MENU,
  canvas: null,
  ctx: null,
  scale: 1,
  lastTime: 0,
  towers: [],
  enemies: [],
  projectiles: [],
  particles: [],
  credits: 0,
  currentWave: 0,
  buildings: [],    // { domain, hp, maxHp, x, y }
  towerSlots: [],   // { domain, x, y, locked, tower }
  paths: {},
  selectedSlot: null,
};

// --- Canvas Setup ---
function initCanvas() {
  game.canvas = document.getElementById('game-canvas');
  game.ctx = game.canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  const container = document.getElementById('game-container');
  const rect = container.getBoundingClientRect();
  game.canvas.width = rect.width * window.devicePixelRatio;
  game.canvas.height = rect.height * window.devicePixelRatio;
  game.scale = game.canvas.width / VIRTUAL_WIDTH;
  game.ctx.setTransform(game.scale, 0, 0, game.scale, 0, 0);
}

// --- Game Loop ---
function gameLoop(timestamp) {
  const dt = Math.min((timestamp - game.lastTime) / 1000, 0.05); // cap dt at 50ms
  game.lastTime = timestamp;

  update(dt);
  render();

  requestAnimationFrame(gameLoop);
}

function update(dt) {
  if (game.state === STATES.WAVE) {
    // TODO: update wave spawning, enemies, towers, projectiles, combat
  }
}

function render() {
  const ctx = game.ctx;
  ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

  // Draw background
  ctx.fillStyle = '#f5f0e8';
  ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

  // TODO: draw lanes, towers, enemies, projectiles, HUD elements on canvas
}

// --- HUD ---
function updateHUD() {
  document.getElementById('wave-counter').textContent = `Wave ${game.currentWave}/10`;
  document.getElementById('credits-display').textContent = `Credits: ${game.credits}`;
}

// --- UI Event Binding ---
function bindUI() {
  document.getElementById('start-game-btn').addEventListener('click', () => {
    document.getElementById('menu-screen').style.display = 'none';
    game.state = STATES.PLACEMENT;
    document.getElementById('start-wave-btn').style.display = '';
    updateHUD();
  });

  document.getElementById('start-wave-btn').addEventListener('click', () => {
    if (game.state === STATES.PLACEMENT) {
      game.state = STATES.WAVE;
      document.getElementById('start-wave-btn').style.display = 'none';
      // TODO: start wave spawning
    }
  });

  document.getElementById('continue-btn').addEventListener('click', () => {
    document.getElementById('wave-end-screen').style.display = 'none';
    game.state = STATES.PLACEMENT;
    document.getElementById('start-wave-btn').style.display = '';
  });

  document.getElementById('restart-btn').addEventListener('click', () => {
    document.getElementById('end-screen').style.display = 'none';
    document.getElementById('menu-screen').style.display = 'flex';
    game.state = STATES.MENU;
  });
}

// --- Init ---
function init() {
  initCanvas();
  bindUI();
  game.lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

init();

export { game };
