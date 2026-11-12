# Credits

灰誓騎士 The Ashen Vow is an original game. Its story, characters, maps, dialogue, battle system and code were written for it.
It is a role-playing game in the spirit of 8-bit and 16-bit classics, but it uses none of their names, characters, story, art or music.

All art and music come from free, openly licensed packs on OpenGameArt.org. Thank you to every artist below.

## People
- **Ctske (Ctskelgysth Inauaruat)**, "Tricolor NES RPG Character Sprite Sheets", CC-BY 4.0 / OGA-BY 3.0.
  https://opengameart.org/content/tricolor-nes-rpg-character-sprite-sheets
- **Erbarlow**, "NES-Style RPG Characters" and "More NES-style RPG Characters", CC-BY-SA 3.0.
  - https://opengameart.org/content/nes-style-rpg-characters
  - https://opengameart.org/content/more-nes-style-rpg-characters
- **devurandom**, "16x16 8-bit RPG character set", CC0.
  https://opengameart.org/content/16x16-8-bit-rpg-character-set

The sheets were scaled back to their original 16x16 size and packed into `assets/chars.png`. Some characters were recoloured for this game: Hale's ash-grey and dawn-gold armour, the Ashguard and Morvane.
Because Erbarlow's sprites are CC-BY-SA, `assets/chars.png` is shared under CC-BY-SA 3.0 as well.

## Monsters
- **Ctske (Ctskelgysth Inauaruat)**, "Tricolor NES Static Monster Graphics", CC-BY 4.0 / OGA-BY 3.0.
  https://opengameart.org/content/tricolor-nes-static-monster-graphics
- **Emerald (Heather Harvey)**, "Loyalty Lies Monsters", CC-BY 3.0, in the NES colours of **ImogiaGames**' "Monsters Pack - NES palette recolor", CC-BY 4.0.
  https://opengameart.org/content/monsters-pack-nes-palette-recolor

Some monsters are recoloured in the game (a different hue for a stronger cousin). People who fight you are their own walking sprites, drawn larger.

### Added for Part II
Each sheet below was cut into four-frame strips (`assets/mon/r_*.png`, `i_*.png`, `s_*.png`, `s2_*.png`) and some are recoloured in the game.
- **Redshrike (Stephen Challener)**, RPG enemies, in **devurandom**'s "Redshrike's RPG enemies, NES version", CC-BY-SA 3.0 (also GPL 3.0).
  https://opengameart.org/content/redshrikes-rpg-enemies-nes-version
  Changes: each enemy cut out of the sheet, the black background and the palette-note blocks removed, a black outline added (`assets/mon/r_*.png`). These files are shared under CC-BY-SA 3.0.
- **ImogiaGames**, "30 SciFi Creatures Nes style", CC-BY 4.0 / OGA-BY 3.0, a derivative of Redshrike's "Scifi Creature Tileset" (credit to the original work: Stephen Challener (Redshrike), hosted by OpenGameArt.org).
  https://opengameart.org/content/30-scifi-creatures-nes-style (`s_*.png` and the variations `s2_*.png`; frames reordered)
- **ImogiaGames**, "Witchy Hag", CC-BY 4.0 / OGA-BY 4.0, a remix of devnewton's witch. https://opengameart.org/content/witchy-hag (flipped to face right)
- **ImogiaGames**, CC0 (credit given gladly): "Ghost monster" (remixed from Balmer's "Skeleton and Ghost", Ars Notoria) https://opengameart.org/content/ghost-monster ;
  "Goblin monster" (from MoikMellah's "Goblin Corps") https://opengameart.org/content/goblin-monster ;
  "Eye Of Sender animated" (from Umplix's "Eye of Sender") https://opengameart.org/content/eye-of-sender-animated ;
  "The Rotating Eyeball" (from codeinfernogames) https://opengameart.org/content/the-rotating-eyeball ;
  "Zeodore Of The Circling Agression" (after titleknown's "Theodore of the Twisting Violence") https://opengameart.org/content/zeodore-of-the-circling-agression ;
  "Aquatic Creature - Zibsesh" (after artisticdude's zombie) https://opengameart.org/content/aquatic-creature-zibsesh ;
  "Fire Slime Monster Variations DB32" (from Spring Spring's "Fire slime") https://opengameart.org/content/fire-slime-monster-variations-db32 ;
  "8Bit NES - Big Slime Monster" (from Technopeasant's slime, after Radomir Dopieralski) https://opengameart.org/content/8bit-nes-big-slime-monster
  Changes: chosen frames and colour variations packed into four-frame strips (`assets/mon/i_*.png`).

The strips were made with a small build script outside this repository; it adds the strips and merges their sizes into `assets/meta.json`.

## Map tiles
- **Demetrius**, "Nestor tileset", CC0. https://opengameart.org/content/nestor-tileset
- **devurandom**, "8-bit RPG basic tile set", CC0: desert, grey castle stone and bridges. https://opengameart.org/content/8-bit-rpg-basic-tile-set
- **ETTiNGRiNDER**, "NES CC0 Graphics #2", CC0: the sword in battle. https://opengameart.org/content/nes-cc0-graphics-2
- The little castles, towns, tower and shrine on the world map, the treasure chests, the save crystals and the airship were drawn in code for this game.
- Part II's snow, ice, lava, swamp, clouds, pale stone, drowned halls, root caves, temple and workshop tiles are the Nestor and devurandom tiles above, recoloured in code (`js/tiles.js`). The bell tower and sky-town icons were drawn in code.

## Music
- **AVGVSTA**, "Generic 8-bit JRPG Soundtrack", CC-BY 4.0 / CC-BY 3.0 / OGA-BY 3.0. Attribution: AVGVSTA.
  https://opengameart.org/content/generic-8-bit-jrpg-soundtrack
  The tracks were converted to MP3 for the web.
- Sound effects are synthesised in the browser.

## Font
- **Cubic 11** by ACh-K, SIL Open Font License 1.1 (`fonts/Cubic_11-LICENSE.txt`).
