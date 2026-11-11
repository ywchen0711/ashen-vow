// Map tiles. Most come from the Nestor chipset (Demetrius, CC0), laid out for RPG Maker 2000:
// water and edged ground are autotiles built from 8x8 quarters, the rest are plain 16x16 tiles and
// objects on magenta. The desert, the grey castle stone and the bridges are from devurandom's 8-bit
// RPG tile set (CC0). The little world-map buildings are drawn here in the same NES colours.
import { canvas, fromGrid } from './gfx.js';

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
  grass: { t: [1, 10] }, grass2: { t: [13, 2] }, leafy: { t: [4, 10] }, dirt: { t: [7, 10] }, flowers: { t: [10, 10] },
  earth: { t: [13, 12] }, cobble: { t: [4, 14] }, rockfloor: { t: [17, 7] }, darkrock: { t: [16, 7] }, plank: { t: [13, 10] },
  sandfloor: { t: [15, 0] }, bluefloor: { t: [22, 0] }, bluetile: { t: [19, 5] }, whitefloor: { t: [21, 0] }, darkblue: { t: [23, 0] }, mosaic: { t: [21, 2] },
  sand: { d: [2, 14] }, stone: { d: [22, 5] }, greystone: { d: [20, 3], solid: true },
  woodwall: { t: [13, 9], solid: true }, woodtop: { t: [13, 8], solid: true }, brick: { t: [15, 9], solid: true }, darkbrick: { t: [16, 9], solid: true },
  goldbrick: { t: [17, 9], solid: true }, siding: { t: [16, 10], solid: true }, greenbrick: { t: [16, 3], solid: true }, mossbrick: { t: [15, 3], solid: true },
  bluewall: { t: [21, 4], solid: true }, bluewall2: { t: [22, 4], solid: true }, bluerock: { t: [23, 4], solid: true }, rock: { t: [15, 12], solid: true },
  castlewall: { d: [20, 1], solid: true }, castlewall2: { d: [21, 0], solid: true },
  roof: { t: [13, 14], solid: true }, roof2: { t: [16, 12], solid: true }, hedge: { t: [12, 4], solid: true }, forest: { base: 'grass', o: [23, 8] },
  // ground with black edges: cliffs, caves, deep woods
  cliff: { auto: [6, 4], solid: true }, cave: { auto: [9, 4], solid: true }, pit: { auto: [6, 0], solid: true }, chasm: { auto: [9, 0], solid: true },
  thicket: { auto: [6, 12], solid: true }, woods: { auto: [9, 12], solid: true },
  water: { water: 0, solid: true }, deep: { water: 3, solid: true },
  // objects
  tree: { base: 'grass', o: [23, 8], solid: true }, ftree: { base: 'grass', o: [23, 9], solid: true }, stump: { base: 'grass', o: [18, 12], solid: true },
  sapling: { base: 'grass', o: [19, 12], solid: true }, fence: { base: 'grass', o: [22, 14], solid: true }, grave: { base: 'grass', o: [19, 14], solid: true },
  tomb: { base: 'grass', o: [26, 12], solid: true }, bones: { base: 'earth', o: [18, 14] }, mossrock: { base: 'grass', o: [20, 14], solid: true },
  bigtree: { base: 'grass', o4: [19, 8], solid: true }, boulder: { base: 'dirt', o4: [26, 1], solid: true }, mount: { base: 'grass', o4: [26, 1], solid: true },
  deadtree: { base: 'earth', o4: [24, 1], solid: true }, pine: { base: 'grass', o2: [18, 10], solid: true },
  door: { base: 'woodwall', o: [21, 15] }, door2: { base: 'brick', o: [22, 15] }, bdoor: { base: 'bluewall', o: [27, 6], o2: [27, 6] }, window: { base: 'woodwall', o: [18, 15], solid: true },
  bwindow: { base: 'bluewall', o: [24, 6], solid: true }, cavemouth: { t: [15, 14] }, stairs: { t: [15, 15] }, bstairs: { t: [23, 1] }, gstairs: { t: [14, 4] },
  chest: { base: 'plank', o: [28, 0], solid: true }, drawer: { base: 'plank', o: [28, 1], solid: true }, table: { base: 'plank', o: [28, 2], solid: true },
  chair: { base: 'plank', o: [29, 2] }, counter: { base: 'plank', o: [24, 3], solid: true }, counter2: { base: 'plank', o: [25, 3], solid: true },
  bench: { base: 'plank', o: [26, 3], solid: true }, shelf: { base: 'plank', o: [24, 4], o2: [24, 4], solid: true }, books: { base: 'plank', o: [25, 4], o2: [25, 4], solid: true },
  bed: { base: 'plank', o: [24, 8], o2: [24, 8], solid: true }, pot: { base: 'plank', o: [27, 5], solid: true }, barrel: { base: 'plank', o: [29, 5], solid: true },
  sack: { base: 'plank', o: [28, 5], solid: true }, pillar: { base: 'bluefloor', o: [29, 7], solid: true }, statue: { base: 'bluefloor', o: [28, 11], solid: true },
  torch: { base: 'bluewall', o: [23, 15], solid: true }, brazier: { base: 'bluefloor', o: [29, 11], solid: true }, crystal: { base: 'bluefloor', o: [24, 10], solid: true },
  urn: { base: 'bluefloor', o: [24, 11], solid: true }, lamp: { base: 'grass', o: [25, 11], solid: true }, altar: { base: 'bluefloor', o: [25, 10], solid: true },
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
  dmount: { base: 'sand', o4: [26, 1], solid: true }, scrub: { base: 'sand', o: [20, 14], solid: false },
  ash: { t: [16, 7] }, burnt: { base: 'ash', o: [18, 12], solid: true }, ember: { base: 'ash', o: [23, 15] },
};
export const TILES = T;
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

export function drawTile(g, k, x, y, nb, f) {
  const d = T[k];
  if (!d) throw new Error('tile ' + k);
  if (d.base) drawTile(g, d.base, x, y, nb, f);
  if (d.t) blit(g, NEST, d.t[0], d.t[1]);
  if (d.d) g.drawImage(DEVU, d.d[0] * 16, d.d[1] * 16 + (d.anim ? f * 336 : 0), 16, 16, 0, 0, 16, 16);
  if (d.auto) autotile(g, d.auto[0], d.auto[1], (dx, dy) => { const o = nb(dx, dy); return o === k || o === 'void' || o === undefined; });
  if (d.water !== undefined) water(g, d.water, f, (dx, dy) => { const o = nb(dx, dy); return grp(o) === 'water' || o === undefined || o === 'void'; });
  if (d.nine) {
    const L = nb(-1, 0) === k, R = nb(1, 0) === k, U = nb(0, -1) === k, D = nb(0, 1) === k;
    blit(g, NEST, d.nine[0] + (!L ? 0 : !R ? 2 : 1), d.nine[1] + (!U ? 0 : !D ? 2 : 1));
  }
  if (d.o && !d.o2) blit(g, NEST, d.o[0], d.o[1]);
  if (d.o2) { const top = nb(0, -1) !== k; blit(g, NEST, d.o2[0], d.o2[1] + (top ? 0 : 1)); }
  if (d.o4) blit(g, NEST, d.o4[0] + (x & 1), d.o4[1] + (y & 1));
  if (d.d2) { const top = nb(0, -1) !== k; g.drawImage(DEVU, d.d2[0] * 16, (d.d2[1] + (top ? 0 : 1)) * 16, 16, 16, 0, 0, 16, 16); }
  if (d.icon) {
    if (d.ruin) { g.globalAlpha = 0.85; g.drawImage(ICON[d.icon], 0, 0); g.globalAlpha = 1; g.fillStyle = '#000'; for (let i = 0; i < 9; i++) g.fillRect((i * 7) % 15, 2 + ((i * 5) % 12), 2, 1); }
    else g.drawImage(ICON[d.icon], 0, 0);
  }
}

// ---------- whole maps ----------
// returns { frames: [3 canvases], upper: canvas }
export function renderMap(map) {
  const { w, h } = map, frames = [];
  const kindAt = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? undefined : map.kinds[map.tile(x, y)]);
  const anim = map.kinds.some((k) => T[k] && (T[k].water !== undefined || (T[k].base && T[T[k].base] && T[T[k].base].water !== undefined)));
  const nf = anim ? 3 : 1;
  const t = canvas(16, 16);
  for (let f = 0; f < nf; f++) {
    const c = canvas(w * 16, h * 16);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const k = kindAt(x, y);
      if (f > 0 && !(T[k].water !== undefined)) { c.x.drawImage(frames[0], x * 16, y * 16, 16, 16, x * 16, y * 16, 16, 16); continue; }
      t.x.clearRect(0, 0, 16, 16);
      drawTile(t.x, k, x, y, (dx, dy) => kindAt(x + dx, y + dy), f);
      c.x.drawImage(t, x * 16, y * 16);
    }
    frames.push(c);
  }
  return { frames, upper: canvas(1, 1) };
}
// a single tile for previews and battle backdrops
export function tileCanvas(k, nb = () => k, f = 0) { const c = canvas(16, 16); drawTile(c.x, k, 0, 0, nb, f); return c; }
