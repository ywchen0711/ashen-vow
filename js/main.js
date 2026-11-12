// Boot, the main loop, title, prologue, transitions, the story toolbox, game over and the ending.
import { ctx, W, H, canvas, text, textW, windowBox, HAND, tint } from './gfx.js';
import * as gfx from './gfx.js';
import { input, pollInput, endInput, setupTouch } from './input.js';
import { initAudio, playMusic, stopMusic, sfx, currentSong } from './audio.js';
import { UI, uiTick, say, talk, ask, wait, menu, notice } from './ui.js';
import { S, reset, resetPlus, addMember, removeMember, addItem, fullHeal, save, load, hasSave, saveInfo, setSpellNamer, stats, member, spriteOf, heroName } from './party.js';
import { SPELLS, ZONES, BOSSES, BG, ITEMS, nm } from './data.js';
import { MAPS, WORLD, DIG } from './maps.js';
import './maps2.js';
import { arena, race, forge, beastPrizes, digAt } from './systems.js';
import './story2.js';
import { F, setMaps, loadMap, updateField, drawField, walkEnt, walkPlayer, findEnt, solidAt } from './field.js';
import { startBattle, updateBattle, drawBattle, _B, settings as bset } from './battle.js';
import { fieldMenu, shop, loadSettings } from './menu.js';
import { SCRIPTS } from './story.js';
import { sprite } from './sprites.js';
import { solidKind } from './tiles.js';
import { L, LANG, isEn, setLang, onLang } from './i18n.js';

setMaps(MAPS);
function pageLang() {
  document.documentElement.lang = isEn() ? 'en' : 'zh-Hant';
  const mb = document.getElementById('menuBtn'); if (mb) mb.textContent = L('選單', 'MENU');
}
pageLang(); onLang(pageLang);
setSpellNamer((s) => nm(SPELLS[s]));
loadSettings();
for (const m of Object.values(MAPS)) { const b = m.build; m.build = () => b(S.flags); }

let scene = 'boot';
const G = (window.G = { S, F, get scene() { return scene; }, SCRIPTS, UI, _B, bset });

// ---------- transitions ----------
const T = { dark: 0, col: '#000', mosaic: 0, job: null };
function trans(kind, n = 16, col = '#000') { return new Promise((res) => { T.job = { kind, n, t: 0, res }; T.col = col; }); }
function updateTrans() {
  const j = T.job;
  if (!j) return;
  j.t++;
  const k = Math.min(1, j.t / j.n);
  if (j.kind === 'out') T.dark = Math.ceil(k * 8) / 8;
  if (j.kind === 'in') T.dark = Math.floor((1 - k) * 8) / 8;
  if (j.kind === 'battle') { T.swirl = k; T.dark = k > 0.7 ? (k - 0.7) / 0.3 : 0; }
  if (j.t >= j.n) { T.job = null; T.swirl = 0; if (j.kind === 'battle') T.dark = 1; j.res(); }
}
function drawTrans() {
  if (T.swirl) {
    // the screen breaks into stripes that slide apart
    const snap = canvas(W, H); snap.x.drawImage(ctx.canvas, 0, 0, W, H);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 8) { const o = ((y / 8) % 2 ? 1 : -1) * T.swirl * W; ctx.drawImage(snap, 0, y, W, 8, o, y, W, 8); }
  }
  if (T.dark > 0) { ctx.globalAlpha = T.dark; ctx.fillStyle = T.col; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  if (FX.flash > 0) { ctx.globalAlpha = Math.min(1, FX.flash / FX.flashN); ctx.fillStyle = FX.flashCol; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}
const FX = { flash: 0, flashN: 1, flashCol: '#fff' };

// ---------- the toolbox handed to story scripts ----------
const mapMusic = () => F.def.music;
const E = {
  say, talk, ask, wait, sfx,
  music: (n) => (n ? playMusic(n) : stopMusic(0.6)),
  ent: (id) => findEnt(id),
  walk: (e, path, sp) => walkEnt(e, path, sp),
  walkPlayer,
  join(id, lv) { addMember(id, lv); S.flags['has_' + id] = true; sfx('comrade'); },
  leave(id) { removeMember(id); },
  give(id, n = 1) { addItem(id, n); },
  heal: fullHeal,
  save: () => save(0),
  async rest(msg, name = null) {
    await trans('out', 20);
    playMusic('inn', { restart: true });
    fullHeal();
    await wait(200);
    playMusic(mapMusic());
    await trans('in', 20);
    await say(name, msg);
  },
  shop,
  battle: (troop, opts) => runBattle(troop, opts),
  arena: () => arena(E), race: () => race(E), forge: () => forge(E), beastPrizes: () => beastPrizes(E),
  has: (id) => S.members.some((m) => m.id === id),
  setShip(map, x, y) { S.ship = { map, x, y }; },
  scene: (s) => { scene = s; },
  removeEnt(x) { const e = typeof x === 'string' ? findEnt(x) : x; if (e) e.gone = true; },
  spawn(e) { const o = { px: e.x * 16, py: e.y * 16, ...e }; F.ents.push(o); return o; },
  flash(col, n) { FX.flash = n; FX.flashN = n; FX.flashCol = col; return wait(Math.ceil(n / 2)); },
  shake(n) { F.shake = n; },
  async fadeOut() { await trans('out', 30); },
  async warp(to, x, y, dir, keepDark) { await warpTo(to, x, y, dir, keepDark); },
  ending: () => ending(),
  emberFalls: () => emberFalls(),
};
F.E = E;
F.runScript = async (name, ent) => {
  const fn = SCRIPTS[name];
  if (!fn) { console.warn('no script', name); return; }
  F.busy = true;
  try { await fn(E, ent); } catch (err) { console.error(err); }
  F.busy = false;
  if (T.dark > 0 && !T.job) await trans('in', 20);
};
F.onWarp = async (w) => {
  if (w.need && !w.need(S.flags)) { F.busy = true; await say(null, w.msg ? w.msg() : L('前面過不去。', "You can't go that way.")); F.busy = false; return; }
  F.busy = true;
  sfx(MAPS[w.to] && MAPS[w.to].world ? 'door' : 'stairs');
  await warpTo(w.to, w.tx, w.ty, w.dir);
  F.busy = false;
};
F.onMenu = async () => {
  F.busy = true; sfx('ok');
  await fieldMenu({ canSave: !!(F.def.world && !F.flying) });
  F.busy = false;
};
F.onEncounter = async (zone) => {
  F.busy = true;
  const table = ZONES[zone], total = table.reduce((s, [w]) => s + w, 0);
  let r = Math.random() * total, troop = table[0][1];
  for (const [w, t] of table) { r -= w; if (r <= 0) { troop = t; break; } }
  const first = S.members.some((m) => m.hp > 0 && stats(m).pass.has('firststrike'));
  await runBattle(troop, { bg: BG[zone], preempt: Math.random() < (first ? 0.25 : 0.06) });
  F.busy = false;
};
// the upgraded Wren climbs to the Cloud Sea and back down, staying over the same spot
F.onAltitude = async () => {
  F.busy = true;
  const up = !F.def.sky, x = F.p.x, y = F.p.y;
  sfx('warp');
  await trans('out', 20, '#ffffff');
  F.flying = true;
  loadMap(up ? 'sky' : 'world', x, y, F.p.dir);
  F.flying = true;
  playMusic('airship');
  await trans('in', 20, '#ffffff');
  F.busy = false;
};
F.onNoLand = async (why) => { F.busy = true; await say(null, why); F.busy = false; };
// digging with the treasure spade
F.onDig = async (x, y) => {
  F.busy = true;
  sfx('bump');
  const i = digAt(x, y);
  if (i < 0) { await say(null, L('挖了一會兒……什麼也沒有。', 'You dig for a while... nothing.')); F.busy = false; return; }
  S.flags['dug' + (i + 1)] = true;
  const prize = DIG[i][1];
  if (prize === 'goldmaw') {
    await say(null, L('鏟子敲到了什麼硬硬的東西……是一隻巨大的金色螃蟹！', 'The spade strikes something hard... a gigantic golden crab!'));
    await runBattle('goldmaw', { bg: 'desert' });
    sfx('chest'); addItem('giantbelt'); S.gold += 20000;
    await say(null, L('螃蟹守著的寶箱裡有「巨人腰帶」和 20000 金幣！', "The chest the crab guarded holds a Giant's Belt and 20000 gold!"));
  } else { sfx('chest'); addItem(prize); await say(null, L(`挖到了寶箱！得到了「${nm(ITEMS[prize])}」！`, `You dig up a chest! Found ${nm(ITEMS[prize])}!`)); }
  F.busy = false;
};
F.onStep = () => {
  if (S.steps % 6 === 0) for (const m of S.members) if (m.st.poison && m.hp > 1) { m.hp--; FX.flash = 3; FX.flashN = 6; FX.flashCol = '#a040c0'; }
};
F.onBoard = () => playMusic('airship');
F.onLand = () => playMusic(mapMusic());

async function warpTo(to, x, y, dir, keepDark) {
  if (!keepDark || T.dark < 1) await trans('out', 14);
  const wasFlying = F.flying;
  if (MAPS[to] && !MAPS[to].world) F.flying = false;
  loadMap(to, x, y, dir);
  playMusic(F.flying ? 'airship' : mapMusic());
  await trans('in', 14);
  void wasFlying;
}
async function runBattle(troop, opts = {}) {
  if (typeof troop === 'string') troop = BOSSES[troop];
  sfx('encounter');
  stopMusic();
  await trans('battle', 34);
  scene = 'battle';
  T.dark = 0;
  const r = await startBattle(troop, opts);
  if (r === 'lose' && opts.noGameOver) { for (const m of S.members) if (m.hp <= 0) m.hp = 1; }
  else if (r === 'lose') { gameOver(); return new Promise(() => {}); }
  scene = 'field';
  T.dark = 1;
  playMusic(F.flying ? 'airship' : mapMusic(), { restart: true });
  await trans('in', 16);
  return r;
}

// ---------- title ----------
const title = { t: 0, sel: 0, ready: false };
function updateTitle() {
  title.t++;
  if (!title.ready) { if (input.anyPressed()) { title.ready = true; sfx('ok'); } return; }
  if (UI.active || T.job) return;
  const opts = titleOpts();
  if (input.repeat('down')) { title.sel = (title.sel + 1) % opts.length; sfx('cursor'); }
  if (input.repeat('up')) { title.sel = (title.sel + opts.length - 1) % opts.length; sfx('cursor'); }
  if (input.pressed('a')) {
    if (opts[title.sel].disabled) { sfx('buzz'); return; }
    sfx('ok');
    const id = opts[title.sel].id;
    if (id === 'new') newGame();
    else if (id === 'plus') newGame(true);
    else if (id === 'lang') setLang(LANG === 'en' ? 'zh' : 'en');
    else continueGame();
  }
  if (input.pressed('b')) title.ready = false;
}
const titleOpts = () => {
  const o = [{ id: 'new', label: L('新的旅程', 'New Game') }, { id: 'cont', label: L('繼續旅程', 'Continue'), disabled: !hasSave(0) }];
  if (hasSave(1)) o.push({ id: 'plus', label: L('再一次的旅程（繼承）', 'New Game+') });
  o.push({ id: 'lang', label: LANG === 'en' ? 'Language: English' : '語言：中文' });
  return o;
};
function bigText(s, x, y, top, bot, scale = 2) {
  const w = textW(s) + 4, c = canvas(w, 16);
  c.x.drawImage(gfx.glyphs(s, '#ffffff'), 1, 0);
  const id = c.x.getImageData(0, 0, w, 16), d = id.data;
  for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < w; xx++) {
    const i = (yy * w + xx) * 4;
    if (d[i + 3] > 110) { const t = Math.floor((yy / 13) * 3) / 3; d[i] = top[0] + (bot[0] - top[0]) * t; d[i + 1] = top[1] + (bot[1] - top[1]) * t; d[i + 2] = top[2] + (bot[2] - top[2]) * t; d[i + 3] = 255; } else d[i + 3] = 0;
  }
  c.x.putImageData(id, 0, 0);
  const o = canvas(w + 2, 18);
  for (const [dx, dy] of [[0, 1], [2, 1], [1, 0], [1, 2], [2, 2]]) o.x.drawImage(tint(c, '#000000'), dx, dy);
  o.x.drawImage(c, 1, 1);
  ctx.drawImage(o, Math.round(x - (o.width * scale) / 2), y, o.width * scale, o.height * scale);
}
function drawSky(t) {
  ctx.fillStyle = '#000018'; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) { const x = (i * 97 + 13) % W, y = (i * 61) % 150; if ((t + i * 11) % 120 < 100) { ctx.fillStyle = i % 7 ? '#5c5c9c' : '#fcfcfc'; ctx.fillRect(x, y, 1, 1); } }
  // the white moon and the Ember
  ctx.fillStyle = '#fcfce0'; ctx.beginPath(); ctx.arc(52, 40, 12, 0, 7); ctx.fill();
  ctx.fillStyle = '#000018'; ctx.beginPath(); ctx.arc(58, 36, 11, 0, 7); ctx.fill();
  const pulse = 1 + Math.sin(t / 30) * 0.06;
  ctx.fillStyle = '#7c0800'; ctx.beginPath(); ctx.arc(200, 54, 26 * pulse, 0, 7); ctx.fill();
  ctx.fillStyle = '#f83800'; ctx.beginPath(); ctx.arc(200, 54, 21, 0, 7); ctx.fill();
  ctx.fillStyle = '#fc9838'; ctx.beginPath(); ctx.arc(196, 50, 9, 0, 7); ctx.fill();
  // the castle on the hill
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 176, W, 48);
  ctx.beginPath(); ctx.moveTo(0, 180); ctx.quadraticCurveTo(128, 150, 256, 182); ctx.lineTo(256, 224); ctx.lineTo(0, 224); ctx.fill();
  for (const [x, w, h] of [[96, 14, 40], [112, 30, 26], [144, 14, 46], [160, 20, 22]]) { ctx.fillRect(x, 162 - h, w, h + 10); ctx.beginPath(); ctx.moveTo(x - 2, 162 - h); ctx.lineTo(x + w / 2, 150 - h); ctx.lineTo(x + w + 2, 162 - h); ctx.fill(); }
  ctx.fillStyle = '#f8b800'; for (const [x, y] of [[100, 132], [150, 126], [118, 146], [166, 150]]) if ((t >> 5) % 3 || x !== 150) ctx.fillRect(x, y, 2, 3);
}
function drawTitle() {
  const t = title.t;
  drawSky(t);
  if (isEn()) { bigText('THE ASHEN VOW', W / 2, 74, [252, 252, 252], [248, 120, 88], 2); text('灰誓騎士', W / 2, 112, '#f8d8a8', { align: 'center' }); }
  else { bigText('灰誓騎士', W / 2, 70, [252, 252, 252], [248, 120, 88], 3); text('THE ASHEN VOW', W / 2, 120, '#f8d8a8', { align: 'center' }); }
  if (!title.ready) {
    if ((t >> 5) % 2) text('PRESS START', W / 2, 150, '#ffffff', { align: 'center' });
    text(L('Z 決定　X 取消　C 選單', 'Z: OK   X: Cancel   C: Menu'), W / 2, 196, '#a0a0c0', { align: 'center' });
  } else {
    const opts = titleOpts();
    const bw = Math.max(128, ...opts.map((o) => textW(o.label) + 40)), by = 136 - (opts.length - 3) * 17;
    windowBox(W / 2 - bw / 2, by, bw, 11 + opts.length * 17);
    opts.forEach((o, i) => text(o.label, W / 2 - bw / 2 + 24, by + 7 + i * 17, o.disabled ? '#8088a8' : '#f8f8f8'));
    ctx.drawImage(HAND, W / 2 - bw / 2 + 8 + ((t >> 3) % 2), by + 8 + title.sel * 17);
  }
  text(L('© 2026 原創作品', '© 2026 An original game'), W / 2, H - 14, '#7c7ca0', { align: 'center', shadow: null });
}

// ---------- prologue ----------
const PRO = () => (isEn() ? [
  'Two moons hang over the land.',
  'The white moon lights the night.',
  'The red one, the Ember, appeared',
  'twenty years ago, and never moves.',
  '',
  'Four Lenses keep the waters, the',
  'earth, the winds and the fires.',
  '',
  'Then the King of Varn sent his',
  'Ashguard to take them, one by one...',
] : [
  '這片大地的夜空，掛著兩輪月亮。',
  '白色的月亮照亮夜晚；',
  '紅色的「燼月」，是二十年前',
  '才出現的，從來不曾移動。',
  '',
  '四枚「泉鏡」守護著大地的',
  '水、土、風與火。',
  '',
  '直到某一年，瓦恩國王派出灰衛隊，',
  '把泉鏡一枚一枚地奪了回來……',
]);
const intro = { t: 0 };
async function newGame(plus = false) {
  await trans('out', 30);
  if (plus) { const old = saveInfo(1); reset(); if (old) resetPlus(old); } else reset();
  addMember('hale', 1);
  scene = 'intro'; intro.t = 0; intro.leaving = false;
  playMusic('prelude', { restart: true });
  T.dark = 0;
}
function updateIntro() {
  intro.t++;
  const done = intro.t > PRO().length * 46 + 220;
  if ((input.pressed('a') || done) && !T.job && !intro.leaving) {
    intro.leaving = true;
    (async () => {
      await trans('out', 30);
      scene = 'field';
      loadMap('varncastle', 11, 20, 'u');
      F.banner = 0;
      playMusic('empire');
      await trans('in', 30);
      F.runScript('opening');
    })();
  }
}
function drawIntro() {
  drawSky(intro.t);
  ctx.fillStyle = 'rgba(0,0,16,0.55)'; ctx.fillRect(0, 0, W, H);
  PRO().forEach((l, i) => {
    const a = Math.max(0, Math.min(1, (intro.t - i * 46) / 40));
    if (a <= 0) return;
    ctx.globalAlpha = a;
    text(l, W / 2, 18 + i * 16, '#e8e8f8', { align: 'center' });
  });
  ctx.globalAlpha = 1;
}

// ---------- continue / game over ----------
async function continueGame() {
  await trans('out', 20);
  if (!load(0)) { await trans('in', 10); return; }
  scene = 'field';
  F.flying = false;
  loadMap(S.map, S.x, S.y, S.dir);
  playMusic(mapMusic());
  await trans('in', 20);
}
const over = { t: 0 };
function gameOver() {
  scene = 'over'; over.t = 0; T.dark = 0; UI.clear(); F.busy = false;
  playMusic('gameover', { restart: true });
}
function updateOver() {
  over.t++;
  if (over.t > 90 && input.pressed('a') && !T.job) {
    (async () => { await trans('out', 30); scene = 'title'; title.ready = false; playMusic('title'); await trans('in', 30); })();
  }
}
function drawOver() {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = Math.min(1, over.t / 60);
  bigText('GAME OVER', W / 2, 80, [248, 96, 96], [160, 24, 40], 2);
  text(L('灰燼散去，誓言未竟……', 'The ashes scatter; the vow unkept...'), W / 2, 130, '#c0c0d0', { align: 'center' });
  if (over.t > 90 && (over.t >> 5) % 2) text(L('按 Z 回到標題畫面', 'Press Z to return to the title'), W / 2, 170, '#f8f8f8', { align: 'center' });
  ctx.globalAlpha = 1;
}

// ---------- ending ----------
// the end of Part I: the Ember goes out, and the story carries on into Part II (story2.js)
async function emberFalls() {
  stopMusic(1);
  F.shake = 40; sfx('boom');
  await say('燼月', L('……這些微小的光……怎麼……如此……', '...These little lights... how can they... be so...'));
  for (let i = 0; i < 4; i++) { E.flash('#ffffff', 12); sfx('boom'); F.shake = 20; await wait(26); }
  await trans('out', 60, '#ffffff');
  T.col = '#ffffff';
  S.flags.ember_dead = true;
  loadMap('varncastle', 11, 16, 'u');
  F.banner = 0;
  for (const e of F.ents) if (e.type === 'npc') e.gone = true;
  const npc = (id, sp, x, y, dir) => E.spawn({ type: 'npc', id, sprite: sp, x, y, dir });
  npc('e_king', 'king', 12, 13, 'd'); npc('e_maid', 'mychars5', 9, 14, 'd'); npc('e_g', 'soldier0', 15, 14, 'd');
  playMusic('reunion');
  await trans('in', 60, '#ffffff');
  T.col = '#000';
  await wait(30);
  await say(null, L('燼井的封印再次合上了。夜空中，紅色的月亮靜靜地熄滅，化成一顆普通的星星。', 'The seal on the Starwell closed once more. In the night sky, the red moon quietly went out and became an ordinary star.'));
  await say('亞爾多斯王', L('海爾。你們做到了。……瓦恩欠你們的，是一輩子也還不清的。', 'Hale. You did it. ...Varn owes you a debt it can never repay.'));
  await say('亞爾多斯王', L('我想重新成立灰衛隊。不，是「曙衛隊」。由你來帶領。', 'I want to raise the Ashguard again. No: the Dawnguard. And I want you to lead it.'));
  await say('海爾', L('……陛下，我想先去一趟荊棘村。還有文湖。我欠那裡的人，太多了。', '...Your Majesty, first I want to go to Thornby. And to Wenmere. I owe the people there too much.'));
  await say(null, L('那天晚上，夜空中多了一顆特別亮的星星。\n大家都說，那是高文。', 'That night there was one especially bright star in the sky.\nEveryone said it was Gowan.'));
  await wait(30);
  await trans('out', 60);
  await SCRIPTS.part2_begin(E);
}
// the true end, after the Hush
async function ending() {
  stopMusic(1);
  await trans('out', 60, '#ffffff');
  T.col = '#ffffff';
  S.flags.cleared = true; S.flags.p2_end = true;
  loadMap('belltoll', 13, 12, 'u');
  F.banner = 0;
  playMusic('reunion');
  await trans('in', 60, '#ffffff');
  T.col = '#000';
  await wait(30);
  await say(null, L('鈴聲傳遍了整片大地。灰霧一點一點地散開，被拿走的名字，一個一個回到了人們的嘴邊。', 'The bell rang out over the whole land. Little by little the grey mist lifted, and the names that had been taken came back, one by one, to people\'s lips.'));
  await say('伊爾賽', L('……媽媽。是我，伊爾賽。', '...Mother. It\'s me. Ilse.'));
  await say('鐘鳴村的母親', L('伊爾賽……我的伊爾賽。我好像做了一個好長、好冷的夢。', 'Ilse... my Ilse. I think I had a long, cold dream.'));
  if (member('dorrin')) { await say('朵琳', L('……老爸？', '...Dad?')); await say('柯溫', L('朵琳……你長這麼大了。對不起，我連你的名字都忘了好久。', 'Dorrin... look how you\'ve grown. I\'m sorry. For so long I couldn\'t even remember your name.')); await say('朵琳', L('笨蛋老爸。……鷦鷯號，我修好了喔。', 'Stupid old man. ...I fixed the Wren, you know.')); }
  await trans('out', 40);
  loadMap('varncastle', 11, 16, 'u');
  F.banner = 0;
  for (const e of F.ents) if (e.type === 'npc') e.gone = true;
  const npc = (id, sp, x, y, dir) => E.spawn({ type: 'npc', id, sprite: sp, x, y, dir });
  npc('e_king', 'king', 12, 13, 'd'); npc('e_maid', 'mychars5', 9, 14, 'd'); npc('e_g', 'soldier0', 15, 14, 'd');
  await trans('in', 40);
  await say(null, L('一個月後，瓦恩城。', 'A month later, Castle Varn.'));
  await say('亞爾多斯王', L('曙衛隊長海爾。今天，我們在城門前立了一塊石碑。上面刻著所有在這段日子裡失去的人的名字。', 'Captain Hale of the Dawnguard. Today we raised a stone before the castle gate. On it are the names of everyone we lost in these days.'));
  await say('海爾', L('伊索爾德院長、荊棘村的人們、加瑞克、奧羅師父……還有灰衛隊的四十人。', 'Prioress Ysolde, the people of Thornby, Garrick, Master Oro... and the forty of the Ashguard.'));
  await say('海爾', L('還有高文。和奧瑞爾。', 'And Gowan. And Aurel.'));
  if (member('nyra')) await say('奈菈', L('記得一個人，有時候會很痛。可是忘掉，就等於讓他們再死一次。', 'Remembering someone can hurt. But forgetting them is letting them die all over again.'));
  if (member('miel')) await say('蜜兒', L('院長說「不要恨他們」。我想，她也想說「不要忘了他們」。', 'The prioress said, "Don\'t hate them." I think she also meant, "Don\'t forget them."'));
  if (member('brin')) await say('布琳', L('那一杯，這次真的要喝了。我請客，誰都不准跑。', 'That drink. This time we\'re really having it. My treat, and nobody runs off.'));
  if (member('tal')) await say('塔爾', L('師父，泉鏡都回到原處了。我會好好守著它們。', 'Master, the lenses are all back where they belong. I will guard them well.'));
  if (member('ilse')) await say('伊爾賽', L('我會留在鐘鳴村，替大家記住每一個名字。……也包括你們的。', 'I\'ll stay in Belltoll and keep every name. ...Yours too.'));
  await say(null, L('那天晚上，夜空中那顆特別亮的星星旁邊，又多了一顆小小的星星。', 'That night, beside the especially bright star, a small new star appeared.'));
  await wait(40);
  await trans('out', 60);
  scene = 'credits'; credits.t = 0;
  playMusic('finale', { restart: true });
  T.dark = 0;
  // the cleared game: it carries on at Castle Varn (the Abyss is open), and seeds New Game+
  S.map = 'varncastle'; S.x = 11; S.y = 16; S.dir = 'u'; S.ship = { map: 'world', x: 22, y: 16 };
  fullHeal();
  save(1); save(0);
}
const CREDITS = () => (isEn() ? [
  ['THE ASHEN VOW', 'big'], ['灰誓騎士'], [''], [''],
  ['- CAST -', 'y'], ['Hale, the Ashen Knight'], ['Brin, lancer of Varn'], ['Nyra, caller of Thornby'], ['Miel, acolyte of Wenmere'], ['Gowan, the old sage'], ['Tal, monk of Salt'], ['Dorrin, artisan of Kestrel'], ['Ilse, Namekeeper of Belltoll'], [''],
  ['King Aldous   Garrick   Morvane'], ['Prioress Ysolde   Master Oro'], ['Corwin   Sable   Raszh'], ['the Ember Heart'], ['Aurel, the Nameless'], ['and the Hush'], [''], [''],
  ['- ART -', 'y'], ['Characters and monsters: Ctske,'], ['Erbarlow, devurandom'], ['Monsters: Emerald (Heather Harvey),'], ['NES colours by ImogiaGames'], ['More monsters: Redshrike,'], ['NES version by devurandom;'], ['ImogiaGames (after Redshrike, Balmer,'], ['MoikMellah, Umplix, codeinfernogames,'], ['devnewton, titleknown, artisticdude,'], ['Spring Spring, Technopeasant)'], ['Tiles: Demetrius (Nestor), devurandom'], ['Icons: ETTiNGRiNDER'], [''],
  ['- MUSIC -', 'y'], ['"Generic 8-bit JRPG Soundtrack"'], ['by AVGVSTA (CC-BY)'], [''], ['Font: Cubic 11'], ['Hosted by OpenGameArt.org'], [''], [''],
  ['THANK YOU FOR PLAYING!', 'y'], [''], [''], ['THE END', 'big'],
] : [
  ['灰誓騎士', 'big'], ['THE ASHEN VOW'], [''], [''],
  ['— 登場人物 —', 'y'], ['海爾　灰誓騎士'], ['布琳　瓦恩的槍騎士'], ['奈菈　荊棘村的喚靈師'], ['蜜兒　文湖的見習修女'], ['高文　老賢者'], ['塔爾　沙爾特的武僧'], ['朵琳　紅隼港的機巧師'], ['伊爾賽　鐘鳴村的記名師'], [''],
  ['亞爾多斯王　加瑞克　莫凡'], ['伊索爾德院長　奧羅師父'], ['柯溫　賽柏　拉什'], ['燼月之心'], ['無名者奧瑞爾'], ['以及　寂靜之心'], [''], [''],
  ['— 美術 —', 'y'], ['人物與怪物：Ctske、Erbarlow、devurandom'], ['怪物：Emerald (Heather Harvey)'], ['NES 配色：ImogiaGames'], ['更多怪物：Redshrike'], ['（NES 版：devurandom）'], ['ImogiaGames（改編自 Redshrike、Balmer、'], ['MoikMellah、Umplix、codeinfernogames、'], ['devnewton、titleknown、artisticdude、'], ['Spring Spring、Technopeasant）'], ['地圖：Demetrius (Nestor)、devurandom'], ['圖示：ETTiNGRiNDER'], [''],
  ['— 音樂 —', 'y'], ['「Generic 8-bit JRPG Soundtrack」'], ['AVGVSTA (CC-BY)'], [''], ['字型：俐方體11號 (Cubic 11)'], ['素材來自 OpenGameArt.org'], [''], [''],
  ['感謝你的遊玩！', 'y'], [''], [''], ['—— 完 ——', 'big'],
]);
const credits = { t: 0 };
function updateCredits() {
  credits.t++;
  const end = CREDITS().length * 18 * 2 + H * 2;
  if (credits.t > end && input.pressed('a') && !T.job) {
    (async () => { await trans('out', 40); scene = 'title'; title.ready = false; playMusic('title'); await trans('in', 40); })();
  }
}
function drawCredits() {
  drawSky(credits.t);
  ctx.fillStyle = 'rgba(0,0,16,0.6)'; ctx.fillRect(0, 0, W, H);
  const y0 = H - credits.t / 2, list = CREDITS();
  list.forEach(([s, k], i) => {
    let y = y0 + i * 18;
    if (k === 'big' && i === list.length - 1) y = Math.max(y, 90);
    if (y < -20 || y > H) return;
    if (k === 'big') bigText(s, W / 2, y - 6, [252, 252, 252], [248, 120, 88], 2);
    else text(s, W / 2, y, k === 'y' ? '#f8e070' : '#e8e8f8', { align: 'center' });
  });
  [...S.members, ...S.reserve].forEach((m, i) => { const fr = sprite(spriteOf(m)).r[Math.floor(credits.t / 8) % 4]; ctx.drawImage(fr, ((credits.t * 0.5 + 40 - i * 20) % (W + 120)) - 40, H - 30); });
}

// ---------- the loop ----------
let acc = 0, last = performance.now();
function step() {
  pollInput();
  uiTick();
  updateTrans();
  if (FX.flash > 0) FX.flash--;
  if (scene === 'field' || scene === 'battle') S.time++;
  if (UI.active) UI.update();
  switch (scene) {
    case 'title': updateTitle(); break;
    case 'intro': updateIntro(); break;
    case 'field': if (!T.job) updateField(); else F.frame++; break;
    case 'battle': updateBattle(); break;
    case 'over': updateOver(); break;
    case 'credits': updateCredits(); break;
  }
  endInput();
}
function draw() {
  switch (scene) {
    case 'boot': ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); text('Loading…', W / 2, H / 2 - 6, '#fff', { align: 'center' }); break;
    case 'title': drawTitle(); break;
    case 'intro': drawIntro(); break;
    case 'field': drawField(); break;
    case 'battle': drawBattle(); break;
    case 'over': drawOver(); break;
    case 'credits': drawCredits(); break;
  }
  UI.draw();
  drawTrans();
}
function frame(now) {
  acc += Math.min(100, now - last); last = now;
  let n = 0;
  const steps = G.turbo || 1;
  while (acc >= 1000 / 60 && n < 4 * steps) { for (let k = 0; k < steps; k++) step(); acc -= 1000 / 60; n += steps; }
  if (n) { draw(); gfx.present(!document.body.classList.contains('noscan')); }
  requestAnimationFrame(frame);
}
const unlock = () => initAudio();
addEventListener('keydown', unlock); addEventListener('pointerdown', unlock); addEventListener('touchstart', unlock);

async function boot() {
  try { await document.fonts.load('12px Cubic11'); } catch (e) { /* fall back */ }
  await new Promise((r) => setTimeout(r, 30));
  setupTouch();
  scene = 'title';
  playMusic('title');
  window.READY = 1;
}
requestAnimationFrame(frame);
boot();

// hooks for automated checks
Object.assign(G, {
  solidAt, solidKind, T, newGame, continueGame, loadMap, trans, runBattle, E, addMember, stats, fullHeal, WORLD, MAPS, DIG,
  go(map, x, y, dir = 'd') { scene = 'field'; T.dark = 0; F.flying = !!(MAPS[map].sky); loadMap(map, x, y, dir); playMusic(MAPS[map].music); },

  setScene(s) { scene = s; },
  async sim(troop, opts = {}) { if (typeof troop === 'string') troop = BOSSES[troop]; scene = 'battle'; T.dark = 0; const r = await startBattle(troop, opts); scene = 'field'; return r; },
  uiActive: () => UI.active,
  // a walking route avoiding walls, for automated checks
  route(tx, ty) {
    const { w, h } = F.map, sx = F.p.x, sy = F.p.y, prev = new Map(), q = [[sx, sy]];
    const solid = (x, y) => x < 0 || y < 0 || x >= w || y >= h || (G.solidAt && G.solidAt(x, y)) || F.ents.some((e) => !e.gone && (e.type === 'warp' || e.type === 'trigger') && e.x === x && e.y === y);
    prev.set(sx + ',' + sy, null);
    while (q.length) { const [x, y] = q.shift(); if (x === tx && y === ty) break; for (const [dx, dy, d] of [[0, -1, 'u'], [0, 1, 'd'], [-1, 0, 'l'], [1, 0, 'r']]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (prev.has(k) || (solid(nx, ny) && !(nx === tx && ny === ty))) continue; prev.set(k, [x, y, d]); q.push([nx, ny]); } }
    let k = tx + ',' + ty, out = '';
    if (!prev.has(k)) return null;
    while (prev.get(k)) { const [x, y, d] = prev.get(k); out = d + out; k = x + ',' + y; }
    return out;
  },
  idle: () => scene === 'field' && !F.busy && !UI.active && !T.job,
});
void menu; void notice; void currentSong; void talk; void heroName; void stats;
