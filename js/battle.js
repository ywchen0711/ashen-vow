// Side-view active-time battles: monsters on the left, the party in a column on the right.
// Every fighter has a time gauge that fills by speed; a full gauge means a turn. Spells take a
// moment to cast; while a menu is open the gauges wait (or not, in Active mode).
import { ctx, W, H, canvas, text, textW, windowBox, HAND, bar } from './gfx.js';
import { input } from './input.js';
import { sfx, playMusic, stopMusic } from './audio.js';
import { S, stats, gainExp, addItem, count, spellsOf, callsOf, gadgetsOf, cmdsOf, spriteOf, heroName, isDawn } from './party.js';
import { MON, SPELLS, ITEMS, FSK, CMD, BLACK, nm } from './data.js';
import { sprite, monArt, personArt, preloadMon, flash as flashArt, recolor } from './sprites.js';
import { tileCanvas, TILES } from './tiles.js';
import { L } from './i18n.js';

export const settings = { mode: 'wait', speed: 3 };
const SPEEDS = [0, 0.55, 0.75, 1, 1.3, 1.7, 2.2];
const FIELD_H = 144;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[Math.floor(Math.random() * a.length)];

let B = null;
export const _B = { get B() { return B; }, auto: false };

// ---------- setup ----------
export async function startBattle(troop, opts = {}) {
  const ids = troop.map((id) => MON[id].art).filter((a) => !a.startsWith('person:'));
  await preloadMon([...new Set([...ids, ...Object.values(SPELLS).filter((s) => s.art).map((s) => s.art)])]);
  B = {
    opts, t: 0, party: [], foes: [], queue: [], cur: null, menu: null, fx: [], nums: [], banner: null, msg: null,
    ready: [], result: null, shake: 0, flashScr: 0, hold: 0, waits: [], round: 0, cover: null, done: null, introT: 30,
    bg: makeBg(opts.bg || 'plains'), boss: troop.some((id) => MON[id].boss), log: [],
  };
  S.members.forEach((h, i) => {
    const s = stats(h);
    if (h.hp > s.maxhp) h.hp = s.maxhp;
    B.party.push({ kind: 'hero', h, i, gauge: rand(0, 600), st: { ...pickPersist(h.st) }, focus: 0, dx: 0, dy: 0, pose: 0, ready: false, air: null, cast: null });
  });
  troop.forEach((id, i) => {
    const d = MON[id];
    const art = d.art.startsWith('person:') ? personArt(d.art.slice(7), d.scale || 2, d.look) : monArt(d.art, d.look);
    const sc = d.art.startsWith('person:') ? 1 : d.scale || 1;
    B.foes.push({ kind: 'foe', id, d, i, hp: d.hp, maxhp: d.hp, gauge: rand(0, 500), st: {}, art, sc, w: art[0].width * sc, h: art[0].height * sc, alive: true, fade: 0, blink: 0, hurt: 0, turns: 0, hitSince: 0, calm: 0, charge: 0, name: nm(d) });
  });
  layoutFoes();
  // letters for twins: Ooze A, Ooze B
  const seen = {};
  for (const f of B.foes) { seen[f.id] = (seen[f.id] || 0) + 1; }
  playMusic(opts.music || (B.boss ? 'boss' : 'battle'), { restart: true });
  if (opts.preempt) for (const p of B.party) p.gauge = 900;
  return new Promise((res) => { B.done = res; });
}
const pickPersist = (st) => { const o = {}; for (const k of ['poison', 'blind', 'mute']) if (st && st[k]) o[k] = 1; return o; };

function layoutFoes() {
  const fs = B.foes, n = fs.length;
  const total = fs.reduce((a, f) => a + f.w, 0) + (n - 1) * 6;
  if (total <= 168) {
    let x = Math.max(6, 88 - total / 2);
    for (const f of fs) { f.x = x; f.y = 132 - f.h; x += f.w + 6; }
    // stagger small groups a little
    if (n === 3) { fs[1].y -= 10; }
  } else {
    const back = fs.filter((_, i) => i % 2 === 0), front = fs.filter((_, i) => i % 2 === 1);
    const place = (row, bottom, x0) => { const tw = row.reduce((a, f) => a + f.w, 0) + (row.length - 1) * 4; let x = Math.max(4, x0 - tw / 2); for (const f of row) { f.x = x; f.y = bottom - f.h; x += f.w + 4; } };
    place(back, 92, 80); place(front, 138, 96);
  }
  for (const f of fs) { f.x = Math.round(Math.min(f.x, 176 - f.w)); f.y = Math.round(Math.max(8, f.y)); }
}
const heroX = (p) => (p.h.row === 'back' ? 218 : 202);
const heroY = (p) => 34 + p.i * 21;
const foeCx = (f) => f.x + f.w / 2, foeCy = (f) => f.y + f.h / 2;
const live = (list) => list.filter((x) => (x.kind === 'hero' ? x.h.hp > 0 && !x.air : x.alive && x.hp > 0));
const liveFoes = () => live(B.foes);
const liveHeroes = () => live(B.party);
const posOf = (t) => (t.kind === 'hero' ? [heroX(t) + 8 + t.dx, heroY(t) + 8 + t.dy] : [foeCx(t), foeCy(t)]);
const nameOf = (t) => (t.kind === 'hero' ? heroName(t.h) : t.name);

// ---------- frame waits for the async actions ----------
function waitF(n) { return new Promise((res) => B.waits.push({ n: Math.max(1, Math.round(n)), res })); }
const waitFx = async () => { while (B.fx.length || B.nums.some((d) => d.t < 30)) await waitF(1); };

// ---------- numbers and effects ----------
function num(t, v, col = '#f8f8f8') { const [x, y] = posOf(t); B.nums.push({ x, y: y - 6, v: String(v), col, t: 0 }); }
function fx(type, x, y, o = {}) { B.fx.push({ type, x, y, t: 0, dur: o.dur || 30, ...o }); }
function banner(s) { B.banner = { s, t: 0 }; }

// ---------- stats in battle ----------
function fs(t) { // fighter stats
  if (t.kind === 'hero') { const s = stats(t.h); return { ...s, lv: t.h.lv, hp: t.h.hp }; }
  const d = t.d; return { atk: d.atk, def: d.def, mag: d.mag, mdef: d.mdef, spd: d.spd, lv: d.lv, el: null };
}
function hpOf(t) { return t.kind === 'hero' ? t.h.hp : t.hp; }
function maxOf(t) { return t.kind === 'hero' ? stats(t.h).maxhp : t.maxhp; }
function setHp(t, v) { v = Math.max(0, Math.min(maxOf(t), Math.round(v))); if (t.kind === 'hero') t.h.hp = v; else t.hp = v; }
function elMul(t, el) {
  if (!el || t.kind === 'hero') { if (el && t.kind === 'hero' && stats(t.h).resist === el) return 0.5; return 1; }
  const d = t.d;
  if (d.absorb && d.absorb.includes(el)) return -1;
  if (d.weak && d.weak.includes(el)) return 2;
  if (d.resist && d.resist.includes(el)) return 0.5;
  if (d.undead && el === 'holy') return 2;
  return 1;
}

// deal damage (negative heals); returns the number dealt
function hurt(t, dmg, { col, magic, physical, el } = {}) {
  if (t.kind === 'foe' && !t.alive) return 0;
  dmg = Math.round(dmg);
  if (dmg < 0) { setHp(t, hpOf(t) - dmg); num(t, -dmg, '#80f8a0'); return dmg; }
  if (t.kind === 'foe' && t.d.boss === 'elder' && dmg > 0) t.hitSince++;
  if (t.d && t.d.boss === 'elder') dmg = Math.min(dmg, 99);
  dmg = Math.min(9999, Math.max(0, dmg));
  setHp(t, hpOf(t) - dmg);
  num(t, dmg, col || '#f8f8f8');
  if (physical && t.st.sleep) { delete t.st.sleep; }
  if (t.kind === 'foe') { t.hurt = 14; if (t.hp <= 0) killFoe(t); }
  else { t.hurtT = 14; if (t.h.hp <= 0) killHero(t); }
  void magic; void el;
  return dmg;
}
function killFoe(f) {
  if (f.d.boss && bossDeath(f)) return;
  f.alive = false; f.fade = 1; sfx('die');
}
function killHero(p) { p.st = {}; p.gauge = 0; p.ready = false; p.cast = null; p.air = null; p.focus = 0; B.ready = B.ready.filter((x) => x !== p); if (B.menu && B.menu.p === p) B.menu = null; if (B.cover && (B.cover.by === p || B.cover.on === p)) B.cover = null; }

function physical(a, t, mult = 1, { ignoreRow = false } = {}) {
  const sa = fs(a), st = fs(t);
  // blindness and dodging
  let miss = 0.04 + Math.max(0, (st.spd - sa.spd) * 0.006);
  if (a.st.blind) miss += 0.45;
  if (t.st.sleep) miss = 0;
  if (Math.random() < miss) { num(t, L('落空', 'Miss'), '#c0c8f0'); sfx('miss'); return 0; }
  const crit = Math.random() < 0.05;
  let d = sa.atk * 2 * rand(0.875, 1.125) - (crit ? 0 : st.def * 1.1);
  if (d < 1) d = rand(1, 4);
  if (crit) d *= 1.5;
  d *= mult;
  if (a.kind === 'hero' && !ignoreRow && a.h.row === 'back') d *= 0.5;
  if (t.kind === 'hero' && !ignoreRow && t.h.row === 'back') d *= 0.5;
  if (t.st.protect) d *= 0.5;
  if (t.parry) d *= 0.5;
  if (a.kind === 'hero') { const m = elMul(t, sa.el); if (m < 0) { hurt(t, d * m); return 0; } d *= m; }
  sfx(crit ? 'crit' : 'hit');
  return hurt(t, d, { physical: true, col: crit ? '#f8e070' : undefined });
}
function magical(a, t, power, el, { split = false, scale = 14 } = {}) {
  const sa = fs(a), st = fs(t);
  let d = power * (1 + sa.mag / scale) * rand(0.92, 1.08) - st.mdef * (a.kind === 'hero' ? 0.9 : 1.2);
  if (d < 1) d = rand(1, 5);
  if (split) d *= 0.55;
  if (t.st.ward) d *= 0.5;
  const m = elMul(t, el);
  if (m < 0) return hurt(t, d * m);
  d *= m;
  return hurt(t, d, { magic: true, el, col: m > 1 ? '#f8c050' : undefined });
}
const healAmt = (a, power, split) => Math.round(power * (1 + fs(a).mag / 12) * rand(0.95, 1.05) * (split ? 0.6 : 1));

function giveStatus(t, st, hit = 1) {
  if (t.kind === 'hero' && stats(t.h).immune) { num(t, L('無效', 'Null'), '#c0c8f0'); return false; }
  if (t.kind === 'foe' && t.d.boss && ['sleep', 'mute', 'slow'].includes(st) && Math.random() < 0.85) { num(t, L('無效', 'Null'), '#c0c8f0'); return false; }
  if (Math.random() > hit) { num(t, L('落空', 'Miss'), '#c0c8f0'); return false; }
  t.st[st] = st === 'sleep' ? 420 : 1;
  if (st === 'haste') delete t.st.slow; if (st === 'slow') delete t.st.haste;
  num(t, STNAME[st] ? STNAME[st]() : st, '#e0a0f8');
  return true;
}
const STNAME = { poison: () => L('中毒', 'Poison'), sleep: () => L('睡眠', 'Sleep'), blind: () => L('黑暗', 'Blind'), mute: () => L('沉默', 'Mute'), slow: () => L('減速', 'Slow'), haste: () => L('加速', 'Haste'), protect: () => L('護壁', 'Protect'), ward: () => L('魔障', 'Ward'), regen: () => L('再生', 'Regen') };

// ---------- the time gauges ----------
function rate(t) {
  const sp = fs(t).spd;
  let r = (sp + 10) * 0.3 * SPEEDS[settings.speed];
  if (t.st.haste) r *= 1.5; if (t.st.slow) r *= 0.5;
  return r;
}
function paused() {
  if (B.cur || B.result || B.introT > 0 || B.msg) return true;
  if (settings.mode === 'wait' && B.menu && B.menu.stage !== 'cmd') return true;
  return false;
}
function tickGauges() {
  for (const p of B.party) {
    if (p.h.hp <= 0) continue;
    if (p.st.sleep) { p.st.sleep -= SPEEDS[settings.speed]; if (p.st.sleep <= 0) delete p.st.sleep; continue; }
    if (p.air) { p.air.t -= SPEEDS[settings.speed]; if (p.air.t <= 0 && !p.air.queued) { p.air.queued = true; B.queue.push({ actor: p, type: 'land' }); } continue; }
    if (p.cast) { p.cast.t -= SPEEDS[settings.speed]; if (p.cast.t <= 0 && !p.cast.queued) { p.cast.queued = true; B.queue.push(p.cast.act); } continue; }
    if (p.ready || B.queue.some((a) => a.actor === p)) continue;
    p.gauge += rate(p);
    if (p.gauge >= 1000) { p.gauge = 1000; turnStart(p); if (p.h.hp > 0) { p.ready = true; B.ready.push(p); } }
  }
  for (const f of B.foes) {
    if (!f.alive) continue;
    if (f.st.sleep) { f.st.sleep -= SPEEDS[settings.speed]; if (f.st.sleep <= 0) delete f.st.sleep; continue; }
    if (B.queue.some((a) => a.actor === f)) continue;
    f.gauge += rate(f);
    if (f.gauge >= 1000) { f.gauge = 0; B.queue.push({ actor: f, type: 'foe' }); }
  }
}
// poison and regeneration take effect as a turn starts
function turnStart(t) {
  if (t.st.poison) { const d = Math.max(1, Math.floor(maxOf(t) / 16)); hurt(t, d, { col: '#c080f8' }); }
  if (t.st.regen) hurt(t, -Math.max(1, Math.floor(maxOf(t) / 12)));
  if (t.parry) t.parry = false;
  if (t.kind === 'hero' && B.cover && B.cover.by === t) B.cover = null;
}

// ---------- the command menu ----------
function openMenu() {
  if (B.menu || B.result || B.cur && B.cur.blocking) return;
  const p = B.ready[0];
  if (!p) return;
  if (_B.auto) { autoAct(p); return; }
  B.menu = { p, stage: 'cmd', i: 0, cmds: cmdsOf(p.h) };
  sfx('cursor');
}
function closeMenuFor(p, act) {
  B.ready = B.ready.filter((x) => x !== p); p.ready = false; B.menu = null;
  if (act) {
    const castT = act.cast ? act.cast * 60 : 0;
    if (castT > 0) { p.cast = { t: castT, act, queued: false }; }
    else B.queue.push(act);
  }
}
// a stand-in player for automated tests: heals when hurt, revives, uses each friend's best trick
function autoAct(p) {
  const foes = liveFoes();
  if (!foes.length) return;
  const h = p.h, mp = h.mp, heroes = B.party;
  const low = heroes.filter((q) => q.h.hp > 0 && q.h.hp < stats(q.h).maxhp * 0.45);
  const dead = heroes.filter((q) => q.h.hp <= 0);
  const known = [...spellsOf(h), ...callsOf(h), ...gadgetsOf(h)].filter((id) => SPELLS[id].mp <= mp && !(p.st.mute && !SPELLS[id].gadget));
  const act = (o) => closeMenuFor(p, { actor: p, ...o });
  const spell = (id, targets) => act({ type: 'spell', id, targets, side: ['foe', 'foes'].includes(SPELLS[id].tgt) ? 'foe' : 'ally', split: targets.length > 1 && !['foes', 'allies'].includes(SPELLS[id].tgt), cast: SPELLS[id].cast });
  if (dead.length && known.includes('raise')) return spell(known.includes('arise') ? 'arise' : 'raise', [dead[0]]);
  if (dead.length && count('phoenix') && (h.id === 'miel' || h.id === 'tal' || h.id === 'dorrin' || heroes.filter((q) => q.h.hp > 0).length <= 2)) return act({ type: 'item', id: 'phoenix', targets: [dead[0]], side: 'ally' });
  if (low.length) {
    const heals = ['curaga', 'cura', 'cure', 'elder', 'patch'].filter((id) => known.includes(id));
    if (heals.length) { const id = heals[0]; return spell(id, SPELLS[id].tgt === 'allies' ? liveHeroes() : low.length > 1 && SPELLS[id].multi ? liveHeroes() : [low[0]]); }
    if (h.id !== 'nyra' && count('hipotion') && low[0].h.hp < stats(low[0].h).maxhp * 0.3) return act({ type: 'item', id: 'hipotion', targets: [low[0]], side: 'ally' });
    if (count('potion') && low[0].h.hp < stats(low[0].h).maxhp * 0.3 && h.id !== 'nyra') return act({ type: 'item', id: 'potion', targets: [low[0]], side: 'ally' });
  }
  if (foes.some((f) => f.d.boss === 'elder')) { p.parry = true; closeMenuFor(p, null); p.gauge = 0; return; }
  const t = foes.slice().sort((a, b) => a.hp - b.hp)[0];
  const big = foes.reduce((a, f) => a + f.hp, 0) > 300 || B.boss;
  if (h.id === 'hale' && !isDawn(h) && foes.length >= 3 && h.hp > stats(h).maxhp * 0.5) return act({ type: 'ashedge' });
  if (h.id === 'brin' && Math.random() < 0.35) return act({ type: 'leap', target: t });
  if (h.id === 'tal' && p.focus < 1 && B.boss) return act({ type: 'focus' });
  if (h.id === 'tal' && foes.length >= 3) return act({ type: 'kick' });
  if (h.id === 'miel' && !B.boss) return act({ type: 'fight', target: t });
  if (h.id === 'miel' && known.includes('protect') && !B.party.some((q) => q.st.protect) && Math.random() < 0.5) return spell('protect', liveHeroes());
  const offensive = known.filter((id) => ['dmg', 'summon'].includes(SPELLS[id].kind) && !SPELLS[id].heal && SPELLS[id].power > 0 && (big || foes.length > 1));
  if (offensive.length && ['nyra', 'gowan', 'dorrin'].includes(h.id)) {
    const score = (id) => { const d = SPELLS[id]; const n = d.tgt === 'foes' ? foes.length : 1; const w = d.el && t.d.weak && t.d.weak.includes(d.el) ? 2 : d.el && t.d.absorb && t.d.absorb.includes(d.el) ? -1 : 1; return d.power * n * w / Math.max(4, d.mp); };
    const id = offensive.sort((a, b) => score(b) - score(a))[0];
    if (score(id) > 0 && (mp > stats(h).maxmp * 0.25 || B.boss)) return spell(id, SPELLS[id].tgt === 'foes' ? foes : [t]);
  }
  if (h.id === 'gowan' && Math.random() < 0.2) return act({ type: 'recall', cast: 0.6 });
  act({ type: 'fight', target: t });
}
function listFor(p, cmd) {
  const h = p.h, s = stats(h);
  const sp = (id) => { const d = SPELLS[id]; const mute = p.st.mute && !d.gadget; return { id, label: nm(d), right: d.mp, disabled: d.mp > h.mp || mute || (d.kind === 'heal' && d.tgt === 'allies' && false) }; };
  if (cmd === 'white') return spellsOf(h).filter((id) => !BLACK.has(id)).map(sp);
  if (cmd === 'black') return spellsOf(h).filter((id) => BLACK.has(id)).map(sp);
  if (cmd === 'call') return callsOf(h).map(sp);
  if (cmd === 'gadget') return gadgetsOf(h).map(sp);
  if (cmd === 'item') return Object.keys(S.inv).filter((k) => ITEMS[k].use && !ITEMS[k].field && !ITEMS[k].key).map((k) => ({ id: k, label: nm(ITEMS[k]), right: S.inv[k], item: true }));
  void s;
  return [];
}
// the targets a choice can reach
function targetSpec(kind, def) {
  // returns { side: 'foe'|'ally', multi, all, dead }
  if (kind === 'fight' || kind === 'leap') return { side: 'foe' };
  if (kind === 'cover') return { side: 'ally', notSelf: true };
  if (!def) return { side: 'foe' };
  const side = ['foe', 'foes'].includes(def.tgt) ? 'foe' : 'ally';
  return { side, multi: !!def.multi, all: def.tgt === 'foes' || def.tgt === 'allies', dead: !!def.dead, self: def.tgt === 'self' };
}
function startTarget(m, spec) {
  m.stage = 'target'; m.spec = spec; m.side = spec.side; m.all = !!spec.all; m.ti = 0;
  const list = targetList(m);
  if (m.side === 'ally') { const me = list.indexOf(m.p); m.ti = me >= 0 && !spec.notSelf ? me : 0; if (spec.dead) { const d = list.findIndex((x) => x.h.hp <= 0); if (d >= 0) m.ti = d; } }
}
function targetList(m) {
  if (m.side === 'foe') return liveFoes().sort((a, b) => a.x - b.x || a.y - b.y);
  return B.party.filter((p) => (m.spec.dead ? true : p.h.hp > 0) && !p.air && !(m.spec.notSelf && p === m.p));
}
function updateMenu() {
  const m = B.menu;
  if (!m) return;
  const p = m.p;
  if (p.h.hp <= 0 || p.st.sleep) { B.menu = null; return; }
  if (m.stage === 'cmd') {
    const n = m.cmds.length;
    if (input.repeat('down')) { m.i = (m.i + 1) % n; sfx('cursor'); }
    if (input.repeat('up')) { m.i = (m.i + n - 1) % n; sfx('cursor'); }
    if (input.pressed('left')) { sfx('ok'); p.h.row = p.h.row === 'back' ? 'front' : 'back'; closeMenuFor(p, null); p.gauge = 0; return; }
    if (input.pressed('right')) { sfx('ok'); p.parry = true; num(p, L('防禦', 'Guard'), '#c0e0f8'); closeMenuFor(p, null); p.gauge = 0; return; }
    if (input.pressed('b') && B.ready.length > 1) { B.ready.push(B.ready.shift()); B.menu = null; sfx('cursor'); return; }
    if (input.pressed('a')) {
      const c = m.cmds[m.i];
      m.cmd = c;
      if (c === 'fight') { sfx('ok'); startTarget(m, targetSpec('fight')); return; }
      if (c === 'ashedge') { sfx('ok'); closeMenuFor(p, { actor: p, type: 'ashedge' }); return; }
      if (c === 'leap') { sfx('ok'); startTarget(m, targetSpec('leap')); return; }
      if (c === 'focus') { sfx('ok'); closeMenuFor(p, { actor: p, type: 'focus' }); return; }
      if (c === 'kick') { sfx('ok'); closeMenuFor(p, { actor: p, type: 'kick' }); return; }
      if (c === 'pray') { sfx('ok'); closeMenuFor(p, { actor: p, type: 'pray' }); return; }
      if (c === 'recall') { sfx('ok'); closeMenuFor(p, { actor: p, type: 'recall', cast: 0.6 }); return; }
      if (c === 'cover') { sfx('ok'); startTarget(m, targetSpec('cover')); if (!targetList(m).length) { sfx('buzz'); m.stage = 'cmd'; } return; }
      const list = listFor(p, c);
      if (!list.length) { sfx('buzz'); return; }
      sfx('ok'); m.stage = 'list'; m.list = list; m.li = Math.min(m.lastLi || 0, list.length - 1); m.scroll = 0;
    }
    return;
  }
  if (m.stage === 'list') {
    const n = m.list.length;
    if (input.repeat('down')) { m.li = Math.min(n - 1, m.li + 2); sfx('cursor'); }
    if (input.repeat('up')) { m.li = Math.max(0, m.li - 2); sfx('cursor'); }
    if (input.repeat('right') && m.li % 2 === 0 && m.li + 1 < n) { m.li++; sfx('cursor'); }
    if (input.repeat('left') && m.li % 2 === 1) { m.li--; sfx('cursor'); }
    if (input.pressed('b')) { sfx('cancel'); m.stage = 'cmd'; return; }
    if (input.pressed('a')) {
      const it = m.list[m.li];
      if (it.disabled) { sfx('buzz'); return; }
      m.lastLi = m.li;
      sfx('ok'); m.sel = it;
      const def = it.item ? ITEMS[it.id] : SPELLS[it.id];
      const spec = targetSpec(it.item ? 'item' : 'spell', def);
      if (spec.self) { closeMenuFor(p, makeAct(m, [p])); return; }
      startTarget(m, spec);
      if (!targetList(m).length) { sfx('buzz'); m.stage = 'list'; }
    }
    return;
  }
  if (m.stage === 'target') {
    let list = targetList(m);
    if (!list.length) { m.stage = 'cmd'; return; }
    if (m.ti >= list.length) m.ti = 0;
    const canAll = m.spec.multi;
    if (input.repeat('down') || input.repeat('up')) {
      if (!m.all) { m.ti = (m.ti + (input.repeat('down') ? 1 : list.length - 1)) % list.length; }
      sfx('cursor');
    }
    // left/right: move across, flip sides, and spread over everyone
    if (input.pressed('left')) {
      if (m.side === 'ally') { if (m.all) { m.all = false; } else if (!m.spec.dead) { m.side = 'foe'; m.ti = 0; m.all = false; } }
      else if (canAll) m.all = true;
      else if (m.ti > 0) m.ti--;
      sfx('cursor');
    }
    if (input.pressed('right')) {
      if (m.side === 'foe') { if (m.all) m.all = false; else if (!m.spec.notSelf) { m.side = 'ally'; m.ti = 0; } }
      else if (canAll) m.all = true;
      sfx('cursor');
    }
    if (m.spec.all) m.all = true;
    list = targetList(m);
    if (!list.length) { m.side = m.side === 'foe' ? 'ally' : 'foe'; return; }
    if (input.pressed('b')) { sfx('cancel'); m.stage = m.sel ? 'list' : 'cmd'; m.sel = m.stage === 'list' ? m.sel : null; return; }
    if (input.pressed('a')) {
      sfx('ok');
      const targets = m.all ? list : [list[Math.min(m.ti, list.length - 1)]];
      if (m.cmd === 'fight') closeMenuFor(p, { actor: p, type: 'fight', target: targets[0] });
      else if (m.cmd === 'leap') closeMenuFor(p, { actor: p, type: 'leap', target: targets[0] });
      else if (m.cmd === 'cover') closeMenuFor(p, { actor: p, type: 'cover', target: targets[0] });
      else closeMenuFor(p, makeAct(m, targets));
    }
  }
}
function makeAct(m, targets) {
  const it = m.sel;
  if (it.item) return { actor: m.p, type: 'item', id: it.id, targets, side: m.side };
  const d = SPELLS[it.id];
  return { actor: m.p, type: 'spell', id: it.id, targets, side: m.side, split: targets.length > 1 && !(d.tgt === 'foes' || d.tgt === 'allies'), cast: d.cast };
}

// ---------- running actions ----------
async function runAction(a) {
  const t = a.actor;
  if (t.kind === 'hero' && (t.h.hp <= 0)) return;
  if (t.kind === 'foe' && !t.alive) return;
  if (t.kind === 'hero' && t.st.sleep) return;
  B.cur = a;
  try {
    if (t.kind === 'foe') await foeTurn(t);
    else await heroAct(a);
  } catch (e) { console.error(e); }
  await waitFx();
  if (t.kind === 'hero') { t.dx = 0; t.pose = 0; if (a.type !== 'leap') t.gauge = 0; t.cast = null; }
  B.cur = null;
  checkEnd();
}
async function stepOut(p) { for (let i = 0; i < 6; i++) { p.dx -= 2; p.pose = (i >> 1) % 2 ? 1 : 2; await waitF(1); } }
async function stepBack(p) { for (let i = 0; i < 6; i++) { p.dx += 2; p.pose = (i >> 1) % 2 ? 1 : 2; await waitF(1); } p.dx = 0; p.pose = 0; }
function retarget(t, side = 'foe') {
  if (t && (t.kind === 'foe' ? t.alive : t.h.hp > 0) && !t.air) return t;
  const l = side === 'foe' ? liveFoes() : liveHeroes();
  return l.length ? pick(l) : null;
}

async function heroAct(a) {
  const p = a.actor, h = p.h, s = stats(h);
  switch (a.type) {
    case 'fight': {
      const t = retarget(a.target);
      if (!t) return;
      await stepOut(p);
      p.swing = 10;
      const [x, y] = posOf(t); fx('hit', x, y, { dur: 12 });
      let mult = 1;
      if (p.focus) { mult = 1 + p.focus; p.focus = 0; }
      physical(p, t, mult);
      if (h.id === 'tal' && t.alive && Math.random() < 0.35) { await waitF(10); fx('hit', x, y, { dur: 12 }); physical(p, t, 0.7); }
      await waitF(16);
      await stepBack(p);
      return;
    }
    case 'ashedge': {
      banner(nm({ n: CMD.ashedge }));
      const cost = Math.max(1, Math.floor(s.maxhp / 10));
      await stepOut(p);
      h.hp = Math.max(1, h.hp - cost); num(p, cost, '#c080f8');
      sfx('drain'); B.flashScr = 6;
      for (const t of liveFoes()) { const [x, y] = posOf(t); fx('ash', x, y, { dur: 24 }); }
      await waitF(14);
      for (const t of liveFoes()) physical(p, t, 0.85, { ignoreRow: true });
      await waitF(16); await stepBack(p);
      return;
    }
    case 'leap': {
      banner(nm({ n: CMD.leap }));
      sfx('slide');
      for (let i = 0; i < 12; i++) { p.dy -= 14; await waitF(1); }
      p.air = { t: 80, target: a.target, queued: false };
      p.gauge = 0;
      return;
    }
    case 'land': {
      const t = retarget(p.air && p.air.target);
      p.air = null;
      if (!t) { p.dy = 0; return; }
      const [x, y] = posOf(t);
      const sx = heroX(p);
      p.dx = x - sx - 8; p.dy = -180;
      for (let i = 0; i < 10; i++) { p.dy += 18; await waitF(1); }
      fx('hit', x, y, { dur: 16 }); B.shake = 8;
      physical(p, t, 2, { ignoreRow: true });
      await waitF(14);
      p.dx = 0; p.dy = 0;
      return;
    }
    case 'focus': {
      p.focus = Math.min(2, p.focus + 1);
      banner(nm({ n: CMD.focus })); sfx('buff');
      fx('buff', heroX(p) + 8, heroY(p) + 8, { dur: 24, col: '#f8d070' });
      num(p, L(`蓄力 ×${p.focus + 1}`, `Power ×${p.focus + 1}`), '#f8d070');
      await waitF(20);
      return;
    }
    case 'kick': {
      banner(nm({ n: CMD.kick }));
      await stepOut(p);
      for (const t of liveFoes()) { const [x, y] = posOf(t); fx('hit', x, y, { dur: 12 }); }
      await waitF(6);
      for (const t of liveFoes()) physical(p, t, 0.65, { ignoreRow: true });
      await waitF(16); await stepBack(p);
      return;
    }
    case 'pray': {
      banner(nm({ n: CMD.pray }));
      p.pose = 3; await waitF(20);
      if (Math.random() < 0.75) { sfx('heal'); for (const q of liveHeroes()) { fx('heal', heroX(q) + 8, heroY(q) + 8); } await waitF(18); for (const q of liveHeroes()) hurt(q, -healAmt(p, 14, false)); }
      else { await say(L('什麼事也沒發生……', 'Nothing happened...')); }
      return;
    }
    case 'recall': {
      const ok = Math.random() < (S.flags.gowan_remembers ? 0.8 : 0.45);
      if (!ok) { await say(L('高文想不起來……', "Gowan can't remember...")); return; }
      const id = pick(S.flags.gowan_remembers ? ['firaga', 'icega', 'boltga', 'quake', 'drain', 'starfall'] : ['fira', 'icera', 'bolta', 'quake', 'drain', 'sleep']);
      const d = SPELLS[id];
      const targets = d.tgt === 'foe' && !d.multi ? [pick(liveFoes())] : liveFoes();
      await castSpell(p, id, targets, { free: true, split: false, side: 'foe' });
      return;
    }
    case 'cover': {
      const t = a.target;
      if (!t || t.h.hp <= 0) return;
      B.cover = { by: p, on: t };
      banner(nm({ n: CMD.cover })); sfx('buff');
      fx('buff', heroX(t) + 8, heroY(t) + 8, { dur: 24, col: '#f8f0b0' });
      await waitF(16);
      return;
    }
    case 'spell': {
      await castSpell(p, a.id, a.targets, { split: a.split, side: a.side });
      return;
    }
    case 'item': {
      if (!count(a.id)) { await say(L('道具用完了。', 'None left.')); return; }
      const it = ITEMS[a.id];
      addItem(a.id, -1);
      banner(nm(it));
      p.pose = 3; await waitF(10);
      for (const t0 of a.targets) {
        const t = t0;
        if (it.use === 'dmg') { for (const f of liveFoes()) { const [x, y] = posOf(f); fx(it.el === 'ice' ? 'ice' : 'fire', x, y); } await waitF(20); for (const f of liveFoes()) { let d = it.power * rand(0.9, 1.1) * elMulSafe(f, it.el); if (d < 0) hurt(f, d); else hurt(f, d); } break; }
        const [x, y] = posOf(t);
        if (it.use === 'revive') { if (t.kind === 'hero' && t.h.hp <= 0) { fx('heal', x, y); await waitF(10); setHp(t, maxOf(t) * it.power); num(t, L('復活', 'Revived'), '#80f8a0'); t.gauge = 0; } else num(t, L('無效', 'No effect'), '#c0c8f0'); continue; }
        if (t.kind === 'hero' && t.h.hp <= 0) continue;
        fx('heal', x, y);
        if (it.use === 'heal') { sfx('heal'); hurt(t, -Math.min(it.power, maxOf(t))); }
        if (it.use === 'mp') { sfx('heal'); const mx = stats(t.h).maxmp; t.h.mp = Math.min(mx, t.h.mp + it.power); num(t, it.power, '#80c0f8'); }
        if (it.use === 'cure') { sfx('heal'); for (const k of it.st) delete t.st[k]; num(t, L('治好了', 'Cured'), '#80f8a0'); }
        if (it.use === 'full') { sfx('heal'); setHp(t, maxOf(t)); t.h.mp = stats(t.h).maxmp; num(t, L('全回復', 'Full'), '#80f8a0'); }
      }
      await waitF(16);
      return;
    }
    default: return;
  }
}
const elMulSafe = (t, el) => elMul(t, el);

async function castSpell(p, id, targets, { free = false, split = false, side } = {}) {
  const d = SPELLS[id], h = p.h;
  if (!free) {
    if (h.mp < d.mp) { await say(L('魔力不足。', 'Not enough MP.')); return; }
    if (p.st.mute && !d.gadget) { await say(L('沉默中，無法施法。', 'Silenced. No spell comes out.')); return; }
    h.mp -= d.mp;
  }
  banner(nm(d));
  p.pose = 3;
  if (!d.gadget) { sfx('special'); fx('cast', heroX(p) + 8, heroY(p) + 8, { dur: 18 }); await waitF(16); }
  else { await stepOut(p); }
  // the targets may have changed while the spell was charging
  if (d.tgt === 'foes') targets = liveFoes();
  else if (d.tgt === 'allies') targets = liveHeroes();
  else targets = targets.map((t) => (d.dead ? t : retarget(t, side === 'ally' ? 'hero' : 'foe'))).filter(Boolean);
  if (d.tgt === 'foe' && side === 'foe') targets = [...new Set(targets)];
  if (!targets.length) { if (d.gadget) await stepBack(p); return; }
  // summons stand in the field for a moment
  if (d.kind === 'summon') {
    sfx('warp'); B.flashScr = 10;
    B.summon = { art: monArt(d.art, d.look), t: 0 };
    await waitF(50);
  }
  for (const t of targets) { const [x, y] = posOf(t); fx(d.fx || 'hit', x, y, { dur: 30 }); }
  sfx(d.el === 'fire' ? 'fire' : d.el === 'ice' ? 'ice' : d.el === 'bolt' ? 'bolt' : d.el === 'holy' ? 'holy' : d.fx === 'quake' ? 'quake' : d.fx === 'boom' ? 'boom' : d.kind === 'heal' || d.heal ? 'heal' : 'buff');
  if (d.fx === 'quake' || d.fx === 'boom' || d.fx === 'star') B.shake = 16;
  await waitF(22);
  const sp = split && targets.length > 1;
  for (const t of targets) {
    switch (d.kind) {
      case 'dmg': magical(p, t, d.power, d.el, { split: sp, scale: d.gadget ? 20 : 14 }); if (d.st && t.alive !== false && hpOf(t) > 0) giveStatus(t, d.st, d.hit); break;
      case 'summon': if (d.heal) { hurt(t, -healAmt(p, d.power, false)); t.st.regen = 1; } else magical(p, t, d.power, d.el, { scale: 12 }); break;
      case 'heal': if (t.kind === 'foe' && t.d.undead) magical(p, t, d.power, 'holy'); else if (hpOf(t) > 0) hurt(t, -healAmt(p, d.power, sp)); break;
      case 'revive': if (t.kind === 'hero' && t.h.hp <= 0) { setHp(t, maxOf(t) * d.power); num(t, L('復活', 'Revived'), '#80f8a0'); t.gauge = 0; } else num(t, L('無效', 'No effect'), '#c0c8f0'); break;
      case 'cure': for (const k of d.st) delete t.st[k]; num(t, L('治好了', 'Cured'), '#80f8a0'); break;
      case 'buff': giveStatus(t, d.st, 1); break;
      case 'status': giveStatus(t, d.st, d.hit); break;
      case 'drain': { const dealt = magical(p, t, d.power, null); if (dealt > 0) hurt(p, -Math.round(dealt * 0.5)); break; }
      case 'phys': physical(p, t, d.power, { ignoreRow: true }); break;
      default: break;
    }
  }
  await waitF(14);
  B.summon = null;
  if (d.gadget) await stepBack(p);
}

// ---------- monsters ----------
function chooseFoeAct(f) {
  const d = f.d;
  const boss = BOSS_AI[d.boss];
  if (boss) { const r = boss(f); if (r) return r; }
  const acts = d.acts || [['atk', 1]];
  if (f.st.mute) { const phys = acts.filter(([a]) => a === 'atk' || (FSK[a] && FSK[a].kind === 'phys')); if (phys.length) return weighted(phys); }
  return weighted(acts);
}
function weighted(acts) { const tot = acts.reduce((s, [, w]) => s + w, 0); let r = Math.random() * tot; for (const [a, w] of acts) { r -= w; if (r <= 0) return a; } return acts[0][0]; }

async function foeTurn(f) {
  f.turns++;
  B.round++;
  turnStart(f);
  if (!f.alive) return;
  const act = chooseFoeAct(f);
  if (act === 'wait') return;
  if (typeof act === 'object' && act.say) { await say(act.say); if (!act.then) return; }
  const id = typeof act === 'object' ? act.then : act;
  const k = id === 'atk' ? null : FSK[id];
  // flash to show who acts
  f.blink = 16; await waitF(16);
  if (k) banner(nm(k));
  const heroes = liveHeroes();
  if (!heroes.length) return;
  const pickHero = () => { const l = liveHeroes(); const front = l.filter((p) => p.h.row !== 'back'); return pick(front.length && Math.random() < 0.7 ? front : l); };
  if (!k) { await foeHit(f, pickHero(), 1); return; }
  if (k.kind === 'nothing') { await say(L(`${f.name}靜靜地注視著你們。`, `${f.name} watches you quietly.`)); return; }
  if (k.kind === 'phys') {
    const ts = k.tgt === 'all' ? liveHeroes() : [pickHero()];
    for (const t of ts) { const [x, y] = posOf(t); fx('claw', x, y, { dur: 14 }); }
    await waitF(8);
    for (const t of ts) await foeHit(f, t, k.power, { noFx: true, st: k.st, hit: k.hit, multi: ts.length > 1 });
    return;
  }
  if (k.kind === 'magic' || k.kind === 'status' || k.kind === 'drain') {
    const ts = k.tgt === 'all' ? liveHeroes() : [pickHero()];
    for (const t of ts) { const [x, y] = posOf(t); fx(k.fx || 'dark', x, y, { dur: 30 }); }
    sfx(k.el === 'fire' ? 'fire' : k.el === 'ice' ? 'ice' : k.el === 'bolt' ? 'bolt' : k.fx === 'quake' ? 'quake' : 'drain');
    if (k.fx === 'quake' || k.fx === 'star') B.shake = 14;
    await waitF(24);
    for (const t of ts) {
      if (k.kind === 'magic') magical(f, t, k.power, k.el, { scale: 40, split: false });
      else if (k.kind === 'drain') { const dealt = magical(f, t, k.power, null, { scale: 40 }); if (dealt > 0) hurt(f, -dealt); }
      else giveStatus(t, k.st, k.hit);
    }
    return;
  }
  if (k.kind === 'heal') { sfx('heal'); const [x, y] = posOf(f); fx('heal', x, y); await waitF(16); hurt(f, -Math.round(f.maxhp * k.power)); return; }
  if (k.kind === 'buff') {
    const ts = k.tgt === 'allfoes' ? liveFoes() : [f];
    sfx('buff'); for (const t of ts) { const [x, y] = posOf(t); fx('buff', x, y); }
    await waitF(16); for (const t of ts) giveStatus(t, k.st, 1);
  }
}
async function foeHit(f, t, mult, { noFx = false, st, hit, multi } = {}) {
  if (!t) return;
  // a Dawn Knight steps in front of the one he covers
  if (B.cover && B.cover.on === t && B.cover.by.h.hp > 0 && !B.cover.by.st.sleep && !multi) {
    const c = B.cover.by;
    num(c, L('掩護', 'Cover'), '#f8f0b0');
    c.dy = heroY(t) - heroY(c); c.dx = -8;
    t = c;
  }
  const [x, y] = posOf(t);
  if (!noFx) { fx('claw', x, y, { dur: 14 }); await waitF(8); }
  const dealt = physical(f, t, mult * (t === (B.cover && B.cover.by) && B.cover.on !== t ? 0.75 : 1));
  if (st && dealt > 0 && t.h.hp > 0) giveStatus(t, st, hit || 1);
  await waitF(10);
  if (B.cover && t === B.cover.by) { t.dx = 0; t.dy = 0; }
}

// ---------- bosses ----------
const BOSS_AI = {
  tidewyrm(f) { if (f.turns % 3 === 0) return 'wave'; return null; },
  golem(f) { if (f.turns % 3 === 0) return 'quake2'; return null; },
  garrick(f) { if (f.hp < f.maxhp * 0.4 && !f.shouted) { f.shouted = true; return 'shout'; } return null; },
  stonebak(f) { if (f.turns === 1) return { say: L('石龜擋在奈菈前面，殼上的苔蘚亮了起來。', 'The tortoise plants itself in front of Nyra. The moss on its shell glows.'), then: 'shell' }; return null; },
  brin(f) { if (f.turns % 3 === 0) return 'leapfoe'; return null; },
  warden(f) { if (f.hp < f.maxhp * 0.5 && f.turns % 3 === 0) return 'frost'; if (f.turns % 4 === 0) return 'thornbind'; return null; },
  aldous(f) { if (f.turns % 3 === 0) return 'hush'; return null; },
  morvane(f) {
    if (f.hp < f.maxhp * 0.5 && !f.half) { f.half = true; return { say: L('莫凡：「區區凡人……燼月的火，會把你們連同名字一起燒光！」', 'Morvane: "Mere mortals... The Ember\'s fire will burn you away, names and all!"'), then: 'thunder2' }; }
    if (f.turns % 5 === 0) return 'mindbrand';
    return null;
  },
  ember(f) {
    if (f.charge) { f.charge = 0; return 'nova'; }
    const every = f.hp < f.maxhp * 0.4 ? 3 : 5;
    if (f.turns % every === 0) { f.charge = 1; return { say: L('燼月之心的光芒越來越亮……它在凝聚力量！', 'The Ember Heart burns brighter and brighter... It is gathering its power!') }; }
    return null;
  },
  elder(f) {
    // the trial: it answers every blow; it only yields to those who stop striking
    if (f.hitSince > 0) { f.hitSince = 0; f.calm = 0; return { say: L('古棘：「你的劍，還在渴望鮮血。」', 'Elder Thorn: "Your blade still thirsts for blood."'), then: 'thornlash' }; }
    f.calm++;
    if (f.calm >= 3) { B.trialPassed = true; return { say: L('古棘：「……很好。放下了劍的人，才握得住光。」', 'Elder Thorn: "...Good. Only one who lays down the blade can hold the light."') }; }
    return 'growl';
  },
};
// some bosses leave before they fall
function bossDeath(f) {
  const b = f.d.boss;
  if (b === 'stonebak' || b === 'brin' || b === 'elder') { f.hp = 1; B.result = 'win'; return true; }
  return false;
}
function bossCheck() {
  for (const f of B.foes) {
    if (!f.alive) continue;
    if (f.d.boss === 'stonebak' && f.hp < f.maxhp * 0.45) { B.result = 'win'; }
    if (f.d.boss === 'brin' && f.hp < f.maxhp * 0.3) { B.result = 'win'; }
  }
  if (B.trialPassed) B.result = 'win';
}

// ---------- the end ----------
function checkEnd() {
  if (B.result) return;
  bossCheck();
  if (B.result) return;
  if (!liveFoes().length && !B.foes.some((f) => f.fade > 0 && f.fade < 30)) B.result = 'win';
  else if (!B.party.some((p) => p.h.hp > 0)) B.result = 'lose';
}
let ending = false;
async function finish() {
  if (ending) return;
  ending = true;
  const r = B.result;
  B.menu = null;
  for (const p of B.party) { p.h.st = pickPersist(p.st); p.cast = null; p.air = null; p.dy = 0; p.dx = 0; }
  if (r === 'win' && !B.opts.noSpoils) {
    playMusic('victory', { restart: true });
    B.victory = true;
    const dead = B.foes.filter((f) => !f.alive || f.d.boss);
    let exp = 0, gold = 0; const drops = [];
    for (const f of dead) { exp += f.d.exp; gold += f.d.gold; if (f.d.drop && Math.random() < f.d.drop[1]) drops.push(f.d.drop[0]); }
    S.gold += gold;
    await waitF(30);
    if (exp) await say(L(`獲得 ${exp} 點經驗值。`, `Gained ${exp} EXP.`), true);
    if (gold) await say(L(`得到 ${gold} 金幣。`, `Found ${gold} gold.`), true);
    for (const it of drops) { addItem(it); await say(L(`得到了「${nm(ITEMS[it])}」！`, `Found ${nm(ITEMS[it])}!`), true); }
    for (const p of B.party) { for (const line of gainExp(p.h, exp)) { sfx('level'); await say(line, true); } }
  } else if (r === 'win') { await waitF(30); }
  if (r === 'run') { sfx('run'); for (let i = 0; i < 20; i++) { for (const p of B.party) p.dx += 3; await waitF(1); } }
  stopMusic(0.3);
  const done = B.done;
  B.over = true;
  ending = false;
  done(r);
}

// ---------- messages that wait for a key ----------
function say(s, needKey = false) {
  return new Promise((res) => { B.msg = { s, t: 0, res, key: needKey }; });
}

// ---------- update ----------
export function updateBattle() {
  if (!B || B.over) return;
  B.t++;
  if (B.introT > 0) B.introT--;
  if (B.shake > 0) B.shake--;
  if (B.flashScr > 0) B.flashScr--;
  // effects and numbers
  for (const e of B.fx) e.t++;
  B.fx = B.fx.filter((e) => e.t < e.dur);
  for (const d of B.nums) d.t++;
  B.nums = B.nums.filter((d) => d.t < 50);
  for (const f of B.foes) { if (f.blink) f.blink--; if (f.hurt) f.hurt--; if (!f.alive && f.fade < 40) f.fade++; }
  for (const p of B.party) { if (p.hurtT) p.hurtT--; if (p.swing) p.swing--; }
  if (B.summon) B.summon.t++;
  // frame waits
  if (B.waits.length) { const w = B.waits; B.waits = []; for (const x of w) { if (--x.n <= 0) x.res(); else B.waits.push(x); } }
  // a message on screen
  if (B.msg) {
    B.msg.t++;
    if (B.msg.key ? (B.msg.t > 8 && (input.pressed('a') || input.pressed('b') || _B.auto && B.msg.t > 20)) : B.msg.t > 60 || (B.msg.t > 10 && input.pressed('a'))) { const r = B.msg.res; B.msg = null; r(); }
    return;
  }
  if (B.result) { if (!B.cur && !B.ending) { B.ending = true; finish(); } return; }
  // running away: hold X
  if (!B.menu || B.menu.stage === 'cmd') {
    if (input.held('b') && !B.cur) { B.hold++; if (B.hold > 80) { B.hold = 0; tryRun(); } } else B.hold = 0;
  }
  if (B.menu) updateMenu();
  if (!paused()) tickGauges();
  if (!B.cur && B.queue.length) { const a = B.queue.shift(); runAction(a); }
  if (!B.menu && B.ready.length && !B.result) {
    // drop anyone who can no longer act
    B.ready = B.ready.filter((p) => p.h.hp > 0 && !p.st.sleep);
    openMenu();
  }
  checkEnd();
}
function tryRun() {
  if (B.boss || B.opts.noRun) { say(L('無法逃跑！', "Can't escape!")); return; }
  const pSpd = liveHeroes().reduce((a, p) => a + fs(p).spd, 0) / Math.max(1, liveHeroes().length);
  const fSpd = liveFoes().reduce((a, f) => a + f.d.spd, 0) / Math.max(1, liveFoes().length);
  if (Math.random() < 0.55 + (pSpd - fSpd) * 0.04) { B.result = 'run'; B.menu = null; B.queue = []; }
  else say(L('逃不掉！', "Couldn't get away!"));
}

// ---------- backdrops ----------
const BGDEF = {
  plains: { sky: ['#3cbcfc', '#a4e4fc'], far: '#00a800', ground: 'grass', band: 'tree' },
  forest: { sky: ['#005800', '#00a800'], far: '#003000', ground: 'leafy', band: 'tree' },
  cave: { sky: ['#000000', '#201008'], far: '#3c1c00', ground: 'earth', band: 'cave' },
  lake: { sky: ['#3cbcfc', '#bcbcfc'], far: '#0058f8', ground: 'grass', band: 'water' },
  shrine: { sky: ['#000040', '#0040a0'], far: '#003070', ground: 'bluetile', band: 'bluewall' },
  desert: { sky: ['#f8b800', '#fce0a8'], far: '#c86000', ground: 'sand', band: 'dmount' },
  castle: { sky: ['#101830', '#283860'], far: '#202840', ground: 'bluefloor', band: 'bluewall' },
  tower: { sky: ['#100010', '#300830'], far: '#204000', ground: 'cobble', band: 'greenbrick' },
  well: { sky: ['#000000', '#200010'], far: '#400010', ground: 'darkrock', band: 'cave', stars: true },
  burnt: { sky: ['#200000', '#782000'], far: '#300800', ground: 'ash', band: 'burnt' },
};
function makeBg(kind) {
  const d = BGDEF[kind] || BGDEF.plains, c = canvas(W, FIELD_H), g = c.x;
  for (let y = 0; y < 48; y++) { const k = Math.floor((y / 48) * 6) / 6; g.fillStyle = mixHex(d.sky[0], d.sky[1], k); g.fillRect(0, y, W, 1); }
  if (d.stars) for (let i = 0; i < 40; i++) { g.fillStyle = i % 4 ? '#f8a0a0' : '#ffffff'; g.fillRect((i * 67) % W, (i * 29) % 44, 1, 1); }
  const gt = tileCanvas(d.ground);
  for (let y = 48; y < FIELD_H; y += 16) for (let x = 0; x < W; x += 16) g.drawImage(gt, x, y);
  if (d.band) {
    const bt = TILES[d.band] && (TILES[d.band].auto ? tileCanvas(d.band, (dx, dy) => (dy < 0 ? d.band : dy > 0 ? 'x' : d.band)) : tileCanvas(d.band, (dx, dy) => (dy < 0 ? 'x' : d.band)));
    if (bt) for (let x = 0; x < W; x += 16) { g.drawImage(bt, x, 32); if (d.band === 'tree' || d.band === 'dmount') g.drawImage(bt, x + 8, 24); }
  }
  // darken towards the top so the monsters stand out
  for (let y = 48; y < FIELD_H; y++) { const a = 0.35 - (y - 48) / (FIELD_H - 48) * 0.35; if (a > 0) { g.fillStyle = `rgba(0,0,0,${a.toFixed(2)})`; g.fillRect(0, y, W, 1); } }
  return c;
}
function mixHex(a, b, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), Bc = p(b);
  return '#' + A.map((v, i) => Math.round(v + (Bc[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

// ---------- drawing ----------
export function drawBattle() {
  if (!B) return;
  const sx = B.shake ? ((B.shake % 2) * 2 - 1) * 2 : 0;
  ctx.save(); ctx.translate(sx, 0);
  ctx.drawImage(B.bg, 0, 0);
  // monsters
  for (const f of B.foes) drawFoe(f);
  // the summoned spirit
  if (B.summon && B.summon.art) {
    const a = B.summon.art[0], s = a.width <= 48 ? 2 : 1, k = Math.min(1, B.summon.t / 16);
    ctx.globalAlpha = k;
    ctx.drawImage(a, Math.round(150 - a.width * s / 2), Math.round(118 - a.height * s + (1 - k) * 20), a.width * s, a.height * s);
    ctx.globalAlpha = 1;
  }
  // heroes
  for (const p of B.party) drawHero(p);
  drawFx();
  for (const d of B.nums) {
    const k = d.t, by = k < 10 ? -k * 1.2 : k < 16 ? -12 + (k - 10) * 2 : 0;
    text(d.v, d.x, d.y + by, d.col, { align: 'center' });
  }
  ctx.restore();
  if (B.flashScr) { ctx.fillStyle = `rgba(255,255,255,${B.flashScr / 14})`; ctx.fillRect(0, 0, W, FIELD_H); }
  drawWindows();
  if (B.introT > 0) { ctx.fillStyle = '#000'; ctx.globalAlpha = B.introT / 30; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}
function drawFoe(f) {
  if (!f.alive && f.fade >= 30) return;
  const fr = f.art.length === 4 ? (f.blink ? f.art[1] : f.hurt ? f.art[2] : f.art[Math.floor((B.t + f.i * 17) / 40) % 2 ? 3 : 0]) : f.art[f.art.length > 1 && f.blink ? 1 : 0];
  let img = fr;
  if (f.blink && (f.blink >> 2) % 2) img = flashArt(fr);
  if (f.hurt && f.hurt % 4 < 2) img = flashArt(fr, '#f83800');
  const x = Math.round(f.x + (f.hurt ? (f.hurt % 4 < 2 ? 2 : -2) : 0)), y = Math.round(f.y);
  if (!f.alive) {
    // dissolve from the top, line by line
    const cut = Math.floor((f.fade / 30) * f.h);
    ctx.save(); ctx.beginPath(); ctx.rect(x, y + cut, f.w, f.h - cut); ctx.clip();
    ctx.globalAlpha = 1 - f.fade / 30;
    ctx.drawImage(flashArt(fr, '#a000a0'), x, y, f.w, f.h);
    ctx.restore(); ctx.globalAlpha = 1;
    return;
  }
  ctx.drawImage(img, x, y, f.w, f.h);
  if (f.st.sleep && (B.t >> 4) % 2) text('z', x + f.w - 4, y - 4, '#f8f8f8');
}
function drawHero(p) {
  const h = p.h;
  const spr = sprite(spriteOf(h));
  let x = heroX(p) + p.dx, y = heroY(p) + p.dy;
  if (p.air && !B.cur) return;
  const dead = h.hp <= 0;
  if (dead) {
    // lying down
    const fr = spr.l[0];
    ctx.save(); ctx.translate(x + 8, y + 12); ctx.rotate(-Math.PI / 2); ctx.globalAlpha = 0.8;
    ctx.drawImage(recolorDead(spriteOf(h)), -8, -8); ctx.restore(); ctx.globalAlpha = 1;
    void fr;
    return;
  }
  const weak = h.hp < stats(h).maxhp / 4;
  let fr = spr.l[p.pose === 1 ? 1 : p.pose === 2 ? 3 : 0];
  if (B.victory) fr = spr.d[Math.floor(B.t / 8) % 4];
  if (p.cast || p.pose === 3) fr = spr.d[(B.t >> 3) % 2 ? 1 : 3];
  if (weak && !B.victory && !p.cast && p.pose === 0) y += 2;
  const ready = B.menu && B.menu.p === p;
  if (ready && !B.cur) x -= 6;
  if (p.hurtT && p.hurtT % 4 < 2) ctx.drawImage(flashArt(fr, '#f83800'), x, y); else ctx.drawImage(fr, x, y);
  // the weapon swing
  if (p.swing) { const k = 10 - p.swing; ctx.save(); ctx.translate(x + 2, y + 9); ctx.rotate(-1.4 + k * 0.28); ctx.drawImage(WEAPON, 0, 0, 8, 8, -8, -8, 8, 8); ctx.restore(); }
  if (p.cast && (B.t >> 2) % 2) { ctx.fillStyle = '#f8f8f8'; ctx.fillRect(x + 2 + ((B.t * 3) % 12), y - 2 + ((B.t * 7) % 16), 1, 1); ctx.fillRect(x + ((B.t * 5) % 16), y + ((B.t * 11) % 16), 1, 1); }
  if (p.st.sleep && (B.t >> 4) % 2) text('z', x + 12, y - 8, '#f8f8f8');
  if (p.st.poison && (B.t >> 3) % 4 === 0) { ctx.fillStyle = '#b040f0'; ctx.fillRect(x + 4, y - 2, 2, 2); }
  if (p.st.protect && (B.t >> 2) % 8 === 0) { ctx.strokeStyle = '#f8f0a0'; ctx.strokeRect(x - 1, y - 1, 18, 18); }
  if (B.cover && B.cover.on === p && (B.t >> 3) % 2) { ctx.fillStyle = '#f8f0b0'; ctx.fillRect(x + 7, y - 4, 2, 2); }
}
const deadCache = new Map();
function recolorDead(k) { if (!deadCache.has(k)) deadCache.set(k, recolor(sprite(k).l[0], { sat: 0.1, lum: 0.8 })); return deadCache.get(k); }
// a small sword drawn from NES CC0 Graphics #2
import { NES2 } from './tiles.js';
const WEAPON = (() => { const c = canvas(8, 8); c.x.drawImage(NES2, 24, 8, 16, 16, 0, 0, 8, 8); return c; })();

function drawFx() {
  for (const e of B.fx) {
    const k = e.t / e.dur, x = e.x, y = e.y;
    switch (e.type) {
      case 'hit': case 'claw': {
        ctx.strokeStyle = e.type === 'claw' ? '#f8f8f8' : '#fcfcfc'; ctx.lineWidth = 1;
        const n = e.type === 'claw' ? 3 : 1;
        for (let i = 0; i < n; i++) { const o = (i - (n - 1) / 2) * 4; const l = Math.min(1, k * 2.5); ctx.beginPath(); ctx.moveTo(x - 8 + o, y - 8); ctx.lineTo(x - 8 + o + 16 * l, y - 8 + 16 * l); ctx.stroke(); }
        if (k > 0.3 && k < 0.7) { ctx.fillStyle = '#f8d878'; for (let i = 0; i < 6; i++) ctx.fillRect(x + Math.cos(i) * k * 14, y + Math.sin(i * 2) * k * 14, 2, 2); }
        break;
      }
      case 'ash': { for (let i = 0; i < 10; i++) { ctx.fillStyle = i % 3 ? '#5c4c6c' : '#f85c3c'; ctx.fillRect(x - 12 + ((i * 7 + e.t * 2) % 24), y + 10 - ((i * 13 + e.t * 3) % 26), 2, 2); } if (k > 0.5) { ctx.strokeStyle = '#a080c0'; ctx.beginPath(); ctx.moveTo(x - 12, y + 8); ctx.lineTo(x + 12, y - 8); ctx.stroke(); } break; }
      case 'fire': case 'boom': { for (let i = 0; i < 12; i++) { const r = (i * 37 + e.t * 5) % 30; ctx.fillStyle = r < 10 ? '#fcfc80' : r < 20 ? '#f8b800' : '#f83800'; ctx.fillRect(x - 12 + ((i * 9) % 24), y + 8 - r * (e.type === 'boom' ? 0.6 : 0.9), 3, 3); } if (e.type === 'boom' && k < 0.4) { ctx.strokeStyle = '#fcfcfc'; ctx.beginPath(); ctx.arc(x, y, k * 50, 0, 7); ctx.stroke(); } break; }
      case 'ice': { for (let i = 0; i < 8; i++) { const yy = y - 24 + ((e.t * 3 + i * 9) % 32); ctx.fillStyle = i % 2 ? '#bcf0fc' : '#3cbcfc'; ctx.fillRect(x - 12 + i * 3, yy, 2, 5); } if (k > 0.6) { ctx.fillStyle = 'rgba(188,240,252,0.5)'; ctx.fillRect(x - 10, y - 10, 20, 20); } break; }
      case 'bolt': { if ((e.t >> 1) % 2) { ctx.strokeStyle = '#fcfc80'; ctx.lineWidth = 2; ctx.beginPath(); let px = x, py = 0; ctx.moveTo(px, py); while (py < y) { py += 10; px = x + (Math.random() - 0.5) * 14; ctx.lineTo(px, py); } ctx.stroke(); ctx.lineWidth = 1; } break; }
      case 'water': { ctx.fillStyle = 'rgba(60,124,252,0.7)'; const hgt = Math.sin(k * Math.PI) * 30; ctx.fillRect(x - 20, y + 12 - hgt, 40, hgt); ctx.fillStyle = '#fcfcfc'; for (let i = 0; i < 5; i++) ctx.fillRect(x - 18 + i * 9, y + 12 - hgt, 4, 2); break; }
      case 'quake': { ctx.fillStyle = '#7c3c00'; for (let i = 0; i < 6; i++) ctx.fillRect(x - 14 + i * 5, y - 20 + ((e.t * 2 + i * 11) % 34), 4, 4); break; }
      case 'heal': { for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#fcfcfc' : '#80f8a0'; ctx.fillRect(x - 10 + ((i * 5) % 20), y + 10 - ((e.t + i * 7) % 26), 1, 3); } break; }
      case 'buff': { ctx.strokeStyle = e.col || '#f8f0a0'; ctx.beginPath(); ctx.ellipse(x, y + 6, 4 + k * 12, 2 + k * 4, 0, 0, 7); ctx.stroke(); break; }
      case 'dark': case 'poison': { ctx.fillStyle = e.type === 'poison' ? '#40c040' : '#8040c0'; for (let i = 0; i < 8; i++) { const a = i + e.t * 0.2; ctx.fillRect(x + Math.cos(a) * (12 - k * 10), y + Math.sin(a) * (12 - k * 10), 2, 2); } break; }
      case 'holy': { ctx.fillStyle = `rgba(252,252,252,${1 - k})`; ctx.fillRect(x - 2, y - 30, 4, 50); ctx.fillRect(x - 14, y - 6, 28, 4); break; }
      case 'star': { for (let i = 0; i < 6; i++) { const yy = ((e.t * 4 + i * 23) % 120) - 20; ctx.fillStyle = i % 2 ? '#fcfc80' : '#f8a0a0'; ctx.fillRect(x - 30 + i * 12 + yy * 0.3, yy, 4, 4); } if (k > 0.7) { ctx.fillStyle = `rgba(255,255,255,${(k - 0.7) * 2})`; ctx.fillRect(0, 0, W, FIELD_H); } break; }
      case 'cast': { ctx.strokeStyle = '#fcfcfc'; for (let i = 0; i < 4; i++) { const a = i * 1.57 + e.t * 0.3, r = 12 - k * 10; ctx.fillStyle = '#fcfcfc'; ctx.fillRect(x + Math.cos(a) * r, y + Math.sin(a) * r, 2, 2); } break; }
      default: break;
    }
  }
}
function drawWindows() {
  // monsters
  windowBox(0, FIELD_H, 92, H - FIELD_H);
  const names = [];
  for (const f of liveFoes()) { const e = names.find((n) => n.n === f.name); if (e) e.c++; else names.push({ n: f.name, c: 1 }); }
  names.slice(0, 5).forEach((n, i) => { text(n.n.length > 5 && n.c > 1 ? n.n.slice(0, 5) : n.n, 8, FIELD_H + 7 + i * 14, '#f8f8f8'); if (n.c > 1) text(String(n.c), 86, FIELD_H + 7 + i * 14, '#f8f8f8', { align: 'right' }); });
  // the party
  windowBox(92, FIELD_H, W - 92, H - FIELD_H);
  B.party.forEach((p, i) => {
    const h = p.h, s = stats(h), y = FIELD_H + 6 + i * 14;
    const active = B.menu && B.menu.p === p;
    const col = h.hp <= 0 ? '#f86060' : active ? '#f8e070' : h.hp < s.maxhp / 4 ? '#f8b800' : '#f8f8f8';
    text(heroName(h), 100, y, col);
    text(`${h.hp}`, 186, y, col, { align: 'right' });
    text(`/${s.maxhp}`, 214, y, '#c0c8f0', { align: 'right' });
    const g = p.cast ? 1 : p.gauge / 1000;
    bar(218, y + 5, 32, g * 100, 100, p.cast ? '#f8a0f8' : g >= 1 ? '#f8e070' : '#58c8f8');
  });
  // the command menu
  const m = B.menu;
  if (m) {
    const p = m.p;
    if (m.stage === 'cmd' || m.stage === 'list' || m.stage === 'target') {
      const n = m.cmds.length, h = n * 14 + 10;
      windowBox(2, FIELD_H - h + 76, 76, h);
      m.cmds.forEach((c, i) => text(L(CMD[c][0], CMD[c][1]), 22, FIELD_H - h + 81 + i * 14, '#f8f8f8'));
      if (m.stage === 'cmd') {
        ctx.drawImage(HAND, 7 + ((B.t >> 3) % 2), FIELD_H - h + 82 + m.i * 14);
        // hints for rows and guarding
        const hint = L('←換排　→防禦', '←Row  →Guard'), hw = textW(hint) + 14;
        windowBox(2, FIELD_H - h + 58, hw, 18);
        text(hint, 2 + hw / 2, FIELD_H - h + 61, '#c0c8f0', { align: 'center' });
      }
    }
    if (m.stage === 'list' || (m.stage === 'target' && m.sel)) {
      const list = m.list || [], rows = Math.ceil(list.length / 2), vis = Math.min(rows, 6);
      const sc = Math.max(0, Math.min(Math.floor(m.li / 2) - vis + 1, rows - vis));
      m.scroll = Math.max(sc, Math.min(m.scroll || 0, Math.floor(m.li / 2)));
      const top = 26, hh = vis * 14 + 10;
      windowBox(4, top, 248, hh);
      for (let k = m.scroll * 2; k < Math.min(list.length, (m.scroll + vis) * 2); k++) {
        const it = list[k], cx = 22 + (k % 2) * 120, cy = top + 5 + (Math.floor(k / 2) - m.scroll) * 14;
        text(it.label, cx, cy, it.disabled ? '#8088a8' : '#f8f8f8');
        text(String(it.right), cx + 100, cy, it.disabled ? '#8088a8' : '#f8f8f8', { align: 'right' });
      }
      if (m.stage === 'list') ctx.drawImage(HAND, 8 + (m.li % 2) * 120 + ((B.t >> 3) % 2), top + 6 + (Math.floor(m.li / 2) - m.scroll) * 14);
      const it = list[m.li];
      if (m.stage === 'list' && it) { const d = it.item ? ITEMS[it.id] : SPELLS[it.id]; const desc = d && d.d ? L(d.d[0], d.d[1]) : ''; if (desc) { windowBox(4, top + hh, 248, 20); text(desc, 12, top + hh + 4, '#f8f8f8'); } }
    }
    if (m.stage === 'target') {
      const list = targetList(m);
      const show = m.all ? list : [list[Math.min(m.ti, list.length - 1)]];
      for (const t of show) {
        if (!t) continue;
        const [x, y] = posOf(t);
        const hx = t.kind === 'hero' ? x - 22 : x - (t.w / 2) - 12;
        if ((B.t >> 3) % 2 || !m.all) ctx.drawImage(HAND, Math.max(0, hx) + ((B.t >> 3) % 2), y - 5);
      }
      if (!m.all && show[0]) { const nmx = nameOf(show[0]); windowBox(W / 2 - textW(nmx) / 2 - 8, 4, textW(nmx) + 16, 20); text(nmx, W / 2, 8, '#f8f8f8', { align: 'center' }); }
    }
    void p;
  }
  // a skill name at the top
  if (B.banner) {
    B.banner.t++;
    if (B.banner.t > 50) B.banner = null;
    else { const w = textW(B.banner.s) + 20; windowBox(W / 2 - w / 2, 4, w, 20); text(B.banner.s, W / 2, 8, '#f8f8f8', { align: 'center' }); }
  }
  if (B.msg) { const lines = B.msg.s.split('\n'); windowBox(4, 4, W - 8, 10 + lines.length * 14); lines.forEach((l, i) => text(l, 12, 9 + i * 14, '#f8f8f8')); }
  if (B.hold > 10) { windowBox(W - 80, FIELD_H - 22, 76, 20); text(L('逃跑中……', 'Fleeing...'), W - 42, FIELD_H - 18, '#f8f8f8', { align: 'center' }); }
}
