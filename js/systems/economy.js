import { BASE_INCOME_PER_WAVE, BUILDING_INCOME_BONUS } from '../config.js';

export function calculateWaveIncome(buildings) {
  const alive = buildings.filter(b => b.alive).length;
  return BASE_INCOME_PER_WAVE + alive * BUILDING_INCOME_BONUS;
}
