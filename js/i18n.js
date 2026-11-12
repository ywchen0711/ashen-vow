// Language switching. Text is written in place as L('中文', 'English'); data tables get
// getters so .name and .desc follow the current language.

function initial() {
  try { const v = localStorage.getItem('ashen-vow-lang'); if (v === 'zh' || v === 'en') return v; } catch (e) { /* no storage */ }
  try { return /^zh/i.test(navigator.language) ? 'zh' : 'en'; } catch (e) { return 'zh'; }
}
export let LANG = initial();
const hooks = [];
export function onLang(f) { hooks.push(f); }
export function setLang(l) {
  LANG = l;
  try { localStorage.setItem('ashen-vow-lang', l); } catch (e) { /* private mode */ }
  try { document.documentElement.lang = l === 'en' ? 'en' : 'zh-Hant'; } catch (e) { /* node */ }
  for (const f of hooks) f(l);
}
export const isEn = () => LANG === 'en';
export const L = (zh, en) => (LANG === 'en' ? en : zh);

// table: { id: { name, desc, ... } }; en: { id: [name, desc] } or { id: { name, desc } }
export function localize(table, en, fields = ['name', 'desc']) {
  for (const [id, tr] of Object.entries(en)) {
    const o = table[id];
    if (!o) continue;
    const vals = Array.isArray(tr) ? Object.fromEntries(fields.map((f, i) => [f, tr[i]])) : tr;
    for (const [f, v] of Object.entries(vals)) {
      if (v === undefined) continue;
      const zh = o[f];
      Object.defineProperty(o, f, { get: () => (LANG === 'en' ? v : zh), enumerable: true, configurable: true });
    }
  }
}

// speaker names in dialogue
const NAMES = {
  海爾: 'Hale', 布琳: 'Brin', 奈菈: 'Nyra', 蜜兒: 'Miel', 高文: 'Gowan', 塔爾: 'Tal', 朵琳: 'Dorrin', 莫凡: 'Morvane',
  國王: 'The King', 亞爾多斯王: 'King Aldous', 加瑞克: 'Garrick', 士兵: 'Soldier', 灰衛兵: 'Ashguard', 衛兵: 'Guard', 侍女: 'Maid',
  村民: 'Villager', 老人: 'Old Man', 老婦人: 'Old Woman', 小孩: 'Child', 商人: 'Merchant', 旅店老闆: 'Innkeeper', 修女: 'Sister',
  院長: 'Prioress', 漁夫: 'Fisher', 沙爾特王: 'King of Salt', 王子: 'Prince', 學者: 'Scholar', 水手: 'Sailor', 工匠: 'Artisan',
  古棘: 'Elder Thorn', 聲音: 'A Voice', '？？？': '???', 燼月: 'The Ember', 船長: 'Captain', 鐵匠: 'Smith', 守衛長: 'Watch Captain',
  伊爾賽: 'Ilse', 鐘鳴村的母親: "Ilse's Mother", 柯溫: 'Corwin', 鬥技場主: 'Arena Master', 龍騎賽主持: 'Race Host', 蒼白院長: 'The Pale Prioress',
  伊索爾德: 'Ysolde', 奧羅: 'Oro', 賽柏: 'Sable', 無名者: 'The Nameless', 奧瑞爾: 'Aurel', 天棧長老: 'Skyreach Elder', 風暴巨鵬: 'Stormroc',
  女孩: 'Girl', 瑪拉: 'Mara', 農夫: 'Farmer', 隊長: 'Captain', 商隊長: 'Caravan Master', 老記名師: 'Old Namekeeper', 修補匠: 'Tinker',
  空洞的加瑞克: 'Hollow Garrick', 高文的聲音: "Gowan's Voice", 莫凡的殘響: "Morvane's Echo", 未書者: 'The Unwritten', 鐘魂: 'The Bellwraith',
  掘寶人: 'Digger', 織女: 'Weaver', 守望者: 'Watcher', 長老: 'Elder', 寂靜之心: 'The Hush', 媽媽的聲音: "Mother's Voice", 霍伯: 'Hob', 侍衛: 'Guard',
};
export const speaker = (n) => (n && LANG === 'en' ? NAMES[n] || n : n);
