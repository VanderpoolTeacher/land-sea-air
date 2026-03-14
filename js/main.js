import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, STATES, STARTING_CREDITS, COSTS, WAVES } from './config.js';
import { createMap } from './map.js';
import { renderFrame } from './renderer.js';
import { createTower, upgradeTower, repairTower, getUpgradeCost } from './entities/tower.js';
import { updateEnemy } from './entities/enemy.js';
import { initInput } from './input.js';
import { createWaveState, startWave, updateWave, isWaveComplete } from './systems/wave.js';
import { updateCombat, updateParticles } from './systems/combat.js';

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
    const wave = WAVES[game.currentWave];
    updateWave(game.waveState, dt, game.paths, game.enemies, wave.hpMod, wave.speedMod, wave.spawnRate);

    for (const enemy of game.enemies) {
      updateEnemy(enemy, dt, game.towers, game.buildings);
    }

    updateCombat(dt, game.towers, game.enemies, game.projectiles, game.particles);
    updateParticles(dt, game.particles);

    // Award bounties for dead enemies
    for (const enemy of game.enemies) {
      if (!enemy.alive && !enemy.bountyClaimed) {
        game.credits += enemy.bounty;
        enemy.bountyClaimed = true;
      }
    }

    // Remove dead towers from slots
    for (const tower of game.towers) {
      if (tower.hp <= 0) {
        tower.slot.tower = null;
      }
    }
    game.towers = game.towers.filter(t => t.hp > 0);

    // Clean up dead enemies (keep those attacking buildings)
    game.enemies = game.enemies.filter(e => e.alive || e.attackingBuilding);

    // Check lose condition
    if (game.buildings.every(b => !b.alive)) {
      game.state = STATES.LOSE;
      showEndScreen('Defeat!', 'All resource buildings were destroyed.');
      return;
    }

    // Check wave complete
    if (isWaveComplete(game.waveState, game.enemies)) {
      game.enemies = [];
      game.currentWave++;

      if (game.currentWave >= WAVES.length) {
        game.state = STATES.WIN;
        showEndScreen('Victory!', 'You survived all 10 waves!');
      } else {
        game.state = STATES.WAVE_END;
        showWaveEndScreen();
      }
    }

    updateHUD();
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
  game.waveState = createWaveState();
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
      hideTowerPanel();
      document.getElementById('start-wave-btn').style.display = 'none';
      startWave(game.waveState, game.currentWave);
    }
  });

  document.getElementById('continue-btn').addEventListener('click', () => {
    document.getElementById('wave-end-screen').style.display = 'none';
    game.enemies = [];
    game.projectiles = [];
    game.particles = [];
    game.state = STATES.PLACEMENT;
    document.getElementById('start-wave-btn').style.display = '';
    updateHUD();
  });

  document.getElementById('restart-btn').addEventListener('click', () => {
    document.getElementById('end-screen').style.display = 'none';
    document.getElementById('menu-screen').style.display = 'flex';
    game.state = STATES.MENU;
  });
}

// --- End / Wave-End Screens ---
function showEndScreen(title, info) {
  document.getElementById('end-title').textContent = title;
  document.getElementById('end-info').textContent = info;
  document.getElementById('end-screen').style.display = 'flex';
}

function showWaveEndScreen() {
  const survivingBuildings = game.buildings.filter(b => b.alive).length;
  const income = 30 + survivingBuildings * 10;
  game.credits += income;

  document.getElementById('wave-end-title').textContent = `Wave ${game.currentWave} Complete!`;
  document.getElementById('wave-end-info').textContent = `Income: +${income} credits (${survivingBuildings} buildings alive)`;
  document.getElementById('wave-end-screen').style.display = 'flex';
  updateHUD();
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
