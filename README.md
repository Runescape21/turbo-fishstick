# turbo-fishstick

Turbo Fishstick is a small arcade video game built to run easily in environments like cs50.dev.

## Game

You are a fish swimming through a dangerous current.

- Move with `WASD` or arrow keys
- Hold `Shift` for a short dash boost
- Collect `+` bubbles for points and oxygen
- Avoid hooks and jellyfish
- Survive as long as possible and beat your high score

## Run on cs50.dev

1. Open the terminal in your project folder.
2. Start a local web server:

```bash
python3 -m http.server 8080
```

3. Open the forwarded URL for port `8080` in your browser.

## Files

- `index.html` - game page and HUD
- `styles.css` - visual theme and animations
- `game.js` - game loop, controls, spawning, collisions, scoring
