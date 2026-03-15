import {
  VIRTUAL_WIDTH, VIRTUAL_HEIGHT, COLORS,
  LANES, LANE_HEIGHT, LANE_MARGIN_LEFT, LANE_WIDTH,
  UPGRADE_DAMAGE_BONUS,
} from './config.js';

// --- Helper: Rounded rect ---
function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// --- Draw entire frame ---
export function renderFrame(ctx, game) {
  // Background
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

  // Draw lanes
  for (const lane of Object.values(LANES)) {
    drawLane(ctx, lane);
  }

  // Draw paths
  for (const domain of ['land', 'sea', 'air']) {
    if (game.paths[domain]) {
      drawPath(ctx, game.paths[domain], LANES[domain]);
    }
  }

  // Draw walls (in front of buildings)
  if (game.walls) {
    for (const wall of game.walls) {
      drawWall(ctx, wall);
    }
  }

  // Draw resource buildings
  for (const bld of game.buildings) {
    drawBuilding(ctx, bld);
  }

  // Draw tower slots
  for (const slot of game.towerSlots) {
    drawSlot(ctx, slot, game.selectedSlot === slot);
  }

  // Draw towers
  for (const tower of game.towers) {
    drawTower(ctx, tower);
  }

  // Draw enemies
  for (const enemy of game.enemies) {
    if (enemy.alive) drawEnemy(ctx, enemy);
  }

  // Draw projectiles
  for (const proj of game.projectiles) {
    drawProjectile(ctx, proj);
  }

  // Draw particles
  for (const p of game.particles) {
    drawParticle(ctx, p);
  }

  // Lane damage overlay for destroyed buildings
  if (game.state === 'WAVE' || game.state === 'PLACEMENT' || game.state === 'WAVE_END') {
    for (const [key, lane] of Object.entries(LANES)) {
      const bld = game.buildings.find(b => b.domain === key);
      if (bld && !bld.alive) {
        ctx.fillStyle = COLORS.healthRed;
        ctx.globalAlpha = 0.15;
        roundedRect(ctx, LANE_MARGIN_LEFT, lane.y, LANE_WIDTH, LANE_HEIGHT, 10);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    }
  }
}

// --- Lane background ---
function drawLane(ctx, lane) {
  roundedRect(ctx, LANE_MARGIN_LEFT, lane.y, LANE_WIDTH, LANE_HEIGHT, 10);
  ctx.fillStyle = lane.bgColor;
  ctx.fill();
  ctx.strokeStyle = lane.borderColor;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Lane label
  ctx.fillStyle = lane.borderColor;
  ctx.font = 'bold 14px Georgia';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(lane.label, LANE_MARGIN_LEFT + 10, lane.y + 8);
}

// --- Path dots (board game trail) ---
function drawPath(ctx, waypoints, lane) {
  ctx.strokeStyle = lane.borderColor;
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 8]);
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(waypoints[0].x, waypoints[0].y);
  for (let i = 1; i < waypoints.length; i++) {
    ctx.lineTo(waypoints[i].x, waypoints[i].y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1.0;

  // Draw small dots at each waypoint
  for (const wp of waypoints) {
    ctx.beginPath();
    ctx.arc(wp.x, wp.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = lane.borderColor;
    ctx.globalAlpha = 0.3;
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }
}

// --- Resource building ---
function drawBuilding(ctx, bld) {
  const size = 36;
  if (bld.alive) {
    // House shape
    roundedRect(ctx, bld.x - size / 2, bld.y - size / 2, size, size, 6);
    ctx.fillStyle = '#d4a574';
    ctx.fill();
    ctx.strokeStyle = '#8b6914';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Roof triangle
    ctx.beginPath();
    ctx.moveTo(bld.x - size / 2 - 4, bld.y - size / 2);
    ctx.lineTo(bld.x, bld.y - size / 2 - 16);
    ctx.lineTo(bld.x + size / 2 + 4, bld.y - size / 2);
    ctx.closePath();
    ctx.fillStyle = '#8b4513';
    ctx.fill();

    // HP bar
    drawHealthBar(ctx, bld.x - size / 2, bld.y + size / 2 + 4, size, 4, bld.hp, bld.maxHp);
  } else {
    // Rubble
    ctx.fillStyle = '#999';
    ctx.globalAlpha = 0.5;
    roundedRect(ctx, bld.x - size / 2, bld.y - size / 4, size, size / 2, 4);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }
}

// --- Wall (protective barrier) ---
function drawWall(ctx, wall) {
  const w = 12;
  const h = 50;
  if (wall.alive) {
    // Brick wall rectangle
    roundedRect(ctx, wall.x - w / 2, wall.y - h / 2, w, h, 3);
    ctx.fillStyle = '#a0522d';
    ctx.fill();
    ctx.strokeStyle = '#6b3410';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Brick lines
    ctx.strokeStyle = '#6b3410';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    for (let i = 1; i < 4; i++) {
      const ly = wall.y - h / 2 + i * (h / 4);
      ctx.beginPath();
      ctx.moveTo(wall.x - w / 2, ly);
      ctx.lineTo(wall.x + w / 2, ly);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // HP bar
    drawHealthBar(ctx, wall.x - w, wall.y + h / 2 + 4, w * 2, 4, wall.hp, wall.maxHp);
  } else {
    // Rubble
    ctx.fillStyle = '#8b5e3c';
    ctx.globalAlpha = 0.3;
    roundedRect(ctx, wall.x - w / 2, wall.y - 4, w, 8, 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }
}

// --- Tower slot ---
function drawSlot(ctx, slot, isSelected) {
  const size = 40;
  if (slot.tower) return; // Tower draws itself

  roundedRect(ctx, slot.x - size / 2, slot.y - size / 2, size, size, 8);

  if (slot.locked) {
    ctx.strokeStyle = COLORS.slotLocked;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    // Lock icon (simple)
    ctx.fillStyle = COLORS.slotLocked;
    ctx.font = '16px Georgia';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u{1F512}', slot.x, slot.y);
  } else {
    ctx.strokeStyle = isSelected ? COLORS.creditGold : COLORS.slotEmpty;
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    // Plus sign
    ctx.fillStyle = COLORS.slotEmpty;
    ctx.font = 'bold 20px Georgia';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', slot.x, slot.y);
  }
}

// --- Tower ---
function drawTower(ctx, tower) {
  const size = 40;
  roundedRect(ctx, tower.x - size / 2, tower.y - size / 2, size, size, 8);
  ctx.fillStyle = tower.fillColor;
  ctx.fill();
  ctx.strokeStyle = tower.borderColor;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Letter
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px Georgia';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(tower.letter, tower.x, tower.y);

  // Level indicator (small dots)
  for (let i = 0; i < tower.level; i++) {
    ctx.beginPath();
    ctx.arc(tower.x - 10 + i * 10, tower.y + size / 2 + 8, 3, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.creditGold;
    ctx.fill();
  }

  // HP bar
  drawHealthBar(ctx, tower.x - size / 2, tower.y - size / 2 - 8, size, 4, tower.hp, tower.maxHp);

  // Range circle (only when selected)
  if (tower.selected) {
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
    ctx.strokeStyle = tower.fillColor;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  }
}

// --- Enemy ---
function drawEnemy(ctx, enemy) {
  const size = 14;
  ctx.fillStyle = enemy.fillColor;
  ctx.strokeStyle = enemy.borderColor;
  ctx.lineWidth = 2;

  if (enemy.shape === 'circle') {
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (enemy.shape === 'triangle') {
    ctx.beginPath();
    ctx.moveTo(enemy.x + size, enemy.y);
    ctx.lineTo(enemy.x - size, enemy.y - size);
    ctx.lineTo(enemy.x - size, enemy.y + size);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (enemy.shape === 'diamond') {
    ctx.beginPath();
    ctx.moveTo(enemy.x, enemy.y - size);
    ctx.lineTo(enemy.x + size, enemy.y);
    ctx.lineTo(enemy.x, enemy.y + size);
    ctx.lineTo(enemy.x - size, enemy.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // HP bar
  drawHealthBar(ctx, enemy.x - size, enemy.y - size - 8, size * 2, 3, enemy.hp, enemy.maxHp);
}

// --- Projectile ---
function drawProjectile(ctx, proj) {
  ctx.beginPath();
  ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
  ctx.fillStyle = proj.color || '#333';
  ctx.fill();

  // Trail
  if (proj.trail && proj.trail.length > 1) {
    ctx.beginPath();
    ctx.moveTo(proj.trail[0].x, proj.trail[0].y);
    for (let i = 1; i < proj.trail.length; i++) {
      ctx.lineTo(proj.trail[i].x, proj.trail[i].y);
    }
    ctx.strokeStyle = proj.color || '#333';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.4;
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  }
}

// --- Particle (death pop) ---
function drawParticle(ctx, p) {
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
  ctx.fillStyle = p.color;
  ctx.globalAlpha = p.alpha;
  ctx.fill();
  ctx.globalAlpha = 1.0;
}

// --- Health bar ---
function drawHealthBar(ctx, x, y, width, height, current, max) {
  if (current >= max) return; // Don't show full HP bars
  const pct = current / max;
  const color = pct > 0.6 ? COLORS.healthGreen : pct > 0.3 ? COLORS.healthYellow : COLORS.healthRed;

  // Background
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  roundedRect(ctx, x, y, width, height, 2);
  ctx.fill();

  // Fill
  ctx.fillStyle = color;
  roundedRect(ctx, x, y, width * pct, height, 2);
  ctx.fill();
}
