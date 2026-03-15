import {
  LANES, LANE_HEIGHT, LANE_MARGIN_LEFT, LANE_WIDTH,
  BUILDING_HP, WALL_HP,
} from './config.js';

// Path waypoints per lane (virtual coords).
// Enemies spawn at the rightmost point, march left toward the resource building.
// Each path has gentle bends for visual interest.
function buildPath(laneY) {
  const midY = laneY + LANE_HEIGHT / 2;
  const startX = LANE_MARGIN_LEFT + LANE_WIDTH - 30; // right edge (spawn)
  const endX = LANE_MARGIN_LEFT + 70;                // left edge (resource building)
  return [
    { x: startX, y: midY },
    { x: startX - 180, y: midY - 30 },
    { x: startX - 400, y: midY + 25 },
    { x: startX - 600, y: midY - 20 },
    { x: startX - 800, y: midY + 15 },
    { x: endX, y: midY },
  ];
}

// Tower slot positions per lane — 3 slots each, adjacent to path
function buildSlots(laneY, domain) {
  const midY = laneY + LANE_HEIGHT / 2;
  const startX = LANE_MARGIN_LEFT + LANE_WIDTH - 30;
  return [
    // Slot 0: leftmost (nearest building) — unlocked by default
    { domain, x: startX - 700, y: midY - 55, locked: false, tower: null },
    // Slot 1: middle — locked
    { domain, x: startX - 450, y: midY - 55, locked: true, tower: null },
    // Slot 2: rightmost (nearest spawn) — locked
    { domain, x: startX - 200, y: midY - 55, locked: true, tower: null },
  ];
}

// Resource building position (left end of lane)
function buildBuilding(laneY, domain) {
  const midY = laneY + LANE_HEIGHT / 2;
  return {
    domain,
    x: LANE_MARGIN_LEFT + 40,
    y: midY,
    hp: BUILDING_HP,
    maxHp: BUILDING_HP,
    alive: true,
  };
}

// Wall position (just to the right of the building, on the path)
function buildWall(laneY, domain) {
  const midY = laneY + LANE_HEIGHT / 2;
  return {
    domain,
    x: LANE_MARGIN_LEFT + 90,
    y: midY,
    hp: WALL_HP,
    maxHp: WALL_HP,
    alive: true,
  };
}

export function createMap() {
  const paths = {
    land: buildPath(LANES.land.y),
    sea: buildPath(LANES.sea.y),
    air: buildPath(LANES.air.y),
  };

  const towerSlots = [
    ...buildSlots(LANES.land.y, 'land'),
    ...buildSlots(LANES.sea.y, 'sea'),
    ...buildSlots(LANES.air.y, 'air'),
  ];

  const buildings = [
    buildBuilding(LANES.land.y, 'land'),
    // Extra resource building behind the land base
    { domain: 'land', x: LANE_MARGIN_LEFT + 40, y: LANES.land.y + LANE_HEIGHT - 30, hp: BUILDING_HP, maxHp: BUILDING_HP, alive: true },
    buildBuilding(LANES.sea.y, 'sea'),
    buildBuilding(LANES.air.y, 'air'),
  ];

  const walls = [
    buildWall(LANES.land.y, 'land'),
    buildWall(LANES.sea.y, 'sea'),
    buildWall(LANES.air.y, 'air'),
  ];

  return { paths, towerSlots, buildings, walls };
}
