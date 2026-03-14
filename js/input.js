import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, COSTS, STATES } from './config.js';

function toVirtual(game, event) {
  const rect = game.canvas.getBoundingClientRect();
  const scaleX = VIRTUAL_WIDTH / rect.width;
  const scaleY = VIRTUAL_HEIGHT / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function hitTest(vx, vy, obj, size = 20) {
  return Math.abs(vx - obj.x) < size && Math.abs(vy - obj.y) < size;
}

export function initInput(game, callbacks) {
  game.canvas.addEventListener('click', (e) => {
    if (game.state !== STATES.PLACEMENT) return;

    const { x, y } = toVirtual(game, e);

    for (const tower of game.towers) {
      if (hitTest(x, y, tower, 22)) {
        callbacks.onTowerClick(tower);
        return;
      }
    }

    for (const slot of game.towerSlots) {
      if (!slot.tower && hitTest(x, y, slot, 22)) {
        callbacks.onSlotClick(slot);
        return;
      }
    }

    callbacks.onDeselect();
  });
}
