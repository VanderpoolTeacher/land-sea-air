import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, STATES, STARTING_CREDITS, COSTS } from './config.js';
import { createMap } from './map.js';
import { renderFrame } from './renderer.js';
import { createTower, upgradeTower, repairTower, getUpgradeCost } from './entities/tower.js';
import { initInput } from './input.js';

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
  game.ctx.save();
  renderFrame(game.ctx, game);
  game.ctx.restore();
}

// --- Game Initialization ---
function initGame() {
  const mapData = createMap();
  game.paths = mapData.paths;
  game.towerSlots = mapData.towerSlots;
  game.buildings = mapData.buildings;
  game.towers = [];
  game.enemies = [];
  game.projectiles = [];
  game.particles = [];
  game.credits = STARTING_CREDITS;
  game.currentWave = 0;
  game.selectedSlot = null;
  game.state = STATES.PLACEMENT;
  document.getElementById('start-wave-btn').style.display = '';
  updateHUD();
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
    initGame();
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

// --- Tower Panel ---
function showTowerPanel(tower) {
  const panel = document.getElementById('tower-panel');
  const title = document.getElementById('panel-title');
  const info = document.getElementById('panel-info');
  const actions = document.getElementById('panel-actions');

  title.textContent = `${tower.name} Tower (Lv${tower.level})`;
  info.innerHTML = `HP: ${tower.hp}/${tower.maxHp}<br>Damage: ${tower.damage}<br>Range: ${tower.range}`;

  actions.innerHTML = '';

  const upgCost = getUpgradeCost(tower);
  if (tower.level < 3) {
    const btn = document.createElement('button');
    btn.className = 'panel-btn';
    btn.textContent = `Upgrade (${upgCost}c)`;
    btn.disabled = game.credits < upgCost;
    btn.onclick = () => {
      if (game.credits >= upgCost) {
        game.credits -= upgCost;
        upgradeTower(tower);
        updateHUD();
        showTowerPanel(tower);
      }
    };
    actions.appendChild(btn);
  }

  if (tower.hp < tower.maxHp) {
    const btn = document.createElement('button');
    btn.className = 'panel-btn';
    btn.textContent = `Repair (${COSTS.repair}c)`;
    btn.disabled = game.credits < COSTS.repair;
    btn.onclick = () => {
      if (game.credits >= COSTS.repair) {
        game.credits -= COSTS.repair;
        repairTower(tower);
        updateHUD();
        showTowerPanel(tower);
      }
    };
    actions.appendChild(btn);
  }

  const rect = game.canvas.getBoundingClientRect();
  const sx = tower.x / VIRTUAL_WIDTH * rect.width;
  const sy = tower.y / VIRTUAL_HEIGHT * rect.height;
  panel.style.left = `${sx + 30}px`;
  panel.style.top = `${sy - 20}px`;
  panel.style.display = 'block';
}

function hideTowerPanel() {
  document.getElementById('tower-panel').style.display = 'none';
}

// --- Init ---
function init() {
  initCanvas();
  bindUI();
  initInput(game, {
    onSlotClick(slot) {
      if (slot.locked) {
        if (game.credits >= COSTS.unlockSlot) {
          game.credits -= COSTS.unlockSlot;
          slot.locked = false;
          updateHUD();
        }
        return;
      }
      const towerType = { land: 'cannon', sea: 'torpedo', air: 'missile' }[slot.domain];
      if (game.credits >= COSTS.buildTower) {
        game.credits -= COSTS.buildTower;
        const tower = createTower(towerType, slot);
        slot.tower = tower;
        game.towers.push(tower);
        updateHUD();
        hideTowerPanel();
      }
    },
    onTowerClick(tower) {
      showTowerPanel(tower);
    },
    onDeselect() {
      hideTowerPanel();
    },
  });
  game.lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

init();

export { game };
