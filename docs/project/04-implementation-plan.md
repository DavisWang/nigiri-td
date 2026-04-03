# Implementation Plan Addendum — Audio (NTD-002)

## Header

- Project: Nigiri TD
- Artifact: Implementation plan (audio addendum)
- Status: `ready_for_review`
- Source: Work order NTD-002
- Owner: Game Developer

## Touched Subsystem Map

| Module | Change Type | What Changes |
| --- | --- | --- |
| `src/js/audio.js` | **NEW** | AudioManager class — procedural SFX + BGM via Web Audio API |
| `src/js/main.js` | Edit | Init AudioManager, pass to GameState, handle toggle click, start/stop BGM on screen transitions |
| `src/js/game.js` | Edit | Add `audio` reference; fire SFX triggers for place, sell, upgrade, wave start, enemy kill, enemy escape, round complete, game over, victory |
| `src/js/entities.js` | Edit | Accept audio ref in Tower.update; fire chomp/throw/fire/multi SFX on attack |
| `src/js/ui.js` | Edit | Render toggle button, handle toggle click in handleGameClick, export toggle hit area |
| `src/js/sprites.js` | Edit | Add drawSpeakerIcon function |

**Untouched:** `data.js`, `effects.js`, `input.js`, `index.html`

## Audio Module Architecture

```
AudioManager
├── AudioContext (created on first user gesture)
├── masterGain → destination
├── sfxGain → masterGain
├── bgmGain → masterGain
├── muted (boolean, localStorage-backed)
├── bgmPlaying (boolean)
├── SFX methods (each creates short-lived oscillator chains)
│   ├── playClick()
│   ├── playError()
│   ├── playPlace()
│   ├── playSell()
│   ├── playUpgrade()
│   ├── playChomp()
│   ├── playThrow()
│   ├── playFire()
│   ├── playMulti()
│   ├── playPop()
│   ├── playWaste()
│   ├── playWaveStart()
│   ├── playRoundComplete()
│   ├── playGameOver()
│   └── playVictory()
├── BGM methods
│   ├── startBGM()
│   ├── stopBGM()
│   └── _scheduleBGMLoop()
└── toggle()
```

## Delivery Sequence

1. Write `audio.js` with all SFX and BGM generation
2. Add speaker icon to `sprites.js`
3. Wire toggle button rendering and click handling in `ui.js`
4. Wire AudioManager init and toggle in `main.js`
5. Wire game-event SFX triggers in `game.js`
6. Wire combat SFX triggers in `entities.js`
7. Verify locally, capture screenshots

## Compatibility Assumptions

- AudioContext created lazily on first click (Chrome auto-play policy)
- All SFX methods are no-ops before AudioContext exists or when muted
- Rate-limiting on combat SFX: max 1 per sound-type per 80ms
- BGM uses scheduled oscillators for gapless looping
- localStorage key: `nigiri-td-audio-muted`

## Next Owner

- Game Developer (self — proceed to build)
