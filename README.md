# Nigiri TD

A canvas-based tower defense game: hungry animals defend a sushi counter while nigiri rides a conveyor toward the trash. Built with vanilla JavaScript (ES modules), no framework.

**Repository:** [github.com/DavisWang/nigiri-td](https://github.com/DavisWang/nigiri-td)

## Play locally

The game loads ES modules, so you need a static HTTP server (opening `index.html` as a `file://` URL will not work).

```bash
cd src && python3 -m http.server 3002
```

Then open [http://localhost:3002](http://localhost:3002).

Alternatively, from the repo root:

```bash
npm run serve
```

## Phone and tablet (touch)

The UI is **tap-driven** on iPhone and iPad:

- **Pointer Events** unify mouse and touch; older browsers use a **touch + mouse** fallback on the canvas.
- The canvas uses **`touch-action: none`** and safe-area padding so the page doesn’t steal scroll/zoom from gameplay.
- **Resize / orientation / visual viewport** updates keep the 960×640 logical canvas scaled to the screen.

**Safari:** After choosing **unmute**, sound uses Web Audio (requires a user gesture—your first tap is enough).

Full player-oriented notes: [docs/PLAYING.md](docs/PLAYING.md).

## Tests

```bash
npm install
npm test
```

Tests are Node-based checks for map paths, belt tile orientation, and sidebar layout (no browser required).

## Project layout

| Path | Purpose |
| --- | --- |
| `src/index.html` | Entry page, mobile viewport meta, canvas |
| `src/js/main.js` | Title, how-to, map & difficulty flow, loop |
| `src/js/input.js` | Pointer + touch/mouse input |
| `src/js/game.js` | Rounds, waves, economy, difficulty multipliers |
| `src/js/data.js` | Maps, towers, enemies, `DIFFICULTY_PROFILES` |
| `src/js/ui.js` | HUD, shop, overlays, back button |
| `src/js/sprites.js` | Canvas drawing |
| `src/js/audio.js` | Web Audio SFX and BGM |
| `docs/PLAYING.md` | Controls, difficulty, mobile behavior |
| `docs/project/` | Design specs, proposals, release notes |

Canonical design detail: [docs/project/02-game-spec.md](docs/project/02-game-spec.md) (may predate some UI additions).

## Audio

Sound starts **muted** until the player enables it (speaker or **M**). When enabled, background music can run across title, map select, difficulty, and gameplay.

## Maps & difficulty

Four maps in `MAP_DEFINITIONS` in `src/js/data.js`. Each run picks **Easy**, **Intermediate** (+25% enemy HP), or **Hard** (+25% HP and faster spawns). See [docs/PLAYING.md](docs/PLAYING.md).

## Deploy to GitHub Pages

The playable site lives under **`src/`**. This repo includes a workflow that deploys **`src`** to **GitHub Pages** on every push to `main`:

1. Push to `main`.
2. In the repo on GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. After the workflow succeeds, open the **Pages** URL shown in the workflow summary.

Workflow file: [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml).

Other hosts (Netlify, Vercel, etc.): set the **publish directory** to `src`.

## License

See [LICENSE](LICENSE) (ISC).

## Credits

**By Pwner Studios** (in-game attribution).

---

### Push to GitHub

Remote: `https://github.com/DavisWang/nigiri-td.git`

```bash
git add -A
git status
git commit -m "Describe your changes"
git push -u origin main
```

If the default branch differs or the remote has commits, use `git pull origin main --rebase` before the first push, or merge as GitHub suggests.

If [the repo](https://github.com/DavisWang/nigiri-td) was empty, a normal push after `git remote add origin …` is enough.
