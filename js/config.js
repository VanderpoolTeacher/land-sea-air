// All game balance constants in one place.
// Virtual coordinate space: 1200x675

export const VIRTUAL_WIDTH = 1200;
export const VIRTUAL_HEIGHT = 675;

// --- Colors (Board Game palette) ---
export const COLORS = {
  background: '#f5f0e8',
  // Lane backgrounds
  landBg: '#d4c5a0',
  landBorder: '#8b7355',
  seaBg: '#a8d4e6',
  seaBorder: '#4a8ba8',
  airBg: '#d1c4e9',
  airBorder: '#7e57c2',
  // Towers
  cannonFill: '#7cb342',
  cannonBorder: '#5a8a1a',
  torpedoFill: '#2196f3',
  torpedoBorder: '#1565c0',
  missileFill: '#9575cd',
  missileBorder: '#7e57c2',
  // Enemies
  infantryFill: '#c62828',
  infantryBorder: '#8b1a1a',
  patrolBoatFill: '#e65100',
  patrolBoatBorder: '#bf360c',
  droneFill: '#7b1fa2',
  droneBorder: '#4a148c',
  // UI
  healthGreen: '#4caf50',
  healthYellow: '#ffeb3b',
  healthRed: '#f44336',
  slotEmpty: '#8b7355',
  slotLocked: '#bbb',
  textDark: '#3e2723',
  textLight: '#f5f0e8',
  creditGold: '#ffc107',
  hud: '#5d4037',
};

// --- Lane Layout ---
// Each lane is a horizontal strip. Y positions in virtual coords.
export const LANE_HEIGHT = 175;
export const LANE_GAP = 25;
export const LANE_MARGIN_TOP = 60; // Space for HUD bar
export const LANE_MARGIN_LEFT = 20;
export const LANE_WIDTH = VIRTUAL_WIDTH - 40;

export const LANES = {
  air: {
    domain: 'air',
    y: LANE_MARGIN_TOP,
    label: 'AIR',
    bgColor: COLORS.airBg,
    borderColor: COLORS.airBorder,
  },
  land: {
    domain: 'land',
    y: LANE_MARGIN_TOP + LANE_HEIGHT + LANE_GAP,
    label: 'LAND',
    bgColor: COLORS.landBg,
    borderColor: COLORS.landBorder,
  },
  sea: {
    domain: 'sea',
    y: LANE_MARGIN_TOP + (LANE_HEIGHT + LANE_GAP) * 2,
    label: 'SEA',
    bgColor: COLORS.seaBg,
    borderColor: COLORS.seaBorder,
  },
};

// --- Tower Stats ---
export const TOWER_TYPES = {
  cannon: {
    name: 'Cannon',
    letter: 'C',
    domain: 'land',
    damage: 15,
    attackSpeed: 1.2,     // seconds between shots
    range: 150,           // virtual px
    health: 150,
    projectileSpeed: 400, // virtual px/s
    splashRadius: 0,
    splashDamage: 0,
    homing: false,
    fillColor: COLORS.cannonFill,
    borderColor: COLORS.cannonBorder,
  },
  torpedo: {
    name: 'Torpedo',
    letter: 'T',
    domain: 'sea',
    damage: 25,
    attackSpeed: 2.0,
    range: 200,
    health: 150,
    projectileSpeed: 300,
    splashRadius: 40,
    splashDamage: 0.5,    // 50% of main damage
    homing: false,
    fillColor: COLORS.torpedoFill,
    borderColor: COLORS.torpedoBorder,
  },
  missile: {
    name: 'Missile',
    letter: 'M',
    domain: 'air',
    damage: 20,
    attackSpeed: 0.8,
    range: 150,
    health: 150,
    projectileSpeed: 500,
    splashRadius: 0,
    splashDamage: 0,
    homing: true,
    fillColor: COLORS.missileFill,
    borderColor: COLORS.missileBorder,
  },
};

// --- Tower Upgrades ---
// Additive from base stats
export const UPGRADE_DAMAGE_BONUS = [0, 0.3, 0.6];   // Lv1, Lv2, Lv3
export const UPGRADE_RANGE_BONUS = [0, 0.15, 0.30];

// --- Tower Costs ---
export const COSTS = {
  buildTower: 25,
  upgradeLv2: 30,
  upgradeLv3: 50,
  repair: 15,
  unlockSlot: 40,
};

// --- Enemy Stats ---
export const ENEMY_TYPES = {
  infantry: {
    name: 'Infantry',
    domain: 'land',
    health: 40,
    speed: 60,            // virtual px/s
    towerDamage: 5,
    buildingDamage: 10,
    meleeRange: 30,
    attacksPerSecond: 1,
    attacksTowers: true,
    bounty: 5,
    fillColor: COLORS.infantryFill,
    borderColor: COLORS.infantryBorder,
    shape: 'circle',
  },
  patrolBoat: {
    name: 'Patrol Boat',
    domain: 'sea',
    health: 80,
    speed: 35,
    towerDamage: 0,
    buildingDamage: 20,
    meleeRange: 0,
    attacksPerSecond: 1,
    attacksTowers: false,
    bounty: 10,
    fillColor: COLORS.patrolBoatFill,
    borderColor: COLORS.patrolBoatBorder,
    shape: 'triangle',
  },
  drone: {
    name: 'Drone',
    domain: 'air',
    health: 30,
    speed: 100,
    towerDamage: 0,
    buildingDamage: 8,
    meleeRange: 0,
    attacksPerSecond: 1,
    attacksTowers: false,
    bounty: 3,
    fillColor: COLORS.droneFill,
    borderColor: COLORS.droneBorder,
    shape: 'diamond',
  },
};

// --- Wave Data ---
// Each wave: { infantry, patrolBoat, drone, hpMod, spawnRate, speedMod }
export const WAVES = [
  { infantry: 1, patrolBoat: 0, drone: 0, hpMod: 1.0, spawnRate: 2.5, speedMod: 0.7 },
  { infantry: 0, patrolBoat: 5, drone: 0, hpMod: 1.0, spawnRate: 1.5, speedMod: 1.0 },
  { infantry: 0, patrolBoat: 0, drone: 5, hpMod: 1.0, spawnRate: 1.5, speedMod: 1.0 },
  { infantry: 3, patrolBoat: 3, drone: 2, hpMod: 1.0, spawnRate: 1.5, speedMod: 1.0 },
  { infantry: 4, patrolBoat: 3, drone: 5, hpMod: 1.0, spawnRate: 1.0, speedMod: 1.0 },
  { infantry: 2, patrolBoat: 8, drone: 2, hpMod: 1.0, spawnRate: 1.5, speedMod: 1.0 },
  { infantry: 5, patrolBoat: 0, drone: 10, hpMod: 1.0, spawnRate: 1.0, speedMod: 1.0 },
  { infantry: 6, patrolBoat: 5, drone: 7, hpMod: 1.25, spawnRate: 1.5, speedMod: 1.0 },
  { infantry: 7, patrolBoat: 6, drone: 9, hpMod: 1.5, spawnRate: 1.0, speedMod: 1.2 },
  { infantry: 10, patrolBoat: 8, drone: 12, hpMod: 1.75, spawnRate: 1.0, speedMod: 1.2 },
];

// --- Economy ---
export const STARTING_CREDITS = 100;
export const BASE_INCOME_PER_WAVE = 30;
export const BUILDING_INCOME_BONUS = 10; // per surviving building per wave
export const PASSIVE_INCOME_PER_BUILDING = 2; // credits per building per second during waves
export const PASSIVE_INCOME_INTERVAL = 1.0; // seconds between passive income ticks

// --- Resource Buildings ---
export const BUILDING_HP = 100;
export const WALL_HP = 80;

// --- Game States ---
export const STATES = {
  MENU: 'MENU',
  PLACEMENT: 'PLACEMENT',
  WAVE: 'WAVE',
  WAVE_END: 'WAVE_END',
  WIN: 'WIN',
  LOSE: 'LOSE',
};
