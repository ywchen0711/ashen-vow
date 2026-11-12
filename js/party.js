// The party, inventory, gold, story flags and saving.
import { HEROES, DAWN, LEARN, CALLS, GADGETS, SONGS, LEAPS, ARTS, VOWS, SPELLS, PASSIVES, ITEMS, EQUIP, expFor, nm } from './data.js';
import { L } from './i18n.js';

export const S = {
  members: [], reserve: [], inv: {}, gold: 0, flags: {}, map: 'varncastle', x: 0, y: 0, dir: 'u', time: 0, steps: 0, calls: [],
  ship: null, // where the airship is parked: { map, x, y }
  beast: {}, // bestiary: id -> { seen, kills, scan }
  ng: 0, // New Game+ count
};
export const MAXLV = 99;
export const MAXPARTY = 5;

export function makeHero(id, lv = 1) {
  const H = HEROES[id];
  const h = { id, lv, exp: expFor(lv), equip: { ...H.equip }, st: {}, row: H.row, ap: {}, learned: [] };
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
  const s = { maxhp: base(h, 'hp'), maxmp: base(h, 'mp'), str: base(h, 'str'), def: base(h, 'def'), mag: base(h, 'mag'), mdef: base(h, 'mdef'), spd: base(h, 'spd'), atk: 0, el: null, immune: false, resist: null, resists: [], pass: new Set(), boost: null };
  for (const slot of ['weapon', 'armor', 'acc']) {
    const it = EQUIP[h.equip[slot]];
    if (!it) continue;
    for (const k of ['str', 'def', 'mag', 'mdef', 'spd']) s[k] += it[k] || 0;
    s.atk += it.atk || 0;
    if (it.el) s.el = it.el;
    if (it.boost) s.boost = it.boost;
    if (it.immune) s.immune = true;
    if (it.resist) { s.resist = it.resist; s.resists.push(it.resist); }
    if (it.resists) s.resists.push(...it.resists);
    for (const p of it.pass || []) s.pass.add(p);
    if (it.teach && PASSIVES[it.teach]) s.pass.add(it.teach);
  }
  for (const p of h.learned || []) if (PASSIVES[p]) s.pass.add(p);
  if (s.pass.has('hpplus')) s.maxhp = Math.floor(s.maxhp * 1.2);
  if (s.pass.has('mpplus')) s.maxmp = Math.floor(s.maxmp * 1.2);
  s.atk += s.str;
  s.maxhp = Math.min(9999, s.maxhp); s.maxmp = Math.min(999, s.maxmp);
  return s;
}
export const jobOf = (h) => (isDawn(h) ? DAWN.job : HEROES[h.id].job);
export const spriteOf = (h) => (isDawn(h) ? DAWN.sprite : HEROES[h.id].sprite);
export function cmdsOf(h) {
  let c = isDawn(h) ? DAWN.cmds : HEROES[h.id].cmds;
  if (h.id === 'hale' && isDawn(h) && S.flags.p2_hale) c = ['fight', 'vow', 'cover', 'white', 'item'];
  if (skillsOf(h).length) c = [...c.slice(0, c.length - 1), 'skill', 'item'];
  return c;
}
export const heroName = (h) => nm(HEROES[h.id]);
export function spellsOf(h, school) {
  if (h.id === 'hale' && !isDawn(h)) return [];
  const list = (LEARN[h.id] || []).filter(([lv]) => h.lv >= lv).map(([, s]) => s);
  // spells the story itself teaches
  if (h.id === 'miel' && S.flags.p2_tide) list.push('sanctuary');
  if (h.id === 'nyra' && S.flags.gowan_pages) list.push('gowanstar');
  if (h.id === 'hale') return list;
  void school;
  return list;
}
export function callsOf(h) {
  if (h.id !== 'nyra') return [];
  return [...CALLS.nyra.filter(([lv]) => h.lv >= lv).map(([, s]) => s), ...S.calls];
}
export const gadgetsOf = (h) => (h.id === 'dorrin' ? [...GADGETS.filter(([lv]) => h.lv >= lv).map(([, s]) => s), ...(S.flags.p2_wind ? ['starburst'] : [])] : []);
export const songsOf = (h) => (h.id === 'ilse' ? SONGS.filter(([lv]) => h.lv >= lv).map(([, s]) => s) : []);
export const leapsOf = (h) => (h.id === 'brin' ? [...LEAPS.filter(([lv]) => h.lv >= lv).map(([, s]) => s), ...(S.flags.p2_brin ? ['wyrmdive'] : [])] : []);
export const artsOf = (h) => (h.id === 'tal' ? [...ARTS.filter(([lv]) => h.lv >= lv).map(([, s]) => s), ...(S.flags.p2_ember ? ['tigerrush'] : [])] : []);
export const vowsOf = (h) => (h.id === 'hale' && isDawn(h) && S.flags.p2_hale ? VOWS : []);
// skills taught by equipment: learned for good, or usable while the teacher is worn
export function skillsOf(h) {
  const out = [];
  const add = (id) => { if (SPELLS[id] && SPELLS[id].skill && !out.includes(id)) out.push(id); };
  for (const id of h.learned || []) add(id);
  for (const slot of ['weapon', 'armor', 'acc']) { const it = EQUIP[h.equip[slot]]; if (it && it.teach) add(it.teach); }
  return out;
}
export const passivesOf = (h) => [...stats(h).pass];
// ability points: won in battle, they teach the abilities of the gear being worn
export function gainAP(h, n) {
  const out = [];
  if (h.hp <= 0) return out;
  h.ap = h.ap || {}; h.learned = h.learned || [];
  if (stats(h).pass.has('apup')) n *= 2;
  for (const slot of ['weapon', 'armor', 'acc']) {
    const it = EQUIP[h.equip[slot]];
    if (!it || !it.teach || h.learned.includes(it.teach)) continue;
    h.ap[it.teach] = (h.ap[it.teach] || 0) + n;
    if (h.ap[it.teach] >= it.ap) {
      h.learned.push(it.teach); delete h.ap[it.teach];
      const nmx = SPELLS[it.teach] ? nm(SPELLS[it.teach]) : nm(PASSIVES[it.teach]);
      out.push(L(`${heroName(h)}學會了「${nmx}」！`, `${heroName(h)} mastered ${nmx}!`));
    }
  }
  return out;
}
export const alive = () => S.members.filter((m) => m.hp > 0);
export const member = (id) => S.members.find((m) => m.id === id) || S.reserve.find((m) => m.id === id);

export function addMember(id, lv) {
  if (member(id)) { const m = member(id); if (S.reserve.includes(m) && S.members.length < MAXPARTY) { S.reserve.splice(S.reserve.indexOf(m), 1); S.members.push(m); } return m; }
  const avg = S.members.length ? Math.round(S.members.reduce((a, m) => a + m.lv, 0) / S.members.length) : 1;
  const h = makeHero(id, Math.max(lv || 1, avg));
  applyKeep(h);
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
  while (h.exp >= expFor(h.lv + 1) && h.lv < MAXLV) {
    const before = stats(h), hadS = spellsOf(h), hadC = callsOf(h), hadG = gadgetsOf(h), hadX = [...songsOf(h), ...leapsOf(h), ...artsOf(h)];
    h.lv++;
    const after = stats(h);
    h.hp += after.maxhp - before.maxhp; h.mp += after.maxmp - before.maxmp;
    out.push(L(`${heroName(h)}升到了 ${h.lv} 級！`, `${heroName(h)} reached level ${h.lv}!`));
    for (const sp of spellsOf(h)) if (!hadS.includes(sp)) out.push(L(`${heroName(h)}學會了「${spellName(sp)}」！`, `${heroName(h)} learned ${spellName(sp)}!`));
    for (const sp of callsOf(h)) if (!hadC.includes(sp)) out.push(L(`${heroName(h)}能召喚「${spellName(sp)}」了！`, `${heroName(h)} can now call ${spellName(sp)}!`));
    for (const sp of gadgetsOf(h)) if (!hadG.includes(sp)) out.push(L(`${heroName(h)}做好了「${spellName(sp)}」！`, `${heroName(h)} built a ${spellName(sp)}!`));
    for (const sp of [...songsOf(h), ...leapsOf(h), ...artsOf(h)]) if (!hadX.includes(sp)) out.push(L(`${heroName(h)}學會了「${spellName(sp)}」！`, `${heroName(h)} learned ${spellName(sp)}!`));
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
    Object.assign(S, { members: [], reserve: [], inv: {}, flags: {}, calls: [], ship: null, beast: {}, ng: 0, keep: null }, d);
    for (const m of [...S.members, ...S.reserve]) { m.ap = m.ap || {}; m.learned = m.learned || []; }
    return true;
  } catch (e) { return false; }
}
export function reset() {
  Object.assign(S, { members: [], reserve: [], inv: { potion: 4, antidote: 1 }, gold: 200, flags: {}, map: 'varncastle', x: 0, y: 0, dir: 'u', time: 0, steps: 0, calls: [], ship: null, beast: {}, ng: 0, keep: null });
}
// New Game+: keep the heroes' growth, gear, gold, items and bestiary; the story starts over.
// Monsters stay exactly as strong as before.
export function resetPlus(old) {
  reset();
  S.ng = (old.ng || 0) + 1;
  S.beast = old.beast || {};
  S.gold = old.gold || 0;
  for (const [k, n] of Object.entries(old.inv || {})) if (ITEMS[k] && !ITEMS[k].key) S.inv[k] = n;
  S.keep = {};
  for (const m of [...(old.members || []), ...(old.reserve || [])]) S.keep[m.id] = { lv: m.lv, exp: m.exp, equip: m.equip, ap: m.ap || {}, learned: m.learned || [] };
}
// a hero joining in New Game+ comes back as strong as they were (Hale keeps the Ashbrand until his trial)
export function applyKeep(h) {
  const k = S.keep && S.keep[h.id];
  if (!k) return;
  h.lv = Math.max(h.lv, k.lv); h.exp = Math.max(h.exp, k.exp); h.ap = k.ap; h.learned = k.learned;
  for (const slot of ['weapon', 'armor', 'acc']) {
    const e = k.equip[slot];
    if (!e || !EQUIP[e] || EQUIP[e].ashen) continue;
    if (h.id === 'hale' && slot === 'weapon' && !S.flags.dawn) { addItem(e); continue; }
    if (h.equip[slot] && !EQUIP[h.equip[slot]].ashen) addItem(h.equip[slot]);
    h.equip[slot] = e;
  }
  const s = stats(h); h.hp = s.maxhp; h.mp = s.maxmp;
  delete S.keep[h.id];
}
