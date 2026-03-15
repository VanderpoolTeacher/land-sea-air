import { ENEMY_TYPES } from '../config.js';
import { distance } from '../utils.js';

export function createEnemy(typeKey, path, hpMod, speedMod) {
  const base = ENEMY_TYPES[typeKey];
  const hp = Math.floor(base.health * hpMod);
  return {
    typeKey,
    name: base.name,
    domain: base.domain,
    x: path[0].x,
    y: path[0].y,
    hp,
    maxHp: hp,
    speed: base.speed * speedMod,
    towerDamage: base.towerDamage,
    buildingDamage: base.buildingDamage,
    meleeRange: base.meleeRange,
    attacksPerSecond: base.attacksPerSecond,
    attacksTowers: base.attacksTowers,
    bounty: base.bounty,
    fillColor: base.fillColor,
    borderColor: base.borderColor,
    shape: base.shape,
    path,
    waypointIndex: 0,
    alive: true,
    reachedEnd: false,
    attackingTower: null,
    attackingBuilding: null,
    attackCooldown: 0,
  };
}

export function updateEnemy(enemy, dt, towers, buildings, walls) {
  if (!enemy.alive) return;

  // If attacking a tower, stay and deal damage
  if (enemy.attackingTower) {
    const tower = enemy.attackingTower;
    if (!tower || tower.hp <= 0) {
      enemy.attackingTower = null;
    } else {
      enemy.attackCooldown -= dt;
      if (enemy.attackCooldown <= 0) {
        tower.hp -= enemy.towerDamage;
        enemy.attackCooldown = 1 / enemy.attacksPerSecond;
      }
      return;
    }
  }

  // If attacking a building or wall, stay and deal damage
  if (enemy.attackingBuilding) {
    const bld = enemy.attackingBuilding;
    if (!bld.alive) {
      enemy.attackingBuilding = null;
      // Retarget: try wall first, then building
      const wall = walls && walls.find(w => w.domain === enemy.domain && w.alive);
      if (wall) {
        enemy.attackingBuilding = wall;
        enemy.attackCooldown = 0;
      } else {
        const nextBld = buildings.find(b => b.domain === enemy.domain && b.alive);
        if (nextBld) {
          enemy.attackingBuilding = nextBld;
          enemy.attackCooldown = 0;
        }
      }
      return;
    }
    enemy.attackCooldown -= dt;
    if (enemy.attackCooldown <= 0) {
      bld.hp -= enemy.buildingDamage;
      if (bld.hp <= 0) {
        bld.hp = 0;
        bld.alive = false;
      }
      enemy.attackCooldown = 1 / enemy.attacksPerSecond;
    }
    return;
  }

  // Move toward next waypoint
  if (enemy.waypointIndex >= enemy.path.length) {
    enemy.reachedEnd = true;
    // Attack wall first, then buildings
    const wall = walls && walls.find(w => w.domain === enemy.domain && w.alive);
    if (wall) {
      enemy.attackingBuilding = wall;
      enemy.attackCooldown = 0;
    } else {
      const bld = buildings.find(b => b.domain === enemy.domain && b.alive);
      if (bld) {
        enemy.attackingBuilding = bld;
        enemy.attackCooldown = 0;
      }
    }
    return;
  }

  const target = enemy.path[enemy.waypointIndex];
  const dist = distance(enemy.x, enemy.y, target.x, target.y);
  const moveDistance = enemy.speed * dt;

  if (dist <= moveDistance) {
    enemy.x = target.x;
    enemy.y = target.y;
    enemy.waypointIndex++;
  } else {
    const ratio = moveDistance / dist;
    enemy.x += (target.x - enemy.x) * ratio;
    enemy.y += (target.y - enemy.y) * ratio;
  }

  // Check if Infantry should attack a tower
  if (enemy.attacksTowers) {
    for (const tower of towers) {
      if (tower.domain === enemy.domain && tower.hp > 0) {
        const d = distance(enemy.x, enemy.y, tower.x, tower.y);
        if (d <= enemy.meleeRange + 20) {
          enemy.attackingTower = tower;
          enemy.attackCooldown = 0;
          break;
        }
      }
    }
  }
}
