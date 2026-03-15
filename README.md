# Land, Sea, and Air

A web-based tower defense game where you defend a growing city across three combat domains: Land, Sea, and Air.

Built with vanilla HTML5 Canvas + JavaScript. No frameworks, no build step.

## Play

**[Play now](https://vanderpoolteacher.github.io/land-sea-air/)**

## How to Play

1. **Place towers** by clicking empty slots in each lane (1 unlocked per lane, unlock more for 40 credits)
2. **Click "Start Wave"** when ready — enemies spawn from the right and march toward your resource buildings
3. **Towers fire automatically** at enemies in their lane
4. **Survive 10 waves** with at least 1 resource building standing to win

### Towers

| Tower | Lane | Damage | Special |
|-------|------|--------|---------|
| Cannon (C) | Land | 15 | Arcing cannonball |
| Torpedo (T) | Sea | 25 | Splash damage (40px AoE) |
| Missile (M) | Air | 20 | Homing projectiles |

Towers can be upgraded (up to Lv3) and repaired by clicking on them during the placement phase.

### Enemies

| Enemy | Lane | HP | Behavior |
|-------|------|----|----------|
| Infantry | Land | 40 | Stops to attack towers |
| Patrol Boat | Sea | 80 | Bypasses towers, attacks buildings |
| Drone | Air | 30 | Fast, bypasses towers |

### Economy

- Start with 100 credits
- Earn credits from kills and wave income
- Each surviving resource building adds +10 bonus income per wave
- Losing a building permanently reduces your income

## Local Development

ES modules require a local server (won't work via `file://`):

```bash
cd land-sea-air
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Tech Stack

- HTML5 Canvas 2D
- Vanilla JavaScript (ES modules)
- CSS for HUD overlays
- GitHub Pages for hosting

## Credits

Game design by Michael Vanderpool (Game Design Document v0.4).
