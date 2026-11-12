// People and monsters. People are 16x16, three walking frames in four directions (down, left,
// right, up), from Erbarlow's NES-style characters, ctske's tricolor sheets and devurandom's
// 8-bit set. Monsters are ctske's NES battlers and Emerald's monsters in ImogiaGames' NES colours.
import { canvas } from './gfx.js';

async function img(src) { const i = new Image(); i.src = src; await i.decode(); return i; }
const META = await (await fetch('assets/meta.json')).json();
const CHARS = await img('assets/chars.png');
export const DRAKE = await img('assets/drake32.png');

const cache = new Map();
// sprite(key) -> { d: [f0, f1, f2, f1], l, r, u }
export function sprite(key) {
  if (cache.has(key)) return cache.get(key);
  const at = META.chars[key] || META.chars.mychars0;
  const out = {};
  ['d', 'l', 'r', 'u'].forEach((dir, row) => {
    const fr = [0, 1, 2].map((f) => { const c = canvas(16, 16); c.x.drawImage(CHARS, at[0] + f * 16, at[1] + row * 16, 16, 16, 0, 0, 16, 16); return c; });
    out[dir] = [fr[1], fr[0], fr[1], fr[2]];
  });
  cache.set(key, out);
  return out;
}
export const hasSprite = (k) => !!META.chars[k];

// ---------- monsters ----------
const monImg = new Map();
async function loadMon(k) { if (!monImg.has(k)) monImg.set(k, await img('assets/mon/' + k + '.png')); return monImg.get(k); }
export async function preloadMon(keys) { await Promise.all(keys.map(loadMon)); }
export const monSize = (k) => META.mon[k] || [48, 48];
// strips: Emerald's 48x48 four-pose monsters, and the expansion's [w, h, frames] sheets
export const isStrip = (k) => k.startsWith('e_') || (META.mon[k] && META.mon[k].length === 3);

// recolour by turning the hue (degrees) and scaling saturation/brightness, DQ style
function hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function rgbOf(h, s, l) {
  h = (((h % 360) + 360) % 360) / 360;
  if (s === 0) return [l * 255, l * 255, l * 255];
  const f = (p, q, t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  return [f(p, q, h + 1 / 3) * 255, f(p, q, h) * 255, f(p, q, h - 1 / 3) * 255];
}
export function recolor(src, { hue = 0, sat = 1, lum = 1 } = {}) {
  const c = canvas(src.width, src.height); c.x.drawImage(src, 0, 0);
  if (!hue && sat === 1 && lum === 1) return c;
  const d = c.x.getImageData(0, 0, c.width, c.height), a = d.data;
  for (let i = 0; i < a.length; i += 4) {
    if (!a[i + 3]) continue;
    const [h, s, l] = hsl(a[i], a[i + 1], a[i + 2]);
    if (s < 0.08 && (l < 0.1 || l > 0.9)) continue; // keep black outlines and white glints
    const o = rgbOf(h + hue, Math.min(1, s * sat), Math.min(1, l * lum));
    a[i] = o[0]; a[i + 1] = o[1]; a[i + 2] = o[2];
  }
  c.x.putImageData(d, 0, 0);
  return c;
}
// monArt(key, look) -> array of frames (one for still battlers; idle/attack/hurt/growl for strips)
export function monArt(k, look) {
  const id = k + JSON.stringify(look || {});
  if (cache.has(id)) return cache.get(id);
  const im = monImg.get(k);
  if (!im) return null;
  const frames = [];
  if (isStrip(k)) { const [fw, fh, n] = META.mon[k] && META.mon[k].length === 3 ? META.mon[k] : [48, 48, 4]; for (let f = 0; f < n; f++) { const c = canvas(fw, fh); c.x.drawImage(im, f * fw, 0, fw, fh, 0, 0, fw, fh); frames.push(look ? recolor(c, look) : c); } }
  else { const c = canvas(im.width, im.height); c.x.drawImage(im, 0, 0); frames.push(look ? recolor(c, look) : c); }
  cache.set(id, frames);
  return frames;
}
// a person as a battler: their field sprite, facing right, scaled up
export function personArt(key, scale = 2, look) {
  const id = 'p:' + key + scale + JSON.stringify(look || {});
  if (cache.has(id)) return cache.get(id);
  const s = sprite(key), frames = [s.r[0], s.r[1], s.r[3], s.r[0]].map((f) => { const c = canvas(16 * scale, 16 * scale); c.x.drawImage(look ? recolor(f, look) : f, 0, 0, 16 * scale, 16 * scale); return c; });
  cache.set(id, frames);
  return frames;
}
// white silhouette for hit flashes
export function flash(src, col = '#ffffff') {
  const c = canvas(src.width, src.height); c.x.drawImage(src, 0, 0);
  c.x.globalCompositeOperation = 'source-atop'; c.x.fillStyle = col; c.x.fillRect(0, 0, c.width, c.height);
  return c;
}
