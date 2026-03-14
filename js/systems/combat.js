import { distance, normalize } from '../utils.js';

export function createProjectile(tower, target) {
  return {
    x: tower.x,
    y: tower.y,
    targetId: target,
    speed: tower.projectileSpeed,
    damage: tower.damage,
    splashRadius: tower.splashRadius,
    splashDamage: tower.splashDamage,
    homing: tower.homing,
    color: tower.fillColor,
    dx: 0,
    dy: 0,
    trail: [{ x: tower.x, y: tower.y }],
    alive: true,
    startX: tower.x,
    startY: tower.y,
    targetX: target.x,
    targetY: target.y,
    progress: 0,
    isArc: tower.typeKey === 'cannon',
  };
}

export function updateCombat(dt, towers, enemies, projectiles, particles) {
  // Tower targeting and firing
  for (const tower of towers) {
    if (tower.hp <= 0) continue;

    tower.cooldown -= dt;
    if (tower.cooldown > 0) continue;

    let nearest = null;
    let nearestDist = Infinity;
    for (const enemy of enemies) {
      if (!enemy.alive || enemy.domain !== tower.domain) continue;
      const d = distance(tower.x, tower.y, enemy.x, enemy.y);
      if (d <= tower.range && d < nearestDist) {
        nearest = enemy;
        nearestDist = d;
      }
    }

    if (nearest) {
      const proj = createProjectile(tower, nearest);
      if (!proj.homing) {
        const n = normalize(nearest.x - tower.x, nearest.y - tower.y);
        proj.dx = n.x;
        proj.dy = n.y;
      }
      projectiles.push(proj);
      tower.cooldown = tower.attackSpeed;
    }
  }

  // Update projectiles
  for (const proj of projectiles) {
    if (!proj.alive) continue;

    if (proj.isArc) {
      const totalDist = distance(proj.startX, proj.startY, proj.targetX, proj.targetY);
      proj.progress += (proj.speed * dt) / totalDist;
      if (proj.progress >= 1) {
        proj.x = proj.targetX;
        proj.y = proj.targetY;
        applyDamage(proj, enemies, particles);
        proj.alive = false;
      } else {
        proj.x = proj.startX + (proj.targetX - proj.startX) * proj.progress;
        proj.y = proj.startY + (proj.targetY - proj.startY) * proj.progress;
        proj.y -= Math.sin(proj.progress * Math.PI) * 30;
      }
    } else if (proj.homing && proj.targetId && proj.targetId.alive) {
      const n = normalize(proj.targetId.x - proj.x, proj.targetId.y - proj.y);
      proj.x += n.x * proj.speed * dt;
      proj.y += n.y * proj.speed * dt;

      const d = distance(proj.x, proj.y, proj.targetId.x, proj.targetId.y);
      if (d < 10) {
        applyDamage(proj, enemies, particles);
        proj.alive = false;
      }
    } else {
      proj.x += proj.dx * proj.speed * dt;
      proj.y += proj.dy * proj.speed * dt;

      for (const enemy of enemies) {
        if (!enemy.alive || enemy.domain !== (proj.targetId && proj.targetId.domain)) continue;
        if (distance(proj.x, proj.y, enemy.x, enemy.y) < 16) {
          applyDamage(proj, enemies, particles);
          proj.alive = false;
          break;
        }
      }

      if (proj.x < -50 || proj.x > 1250 || proj.y < -50 || proj.y > 725) {
        proj.alive = false;
      }
    }

    proj.trail.push({ x: proj.x, y: proj.y });
    if (proj.trail.length > 8) proj.trail.shift();
  }

  // Remove dead projectiles
  for (let i = projectiles.length - 1; i >= 0; i--) {
    if (!projectiles[i].alive) projectiles.splice(i, 1);
  }
}

function applyDamage(proj, enemies, particles) {
  let hitEnemy = null;
  let hitDist = Infinity;
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    const d = distance(proj.x, proj.y, enemy.x, enemy.y);
    if (d < 20 && d < hitDist) {
      hitEnemy = enemy;
      hitDist = d;
    }
  }

  if (hitEnemy) {
    hitEnemy.hp -= proj.damage;
    if (hitEnemy.hp <= 0) {
      hitEnemy.alive = false;
      spawnDeathParticles(hitEnemy, particles);
    }
  }

  if (proj.splashRadius > 0) {
    const splashDmg = Math.floor(proj.damage * proj.splashDamage);
    for (const enemy of enemies) {
      if (!enemy.alive || enemy === hitEnemy) continue;
      if (distance(proj.x, proj.y, enemy.x, enemy.y) <= proj.splashRadius) {
        enemy.hp -= splashDmg;
        if (enemy.hp <= 0) {
          enemy.alive = false;
          spawnDeathParticles(enemy, particles);
        }
      }
    }
  }
}

function spawnDeathParticles(enemy, particles) {
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 * i) / 6;
    particles.push({
      x: enemy.x,
      y: enemy.y,
      vx: Math.cos(angle) * 50,
      vy: Math.sin(angle) * 50,
      radius: 4 + Math.random() * 3,
      color: enemy.fillColor,
      alpha: 1,
      life: 0.4,
    });
  }
}

export function updateParticles(dt, particles) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    p.alpha = Math.max(0, p.life / 0.4);
    if (p.life <= 0) particles.splice(i, 1);
  }
}
