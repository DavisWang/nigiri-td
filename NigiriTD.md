# Nigiri TD

## Overview

- Nigiri TD is a top down 2d grid based, single player tower defense game inspired by conveyor belt sushi restaurants.  
- Each round, plates of nigiri head for the garbage bin (exit), your goal is to seat animals at the table who can eat the nigiri before they end up in the garbage bin.    
- This game has N number of maps, for each map there is M rounds. Create a single map with scaffolding to add more, for that map, come up with 10 rounds of increasing difficulty.  
- This game lives entirely in a drawn game panel; this means that text is drawn, not rendered in a game.

## Game Mechanics

- **Map**  
  - The map is a grid and seats around the conveyor belt are distinct and take up a 1x1 space. Towers may take up more space depending on the price and animal.  
  - Keep the map to smaller/equal to 8x12.  
- **Enemies**  
  - In this game, the enemies are plates of nigiri that travel on conveyor belts. The more expensive the nigiri, the harder it is to consume (defeat).  
- **Towers**  
  - Towers are different varieties of animals who sit by the conveyor belt and eat the nigiris, this is how they ‘defend’ against the enemy nigiris.  
  -   
- **Life**  
  -  If a nigiri plate reaches the end, you lose life. When life reaches zero, you lose.  
- **Money**  
-   
- Come up with around 10 varieties of towers with 3 upgrades each.  
- Come up with around 20 varieties of nigiris where its HP is ranked by how expensive they are in real life. The more HP, the harder it is to fully eat. The more HP the more the player is penalized when it reaches the end.  
- The game has a single map for now but should be extensible.

## UI/Look and feel

- The game is simple, cutesy, bright and colorful. The game leverages minimal text.  
- The game layout is left/right, left side is the main gameplay area and the right is the sidebar where you can see your health/money towers that you can buy. You can sell towers at a slight loss.

## Screens

- Title screen  
  - New game button  
  - Footer: “By Pwner Studios”  
- Game play screen

## Sprites/Animations

- The most important part to get right is the cutesy sprites for animals and nigiris. This needs to be cute

## Music/FX