// The field menu (items, magic, equipment, status, party, settings, save) and shops.
import { ctx, W, H, text, textW, windowBox, bar } from './gfx.js';
import { sprite } from './sprites.js';
import { ITEMS, EQUIP, SPELLS, HEROES, BLACK, PASSIVES, expFor, nm, ds } from './data.js';
import { S, stats, spellsOf, callsOf, gadgetsOf, songsOf, leapsOf, artsOf, vowsOf, skillsOf, addItem, count, save, heroName, jobOf, spriteOf, isDawn, MAXPARTY } from './party.js';
import { bestiary, showMap } from './systems.js';
import { menu, panel, notice, ask, pressKey, statusTags, tagPages, drawTags, fit, wrap } from './ui.js';
import { sfx, vol, setVolumes, music, setMusic } from './audio.js';
import { settings as bset } from './battle.js';
import { L, LANG, isEn, setLang } from './i18n.js';

export const settings = { scan: true };
const fmtTime = (t) => { const s = Math.floor(t / 60), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60; return `${h}:${String(m).padStart(2, '0')}`; };

function drawParty(x, y, w) {
  const n = S.members.length, rh = Math.min(40, Math.floor((H - 12) / Math.max(1, n)));
  windowBox(x, y, w, 8 + n * rh);
  S.members.forEach((m, i) => {
    const s = stats(m), yy = y + 5 + i * rh;
    ctx.drawImage(sprite(spriteOf(m)).d[0], x + 8 + (m.row === 'back' ? 6 : 0), yy + 6);
    text(heroName(m), x + 32, yy, '#f8f8f8');
    text('Lv ' + m.lv, x + w - 8, yy, '#f8e070', { align: 'right' });
    text(`HP ${m.hp}/${s.maxhp}`, x + 32, yy + 12, m.hp <= 0 ? '#f86060' : m.hp < s.maxhp / 4 ? '#f8e070' : '#f8f8f8');
    if (s.maxmp) text(`MP ${m.mp}/${s.maxmp}`, x + 32, yy + 24, '#c0d0f8');
    // lingering statuses (poison, blind, silence) between the name and the level
    const tags = m.hp > 0 ? statusTags(m.st) : [], nx = x + 32 + textW(heroName(m)) + 6;
    if (tags.length) { const pages = tagPages(tags, x + w - 14 - textW('Lv ' + m.lv) - nx); drawTags(pages[Math.floor(performance.now() / 1000) % pages.length], nx, yy, 999); }
  });
}
async function pickMember(title, filter = () => true) {
  const r = await menu(S.members.map((m) => ({ label: heroName(m), right: `${m.hp}/${stats(m).maxhp}`, disabled: !filter(m) })), { x: 96, y: 40, w: 156, title });
  return r < 0 ? null : S.members[r];
}

// ---------- field menu ----------
export async function fieldMenu(info) {
  const close = panel(() => {
    drawParty(4, 4, 158);
    windowBox(166, 150, 86, 44);
    text(`${S.gold} G`, 244, 158, '#f8e070', { align: 'right' });
    text(fmtTime(S.time), 244, 174, '#f8f8f8', { align: 'right' });
  });
  let last = 0;
  for (;;) {
    const r = await menu([
      L('道具', 'Items'), L('魔法', 'Magic'), L('裝備', 'Equip'), L('狀態', 'Status'), L('隊伍', 'Party'), L('設定', 'Config'), { label: L('記錄', 'Save'), disabled: !info.canSave }, L('圖鑑', 'Bestiary'),
    ], { x: 166, y: 4, w: 86, start: last });
    if (r < 0) break;
    last = r;
    if (r === 0) await itemMenu();
    if (r === 1) await magicMenu();
    if (r === 2) await equipMenu();
    if (r === 3) await statusMenu();
    if (r === 4) await partyMenu();
    if (r === 5) await settingsMenu();
    if (r === 6) { const ok = save(0); sfx(ok ? 'save' : 'buzz'); await notice(ok ? L('冒險已記錄。', 'Saved.') : L('無法存檔（瀏覽器不允許）。', "Can't save (the browser blocked it).")); }
    if (r === 7) await bestiary();
  }
  close();
}
async function itemMenu() {
  for (;;) {
    const list = Object.keys(S.inv).sort((a, b) => (ITEMS[a].key ? 2 : ITEMS[a].equip ? 1 : 0) - (ITEMS[b].key ? 2 : ITEMS[b].equip ? 1 : 0));
    if (!list.length) { await notice(L('什麼都沒有。', 'Nothing here.')); return; }
    let desc = '';
    const close = panel(() => { windowBox(4, 190, W - 8, 30); text(desc, 12, 198); });
    const r = await menu(list.map((id) => ({ label: nm(ITEMS[id]), right: ITEMS[id].key ? '' : S.inv[id], disabled: !ITEMS[id].map && (!ITEMS[id].use || ['dmg', 'tent', 'buff', 'escape'].includes(ITEMS[id].use)), color: ITEMS[id].key ? '#f8e070' : ITEMS[id].mat ? '#c0d0a0' : undefined })), { x: 4, y: 4, w: W - 8, cols: 2, maxRows: 11, cancel: true, onMove: (i) => { const it = ITEMS[list[i]]; desc = ds(it) || (it.equip ? equipDesc(it) : ''); } });
    close();
    if (r < 0) return;
    const id = list[r], it = ITEMS[id];
    if (it.map) { await showMap(it.map); continue; }
    if (it.tgt === 'allies') { for (const m of [...S.members]) if (it.dead ? m.hp <= 0 : m.hp > 0) applyItem(id, m); addItem(id, -1); sfx('heal'); continue; }
    const target = await pickMember(L('給誰使用？', 'Use on whom?'), (m) => (it.use === 'revive' ? m.hp <= 0 : m.hp > 0));
    if (!target) continue;
    useItemOn(id, target);
  }
}
function applyItem(id, m) {
  const it = ITEMS[id], s = stats(m);
  if (it.use === 'heal') m.hp = Math.min(s.maxhp, m.hp + it.power);
  if (it.use === 'mp') m.mp = Math.min(s.maxmp, m.mp + it.power);
  if (it.use === 'cure') for (const k of it.st) delete m.st[k];
  if (it.use === 'revive') m.hp = Math.max(1, Math.round(s.maxhp * it.power));
  if (it.use === 'full') { m.hp = s.maxhp; m.mp = s.maxmp; }
}
export function useItemOn(id, m) { applyItem(id, m); addItem(id, -1); sfx('heal'); }
const STATN = { atk: ['攻擊', 'ATK'], def: ['防禦', 'DEF'], mdef: ['魔防', 'MDEF'], mag: ['魔力', 'MAG'], str: ['力量', 'STR'], spd: ['速度', 'SPD'] };
export const canEquip = (m, it) => {
  if (!it.equip) return false;
  if (it.ashen && isDawn(m)) return false;
  const H0 = HEROES[m.id];
  if (it.slot === 'weapon') return it.cls === H0.wpn;
  if (it.slot === 'armor') return H0.arm.includes(it.cls);
  return true;
};
const abName = (id) => (SPELLS[id] ? nm(SPELLS[id]) : PASSIVES[id] ? nm(PASSIVES[id]) : id);
function equipDesc(it) {
  const who = Object.keys(HEROES).filter((id) => canEquip({ id }, it)).map((id) => nm(HEROES[id])).join(L('、', ', '));
  const parts = Object.entries(STATN).filter(([k]) => it[k]).map(([k, n]) => `${L(n[0], n[1])}+${it[k]}`);
  const extra = [...(it.pass || []).map(abName), ...(it.teach ? [L(`學：${abName(it.teach)}`, `Teaches ${abName(it.teach)}`)] : [])];
  return L(`${parts.join(' ')} ${extra.join(' ')}　${who}`, `${parts.join(' ')} ${extra.join(' ')}  ${who}`);
}
const FIELD_SPELLS = new Set(['cure', 'cura', 'curaga', 'poisona', 'esuna', 'raise', 'arise', 'sanctuary', 'dawnchoir']);
async function magicMenu() {
  const caster = await pickMember(L('誰要施法？', 'Who casts?'), (m) => m.hp > 0 && spellsOf(m).some((s) => FIELD_SPELLS.has(s)));
  if (!caster) return;
  for (;;) {
    const list = spellsOf(caster).filter((s) => !BLACK.has(s));
    if (!list.length) return;
    const r = await menu(list.map((id) => ({ label: nm(SPELLS[id]), right: SPELLS[id].mp, disabled: !FIELD_SPELLS.has(id) || SPELLS[id].mp > caster.mp })), { x: 96, y: 40, w: 156, maxRows: 8, title: `${heroName(caster)}　MP ${caster.mp}` });
    if (r < 0) return;
    const sp = SPELLS[list[r]], st = stats(caster);
    if (sp.tgt === 'allies') {
      caster.mp -= sp.mp; sfx('heal');
      for (const m of S.members) { if (sp.kind === 'revive' && m.hp <= 0) m.hp = Math.max(1, Math.round(stats(m).maxhp * sp.power)); else if (sp.kind === 'heal' && m.hp > 0) m.hp = Math.min(stats(m).maxhp, m.hp + Math.round(sp.power * (1 + st.mag / 12))); }
      continue;
    }
    const t = await pickMember(L('對誰施放？', 'Cast on whom?'), (m) => (sp.kind === 'revive' ? m.hp <= 0 : m.hp > 0));
    if (!t) continue;
    caster.mp -= sp.mp; sfx('heal');
    const ts = t;
    if (sp.kind === 'heal') ts.hp = Math.min(stats(ts).maxhp, ts.hp + Math.round(sp.power * (1 + st.mag / 12)));
    if (sp.kind === 'cure') for (const k of sp.st) delete ts.st[k];
    if (sp.kind === 'revive') ts.hp = Math.max(1, Math.round(stats(ts).maxhp * sp.power));
  }
}
async function equipMenu() {
  const m = await pickMember(L('誰要換裝備？', 'Equip whom?'));
  if (!m) return;
  const SLOT = [['weapon', L('武器', 'Weapon')], ['armor', L('防具', 'Armour')], ['acc', L('飾品', 'Accessory')]];
  for (;;) {
    const st = stats(m);
    const close = panel(() => { windowBox(4, 120, W - 8, 40); text(L(`攻擊 ${st.atk}　防禦 ${st.def}　魔力 ${st.mag}`, `ATK ${st.atk}  DEF ${st.def}  MAG ${st.mag}`), 12, 126); text(L(`魔防 ${st.mdef}　速度 ${st.spd}`, `MDEF ${st.mdef}  SPD ${st.spd}`), 12, 142, '#c0d0f8'); });
    const r = await menu(SLOT.map(([k, n]) => ({ label: n, right: m.equip[k] ? nm(EQUIP[m.equip[k]]) : '──' })), { x: 4, y: 40, w: 220, title: L(`${heroName(m)}的裝備`, `${heroName(m)}'s gear`) });
    close();
    if (r < 0) return;
    const slot = SLOT[r][0];
    const opts = Object.keys(S.inv).filter((id) => EQUIP[id] && EQUIP[id].slot === slot && canEquip(m, EQUIP[id]));
    const cur = m.equip[slot];
    if (cur && EQUIP[cur].ashen && !isDawn(m)) { await notice(L('灰燼之劍黏在手上，放不開。', 'The Ashbrand clings to your hand.')); continue; }
    let preview;
    const close2 = panel(() => {
      windowBox(4, 160, W - 8, 44);
      const a = stats(m);
      let b = a;
      if (preview !== undefined) { const keep = m.equip[slot]; m.equip[slot] = preview; b = stats(m); m.equip[slot] = keep; }
      const rows = [['atk', a.atk, b.atk], ['def', a.def, b.def], ['mag', a.mag, b.mag], ['mdef', a.mdef, b.mdef]];
      rows.forEach(([k, x, y], i) => { const X = 12 + (i % 2) * 120, Y = 166 + Math.floor(i / 2) * 16; const lbl = `${L(STATN[k][0], STATN[k][1])} ${x} → `; text(lbl, X, Y); text(String(y), X + textW(lbl), Y, y > x ? '#78f878' : y < x ? '#f87878' : '#f8f8f8'); });
    });
    const labels = [{ label: L('（卸下）', '(Remove)') }, ...opts.map((id) => ({ label: nm(EQUIP[id]), right: S.inv[id] }))];
    const k = await menu(labels, { x: 60, y: 20, w: 180, title: SLOT[r][1], maxRows: 7, onMove: (i) => { preview = i === 0 ? null : opts[i - 1]; } });
    close2();
    if (k < 0) continue;
    if (k === 0 && slot === 'weapon') { sfx('buzz'); continue; }
    if (cur) addItem(cur, 1);
    if (k === 0) m.equip[slot] = null;
    else { m.equip[slot] = opts[k - 1]; addItem(opts[k - 1], -1); }
    const s2 = stats(m); m.hp = Math.min(m.hp, s2.maxhp); m.mp = Math.min(m.mp, s2.maxmp);
    sfx('ok');
  }
}
async function statusMenu() {
  const m = await pickMember(L('查看誰的狀態？', 'Whose status?'));
  if (!m) return;
  const st = stats(m);
  const close = panel(() => {
    windowBox(4, 4, W - 8, H - 8);
    ctx.drawImage(sprite(spriteOf(m)).d[0], 14, 14);
    text(`${heroName(m)}　${L(jobOf(m)[0], jobOf(m)[1])}`, 38, 12, '#f8e070');
    text(`Lv ${m.lv}　${L(m.row === 'back' ? '後排' : '前排', m.row === 'back' ? 'Back row' : 'Front row')}`, 38, 28);
    const tags = m.hp > 0 ? statusTags(m.st) : [], lx = 38 + textW(`Lv ${m.lv}　${L(m.row === 'back' ? '後排' : '前排', m.row === 'back' ? 'Back row' : 'Front row')}`) + 10;
    if (tags.length) drawTags(tags, lx, 28, W - 14 - lx);
    text(`${L('經驗', 'EXP')} ${m.exp}`, 14, 46); text(`${L('下一級', 'Next')} ${Math.max(0, expFor(m.lv + 1) - m.exp)}`, 130, 46);
    const rows = [[`HP ${m.hp}/${st.maxhp}`, `MP ${m.mp}/${st.maxmp}`], [`${L('攻擊', 'ATK')} ${st.atk}`, `${L('防禦', 'DEF')} ${st.def}`], [`${L('魔力', 'MAG')} ${st.mag}`, `${L('魔防', 'MDEF')} ${st.mdef}`], [`${L('力量', 'STR')} ${st.str}`, `${L('速度', 'SPD')} ${st.spd}`]];
    rows.forEach(([a, b], i) => { text(a, 14, 64 + i * 15); text(b, 130, 64 + i * 15); });
    // the gear flows along the line with a clear gap between pieces, wrapping when the names are long
    let ex = 14, ey = 127;
    for (const k of ['weapon', 'armor', 'acc']) {
      const s = fit(m.equip[k] ? nm(EQUIP[m.equip[k]]) : '──', W - 28), sw = textW(s);
      if (ex > 14 && ex + sw > W - 14) { ex = 14; ey += 13; }
      text(s, ex, ey, '#c0d0f8'); ex += sw + 14;
    }
    const sp = [...spellsOf(m), ...callsOf(m), ...gadgetsOf(m), ...songsOf(m), ...leapsOf(m), ...artsOf(m), ...vowsOf(m), ...skillsOf(m)].map((s) => nm(SPELLS[s]));
    if (sp.length) text(L('技能', 'Skills') + `  (${sp.length})`, 14, ey + 18, '#a0c0f8');
    skillGrid(sp, ey + 33, 198);
  });
  await pressKey();
  close();
  await abilityPage(m);
}
// skill names in columns as wide as the longest needs (2 to 4), rows 14 apart from y down to yMax;
// a name that still does not fit is shortened, and what does not fit at all is counted in the last cell.
// returns the y below the last row
function skillGrid(names, y, yMax) {
  if (!names.length) return y;
  const widest = Math.max(...names.map((s) => textW(s))), cols = Math.max(2, Math.min(4, Math.floor((W - 28) / (widest + 10)))), cw = Math.floor((W - 28) / cols);
  const rows = Math.max(1, Math.floor((yMax - y) / 14) + 1), cap = rows * cols, shown = names.length > cap ? cap - 1 : names.length;
  for (let i = 0; i < shown; i++) text(fit(names[i], cw - 8), 14 + (i % cols) * cw, y + Math.floor(i / cols) * 14);
  if (shown < names.length) text(`+${names.length - shown}`, 14 + (shown % cols) * cw, y + Math.floor(shown / cols) * 14, '#a0a8c0');
  return y + Math.ceil(Math.min(names.length, cap) / cols) * 14;
}
// the second status page: every skill, the passive abilities, and what the gear is teaching
async function abilityPage(m) {
  const st = stats(m);
  const all = [...spellsOf(m), ...callsOf(m), ...gadgetsOf(m), ...songsOf(m), ...leapsOf(m), ...artsOf(m), ...vowsOf(m), ...skillsOf(m)].map((s) => nm(SPELLS[s]));
  const pass = [...st.pass].map((p) => nm(PASSIVES[p]));
  const learning = ['weapon', 'armor', 'acc'].map((k) => EQUIP[m.equip[k]]).filter((it) => it && it.teach && !(m.learned || []).includes(it.teach)).map((it) => `${abName(it.teach)} ${Math.min(it.ap, (m.ap || {})[it.teach] || 0)}/${it.ap}`);
  const close = panel(() => {
    windowBox(4, 4, W - 8, H - 8);
    text(`${heroName(m)}　${L('能力', 'Abilities')}`, 14, 12, '#f8e070');
    // the passive and learning lines wrap at the bottom; the skills fill the space above them
    const pl = wrap(L('被動', 'Passive') + '：' + (pass.join(L('、', ', ')) || '－'), W - 28), ll = wrap(L('學習中', 'Learning') + '：' + (learning.join(L('、', ', ')) || '－'), W - 28);
    const y0 = H - 14 - (pl.length + ll.length) * 14 - 4;
    const y1 = skillGrid(all, 30, y0 - 20) + 6;
    pl.forEach((l, i) => text(l, 14, Math.max(y1, y0) + i * 14, '#c0d0f8'));
    ll.forEach((l, i) => text(l, 14, Math.max(y1, y0) + (pl.length + i) * 14, '#c0f8c0'));
  });
  await pressKey();
  close();
}

// swap members with the reserve, and change rows
async function partyMenu() {
  for (;;) {
    const all = [...S.members, ...S.reserve];
    const items = all.map((m, i) => ({ label: `${i < S.members.length ? '' : '　'}${heroName(m)}`, right: i < S.members.length ? L(m.row === 'back' ? '後排' : '前排', m.row === 'back' ? 'Back' : 'Front') : L('待命', 'Reserve'), color: i < S.members.length ? undefined : '#a0a8c0' }));
    const r = await menu(items, { x: 60, y: 30, w: 170, title: L('選擇成員', 'Choose a member') });
    if (r < 0) return;
    const m = all[r];
    const inParty = r < S.members.length;
    const opts = [L('換排', 'Change row'), L('交換', 'Swap')];
    const k = await menu(opts, { x: 120, y: 60, w: 110 });
    if (k === 0) { m.row = m.row === 'back' ? 'front' : 'back'; sfx('ok'); continue; }
    if (k === 1) {
      const r2 = await menu(all.map((o) => ({ label: heroName(o), disabled: o === m })), { x: 60, y: 30, w: 170, title: L('和誰交換？', 'Swap with?') });
      if (r2 < 0) continue;
      const o = all[r2];
      const a = [...S.members, ...S.reserve];
      const ia = a.indexOf(m), ib = a.indexOf(o);
      a[ia] = o; a[ib] = m;
      S.members = a.slice(0, Math.min(MAXPARTY, S.members.length)); S.reserve = a.slice(S.members.length);
      if (!S.members.some((x) => x.hp > 0)) { const tmp = S.members; S.members = a.slice(0, tmp.length); }
      sfx('ok');
      void inParty;
    }
  }
}
async function settingsMenu() {
  for (;;) {
    const lv = (v) => '■'.repeat(Math.round(v * 5)) + '□'.repeat(5 - Math.round(v * 5));
    const r = await menu([
      { label: L('戰鬥模式', 'Battle mode'), right: bset.mode === 'wait' ? L('等待', 'Wait') : L('即時', 'Active') },
      { label: L('戰鬥速度', 'Battle speed'), right: '■'.repeat(bset.speed) + '□'.repeat(6 - bset.speed) },
      { label: L('音樂', 'Music'), right: music.on ? lv(vol.music) : L('關', 'Off') }, { label: L('音效', 'Sound'), right: lv(vol.sfx) },
      { label: L('掃描線', 'Scanlines'), right: settings.scan ? L('開', 'On') : L('關', 'Off') }, { label: L('語言', 'Language'), right: LANG === 'en' ? 'English' : '中文' },
    ], { x: 30, y: 50, w: 210, title: L('設定', 'Config') });
    if (r < 0) return;
    if (r === 0) bset.mode = bset.mode === 'wait' ? 'active' : 'wait';
    if (r === 1) bset.speed = bset.speed % 6 + 1;
    if (r === 2) { if (!music.on) setMusic(true); else if (vol.music >= 1) setMusic(false); else vol.music = Math.min(1, (Math.round(vol.music * 5) + 1) / 5); }
    if (r === 3) vol.sfx = (Math.round(vol.sfx * 5) + 1) % 6 / 5;
    if (r === 4) { settings.scan = !settings.scan; document.body.classList.toggle('noscan', !settings.scan); }
    if (r === 5) setLang(LANG === 'en' ? 'zh' : 'en');
    setVolumes();
    try { localStorage.setItem('ashen-vow-settings', JSON.stringify({ music: vol.music, sfx: vol.sfx, scan: settings.scan, mode: bset.mode, speed: bset.speed })); } catch (e) { /* private mode */ }
  }
}
export function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('ashen-vow-settings'));
    if (s) { vol.music = s.music; vol.sfx = s.sfx; settings.scan = s.scan; bset.mode = s.mode || 'wait'; bset.speed = s.speed || 3; document.body.classList.toggle('noscan', !s.scan); }
  } catch (e) { /* none */ }
}

// ---------- shop ----------
export async function shop(stock) {
  const close = panel(() => { windowBox(170, 4, 82, 22); text(`${S.gold} G`, 244, 9, '#f8e070', { align: 'right' }); });
  let greeting = L('歡迎光臨！', 'Welcome!');
  for (;;) {
    const r = await ask('商人', greeting, [L('購買', 'Buy'), L('出售', 'Sell'), L('離開', 'Leave')], { cancel: true });
    if (r === 0) await buy(stock);
    else if (r === 1) await sell();
    else break;
    greeting = L('還需要什麼嗎？', 'Anything else?');
  }
  close();
}
async function buy(stock) {
  let info = '';
  for (;;) {
    const close = panel(() => { windowBox(4, 162, W - 8, 58); if (info) info.split('\n').forEach((l, i) => text(l, 12, 167 + i * 15)); });
    const r = await menu(stock.map((id) => ({ label: nm(ITEMS[id]), right: ITEMS[id].price, disabled: ITEMS[id].price > S.gold })), {
      x: 4, y: 30, w: 170, maxRows: 6, title: L('要買什麼？', 'Buy what?'),
      onMove: (i) => {
        const it = ITEMS[stock[i]];
        if (!it.equip) { info = `${ds(it)}\n${L('持有', 'Owned')} ${count(stock[i])}`; return; }
        const parts = S.members.map((m) => {
          if (!canEquip(m, it)) return null;
          const a = stats(m), keep = m.equip[it.slot]; m.equip[it.slot] = stock[i]; const b = stats(m); m.equip[it.slot] = keep;
          const d = it.slot === 'weapon' ? b.atk - a.atk : it.slot === 'armor' ? b.def - a.def : (b.def + b.mdef + b.str + b.mag + b.spd) - (a.def + a.mdef + a.str + a.mag + a.spd);
          return `${heroName(m)} ${d > 0 ? '▲' + d : d < 0 ? '▼' + -d : '＝'}`;
        }).filter(Boolean);
        info = (parts.length ? parts.slice(0, 3).join('　') + (parts.length > 3 ? '\n' + parts.slice(3).join('　') : '') : L('隊伍裡沒有人能裝備', 'No one here can use it')) + `\n${L('持有', 'Owned')} ${count(stock[i])}`;
      },
    });
    close();
    if (r < 0) return;
    const id = stock[r], it = ITEMS[id];
    if (it.price > S.gold) { sfx('buzz'); continue; }
    S.gold -= it.price; addItem(id); sfx('chest');
    if (it.equip) {
      const who = S.members.filter((m) => canEquip(m, it) && !(m.equip[it.slot] && EQUIP[m.equip[it.slot]].ashen && !isDawn(m)));
      if (who.length) {
        const k = await ask('商人', L(`要現在裝備「${nm(it)}」嗎？`, `Equip the ${nm(it)} now?`), [L('不用', 'No'), ...who.map((m) => heroName(m))]);
        if (k > 0) { const m = who[k - 1], old = m.equip[it.slot]; if (old) addItem(old); m.equip[it.slot] = id; addItem(id, -1); sfx('ok'); }
      }
    }
  }
}
async function sell() {
  for (;;) {
    const list = Object.keys(S.inv).filter((id) => !ITEMS[id].key && ITEMS[id].price > 0);
    if (!list.length) { await notice(L('沒有可以賣的東西。', 'Nothing to sell.')); return; }
    const r = await menu(list.map((id) => ({ label: `${nm(ITEMS[id])} ×${S.inv[id]}`, right: Math.floor(ITEMS[id].price / 2) })), { x: 4, y: 30, w: 200, maxRows: 9, title: L('要賣什麼？', 'Sell what?') });
    if (r < 0) return;
    addItem(list[r], -1); S.gold += Math.floor(ITEMS[list[r]].price / 2); sfx('ok');
  }
}
void bar; void stats;
