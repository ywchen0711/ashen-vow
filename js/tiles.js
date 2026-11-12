// Map tiles. Most come from the Nestor chipset (Demetrius, CC0), laid out for RPG Maker 2000:
// water and edged ground are autotiles built from 8x8 quarters, the rest are plain 16x16 tiles and
// objects on magenta. The desert, the grey castle stone and the bridges are from devurandom's 8-bit
// RPG tile set (CC0). The little world-map buildings are drawn here in the same NES colours.
import { canvas, fromGrid } from './gfx.js';
import { recolor } from './sprites.js';

async function img(src) { const i = new Image(); i.src = src; await i.decode(); return i; }
function keyed(im) {
  const c = canvas(im.width, im.height); c.x.drawImage(im, 0, 0);
  const d = c.x.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < d.data.length; i += 4) if (d.data[i] === 255 && d.data[i + 1] === 0 && d.data[i + 2] === 255) d.data[i + 3] = 0;
  c.x.putImageData(d, 0, 0);
  return c;
}
const NEST = keyed(await img('assets/tiles/nestor.png'));
const DEVU = await img('assets/tiles/devu.png');
export const NES2 = await img('assets/tiles/nes2.png');

// ---------- the world-map buildings ----------
const P = { o: '#000000', k: '#3c3c3c', g: '#7c7c7c', w: '#bcbcbc', W: '#fcfcfc', b: '#0058f8', B: '#3cbcfc', r: '#a81000', R: '#f83800', y: '#f8b800', n: '#7c3c00', N: '#ac7c00', e: '#00a800', E: '#58d854', p: '#6844fc', P: '#9878f8', d: '#503000' };
const ICON = {
  castle: fromGrid([
    '..o..........o..',
    '.oRo........oRo.',
    'oRRRo......oRRRo',
    'owwwo.o..o.owwwo',
    'owgwoowooowowgwo',
    'owwwowwwwwwwowwo',
    'owgwowgwwgwwowgo',
    'owwwowwwwwwwowwo',
    'owwwowwoowwwowwo',
    'owgwowokkowwowgo',
    'owwwowokkowwowwo',
    'owwwowokkowwowwo',
    'ooooooooooooooo.',
    '................',
    '................',
    '................',
  ].map((r) => r.padEnd(16, '.')), P),
  town: fromGrid([
    '................',
    '....oo..........',
    '...oRRo.....oo..',
    '..oRRRRo...obbo.',
    '.oRRRRRRo.obbbbo',
    '.owwwwwwo.owwwwo',
    '.owoowwwo.owoowo',
    '.owokwwwo.owwwwo',
    '.ooooooooooooooo',
    '.....oo.........',
    '....oRRo..oo....',
    '...oRRRRooyyo...',
    '..oRRRRRoyyyyo..',
    '..owwwwwoowwwo..',
    '..owokwwoowkwo..',
    '..ooooooooooooo.',
  ], P),
  tower: fromGrid([
    '......oPo.......',
    '.....oPPPo......',
    '....oPPPPPo.....',
    '....okkkkko.....',
    '....okgkkgo.....',
    '....okkkkko.....',
    '....okkgkko.....',
    '....okkkkko.....',
    '....okgkkgo.....',
    '....okkkkko.....',
    '...okkkkkkko....',
    '...okkgkgkko....',
    '...okkkokkko....',
    '..okkkkokkkko...',
    '..ooooooooooo...',
    '................',
  ], P),
  shrine: fromGrid([
    '................',
    '.......oo.......',
    '......oBBo......',
    '.....oBBBBo.....',
    '....oBBBBBBo....',
    '...oBBBBBBBBo...',
    '..oooooooooooo..',
    '...owoowwoowo...',
    '...owoowwoowo...',
    '...owoowwoowo...',
    '...owoowwoowo...',
    '..oooooooooooo..',
    '................',
    '................',
    '................',
    '................',
  ], P),
  well: fromGrid([
    '................',
    '................',
    '......oooo......',
    '....ooRRRRoo....',
    '...oRRyyyyRRo...',
    '..oRyyRRRRyyRo..',
    '..oRyRoooRRyRo..',
    '..oRyRoooo RyRo.'.slice(0, 16),
    '..oRyRRooRRyRo..',
    '..oRRyyRRyyRRo..',
    '...oRRRyyRRRo...',
    '....ooRRRRoo....',
    '......oooo......',
    '................',
    '................',
    '................',
  ].map((r) => r.replace(' ', 'o')), P),
  bell: fromGrid([
    '.......oo.......',
    '......oWWo......',
    '.....oWWWWo.....',
    '....ooooooo.....',
    '....owyyywo.....',
    '....oyyyyyo.....',
    '....owyoywo.....',
    '....ooooooo.....',
    '....owwgwwo.....',
    '....owwwwwo.....',
    '....owgwwgo.....',
    '...owwwwwwwo....',
    '...owwwokwwo....',
    '..owwwwokwwwo...',
    '..ooooooooooo...',
    '................',
  ], P),
  skytown: fromGrid([
    '................',
    '.....oo.........',
    '....oyyo....oo..',
    '...oyyyyo..oBBo.',
    '..oyyyyyyooBBBBo',
    '..owwwwwwoowwwwo',
    '..owoowwwoowoowo',
    '..owokwwwoowwwwo',
    '..oooooooooooooo',
    '.oWWWWWWWWWWWWWo',
    'oWWBWWWWBWWWWBWWo'.slice(0, 16),
    '.oWWWWWWWWWWWWo.',
    '..oooWWWWWWooo..',
    '.....oooooo.....',
    '................',
    '................',
  ], P),
  ship: fromGrid([
    '................',
    '.......o........',
    '......oWo.......',
    '.....oWWWo......',
    '....oWWWWWo.....',
    '...oWWWWWWo.....',
    '..oWWWWWWWWo....',
    '.......o........',
    '.ooooooooooooooo',
    '.onNNNNNNNNNNNo.',
    '..onNNNNNNNNNo..',
    '...ooooooooooo..',
    '................',
    '................',
    '................',
    '................',
  ], P),
};
// the airship Wren, two frames of propeller
export const WREN = [0, 1].map((f) => fromGrid([
  f ? '..oooo....oooo..' : '.....oooooo.....',
  '.......oo.......',
  '....oooooooo....',
  '..ooBBBBBBBBoo..',
  '.oBBWWBBBBBBBBo.',
  'oBBBBBBBBBBBBBBo',
  'oBBBBBBBBBBBBBBo',
  '.oooooooooooooo.',
  '...on.....no....',
  '..onNNNNNNNNno..',
  '.onNNyNNyNNyNNo.',
  '.onNNNNNNNNNNNo.',
  '..oonnnnnnnnoo..',
  '....oooooooo....',
  '................',
  '................',
], P));

// ---------- tile definitions ----------
// t: plain tile [col, row] from Nestor; d: from devurandom; auto: an RPG Maker 2000 ground autotile
// block (top-left corner); water: the animated water autotile; o: an object drawn over a base kind;
// o4: a 2x2 object whose quarter comes from the map position; nine: a 3x3 frame (rugs).
const T = {
  void: { t: [12, 0], solid: true },
  grass: { t: [1, 10] }, grass2: { t: [13, 2] }, leafy: { t: [4, 10] }, dirt: { t: [7, 10] }, flowers: { auto: [9, 8] },
  earth: { t: [13, 12] }, cobble: { t: [4, 14] }, rockfloor: { t: [17, 7] }, darkrock: { t: [16, 7] }, plank: { t: [13, 10] },
  sandfloor: { t: [15, 0] }, bluefloor: { t: [22, 0] }, bluetile: { t: [19, 5] }, whitefloor: { t: [21, 0] }, darkblue: { t: [23, 0] }, mosaic: { t: [21, 2] },
  sand: { d: [2, 14] }, stone: { d: [22, 5] }, greystone: { d: [20, 3], solid: true },
  woodwall: { t: [13, 9], solid: true }, woodtop: { t: [13, 8], solid: true }, brick: { t: [15, 9], solid: true }, darkbrick: { t: [16, 9], solid: true },
  goldbrick: { t: [17, 9], solid: true }, siding: { t: [16, 10], solid: true }, greenbrick: { t: [16, 3], solid: true }, mossbrick: { t: [15, 3], solid: true },
  bluewall: { t: [21, 4], solid: true }, bluewall2: { t: [22, 4], solid: true }, bluerock: { t: [23, 4], solid: true }, rock: { t: [15, 12], solid: true },
  castlewall: { d: [20, 1], solid: true }, castlewall2: { d: [21, 0], solid: true },
  roof: { t: [13, 14], solid: true }, roof2: { t: [16, 12], solid: true }, hedge: { t: [12, 4], solid: true }, forest: { base: 'grass', o: [23, 8], fit: 'floor' },
  // ground with black edges: cliffs, caves, deep woods
  cliff: { auto: [6, 4], solid: true }, cave: { auto: [9, 4], solid: true }, pit: { auto: [6, 0], solid: true }, chasm: { auto: [9, 0], solid: true },
  thicket: { auto: [6, 12], solid: true }, woods: { auto: [9, 12], solid: true },
  water: { water: 0, solid: true }, deep: { water: 3, solid: true },
  // objects
  tree: { base: 'grass', o: [23, 8], solid: true, fit: 'floor' }, ftree: { base: 'grass', o: [23, 9], solid: true, fit: 'floor' }, stump: { base: 'grass', o: [18, 12], solid: true, fit: 'floor' },
  sapling: { base: 'grass', o: [19, 12], solid: true, fit: 'floor' }, fence: { base: 'grass', o: [22, 14], solid: true, fit: 'floor' }, grave: { base: 'grass', o: [19, 14], solid: true, fit: 'floor' },
  tomb: { base: 'grass', o: [26, 12], solid: true, fit: 'floor' }, bones: { base: 'earth', o: [18, 14] }, mossrock: { base: 'grass', o: [20, 14], solid: true, fit: 'floor' },
  bigtree: { base: 'grass', o4: [19, 8], solid: true, fit: 'floor' }, boulder: { base: 'dirt', o4: [26, 1], solid: true, fit: 'floor' }, mount: { base: 'grass', o4: [26, 1], solid: true, fit: 'floor' },
  deadtree: { base: 'earth', o4: [24, 1], solid: true, fit: 'floor' }, pine: { base: 'grass', o2: [18, 10], tall: true, solid: true, fit: 'floor' },
  door: { base: 'woodwall', o: [21, 15], fit: 'wall' }, door2: { base: 'brick', o: [22, 15], fit: 'wall' }, bdoor: { base: 'bluewall', o: [27, 6], fit: 'wall' }, window: { base: 'woodwall', o: [18, 15], solid: true, fit: 'wall' },
  sdoor: { base: 'woodwall', o: [21, 15], solid: true, fit: 'wall' }, bwindow: { base: 'bluewall', o: [24, 6], solid: true, fit: 'wall' }, cavemouth: { t: [15, 14] }, stairs: { t: [15, 15] }, bstairs: { t: [23, 1] }, gstairs: { t: [14, 4] },
  chest: { base: 'plank', o: [28, 0], solid: true }, drawer: { base: 'plank', o: [28, 1], solid: true }, table: { base: 'plank', o: [28, 2], solid: true },
  chair: { base: 'plank', o: [29, 2] }, counter: { base: 'plank', o: [24, 3], solid: true }, counter2: { base: 'plank', o: [25, 3], solid: true },
  bench: { base: 'plank', o: [26, 3], solid: true }, shelf: { base: 'plank', o: [24, 4], o2: [24, 4], solid: true }, books: { base: 'plank', o2: [25, 4], tall: true, solid: true },
  bed: { base: 'plank', o2: [24, 8], tall: true, solid: true }, pot: { base: 'plank', o: [27, 11], solid: true, fit: 'floor' }, barrel: { base: 'plank', o: [29, 5], solid: true, fit: 'floor' },
  sack: { base: 'plank', o: [28, 5], solid: true, fit: 'floor' }, pillar: { base: 'bluefloor', col: [29, 6], tall: true, solid: true, fit: 'floor' }, statue: { base: 'bluefloor', o2: [28, 11], tall: true, solid: true, fit: 'floor' },
  torch: { base: 'bluewall', o: [23, 15], solid: true, fit: 'wall' }, brazier: { base: 'bluefloor', o2: [29, 11], tall: true, solid: true, fit: 'floor' }, crystal: { base: 'bluefloor', o: [24, 10], solid: true, fit: 'floor' },
  urn: { base: 'bluefloor', o: [24, 11], solid: true, fit: 'floor' }, lamp: { base: 'grass', o: [25, 11], solid: true, fit: 'floor' }, altar: { base: 'bluefloor', o: [28, 10], solid: true, fit: 'floor' },
  // carpets and rugs
  rug: { nine: [15, 4] }, bluerug: { nine: [18, 1] },
  // the devurandom castle
  gpillar: { base: 'stone', d2: [22, 1], solid: true },
  // world map
  bridge: { d: [12, 6] }, vbridge: { d: [14, 19] }, road: { t: [7, 10] },
  i_castle: { base: 'grass', icon: 'castle', solid: false }, i_town: { base: 'grass', icon: 'town' }, i_tower: { base: 'grass', icon: 'tower' },
  i_shrine: { base: 'grass', icon: 'shrine' }, i_cave: { base: 'grass', o: [15, 14], ot: true }, i_well: { base: 'earth', icon: 'well' },
  i_dtown: { base: 'sand', icon: 'town' }, i_dcastle: { base: 'sand', icon: 'castle' }, i_port: { base: 'grass', icon: 'town' },
  i_dcave: { base: 'sand', o: [15, 14], ot: true }, i_ruin: { base: 'earth', icon: 'town', ruin: true },
  dmount: { base: 'sand', o4: [26, 1], solid: true, fit: 'floor' }, scrub: { base: 'sand', o: [20, 14], solid: false, fit: 'floor' },
  ash: { t: [16, 7] }, burnt: { base: 'ash', o: [18, 12], solid: true }, ember: { base: 'ash', o: [23, 15] },
};
// ---------- tiles recoloured from the ones above, for the snowy north, the swamp, the volcano and the sky ----------
const R = (of, look, o = {}) => ({ of, look, ...o });
Object.assign(T, {
  snow: R('grass', { hue: 100, sat: 0.1, lum: 5.8 }), snowfield: R('grass2', { hue: 100, sat: 0.1, lum: 4.5 }),
  snowforest: R('forest', { hue: 110, sat: 0.2, lum: 4.5 }), snowtree: R('tree', { hue: 110, sat: 0.2, lum: 4.5 }, { solid: true }),
  snowpine: R('pine', { hue: 110, sat: 0.25, lum: 3.4 }, { solid: true }), snowmount: R('mount', { hue: 180, sat: 0.12, lum: 2.3 }, { solid: true }),
  ice: R('water', { hue: 10, sat: 0.35, lum: 1.7 }, { solid: true }), icefloor: R('bluetile', { sat: 0.4, lum: 1.5 }), icewall: R('bluewall', { sat: 0.35, lum: 1.45 }, { solid: true }),
  lava: R('water', { hue: 180, sat: 1.6, lum: 0.85 }, { solid: true }), ashrock: R('mount', { hue: 0, sat: 0.2, lum: 0.55 }, { solid: true }),
  cinder: R('earth', { hue: -20, sat: 0.6, lum: 0.6 }), cinderwall: R('cave', { hue: -25, sat: 1.2, lum: 0.9 }, { solid: true }),
  swamp: R('water', { hue: -105, sat: 0.5, lum: 0.5 }, { solid: true }), swampgrass: R('grass', { hue: -25, sat: 0.55, lum: 1.2 }),
  bog: R('leafy', { hue: -30, sat: 0.6, lum: 0.7 }), swamptree: R('tree', { hue: -30, sat: 0.6, lum: 0.7 }, { solid: true }), swampforest: R('forest', { hue: -30, sat: 0.6, lum: 0.7 }),
  cloud: R('water', { hue: 0, sat: 0.2, lum: 1.15 }, { solid: true }), skygrass: R('grass', { hue: 25, sat: 1.0, lum: 2.6 }), skyflowers: R('flowers', { hue: 25, sat: 1.0, lum: 1.5 }),
  skymount: R('mount', { hue: 30, sat: 1.0, lum: 1.25 }, { solid: true }),
  paletile: R('whitefloor', { sat: 0.15, lum: 1.05 }), palewall: R('bluewall', { sat: 0.08, lum: 1.5 }, { solid: true }), palepillar: R('pillar', { sat: 0.1, lum: 1.4 }, { solid: true }),
  palestone: R('rockfloor', { sat: 0.1, lum: 1.6 }), paleglass: R('water', { sat: 0.3, lum: 1.3 }, { solid: true }),
  drownfloor: R('bluetile', { hue: 20, sat: 0.9, lum: 0.75 }), drownwall: R('bluewall2', { hue: 20, sat: 0.9, lum: 0.75 }, { solid: true }), coral: R('mossrock', { hue: 160, sat: 1.4 }, { solid: true }),
  rootfloor: R('earth', { hue: 40, sat: 0.7, lum: 0.75 }), rootwall: R('woods', { hue: 10, sat: 0.7, lum: 0.75 }, { solid: true }), shroom: R('stump', { hue: 200, sat: 1.4, lum: 1.2 }, { solid: true }),
  glowshroom: R('flowers', { hue: 120, sat: 1.5, lum: 0.9 }),
  gearfloor: R('cobble', { hue: 20, sat: 0.4, lum: 0.8 }), gearwall: R('darkbrick', { hue: 20, sat: 0.5, lum: 0.9 }, { solid: true }), pipe: R('pillar', { hue: 180, sat: 0.6, lum: 0.9 }, { solid: true }),
  templefloor: R('sandfloor', { hue: -10, sat: 1.1, lum: 1.0 }), templewall: R('goldbrick', { hue: -10, sat: 1.0, lum: 0.9 }, { solid: true }),
  barrackfloor: R('cobble', { sat: 0.3, lum: 0.7 }), barrackwall: R('brick', { sat: 0.3, lum: 0.7 }, { solid: true }),
  i_snowtown: { base: 'snow', icon: 'town' }, i_bell: { base: 'snow', icon: 'bell' }, i_pale: { base: 'snow', icon: 'tower', look: { sat: 0.05, lum: 1.6 } },
  i_ecave: { base: 'cinder', o: [15, 14], ot: true }, i_gear: { base: 'cinder', icon: 'castle', look: { hue: 20, sat: 0.4, lum: 0.75 } },
  i_mtown: { base: 'swampgrass', icon: 'town' }, i_mcave: { base: 'swampgrass', o: [15, 14], ot: true }, i_temple: { base: 'sand', icon: 'shrine', look: { hue: 180, sat: 1.0 } },
  i_skytown: { base: 'skygrass', icon: 'skytown' }, i_aerie: { base: 'skygrass', icon: 'tower', look: { hue: 160, sat: 0.6, lum: 1.3 } },
});
export const TILES = T;
// a tile kind animates if it is (or is made from) water
const isAnim = (k) => !!T[k] && (T[k].water !== undefined || (T[k].of && isAnim(T[k].of)) || (T[k].base && isAnim(T[k].base)));
const lookCache = new Map();
const tmp = canvas(16, 16);
export const solidKind = (k) => !!(T[k] && T[k].solid);

// a 16x16 piece of a sheet
function blit(g, sheet, c, r, dx = 0, dy = 0, w = 16, h = 16, sx = 0, sy = 0) { g.drawImage(sheet, c * 16 + sx, r * 16 + sy, w, h, dx, dy, w, h); }

// RPG Maker 2000 ground autotile: block [bx, by] is 3 tiles wide and 4 high. Its top row holds the
// lone tile, (unused) and the four inner corners; the 3x3 below are the outer edges round a centre.
function autotile(g, bx, by, same) {
  const n = same(0, -1), s = same(0, 1), w = same(-1, 0), e = same(1, 0);
  const q = (qx, qy, dxn, dyn) => {
    const v = qy ? s : n, h = qx ? e : w, dg = same(qx ? 1 : -1, qy ? 1 : -1);
    let cx, cy;
    if (!v && !h) { cx = qx ? 2 : 0; cy = qy ? 3 : 1; } else if (v && !h) { cx = qx ? 2 : 0; cy = 2; } else if (!v && h) { cx = 1; cy = qy ? 3 : 1; } else if (!dg) { cx = 2; cy = 0; } else { cx = 1; cy = 2; }
    blit(g, NEST, bx + cx, by + cy, qx * 8, qy * 8, 8, 8, qx * 8, qy * 8);
    void dxn; void dyn;
  };
  q(0, 0); q(1, 0); q(0, 1); q(1, 1);
}
// RPG Maker 2000 water: column = animation frame; rows: all edges, sides, top/bottom, inner corners; row 4 is open water
function water(g, col, f, same) {
  const n = same(0, -1), s = same(0, 1), w = same(-1, 0), e = same(1, 0);
  for (const [qx, qy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
    const v = qy ? s : n, h = qx ? e : w, dg = same(qx ? 1 : -1, qy ? 1 : -1);
    const row = !v && !h ? 0 : v && !h ? 1 : !v && h ? 2 : !dg ? 3 : 4;
    blit(g, NEST, col + f, row, qx * 8, qy * 8, 8, 8, qx * 8, qy * 8);
  }
}
// tiles that count as the same water or the same edged ground
const GROUP = { water: 'water', deep: 'water', bridge: 'water', vbridge: 'water' };
const grp = (k) => GROUP[k] || k;

// the definition a recoloured kind is made from
const rootOf = (k) => (T[k] && T[k].of ? rootOf(T[k].of) : k);
// a plain one-cell ground or wall tile (nothing drawn over it), fit to stand under an object
const plain = (k) => { const d = T[rootOf(k)]; return !!d && !!(d.t || d.d) && !d.base && !d.o && !d.icon; };
// objects stand on whatever floor (or hang on whatever wall) is beside them, not on a fixed base
const PATHS = new Set(['road', 'dirt', 'cobble', 'plank', 'rug', 'bluerug', 'bridge', 'vbridge']);
function baseFor(k, d, nb) {
  if (!d.fit) return d.base;
  const wall = d.fit === 'wall';
  const fits = (o) => o && o !== k && o !== 'void' && plain(o) && solidKind(o) === wall;
  let near = (wall ? [[-1, 0], [1, 0]] : [[0, 1], [-1, 0], [1, 0], [0, -1]]).map(([dx, dy]) => nb(dx, dy)).filter(fits);
  if (!near.length && !wall) near = [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([dx, dy]) => nb(dx, dy)).filter(fits);
  if (!near.length) return d.base;
  // a road beside a tree is not the ground it grows from, unless there is nothing else
  if (!wall && near.some((o) => !PATHS.has(o))) near = near.filter((o) => !PATHS.has(o));
  const n = {}; for (const o of near) n[o] = (n[o] || 0) + 1;
  return near.reduce((a, o) => (n[o] > n[a] ? o : a), near[0]);
}
// a 2x2 object (mountains, big trees): which quarter this tile shows, counted from the start of
// its run so blocks that start on odd rows or columns still line up; null when the tile is not
// part of a whole 2x2 block, and then a small one-tile version is drawn instead
function quarter(same) {
  let l = 0; while (l < 64 && same(-l - 1, 0)) l++;
  let u = 0; while (u < 64 && same(0, -u - 1)) u++;
  const qx = l & 1, qy = u & 1;
  for (let yy = 0; yy < 2; yy++) for (let xx = 0; xx < 2; xx++) if (!same(xx - qx, yy - qy)) return null;
  return [qx, qy];
}
const miniCache = new Map();
function mini4(c, r) {
  const key = c + ',' + r;
  if (miniCache.has(key)) return miniCache.get(key);
  const src = canvas(32, 32); src.x.drawImage(NEST, c * 16, r * 16, 32, 32, 0, 0, 32, 32);
  const a = src.x.getImageData(0, 0, 32, 32).data, out = canvas(16, 16), od = out.x.createImageData(16, 16), o = od.data;
  // halve it, keeping the dark outline where any of the four pixels has it
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const px = [0, 1, 32, 33].map((d) => ((y * 2) * 32 + x * 2 + d) * 4).filter((i) => a[i + 3]);
    if (px.length < 2) continue;
    const dark = px.find((i) => a[i] + a[i + 1] + a[i + 2] < 60), i = dark !== undefined ? dark : px[0], j = (y * 16 + x) * 4;
    o[j] = a[i]; o[j + 1] = a[i + 1]; o[j + 2] = a[i + 2]; o[j + 3] = 255;
  }
  out.x.putImageData(od, 0, 0);
  miniCache.set(key, out);
  return out;
}
// a column piece with a dark outline, so the pale stone stands out on a pale floor
const colCache = new Map();
function colArt(c, r, part) {
  const key = c + ',' + r + ',' + part;
  if (colCache.has(key)) return colCache.get(key);
  const out = canvas(16, 16), g = out.x;
  if (part === 'lone') { blit(g, NEST, c, r, 0, 0, 16, 8); blit(g, NEST, c, r + 2, 0, 8, 16, 8, 0, 8); } else blit(g, NEST, c, r + part);
  const id = g.getImageData(0, 0, 16, 16), a = id.data, src = Uint8ClampedArray.from(a);
  const op = (x, y) => x >= 0 && y >= 0 && x < 16 && y < 16 && src[(y * 16 + x) * 4 + 3] > 0;
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    if (op(x, y)) continue;
    // sides always; the top and bottom only where the piece really ends
    const side = op(x - 1, y) || op(x + 1, y), end = (op(x, y - 1) && (part === 'lone' || part === 2)) || (op(x, y + 1) && (part === 'lone' || part === 0));
    if (side || end) { const i = (y * 16 + x) * 4; a[i] = a[i + 1] = a[i + 2] = 0; a[i + 3] = 255; }
  }
  g.putImageData(id, 0, 0);
  colCache.set(key, out);
  return out;
}
// a lone two-tall object (a bed, a statue, a pine) draws its lower half here and its top in the tile above
const tallLone = (k, nb) => { const d = T[rootOf(k)]; return !!(d && d.tall && (d.o2 || d.col)) && nb(0, -1) !== k && nb(0, 1) !== k && nb(0, -1) !== undefined; };
const topCache = new Map();
function tallTop(k) {
  if (topCache.has(k)) return topCache.get(k);
  const d = T[k];
  let c;
  if (d.of) c = recolor(tallTop(d.of), d.look);
  else if (d.col) c = colArt(d.col[0], d.col[1], 0);
  else { c = canvas(16, 16); blit(c.x, NEST, d.o2[0], d.o2[1]); }
  topCache.set(k, c);
  return c;
}

export function drawTile(g, k, x, y, nb, f, noBase) {
  const d = T[k];
  if (!d) throw new Error('tile ' + k);
  if (d.of) {
    // draw the source tile as if its neighbours of the same kind were that source, then recolour
    const nb2 = (dx, dy) => { const o = nb(dx, dy); if (o === undefined) return undefined; if (o === k) return d.of; if (o === d.of || grp(o) === grp(d.of)) return '_'; return o; };
    const R0 = T[rootOf(k)], q = R0.o4 ? quarter((dx, dy) => nb(dx, dy) === k) : null;
    // an object that takes its floor from its neighbours: the floor is drawn as it is, only the object is recoloured
    const own = R0.fit && !noBase ? baseFor(k, R0, nb) : null;
    if (own && own !== R0.base) drawTile(g, own, x, y, nb, f);
    let key = k + '|' + (isAnim(k) ? f : 0) + '|' + (q ? q.join('') : '-') + '|' + (own && own !== R0.base ? 'n' : 'b');
    for (const [dx, dy] of [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]) key += '|' + nb2(dx, dy);
    let c = lookCache.get(key);
    if (!c) {
      tmp.x.clearRect(0, 0, 16, 16);
      drawTile(tmp.x, d.of, x, y, nb2, f, (own && own !== R0.base) || noBase);
      c = recolor(tmp, d.look);
      lookCache.set(key, c);
    }
    g.drawImage(c, 0, 0);
    return;
  }
  if (d.base && !noBase) drawTile(g, baseFor(k, d, nb), x, y, nb, f);
  if (d.t) blit(g, NEST, d.t[0], d.t[1]);
  if (d.d) g.drawImage(DEVU, d.d[0] * 16, d.d[1] * 16 + (d.anim ? f * 336 : 0), 16, 16, 0, 0, 16, 16);
  if (d.auto) autotile(g, d.auto[0], d.auto[1], (dx, dy) => { const o = nb(dx, dy); return o === k || o === 'void' || o === undefined; });
  if (d.water !== undefined) water(g, d.water, f, (dx, dy) => { const o = nb(dx, dy); return grp(o) === 'water' || o === undefined || o === 'void'; });
  if (d.nine) {
    const L = nb(-1, 0) === k, R = nb(1, 0) === k, U = nb(0, -1) === k, D = nb(0, 1) === k;
    blit(g, NEST, d.nine[0] + (!L ? 0 : !R ? 2 : 1), d.nine[1] + (!U ? 0 : !D ? 2 : 1));
  }
  if (d.o && !d.o2) blit(g, NEST, d.o[0], d.o[1]);
  if (d.o2) { const top = nb(0, -1) !== k; blit(g, NEST, d.o2[0], d.o2[1] + (top && !tallLone(k, nb) ? 0 : 1)); }
  if (d.o4) { const q = quarter((dx, dy) => nb(dx, dy) === k); if (q) blit(g, NEST, d.o4[0] + q[0], d.o4[1] + q[1]); else g.drawImage(mini4(d.o4[0], d.o4[1]), 0, 0); }
  if (d.col) {
    // a column: capital, shaft and foot; a lone one is the capital's top half over the foot's bottom half
    const up = nb(0, -1) === k, dn = nb(0, 1) === k;
    g.drawImage(colArt(d.col[0], d.col[1], tallLone(k, nb) ? 2 : !up && !dn ? 'lone' : !up ? 0 : !dn ? 2 : 1), 0, 0);
  }
  if (d.d2) { const top = nb(0, -1) !== k; g.drawImage(DEVU, d.d2[0] * 16, (d.d2[1] + (top ? 0 : 1)) * 16, 16, 16, 0, 0, 16, 16); }
  if (d.icon) {
    if (d.ruin) { g.globalAlpha = 0.85; g.drawImage(ICON[d.icon], 0, 0); g.globalAlpha = 1; g.fillStyle = '#000'; for (let i = 0; i < 9; i++) g.fillRect((i * 7) % 15, 2 + ((i * 5) % 12), 2, 1); }
    else if (d.look) { const key = 'icon|' + k; if (!lookCache.has(key)) lookCache.set(key, recolor(ICON[d.icon], d.look)); g.drawImage(lookCache.get(key), 0, 0); }
    else g.drawImage(ICON[d.icon], 0, 0);
  }
}

// ---------- whole maps ----------
// returns { frames: [3 canvases], upper: canvas }
export function renderMap(map) {
  const { w, h } = map, frames = [];
  const kindAt = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? undefined : map.kinds[map.tile(x, y)]);
  const anim = map.kinds.some((k) => isAnim(k));

  const nf = anim ? 3 : 1;
  const t = canvas(16, 16);
  for (let f = 0; f < nf; f++) {
    const c = canvas(w * 16, h * 16);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const k = kindAt(x, y);
      if (f > 0 && !isAnim(k)) { c.x.drawImage(frames[0], x * 16, y * 16, 16, 16, x * 16, y * 16, 16, 16); continue; }
      t.x.clearRect(0, 0, 16, 16);
      drawTile(t.x, k, x, y, (dx, dy) => kindAt(x + dx, y + dy), f);
      c.x.drawImage(t, x * 16, y * 16);
    }
    // the tops of lone two-tall objects reach into the tile above
    for (let y = 1; y < h; y++) for (let x = 0; x < w; x++) {
      const k = kindAt(x, y);
      if (tallLone(k, (dx, dy) => kindAt(x + dx, y + dy))) c.x.drawImage(tallTop(k), x * 16, (y - 1) * 16);
    }
    frames.push(c);
  }
  return { frames, upper: canvas(1, 1) };
}
// a single tile for previews and battle backdrops
export function tileCanvas(k, nb = () => k, f = 0) { const c = canvas(16, 16); drawTile(c.x, k, 0, 0, nb, f); return c; }
