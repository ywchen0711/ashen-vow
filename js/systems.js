// Part II pastimes: the bestiary, the forge, the colosseum, drake races and treasure maps.
import { ctx, W, H, text, textW, windowBox, bar, canvas } from './gfx.js';
import { input } from './input.js';
import { sfx } from './audio.js';
import { UI, menu, panel, notice, ask, say, pressKey } from './ui.js';
import { S, stats, addItem, count, heroName, fullHeal } from './party.js';
import { MON, ITEMS, EQUIP, RECIPES, ARENA, CUPS, BEAST_PRIZES, ZONES, nm, ds } from './data.js';
import { sprite, monArt, preloadMon, personArt } from './sprites.js';
import { drawTile } from './tiles.js';
import { MAPS, DIG } from './maps.js';
import { L } from './i18n.js';

const push = (w) => new Promise((res) => { w.done = (v) => { const s = UI._stack; const i = s.indexOf(w); if (i >= 0) s.splice(i, 1); res(v); }; UI._stack.push(w); });
const ELN = { fire: ['火', 'Fire'], ice: ['冰', 'Ice'], bolt: ['雷', 'Bolt'], water: ['水', 'Water'], earth: ['土', 'Earth'], holy: ['聖', 'Holy'], wind: ['風', 'Wind'], dark: ['暗', 'Dark'] };
const el = (list) => (list || []).map((e) => L(ELN[e][0], ELN[e][1])).join(L('、', ' '));

// ---------- the bestiary ----------
// every monster that can be met (story-only versions of friends are left out)
export const beastList = () => Object.keys(MON).filter((id) => !['brin_boss', 'stonebak', 'elderthorn'].includes(id));
export function beastCount() { const all = beastList(); return { seen: all.filter((id) => S.beast[id] && S.beast[id].seen).length, kills: all.filter((id) => S.beast[id] && S.beast[id].kills).length, total: all.length }; }
const where = (id) => { for (const [z, t] of Object.entries(ZONES)) if (t.some(([, tr]) => tr.includes(id))) return z; return null; };
const ZN = { plains: ['瓦恩平原', 'Varn plains'], mossway: ['苔道洞窟', 'Mossway'], hills: ['東方丘陵', 'Eastern hills'], thornwood: ['荊棘林', 'Thornwood'], lake: ['文湖', 'Wenmere'], shrine: ['沉沒神殿', 'Sunken Shrine'], desert: ['沙漠', 'Desert'], pass: ['乾谷隘道', 'Dry Pass'], coast: ['南方海岸', 'South coast'], docks: ['紅隼港', 'Kestrel'], spire: ['荊棘高塔', 'Thorn Spire'], well: ['燼井', 'Starwell'], world2: ['大陸', 'The continent'], p2world: ['大陸', 'The continent'], cloister: ['淹沒迴廊', 'Drowned Cloister'], rootdeep: ['根底', 'Rootdeep'], sunfire: ['陽炎神殿', 'Sunfire Temple'], ddesert: ['深沙漠', 'Deep desert'], ember: ['燼落島', 'Emberfall'], gearworks: ['齒輪工坊', 'Gearworks'], keep: ['灰岩堡內城', 'Grayhold Keep'], barracks: ['舊兵營', 'Old Barracks'], sky: ['雲海', 'Cloud Sea'], aerie: ['巨鵬之巢', 'Aerie'], mire: ['霧沼', 'Mirefen'], grotto: ['淵蛇洞窟', 'Deepcoil Grotto'], snow: ['灰霧群島', 'Hollowmere'], bell: ['鐘樓', 'Bell Tower'], pale: ['蒼白高塔', 'Pale Spire'], abyss: ['燼井深淵', 'Starwell Abyss'] };
export async function bestiary() {
  const ids = beastList();
  const c = beastCount();
  let cur = 0, art = null, artFor = null;
  const close = panel(() => {
    windowBox(132, 4, W - 136, H - 8);
    const id = ids[cur], m = MON[id], b = S.beast[id] || {};
    if (!b.seen) { text('？？？', 192, 60, '#8088a8', { align: 'center' }); return; }
    if (artFor !== id) { artFor = id; art = null; const a = m.art; if (a.startsWith('person:')) art = personArt(a.slice(7), 2, m.look); else preloadMon([a]).then(() => { if (artFor === id) art = monArt(a, m.look); }); }
    if (art) { const f = art[0], s = Math.min(1, 80 / f.height, 112 / f.width); ctx.drawImage(f, Math.round(192 - f.width * s / 2), Math.round(86 - f.height * s), Math.round(f.width * s), Math.round(f.height * s)); }
    text(nm(m), 192, 92, '#f8e070', { align: 'center' });
    text(`Lv ${m.lv}　HP ${b.kills || b.scan ? m.hp : '???'}`, 140, 110);
    const known = b.kills || b.scan;
    text(L('弱點', 'Weak') + ' ' + (known ? el(m.weak) || '－' : '???'), 140, 126, '#f8c050');
    text(L('吸收', 'Absorb') + ' ' + (known ? el(m.absorb) || '－' : '???'), 140, 142, '#80c0f8');
    text(L('掉落', 'Drop') + ' ' + (known && m.drop ? nm(ITEMS[m.drop[0]]) : known ? '－' : '???'), 140, 158);
    const z = where(id); text(z && ZN[z] ? L(ZN[z][0], ZN[z][1]) : (m.boss ? L('頭目', 'Boss') : ''), 140, 174, '#a0c0f8');
    text(L(`打倒 ${b.kills || 0}`, `Defeated ${b.kills || 0}`), 140, 190, '#c0c8f0');
  });
  const close2 = panel(() => { windowBox(4, 4, 126, 22); text(L(`${c.seen}/${c.total} 種`, `${c.seen}/${c.total} seen`), 67, 9, '#f8e070', { align: 'center' }); });
  await menu(ids.map((id, i) => ({ label: S.beast[id] && S.beast[id].seen ? nm(MON[id]) : '──', right: String(i + 1).padStart(3, '0'), color: S.beast[id] && S.beast[id].kills ? undefined : '#a0a8c0' })), { x: 4, y: 28, w: 126, maxRows: 11, rowH: 16, onMove: (i) => { cur = i; } });
  close(); close2();
}
// the archivist in Wenmere hands out prizes for a fuller bestiary
export async function beastPrizes(E) {
  const c = beastCount();
  let got = false;
  for (const [n, id, k] of BEAST_PRIZES) {
    const need = n || c.total, flag = 'beast_' + id;
    if (S.flags[flag]) continue;
    if (c.kills >= need) { S.flags[flag] = true; addItem(id, k); sfx('chest'); got = true; await E.say('學者', L(`你已經記錄了 ${need} 種魔物！這是謝禮，「${nm(ITEMS[id])}」${k > 1 ? '×' + k : ''}。`, `You have recorded ${need} kinds of monster! Here, a thank-you: ${nm(ITEMS[id])}${k > 1 ? ' x' + k : ''}.`)); }
    else { await E.say('學者', L(`目前打倒過的魔物：${c.kills}/${c.total} 種。湊到 ${need} 種，我就送你「${nm(ITEMS[id])}」。`, `Monsters defeated so far: ${c.kills}/${c.total}. Reach ${need} and I'll give you ${nm(ITEMS[id])}.`)); break; }
  }
  return got;
}

// ---------- the forge ----------
export async function forge(E) {
  let info = '';
  const close = panel(() => { windowBox(170, 4, 82, 22); text(`${S.gold} G`, 244, 9, '#f8e070', { align: 'right' }); windowBox(4, 150, W - 8, 70); info.split('\n').forEach((l, i) => text(l, 12, 155 + i * 15, i === 0 ? '#f8e070' : '#f8f8f8')); });
  for (;;) {
    const can = (r) => S.gold >= r[1] && Object.entries(r[2]).every(([k, n]) => count(k) >= n);
    const r = await menu(RECIPES.map((rc) => ({ label: nm(ITEMS[rc[0]]), right: rc[1], disabled: !can(rc) })), {
      x: 4, y: 28, w: 200, maxRows: 7, title: L('要打造什麼？', 'Forge what?'),
      onMove: (i) => {
        const [id, , mats] = RECIPES[i], it = ITEMS[id];
        const st = it.equip ? Object.entries({ atk: ['攻', 'ATK'], def: ['防', 'DEF'], mag: ['魔', 'MAG'], mdef: ['魔防', 'MDEF'], str: ['力', 'STR'], spd: ['速', 'SPD'] }).filter(([k]) => it[k]).map(([k, n]) => `${L(n[0], n[1])}+${it[k]}`).join(' ') : ds(it);
        info = `${nm(it)}  ${st}\n` + Object.entries(mats).map(([k, n]) => `${nm(ITEMS[k])} ${count(k)}/${n}`).join(L('　', '  ')).replace(/(.{1,30}(\s|　)|.{1,30}$)/g, '$1\n').trim();
        const lines = info.split('\n'); info = lines.slice(0, 4).join('\n');
      },
    });
    if (r < 0) break;
    const [id, price, mats] = RECIPES[r];
    if (!can(RECIPES[r])) { sfx('buzz'); continue; }
    S.gold -= price; for (const [k, n] of Object.entries(mats)) addItem(k, -n); addItem(id);
    sfx('boom'); await E.flash('#ffffff', 10); sfx('chest');
    await E.say('鐵匠', L(`打好了！「${nm(ITEMS[id])}」，拿去吧。`, `Done! The ${nm(ITEMS[id])}. It's yours.`));
  }
  close();
}

// ---------- the colosseum ----------
export async function arena(E) {
  const rank = S.flags.arena || 0;
  if (rank >= ARENA.length) { await E.say('鬥技場主', L('你們已經是冠軍了。隨時歡迎回來練練手。', "You're the champions now. Come back any time for a bout.")); }
  const opts = ARENA.map((a, i) => ({ label: `${L(a.n[0], a.n[1])}　${a.fee}G`, disabled: i > rank || (i < rank && i === ARENA.length - 1) }));
  const k = await E.ask('鬥技場主', L('要挑戰哪一階？連續戰鬥之間不能休息喔。', 'Which rank? There is no rest between bouts.'), [...opts.map((o) => o.label), L('不了', 'Not now')]);
  if (k < 0 || k >= ARENA.length) return;
  if (opts[k].disabled) { await E.say('鬥技場主', L('先打贏前一階再說吧。', 'Win the rank before it first.')); return; }
  const a = ARENA[k];
  if (S.gold < a.fee) { await E.say('鬥技場主', L('報名費不夠喔。', "You can't cover the entry fee.")); return; }
  S.gold -= a.fee;
  await E.say('鬥技場主', L(`${L(a.n[0], a.n[1])}，開始！`, `${a.n[1]} rank, begin!`));
  for (let i = 0; i < a.fights.length; i++) {
    const r = await E.battle(a.fights[i], { bg: 'castle', noSpoils: true, noRun: true, noGameOver: true, music: i === a.fights.length - 1 ? 'boss' : 'battle' });
    if (r !== 'win') { fullHeal(); await E.say('鬥技場主', L('勝負已分！……別灰心，下次再來。', "That's the match! ...Chin up, come back next time.")); return; }
    if (i < a.fights.length - 1) await E.say('鬥技場主', L(`第 ${i + 1} 戰勝利！下一位挑戰者上場！`, `Bout ${i + 1} won! Next challenger!`));
  }
  fullHeal();
  const first = !S.flags['arena_' + k];
  S.flags['arena_' + k] = true;
  if (k === rank) S.flags.arena = rank + 1;
  E.sfx('fanfare');
  if (first) { addItem(a.prize); await E.say('鬥技場主', L(`漂亮！這是${L(a.n[0], a.n[1])}的獎品：「${nm(ITEMS[a.prize])}」！`, `Splendid! The ${a.n[1]} prize: ${nm(ITEMS[a.prize])}!`)); }
  else { const g = a.fee * 2; S.gold += g; await E.say('鬥技場主', L(`好身手！獎金 ${g} 金幣。`, `Fine work! ${g} gold in prize money.`)); }
}

// ---------- drake races ----------
// tap Z to run, but every tap tires the drake; X once for a whistle sprint
function raceScreen(rivals) {
  const lanes = [{ name: L('你', 'You'), x: 0, v: 0, sp: 'drakeling', look: null, stam: 1, trip: 0, me: true }];
  const looks = [{ hue: 120 }, { hue: -100 }, { hue: 200, lum: 0.8 }];
  rivals.forEach((r, i) => lanes.push({ name: [L('沼風', 'Fenwind'), L('紅鱗', 'Redscale'), L('夜蹄', 'Nighthoof')][i], x: 0, v: 0, sk: r, sp: 'drakeling', look: looks[i], stam: 1, trip: 0, t: 0 }));
  const LEN = 1400;
  const auto = !!(window.G && window.G._B && window.G._B.auto);
  const frames = new Map();
  const fr = (look) => { const key = JSON.stringify(look); if (!frames.has(key)) frames.set(key, look ? personArt('drakeling', 1, look) : personArt('drakeling', 1)); return frames.get(key); };
  return push({
    t: -90, finish: [], whistle: false, wt: 0,
    update() {
      this.t++;
      if (this.t < 0) return;
      for (const ln of lanes) {
        if (ln.x >= LEN) continue;
        if (ln.trip > 0) { ln.trip--; ln.v *= 0.9; }
        else if (ln.me) {
          const tap = auto ? this.t % 7 === 0 && ln.stam > 0.25 : input.pressed('a');
          if (tap) { ln.v += 0.55; ln.stam -= 0.075; sfx('cursor'); }
          if ((auto ? this.t > 400 : input.pressed('b')) && !this.whistle) { this.whistle = true; this.wt = 90; sfx('special'); }
          if (ln.stam <= 0) { ln.trip = 70; ln.stam = 0.35; sfx('bump'); }
        } else {
          ln.t++;
          if (ln.t % 9 === 0 && ln.stam > 0.15) { ln.v += 0.52 * ln.sk; ln.stam -= 0.06; }
          if (ln.stam <= 0.15 && Math.random() < 0.004) { ln.trip = 50; ln.stam = 0.5; }
        }
        ln.stam = Math.min(1, ln.stam + 0.0045);
        let v = ln.v; if (ln.me && this.wt > 0) { this.wt--; v *= 1.45; }
        ln.v *= 0.965;
        ln.x = Math.min(LEN, ln.x + v);
        if (ln.x >= LEN) this.finish.push(ln);
      }
      if (this.finish.length === lanes.length || (this.finish.includes(lanes[0]) && this.t > 30 && (this.finish.length >= 2 || this.t > 2400))) {
        if (!this.endT) this.endT = this.t;
        if (this.t - this.endT > 60) { const place = this.finish.indexOf(lanes[0]); this.done(place < 0 ? lanes.length - 1 : place); }
      }
    },
    draw() {
      ctx.fillStyle = '#5c94fc'; ctx.fillRect(0, 0, W, 40);
      ctx.fillStyle = '#204820'; ctx.fillRect(0, 40, W, H - 40);
      const camX = lanes[0].x - 60;
      lanes.forEach((ln, i) => {
        const y = 56 + i * 34;
        ctx.fillStyle = i % 2 ? '#3c6c2c' : '#447c34'; ctx.fillRect(0, y, W, 30);
        for (let k = 0; k < 20; k++) { const px = Math.round(k * 64 - (camX % 64)); ctx.fillStyle = '#58944a'; ctx.fillRect(px, y + 26, 30, 2); }
        const fx = Math.round(LEN - camX + 8); if (fx < W) { ctx.fillStyle = (i + Math.floor(this.t / 8)) % 2 ? '#fcfcfc' : '#000'; ctx.fillRect(fx, y, 4, 30); }
        const a = fr(ln.look), f = a[ln.trip > 0 ? 3 : this.t < 0 ? 0 : Math.floor((this.t * Math.max(0.1, ln.v)) / 12) % 3] || a[0];
        const dx = Math.round(ln.x - camX);
        ctx.drawImage(f, dx, y + 6 + (ln.trip > 0 ? 6 : 0), 16, 16);
        text(ln.name, 4, y + 2, ln.me ? '#f8e070' : '#f8f8f8');
      });
      windowBox(4, H - 40, W - 8, 36);
      const me = lanes[0];
      text(L('體力', 'Stamina'), 12, H - 33); bar(60, H - 29, 70, me.stam * 100, 100, me.stam < 0.3 ? '#f86060' : '#78f878');
      text(L('Z 連打奔跑　X 口哨衝刺', 'Tap Z: run  X: whistle'), 140, H - 33, '#c0c8f0');
      bar(12, H - 14, W - 24, me.x, LEN, '#f8e070');
      if (this.t < 0) text(String(Math.ceil(-this.t / 30)), W / 2, 20, '#fcfcfc', { align: 'center' });
      else if (this.t < 30) text('GO!', W / 2, 20, '#fcfcfc', { align: 'center' });
    },
  });
}
export async function race(E) {
  const won = S.flags.cups || 0;
  const opts = CUPS.map((c, i) => ({ label: `${L(c.n[0], c.n[1])}　${c.fee}G`, disabled: i > won }));
  const k = await E.ask('龍騎賽主持', L('要參加哪一盃？', 'Which cup will you enter?'), [...opts.map((o) => o.label), L('看規則', 'Rules'), L('不了', 'Not now')]);
  if (k === CUPS.length) { await E.say('龍騎賽主持', L('連打 Z 讓龍跑起來，可是每按一下都會消耗體力，體力用光就會跌倒！X 是口哨，每場一次，能讓龍衝刺一陣子。', 'Tap Z to make your drake run, but each tap costs stamina, and an empty drake trips! X is your whistle: once a race, it gives a burst of speed.')); return; }
  if (k < 0 || k > CUPS.length) return;
  if (opts[k].disabled) { await E.say('龍騎賽主持', L('先贏下前一盃吧！', 'Win the cup before it first!')); return; }
  const c = CUPS[k];
  if (S.gold < c.fee) { await E.say('龍騎賽主持', L('報名費不夠喔。', "You can't cover the fee.")); return; }
  S.gold -= c.fee;
  E.music('rebels');
  const place = await raceScreen(c.rivals);
  E.music('town');
  const P = [L('第一名', '1st'), L('第二名', '2nd'), L('第三名', '3rd'), L('第四名', '4th')];
  if (place === 0) {
    E.sfx('fanfare');
    if (!S.flags['cup_' + k]) { S.flags['cup_' + k] = true; S.flags.cups = Math.max(won, k + 1); addItem(c.prize); await E.say('龍騎賽主持', L(`冠軍！${L(c.n[0], c.n[1])}的獎品是「${nm(ITEMS[c.prize])}」！`, `Champion! The ${c.n[1]} prize: ${nm(ITEMS[c.prize])}!`)); }
    else { S.gold += c.fee * 3; await E.say('龍騎賽主持', L(`又是你！獎金 ${c.fee * 3} 金幣！`, `You again! ${c.fee * 3} gold!`)); }
  } else await E.say('龍騎賽主持', L(`${P[place]}！差一點點，再接再厲！`, `${P[place]}! So close. Try again!`));
  return place;
}

// ---------- treasure maps ----------
// a small window onto the world around the buried spot
export async function showMap(n) {
  const [[tx, ty]] = DIG[n - 1];
  const wm = MAPS.world.build();
  const R = 5, c = canvas((R * 2 + 1) * 16, (R * 2 - 1) * 16);
  for (let y = -R + 1; y < R; y++) for (let x = -R; x <= R; x++) {
    const X = tx + x, Y = ty + y;
    const k = X < 0 || Y < 0 || X >= wm.w || Y >= wm.h ? 'water' : wm.kindAt(X, Y);
    const t = canvas(16, 16);
    drawTile(t.x, k, X, Y, (dx, dy) => { const a = X + dx, b = Y + dy; return a < 0 || b < 0 || a >= wm.w || b >= wm.h ? 'water' : wm.kindAt(a, b); }, 0);
    c.x.drawImage(t, (x + R) * 16, (y + R - 1) * 16);
  }
  // the parchment: sepia it, then draw the X
  const d = c.x.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < d.data.length; i += 4) { const v = (d.data[i] * 0.3 + d.data[i + 1] * 0.5 + d.data[i + 2] * 0.2); d.data[i] = 120 + v * 0.5; d.data[i + 1] = 90 + v * 0.45; d.data[i + 2] = 50 + v * 0.3; }
  c.x.putImageData(d, 0, 0);
  c.x.strokeStyle = '#a00000'; c.x.lineWidth = 2; const cx = R * 16 + 8, cy = (R - 1) * 16 + 8;
  c.x.beginPath(); c.x.moveTo(cx - 5, cy - 5); c.x.lineTo(cx + 5, cy + 5); c.x.moveTo(cx + 5, cy - 5); c.x.lineTo(cx - 5, cy + 5); c.x.stroke();
  const close = panel(() => { windowBox(W / 2 - c.width / 2 - 8, 10, c.width + 16, c.height + 34); ctx.drawImage(c, W / 2 - c.width / 2, 18); text(L('在打叉的地方挖挖看。', 'Dig where the X is.'), W / 2, c.height + 24, '#f8f8f8', { align: 'center' }); });
  await pressKey();
  close();
}
// returns the spot index dug up, or -1
export function digAt(x, y) {
  for (let i = 0; i < DIG.length; i++) { const [[dx, dy]] = DIG[i]; if (dx === x && dy === y && S.inv['tmap' + (i + 1)] && !S.flags['dug' + (i + 1)]) return i; }
  return -1;
}
void textW; void say; void notice; void ask; void EQUIP; void stats; void heroName; void sprite;
