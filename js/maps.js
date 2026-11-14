// Every map. Rows of characters; the legend turns a character into a tile kind and, for some,
// an entity (people, chests, doors, story triggers). The world map is drawn with code.
import { hash } from './gfx.js';
import { L } from './i18n.js';

const BASE = {
  ' ': 'void', '.': 'grass', ',': 'grass2', ';': 'leafy', '=': 'dirt', '*': 'flowers', '_': 'earth', 'c': 'cobble', '+': 'plank', 's': 'sand',
  'b': 'bluefloor', 'q': 'bluetile', 'n': 'whitefloor', 'i': 'darkblue', 'O': 'rockfloor', 'o': 'darkrock', 'A': 'ash', 'E': 'ember', 'Z': 'burnt',
  '#': 'woodwall', 'X': 'brick', 'K': 'darkbrick', 'Y': 'goldbrick', 'g': 'greenbrick', 'h': 'mossbrick', 'Q': 'bluewall', 'V': 'bluewall2', 'R': 'roof', 'r': 'roof2',
  'W': 'castlewall', 'M': 'greystone', 'k': 'counter', 'l': 'shelf', 'e': 'bed', 'a': 'table', 'x': 'barrel', 'y': 'pot', 'I': 'pillar', 'S': 'statue',
  'j': 'torch', 'J': 'brazier', 'z': 'crystal', 'U': 'urn', '!': 'altar', '[': 'rug', ']': 'bluerug', 'w': 'window', 'd': 'door', 'D': 'door2',
  '%': 'cliff', '&': 'cave', '@': 'woods', '$': 'thicket', 'p': 'pit', '~': 'water', 'T': 'tree', 't': 'ftree', 'P': 'pine', 'B': 'bigtree', 'u': 'stump',
  'F': 'fence', 'G': 'grave', 'L': 'lamp', 'm': 'mossrock', 'v': 'stairs', '^': 'bstairs', 'H': 'sapling', 'f': 'forest', 'C': 'chasm',
};

export function grid(rows, legend = {}, meta = {}) {
  const Lg = { ...BASE, ...legend }, h = rows.length, w = Math.max(...rows.map((r) => r.length));
  rows.forEach((r, i) => { if (r.length !== w) throw new Error(`${meta.id} row ${i} is ${r.length} wide, not ${w}`); });
  const ents = [], kinds = [];
  for (let y = 0; y < h; y++) {
    kinds.push([]);
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x], v = Lg[ch];
      if (v === undefined) throw new Error(`${meta.id}: no legend for '${ch}' at ${x},${y}`);
      if (typeof v === 'string') { kinds[y].push(v); continue; }
      kinds[y].push(v.k);
      const e = typeof v.e === 'function' ? v.e(x, y) : v.e;
      if (e) for (const one of [].concat(e)) ents.push({ x, y, ...one });
    }
  }
  return { w, h, kindAt: (x, y) => kinds[y][x], ents, ...meta };
}
// shorthands for legend entries
export const npc = (k, id, sprite, talk, o = {}) => ({ k, e: { type: 'npc', id, sprite, talk, ...o } });
export const warp = (k, to, tx, ty, dir = 'd', o = {}) => ({ k, e: { type: 'warp', to, tx, ty, dir, ...o } });
export const chest = (k, id, item, n = 1) => ({ k, e: { type: 'chest', id, item, n } });
export const trig = (k, run, o = {}) => ({ k, e: { type: 'trigger', run, ...o } });
export const save = (k) => ({ k, e: { type: 'save' } });
export const both = (k, ...es) => ({ k, e: es });

export const MAPS = {};
export const def = (id, o) => { MAPS[id] = { id, ...o }; };
const nm = (zh, en) => () => L(zh, en);

// =====================================================================================
// the world
// =====================================================================================
export const WORLD = { C: [22, 13], T: [26, 14], M: [30, 10], m: [44, 4], G: [50, 4], H: [54, 13], w1: [52, 19], w2: [52, 22], W: [49, 30], S: [37, 33], P: [30, 40], p: [25, 40], X: [12, 28], K: [9, 42], R: [55, 45],
  // Part II
  Sf: [6, 30], Gw: [80, 50], Rh: [20, 55], Dg: [42, 57], Bl: [78, 10], Bt: [86, 6], Ps: [84, 25] };
// treasure: [x, y] of each map's buried chest, and what is in it
export const DIG = [[[33, 22], 'luckycoin'], [[86, 47], 'sagesring'], [[71, 15], 'mindgem'], [[11, 58], 'starshard'], [[3, 37], 'goldmaw']];
function worldBuild(f) {
  const w = 96, h = 64;
  const g = Array.from({ length: h }, () => Array(w).fill('water'));
  const set = (x, y, k) => { if (x >= 0 && y >= 0 && x < w && y < h) g[y][x] = k; };
  const get = (x, y) => (x >= 0 && y >= 0 && x < w && y < h ? g[y][x] : 'water');
  const rect = (x0, y0, x1, y1, k) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, k); };
  // land
  rect(1, 6, 61, 43, 'grass');
  rect(42, 1, 61, 5, 'grass');
  // ragged coasts
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (get(x, y) !== 'grass') continue;
    const edge = ['water'].includes(get(x - 1, y)) || get(x + 1, y) === 'water' || get(x, y - 1) === 'water' || get(x, y + 1) === 'water';
    if (edge && hash(x, y, 3) < 0.3) set(x, y, 'water');
  }
  rect(0, 0, 1, h - 1, 'water');
  // the desert and the southern coast
  rect(1, 20, 25, 39, 'sand');
  for (let y = 20; y < 40; y++) for (let x = 1; x < 26; x++) if (get(x, y) === 'water') set(x, y, 'water');
  // the river and the lake
  rect(40, 10, 41, 26, 'water');
  for (let y = 27; y <= 38; y++) for (let x = 30; x <= 46; x++) { const dx = (x - 38) / 8.5, dy = (y - 32.5) / 6; if (dx * dx + dy * dy < 1.15 || x < 33) set(x, y, 'water'); }
  rect(36, 32, 39, 34, 'grass');
  rect(40, 33, 46, 33, 'bridge');
  // the bridge over the river near Varn
  rect(40, 14, 41, 14, 'bridge');
  // mountains, in 2x2 blocks
  const mount = (x0, y0, x1, y1, k = 'mount') => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, k); };
  mount(2, 6, 47, 9);
  mount(2, 18, 25, 19, 'dmount');
  mount(26, 18, 29, 43);
  mount(42, 20, 61, 21);
  mount(30, 42, 61, 43);
  for (const [x, y] of [[8, 24], [18, 22], [20, 32], [6, 34], [14, 36], [22, 26]]) mount(x, y, x + 1, y + 1, 'dmount');
  for (const [x, y] of [[48, 8], [58, 6], [46, 16], [56, 26], [58, 36], [34, 12], [10, 12]]) mount(x, y, x + 1, y + 1);
  // the Thorn Spire island
  rect(52, 44, 59, 46, 'grass');
  // woods
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (get(x, y) !== 'grass') continue;
    const r = hash(x, y, 11);
    const nearThornby = Math.abs(x - 54) + Math.abs(y - 13) < 7;
    if (nearThornby && r < 0.62) set(x, y, 'forest');
    else if (r < 0.14 && hash(x >> 2, y >> 2, 5) < 0.55) set(x, y, 'forest');
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (get(x, y) === 'sand' && hash(x, y, 13) < 0.05) set(x, y, 'scrub');
  // ---- the lands of Part II, out past the old maps' edges ----
  const blob = (x0, y0, x1, y1, k, seed) => {
    rect(x0, y0, x1, y1, k);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const edge = x === x0 || x === x1 || y === y0 || y === y1;
      if (edge && hash(x, y, seed) < 0.45) set(x, y, 'water');
    }
  };
  const pool = (cx, cy, rx, ry, k) => { for (let y = cy - ry; y <= cy + ry; y++) for (let x = cx - rx; x <= cx + rx; x++) { const dx = (x - cx) / (rx + 0.4), dy = (y - cy) / (ry + 0.4); if (dx * dx + dy * dy < 1) set(x, y, k); } };
  // Hollowmere, the grey north
  blob(68, 3, 91, 19, 'snow', 21);
  for (let y = 4; y < 19; y++) for (let x = 69; x < 91; x++) { const r = hash(x, y, 22); if (get(x, y) === 'snow' && r < 0.22) set(x, y, r < 0.06 ? 'snowpine' : 'snowforest'); }
  for (const [x, y] of [[72, 5], [88, 12], [75, 16], [82, 4], [90, 8]]) mount(x, y, x + 1, y + 1, 'snowmount');
  pool(84, 15, 2, 1, 'ice');
  blob(82, 23, 86, 27, 'snow', 23);
  // Emberfall, the burning isle
  blob(70, 41, 89, 57, 'cinder', 31);
  pool(76, 46, 2, 1, 'lava'); pool(85, 53, 2, 2, 'lava'); pool(73, 54, 1, 1, 'lava');
  for (const [x, y] of [[72, 43], [86, 44], [81, 42], [77, 55], [88, 48]]) mount(x, y, x + 1, y + 1, 'ashrock');
  // Mirefen, the southern swamp
  blob(6, 50, 49, 61, 'swampgrass', 41);
  for (let y = 51; y < 61; y++) for (let x = 7; x < 49; x++) { const r = hash(x, y, 42); if (get(x, y) !== 'swampgrass') continue; if (r < 0.1) set(x, y, 'swamp'); else if (r < 0.3) set(x, y, 'swampforest'); }
  pool(30, 54, 3, 1, 'swamp'); pool(12, 58, 1, 1, 'swamp');
  // the old road from Varn to the cave
  const road = (pts) => { for (let i = 0; i < pts.length - 1; i++) { let [x, y] = pts[i]; const [x1, y1] = pts[i + 1]; while (x !== x1 || y !== y1) { if (get(x, y) !== 'water' && get(x, y) !== 'bridge') set(x, y, 'road'); if (x !== x1) x += Math.sign(x1 - x); else y += Math.sign(y1 - y); } set(x1, y1, 'road'); } };
  road([[22, 14], [22, 15], [27, 15], [30, 15], [30, 11]]);
  road([[27, 14], [39, 14]]);
  road([[44, 5], [50, 5]]);
  // places
  const P = WORLD;
  const place = (key, k) => set(P[key][0], P[key][1], k);
  place('C', 'i_castle'); place('T', 'i_town'); place('M', 'i_cave'); place('m', 'i_cave'); place('G', 'i_castle');
  place('H', f.thornby_burned ? 'i_ruin' : 'i_town'); place('w1', 'i_cave'); place('w2', 'i_cave'); place('W', 'i_town'); place('S', 'i_shrine');
  place('P', 'i_cave'); place('p', 'i_dcave'); place('X', 'i_dcastle'); place('K', 'i_port'); place('R', 'i_tower');
  place('Sf', 'i_temple'); place('Gw', 'i_gear'); place('Rh', 'i_mtown'); place('Dg', 'i_mcave'); place('Bl', 'i_snowtown'); place('Bt', 'i_bell');
  if (f.p2_bell) place('Ps', 'i_pale');
  // a clear step below every Part II place, and the buried treasure spots stay plain ground
  for (const k of ['Sf', 'Gw', 'Rh', 'Dg', 'Bl', 'Bt', 'Ps']) { const [x, y] = P[k]; const b = get(x, y + 1); if (['swamp', 'water', 'lava', 'ice', 'snowpine', 'snowforest', 'swampforest', 'ashrock', 'snowmount', 'mount', 'dmount', 'scrub'].includes(b)) set(x, y + 1, y > 40 && x < 60 ? 'swampgrass' : y > 30 && x > 60 ? 'cinder' : x > 60 ? 'snow' : 'sand'); }
  for (const [[x, y]] of DIG) { const b = get(x, y); if (!['grass', 'sand', 'snow', 'cinder', 'swampgrass'].includes(b)) set(x, y, x > 60 && y < 30 ? 'snow' : x > 60 ? 'cinder' : y >= 48 ? 'swampgrass' : y >= 20 && x <= 25 ? 'sand' : 'grass'); }
  // clear a step around each place
  for (const [x, y] of Object.values(P)) for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { const k = get(x + dx, y + dy); if (k === 'forest') set(x + dx, y + dy, 'grass'); }
  const ents = [];
  const wp = (key, to, tx, ty, dir = 'u', need, msg) => ents.push({ type: 'warp', x: P[key][0], y: P[key][1], to, tx, ty, dir, need, msg });
  wp('C', 'varncastle', 11, 21, 'u'); wp('T', 'varn', 15, 21, 'u'); wp('M', 'mossway', 4, 21, 'u'); wp('m', 'mossway', 26, 2, 'd');
  wp('G', 'grayhold', 10, 13, 'u'); wp('H', 'thornby', 12, 19, 'u', (fl) => fl.grayhold_done, () => L('荊棘村被濃密的荊棘圍住了，外人進不去。', 'Thornby is ringed by dense thorns. Outsiders cannot enter.')); wp('w1', 'thornwood', 15, 1, 'd', (fl) => fl.ch2_nyra, () => L('荊棘林的樹枝纏得密不透風。', 'The branches of Thornwood are knotted shut.')); wp('w2', 'thornwood', 15, 28, 'u');
  wp('W', 'wenmere', 1, 12, 'r'); wp('S', 'shrine', 13, 25, 'u', (fl) => fl.has_miel, () => L('神殿的門緊緊關著。也許文湖鎮的人知道怎麼進去。', 'The shrine doors are shut fast. Someone in Wenmere may know the way in.')); wp('P', 'drypass', 26, 9, 'l', (fl) => fl.tide_dead, () => L('隘道口被落石堵住了。', 'Fallen rocks block the mouth of the pass.')); wp('p', 'drypass', 1, 9, 'r');
  wp('X', 'salt', 15, 23, 'u'); wp('K', 'kestrel', 15, 1, 'd'); wp('R', 'spire1', 9, 18, 'u');
  const shut = (zh, en) => () => L(zh, en);
  wp('Sf', 'sunfire1', 13, 19, 'u', (fl) => fl.p2_sigil, shut('神殿的大門刻著太陽的紋章，緊緊關著。', 'The temple doors bear a sun crest and will not open.'));
  wp('Gw', 'gearworks1', 15, 19, 'u', (fl) => fl.p2_gwopen, shut('生鏽的鐵門鎖住了。門上刻著「柯溫」。', 'A rusted iron door, locked. "Corwin" is carved on it.'));
  wp('Rh', 'reedholm', 13, 17, 'u');
  wp('Dg', 'grotto1', 13, 19, 'u');
  wp('Bl', 'belltoll', 13, 16, 'u');
  wp('Bt', 'belltower1', 13, 19, 'u', (fl) => fl.p2_belltoll, shut('鐘樓的門被冰封住了。先去鐘鳴村看看吧。', 'Ice seals the tower door. See the village first.'));
  if (f.p2_bell) wp('Ps', 'pale1', 13, 19, 'u', (fl) => fl.p2_bell);
  // the closed bridge
  if (!f.bridge_open) ents.push({ type: 'npc', id: 'bridgeguard', sprite: 'soldier0', x: 41, y: 14, dir: 'l', talk: 'bridgeguard', fixed: true });
  return {
    w, h, kindAt: (x, y) => g[y][x], ents, world: true,
    // the grey mist keeps the airship off the new lands until their time
    noLand(x, y) {
      if ((x >= 64 || y >= 48) && !f.p2) return L('濃濃的灰霧籠罩著大地，看不清地面，無法降落。', 'A thick grey mist hides the ground. You cannot land.');
      if (x >= 64 && y < 30 && !f.p2_sky) return L('北方的島嶼被灰霧團團圍住，鷦鷯號無法穿過。', 'Grey mist walls in the northern isles. The Wren cannot get through.');
      return null;
    },
    zone(x, y) {
      if (x >= 64 && y < 30) return 'snow';
      if (x >= 64) return 'ember';
      if (y >= 48) return 'mire';
      if (f.p2) return x <= 25 && y >= 20 && y < 40 ? 'ddesert' : 'p2world';
      if (f.spire_done) return 'world2';
      if (x <= 25 && y >= 40) return 'coast';
      if (x <= 25 && y >= 20) return 'desert';
      if (x >= 42 && y <= 19) return 'hills';
      if (x >= 42 && y >= 22) return 'lake';
      if (x >= 30 && y >= 39) return 'lake';
      if (y >= 44) return 'coast';
      return 'plains';
    },
  };
}
def('world', { name: null, music: 'world', world: true, build: worldBuild, bg: 'plains' });

// =====================================================================================
// Varn castle
// =====================================================================================
def('varncastle', {
  name: nm('瓦恩城', 'Castle Varn'), music: 'empire', safe: true,
  build: (f) => grid([
    'QQQQQQQQQQQQQQQQQQQQQQQQ',
    'QjQQQjQQjQQQQQQjQQjQQQjQ',
    'Q+e++xQQbbbb1bbbQQbbbb9Q',
    f.well_open ? 'Q+++++QQbIb]0]bIQQbbbbbQ' : 'Q+++++QQbIb]]]bIQQbbbbbQ',
    'Q++c++QQbbb]]]bbQQbbbCbQ',
    'Q+++++QQbIb]]]bIQQbbbbbQ',
    f.p2_brin ? 'Q+++++QQbbb]]]bbQQ^bbbbQ' : 'Q+++++QQbbb]]]bbQQbbbbbQ',
    'QQQbQQQQbIb]]]bIQQQQbQQQ',
    'QbbbbbbQQQQ]]]QQQQbbbbbQ',
    'Qbbb3bbbbbb]]]bbbbbb4bbQ',
    'QbbbbbbbbbbbbbbbbbbbbbbQ',
    'QSbbbbbbbbbbbbbbbbbbbbSQ',
    'QQQQQQQQQQQbbQQQQQQQQQQQ',
    'WWWWWWWWWW.==.WWWWWWWWWW',
    'W....T....5==......T...W',
    'W.B.......====.......B.W',
    'W.........====6........W',
    'W..t...L..====..L...t..W',
    'W.........====.........W',
    'W..*.*....====....*.*..W',
    'W.....7...====.........W',
    'W.T.......====.......T.W',
    'WWWWWWWWWWW<<WWWWWWWWWWW',
  ], {
    '1': { k: 'bluefloor', e: (x, y) => [{ type: 'npc', id: 'king', sprite: 'king', x, y, dir: 'd', talk: 'king', cond: (f) => !f.ch1_done || f.spire_done }, { type: 'npc', id: 'morvane', sprite: 'morvane', x: x + 2, y: y + 1, dir: 'd', talk: 'morvane_hall', cond: (f) => !f.ch1_done }] },
    '9': save('bluefloor'),
    '0': warp('bstairs', 'well1', 11, 2, 'd'),
    '^': warp('bstairs', 'barracks1', 13, 19, 'u', { need: (fl) => fl.p2_brin, msg: () => L('兵營的門鎖著。', 'The barracks door is locked.') }),
    'c': chest('plank', 'vc_room', 'potion', 3),
    'C': chest('bluefloor', 'vc_store', 'phoenix', 1),
    '3': npc('bluefloor', 'maid', 'mychars5', 'c_maid', { wander: true }),
    '4': npc('bluefloor', 'castle_guard', 'soldier0', 'c_guard'),
    '5': npc('grass', 'yard_guard', 'soldier0', 'c_yard'),
    '6': npc('dirt', 'brin_yard', 'soldier3', 'brin_yard', { cond: (f) => !f.ch1_done }),
    '7': npc('grass', 'gardener', 'd_oldman', 'c_gardener', { wander: true }),
    '<': warp('dirt', 'world', 22, 14, 'd'),
  }, { id: 'varncastle' }),
});
// under the throne: the Starwell
def('well1', {
  name: nm('燼井　上層', 'The Starwell, Upper'), music: 'deities', dark: 0.5,
  build: () => grid([
    '&&&&&&&&&&&&&&&&&&&&&&&&',
    '&&&&&&&&&&&<&&&&&&&&&&&&',
    '&&&&&&&&&&&o&&&&&&&&&&&&',
    '&&&&&ooooooooooooo&&&&&&',
    '&&&&&o&&&&&&&&&&&o&&&&&&',
    '&&oooo&&ooooooo&&oooooo&',
    '&&o&&&&&o&&&&&o&&&&&&&o&',
    '&&o&&ooooo&1&&o&&ooooo&&',
    '&&o&&o&&&&&o&&ooo&&&&o&&',
    '&&ooooo&&oooooo&o&&&&o&&',
    '&&&&&&o&&o&&&&o&oooooo&&',
    '&&ooooo&&o&zz&o&&&&&&&&&',
    '&&o&&&&&&o&9&&ooooooo&&&',
    '&&o&ooooooooo&&&&&&&o&&&',
    '&&o&o&&&&&&&o&&&&&&&o&&&',
    '&&ooo&&ooooooooooooooooo',
    '&&&&&&&o&&&&&&&&&&&&&&&o',
    '&&&ooooo&&&&2&&&&&ooooo&',
    '&&&o&&&&&&&&o&&&&&o&&&&&',
    '&&&o&&&ooooooooo&&o&&&&&',
    '&&&ooooo&&&&&&&ooooo&&&&',
    '&&&&&&&&&&&&&&&&&&&&&&&&',
  ], {
    '<': warp('darkrock', 'varncastle', 12, 3, 'd'),
    '1': chest('darkrock', 'w1_a', 'starweave'),
    '2': warp('darkrock', 'well2', 12, 2, 'd'),
    '9': save('darkrock'),
  }, { id: 'well1', zone: () => 'well', dark: 0.5 }),
});
def('well2', {
  name: nm('燼井　深處', 'The Starwell, Depths'), music: 'deities', dark: 0.35,
  build: (f) => grid([
    '&&&&&&&&&&&&&&&&&&&&&&&&',
    '&&&&&&&&&&&&<&&&&&&&&&&&',
    '&&&&&&&&&&&&o&&&&&&&&&&&',
    '&&&&ooooooooooooooooo&&&',
    '&&&&o&&&&&&&&&&&&&&&o&&&',
    '&&&&oooooooooooooo&&o&&&',
    '&&&&o&&o&&&&&&&&&o&&o&&&',
    '&&1oo&&o&&&zzz&&&o&&oo3&',
    '&&&&&&&o&&&ooo&&&o&&&&&&',
    '&&&&&&&ooooo9ooooo&&&&&&',
    '&&&&&&&&&&&ooo&&&&&&&&&&',
    '&&&&&&&&&&&444&&&&&&&&&&',
    '&&&&&&&&&ooo6ooo&&&&&&&&',
    '&&&&&&&&&ooooooo&&&&&&&&',
    '&&&&&&&&&ooo5ooo&&&&&&&&',
    f.cleared ? '&&&&&&&&&ooo^ooo&&&&&&&&' : '&&&&&&&&&ooooooo&&&&&&&&',
    '&&&&&&&&&&&&&&&&&&&&&&&&',
  ], {
    '^': warp('bstairs', 'abyss1', 15, 21, 'u'),
    '<': warp('darkrock', 'well1', 12, 18, 'd'),
    '1': chest('darkrock', 'w2_a', 'oathkeeper'),
    '3': chest('darkrock', 'w2_b', 'ribbon'),
    '9': save('darkrock'),
    '4': trig('darkrock', 'morvane_final', { once: 'morvane_dead' }),
    '6': npc('darkrock', 'morvane_w', 'morvane', 'morvane_final', { dir: 'u', fixed: true, cond: (fl) => !fl.morvane_dead }),
    '5': { k: 'darkrock', e: { type: 'npc', id: 'heart', sprite: null, talk: null, cond: () => true } },
  }, { id: 'well2', zone: (x, y) => (y < 10 ? 'well' : null), dark: 0.35 }),
});

// =====================================================================================
// the town of Varn
// =====================================================================================
def('varn', {
  name: nm('瓦恩城下町', 'Varn Town'), music: 'town', safe: true,
  build: () => grid([
    '..T.......T....==.....T......T..',
    '.RRRRR..........==..........RRR.',
    '.RRRRR..RRRRRR..==..RRRRRR..RRR.',
    '.#w#d#..RRRRRR..==..RRRRRR..#d#.',
    '..._....#w#d#w..==..#w#d##......',
    '...=......._....==....._........',
    '...=========....==.....=........',
    '..........=.....==.....=====....',
    '.T........========.........=..T.',
    '..........=..1....=.....kkk.=...',
    '.....F.F..=.......=.....+2+.=...',
    '..........=..L....=...........,.',
    '..RRRRR...=.......=....RRRRRR...',
    '..RRRRR...=...3...=....RRRRRR...',
    '..#w#d#...=.......=....#w#d#w...',
    '.....=....==========.......=....',
    '.....=====...4....=========.....',
    '..t.......kkk...................',
    '..........+5+.........6.....T...',
    '.....L.............L............',
    '..T.......=........=.......t....',
    '..........==========............',
    '...............<<...............',
  ], {
    '1': npc('grass', 'v_child', 'd_spiky', 'v_child', { wander: true }),
    '2': npc('plank', 'v_shop', 'bard2', 'v_shop', { fixed: true, dir: 'd' }),
    '3': npc('grass', 'v_woman', 'bard1', 'v_woman', { wander: true }),
    '4': npc('grass', 'v_old', 'd_oldman', 'v_old'),
    '5': npc('plank', 'v_inn', 'mychars4', 'v_inn', { fixed: true, dir: 'd' }),
    '6': npc('grass', 'v_soldier', 'soldier0', 'v_soldier', { wander: true }),
    '<': warp('grass', 'world', 26, 15, 'd'),
  }, { id: 'varn' }),
});

// =====================================================================================
// Mossway Cave
// =====================================================================================
def('mossway', {
  name: nm('苔道洞窟', 'Mossway Cave'), music: 'dungeon',
  build: (f) => grid([
    '&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&',
    '&&&&&&&&&&&&&&&&&&&&&&&&&&<&&&',
    '&&&&&&&&&&&&&&&&&&&&&&&&&&_&&&',
    '&&&&&&&&&&&&&&&&&&&&&&&&&&_&&&',
    '&&&&&__1___&&&&&&&&&______B__&',
    '&&&&&_&&&&_&&&&&&&&&_&&&&&&&&&',
    '&&&&&_&&&&____&&&&&&_&&&&&&&&&',
    '&&&&&_&&&&&&&_&&&&&&_&&&&&&&&&',
    '&&_____&&&&&&_______9&&&&&&&&&',
    '&&_&&&_&&&&&&_&&&&&&&&&&&&&&&&',
    '&&_&&&______&_&&&&_____2&&&&&&',
    '&&_&&&&&&&&_&_&&&&_&&&&&&&&&&&',
    '&&_&&&&&&&&___&&&&_&&&&&&&&&&&',
    '&&______&&&&&_______&&&&&&&&&&',
    '&&&&&&&_&&&&&_&&&&&_______&&&&',
    '&&&&&&&_&&&&&_&&&&&&&&&&&_&&&&',
    '&&&_____&&&&&_&&&&&&&&&&&_&&&&',
    '&&&_&&&&&&&&&____&&&&&3___&&&&',
    '&&&_&&&&&&&&&&&&_&&&&&&&&&&&&&',
    '&&&_&&&&&&&&&&&&_&&&&&&&&&&&&&',
    '&&&____&&&&&&&&&_&&&&&&&&&&&&&',
    '&&&&_&&&&&&&&&&&&&&&&&&&&&&&&&',
    '&&&&>&&&&&&&&&&&&&&&&&&&&&&&&&',
  ], {
    '<': warp('earth', 'world', 44, 5, 'd'),
    '>': warp('earth', 'world', 30, 11, 'd'),
    '1': chest('earth', 'mw_a', 'potion', 2),
    '2': chest('earth', 'mw_b', 'ironsword'),
    '3': chest('earth', 'mw_c', 'phoenix'),
    '9': save('earth'),
    'B': trig('earth', 'mossmaw', { once: 'mossmaw_dead' }),
  }, { id: 'mossway', zone: () => 'mossway', dark: 0.45 }),
});

// =====================================================================================
// Grayhold, the hill fort
// =====================================================================================
def('grayhold', {
  name: nm('灰岩堡', 'Grayhold'), music: 'empire',
  build: (f) => grid([
    'XXXXXXXXXXXXXXXXXXXX',
    'XjXXXXXXjXXjXXXXXXjX',
    f.p2 ? 'Xcccccccccc^cccccccX' : 'Xcccccccccc1cccccccX',
    'XcIcccccccccccccIccX',
    'Xcccc2cc[[[[cc3ccccX',
    'XcIccccc[[[[ccccIccX',
    'Xcccccccc[[ccccccccX',
    'XXXXXXXXcccXXXXXXXXX',
    '...........c........',
    '.....T.....c...T....',
    '...........c........',
    '.L..x......c.....L..',
    '...........c........',
    '.T.........c......T.',
    '.........<<<........',
  ], {
    '1': npc('cobble', 'garrick', 'soldier6', 'garrick', { cond: (f) => !f.grayhold_done }),
    '2': npc('cobble', 'gh_soldier1', 'ashguard', 'gh_soldier', { cond: (f) => !f.grayhold_done }),
    '3': npc('cobble', 'gh_soldier2', 'ashguard', 'gh_soldier', { cond: (f) => !f.grayhold_done }),
    '<': warp('grass', 'world', 50, 5, 'd'),
    '^': warp('stairs', 'keep1', 13, 19, 'u', { need: (fl) => fl.p2_wind, msg: () => L('通往內城的樓梯被荊棘堵住了。', 'Thorns choke the stairs to the keep.') }),
  }, { id: 'grayhold' }),
});

// =====================================================================================
// Thornby, the village of the callers
// =====================================================================================
def('thornby', {
  name: nm('荊棘村', 'Thornby'), music: 'prelude',
  build: (f) => {
    const burnt = f.thornby_burned;
    const rows = [
      '$$$$$$$$$$$$$$$$$$$$$$$$$$',
      '$$$$$$$$$$$BB$$$$$$$$$$$$$',
      '$$$$$$$$$$$BB$$$$$$$$$$$$$',
      '$$$.......;;.;.......$$$$$',
      '$$...RRRR..;;...RRRR...$$$',
      '$$...RRRR..;;...RRRR...$$$',
      '$$...#w7#..;;...#d##...$$$',
      '$$.........;;..........$$$',
      '$$..T......1;......T...$$$',
      '$$.........;;..........$$$',
      '$$...RRRR..;;...RRRR...$$$',
      '$$...RRRR..;;...RRRR...$$$',
      '$$...##d#..;;...#w7#.2.$$$',
      '$$.........;;..........$$$',
      '$$..u...........G..u...$$$',
      '$$......3..............$$$',
      '$$$.......;;;;.....9...$$$',
      '$$$$.....;;;;;;......$$$$$',
      '$$$$$....;;;;;;.....$$$$$$',
      '$$$$$$$...;;;;...$$$$$$$$$',
      '$$$$$$$$$..<<..$$$$$$$$$$$',
    ];
    const lg = {
      '1': trig('leafy', 'thornby_fire', { once: 'thornby_fire_seen', need: (fl) => fl.grayhold_done && !fl.ch2_nyra }),
      '2': npc('grass', 'tb_elder', 'd_oldman', 'tb_elder', { cond: (fl) => fl.trial_open && !fl.dawn, ghost: true }),
      '3': npc('grass', 'tb_ghost', 'bard5', 'tb_ghost', { cond: (fl) => fl.ch2_nyra, ghost: true }),
      '9': save('grass'),
      '<': warp('leafy', 'world', 54, 14, 'd'),
      'B': { k: 'bigtree', e: { type: 'sign', talk: 'elder_tree' } },
      '7': 'sdoor',
    };
    if (burnt) {
      Object.assign(lg, { '.': 'ash', ';': 'earth', 'R': 'ash', '#': 'darkbrick', 'w': 'darkbrick', 'd': 'ash', 'T': 'burnt', 'u': 'burnt', 'G': 'grave', '7': 'darkbrick' });
      lg['1'] = trig('earth', 'thornby_fire', { once: 'thornby_fire_seen', need: (fl) => fl.grayhold_done && !fl.ch2_nyra });
      lg['2'] = npc('ash', 'tb_elder', 'd_oldman', 'tb_elder', { cond: (fl) => fl.trial_open && !fl.dawn, ghost: true });
      lg['3'] = npc('ash', 'tb_ghost', 'bard5', 'tb_ghost', { cond: (fl) => fl.ch2_nyra, ghost: true });
      lg['9'] = save('ash');
      lg['<'] = warp('earth', 'world', 54, 14, 'd');
    }
    return grid(rows, lg, { id: 'thornby', tint: burnt && !f.dawn ? 'rgba(120,20,0,0.18)' : null });
  },
});

// =====================================================================================
// Thornwood
// =====================================================================================
def('thornwood', {
  name: nm('荊棘林', 'Thornwood'), music: 'dungeon',
  build: () => grid([
    '@@@@@@@@@@@@@@@<@@@@@@@@@@@@@@@@',
    '@@@@@@@@@@@@@@@.@@@@@@@@@@@@@@@@',
    '@@@@@@@@@.......;..@@@@@@@@@@@@@',
    '@@@@@@@@@.@@@@@@@..@@@@@@@@@@@@@',
    '@@@@1....;@@@@@@@@.......@@@@@@@',
    '@@@@@@@@.@@@@@@@@@@@@@@..@@@@@@@',
    '@@@@@@@@.@@@@@@......@@@.@@@@@@@',
    '@@@@@@@@..;.........;@@@...2@@@@',
    '@@@@@@@@@@@@@@@@.@@@@@@@@@@@@@@@',
    '@@@@@@@@@@@@@@@@.@@@@@@@@@@@@@@@',
    '@@@@@@......;.....@@@@@@@@@@@@@@',
    '@@@@@@.@@@@@@@@@@.@@@@@@@@@@@@@@',
    '@@@@@@.@@@@@@@@@@.........@@@@@@',
    '@@@@@@.@@@@@@@@@@@@@@@@@@.@@@@@@',
    '@@@@@@...;...9@@@@@@@@@@@.@@@@@@',
    '@@@@@@@@@@@@.@@@@@@@@@@@@.@@@@@@',
    '@@@@@@@@@@@@.@@@@......;...@@@@@',
    '@@@@@@@@@@@@.@@@@.@@@@@@@@@@@@@@',
    '@@@@@@@3.....@@@@.@@@@@@@@@@@@@@',
    '@@@@@@@@@@@@.@@@@......@@@@@@@@@',
    '@@@@@@@@@@@@.......@@@.@@@@@@@@@',
    '@@@@@@@@@@@@@@@@@@.@@@.@@@@@@@@@',
    '@@@@@@@@@@@@@@@@@@.@@@.....4@@@@',
    '@@@@@@@@@@@@@@@...;@@@@@@@@@@@@@',
    '@@@@@@@@@@@@@@@.@@@@@@@@@@@@@@@@',
    '@@@@@@@@@@@@@@@.@@@@@@@@@@@@@@@@',
    '@@@@@@@@@@@@@@@.@@@@@@@@@@@@@@@@',
    '@@@@@@@@@@@@@@@.@@@@@@@@@@@@@@@@',
    '@@@@@@@@@@@@@@@.@@@@@@@@@@@@@@@@',
    '@@@@@@@@@@@@@@@>@@@@@@@@@@@@@@@@',
  ], {
    '<': warp('grass', 'world', 52, 18, 'd'),
    '>': warp('grass', 'world', 52, 23, 'd'),
    '1': chest('grass', 'tw_a', 'hipotion'),
    '2': chest('grass', 'tw_b', 'firerod'),
    '3': chest('grass', 'tw_c', 'magerobe'),
    '4': chest('grass', 'tw_d', 'ether'),
    '9': save('grass'),
  }, { id: 'thornwood', zone: () => 'thornwood' }),
});

// =====================================================================================
// Wenmere, the lake town
// =====================================================================================
def('wenmere', {
  name: nm('文湖鎮', 'Wenmere'), music: 'town', safe: true,
  build: () => grid([
    '..T.....QQQQQQQQQQQQ......T.....',
    '........QjQQQ]]QQQjQ............',
    '..RRRR..QbbIb]]bIbbQ...RRRR.....',
    '..RRRR..Qbbbb]]bb1bQ...RRRR.....',
    '..#d##..QbbIb]]bIbbQ...#w#d.....',
    '...=....QQQQQ]]QQQQQ......=.....',
    '...=.........==...........=.....',
    '...===========================..',
    '.T.....=.........=...........=..',
    '.......=..kkk....=....2......=.T',
    '.......=..+3+....=...........=..',
    '..L....=.........=...L.......=..',
    '<===============================',
    '..........=......=........=.....',
    '..RRRRR...=..4...=...kkk..=.....',
    '..RRRRR...=......=...+5+..=..T..',
    '..#w#d#...=......=........=.....',
    '..........=..*.*.=...6....=.....',
    '...T......=......=........=.....',
    '~~~~~~~~~~+~~~~~~+~~~~~~~~+~~~~~',
    '~~~~~~~~~~+~~~~~~+~~~~~~~~+~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  ], {
    '1': npc('bluefloor', 'prioress', 'devout3', 'w_prioress', { fixed: true }),
    '2': npc('grass', 'miel_w', 'devout1', 'w_miel', { cond: (f) => !f.has_miel }),
    '3': npc('plank', 'w_shop', 'scout2', 'w_shop', { fixed: true, dir: 'd' }),
    '4': npc('grass', 'gowan_w', 'conjurer2', 'w_gowan', { cond: (f) => !f.has_gowan }),
    '5': npc('plank', 'w_inn', 'bard0', 'w_inn', { fixed: true, dir: 'd' }),
    '6': npc('grass', 'w_fisher', 'scout6', 'w_fisher', { wander: true }),
    '<': warp('dirt', 'world', 48, 30, 'l'),
  }, { id: 'wenmere' }),
});
def('shrine', {
  name: nm('沉沒神殿', 'The Sunken Shrine'), music: 'sanctuary',
  build: (f) => grid([
    'QQQQQQQQQQQQQQQQQQQQQQQQQQQ',
    'QjQQQQQQQQQQjQQQQQQQQQQQjQQ',
    f.p2 ? 'Q~~~~~~~~~~^qq~~~~~~~~~~~qQ' : 'Q~~~~~~~~~~qqq~~~~~~~~~~~qQ',
    'Q~qqqqqqq~~qBq~~qqqqqqqq~qQ',
    'Q~q~~~~~q~~qqq~~q~~~~~~q~qQ',
    'Q~q~1qq~q~~~q~~~q~qqq2~q~qQ',
    'Q~q~~~q~q~~~q~~~q~q~~~~q~qQ',
    'Q~q~~~q~qqqqqqqqq~q~~~~q~qQ',
    'Q~qqqqq~~~~~~~~~~~qqqqqq~qQ',
    'Q~~~~~q~~~~~9~~~~~~~~~~~~qQ',
    'Q~~~~~qqqqqqqqqqqqqqqqqqqqQ',
    'Q~~~~~~~~~~~q~~~~~~~~~~~~~Q',
    'Q~qqqqqqqqqqqqqqqqqqqqqq~~Q',
    'Q~q~~~~~~~~~~~~~~~~~~~~q~~Q',
    'Q~q~qqqqqqqqqqqqqqqqqq~q~~Q',
    'Q~q~q~~~~~~~~~~~~~~~~q~q~~Q',
    'Q~q~q~qqqqqqqqqqqqq~~q~q~~Q',
    'Q~q~q~q~~~~~3~~~~~q~~q~q~~Q',
    'Q~qqq~q~~~~~~~~~~~q~~qqq~~Q',
    'Q~~~~~q~~~~~~~~~~~qqqq~~~~Q',
    'Q~~~~~qqqqqqqq~~~~~~~~~~~~Q',
    'Q~~~~~~~~~~~~q~~~~~~~~~~~~Q',
    'Q~~~~~~~~~~~~q~~~~~~~~~~~~Q',
    'Q~~~~~~~~~~~~q~~~~~~~~~~~~Q',
    'Q~~~~~~~~~~~~q~~~~~~~~~~~~Q',
    'QQQQQQQQQQQQQqQQQQQQQQQQQQQ',
    'QQQQQQQQQQQQQ<QQQQQQQQQQQQQ',
  ], {
    '<': warp('bluetile', 'world', 37, 34, 'd'),
    '^': warp('bstairs', 'cloister1', 13, 19, 'u'),
    '1': chest('bluetile', 'sh_a', 'icerod'),

    '2': chest('bluetile', 'sh_b', 'hipotion', 2),
    '3': chest('bluetile', 'sh_c', 'healstaff'),
    '9': save('bluetile'),
    'B': trig('bluetile', 'tidewyrm', { once: 'tide_dead' }),
  }, { id: 'shrine', zone: () => 'shrine' }),
});

// =====================================================================================
// Dry Pass and the kingdom of Salt
// =====================================================================================
def('drypass', {
  name: nm('乾谷隘道', 'Dry Pass'), music: 'dungeon',
  build: () => grid([
    '&&&&&&&&&&&&&&&&&&&&&&&&&&&&',
    '&&&&&&&&&&&&&&&&&&&&&&&&&&&&',
    '&&&&OOOOOO&&&&&&&OOOOO1&&&&&',
    '&&&&O&&&&O&&&&&&&O&&&&&&&&&&',
    '&&&&O&&&&OOOOOOOOO&&&&&&&&&&',
    '&&&&O&&&&&&&&O&&&&&&&&&&&&&&',
    '&&&&OOO&&&&&&O&&&&OOOOOOO&&&',
    '&&&&&&O&&&&&&OOOOOO&&&&&O&&&',
    '&&&&&&O&&&&&&&&&&&&&&&&&O&&&',
    '<OOOOOOOOOOOO9&&&&&&&&&&OOO>',
    '&&&&&&&&&&&&&O&&&&&&&&&&&&&&',
    '&&&&&&&&OOOOOO&&&&&&&&&&&&&&',
    '&&&&&&&&O&&&&&&&&&2&&&&&&&&&',
    '&&&&&&&&OOOOOOOOOOO&&&&&&&&&',
    '&&&&&&&&&&&&&&&&&&&&&&&&&&&&',
  ], {
    '<': warp('rockfloor', 'world', 24, 40, 'l'),
    '>': warp('rockfloor', 'world', 31, 40, 'r'),
    '1': chest('rockfloor', 'dp_a', 'traveler'),
    '2': chest('rockfloor', 'dp_b', 'ether'),
    '9': save('rockfloor'),
  }, { id: 'drypass', zone: () => 'pass', dark: 0.3 }),
});
def('salt', {
  name: nm('沙爾特王國', 'The Kingdom of Salt'), music: 'courtesan', safe: true,
  build: () => grid([
    'ssssssYYYYYYYYYYYYYYYYYYYsssssss',
    'ssssssYYYYYYYYYYYYYYYYYYYsssssss',
    'ssssssYqqqqqqqq1qqqqqqqqYsssssss',
    'ssssssYqIqqqqq[[[qqqqqIqYsssssss',
    'ssssssYqqqqq2q[[[q3qqqqqYsssssss',
    'ssssssYqIqqqqq[[[qqqqqIqYsssssss',
    'ssssssYqqqqqqq[[[qqqqqqqYsssssss',
    'ssssssYYYYYYYYq[qYYYYYYYYsssssss',
    'sssssssssssssss=ssssssssssssssss',
    'ssRRRRsssssssss=ssssssssRRRRRsss',
    'ssRRRRsssssssss=ssssssssRRRRRsss',
    'ss#d##sssssssss=ssssssss#w#d#sss',
    'sss=sssssssssss=sssssssssss=ssss',
    'sss=============================',
    'ssssssskkksssss=ssssskkksssssss',
    'sssssss+4+sssss=sssss+5+ssssss',
    'sssssssssssssss=ssssssssssssssss',
    'ssLssssssssssss=ssssssssssssLsss',
    'sssssss6sssssss=sssssssssssssss',
    'sssssssssssssss=sssssss7ssssssss',
    'sssssssssssssss=ssssssssssssssss',
    'sssssssssssssss=ssssssssssssssss',
    'sssssssssssssss=ssssssssssssssss',
    'sssssssssssssss=ssssssssssssssss',
    'ssssssssssssss<<<sssssssssssssss',
  ].map((r) => r.padEnd(32, 's')), {
    '1': npc('bluetile', 'saltking', 'd_blond', 's_king', { fixed: true }),
    '2': npc('bluetile', 'tal_s', 'devout4', 's_tal', { cond: (f) => !f.has_tal }),
    '3': npc('bluetile', 's_guard', 'soldier2', 's_guard'),
    '4': npc('plank', 's_shop', 'scout1', 's_shop', { fixed: true, dir: 'd' }),
    '5': npc('plank', 's_inn', 'bard3', 's_inn', { fixed: true, dir: 'd' }),
    '6': npc('sand', 's_dancer', 'conjurer5', 's_dancer', { wander: true }),
    '7': npc('sand', 's_trader', 'd_capped', 's_trader', { wander: true }),
    '<': warp('sand', 'world', 12, 29, 'd'),
  }, { id: 'salt' }),
});

// =====================================================================================
// Kestrel, the port
// =====================================================================================
def('kestrel', {
  name: nm('紅隼港', 'Kestrel Port'), music: 'rebels', safe: true,
  build: () => grid([
    '...............<................',
    '..T....RRRRR...=....RRRRRR...T..',
    '.......RRRRR...=....RRRRRR......',
    '.......#w#d#...=....#d##w#......',
    '..L.......=....=.......=.....L..',
    '..........=====c========........',
    '...............c................',
    '.RRRRRRR.......c.......kkk......',
    '.RRRRRRR.......c.......+1+......',
    '.YYYdYYY.......c.................'.slice(0, 32),
    '....c..........c.......2........',
    '....cccccccccccccccccccc........',
    '...............c................',
    '..T.....kkk....c.....3......T...',
    '........+4+....c................',
    '...............c................',
    '~~~~~~~~~~~~~~~+~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~+~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~+++++~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  ], {
    '1': npc('plank', 'k_shop', 'scout4', 'k_shop', { fixed: true, dir: 'd' }),
    '2': npc('grass', 'dorrin_k', 'scout5', 'k_dorrin', { cond: (f) => !f.has_dorrin }),
    '3': npc('grass', 'k_sailor', 'scout2', 'k_sailor', { wander: true }),
    '4': npc('plank', 'k_inn', 'mychars6', 'k_inn', { fixed: true, dir: 'd' }),
    '<': warp('dirt', 'world', 9, 41, 'u'),
  }, { id: 'kestrel' }),
});

// =====================================================================================
// the Thorn Spire
// =====================================================================================
const spireFloor = (id, rows, lg, zone = 'spire') => def(id, { name: nm('荊棘高塔', 'The Thorn Spire'), music: 'pagoda', build: () => grid(rows, lg, { id, zone: () => zone }) });
spireFloor('spire1', [
  'gggggggggggggggggggg',
  'ggggggggggggggggg^gg',
  'gggcccccccccccccccgg',
  'gggcgggggggggggggggg',
  'gggcccccccccccccgggg',
  'gggggggggggggggcgggg',
  'ggg2cccccccccccccggg'.slice(0, 20),
  'ggggggcggggggggggggg',
  'ggggggcccccccccccggg',
  'ggggggggggggggggcggg',
  'ggg9cccccccccccccggg',
  'ggggcggggggggggggggg',
  'ggggccccccccccccccgg',
  'gggggggggggggggggcgg',
  'ggggggcccccccccccc1g',
  'ggggggcggggggggggggg',
  'ggggggcccccccggggggg',
  'ggggggggggggcggggggg',
  'gggggggggccccggggggg',
  'ggggggggg<gggggggggg',
], { '^': warp('cobble', 'spire2', 17, 17, 'u'), '<': warp('cobble', 'world', 55, 46, 'd'), '1': chest('cobble', 'sp_a', 'windlance'), '2': chest('cobble', 'sp_b', 'xpotion'), '9': save('cobble') });
spireFloor('spire2', [
  'gggggggggggggggggggg',
  'gg^ggggggggggggggggg',
  'ggcccccccccccc1ggggg',
  'gggggggggggggcgggggg',
  'gggggggggggggcgggggg',
  'ggg2cccccccccccccggg',
  'ggggggggggggggggcggg',
  'ggggggggggggggggcggg',
  'ggg9cccccccccccccggg',
  'ggggcggggggggggggggg',
  'ggggcggggggggggggggg',
  'ggggcccccccccccccggg',
  'ggggggggggggggggcggg',
  'ggggggggggggggggcggg',
  'ggggggggggggggggcggg',
  'ggggggggggggggggcggg',
  'ggggggggggggggggccgg',
  'gggggggggggggggggcgg',
  'gggggggggggggggggvgg',
  'gggggggggggggggggggg',
], { '^': warp('cobble', 'spire3', 10, 16, 'u'), 'v': warp('cobble', 'spire1', 17, 2, 'd'), '1': chest('cobble', 'sp_c', 'tigerfang'), '2': chest('cobble', 'sp_d', 'steelplate'), '9': save('cobble') });
def('spire3', {
  name: nm('荊棘高塔　頂端', 'The Thorn Spire, Summit'), music: 'pagoda',
  build: (f) => grid([
    'gggggggggggggggggggg',
    'gggggggg[[[[gggggggg',
    'gggggg[[[[[[[[gggggg',
    'gggggc[[[[[[[[cggggg',
    'ggggccc[[[1[[cccgggg',
    'ggggccccccccccccgggg',
    'ggggcccIccccIccccggg',
    'ggggcccccccccccccggg',
    'ggggcccccc2cccccgggg',
    'ggggggcccccccccggggg',
    'gggggggccccccggggggg',
    'gggggggggcc9gggggggg',
    'ggggggggcccggggggggg',
    'gggggggggccggggggggg',
    'gggggggggccggggggggg',
    'gggggggggccggggggggg',
    'gggggggggccggggggggg',
    'ggggggggggvggggggggg',
  ], {
    'v': warp('cobble', 'spire2', 2, 2, 'd'),
    '1': npc('rug', 'brin_cap', 'soldier3', 'brin_cap', { cond: (fl) => !fl.spire_done, lying: false }),
    '2': trig('cobble', 'warden', { once: 'warden_dead' }),
    '9': save('cobble'),
  }, { id: 'spire3' }),
});
