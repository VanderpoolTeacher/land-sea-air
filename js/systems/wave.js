import { WAVES } from '../config.js';
import { createEnemy } from '../entities/enemy.js';

export function createWaveState() {
  return {
    active: false,
    waveIndex: 0,
    spawnQueue: [],
    spawnTimer: 0,
    initialDelay: 3.0,
    delayTimer: 0,
    started: false,
  };
}

export function startWave(waveState, waveIndex) {
  const wave = WAVES[waveIndex];
  if (!wave) return false;

  waveState.waveIndex = waveIndex;
  waveState.active = true;
  waveState.started = false;
  waveState.delayTimer = 3.0;
  waveState.spawnTimer = 0;

  // Build interleaved spawn queue
  const entries = [];
  for (let i = 0; i < wave.infantry; i++) entries.push({ typeKey: 'infantry', domain: 'land' });
  for (let i = 0; i < wave.patrolBoat; i++) entries.push({ typeKey: 'patrolBoat', domain: 'sea' });
  for (let i = 0; i < wave.drone; i++) entries.push({ typeKey: 'drone', domain: 'air' });

  // Interleave by cycling through domains
  const byDomain = { land: [], sea: [], air: [] };
  for (const e of entries) byDomain[e.domain].push(e);

  const interleaved = [];
  const domains = ['land', 'sea', 'air'].filter(d => byDomain[d].length > 0);
  let domainIdx = 0;
  while (interleaved.length < entries.length) {
    const d = domains[domainIdx % domains.length];
    if (byDomain[d].length > 0) {
      interleaved.push(byDomain[d].shift());
    }
    domainIdx++;
    if (byDomain[d].length === 0) {
      const idx = domains.indexOf(d);
      if (idx !== -1) domains.splice(idx, 1);
      if (domains.length === 0) break;
      domainIdx = domainIdx % domains.length;
    }
  }

  waveState.spawnQueue = interleaved;
}

export function updateWave(waveState, dt, paths, enemies, hpMod, speedMod, spawnRate) {
  if (!waveState.active) return;

  if (!waveState.started) {
    waveState.delayTimer -= dt;
    if (waveState.delayTimer <= 0) {
      waveState.started = true;
      waveState.spawnTimer = 0;
    }
    return;
  }

  if (waveState.spawnQueue.length > 0) {
    waveState.spawnTimer -= dt;
    if (waveState.spawnTimer <= 0) {
      const entry = waveState.spawnQueue.shift();
      const path = paths[entry.domain];
      const enemy = createEnemy(entry.typeKey, path, hpMod, speedMod);
      enemies.push(enemy);
      waveState.spawnTimer = spawnRate;
    }
  }

  if (waveState.spawnQueue.length === 0) {
    const activeEnemies = enemies.filter(e => e.alive && !e.attackingBuilding);
    if (activeEnemies.length === 0) {
      waveState.active = false;
    }
  }
}

export function isWaveComplete(waveState, enemies) {
  if (waveState.active) return false;
  if (waveState.spawnQueue.length > 0) return false;
  return enemies.every(e => !e.alive || e.attackingBuilding);
}
