// Walking around: maps, the party in a line behind the leader, people, chests, save points,
// doors, story triggers, random encounters and the airship.
import { ctx, W, H, canvas, text, textW, windowBox } from './gfx.js';
import { renderMap, solidKind, WREN } from './tiles.js';
import { sprite } from './sprites.js';
import { input } from './input.js';
import { sfx } from './audio.js';
import { S, spriteOf } from './party.js';
import { UI } from './ui.js';
import { L } from './i18n.js';

const DIRS = { up: [0, -1, 'u'], down: [0, 1, 'd'], left: [-1, 0, 'l'], right: [1, 0, 'r'] };
const DV = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] };

let MAPS = {};
export function setMaps(m) { MAPS = m; }
export const F = {
  map: null, def: null, gfx: null, ents: [], kinds: [], grid: null,
  p: { x: 0, y: 0, px: 0, py: 0, dir: 'd', moving: false },
  trail: [], frame: 0, cam: { x: 0, y: 0 }, banner: 0, encCount: 20,
  busy: false, flying: false, shake: 0,
  onStep: null, onEncounter: null, onWarp: null, onMenu: null, runScript: null,
};

export function loadMap(id, x, y, dir = 'd') {
  const def = MAPS[id];
  if (!def) throw new Error('no map ' + id);
  const built = def.build();
  F.def = def; F.map = built;
  const kinds = [], index = {};
  const grid = new Uint16Array(built.w * built.h);
  for (let yy = 0; yy < built.h; yy++) for (let xx = 0; xx < built.w; xx++) {
    const k = built.kindAt(xx, yy);
    if (index[k] === undefined) { index[k] = kinds.length; kinds.push(k); }
    grid[yy * built.w + xx] = index[k];
  }
  F.kinds = kinds; F.grid = grid;
  built.kinds = kinds; built.tile = (X, Y) => grid[Y * built.w + X];
  F.gfx = renderMap(built);
  F.ents = built.ents.map((e) => ({ ...e }));
  for (const e of F.ents) {
    e.px = e.x * 16; e.py = e.y * 16;
    if (e.type === 'chest' && S.flags['chest:' + e.id]) e.open = true;
    if (e.type === 'npc') { e.dir = e.dir || 'd'; e.home = [e.x, e.y]; e.mt = 30 + Math.floor(Math.random() * 90); }
    if (e.cond && !e.cond(S.flags)) e.gone = true;
  }
  // the parked airship
  if (S.ship && S.ship.map === id && !F.flying) F.ents.push({ type: 'ship', x: S.ship.x, y: S.ship.y, px: S.ship.x * 16, py: S.ship.y * 16 });
  F.p = { x, y, px: x * 16, py: y * 16, dir, moving: false };
  F.trail = [];
  for (let i = 0; i < 48; i++) F.trail.push({ px: x * 16, py: y * 16, dir });
  F.banner = def.name ? 130 : 0;
  F.encCount = 16 + Math.floor(Math.random() * 18);
  S.map = id; S.x = x; S.y = y; S.dir = dir;
  updateCam();
}

// ---------- queries ----------
const inMap = (x, y) => x >= 0 && y >= 0 && x < F.map.w && y < F.map.h;
export const kindAt = (x, y) => (inMap(x, y) ? F.kinds[F.grid[y * F.map.w + x]] : 'void');
export function entAt(x, y, pred = () => true) { return F.ents.find((e) => !e.gone && e.x === x && e.y === y && pred(e)); }
const entsAt = (x, y) => F.ents.filter((e) => !e.gone && e.x === x && e.y === y);
function entSolid(e) { return ['npc', 'chest', 'sign', 'solid', 'boss', 'ship'].includes(e.type) && !e.walkable; }
function blocked(x, y) {
  if (!inMap(x, y)) return true;
  if (solidKind(kindAt(x, y))) return true;
  for (const e of entsAt(x, y)) if (entSolid(e)) return true;
  return false;
}

// ---------- walking ----------
function tryMove(d) {
  const [dx, dy, dir] = DIRS[d], p = F.p;
  p.dir = dir;
  const nx = p.x + dx, ny = p.y + dy;
  if (F.flying) {
    if (!inMap(nx, ny)) return false;
    p.x = nx; p.y = ny; p.moving = true; return true;
  }
  // stepping onto the airship boards it
  const ship = entAt(nx, ny, (e) => e.type === 'ship');
  if (ship) { board(ship); return false; }
  if (blocked(nx, ny)) { if (F.frame % 16 === 0) sfx('bump'); return false; }
  p.x = nx; p.y = ny; p.moving = true;
  return true;
}
function finishStep() {
  const p = F.p;
  p.moving = false;
  S.x = p.x; S.y = p.y; S.dir = p.dir;
  if (F.busy || F.flying) return;
  S.steps++;
  if (F.onStep) F.onStep();
  const here = entsAt(p.x, p.y);
  for (const e of here) {
    if (e.type === 'warp') { F.onWarp && F.onWarp(e); return; }
    if (e.type === 'trigger' && !(e.once && S.flags[e.once]) && (!e.need || e.need(S.flags))) { if (e.once) S.flags[e.once] = true; F.runScript(e.run, e); return; }
    if (e.type === 'save') { F.runScript('save', e); return; }
  }
  // random encounters
  const zone = F.map.zone && F.map.zone(p.x, p.y);
  if (zone && F.onEncounter && !S.flags.noenc) {
    const k = kindAt(p.x, p.y);
    F.encCount -= k === 'forest' || k === 'leafy' ? 1.6 : k === 'road' || k === 'dirt' ? 0.7 : 1;
    if (F.encCount <= 0) { F.encCount = 16 + Math.floor(Math.random() * 20); F.onEncounter(zone); }
  }
}

// ---------- the airship ----------
function board(ship) {
  ship.gone = true;
  F.flying = true;
  S.ship = null;
  sfx('warp');
  const p = F.p; p.x = ship.x; p.y = ship.y; p.px = ship.x * 16; p.py = ship.y * 16;
  F.onBoard && F.onBoard();
}
const LANDABLE = new Set(['grass', 'grass2', 'leafy', 'sand', 'dirt', 'road', 'earth', 'ash', 'flowers']);
function tryLand() {
  const p = F.p;
  if (!LANDABLE.has(kindAt(p.x, p.y)) || entAt(p.x, p.y)) { sfx('buzz'); return; }
  F.flying = false;
  S.ship = { map: S.map, x: p.x, y: p.y };
  F.ents.push({ type: 'ship', x: p.x, y: p.y, px: p.x * 16, py: p.y * 16 });
  // step off beside the ship
  for (const [dx, dy, d] of [[0, 1, 'd'], [1, 0, 'r'], [-1, 0, 'l'], [0, -1, 'u']]) {
    if (!blocked(p.x + dx, p.y + dy)) { p.x += dx; p.y += dy; p.px = p.x * 16; p.py = p.y * 16; p.dir = d; break; }
  }
  for (const t of F.trail) { t.px = p.px; t.py = p.py; }
  S.x = p.x; S.y = p.y;
  sfx('door');
  F.onLand && F.onLand();
  // entering a place by landing on its tile
  const here = entsAt(p.x, p.y).find((e) => e.type === 'warp');
  if (here) F.onWarp(here);
}

// ---------- update ----------
export function updateField() {
  F.frame++;
  if (F.banner > 0) F.banner--;
  if (F.shake > 0) F.shake--;
  const p = F.p;
  if (p.moving) {
    const tx = p.x * 16, ty = p.y * 16, sp = F.flying ? 4 : input.held('b') && !F.busy ? 4 : 2;
    p.px += Math.sign(tx - p.px) * Math.min(sp, Math.abs(tx - p.px));
    p.py += Math.sign(ty - p.py) * Math.min(sp, Math.abs(ty - p.py));
    F.trail.unshift({ px: p.px, py: p.py, dir: p.dir });
    if (F.trail.length > 64) F.trail.pop();
    if (p.px === tx && p.py === ty) finishStep();
  }
  for (const e of F.ents) {
    if (e.gone) continue;
    const tx = e.x * 16, ty = e.y * 16;
    if (e.px !== tx || e.py !== ty) {
      const sp = e.speed || 1;
      e.px += Math.sign(tx - e.px) * Math.min(sp, Math.abs(tx - e.px));
      e.py += Math.sign(ty - e.py) * Math.min(sp, Math.abs(ty - e.py));
      e.walking = true;
      if (e.px === tx && e.py === ty) { e.walking = false; if (e.onArrive) { const f = e.onArrive; e.onArrive = null; f(); } }
    }
    if (e.type === 'npc' && e.wander && !F.busy && !UI.active && !e.walking) {
      if (--e.mt <= 0) {
        e.mt = 60 + Math.floor(Math.random() * 120);
        const [dx, dy] = [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(Math.random() * 4)];
        const nx = e.x + dx, ny = e.y + dy;
        e.dir = dx > 0 ? 'r' : dx < 0 ? 'l' : dy > 0 ? 'd' : 'u';
        if (Math.abs(nx - e.home[0]) <= 2 && Math.abs(ny - e.home[1]) <= 2 && !blocked(nx, ny) && !(nx === p.x && ny === p.y) && !entsAt(nx, ny).length) { e.x = nx; e.y = ny; }
      }
    }
  }
  if (F.busy || UI.active) { updateCam(); return; }
  if (!p.moving) {
    const d = input.dir();
    if (d && tryMove(d)) { /* moving */ }
    else if (input.pressed('a')) { if (F.flying) tryLand(); else interact(); }
    else if (input.pressed('menu')) F.onMenu && F.onMenu();
  }
  updateCam();
}
function interact() {
  const p = F.p, [dx, dy] = DV[p.dir];
  let tx = p.x + dx, ty = p.y + dy;
  // talk across a shop counter
  if (['counter', 'counter2'].includes(kindAt(tx, ty))) { tx += dx; ty += dy; }
  const e = F.ents.find((o) => !o.gone && o.x === tx && o.y === ty && (o.talk || ['chest', 'save', 'sign'].includes(o.type)));
  if (!e) return;
  if (e.type === 'npc' && !e.fixed) e.dir = { u: 'd', d: 'u', l: 'r', r: 'l' }[p.dir];
  F.runScript(e.talk || e.type, e);
}
function updateCam() {
  const tx = F.p.px + 8 - W / 2, ty = F.p.py + 8 - H / 2;
  const mw = F.map.w * 16, mh = F.map.h * 16;
  F.cam.x = mw <= W ? (mw - W) / 2 : Math.max(0, Math.min(mw - W, tx));
  F.cam.y = mh <= H ? (mh - H) / 2 : Math.max(0, Math.min(mh - H, ty));
}

// ---------- drawing ----------
const shadow = (() => { const c = canvas(12, 4); c.x.fillStyle = 'rgba(0,0,0,0.35)'; c.x.beginPath(); c.x.ellipse(6, 2, 6, 2, 0, 0, Math.PI * 2); c.x.fill(); return c; })();
const CHEST = {};
function chestArt(open) {
  if (CHEST[open]) return CHEST[open];
  const c = canvas(16, 16), g = c.x;
  g.fillStyle = '#000'; g.fillRect(2, 4, 12, 11);
  g.fillStyle = open ? '#503000' : '#ac7c00'; g.fillRect(3, 5, 10, open ? 3 : 4);
  g.fillStyle = '#7c3c00'; g.fillRect(3, 9, 10, 5);
  g.fillStyle = '#f8b800'; g.fillRect(3, 8, 10, 1); g.fillRect(7, 8, 2, 3);
  if (open) { g.fillStyle = '#000'; g.fillRect(3, 5, 10, 2); }
  return (CHEST[open] = c);
}
function saveArt(f) {
  const c = canvas(16, 16), g = c.x;
  const cols = ['#3cbcfc', '#a4e4fc', '#fcfcfc', '#a4e4fc'];
  g.fillStyle = '#000'; g.fillRect(4, 1, 8, 14);
  g.fillStyle = cols[f % 4]; g.fillRect(5, 2, 6, 12);
  g.fillStyle = '#0058f8'; g.fillRect(5, 9, 6, 5);
  g.fillStyle = '#fcfcfc'; g.fillRect(6, 3, 1, 3);
  return c;
}
const saveFrames = [0, 1, 2, 3].map(saveArt);

export function drawField() {
  const cx = Math.round(F.cam.x) + (F.shake ? ((F.shake % 2) * 2 - 1) * 2 : 0), cy = Math.round(F.cam.y);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const fr = F.gfx.frames[Math.floor(F.frame / 24) % F.gfx.frames.length];
  ctx.drawImage(fr, -cx, -cy);
  const list = [];
  for (const e of F.ents) {
    if (e.gone) continue;
    const x = Math.round(e.px) - cx, y = Math.round(e.py) - cy;
    if (x < -32 || y < -48 || x > W + 16 || y > H + 16) continue;
    list.push(e);
  }
  const p = F.p;
  if (!F.flying) {
    const party = S.members.filter((m) => m.hp > 0).slice(0, F.def.single ? 1 : 3);
    if (!party.length && S.members.length) party.push(S.members[0]);
    party.forEach((m, i) => {
      const t = i === 0 ? { px: p.px, py: p.py, dir: p.dir } : F.trail[Math.min(F.trail.length - 1, i * 8)];
      list.push({ type: 'hero', sprite: spriteOf(m), px: t.px, py: t.py, dir: t.dir, walking: p.moving || p.walking, order: -i, hidden: F.hideParty && i > 0 });
    });
  }
  list.sort((a, b) => a.py - b.py || (a.order || 0) - (b.order || 0));
  for (const e of list) drawEnt(e, cx, cy);
  if (F.flying) {
    const x = Math.round(p.px) - cx, y = Math.round(p.py) - cy;
    ctx.drawImage(shadow, x + 2, y + 13);
    ctx.drawImage(WREN[(F.frame >> 2) % 2], x, y - 10 + Math.round(Math.sin(F.frame / 12) * 2));
  }
  if (F.map.dark) {
    const g = ctx.createRadialGradient(p.px - cx + 8, p.py - cy + 8, 30, p.px - cx + 8, p.py - cy + 8, 150);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${F.map.dark})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  if (F.map.tint) { ctx.fillStyle = F.map.tint; ctx.fillRect(0, 0, W, H); }
  if (F.banner > 0 && F.def.name) {
    const name = typeof F.def.name === 'function' ? F.def.name() : F.def.name;
    const a = Math.min(1, F.banner / 20, (130 - F.banner) / 10 + 0.01);
    const w = textW(name) + 28;
    ctx.globalAlpha = Math.max(0, a);
    windowBox((W - w) / 2, 12, w, 22);
    text(name, W / 2, 17, '#f8f8f8', { align: 'center' });
    ctx.globalAlpha = 1;
  }
  if (F.flying && !F.busy && !UI.active) { windowBox(W - 98, H - 24, 94, 20); text(L('Z 降落', 'Z: Land'), W - 51, H - 20, '#f8f8f8', { align: 'center' }); }
}
function drawEnt(e, cx, cy) {
  const x = Math.round(e.px) - cx, y = Math.round(e.py) - cy;
  const anim = Math.floor(F.frame / 8) % 4;
  switch (e.type) {
    case 'hero': case 'npc': {
      if (e.hidden || !e.sprite) return;
      const fr = sprite(e.sprite)[e.dir || 'd'];
      const k = e.walking || e.walkAnim ? anim : 0;
      ctx.drawImage(shadow, x + 2, y + 13);
      if (e.ghost) ctx.globalAlpha = 0.55;
      if (e.lying) { ctx.save(); ctx.translate(x + 8, y + 10); ctx.rotate(-Math.PI / 2); ctx.drawImage(fr[0], -8, -8); ctx.restore(); }
      else ctx.drawImage(fr[k], x, y - 2);
      ctx.globalAlpha = 1;
      break;
    }
    case 'chest': ctx.drawImage(chestArt(!!e.open), x, y); break;
    case 'save': ctx.drawImage(saveFrames[(F.frame >> 3) % 4], x, y); break;
    case 'ship': ctx.drawImage(shadow, x + 2, y + 13); ctx.drawImage(WREN[0], x, y - 4); break;
    case 'sprite': if (e.draw) e.draw(ctx, x, y, F.frame); break;
    default: break;
  }
}

// ---------- script helpers ----------
export function walkEnt(e, path, speed = 1) {
  return new Promise((res) => {
    const steps = path.split('');
    const next = () => {
      const d = steps.shift();
      if (!d) { e.walkAnim = false; res(); return; }
      const [dx, dy] = DV[d];
      e.dir = d; e.x += dx; e.y += dy; e.speed = speed; e.walkAnim = true;
      e.onArrive = next;
    };
    next();
  });
}
export function walkPlayer(path) {
  return new Promise((res) => {
    const steps = path.split('');
    const p = F.p;
    const tick = () => {
      if (p.moving) { setTimeout(tick, 16); return; }
      const d = steps.shift();
      if (!d) { p.walking = false; res(); return; }
      const [dx, dy] = DV[d];
      p.dir = d; p.walking = true; p.x += dx; p.y += dy; p.moving = true;
      setTimeout(tick, 16);
    };
    tick();
  });
}
export function findEnt(id) { return F.ents.find((e) => e.id === id && !e.gone); }
export function land() { tryLand(); }
export const solidAt = (x, y) => blocked(x, y);
