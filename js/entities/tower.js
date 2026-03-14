import { TOWER_TYPES, UPGRADE_DAMAGE_BONUS, UPGRADE_RANGE_BONUS } from '../config.js';

export function createTower(typeKey, slot) {
  const base = TOWER_TYPES[typeKey];
  return {
    typeKey,
    name: base.name,
    letter: base.letter,
    domain: base.domain,
    x: slot.x,
    y: slot.y,
    baseDamage: base.damage,
    baseRange: base.range,
    damage: base.damage,
    range: base.range,
    attackSpeed: base.attackSpeed,
    cooldown: 0,
    health: base.health,
    maxHp: base.health,
    hp: base.health,
    projectileSpeed: base.projectileSpeed,
    splashRadius: base.splashRadius,
    splashDamage: base.splashDamage,
    homing: base.homing,
    fillColor: base.fillColor,
    borderColor: base.borderColor,
    level: 1,
    target: null,
    selected: false,
    slot,
  };
}

export function upgradeTower(tower) {
  if (tower.level >= 3) return false;
  tower.level++;
  const dmgBonus = UPGRADE_DAMAGE_BONUS[tower.level - 1];
  const rngBonus = UPGRADE_RANGE_BONUS[tower.level - 1];
  tower.damage = Math.floor(tower.baseDamage * (1 + dmgBonus));
  tower.range = Math.floor(tower.baseRange * (1 + rngBonus));
  return true;
}

export function repairTower(tower) {
  tower.hp = tower.maxHp;
}

export function getUpgradeCost(tower) {
  if (tower.level === 1) return 30;
  if (tower.level === 2) return 50;
  return Infinity;
}
