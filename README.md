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

## Tests

```bash
npm install
npm test
```

Tests are Node-based checks for map paths, belt tile orientation, and sidebar layout (no browser required).

## Project layout

| Path | Purpose |
| --- | --- |
| `src/index.html` | Entry page and canvas |
| `src/js/main.js` | Title, map select, game loop, screen routing |
| `src/js/game.js` | Rounds, waves, economy, win/lose |
| `src/js/data.js` | Maps, towers, enemies, balance constants |
| `src/js/ui.js` | HUD, shop, overlays, input routing |
| `src/js/sprites.js` | Canvas drawing for towers, belt, UI |
| `src/js/audio.js` | Web Audio SFX and BGM |
| `docs/project/` | Design specs, release notes, proposals |

A fuller feature and control reference lives in [docs/project/02-game-spec.md](docs/project/02-game-spec.md).

## Audio

Sound starts **muted** until the player enables it (speaker control or **M**). When enabled, background music continues across the title screen, map select, and gameplay.

## Maps

Four layouts are defined in `MAP_DEFINITIONS` inside `src/js/data.js`: Kaiten Corner, The Fork, The Spiral, and The Crossroads.

## License

See [LICENSE](LICENSE) (ISC).

## Credits

**By Pwner Studios** (in-game attribution).

---

### Push this project to GitHub

If this folder is not yet a Git repository:

```bash
git init
git add .
git commit -m "Initial commit: Nigiri TD"
git branch -M main
git remote add origin https://github.com/DavisWang/nigiri-td.git
git push -u origin main
```

If the remote already has commits (for example a README created on GitHub), use `git pull origin main --rebase` before the first push, or follow GitHub’s merge instructions.
