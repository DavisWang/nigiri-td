# Mock Player Memo — Sprite v2

## Header

- Reviewer: Mock Player
- Build reviewed: Sprite v2 (face-only towers + larger nigiri)
- Date: 2026-04-01

## First-Session Verdict

- Would I keep playing for another five minutes? **Yes.**
- Why: The face-only tower sprites are a clear upgrade. The animals now read as actual characters instead of tiny colored blobs. The Cat's whiskers, the Penguin's beak, the Fox's tall ears — these actually register at game resolution now. I can tell what animal I'm buying without squinting. The nigiri plates on the belt are also much easier to track. The game was already playable; this change makes it look like a finished game instead of a prototype.

## What Feels Good

- **Tower shop browsing**: At 36px, each face-only icon is immediately identifiable. I no longer need to rely on the text label to know which tower I'm picking. The Cat's ears, the Tanuki's dark eye mask, the Penguin's blue-white contrast — they're all distinct.
- **Placing towers feels more satisfying**: The face filling most of the cell gives a sense of "claiming territory." In v1, the tiny full-body sprites looked lost in their cells.
- **Title screen**: The three face-only towers above the conveyor belt look like stickers on a café menu. This sets the kawaii tone immediately.
- **Enemy visibility**: The larger nigiri plates are much easier to track on the belt. The yellow Tamago topping is clearly visible from the first frame.

## What Feels Bad Or Unfair

- **Nothing gameplay-breaking** from the sprite change. This is a pure visual improvement with no balance impact.
- **Monkey and Tanuki** look similar at small sizes (both brownish circles). At 36px in the shop, the distinction relies on the Tanuki's eye mask patches vs the Monkey's side ears. It works, but they're the closest pair. This is pre-existing — the v1 had the same similarity problem, just less noticeable because everything was too small to compare.
- **Octopus tentacles** at grid size are subtle. The dome shape + pink color + magenta top knob distinguish it, but the tentacle fringe is more decorative than functional as an identifier. The octopus reads as "pink blob with a dot on top" rather than "that's clearly an octopus." At 36px in the shop, the tentacles are invisible.

## Control And Responsiveness

- Unchanged from v1. Placement is responsive, tower selection is instant, keyboard shortcuts work. The sprite change is purely visual and does not affect control feel.
- The larger sprites make the placement preview ghost more useful — I can actually see which animal I'm about to place, not just a vague colored shape.

## Challenge And Balance

- Unchanged. Tower stats, enemy stats, economy, and round compositions are identical. The face-only design does not affect gameplay balance.

## Quick Wins

- **Add a small outline/shadow to the octopus** to make the tentacle fringe read better against the belt/cell background. Even a 1px darker pink stroke around the base would help.
- **Differentiate Monkey and Tanuki further**: The Monkey could have a slightly more peach/warm tone to its face area, or the Tanuki's eye mask patches could be made slightly more prominent.

## Bigger Bets

- **Tier-specific face changes**: When a tower upgrades, subtle visual changes to the face (a crown for tier 3, a sparkle in the eye, a slightly different expression) would make upgrades feel more rewarding. Currently the face is identical across all 3 tiers.
- **Attack animations that lean**: When a melee tower attacks, having the face lean slightly toward the target (a quick 5px translate) would add life. Face-only designs could even have the mouth open wider for higher-tier attacks.

## Producer Recommendation

- `safe to approve` — The sprite v2 is a clear visual quality improvement with no gameplay regressions. The face-only design solves the core problem (details lost at small sprite size) effectively. Minor polish opportunities exist (octopus readability, monkey/tanuki differentiation) but none are blocking.

## Next Owner

- Producer
