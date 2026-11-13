// Dialogue boxes, choices and list menus. Each returns a promise, so story scripts can be
// written as plain async code; the main loop feeds them input and draws them on top.
import { ctx, W, H, text, textW, windowBox, HAND, HAND_D } from './gfx.js';
import { input } from './input.js';
import { sfx } from './audio.js';
import { speaker, L } from './i18n.js';

// short coloured status tags (poison, sleep...) so the panels show who is ailing at a glance
const STTAG = {
  poison: ['毒', 'PSN', '#c080f8'], sleep: ['眠', 'SLP', '#a0c0f8'], blind: ['盲', 'BLD', '#a8a8a8'], mute: ['默', 'MUT', '#f8a0d0'],
  slow: ['慢', 'SLW', '#f8b060'], haste: ['快', 'HST', '#70f0f8'], protect: ['盾', 'PRT', '#f8f0a0'], ward: ['魔障', 'WRD', '#a0e0f8'],
  regen: ['再生', 'RGN', '#80f8a0'], stop: ['停', 'STP', '#a0a0f8'], berserk: ['狂', 'BSK', '#f86040'], brk: ['防↓', 'DEF↓', '#f88060'],
  taunt: ['挑釁', 'TNT', '#f8c060'], counter: ['架勢', 'CTR', '#f8d070'],
};
export function statusTags(st) { return Object.keys(st || {}).filter((k) => st[k] && STTAG[k]).map((k) => ({ s: L(STTAG[k][0], STTAG[k][1]), col: STTAG[k][2] })); }
// split tags into pages that each fit in maxW pixels
export function tagPages(tags, maxW) {
  const pages = []; let cur = [], w = 0;
  for (const t of tags) { const tw = textW(t.s); if (cur.length && w + tw > maxW) { pages.push(cur); cur = []; w = 0; } cur.push(t); w += tw + 3; }
  if (cur.length) pages.push(cur);
  return pages;
}
// draw the tags in a row; whatever does not fit becomes "+N"
export function drawTags(tags, x, y, maxW, align = 'left') {
  const ws = tags.map((t) => textW(t.s));
  const total = (k) => ws.slice(0, k).reduce((a, b) => a + b + 3, 0) + (k < tags.length ? textW('+' + (tags.length - k)) : -3);
  let n = tags.length;
  while (n > 0 && total(n) > maxW) n--;
  let cx = align === 'right' ? x - total(n) : x;
  for (let i = 0; i < n; i++) { text(tags[i].s, cx, y, tags[i].col); cx += ws[i] + 3; }
  if (n < tags.length) text('+' + (tags.length - n), cx, y, '#c0c8f0');
  return total(n);
}

const stack = [];
export const UI = {
  get active() { return stack.length > 0; },
  update() { const t = stack[stack.length - 1]; if (t) t.update(); },
  draw() { for (const w of stack) w.draw(); },
  clear() { stack.length = 0; },
  _stack: stack,
};
let frame = 0;
export function uiTick() { frame++; }

function push(w) { stack.push(w); return new Promise((res) => { w.done = (v) => { const i = stack.indexOf(w); if (i >= 0) stack.splice(i, 1); res(v); }; }); }

// wrap text to a pixel width; \n forces a break
export function wrap(s, w) {
  const out = [];
  for (const para of String(s).split('\n')) {
    let line = '';
    // latin words stay whole; CJK breaks between any two characters
    for (const ch of para.match(/[A-Za-z0-9'".,!?:;()\-]+ ?|./gu) || []) {
      if (textW(line + ch) > w && line) {
        // keep closing punctuation on the line it closes
        if ('，。、！？」』）…：；'.includes(ch)) { out.push(line + ch); line = ''; continue; }
        out.push(line.trimEnd()); line = ch.trimStart();
      } else line += ch;
    }
    out.push(line);
  }
  return out;
}

// ---------- dialogue ----------
export function say(name, msg, { top = false, wait = true, keep = false } = {}) {
  name = speaker(name);
  const lines = wrap(msg, 226);
  const pages = [];
  for (let i = 0; i < lines.length; i += 3) pages.push(lines.slice(i, i + 3));
  const box = {
    page: 0, shown: 0, waitT: 0,
    y: top ? 6 : H - 66,
    update() {
      const total = pages[this.page].join('').length;
      if (this.shown < total) {
        this.shown += input.held('a') || input.held('b') ? 3 : 1;
        if (frame % 3 === 0) sfx('text');
        if (input.pressed('a')) this.shown = total;
        return;
      }
      if (!wait) { this.done(); return; }
      if (input.pressed('a') || input.pressed('b')) {
        if (this.page < pages.length - 1) { this.page++; this.shown = 0; sfx('cursor'); }
        else { sfx('cursor'); this.done(); }
      }
    },
    draw() {
      windowBox(4, this.y, W - 8, 60);
      if (name) { windowBox(8, this.y - 15, textW(name) + 14, 18); text(name, 15, this.y - 12, '#f8e070'); }
      let left = this.shown;
      pages[this.page].forEach((ln, i) => {
        const part = ln.slice(0, Math.max(0, left));
        left -= ln.length;
        text(part, 14, this.y + 9 + i * 16);
      });
      const total = pages[this.page].join('').length;
      if (this.shown >= total && wait && (frame >> 4) % 2) ctx.drawImage(HAND_D, W - 22, this.y + 46);
    },
  };
  void keep;
  return push(box);
}
// several lines from the same speaker
export async function talk(name, ...msgs) { for (const m of msgs) await say(name, m); }

// shorten a string with "…" so it fits in w pixels
export function fit(s, w) {
  s = String(s);
  if (textW(s) <= w) return s;
  while (s.length > 1 && textW(s + '…') > w) s = s.slice(0, -1);
  return s.trimEnd() + '…';
}

// ---------- list menus ----------
// items: [{ label, right, disabled, color }] or strings
export function menu(items, { x = 150, y = 60, w, cols = 1, cancel = true, title, start = 0, onMove, rowH = 16, maxRows = 9, drawExtra } = {}) {
  items = items.map((it) => (typeof it === 'string' ? { label: it } : it));
  // a window sized to its contents never grows past the screen
  const colW = w ? Math.floor((w - 20) / cols) : Math.min(Math.floor((W - 30) / cols), Math.max(...items.map((it) => textW(it.label) + (it.right ? textW(String(it.right)) + 14 : 0))) + 8);
  w = w || colW * cols + 26;
  const rows = Math.ceil(items.length / cols), vis = Math.min(rows, maxRows);
  const h = vis * rowH + 12 + (title ? 16 : 0);
  if (x + w > W - 2) x = W - 2 - w;
  if (y + h > H - 2) y = H - 2 - h;
  const m = {
    i: Math.min(start, items.length - 1), scroll: 0,
    update() {
      const n = items.length;
      let moved = false;
      if (input.repeat('down')) { this.i = (this.i + cols) % (Math.ceil(n / cols) * cols); if (this.i >= n) this.i = this.i % cols; moved = true; }
      if (input.repeat('up')) { this.i -= cols; if (this.i < 0) { this.i += Math.ceil(n / cols) * cols; while (this.i >= n) this.i -= cols; } moved = true; }
      if (cols > 1 && input.repeat('right')) { this.i = this.i % cols === cols - 1 || this.i + 1 >= n ? this.i - (this.i % cols) : this.i + 1; moved = true; }
      if (cols > 1 && input.repeat('left')) { this.i = this.i % cols === 0 ? Math.min(n - 1, this.i + cols - 1) : this.i - 1; moved = true; }
      if (moved) { sfx('cursor'); if (onMove) onMove(this.i); }
      const r = Math.floor(this.i / cols);
      if (r < this.scroll) this.scroll = r;
      if (r >= this.scroll + vis) this.scroll = r - vis + 1;
      if (input.pressed('a')) {
        if (items[this.i].disabled) { sfx('buzz'); return; }
        sfx('ok'); this.done(this.i);
      } else if (cancel && input.pressed('b')) { sfx('cancel'); this.done(-1); }
    },
    draw() {
      windowBox(x, y, w, h);
      let oy = y + 6;
      if (title) { text(title, x + 10, oy, '#f8e070'); oy += 16; }
      for (let k = this.scroll * cols; k < Math.min(items.length, (this.scroll + vis) * cols); k++) {
        const it = items[k], cx = x + 18 + (k % cols) * colW, cy = oy + (Math.floor(k / cols) - this.scroll) * rowH;
        // a long name is shortened with "…" rather than running into the number on its right
        const rs = it.right !== undefined ? String(it.right) : '';
        text(fit(it.label, colW - 6 - (rs ? textW(rs) + 6 : 0)), cx, cy, it.disabled ? '#8088a8' : it.color || '#f8f8f8');
        if (rs) text(rs, cx + colW - 6, cy, it.disabled ? '#8088a8' : '#f8f8f8', { align: 'right' });
      }
      // the more-above / more-below arrows sit on the window's frame, clear of the numbers in the right column
      if (this.scroll > 0 && (frame >> 3) % 2) text('▲', x + w / 2, y - 5, '#f8e070', { align: 'center' });
      if (this.scroll + vis < rows && (frame >> 3) % 2) text('▼', x + w / 2, y + h - 8, '#f8e070', { align: 'center' });
      const r = Math.floor(this.i / cols) - this.scroll;
      ctx.drawImage(HAND, x + 4 + (this.i % cols) * colW + ((frame >> 3) % 2), oy + r * rowH + 1);
      if (drawExtra) drawExtra(this.i);
    },
  };
  if (onMove) onMove(m.i);
  return push(m);
}
export function choice(options, opts = {}) { return menu(options, { x: W - 90, y: H - 66 - options.length * 16 - 16, cancel: false, ...opts }); }
export async function ask(name, msg, options, opts) {
  name = speaker(name);
  // the question stays on screen while the choice is open
  const lines = wrap(msg, 226).slice(0, 3);
  const box = { update() {}, draw() { windowBox(4, H - 66, W - 8, 60); if (name) { windowBox(8, H - 81, textW(name) + 14, 18); text(name, 15, H - 78, '#f8e070'); } lines.forEach((l, i) => text(l, 14, H - 57 + i * 16)); } };
  stack.push(box);
  const r = await choice(options, opts);
  stack.splice(stack.indexOf(box), 1);
  return r;
}
// a window that just sits there until removed (shop gold, status panels)
export function panel(draw) { const p = { update() {}, draw }; stack.push(p); return () => { const i = stack.indexOf(p); if (i >= 0) stack.splice(i, 1); }; }
// a short centred message
export function notice(msg, frames = 0) {
  const w = Math.min(240, textW(msg) + 24);
  const n = { t: 0, update() { this.t++; if ((frames && this.t > frames) || (!frames && (input.pressed('a') || input.pressed('b')))) { this.done(); } }, draw() { windowBox((W - w) / 2, 90, w, 26); text(msg, W / 2, 97, '#f8f8f8', { align: 'center' }); } };
  return push(n);
}
// wait for A or B
export function pressKey() { const w = { update() { if (input.pressed('a') || input.pressed('b')) { sfx('cancel'); this.done(); } }, draw() {} }; return push(w); }
// wait some frames inside a script
export function wait(frames) { const w = { t: 0, update() { if (++this.t >= frames) this.done(); }, draw() {} }; return push(w); }
