# Turbo Fishstick - AI Agent Guide

## Project Overview

**Turbo Fishstick** is a vanilla JavaScript arcade game built for educational environments like cs50.dev. See [README.md](README.md) for user-facing information.

## Architecture

### Single-Page Game Loop Structure

The game uses a classic frame-based update/render pattern:

1. **Input Handling** (`keys` global object)
   - Keyboard listeners track WASD/arrows and Shift
   - State persisted in global object for frame-based polling

2. **Game State** (module-level variables)
   - `player` - fish entity with position, radius, speed, dashEnergy
   - `hazards` - array of hooks and jellies (spawn left, move right with wobble)
   - `bubbles` - collectibles for points/oxygen
   - `score`, `oxygen`, `difficulty` - tracked per frame
   - `running` - game active flag

3. **Main Loop** (requestAnimationFrame)
   - `update(dt)` - physics, collision, scoring, spawning
   - `draw()` - canvas rendering

4. **Persistence**
   - High score stored in localStorage via `STORAGE_KEY`

### Canvas and DOM

- **Canvas**: 960×540, direct 2D context rendering
- **HUD**: Score, high score, oxygen % — updated via DOM elements
- **Overlay**: Start screen and game-over modal (shown/hidden by `overlay` div)

### Game Mechanics

- **Player Movement**: Cardinal directions, 1.8× speed multiplier when dashing
- **Dash System**: Energy depletes at 55 units/sec when active, recharges at 25 units/sec
- **Collision Detection**: Simple `distance()` function using radii; contact reduces oxygen
- **Spawning**: Hazards spawn from right edge at increasing difficulty; bubbles spawn separately
- **Difficulty Scaling**: Increases continuously; affects hazard spawn rate and speed

## Key Constants & Tuning

Located at module level in `game.js`:

- `WIDTH`, `HEIGHT` - canvas dimensions (960, 540)
- Player `speed: 240`, `dashEnergy: 100`
- Hazard speed: `randomBetween(140, 250) + difficulty * 20`
- Score gain: `8.5 * dt * difficulty` per frame
- Oxygen drain: `-4.2 * dt` per frame
- Difficulty scaling: `+0.035 per dt`

Entity `radius` values are randomized within ranges (see `spawnHazard`, `spawnBubble`).

## File Structure

- **game.js** - Game logic, update loop, entity management, rendering
- **index.html** - Page structure, canvas element, HUD elements, start/end screen markup
- **styles.css** - Themed styling (color palette, animations, responsive layout)

## Development

### Run Locally
```bash
python3 -m http.server 8080
```
Then open the forwarded URL for port 8080 in a browser.

### Extending the Game

Common tasks:

- **Add new hazard type**: Add case in `spawnHazard()` type logic, add rendering in `draw()`
- **Adjust difficulty curve**: Modify `difficulty += 0.035 * dt` or hazard spawn conditions
- **New collectible**: Similar pattern to `bubbles` (spawn, collision check, effect)
- **Visual tweaks**: Edit CSS variables (`--accent`, `--danger`, etc.) or canvas draw calls

## Conventions

- Entities are plain objects with `{ x, y, radius, ... }` properties
- Time deltas (`dt`) are in seconds
- Canvas rendering uses direct context calls (no libraries)
- Game state is imperative and frame-based, not event-driven
