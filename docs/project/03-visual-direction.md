# Visual Direction Brief — Nigiri TD

## Header

- Project: Nigiri TD
- Artifact: Visual direction brief
- Status: `ready_for_review`
- Source: Game spec (02-game-spec.md)
- Owner: Visual/Interaction Designer

---

## Style Pillars

1. **Kawaii** — big eyes, rounded shapes, exaggerated proportions (large heads, stubby limbs). Every animal and every nigiri plate should feel like a plush toy or sticker.
2. **Bright and warm** — saturated pastels and warm accents. The palette should feel like a cheerful Japanese café, not a sterile white kitchen.
3. **Minimal chrome** — the UI uses simple shapes and icons over text. When text is necessary, it is large, rounded, and drawn to feel hand-lettered.
4. **Readable at a glance** — state (HP, money, selection, affordability) must be clear from color and shape alone, not dependent on reading small numbers.

---

## Color Palette

### Core Palette

| Role | Color | Hex | Usage |
| --- | --- | --- | --- |
| Background (game area) | Warm cream | `#FFF8E7` | Grid background, default canvas fill |
| Conveyor belt | Warm gray | `#B0A89A` | Belt surface color |
| Belt border | Dark brown | `#6B5B4F` | Belt edge lines, sushi counter feel |
| Grid lines | Soft tan | `#E8DCC8` | Subtle cell boundaries |
| Sidebar background | Soft white | `#FDF6EC` | Tower shop and info panel |
| Sidebar border | Light brown | `#D4C4A8` | Panel edges |
| Text primary | Dark charcoal | `#3A3A3A` | Numbers, labels |
| Text accent | Warm red-brown | `#C0392B` | Life display, warnings |
| Money | Gold | `#F1C40F` | Coin icon, money text |
| Life | Warm red | `#E74C3C` | Heart icons |

### State Colors

| State | Color | Hex |
| --- | --- | --- |
| Valid placement | Soft green | `#A8E6CF` |
| Invalid placement | Soft red | `#FFB3B3` |
| Tower range circle | Blue with 20% opacity | `#5DADE2` at 0.2 alpha |
| Selected tower highlight | Yellow glow | `#F9E547` at 0.4 alpha |
| Grayed-out (can't afford) | Desaturated | 50% saturation of original |
| Slow effect | Ice blue tint | `#AED6F1` |
| Stun effect | Yellow flash | `#F7DC6F` |

### Nigiri Tier Colors (plate rim accent)

| Tier | Color | Hex |
| --- | --- | --- |
| Common | White | `#FFFFFF` |
| Standard | Light blue | `#85C1E9` |
| Premium | Light purple | `#BB8FCE` |
| Deluxe | Gold | `#F4D03F` |
| Luxury | Rose gold | `#E8A0BF` |
| Boss | Red with gold trim | `#E74C3C` + `#F1C40F` |

---

## Character Design Rules

### Animals (Towers)

All animals are drawn in a chibi/kawaii style:
- **Head-to-body ratio**: ~60% head, 40% body. Head is always the largest feature.
- **Eyes**: Large, round, shiny (white highlight dot in the upper-right of each eye). Eyes take up ~30% of the face area.
- **Mouth**: Simple curved line or small open shape. Smiling at idle, wide open when eating.
- **Body**: Round, soft shapes. No sharp edges. Use `arc()` and `quadraticCurveTo()` for all contours.
- **Limbs**: Stubby or implied. Arms/paws are small rounded bumps. Legs are short.
- **Size**: Each animal fits within a ~48×48 pixel area centered in a 64×64 grid cell.
- **Colors**: Each animal has a primary body color and a lighter belly/face accent.

### Animal Color Guide

| Animal | Primary | Accent | Eye Color |
| --- | --- | --- | --- |
| Cat (Neko) | Orange `#F5A623` | Cream `#FFF3E0` | Green `#4CAF50` |
| Tanuki | Brown `#8D6E63` | Tan `#D7CCC8` | Dark brown `#4E342E` |
| Penguin | Dark blue `#1A237E` | White `#FFFFFF` | Black `#212121` |
| Fox (Kitsune) | Orange-red `#E64A19` | White `#FFF8E1` | Amber `#FF8F00` |
| Monkey (Saru) | Warm brown `#A1887F` | Peach `#FFCCBC` | Brown `#5D4037` |
| Owl (Fukurou) | Tawny `#8D6E63` | Cream `#EFEBE9` | Yellow `#FFC107` |
| Octopus (Tako) | Pink `#F48FB1` | Light pink `#FCE4EC` | Black `#212121` |
| Shiba Inu | Gold `#FFB74D` | White `#FFF8E1` | Dark brown `#4E342E` |
| Bear (Kuma) | Dark brown `#5D4037` | Tan `#D7CCC8` | Black `#212121` |
| Dragon (Ryu) | Green `#66BB6A` | Gold belly `#FFF176` | Red `#F44336` |

### Nigiri Plates

- Each nigiri sits on a small oval plate drawn with a colored rim matching its tier.
- The topping (fish, egg, etc.) sits on a white rice base.
- Rice: rounded white rectangle with subtle grain texture (2–3 tiny dots).
- Topping colors should reflect the real ingredient (salmon = orange-pink, tuna = deep red, egg = bright yellow, etc.).
- Plates have a subtle drop shadow (2px offset, 10% black).
- HP bar appears above the plate only when damaged: thin bar with green-to-red gradient based on remaining HP percentage.

### Nigiri Topping Colors

| Nigiri | Topping Color | Hex |
| --- | --- | --- |
| Tamago | Bright yellow | `#FFD54F` |
| Kappa Maki | Green (wrapped) | `#66BB6A` |
| Inari | Golden brown | `#FFB74D` |
| Edamame | Light green | `#AED581` |
| Salmon | Orange-pink | `#FF8A65` |
| Tuna | Deep red | `#EF5350` |
| Shrimp | Pink-orange | `#FFAB91` |
| Squid | Pearl white | `#ECEFF1` |
| Mackerel | Silver-blue | `#90A4AE` |
| Yellowtail | Light pink | `#F8BBD0` |
| Eel | Dark brown with glaze | `#6D4C41` |
| Scallop | Cream | `#FFF9C4` |
| Ikura | Orange-red dots | `#FF7043` |
| Amaebi | Translucent pink | `#F48FB1` |
| Uni | Deep gold | `#FFB300` |
| Tai | Light red | `#EF9A9A` |
| Awabi | Iridescent gray | `#B0BEC5` |
| Chutoro | Marbled pink | `#F48FB1` with white streaks |
| Wagyu | Marbled red | `#EF5350` with white streaks |
| Otoro | Rich marbled pink | `#EC407A` with gold shimmer |

---

## Layout Specification

### Screen Dimensions

- Target canvas: 960×640 pixels (3:2 landscape)
- Game area (left): 640×640 pixels
- Sidebar (right): 320×640 pixels
- Grid cells: 64×64 pixels → 10 columns × 10 rows fit in 640×640 (map uses 8×10 of these, centered with margin)

### Game Area Layout

- Grid is centered in the game area with a small margin.
- Conveyor belt cells are drawn with the belt texture (gray surface, brown borders, subtle motion lines).
- Non-belt, non-buildable cells show the cream background.
- Buildable cells show a very subtle seat indicator (small stool icon at 15% opacity) when no tower is placed.
- Entry and exit cells have distinct sprites (kitchen door, garbage bin).

### Sidebar Layout (top to bottom)

1. **Status bar** (~80px): Life hearts + money display
2. **Round info** (~40px): "Round N/10" + Start Wave button
3. **Wave preview** (~60px): Row of small nigiri icons with counts (shown during prep phase)
4. **Tower shop** (~360px): Scrollable list of tower cards. Each card: icon (32×32), name, cost. 2-column grid layout.
5. **Selected tower info** (~100px, shown when a tower is selected): Name, tier stars, stat summary, Upgrade button (with cost), Sell button (with refund).

### Title Screen Layout

- Full canvas (960×640)
- Game title "Nigiri TD" centered at ~35% from top, large drawn text with slight shadow
- Cute mascot illustration below title (a happy cat sitting at a sushi counter)
- "New Game" button centered at ~65% from top: rounded rectangle, warm red (`#E74C3C`), white text
- "By Pwner Studios" at bottom center, small warm-gray text

---

## Interaction Feedback

### Placement Mode

1. Player clicks a tower in the shop → shop card highlights with a yellow border.
2. Cursor enters game area → valid cells glow green, invalid cells tint red.
3. A ghost preview of the tower follows the cursor, snapping to the grid.
4. Click valid cell → tower appears with a small bounce animation (scale from 0.5 to 1.1 to 1.0 over 200ms).
5. Click invalid cell → brief red flash on the cell, no placement.
6. Escape → exit placement mode, remove highlights.

### Tower Selection

1. Click a placed tower → yellow glow highlight around the tower cell.
2. Range circle fades in (blue, 20% opacity).
3. Sidebar updates to show tower info panel.
4. Click elsewhere or Escape → deselect, remove highlight and range.

### Attack Animation

- **Melee towers** (Cat, Bear, Tanuki, etc.): The animal leans toward the belt and opens its mouth (2-frame animation: lean + bite). A small "chomp" particle appears at the nigiri.
- **Ranged towers** (Monkey, Owl, Fox): A small projectile (ball, arrow, or star shape) travels from tower to target over 150ms. Impact shows a small burst.
- **AoE towers** (Dragon): Fire breath = orange-red cone or circle that flashes briefly at the impact area.
- **Support towers** (Shiba): Periodic pulse ring emanates from the Shiba outward to adjacent cells (subtle, every 2s).

### Damage Feedback

- Floating damage numbers: white text with dark outline, float upward 20px and fade over 600ms.
- HP bar appears when a nigiri first takes damage, stays until the plate is destroyed or exits.
- At ≤25% HP, the nigiri plate visually cracks (subtle line across the plate).

### Economy Feedback

- Money earned: small "+N" in gold floats up from the eaten nigiri position.
- Money spent: brief flash of the money display in the sidebar.
- Can't afford: tower card shakes briefly if clicked when grayed out.

### Life Feedback

- Life lost: the lost hearts flash and shrink away. The remaining hearts briefly pulse red.
- When life ≤ 5: hearts pulse continuously as a warning.

### Round Transitions

- Round start: brief banner "Round N" slides in from the top, holds 1s, slides out.
- Round complete: "Round Complete!" banner + money earned summary floats briefly.
- Game over: screen dims (40% black overlay), "Game Over" text drops in from top with a bounce, stats appear below, "Try Again" button fades in.
- Victory: confetti particles burst from edges, "Victory!" text with gold shimmer, stats appear below, "Back to Title" button fades in.

---

## Typography

All text is canvas-drawn. No DOM elements.

| Element | Font Approach | Size | Weight | Color |
| --- | --- | --- | --- | --- |
| Game title | Rounded, bold, slightly tilted | 48px | Bold | Dark charcoal + 2px warm shadow |
| Button text | Rounded sans-serif | 20px | Bold | White |
| Money/life values | Rounded sans-serif | 18px | Bold | Gold / Red |
| Round counter | Rounded sans-serif | 16px | Regular | Charcoal |
| Tower names (shop) | Rounded sans-serif | 14px | Regular | Charcoal |
| Damage numbers | Rounded sans-serif | 14px | Bold | White with dark outline |
| Footer ("By Pwner Studios") | Simple sans-serif | 12px | Regular | Warm gray |

Use `ctx.font` with a rounded web-safe font like `'Nunito', 'Quicksand', sans-serif` loaded via a `@font-face` declaration, or fall back to `'Segoe UI', 'Arial Rounded MT Bold', sans-serif` for system fonts.

---

## Animation Priorities

### Required for v1

These animations are essential for the cute feel:

1. **Tower idle** — subtle bounce or sway (1–2px vertical oscillation, 1s cycle). Animals should feel alive even when not attacking.
2. **Tower attack** — eating motion (lean + open mouth) or projectile throw. 2–3 frames, ~300ms.
3. **Nigiri movement** — smooth interpolation along the belt path. Plates bob slightly as they move (1px vertical sine wave).
4. **Placement bounce** — tower scales in when placed.
5. **Destruction pop** — nigiri eaten: quick scale-up + particle burst. Nigiri escaped: sad puff.
6. **Floating numbers** — damage and money values float and fade.

### Sprite Requirement

The brief explicitly states cute sprites are "the most important part to get right." All animal and nigiri sprites must be drawn programmatically on the canvas using shape primitives (arcs, curves, fills). **Do not fall back to simple geometric shapes (circles, squares) or line art as a substitute.** Each animal must be visually distinct and recognizably "that animal" with kawaii features. Each nigiri must show its topping clearly.

If a sprite cannot be drawn with sufficient cuteness using canvas primitives alone, this must be flagged — but the response is to invest more effort in the drawing code, not to downgrade to placeholder art.

---

## Readability Priorities

1. **Tower-vs-belt contrast**: Towers must visually pop against the gray belt and cream background. The bright animal colors and the cell highlight ensure this.
2. **Nigiri HP at a glance**: The HP bar color gradient (green → yellow → red) communicates urgency without reading numbers.
3. **Affordability**: Grayed-out tower cards are the primary signal. The money display is secondary confirmation.
4. **Life urgency**: Pulsing hearts below life 5 draw attention without blocking gameplay.
5. **Round state**: The Start Wave button and wave preview make the prep/wave boundary unmistakable.

---

## Non-Goals

- Detailed texture work (wood grain, cloth patterns) — keep surfaces clean.
- Parallax or layered backgrounds — flat is fine for v1.
- Particle systems beyond basic bursts — keep effects lightweight.
- Dark mode or theme variants.

---

## Next Owner

- Game Developer
