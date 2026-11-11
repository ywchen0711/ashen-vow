// Heroes, spells, items, equipment, monsters and the troops they come in.
// Names are [Chinese, English]; nm() picks the current language.
import { L } from './i18n.js';
export const nm = (o) => (o ? (Array.isArray(o.n) ? L(o.n[0], o.n[1]) : o.n) : '');
export const ds = (o) => (o && o.d ? L(o.d[0], o.d[1]) : '');

// ---------- heroes ----------
// base stat at level 1 and growth per level
export const HEROES = {
  hale: {
    n: ['海爾', 'Hale'], job: ['灰誓騎士', 'Ashen Knight'], sprite: 'hale', row: 'front',
    base: { hp: 62, mp: 0, str: 9, def: 6, mag: 4, mdef: 4, spd: 7 }, grow: { hp: 26, mp: 0, str: 1.6, def: 1.2, mag: 0.7, mdef: 0.8, spd: 0.22 },
    cmds: ['fight', 'ashedge', 'item'], wpn: 'sword', arm: ['heavy', 'light'],
    equip: { weapon: 'ashblade', armor: 'ironarmor', acc: null },
  },
  brin: {
    n: ['布琳', 'Brin'], job: ['槍騎士', 'Lancer'], sprite: 'soldier3', row: 'front',
    base: { hp: 58, mp: 0, str: 10, def: 5, mag: 2, mdef: 3, spd: 8 }, grow: { hp: 24, mp: 0, str: 1.7, def: 1.1, mag: 0.4, mdef: 0.7, spd: 0.28 },
    cmds: ['fight', 'leap', 'item'], wpn: 'lance', arm: ['heavy', 'light'],
    equip: { weapon: 'spear', armor: 'leather', acc: null },
  },
  nyra: {
    n: ['奈菈', 'Nyra'], job: ['喚靈師', 'Caller'], sprite: 'bard7', row: 'back',
    base: { hp: 34, mp: 16, str: 3, def: 3, mag: 9, mdef: 8, spd: 7 }, grow: { hp: 15, mp: 3.6, str: 0.6, def: 0.6, mag: 1.6, mdef: 1.2, spd: 0.24 },
    cmds: ['fight', 'call', 'black', 'item'], wpn: 'rod', arm: ['robe', 'light'],
    equip: { weapon: 'oakrod', armor: 'cotton', acc: null },
  },
  miel: {
    n: ['蜜兒', 'Miel'], job: ['白魔導士', 'White Mage'], sprite: 'devout1', row: 'back',
    base: { hp: 36, mp: 20, str: 4, def: 3, mag: 8, mdef: 9, spd: 6 }, grow: { hp: 16, mp: 4, str: 0.7, def: 0.7, mag: 1.5, mdef: 1.4, spd: 0.24 },
    cmds: ['fight', 'white', 'pray', 'item'], wpn: 'staff', arm: ['robe', 'light'],
    equip: { weapon: 'willow', armor: 'cotton', acc: null },
  },
  gowan: {
    n: ['高文', 'Gowan'], job: ['老賢者', 'Old Sage'], sprite: 'conjurer2', row: 'back',
    base: { hp: 40, mp: 28, str: 4, def: 3, mag: 12, mdef: 10, spd: 5 }, grow: { hp: 13, mp: 4.6, str: 0.5, def: 0.6, mag: 1.7, mdef: 1.3, spd: 0.18 },
    cmds: ['fight', 'black', 'recall', 'item'], wpn: 'rod', arm: ['robe', 'light'],
    equip: { weapon: 'sagestaff', armor: 'magerobe', acc: null },
  },
  tal: {
    n: ['塔爾', 'Tal'], job: ['武僧', 'Monk'], sprite: 'devout4', row: 'front',
    base: { hp: 64, mp: 0, str: 11, def: 5, mag: 3, mdef: 5, spd: 9 }, grow: { hp: 29, mp: 0, str: 1.8, def: 1.1, mag: 0.5, mdef: 0.8, spd: 0.3 },
    cmds: ['fight', 'focus', 'kick', 'item'], wpn: 'claw', arm: ['light'],
    equip: { weapon: 'catclaw', armor: 'traveler', acc: null },
  },
  dorrin: {
    n: ['朵琳', 'Dorrin'], job: ['機巧師', 'Engineer'], sprite: 'scout5', row: 'front',
    base: { hp: 50, mp: 14, str: 8, def: 6, mag: 7, mdef: 6, spd: 8 }, grow: { hp: 22, mp: 3, str: 1.4, def: 1.1, mag: 1.2, mdef: 1.0, spd: 0.28 },
    cmds: ['fight', 'gadget', 'item'], wpn: 'hammer', arm: ['heavy', 'light'],
    equip: { weapon: 'wrench', armor: 'leather', acc: null },
  },
};
// after the trial Hale becomes the Dawn Knight
export const DAWN = { job: ['曙光騎士', 'Dawn Knight'], sprite: 'hale_dawn', cmds: ['fight', 'cover', 'white', 'item'], mpBase: 12, mpGrow: 2.2 };

export const CMD = {
  fight: ['攻擊', 'Fight'], ashedge: ['灰刃', 'Ashedge'], item: ['道具', 'Item'], leap: ['跳躍', 'Leap'], call: ['召喚', 'Call'],
  black: ['黑魔法', 'Black'], white: ['白魔法', 'White'], pray: ['祈禱', 'Pray'], recall: ['回想', 'Recall'], focus: ['蓄力', 'Focus'],
  kick: ['迴旋踢', 'Kick'], gadget: ['機關', 'Gadget'], cover: ['掩護', 'Cover'],
};

// level -> spells
export const LEARN = {
  miel: [[1, 'cure'], [1, 'poisona'], [3, 'protect'], [6, 'mute'], [8, 'slow'], [10, 'cura'], [12, 'ward'], [14, 'esuna'], [16, 'raise'], [19, 'haste'], [22, 'smite'], [26, 'curaga'], [30, 'arise'], [34, 'holy']],
  nyra: [[1, 'fire'], [3, 'ice'], [6, 'bolt'], [9, 'sleep'], [13, 'venom'], [18, 'fira'], [22, 'icera'], [26, 'bolta']],
  gowan: [[1, 'fire'], [1, 'ice'], [1, 'bolt'], [1, 'sleep'], [1, 'venom'], [1, 'fira'], [1, 'icera'], [1, 'bolta'], [1, 'drain'], [16, 'quake'], [22, 'firaga'], [24, 'icega'], [26, 'boltga']],
  hale: [[1, 'cure'], [1, 'smite'], [18, 'protect'], [21, 'cura'], [25, 'esuna'], [29, 'ward']],
};
export const CALLS = { nyra: [[1, 'tortoise'], [10, 'salamander'], [17, 'moth']] }; // tide and elder come from the story
export const GADGETS = [[1, 'blast'], [1, 'patch'], [1, 'smoke'], [20, 'wrench'], [22, 'overclock'], [25, 'thundercell'], [30, 'megablast']];

// ---------- spells and skills ----------
// kind: dmg | heal | revive | status | buff | cure | drain | summon. tgt: foe | ally | self | foes | allies.
// multi: may be spread over everyone (with less power each). cast: charge time in seconds.
const S = (n, o) => ({ n, ...o });
export const SPELLS = {
  cure: S(['治癒', 'Cure'], { mp: 3, kind: 'heal', tgt: 'ally', multi: 1, power: 24, cast: 0.3, fx: 'heal', d: ['回復一名同伴的體力。', 'Restores HP to one friend.'] }),
  cura: S(['大治癒', 'Cura'], { mp: 10, kind: 'heal', tgt: 'ally', multi: 1, power: 80, cast: 0.5, fx: 'heal' }),
  curaga: S(['極治癒', 'Curaga'], { mp: 26, kind: 'heal', tgt: 'ally', multi: 1, power: 230, cast: 0.8, fx: 'heal' }),
  poisona: S(['解毒', 'Poisona'], { mp: 2, kind: 'cure', tgt: 'ally', st: ['poison'], cast: 0.2, fx: 'heal' }),
  esuna: S(['淨化', 'Esuna'], { mp: 12, kind: 'cure', tgt: 'ally', multi: 1, st: ['poison', 'sleep', 'mute', 'blind', 'slow'], cast: 0.4, fx: 'heal' }),
  raise: S(['復活', 'Raise'], { mp: 16, kind: 'revive', tgt: 'ally', power: 0.25, cast: 1.0, fx: 'heal', dead: true }),
  arise: S(['大復活', 'Arise'], { mp: 40, kind: 'revive', tgt: 'ally', power: 1, cast: 1.4, fx: 'heal', dead: true }),
  protect: S(['護壁', 'Protect'], { mp: 6, kind: 'buff', tgt: 'ally', multi: 1, st: 'protect', cast: 0.4, fx: 'buff' }),
  ward: S(['魔障', 'Ward'], { mp: 8, kind: 'buff', tgt: 'ally', multi: 1, st: 'ward', cast: 0.4, fx: 'buff' }),
  haste: S(['加速', 'Haste'], { mp: 14, kind: 'buff', tgt: 'ally', st: 'haste', cast: 0.5, fx: 'buff' }),
  slow: S(['減速', 'Slow'], { mp: 6, kind: 'status', tgt: 'foe', multi: 1, st: 'slow', hit: 0.75, cast: 0.4, fx: 'dark' }),
  mute: S(['沉默', 'Mute'], { mp: 6, kind: 'status', tgt: 'foe', multi: 1, st: 'mute', hit: 0.7, cast: 0.4, fx: 'dark' }),
  smite: S(['聖光彈', 'Smite'], { mp: 8, kind: 'dmg', tgt: 'foe', power: 34, el: 'holy', cast: 0.4, fx: 'holy' }),
  holy: S(['神聖', 'Holy'], { mp: 40, kind: 'dmg', tgt: 'foe', power: 290, el: 'holy', cast: 1.5, fx: 'holy' }),
  fire: S(['火球', 'Fire'], { mp: 5, kind: 'dmg', tgt: 'foe', multi: 1, power: 26, el: 'fire', cast: 0.4, fx: 'fire' }),
  ice: S(['冰錐', 'Ice'], { mp: 5, kind: 'dmg', tgt: 'foe', multi: 1, power: 26, el: 'ice', cast: 0.4, fx: 'ice' }),
  bolt: S(['雷擊', 'Bolt'], { mp: 5, kind: 'dmg', tgt: 'foe', multi: 1, power: 26, el: 'bolt', cast: 0.4, fx: 'bolt' }),
  fira: S(['烈火', 'Fira'], { mp: 15, kind: 'dmg', tgt: 'foe', multi: 1, power: 78, el: 'fire', cast: 0.8, fx: 'fire' }),
  icera: S(['寒冰', 'Icera'], { mp: 15, kind: 'dmg', tgt: 'foe', multi: 1, power: 78, el: 'ice', cast: 0.8, fx: 'ice' }),
  bolta: S(['落雷', 'Bolta'], { mp: 15, kind: 'dmg', tgt: 'foe', multi: 1, power: 78, el: 'bolt', cast: 0.8, fx: 'bolt' }),
  firaga: S(['業火', 'Firaga'], { mp: 32, kind: 'dmg', tgt: 'foe', multi: 1, power: 190, el: 'fire', cast: 1.3, fx: 'fire' }),
  icega: S(['絕凍', 'Icega'], { mp: 32, kind: 'dmg', tgt: 'foe', multi: 1, power: 190, el: 'ice', cast: 1.3, fx: 'ice' }),
  boltga: S(['天雷', 'Boltga'], { mp: 32, kind: 'dmg', tgt: 'foe', multi: 1, power: 190, el: 'bolt', cast: 1.3, fx: 'bolt' }),
  sleep: S(['睡眠', 'Sleep'], { mp: 6, kind: 'status', tgt: 'foe', multi: 1, st: 'sleep', hit: 0.7, cast: 0.5, fx: 'dark' }),
  venom: S(['毒霧', 'Venom'], { mp: 4, kind: 'dmg', tgt: 'foe', power: 18, st: 'poison', hit: 0.9, cast: 0.3, fx: 'poison' }),
  drain: S(['吸取', 'Drain'], { mp: 12, kind: 'drain', tgt: 'foe', power: 70, cast: 0.6, fx: 'dark' }),
  quake: S(['地裂', 'Quake'], { mp: 28, kind: 'dmg', tgt: 'foes', power: 150, el: 'earth', cast: 1.2, fx: 'quake' }),
  starfall: S(['星墜', 'Starfall'], { mp: 0, kind: 'dmg', tgt: 'foes', power: 520, cast: 1.5, fx: 'star' }),
  // summons: Nyra's spirits
  tortoise: S(['石龜', 'Stonebak'], { mp: 9, kind: 'summon', tgt: 'foes', power: 38, el: 'earth', cast: 0.7, art: 'torpion', fx: 'quake', d: ['荊棘村的守護龜，以地震攻擊全體敵人。', "Thornby's guardian tortoise. Shakes the ground under every foe."] }),
  salamander: S(['火蜥', 'Salamander'], { mp: 16, kind: 'summon', tgt: 'foes', power: 72, el: 'fire', cast: 0.9, art: 'leogan', look: { hue: -40, sat: 1.6 }, fx: 'fire', d: ['吐出火焰攻擊全體敵人。', 'Breathes fire over every foe.'] }),
  moth: S(['雷蛾', 'Thundermoth'], { mp: 22, kind: 'summon', tgt: 'foes', power: 104, el: 'bolt', cast: 1.0, art: 'mothram', look: { hue: 30, sat: 1.4 }, fx: 'bolt', d: ['振翅降下雷光攻擊全體敵人。', 'Beats down lightning on every foe.'] }),
  tide: S(['潮龍', 'Tidewyrm'], { mp: 34, kind: 'summon', tgt: 'foes', power: 200, el: 'water', cast: 1.2, art: 'bluedragon', fx: 'water', d: ['文湖的守護龍，以巨浪吞沒全體敵人。', "Wenmere's guardian dragon drowns every foe in a great wave."] }),
  elder: S(['古棘', 'Elder Thorn'], { mp: 30, kind: 'summon', tgt: 'allies', power: 150, heal: true, cast: 1.0, art: 'e_broodroot', fx: 'heal', d: ['古老的樹靈，回復全體同伴並持續再生。', 'The ancient tree heals every friend and keeps healing them.'] }),
  // Dorrin's gadgets
  blast: S(['火藥彈', 'Blast'], { mp: 5, kind: 'dmg', tgt: 'foes', power: 30, el: 'fire', cast: 0, fx: 'boom', gadget: true }),
  patch: S(['修補', 'Patch'], { mp: 4, kind: 'heal', tgt: 'ally', power: 40, cast: 0, fx: 'heal', gadget: true }),
  smoke: S(['煙幕', 'Smoke'], { mp: 4, kind: 'status', tgt: 'foes', st: 'blind', hit: 0.8, cast: 0, fx: 'dark', gadget: true }),
  wrench: S(['重扳手', 'Big Wrench'], { mp: 6, kind: 'phys', tgt: 'foe', power: 2.2, cast: 0, fx: 'hit', gadget: true }),
  overclock: S(['超頻', 'Overclock'], { mp: 10, kind: 'buff', tgt: 'ally', st: 'haste', cast: 0, fx: 'buff', gadget: true }),
  thundercell: S(['雷管', 'Thunder Cell'], { mp: 14, kind: 'dmg', tgt: 'foes', power: 95, el: 'bolt', cast: 0, fx: 'bolt', gadget: true }),
  megablast: S(['巨爆彈', 'Megablast'], { mp: 30, kind: 'dmg', tgt: 'foes', power: 240, el: 'fire', cast: 0, fx: 'boom', gadget: true }),
};
export const BLACK = new Set(['fire', 'ice', 'bolt', 'fira', 'icera', 'bolta', 'firaga', 'icega', 'boltga', 'sleep', 'venom', 'drain', 'quake', 'starfall']);

// ---------- items and equipment ----------
const I = (n, o) => ({ n, ...o });
export const ITEMS = {
  potion: I(['藥水', 'Potion'], { price: 30, use: 'heal', power: 60, tgt: 'ally', d: ['回復 60 體力。', 'Restores 60 HP.'] }),
  hipotion: I(['高級藥水', 'Hi-Potion'], { price: 160, use: 'heal', power: 300, tgt: 'ally', d: ['回復 300 體力。', 'Restores 300 HP.'] }),
  xpotion: I(['特級藥水', 'X-Potion'], { price: 700, use: 'heal', power: 9999, tgt: 'ally', d: ['完全回復體力。', 'Restores all HP.'] }),
  ether: I(['乙太', 'Ether'], { price: 450, use: 'mp', power: 50, tgt: 'ally', d: ['回復 50 魔力。', 'Restores 50 MP.'] }),
  phoenix: I(['鳳凰之羽', 'Phoenix Down'], { price: 300, use: 'revive', power: 0.25, tgt: 'ally', dead: true, d: ['讓倒下的同伴復活。', 'Brings a fallen friend back.'] }),
  antidote: I(['解毒草', 'Antidote'], { price: 20, use: 'cure', st: ['poison'], tgt: 'ally', d: ['治好中毒。', 'Cures poison.'] }),
  eyedrop: I(['眼藥', 'Eye Drops'], { price: 25, use: 'cure', st: ['blind'], tgt: 'ally', d: ['治好黑暗。', 'Cures blindness.'] }),
  remedy: I(['萬能藥', 'Remedy'], { price: 220, use: 'cure', st: ['poison', 'blind', 'mute', 'sleep', 'slow'], tgt: 'ally', d: ['治好所有異常狀態。', 'Cures every ailment.'] }),
  elixir: I(['靈藥', 'Elixir'], { price: 0, use: 'full', tgt: 'ally', d: ['完全回復體力與魔力。', 'Restores all HP and MP.'] }),
  tent: I(['帳篷', 'Tent'], { price: 150, use: 'tent', field: true, d: ['在存檔點使用，全員完全回復。', 'Use at a save point to fully rest the party.'] }),
  bomb: I(['炸彈碎片', 'Bomb Shard'], { price: 120, use: 'dmg', power: 90, el: 'fire', tgt: 'foes', d: ['對全體敵人造成火焰傷害。', 'Fire damage to every foe.'] }),
  frost: I(['寒冰牙', 'Frost Fang'], { price: 120, use: 'dmg', power: 90, el: 'ice', tgt: 'foes', d: ['對全體敵人造成冰冷傷害。', 'Ice damage to every foe.'] }),
  // key items
  sealbox: I(['封印的木盒', 'Sealed Box'], { key: true, d: ['國王命令送到灰岩堡的木盒。', 'A box the King ordered delivered to Grayhold.'] }),
  tidelens: I(['潮之泉鏡', 'Tide Lens'], { key: true, d: ['文湖修道院的聖物。', 'The relic of the Wenmere priory.'] }),
  windlens: I(['風之泉鏡', 'Wind Lens'], { key: true, d: ['朵琳父親留下的泉鏡。', "The lens Dorrin's father left her."] }),
  passmark: I(['通行令', 'Pass Seal'], { key: true, d: ['沙爾特國王的通行令。', "The King of Salt's seal."] }),
};
// equipment: kind (weapon | armor | acc), cls (who can use it), stats
const E = (n, slot, cls, price, st, o = {}) => ({ n, slot, cls, price, ...st, ...o });
export const EQUIP = {
  ashblade: E(['灰燼之劍', 'Ashbrand'], 'weapon', 'sword', 0, { atk: 13 }, { ashen: true, d: ['灰衛隊長的劍，會吸取持有者的生命。', "The Ashguard captain's sword. It drinks its bearer's life."] }),
  ironsword: E(['鐵劍', 'Iron Sword'], 'weapon', 'sword', 260, { atk: 16 }),
  steelsword: E(['鋼劍', 'Steel Sword'], 'weapon', 'sword', 900, { atk: 24 }),
  dawnblade: E(['曙光之劍', 'Dawnblade'], 'weapon', 'sword', 0, { atk: 34, mag: 4 }, { el: 'holy' }),
  mithrilsword: E(['秘銀劍', 'Mithril Sword'], 'weapon', 'sword', 2600, { atk: 40 }),
  flamebrand: E(['炎之劍', 'Flamebrand'], 'weapon', 'sword', 5200, { atk: 48 }, { el: 'fire' }),
  oathkeeper: E(['守誓之劍', 'Oathkeeper'], 'weapon', 'sword', 0, { atk: 64, mag: 8 }, { el: 'holy' }),
  spear: E(['長矛', 'Spear'], 'weapon', 'lance', 120, { atk: 14 }),
  longspear: E(['長槍', 'Long Spear'], 'weapon', 'lance', 700, { atk: 22 }),
  windlance: E(['風之槍', 'Wind Lance'], 'weapon', 'lance', 2400, { atk: 36 }),
  wyrmlance: E(['龍騎之槍', 'Wyrm Lance'], 'weapon', 'lance', 0, { atk: 58 }),
  oakrod: E(['橡木杖', 'Oak Rod'], 'weapon', 'rod', 60, { atk: 4, mag: 2 }),
  firerod: E(['火焰杖', 'Flame Rod'], 'weapon', 'rod', 650, { atk: 8, mag: 5 }, { boost: 'fire' }),
  icerod: E(['冰霜杖', 'Frost Rod'], 'weapon', 'rod', 650, { atk: 8, mag: 5 }, { boost: 'ice' }),
  sagestaff: E(['賢者之杖', 'Sage Staff'], 'weapon', 'rod', 1800, { atk: 12, mag: 10 }),
  starrod: E(['星塵杖', 'Stardust Rod'], 'weapon', 'rod', 0, { atk: 16, mag: 18 }),
  willow: E(['柳木杖', 'Willow Staff'], 'weapon', 'staff', 60, { atk: 4, mag: 2 }),
  healstaff: E(['治癒之杖', 'Healing Staff'], 'weapon', 'staff', 700, { atk: 9, mag: 6 }),
  silverstaff: E(['銀杖', 'Silver Staff'], 'weapon', 'staff', 2200, { atk: 14, mag: 11 }),
  saintstaff: E(['聖者之杖', 'Saint Staff'], 'weapon', 'staff', 0, { atk: 20, mag: 18 }),
  catclaw: E(['貓爪', 'Cat Claw'], 'weapon', 'claw', 300, { atk: 16 }),
  ironclaw: E(['鐵爪', 'Iron Claw'], 'weapon', 'claw', 1000, { atk: 26 }),
  tigerfang: E(['虎牙', 'Tiger Fang'], 'weapon', 'claw', 2800, { atk: 38 }),
  dragonclaw: E(['龍爪', 'Dragon Claw'], 'weapon', 'claw', 0, { atk: 56 }),
  wrench: E(['扳手', 'Wrench'], 'weapon', 'hammer', 200, { atk: 14 }),
  ironhammer: E(['鐵鎚', 'Iron Hammer'], 'weapon', 'hammer', 900, { atk: 24 }),
  steamhammer: E(['蒸汽鎚', 'Steam Hammer'], 'weapon', 'hammer', 2800, { atk: 38 }),
  titanhammer: E(['泰坦之鎚', 'Titan Hammer'], 'weapon', 'hammer', 0, { atk: 56 }),
  // armour
  ironarmor: E(['鐵鎧', 'Iron Armor'], 'armor', 'heavy', 300, { def: 8, mdef: 2 }),
  chainmail: E(['鎖子甲', 'Chain Mail'], 'armor', 'heavy', 700, { def: 14, mdef: 3 }),
  steelplate: E(['鋼板鎧', 'Steel Plate'], 'armor', 'heavy', 1900, { def: 22, mdef: 5 }),
  mithrilplate: E(['秘銀鎧', 'Mithril Plate'], 'armor', 'heavy', 4400, { def: 31, mdef: 9 }),
  dawnplate: E(['曙光之鎧', 'Dawn Plate'], 'armor', 'heavy', 0, { def: 42, mdef: 16 }),
  leather: E(['皮甲', 'Leather'], 'armor', 'light', 80, { def: 4, mdef: 1 }),
  traveler: E(['旅行裝', 'Travel Garb'], 'armor', 'light', 420, { def: 9, mdef: 4 }),
  silkvest: E(['絲背心', 'Silk Vest'], 'armor', 'light', 1500, { def: 15, mdef: 8 }),
  drakehide: E(['龍皮衣', 'Drakehide'], 'armor', 'light', 3900, { def: 23, mdef: 12 }),
  cotton: E(['棉袍', 'Cotton Robe'], 'armor', 'robe', 60, { def: 3, mdef: 3 }),
  magerobe: E(['魔導袍', 'Mage Robe'], 'armor', 'robe', 500, { def: 7, mdef: 9 }),
  sagerobe: E(['賢者袍', 'Sage Robe'], 'armor', 'robe', 1700, { def: 11, mdef: 15, mag: 3 }),
  starweave: E(['星織袍', 'Starweave'], 'armor', 'robe', 0, { def: 18, mdef: 24, mag: 6 }),
  // accessories
  ring: E(['銀戒指', 'Silver Ring'], 'acc', 'any', 350, { def: 3, mdef: 3 }),
  powerband: E(['力量護腕', 'Power Band'], 'acc', 'any', 1500, { str: 5 }),
  runebracelet: E(['符文手環', 'Rune Bracelet'], 'acc', 'any', 1800, { mag: 5, mdef: 5 }),
  swiftboots: E(['疾風之靴', 'Swift Boots'], 'acc', 'any', 2400, { spd: 4 }),
  ribbon: E(['緞帶', 'Ribbon'], 'acc', 'any', 0, { mdef: 6 }, { immune: true, d: ['防止所有異常狀態。', 'Wards off every ailment.'] }),
  emberstone: E(['燼石', 'Ember Stone'], 'acc', 'any', 0, { str: 4, mag: 4 }, { resist: 'fire' }),
};
for (const [k, v] of Object.entries(EQUIP)) { ITEMS[k] = v; v.equip = true; }

// ---------- monster skills ----------
const K = (n, o) => ({ n, ...o });
export const FSK = {
  bite: K(['啃咬', 'Bite'], { kind: 'phys', tgt: 'one', power: 1.3 }),
  poisonbite: K(['毒牙', 'Venom Fang'], { kind: 'phys', tgt: 'one', power: 1, st: 'poison', hit: 0.5 }),
  spore: K(['睡眠粉', 'Sleep Dust'], { kind: 'status', tgt: 'all', st: 'sleep', hit: 0.35, fx: 'dark' }),
  ink: K(['墨汁', 'Ink'], { kind: 'status', tgt: 'one', st: 'blind', hit: 0.6, fx: 'dark' }),
  pinch: K(['大鉗', 'Big Pinch'], { kind: 'phys', tgt: 'one', power: 1.6 }),
  shell: K(['縮殼', 'Shell Up'], { kind: 'buff', tgt: 'self', st: 'protect' }),
  tackle: K(['衝撞', 'Charge'], { kind: 'phys', tgt: 'one', power: 1.5 }),
  ember: K(['火星', 'Embers'], { kind: 'magic', tgt: 'one', power: 30, el: 'fire', fx: 'fire' }),
  flame: K(['火焰吐息', 'Flame Breath'], { kind: 'magic', tgt: 'all', power: 60, el: 'fire', fx: 'fire' }),
  inferno: K(['煉獄', 'Inferno'], { kind: 'magic', tgt: 'all', power: 130, el: 'fire', fx: 'fire' }),
  frost: K(['冰息', 'Frost Breath'], { kind: 'magic', tgt: 'all', power: 55, el: 'ice', fx: 'ice' }),
  icicle: K(['冰柱', 'Icicle'], { kind: 'magic', tgt: 'one', power: 50, el: 'ice', fx: 'ice' }),
  zap: K(['電擊', 'Zap'], { kind: 'magic', tgt: 'one', power: 40, el: 'bolt', fx: 'bolt' }),
  storm: K(['雷暴', 'Thunderstorm'], { kind: 'magic', tgt: 'all', power: 90, el: 'bolt', fx: 'bolt' }),
  wave: K(['巨浪', 'Tidal Wave'], { kind: 'magic', tgt: 'all', power: 85, el: 'water', fx: 'water' }),
  squirt: K(['水砲', 'Water Gun'], { kind: 'magic', tgt: 'one', power: 45, el: 'water', fx: 'water' }),
  rockfall: K(['落石', 'Rockfall'], { kind: 'magic', tgt: 'all', power: 50, el: 'earth', fx: 'quake' }),
  heal: K(['自癒', 'Mend'], { kind: 'heal', tgt: 'self', power: 0.15 }),
  howl: K(['咆哮', 'Howl'], { kind: 'buff', tgt: 'self', st: 'haste' }),
  thornlash: K(['荊鞭', 'Thorn Lash'], { kind: 'phys', tgt: 'all', power: 0.9 }),
  thornbind: K(['荊縛', 'Thorn Bind'], { kind: 'status', tgt: 'one', st: 'slow', hit: 0.7, fx: 'dark' }),
  hush: K(['無聲之歌', 'Hushing Song'], { kind: 'status', tgt: 'all', st: 'mute', hit: 0.4, fx: 'dark' }),
  drainbite: K(['吸血', 'Bloodsuck'], { kind: 'drain', tgt: 'one', power: 40, fx: 'dark' }),
  slash: K(['劈砍', 'Cleave'], { kind: 'phys', tgt: 'one', power: 1.4 }),
  sweep: K(['橫掃', 'Sweep'], { kind: 'phys', tgt: 'all', power: 0.8 }),
  shout: K(['戰吼', 'War Cry'], { kind: 'buff', tgt: 'allfoes', st: 'protect' }),
  dive: K(['俯衝', 'Dive'], { kind: 'phys', tgt: 'one', power: 1.8 }),
  ashfire: K(['灰燼之焰', 'Ashfire'], { kind: 'magic', tgt: 'all', power: 100, el: 'fire', fx: 'fire' }),
  darkfire: K(['黑焰', 'Black Flame'], { kind: 'magic', tgt: 'one', power: 140, el: 'fire', fx: 'fire' }),
  thunder2: K(['天雷', 'Boltga'], { kind: 'magic', tgt: 'all', power: 110, el: 'bolt', fx: 'bolt' }),
  mindbrand: K(['荊之烙印', 'Thornbrand'], { kind: 'status', tgt: 'one', st: 'sleep', hit: 0.8, fx: 'dark' }),
  nova: K(['燼月新星', 'Ember Nova'], { kind: 'magic', tgt: 'all', power: 200, el: 'fire', fx: 'star' }),
  gaze: K(['凝視', 'Gaze'], { kind: 'status', tgt: 'one', st: 'slow', hit: 0.6, fx: 'dark' }),
  quake2: K(['大地震', 'Great Quake'], { kind: 'magic', tgt: 'all', power: 110, el: 'earth', fx: 'quake' }),
  leapfoe: K(['飛躍刺擊', 'Leap'], { kind: 'phys', tgt: 'one', power: 2.2 }),
  growl: K(['低吼', 'Growl'], { kind: 'nothing', tgt: 'self' }),
};

// ---------- monsters ----------
// art: image key; look: recolour; scale: draw scale (people are drawn at 2x)
// weak/resist/absorb: elements; acts: [skill, weight]; boss: special rules in battle.js
const M = (n, art, st, o = {}) => ({ n, art, ...st, ...o });
export const MON = {
  // the plains of Varn
  blueslime: M(['藍泥怪', 'Blue Ooze'], 'smudge', { lv: 1, hp: 22, atk: 7, def: 2, mag: 2, mdef: 2, spd: 5, exp: 8, gold: 5 }, { weak: ['fire'] }),
  hornbug: M(['角羊蟲', 'Hornmite'], 'caterwether', { lv: 2, hp: 30, atk: 9, def: 3, mag: 2, mdef: 2, spd: 6, exp: 11, gold: 7 }, { acts: [['atk', 3], ['tackle', 1]], drop: ['potion', 0.15] }),
  hopfrog: M(['跳跳蛙', 'Hopfrog'], 'froggit', { lv: 2, hp: 26, atk: 8, def: 2, mag: 3, mdef: 3, spd: 9, exp: 10, gold: 6 }, { weak: ['ice'] }),
  // Mossway cave
  rockcrab: M(['岩鉗蟹', 'Rock Crab'], 'crab1', { lv: 4, hp: 48, atk: 12, def: 10, mag: 2, mdef: 3, spd: 5, exp: 20, gold: 14 }, { weak: ['bolt'], acts: [['atk', 3], ['pinch', 1], ['shell', 1]] }),
  venomooze: M(['毒泥怪', 'Venom Ooze'], 'smudge2', { lv: 4, hp: 40, atk: 10, def: 4, mag: 4, mdef: 4, spd: 6, exp: 18, gold: 12 }, { weak: ['fire'], acts: [['atk', 2], ['poisonbite', 2]], drop: ['antidote', 0.25] }),
  cavewyv: M(['洞穴翼龍', 'Cave Wyvern'], 'e_dovase', { lv: 5, hp: 44, atk: 13, def: 5, mag: 3, mdef: 3, spd: 11, exp: 22, gold: 15 }, { acts: [['atk', 3], ['dive', 1]] }),
  shelltort: M(['甲殼龜', 'Shelltort'], 'torpion', { lv: 5, hp: 60, atk: 12, def: 12, mag: 2, mdef: 6, spd: 3, exp: 24, gold: 18 }, { weak: ['bolt'], acts: [['atk', 2], ['shell', 1]] }),
  mossmaw: M(['苔顎巨蜥', 'Mossmaw'], 'drecko', { lv: 7, hp: 900, atk: 20, def: 8, mag: 8, mdef: 6, spd: 7, exp: 260, gold: 300 }, { boss: 'mossmaw', look: { hue: 60, sat: 1.1 }, weak: ['fire'], acts: [['atk', 3], ['bite', 2], ['poisonbite', 1]] }),
  // the eastern hills and Thornwood
  bramble: M(['枯棘樹', 'Bramblewood'], 'e_vexcris', { lv: 6, hp: 70, atk: 15, def: 7, mag: 6, mdef: 5, spd: 4, exp: 30, gold: 20 }, { weak: ['fire'], acts: [['atk', 2], ['thornlash', 1]] }),
  dustmoth: M(['鱗粉蛾', 'Dustmoth'], 'lepidopteram', { lv: 6, hp: 46, atk: 12, def: 4, mag: 8, mdef: 6, spd: 10, exp: 26, gold: 16 }, { weak: ['fire', 'bolt'], acts: [['atk', 2], ['spore', 1]], drop: ['eyedrop', 0.2] }),
  mudtoad: M(['泥蟾', 'Mud Toad'], 'toadit', { lv: 7, hp: 64, atk: 15, def: 6, mag: 5, mdef: 4, spd: 7, exp: 30, gold: 18 }, { weak: ['ice'], acts: [['atk', 3], ['ink', 1]] }),
  woolbeast: M(['羊毛獸', 'Woolbeast'], 'shupa', { lv: 7, hp: 80, atk: 16, def: 6, mag: 3, mdef: 4, spd: 6, exp: 32, gold: 22 }, { weak: ['fire'], acts: [['atk', 3], ['tackle', 2]] }),
  ashguard: M(['灰衛兵', 'Ashguard'], 'person:ashguard', { lv: 7, hp: 150, atk: 17, def: 8, mag: 4, mdef: 5, spd: 8, exp: 40, gold: 30 }, { scale: 2, acts: [['atk', 3], ['slash', 1]], human: true }),
  stonebak: M(['石龜', 'Stonebak'], 'torpion', { lv: 8, hp: 900, atk: 16, def: 14, mag: 8, mdef: 10, spd: 4, exp: 0, gold: 0 }, { boss: 'stonebak', scale: 2, acts: [['atk', 2], ['rockfall', 1], ['shell', 1]] }),
  garrick: M(['加瑞克', 'Garrick'], 'person:soldier6', { lv: 9, hp: 900, atk: 20, def: 10, mag: 6, mdef: 6, spd: 9, exp: 420, gold: 500 }, { boss: 'garrick', scale: 3, human: true, acts: [['atk', 3], ['slash', 2], ['sweep', 1], ['shout', 1]] }),
  // Wenmere and the Sunken Shrine
  lakecrab: M(['冰鉗蟹', 'Frost Crab'], 'crab3', { lv: 10, hp: 110, atk: 21, def: 15, mag: 6, mdef: 8, spd: 6, exp: 46, gold: 30 }, { weak: ['bolt'], resist: ['ice', 'water'], acts: [['atk', 2], ['pinch', 1], ['icicle', 1]] }),
  seadrake: M(['水蛇龍', 'Sea Drake'], 'e_aedalobogg', { lv: 10, hp: 96, atk: 20, def: 8, mag: 12, mdef: 8, spd: 10, exp: 44, gold: 28 }, { weak: ['bolt'], absorb: ['water'], acts: [['atk', 2], ['squirt', 2]] }),
  frostflake: M(['霜晶', 'Frostflake'], 'e_groaselora', { lv: 11, hp: 80, atk: 16, def: 10, mag: 14, mdef: 14, spd: 9, exp: 48, gold: 26 }, { weak: ['fire'], absorb: ['ice'], acts: [['icicle', 2], ['frost', 1]] }),
  bluecrystal: M(['水晶草', 'Crystalweed'], 'e_greatagulaea', { lv: 11, hp: 120, atk: 18, def: 16, mag: 10, mdef: 6, spd: 5, exp: 50, gold: 34 }, { weak: ['earth'], acts: [['atk', 2], ['hush', 1]], drop: ['ether', 0.08] }),
  pondooze: M(['湖泥怪', 'Lake Ooze'], 'smudge', { lv: 10, hp: 90, atk: 18, def: 8, mag: 8, mdef: 8, spd: 6, exp: 40, gold: 24 }, { look: { hue: 60, sat: 1.2 }, weak: ['fire'], acts: [['atk', 2], ['poisonbite', 1]] }),
  tidewyrm: M(['潮龍', 'Tidewyrm'], 'bluedragon', { lv: 13, hp: 4000, atk: 38, def: 12, mag: 24, mdef: 14, spd: 10, exp: 1400, gold: 1500 }, { boss: 'tidewyrm', weak: ['bolt'], absorb: ['water'], acts: [['atk', 3], ['squirt', 2], ['bite', 2]] }),
  // Dry Pass and the desert of Salt
  sandlizard: M(['沙蜥', 'Sand Lizard'], 'specko', { lv: 13, hp: 150, atk: 26, def: 12, mag: 8, mdef: 8, spd: 11, exp: 70, gold: 44 }, { weak: ['ice'], acts: [['atk', 3], ['bite', 1]] }),
  goldcrab: M(['沙金蟹', 'Gold Crab'], 'crab2', { lv: 13, hp: 170, atk: 27, def: 20, mag: 6, mdef: 8, spd: 6, exp: 74, gold: 90 }, { weak: ['bolt'], acts: [['atk', 2], ['pinch', 1], ['shell', 1]] }),
  firesprite: M(['火精', 'Fire Imp'], 'e_amrodd', { lv: 14, hp: 120, atk: 22, def: 10, mag: 18, mdef: 14, spd: 12, exp: 72, gold: 46 }, { weak: ['ice', 'water'], absorb: ['fire'], acts: [['ember', 3], ['flame', 1]] }),
  sandgolem: M(['砂岩人', 'Sandman'], 'e_ioshoggh', { lv: 14, hp: 200, atk: 30, def: 18, mag: 6, mdef: 6, spd: 5, exp: 80, gold: 50 }, { weak: ['water'], resist: ['earth'], acts: [['atk', 3], ['rockfall', 1]] }),
  cinderweed: M(['火晶草', 'Cinderweed'], 'e_erryathys', { lv: 14, hp: 140, atk: 22, def: 12, mag: 16, mdef: 12, spd: 7, exp: 76, gold: 48 }, { weak: ['ice'], acts: [['ember', 2], ['spore', 1]] }),
  hound: M(['荊棘獵犬', 'Thornhound'], 'leogan', { lv: 15, hp: 800, atk: 48, def: 12, mag: 6, mdef: 8, spd: 13, exp: 200, gold: 100 }, { look: { hue: 200, sat: 1.3, lum: 0.7 }, acts: [['atk', 3], ['bite', 2], ['howl', 1]] }),
  brin_boss: M(['布琳', 'Brin'], 'person:soldier3', { lv: 16, hp: 5200, atk: 70, def: 14, mag: 6, mdef: 10, spd: 12, exp: 1800, gold: 0 }, { boss: 'brin', scale: 3, human: true, acts: [['atk', 3], ['leapfoe', 2]] }),
  // the trial
  elderthorn: M(['古棘', 'Elder Thorn'], 'e_broodroot', { lv: 18, hp: 9999, atk: 26, def: 30, mag: 20, mdef: 30, spd: 6, exp: 2400, gold: 0 }, { boss: 'elder', scale: 2, acts: [['thornlash', 1]] }),
  // Kestrel coast and the docks
  steelcrab: M(['鋼殼蟹', 'Steel Crab'], 'crab4', { lv: 17, hp: 260, atk: 34, def: 26, mag: 8, mdef: 10, spd: 7, exp: 110, gold: 80 }, { weak: ['bolt'], acts: [['atk', 2], ['pinch', 2], ['shell', 1]] }),
  reddrake: M(['赤蛇龍', 'Red Drake'], 'e_buomarye', { lv: 17, hp: 220, atk: 32, def: 14, mag: 20, mdef: 12, spd: 12, exp: 108, gold: 70 }, { weak: ['water', 'ice'], absorb: ['fire'], acts: [['atk', 2], ['flame', 1]] }),
  dragonfly: M(['蜻蛙', 'Flytoad'], 'flogg', { lv: 18, hp: 240, atk: 33, def: 14, mag: 12, mdef: 12, spd: 14, exp: 112, gold: 64 }, { weak: ['ice'], acts: [['atk', 3], ['spore', 1]] }),
  bigtoad: M(['大毒蟾', 'Toadlord'], 'toadly', { lv: 18, hp: 300, atk: 35, def: 15, mag: 14, mdef: 12, spd: 8, exp: 120, gold: 76 }, { weak: ['ice'], acts: [['atk', 2], ['poisonbite', 2], ['ink', 1]] }),
  ashguard2: M(['灰衛精兵', 'Ashguard Elite'], 'person:ashguard', { lv: 18, hp: 380, atk: 38, def: 18, mag: 8, mdef: 10, spd: 11, exp: 130, gold: 90 }, { scale: 2, human: true, look: { lum: 0.75 }, acts: [['atk', 3], ['slash', 2]] }),
  irongolem: M(['鐵魔像', 'Iron Golem'], 'golem', { lv: 20, hp: 11000, atk: 100, def: 26, mag: 10, mdef: 14, spd: 7, exp: 4000, gold: 3000 }, { boss: 'golem', look: { hue: 180, sat: 0.4, lum: 1.05 }, weak: ['bolt'], acts: [['atk', 3], ['tackle', 2], ['quake2', 1]] }),
  // the Thorn Spire
  goldwyv: M(['金翼龍', 'Gold Wyvern'], 'e_lesorbellome', { lv: 21, hp: 340, atk: 42, def: 18, mag: 16, mdef: 14, spd: 15, exp: 150, gold: 90 }, { acts: [['atk', 2], ['dive', 2]] }),
  eyestalk: M(['觸眼怪', 'Eyestalk'], 'e_kopodano', { lv: 21, hp: 300, atk: 36, def: 16, mag: 24, mdef: 20, spd: 10, exp: 148, gold: 88 }, { weak: ['holy'], acts: [['gaze', 2], ['zap', 2], ['atk', 1]] }),
  thornwraith: M(['荊之怨靈', 'Thorn Wraith'], 'thewoe', { lv: 22, hp: 280, atk: 38, def: 14, mag: 26, mdef: 24, spd: 12, exp: 156, gold: 80 }, { weak: ['holy', 'fire'], undead: true, acts: [['drainbite', 2], ['hush', 1], ['atk', 1]] }),
  pinkent: M(['血棘樹', 'Bloodbark'], 'e_strippedlagg', { lv: 22, hp: 420, atk: 44, def: 22, mag: 18, mdef: 16, spd: 6, exp: 160, gold: 96 }, { weak: ['fire'], acts: [['atk', 2], ['thornlash', 2], ['thornbind', 1]] }),
  lavarock: M(['熔岩人', 'Magmaman'], 'e_lavaffough', { lv: 23, hp: 460, atk: 46, def: 24, mag: 20, mdef: 14, spd: 6, exp: 170, gold: 110 }, { weak: ['water', 'ice'], absorb: ['fire'], acts: [['atk', 2], ['flame', 1], ['rockfall', 1]] }),
  wasp: M(['毒刺蜂', 'Stingwasp'], 'e_qonyt', { lv: 22, hp: 300, atk: 42, def: 14, mag: 10, mdef: 12, spd: 18, exp: 150, gold: 84 }, { weak: ['ice'], acts: [['atk', 2], ['poisonbite', 2]] }),
  warden: M(['荊之守衛', 'Thorn Warden'], 'dragon', { lv: 25, hp: 11000, atk: 110, def: 26, mag: 40, mdef: 24, spd: 12, exp: 8000, gold: 5000 }, { boss: 'warden', weak: ['fire'], acts: [['atk', 3], ['thornlash', 2], ['frost', 1], ['thornbind', 1]] }),
  // the Starwell
  voidwyv: M(['虛空翼龍', 'Void Wyvern'], 'e_orragask', { lv: 26, hp: 520, atk: 52, def: 22, mag: 24, mdef: 20, spd: 17, exp: 220, gold: 120 }, { acts: [['atk', 2], ['dive', 2], ['storm', 1]] }),
  fogbrain: M(['霧之腦', 'Fogmind'], 'e_fogwind', { lv: 26, hp: 480, atk: 40, def: 20, mag: 34, mdef: 30, spd: 10, exp: 210, gold: 110 }, { weak: ['holy'], acts: [['zap', 2], ['spore', 1], ['hush', 1]] }),
  anemone: M(['燼觸手', 'Emberclutch'], 'e_seratpesac', { lv: 27, hp: 560, atk: 50, def: 22, mag: 28, mdef: 22, spd: 11, exp: 230, gold: 120 }, { weak: ['ice'], acts: [['atk', 2], ['ember', 2], ['gaze', 1]] }),
  starcrystal: M(['星晶花', 'Starbloom'], 'e_zuase', { lv: 27, hp: 600, atk: 46, def: 30, mag: 30, mdef: 18, spd: 8, exp: 236, gold: 130 }, { weak: ['earth'], acts: [['storm', 1], ['hush', 1], ['atk', 2]], drop: ['ether', 0.15] }),
  ashooze: M(['灰燼泥', 'Ash Ooze'], 'smudge4', { lv: 26, hp: 500, atk: 48, def: 20, mag: 20, mdef: 20, spd: 9, exp: 210, gold: 100 }, { weak: ['water'], acts: [['atk', 2], ['poisonbite', 1], ['ember', 1]] }),
  embergolem: M(['燼魔像', 'Ember Golem'], 'golem', { lv: 28, hp: 900, atk: 58, def: 30, mag: 12, mdef: 14, spd: 7, exp: 300, gold: 180 }, { look: { hue: 160, sat: 1.4 }, weak: ['water'], acts: [['atk', 3], ['quake2', 1]] }),
  dusk: M(['暮龍', 'Duskwyrm'], 'bluedragon', { lv: 28, hp: 1200, atk: 60, def: 28, mag: 32, mdef: 24, spd: 12, exp: 420, gold: 260 }, { look: { hue: 100, lum: 0.75 }, acts: [['atk', 2], ['frost', 1], ['storm', 1]] }),
  morvane: M(['莫凡', 'Morvane'], 'person:morvane', { lv: 30, hp: 19000, atk: 90, def: 24, mag: 46, mdef: 34, spd: 13, exp: 0, gold: 0 }, { boss: 'morvane', scale: 3, human: true, acts: [['darkfire', 2], ['thunder2', 2], ['mindbrand', 1], ['icicle', 1]] }),
  ember: M(['燼月之心', 'The Ember Heart'], 'reddragon', { lv: 34, hp: 26000, atk: 100, def: 30, mag: 50, mdef: 30, spd: 14, exp: 0, gold: 0 }, { boss: 'ember', absorb: ['fire'], weak: ['holy', 'water'], acts: [['atk', 2], ['ashfire', 2], ['inferno', 1], ['gaze', 1]] }),
  // a twisted king
  aldous: M(['亞爾多斯王', 'King Aldous'], 'person:king', { lv: 26, hp: 12000, atk: 85, def: 22, mag: 42, mdef: 26, spd: 10, exp: 3000, gold: 0 }, { boss: 'aldous', scale: 3, human: true, look: { hue: 160, lum: 0.8 }, acts: [['atk', 2], ['darkfire', 2], ['thornbind', 1], ['hush', 1]] }),
};

// monsters past the first stretch hit harder, in step with their level
for (const m of Object.values(MON)) if (!m.boss && m.lv >= 8) m.atk = Math.max(m.atk, Math.round(3.2 * m.lv + 8));

// ---------- troops ----------
// a troop is a list of monster ids; random encounters pick one from the zone's table
export const ZONES = {
  plains: [[4, ['blueslime', 'blueslime']], [3, ['hornbug']], [3, ['hopfrog', 'blueslime']], [2, ['hornbug', 'hopfrog']], [1, ['blueslime', 'blueslime', 'blueslime']]],
  mossway: [[3, ['rockcrab', 'venomooze']], [3, ['cavewyv', 'cavewyv']], [2, ['shelltort']], [2, ['venomooze', 'venomooze', 'cavewyv']], [1, ['rockcrab', 'rockcrab']]],
  hills: [[3, ['bramble', 'dustmoth']], [3, ['mudtoad', 'mudtoad']], [2, ['woolbeast', 'dustmoth']], [2, ['hornbug', 'hornbug', 'woolbeast']], [1, ['bramble', 'bramble']]],
  thornwood: [[3, ['bramble', 'dustmoth', 'dustmoth']], [3, ['woolbeast', 'mudtoad']], [2, ['bramble', 'woolbeast']], [2, ['cavewyv', 'cavewyv', 'dustmoth']]],
  lake: [[3, ['seadrake', 'pondooze']], [3, ['lakecrab']], [2, ['pondooze', 'pondooze', 'mudtoad']], [2, ['seadrake', 'seadrake']]],
  shrine: [[3, ['lakecrab', 'frostflake']], [3, ['bluecrystal', 'seadrake']], [2, ['frostflake', 'frostflake']], [2, ['pondooze', 'bluecrystal', 'pondooze']]],
  desert: [[3, ['sandlizard', 'sandlizard']], [3, ['goldcrab']], [3, ['firesprite', 'cinderweed']], [2, ['sandgolem']], [2, ['sandlizard', 'firesprite']]],
  pass: [[3, ['sandgolem', 'cinderweed']], [3, ['firesprite', 'firesprite']], [2, ['goldcrab', 'sandlizard']], [2, ['cavewyv', 'cavewyv', 'cavewyv']]],
  coast: [[3, ['steelcrab']], [3, ['reddrake', 'dragonfly']], [2, ['bigtoad', 'dragonfly']], [2, ['reddrake', 'reddrake']]],
  docks: [[3, ['ashguard2', 'ashguard2']], [2, ['steelcrab', 'ashguard2']], [2, ['bigtoad', 'bigtoad']]],
  spire: [[3, ['goldwyv', 'eyestalk']], [3, ['thornwraith', 'thornwraith']], [2, ['pinkent', 'wasp']], [2, ['lavarock']], [2, ['wasp', 'wasp', 'eyestalk']]],
  well: [[3, ['voidwyv', 'fogbrain']], [3, ['anemone', 'ashooze']], [2, ['starcrystal', 'anemone']], [2, ['embergolem']], [1, ['dusk']], [2, ['fogbrain', 'fogbrain', 'ashooze']]],
  world2: [[3, ['steelcrab']], [3, ['goldwyv', 'reddrake']], [2, ['bigtoad', 'dragonfly']], [2, ['pinkent']]],
};
export const BOSSES = {
  mossmaw: ['mossmaw'], stonebak: ['stonebak'], garrick: ['garrick', 'ashguard'], tidewyrm: ['tidewyrm'], brin: ['hound', 'brin_boss', 'hound'],
  elder: ['elderthorn'], golem: ['irongolem'], warden: ['warden'], aldous: ['aldous'], morvane: ['morvane'], ember: ['ember'],
};

// ---------- experience ----------
export const expFor = (lv) => (lv <= 1 ? 0 : Math.round(9 * Math.pow(lv - 1, 2.35)));
// background per zone
export const BG = { plains: 'plains', mossway: 'cave', hills: 'plains', thornwood: 'forest', lake: 'lake', shrine: 'shrine', desert: 'desert', pass: 'cave', coast: 'plains', docks: 'castle', spire: 'tower', well: 'well', world2: 'plains' };

// shops
export const SHOPS = {
  varn: ['potion', 'antidote', 'eyedrop', 'phoenix', 'tent', 'ironsword', 'spear', 'leather', 'cotton', 'ring'],
  varnarms: ['ironsword', 'spear', 'oakrod', 'willow', 'ironarmor', 'leather', 'cotton', 'ring'],
  wenmere: ['potion', 'hipotion', 'antidote', 'eyedrop', 'phoenix', 'tent', 'steelsword', 'longspear', 'firerod', 'icerod', 'healstaff', 'chainmail', 'traveler', 'magerobe'],
  salt: ['potion', 'hipotion', 'remedy', 'phoenix', 'ether', 'tent', 'bomb', 'frost', 'catclaw', 'ironclaw', 'ironhammer', 'chainmail', 'traveler', 'magerobe', 'powerband'],
  kestrel: ['hipotion', 'remedy', 'phoenix', 'ether', 'tent', 'bomb', 'frost', 'mithrilsword', 'windlance', 'sagestaff', 'silverstaff', 'tigerfang', 'steamhammer', 'steelplate', 'silkvest', 'sagerobe', 'runebracelet'],
  late: ['hipotion', 'xpotion', 'remedy', 'phoenix', 'ether', 'tent', 'flamebrand', 'mithrilplate', 'drakehide', 'swiftboots', 'runebracelet', 'powerband'],
};
