
# William's Gamebox — Starter Project

A kid‑safe, static website for **educational mini‑games**. Built with HTML/CSS/JS, ready for free hosting (Netlify, Vercel, GitHub Pages) and **contextual ads** (e.g., AdSense in child‑directed mode).

## Structure
```
/ (root)
  index.html            # Home page with grid of games
  about.html            # About the site
  privacy.html          # Privacy policy with child-directed notice
  /styles/style.css     # Shared styles
  /scripts/main.js      # Shared JS (footer year, etc.)
  /assets/logo.svg      # Simple SVG logo
  /ads/adsense-placeholder.html  # Where to paste your ad code
  /games/math-match/    # Sample game
      index.html
      game.js
      game.css
```

## Run locally
Just open `index.html` in a browser. For a better dev experience, serve locally:

- **VS Code Live Server** extension, or
- `python3 -m http.server` (then open http://localhost:8000)

## Deploy (free)
- **Netlify**: Drag & drop the folder in the dashboard or connect to GitHub.
- **GitHub Pages**: Push to a repo → Settings → Pages → Source: `main` `/root`.
- **Vercel**: `vercel` → select project → deploy.

## Ads (child‑directed)
- Use **contextual ads only** (no personalized/behavioral targeting).
- In AdSense, ensure your site is designated **child‑directed** and update your **Privacy Policy**.
- Paste your ad snippet into the `<section class="ad">` placeholders or use `ads/adsense-placeholder.html`.
- Place ads away from interactive controls to prevent accidental clicks.

## Add a new game
1. Create a new folder under `/games/your-game/`.
2. Add an `index.html` for the game page plus optional `game.js` and `game.css`.
3. Link the game from the home grid in `index.html`.

## Accessibility & Performance
- High-contrast theme and large hit targets.
- Keyboard shortcuts for the sample game.
- Lightweight, no trackers.

## License
You own your game content. This starter is provided as-is; adapt freely.
