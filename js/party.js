// The party, inventory, gold, story flags and saving.
import { HEROES, DAWN, LEARN, CALLS, GADGETS, ITEMS, EQUIP, expFor, nm } from './data.js';
import { L } from './i18n.js';

export const S = {
  members: [], reserve: [], inv: {}, gold: 0, flags: {}, map: 'varncastle', x: 0, y: 0, dir: 'u', time: 0, steps: 0, calls: [],
  ship: null, // where the airship is parked: { map, x, y }
};
export const MAXPARTY = 5;

export function makeHero(id, lv = 1) {
  const H = HEROES[id];
  const h = { id, lv, exp: expFor(lv), equip: { ...H.equip }, st: {}, row: H.row };
  const s = stats(h);
  h.hp = s.maxhp; h.mp = s.maxmp;
  return h;
}
export const isDawn = (h) => h.id === 'hale' && S.flags.dawn;
function base(h, k) {
  const H = HEROES[h.id];
  if (k === 'mp' && isDawn(h)) return Math.floor(DAWN.mpBase + DAWN.mpGrow * (h.lv - 1));
  return Math.floor(H.base[k] + H.grow[k] * (h.lv - 1));
}
export function stats(h) {
  const s = { maxhp: base(h, 'hp'), maxmp: base(h, 'mp'), str: base(h, 'str'), def: base(h, 'def'), mag: base(h, 'mag'), mdef: base(h, 'mdef'), spd: base(h, 'spd'), atk: 0, el: null, immune: false, resist: null };
  for (const slot of ['weapon', 'armor', 'acc']) {
    const it = EQUIP[h.equip[slot]];
    if (!it) continue;
    for (const k of ['str', 'def', 'mag', 'mdef', 'spd']) s[k] += it[k] || 0;
    s.atk += it.atk || 0;
    if (it.el) s.el = it.el;
    if (it.immune) s.immune = true;
    if (it.resist) s.resist = it.resist;
  }
  s.atk += s.str;
  s.maxhp = Math.min(9999, s.maxhp); s.maxmp = Math.min(999, s.maxmp);
  return s;
}
export const jobOf = (h) => (isDawn(h) ? DAWN.job : HEROES[h.id].job);
export const spriteOf = (h) => (isDawn(h) ? DAWN.sprite : HEROES[h.id].sprite);
export const cmdsOf = (h) => (isDawn(h) ? DAWN.cmds : HEROES[h.id].cmds);
export const heroName = (h) => nm(HEROES[h.id]);
export function spellsOf(h, school) {
  if (h.id === 'hale' && !isDawn(h)) return [];
  const list = (LEARN[h.id] || []).filter(([lv]) => h.lv >= lv).map(([, s]) => s);
  if (h.id === 'hale') return list;
  void school;
  return list;
}
export function callsOf(h) {
  if (h.id !== 'nyra') return [];
  return [...CALLS.nyra.filter(([lv]) => h.lv >= lv).map(([, s]) => s), ...S.calls];
}
export const gadgetsOf = (h) => (h.id === 'dorrin' ? GADGETS.filter(([lv]) => h.lv >= lv).map(([, s]) => s) : []);
export const alive = () => S.members.filter((m) => m.hp > 0);
export const member = (id) => S.members.find((m) => m.id === id) || S.reserve.find((m) => m.id === id);

export function addMember(id, lv) {
  if (member(id)) { const m = member(id); if (S.reserve.includes(m) && S.members.length < MAXPARTY) { S.reserve.splice(S.reserve.indexOf(m), 1); S.members.push(m); } return m; }
  const avg = S.members.length ? Math.round(S.members.reduce((a, m) => a + m.lv, 0) / S.members.length) : 1;
  const h = makeHero(id, Math.max(lv || 1, avg));
  if (S.members.length < MAXPARTY) S.members.push(h); else S.reserve.push(h);
  return h;
}
export function removeMember(id) {
  let i = S.members.findIndex((m) => m.id === id);
  if (i >= 0) { const [m] = S.members.splice(i, 1); fillParty(); return m; }
  i = S.reserve.findIndex((m) => m.id === id);
  if (i >= 0) return S.reserve.splice(i, 1)[0];
  return null;
}
// pull from the reserve into empty slots
export function fillParty() { while (S.members.length < MAXPARTY && S.reserve.length) S.members.push(S.reserve.shift()); }

// returns lines describing level ups
export function gainExp(h, n) {
  const out = [];
  if (h.hp <= 0) return out;
  h.exp += n;
  while (h.exp >= expFor(h.lv + 1) && h.lv < 60) {
    const before = stats(h), hadS = spellsOf(h), hadC = callsOf(h), hadG = gadgetsOf(h);
    h.lv++;
    const after = stats(h);
    h.hp += after.maxhp - before.maxhp; h.mp += after.maxmp - before.maxmp;
    out.push(L(`${heroName(h)}升到了 ${h.lv} 級！`, `${heroName(h)} reached level ${h.lv}!`));
    for (const sp of spellsOf(h)) if (!hadS.includes(sp)) out.push(L(`${heroName(h)}學會了「${spellName(sp)}」！`, `${heroName(h)} learned ${spellName(sp)}!`));
    for (const sp of callsOf(h)) if (!hadC.includes(sp)) out.push(L(`${heroName(h)}能召喚「${spellName(sp)}」了！`, `${heroName(h)} can now call ${spellName(sp)}!`));
    for (const sp of gadgetsOf(h)) if (!hadG.includes(sp)) out.push(L(`${heroName(h)}做好了「${spellName(sp)}」！`, `${heroName(h)} built a ${spellName(sp)}!`));
  }
  return out;
}
let spellName = (s) => s;
export function setSpellNamer(f) { spellName = f; }

export function addItem(id, n = 1) { if (!ITEMS[id]) { console.warn('no item', id); return; } S.inv[id] = (S.inv[id] || 0) + n; if (S.inv[id] <= 0) delete S.inv[id]; }
export const count = (id) => S.inv[id] || 0;
export function fullHeal() { for (const m of [...S.members, ...S.reserve]) { const s = stats(m); m.hp = s.maxhp; m.mp = s.maxmp; m.st = {}; } }

// ---------- save ----------
const KEY = 'ashen-vow-save';
export function save(slot = 0) {
  try { localStorage.setItem(KEY + slot, JSON.stringify({ ...S, savedAt: Date.now() })); return true; } catch (e) { return false; }
}
export function hasSave(slot = 0) { try { return !!localStorage.getItem(KEY + slot); } catch (e) { return false; } }
export function saveInfo(slot = 0) { try { return JSON.parse(localStorage.getItem(KEY + slot)); } catch (e) { return null; } }
export function load(slot = 0) {
  try {
    const d = JSON.parse(localStorage.getItem(KEY + slot));
    if (!d) return false;
    Object.assign(S, { members: [], reserve: [], inv: {}, flags: {}, calls: [], ship: null }, d);
    return true;
  } catch (e) { return false; }
}
export function reset() {
  Object.assign(S, { members: [], reserve: [], inv: { potion: 4, antidote: 1 }, gold: 200, flags: {}, map: 'varncastle', x: 0, y: 0, dir: 'u', time: 0, steps: 0, calls: [], ship: null });
}
