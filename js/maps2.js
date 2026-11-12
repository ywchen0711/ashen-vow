// Part II maps: the Cloud Sea, three new towns and the dungeons. Dungeons are carved by a seeded
// maze generator (the same seed always gives the same map); towns are drawn by hand like maps.js.
import { L } from './i18n.js';
import { grid, npc, warp, chest, trig, save, def } from './maps.js';
import { hash } from './gfx.js';

const nm = (zh, en) => () => L(zh, en);

// ---------- the maze generator ----------
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
// carve(): returns { rows, cells } with '#' walls and '.' floors, the entrance at the bottom middle
function carve(w, h, seed, { loops = 0.08, rooms = 3 } = {}) {
  const R = rng(seed), g = Array.from({ length: h }, () => Array(w).fill('#'));
  const sx = (w >> 1) | 1, sy = h - 2;
  const st = [[sx, sy]]; g[sy][sx] = '.';
  while (st.length) {
    const [x, y] = st[st.length - 1];
    const dirs = [[2, 0], [-2, 0], [0, 2], [0, -2]].filter(([dx, dy]) => x + dx > 0 && y + dy > 0 && x + dx < w - 1 && y + dy < h - 1 && g[y + dy][x + dx] === '#');
    if (!dirs.length) { st.pop(); continue; }
    const [dx, dy] = dirs[Math.floor(R() * dirs.length)];
    g[y + dy / 2][x + dx / 2] = '.'; g[y + dy][x + dx] = '.'; st.push([x + dx, y + dy]);
  }
  // a few loops so it is not one long thread
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    if (g[y][x] !== '#' || R() > loops) continue;
    if ((g[y][x - 1] === '.' && g[y][x + 1] === '.' && g[y - 1][x] === '#' && g[y + 1][x] === '#') || (g[y - 1][x] === '.' && g[y + 1][x] === '.' && g[y][x - 1] === '#' && g[y][x + 1] === '#')) g[y][x] = '.';
  }
  // small halls
  for (let i = 0; i < rooms; i++) {
    const rw = 3 + 2 * Math.floor(R() * 2), rh = 3, rx = 1 + 2 * Math.floor(R() * ((w - rw - 2) / 2)), ry = 1 + 2 * Math.floor(R() * ((h - rh - 4) / 2));
    for (let y = ry; y < ry + rh; y++) for (let x = rx; x < rx + rw; x++) g[y][x] = '.';
  }
  g[h - 1][sx] = '.';
  return { g, sx, sy };
}
function dist(g, sx, sy) {
  const h = g.length, w = g[0].length, d = Array.from({ length: h }, () => Array(w).fill(-1)), prev = {};
  const q = [[sx, sy]]; d[sy][sx] = 0;
  while (q.length) {
    const [x, y] = q.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h || g[ny][nx] === '#' || d[ny][nx] >= 0) continue; d[ny][nx] = d[y][x] + 1; prev[nx + ',' + ny] = [x, y]; q.push([nx, ny]); }
  }
  return { d, prev };
}
// dungeon(): o.wall and o.floor are tile kinds; o.exit is the warp at the entrance; o.top is what
// sits at the far end (a warp up, a boss trigger...); o.chests are placed at the furthest dead ends;
// o.mid is a story trigger halfway along the main path; o.save puts a save point before the end.
// every dungeon floor's layout, worked out once: DUN[id] = { w, h, g, sx, sy, far, near, path, deadEnds }
export const DUN = {};
function layout(o) {
  const { g, sx, sy } = carve(o.w, o.h, o.seed, o);
  const { d, prev } = dist(g, sx, sy);
  const cells = [];
  for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) if (g[y][x] === '.' && d[y][x] > 0) cells.push([x, y, d[y][x]]);
  cells.sort((a, b) => b[2] - a[2]);
  const far = cells[0];
  const path = []; let k = far[0] + ',' + far[1];
  while (prev[k]) { const [x, y] = prev[k]; path.unshift([x, y]); k = x + ',' + y; }
  const near = path[path.length - 1] || [sx, sy];
  return { g: g.map((r) => r.slice()), sx, sy, far, near, path, cells };
}
export const entryOf = (id) => (DUN[id] ? [DUN[id].sx, DUN[id].sy] : MAPS_ENTRY[id]);
const MAPS_ENTRY = { palesummit: [10, 15] };
function dungeon(id, o) {
  DUN[id] = { w: o.w, h: o.h, ...layout(o) };
  def(id, {
    name: o.name, music: o.music || 'dungeon',
    build: (f) => {
      const L0 = DUN[id], g = L0.g.map((r) => r.slice()), sx = L0.sx, far = L0.far, path = L0.path, cells = L0.cells;
      if (o.down) o.exit = [o.down, ...DUN[o.down].near, 'd'];
      if (o.up) o.top = (kk) => warp(kk, o.up, ...entryOf(o.up), 'u');
      const onPath = new Set(path.map(([x, y]) => x + ',' + y));
      const deadEnds = cells.filter(([x, y]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => g[y + dy] && g[y + dy][x + dx] === '.').length === 1 && !(x === far[0] && y === far[1]) && !onPath.has(x + ',' + y));
      const lg = { '#': o.wall, '.': o.floor };
      const put = (x, y, ch, v) => { g[y][x] = ch; lg[ch] = v; };
      const used = new Set([far[0] + ',' + far[1], sx + ',' + (o.h - 1)]);
      put(sx, o.h - 1, '<', warp(o.floor, ...o.exit));
      put(far[0], far[1], '>', o.top(o.floor, f));
      const chests = (o.chests || []).filter((c) => !c.cond || c.cond(f));
      chests.forEach((c, i) => { const de = deadEnds[i]; if (!de) return; used.add(de[0] + ',' + de[1]); put(de[0], de[1], String.fromCharCode(97 + i), c.gold ? { k: o.floor, e: { type: 'chest', id: c.id, gold: c.gold } } : chest(o.floor, c.id, c.item, c.n || 1)); });
      // extra fixed things in further dead ends (optional bosses, people)
      (o.side || []).forEach((s, i) => { const de = deadEnds[chests.length + i]; if (!de) return; put(de[0], de[1], String.fromCharCode(65 + i), s(o.floor, f)); });
      if (o.save) { const p = path[Math.floor(path.length * 0.72)]; if (p && !used.has(p[0] + ',' + p[1])) put(p[0], p[1], '9', save(o.floor)); }
      if (o.mid) { const p = path[Math.floor(path.length * 0.4)]; if (p) put(p[0], p[1], '8', trig(o.floor, o.mid, { once: 'seen_' + o.mid })); }
      const rows = g.map((r) => r.join(''));
      return grid(rows, lg, { id, zone: o.zone ? () => o.zone : undefined, dark: o.dark, tint: o.tint });
      void sx;
    },
  });
}
// the tile just inside a dungeon's entrance, for warps coming in
export const ENTRY = (w, h) => [(w >> 1) | 1, h - 2];

// =====================================================================================
// the Drowned Cloister, under the Sunken Shrine
// =====================================================================================
dungeon('cloister1', {
  name: nm('淹沒迴廊', 'The Drowned Cloister'), music: 'sanctuary', w: 25, h: 21, seed: 9101, wall: 'drownwall', floor: 'drownfloor', zone: 'cloister', dark: 0.35,
  exit: ['shrine', 11, 3, 'd'], up: 'cloister2', mid: 'cl_memory', save: true,
  chests: [{ id: 'cl_a', item: 'etherdew' }, { id: 'cl_b', item: 'moonstaff' }, { id: 'cl_c', item: 'm_crystal', n: 2 }],
});
dungeon('cloister2', {
  name: nm('淹沒迴廊　深處', 'The Drowned Cloister, Depths'), music: 'sanctuary', w: 25, h: 21, seed: 9122, wall: 'drownwall', floor: 'drownfloor', zone: 'cloister', dark: 0.3,
  down: 'cloister1', top: (k) => trig(k, 'cl_prioress', { once: 'prioress_dead' }), save: true,
  chests: [{ id: 'cl_d', item: 'tideguard' }, { id: 'cl_e', item: 'lumenrobe' }, { id: 'cl_pearl', item: 'lakepearl', cond: (f) => f.sq_pearl }],
});

// =====================================================================================
// the Rootdeep, under the Elder Thorn
// =====================================================================================
dungeon('rootdeep1', {
  name: nm('根底', 'The Rootdeep'), music: 'dungeon', w: 27, h: 21, seed: 7331, wall: 'rootwall', floor: 'rootfloor', zone: 'rootdeep', dark: 0.4,
  exit: ['thornby', 12, 4, 'd'], up: 'rootdeep2', mid: 'rd_echo',
  chests: [{ id: 'rd_a', item: 'm_root', n: 2 }, { id: 'rd_b', item: 'healmist' }, { id: 'rd_c', item: 'silverharp' }],
});
dungeon('rootdeep2', {
  name: nm('根底　中層', 'The Rootdeep, Middle'), music: 'dungeon', w: 27, h: 23, seed: 7342, wall: 'rootwall', floor: 'rootfloor', zone: 'rootdeep', dark: 0.38, save: true,
  down: 'rootdeep1', up: 'rootdeep3',
  chests: [{ id: 'rd_page', item: 'page1' }, { id: 'rd_d', item: 'regenring' }, { id: 'rd_e', gold: 4000 }],
  side: [(k) => trig(k, 'rd_mycel', { once: 'mycel_dead', need: (fl) => fl.sq_mycel })],
});
dungeon('rootdeep3', {
  name: nm('根底　最深處', 'The Rootdeep, Heart'), music: 'dungeon', w: 27, h: 21, seed: 7353, wall: 'rootwall', floor: 'rootfloor', zone: 'rootdeep', dark: 0.36, save: true,
  down: 'rootdeep2', top: (k) => trig(k, 'rd_garrick', { once: 'garrick2_dead' }),
  chests: [{ id: 'rd_f', item: 'shadowgarb' }, { id: 'rd_g', item: 'etherdew', n: 2 }],
});

// =====================================================================================
// the Sunfire Temple, in the deep desert
// =====================================================================================
dungeon('sunfire1', {
  name: nm('陽炎神殿', 'The Sunfire Temple'), music: 'pagoda', w: 27, h: 21, seed: 5511, wall: 'templewall', floor: 'templefloor', zone: 'sunfire', tint: 'rgba(160,60,0,0.08)',
  exit: ['world', 6, 31, 'd'], up: 'sunfire2', mid: 'sf_tal', save: true,
  chests: [{ id: 'sf_a', item: 'flameclaw' }, { id: 'sf_b', item: 'm_ember', n: 2 }, { id: 'sf_c', item: 'quickdraught', n: 2 }],
});
dungeon('sunfire2', {
  name: nm('陽炎神殿　聖火之間', 'The Sunfire Temple, Hall of Flame'), music: 'pagoda', w: 27, h: 21, seed: 5522, wall: 'templewall', floor: 'templefloor', zone: 'sunfire', tint: 'rgba(160,60,0,0.1)', save: true,
  down: 'sunfire1', top: (k) => trig(k, 'sf_oro', { once: 'oro_dead' }),
  chests: [{ id: 'sf_d', item: 'sunsteel' }, { id: 'sf_e', item: 'keenring' }],
});

// =====================================================================================
// the Gearworks on Emberfall isle
// =====================================================================================
dungeon('gearworks1', {
  name: nm('齒輪工坊', 'The Gearworks'), music: 'rebels', w: 29, h: 21, seed: 3301, wall: 'gearwall', floor: 'gearfloor', zone: 'gearworks', dark: 0.25,
  exit: ['world', 80, 51, 'd'], up: 'gearworks2', mid: 'gw_letter', save: true,
  chests: [{ id: 'gw_a', item: 'gearhammer' }, { id: 'gw_b', item: 'm_gear', n: 3 }, { id: 'gw_c', item: 'thunderjar', n: 3 }],
});
dungeon('gearworks2', {
  name: nm('齒輪工坊　核心', 'The Gearworks, Core'), music: 'rebels', w: 27, h: 23, seed: 3312, wall: 'gearwall', floor: 'gearfloor', zone: 'gearworks', dark: 0.25, save: true,
  down: 'gearworks1', top: (k) => trig(k, 'gw_colossus', { once: 'colossus_dead' }),
  chests: [{ id: 'gw_page', item: 'page2' }, { id: 'gw_d', item: 'stormcoat' }, { id: 'gw_e', item: 'learnersring' }],
});

// =====================================================================================
// Grayhold keep, held by the Thornsworn
// =====================================================================================
dungeon('keep1', {
  name: nm('灰岩堡　內城', 'Grayhold Keep'), music: 'rage', w: 25, h: 21, seed: 4401, wall: 'darkbrick', floor: 'cobble', zone: 'keep', dark: 0.2,
  exit: ['grayhold', 11, 3, 'd'], up: 'keep2', mid: 'kp_brin', save: true,
  chests: [{ id: 'kp_a', item: 'silverlance' }, { id: 'kp_b', item: 'irontonic', n: 3 }, { id: 'kp_c', item: 'm_ore', n: 3 }],
});
dungeon('keep2', {
  name: nm('灰岩堡　城頂', 'Grayhold Keep, Battlements'), music: 'rage', w: 25, h: 21, seed: 4412, wall: 'darkbrick', floor: 'cobble', zone: 'keep', save: true,
  down: 'keep1', top: (k) => trig(k, 'kp_sable', { once: 'sable_dead' }),
  chests: [{ id: 'kp_d', item: 'thunderpike' }, { id: 'kp_e', item: 'crystalplate' }],
});

// =====================================================================================
// the old barracks under Castle Varn
// =====================================================================================
dungeon('barracks1', {
  name: nm('瓦恩舊兵營', 'The Old Barracks'), music: 'deities', w: 25, h: 21, seed: 6601, wall: 'barrackwall', floor: 'barrackfloor', zone: 'barracks', dark: 0.45,
  exit: ['varncastle', 18, 5, 'd'], up: 'barracks2', mid: 'br_roll', save: true,
  chests: [{ id: 'br_a', item: 'holywater', n: 3 }, { id: 'br_b', item: 'protectring' }, { id: 'br_c', item: 'm_pale', n: 2 }],
});
dungeon('barracks2', {
  name: nm('瓦恩舊兵營　點名廳', 'The Old Barracks, Roll Hall'), music: 'deities', w: 25, h: 21, seed: 6612, wall: 'barrackwall', floor: 'barrackfloor', zone: 'barracks', dark: 0.4, save: true,
  down: 'barracks1', top: (k) => trig(k, 'br_legion', { once: 'legion_dead' }),
  chests: [{ id: 'br_d', item: 'vowplate' }, { id: 'br_e', item: 'giantbelt' }],
});

// =====================================================================================
// Stormroc's Aerie in the Cloud Sea
// =====================================================================================
dungeon('aerie1', {
  name: nm('風暴巨鵬之巢', "Stormroc's Aerie"), music: 'airship', w: 27, h: 21, seed: 8801, wall: 'skymount', floor: 'skygrass', zone: 'aerie',
  exit: ['sky', 52, 13, 'd'], up: 'aerie2', save: true,
  chests: [{ id: 'ae_a', item: 'tmap2' }, { id: 'ae_b', item: 'm_storm', n: 2 }, { id: 'ae_c', item: 'galefan', n: 2 }],
});
dungeon('aerie2', {
  name: nm('風暴巨鵬之巢　頂', "Stormroc's Aerie, Crown"), music: 'airship', w: 27, h: 23, seed: 8812, wall: 'skymount', floor: 'skygrass', zone: 'aerie', save: true,
  down: 'aerie1', top: (k) => trig(k, 'ae_roc', { once: 'roc_dead' }),
  chests: [{ id: 'ae_d', item: 'skypiercer' }, { id: 'ae_e', item: 'skyweave' }, { id: 'ae_f', item: 'hastecharm' }],
});

// =====================================================================================
// Deepcoil Grotto in Mirefen
// =====================================================================================
dungeon('grotto1', {
  name: nm('淵蛇洞窟', 'Deepcoil Grotto'), music: 'dungeon', w: 27, h: 21, seed: 2201, wall: 'cave', floor: 'drownfloor', zone: 'grotto', dark: 0.45,
  exit: ['world', 42, 58, 'd'], up: 'grotto2', save: true,
  chests: [{ id: 'gr_a', item: 'tmap3' }, { id: 'gr_b', item: 'm_crystal', n: 3 }, { id: 'gr_c', item: 'etherdew' }],
});
dungeon('grotto2', {
  name: nm('淵蛇洞窟　深淵', 'Deepcoil Grotto, the Deep'), music: 'dungeon', w: 27, h: 23, seed: 2212, wall: 'cave', floor: 'drownfloor', zone: 'grotto', dark: 0.4, save: true,
  down: 'grotto1', top: (k) => trig(k, 'gr_deepcoil', { once: 'deepcoil_dead' }),
  chests: [{ id: 'gr_d', item: 'aurorastaff' }, { id: 'gr_e', item: 'mindgem' }],
});

// =====================================================================================
// the Bell Tower of Belltoll
// =====================================================================================
dungeon('belltower1', {
  name: nm('鐘樓', 'The Bell Tower'), music: 'deities', w: 25, h: 21, seed: 1101, wall: 'icewall', floor: 'icefloor', zone: 'bell', tint: 'rgba(200,210,240,0.08)',
  exit: ['world', 86, 7, 'd'], up: 'belltower2', mid: 'bt_ilse', save: true,
  chests: [{ id: 'bt_a', item: 'frostguard' }, { id: 'bt_b', item: 'm_frost', n: 2 }, { id: 'bt_c', item: 'healmist', n: 2 }],
});
dungeon('belltower2', {
  name: nm('鐘樓　中層', 'The Bell Tower, Middle'), music: 'deities', w: 25, h: 21, seed: 1112, wall: 'icewall', floor: 'icefloor', zone: 'bell', save: true,
  down: 'belltower1', up: 'belltower3',
  chests: [{ id: 'bt_page', item: 'page3' }, { id: 'bt_d', item: 'belltollrobe' }, { id: 'bt_e', item: 'etherdew', n: 2 }],
});
dungeon('belltower3', {
  name: nm('鐘樓　鐘室', 'The Bell Tower, Belfry'), music: 'deities', w: 25, h: 21, seed: 1123, wall: 'icewall', floor: 'icefloor', zone: 'bell', save: true,
  down: 'belltower2', top: (k) => trig(k, 'bt_wraith', { once: 'bellwraith_dead' }),
  chests: [{ id: 'bt_f', item: 'starharp' }, { id: 'bt_g', item: 'phoenixplume' }],
});

// =====================================================================================
// the Pale Spire
// =====================================================================================
const PALE = nm('蒼白高塔', 'The Pale Spire');
dungeon('pale1', { name: PALE, music: 'pagoda', w: 25, h: 21, seed: 9901, wall: 'palewall', floor: 'paletile', zone: 'pale', exit: ['world', 84, 26, 'd'], up: 'pale2', save: true, mid: 'ps_enter',
  chests: [{ id: 'ps_a', item: 'm_pale', n: 3 }, { id: 'ps_b', item: 'etherdew', n: 2 }, { id: 'ps_c', item: 'phoenixcharm' }] });
dungeon('pale2', { name: PALE, music: 'pagoda', w: 25, h: 21, seed: 9912, wall: 'palewall', floor: 'paletile', zone: 'pale', down: 'pale1', up: 'pale3', save: true,
  chests: [{ id: 'ps_d', item: 'grandelixir' }, { id: 'ps_e', item: 'starforge' }] });
dungeon('pale3', { name: PALE, music: 'pagoda', w: 25, h: 21, seed: 9923, wall: 'palewall', floor: 'paletile', zone: 'pale', down: 'pale2', up: 'pale4', save: true, mid: 'ps_gowan',
  chests: [{ id: 'ps_f', item: 'cosmosrod' }, { id: 'ps_g', item: 'starshard', n: 2 }] });
dungeon('pale4', { name: PALE, music: 'pagoda', w: 25, h: 21, seed: 9934, wall: 'palewall', floor: 'paletile', zone: 'pale', down: 'pale3', up: 'palesummit', save: true,
  chests: [{ id: 'ps_h', item: 'cosmicrobe' }, { id: 'ps_i', item: 'starplate' }] });
def('palesummit', {
  name: nm('蒼白高塔　頂端', 'The Pale Spire, Summit'), music: 'villain',
  build: () => grid([
    '                    ',
    '      ppppppppp     ',
    '     ppppppppppp    ',
    '    pppppp1pppppp   ',
    '    ppppppppppppp   ',
    '    ppIppppppppIp   ',
    '    ppppppppppppp   ',
    '    pppppp2pppppp   ',
    '     ppppppppppp    ',
    '      ppppppppp     ',
    '        ppppp       ',
    '        pp9pp       ',
    '         ppp        ',
    '         ppp        ',
    '         ppp        ',
    '         ppp        ',
    '         pvp        ',
    '                    ',
  ], {
    ' ': 'paleglass', p: 'paletile', I: 'palepillar',
    v: warp('paletile', 'pale4', ...DUN.pale4.near, 'd'),
    '1': npc('paletile', 'nameless_top', 'conjurer0', null, { cond: (f) => !f.p2_end, lookGrey: true }),
    '2': trig('paletile', 'ps_final', { once: 'final_seen' }),
    '9': save('paletile'),
  }, { id: 'palesummit' }),
});

// =====================================================================================
// the Starwell Abyss, after the end
// =====================================================================================
dungeon('abyss1', { name: nm('燼井深淵', 'The Starwell Abyss'), music: 'deities', w: 29, h: 23, seed: 6661, wall: 'cave', floor: 'darkrock', zone: 'abyss', dark: 0.5, exit: ['well2', 11, 15, 'u'], up: 'abyss2', save: true,
  chests: [{ id: 'ab_a', item: 'starforge' }, { id: 'ab_b', item: 'm_star', n: 2 }, { id: 'ab_c', item: 'grandelixir' }, { id: 'ab_d', item: 'tmap5' }] });
dungeon('abyss2', { name: nm('燼井深淵　中層', 'The Starwell Abyss, Middle'), music: 'deities', w: 29, h: 23, seed: 6672, wall: 'cave', floor: 'darkrock', zone: 'abyss', dark: 0.5, down: 'abyss1', up: 'abyss3', save: true, mid: 'ab_echo',
  chests: [{ id: 'ab_page', item: 'page4' }, { id: 'ab_e', item: 'starplate' }, { id: 'ab_f', item: 'm_star', n: 2 }] });
dungeon('abyss3', { name: nm('燼井深淵　底', 'The Starwell Abyss, Floor'), music: 'deities', w: 29, h: 23, seed: 6683, wall: 'cave', floor: 'darkrock', zone: 'abyss', dark: 0.45, down: 'abyss2', top: (k) => trig(k, 'ab_unwritten', { once: 'unwritten_dead' }), save: true,
  chests: [{ id: 'ab_g', item: 'daybreaker' }, { id: 'ab_h', item: 'grandelixir', n: 2 }] });



// =====================================================================================
// the Cloud Sea: a second sky over the world, for the Wren once Dorrin upgrades it
// =====================================================================================
export const SKY = { R: [28, 20], A: [52, 12], K: [12, 8], T: [72, 34] };
function skyBuild(f) {
  const w = 96, h = 64;
  const g = Array.from({ length: h }, () => Array(w).fill('cloud'));
  const set = (x, y, k) => { if (x >= 0 && y >= 0 && x < w && y < h) g[y][x] = k; };
  const isle = (cx, cy, rx, ry, seed) => { for (let y = cy - ry - 1; y <= cy + ry + 1; y++) for (let x = cx - rx - 1; x <= cx + rx + 1; x++) { const dx = (x - cx) / (rx + 0.5), dy = (y - cy) / (ry + 0.5); if (dx * dx + dy * dy < 1 - hash(x, y, seed) * 0.25) set(x, y, 'skygrass'); } };
  isle(28, 21, 5, 4, 41); isle(52, 12, 4, 3, 42); isle(12, 8, 2, 2, 43); isle(72, 34, 3, 2, 44); isle(40, 44, 3, 2, 45); isle(84, 50, 2, 2, 46);
  for (const [x, y] of [[25, 19], [31, 23], [55, 11], [49, 13]]) set(x, y, 'skymount');
  for (const [x, y] of [[27, 23], [30, 19], [41, 45]]) set(x, y, 'skyflowers');
  const P = SKY;
  set(P.R[0], P.R[1], 'i_skytown'); set(P.A[0], P.A[1], 'i_aerie');
  const ents = [];
  ents.push({ type: 'warp', x: P.R[0], y: P.R[1], to: 'skyreach', tx: 12, ty: 17, dir: 'u' });
  ents.push({ type: 'warp', x: P.A[0], y: P.A[1], to: 'aerie1', tx: 13, ty: 19, dir: 'u', need: (fl) => fl.p2_skyelder, msg: () => L('巢穴的入口被狂風封住了。先去天棧問問看吧。', 'A howling wind seals the nest. Ask in Skyreach first.') });
  ents.push({ type: 'chest', x: P.K[0], y: P.K[1], id: 'sky_kite', item: 'kite', cond: (fl) => fl.sq_kite });
  ents.push({ type: 'chest', x: P.T[0], y: P.T[1], id: 'sky_t', item: 'm_star' });
  ents.push({ type: 'chest', x: 40, y: 44, id: 'sky_u', item: 'mpcharm' });
  ents.push({ type: 'chest', x: 84, y: 50, id: 'sky_v', item: 'grandelixir' });
  for (const e of ents) if (e.cond && !e.cond(f)) e.gone = true;
  return { w, h, kindAt: (x, y) => g[y][x], ents, world: true, sky: true, zone: () => 'sky', landable: (k) => ['skygrass', 'skyflowers'].includes(k) };
}
def('sky', { name: nm('雲海', 'The Cloud Sea'), music: 'waltz', world: true, sky: true, build: skyBuild, bg: 'sky' });

// =====================================================================================
// Skyreach, the hamlet of the wind-folk
// =====================================================================================
def('skyreach', {
  name: nm('天棧', 'Skyreach'), music: 'waltz', safe: true,
  build: () => grid([
    'cccccccccccccccccccccccc',
    'cc,,,,,,,,,,,,,,,,,,,,cc',
    'c,,RRRR,,,,,,,,,RRRRR,,c',
    'c,,RRRR,,,1,,,,,RRRRR,,c',
    'c,,#w#d,,,,,,,,,#d#w#,,c',
    'c,,,,=,,,,,,,,,,,=,,,,,c',
    'c,,,,======*=======,,,,c',
    'c,*,,,,,,,,=,,,,,,,,,*,c',
    'c,,,kkk,,,,=,,,,kkk,,,,c',
    'c,,,+2+,,,,=,,,,+3+,,,,c',
    'c,,,,,,,,,,=,,,,,,,,,,,c',
    'c,L,,,,4,,,=,,5,,,,,L,,c',
    'c,,,,,,,,,,=,,,,,,,,,,,c',
    'c,,RRRRR,,,=,,,,,6,,,,,c',
    'c,,RRRRR,,,=,,,,,,,,,,,c',
    'c,,#w#d#,,,=,,,,,,,*,,,c',
    'cc,,,,,,,,,=,,,,,,,,,,cc',
    'ccc,,,,,,,,=,,,,,,,,,ccc',
    'cccccccccc,<,ccccccccccc',
  ], {
    c: 'cloud', ',': 'skygrass', '*': 'skyflowers',
    '1': npc('skygrass', 'sk_elder', 'd_oldman', 'sk_elder'),
    '2': npc('plank', 'sk_shop', 'scout3', 'sk_shop', { fixed: true, dir: 'd' }),
    '3': npc('plank', 'sk_inn', 'bard6', 'sk_inn', { fixed: true, dir: 'd' }),
    '4': npc('skygrass', 'sk_child', 'boy', 'sk_child', { wander: true }),
    '5': npc('skygrass', 'sk_weaver', 'devout6', 'sk_weaver', { wander: true }),
    '6': npc('skygrass', 'sk_watch', 'scout7', 'sk_watch'),
    '<': warp('skygrass', 'sky', 28, 22, 'd'),
  }, { id: 'skyreach' }),
});

// =====================================================================================
// Reedholm, the stilt town of Mirefen
// =====================================================================================
def('reedholm', {
  name: nm('蘆洲', 'Reedholm'), music: 'town', safe: true,
  build: () => grid([
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~RRRR~~~~~~~~~~~~~~~RRRR~~~',
    '~~RRRR~~~~~~~~~~~~~~~RRRR~~~',
    '~~#d##~~~~~~~~~~~~~~~##d#~~~',
    '~~~+~~~~~~~~~~~~~~~~~~~+~~~~',
    '~~~++++++++++++++++++++++~~~',
    '~~~~~~~~~~+~~~~~~+~~~~~~~~~~',
    '~,,,,,,,,,+,,,,,,+,,,,,,,,,~',
    '~,kkk,,,,,+,,1,,,+,,,,kkk,,~',
    '~,+2+,,,,,+,,,,,,+,,,,+3+,,~',
    '~,,,,,,,,,++++++++,,,,,,,,,~',
    '~,,L,,,4,,,,,+,,,,,,5,,,L,,~',
    '~,,,,,,,,,,,,+,,,,,,,,,,,,,~',
    '~,,RRRRR,,,,,+,,,,,FFFFFF,,~',
    '~,,RRRRR,,,,,+,,,,,F,6,,F,,~',
    '~,,#w#d#,,,,,+,,,,,F,,,,F,,~',
    '~,,,,,,,,,7,,+,,,,,FFF,FF,,~',
    '~,,,,,,,,,,,,+,,,,,,,,,,,,,~',
    '~~~~~~~~~~~~,<,~~~~~~~~~~~~~',
  ], {
    '~': 'swamp', ',': 'swampgrass', F: 'fence',
    '1': npc('swampgrass', 'rh_elder', 'd_bald', 'rh_elder'),
    '2': npc('plank', 'rh_shop', 'scout0', 'rh_shop', { fixed: true, dir: 'd' }),
    '3': npc('plank', 'rh_inn', 'mychars3', 'rh_inn', { fixed: true, dir: 'd' }),
    '4': npc('swampgrass', 'rh_digger', 'd_capped', 'rh_digger'),
    '5': npc('swampgrass', 'rh_fisher', 'scout6', 'rh_fisher', { wander: true }),
    '6': npc('swampgrass', 'rh_racer', 'drakeling', 'rh_racer', { fixed: true }),
    '7': npc('swampgrass', 'rh_child', 'd_leafy', 'rh_child', { wander: true }),
    '<': warp('swampgrass', 'world', 20, 56, 'd'),
  }, { id: 'reedholm' }),
});

// =====================================================================================
// Belltoll, the village of the Namekeepers
// =====================================================================================
def('belltoll', {
  name: nm('鐘鳴村', 'Belltoll'), music: 'prelude',
  build: (f) => grid([
    'PPPPPPPPPPPPPPPPPPPPPPPPPP',
    'P,,,,,,,,,,,,,,,,,,,,,,,,P',
    'P,RRRR,,,,,,,,,,,,,,RRRR,P',
    'P,RRRR,,,,,QQQQ,,,,,RRRR,P',
    'P,#d##,,,,,QjjQ,,,,,##d#,P',
    'P,,=,,,,,,,QQDQ,,,,,,,=,,P',
    'P,,=========,=,========,,P',
    'P,,,,,,,,,,,,=,,,,,,,,,,,P',
    'P,kkk,,,1,,,,=,,,,,2,,kkk,P'.slice(0, 26),
    'P,+3+,,,,,,,,=,,,,,,,,+4+P',
    'P,,,,,,,,,,,,=,,,,,,,,,,,P',
    'P,,L,,,,,,5,,=,,6,,,,,L,,P',
    'P,,,,,,,,,,,,=,,,,,,,,,,,P',
    'P,RRRRR,,,,,,=,,,,,,RRRR,P',
    'P,RRRRR,,,7,,=,,,,,,RRRR,P',
    'P,#w#d#,,,,,,=,,,,,,#d##,P',
    'P,,,,,,,,,,,,=,,,,,,,,,,,P',
    'PPPPPPPPPPP,,<,,PPPPPPPPPP',
  ], {
    P: 'snowpine', ',': 'snow', D: 'door2', Q: 'icewall', j: 'icewall',
    '1': npc('snow', 'bl_tinker', 'scout5', 'bl_tinker', { lookGrey: !f.p2_end }),
    '2': npc('snow', 'bl_mother', 'bard5', 'bl_mother', { lookGrey: !f.p2_end, wander: true }),
    '3': npc('plank', 'bl_shop', 'mychars1', 'bl_shop', { fixed: true, dir: 'd' }),
    '4': npc('plank', 'bl_inn', 'bard2', 'bl_inn', { fixed: true, dir: 'd' }),
    '5': npc('snow', 'bl_child', 'boy', 'bl_child', { lookGrey: !f.p2_end, wander: true }),
    '6': npc('snow', 'bl_keeper', 'devout7', 'bl_keeper', { lookGrey: !f.p2_end }),
    '7': npc('snow', 'bl_old', 'd_oldman', 'bl_old', { lookGrey: !f.p2_end, wander: true }),
    '<': warp('snow', 'world', 78, 11, 'd'),
  }, { id: 'belltoll', tint: f.p2_end ? null : 'rgba(200,200,220,0.16)' }),
});
