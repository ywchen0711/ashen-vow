// Part II, "The Hush": a new friend, spells, songs, skills, items, gear, passive abilities,
// monsters, troops, shops, forge recipes and the colosseum. data.js merges all of this into its tables.
// Names are [Chinese, English].

// ---------- a new friend ----------
export const HEROES2 = {
  ilse: {
    n: ['伊爾賽', 'Ilse'], job: ['記名師', 'Namekeeper'], sprite: 'bluegirl', row: 'back',
    base: { hp: 40, mp: 22, str: 5, def: 4, mag: 10, mdef: 10, spd: 8 }, grow: { hp: 17, mp: 4, str: 0.8, def: 0.8, mag: 1.5, mdef: 1.4, spd: 0.26 },
    cmds: ['fight', 'sing', 'scan', 'item'], wpn: 'harp', arm: ['robe', 'light'],
    equip: { weapon: 'lyre', armor: 'magerobe', acc: null },
  },
};
export const CMD2 = { sing: ['詠唱', 'Sing'], scan: ['解讀', 'Read'], skill: ['技藝', 'Skill'], vow: ['誓約', 'Vow'] };

// spells learned by level in Part II (merged into LEARN)
export const LEARN2 = {
  miel: [[31, 'renew'], [33, 'lumen'], [38, 'aegis'], [45, 'dawnchoir']],
  nyra: [[30, 'gale'], [33, 'shade'], [34, 'firaga'], [35, 'stop'], [36, 'icega'], [37, 'boltga'], [38, 'tempest'], [40, 'nightfall']],
  hale: [[33, 'renew'], [36, 'lumen']],
  ilse: [],
};
export const SONGS = [[1, 'hearth'], [1, 'ironmarch'], [1, 'lullaby'], [31, 'wardhymn'], [33, 'dirge'], [35, 'quickstep'], [38, 'requiem'], [42, 'namesong']];
export const LEAPS = [[1, 'leap'], [27, 'highjump']]; // wyrmdive comes from Brin's own story
export const ARTS = [[1, 'kick'], [24, 'chakra'], [32, 'counterstance']]; // tigerrush comes from Tal's own story
export const VOWS = ['holyblade', 'shieldwall', 'dawnbreak']; // Hale, after the barracks
export const GADGETS2 = [[31, 'netgun'], [33, 'drone'], [35, 'shockmine'], [37, 'turbine'], [39, 'barrier'], [42, 'etherpump'], [46, 'steamcannon']];

// ---------- spells, songs and skills ----------
const S = (n, o) => ({ n, ...o });
export const SPELLS2 = {
  // white
  renew: S(['再生術', 'Renew'], { mp: 10, kind: 'buff', tgt: 'ally', multi: 1, st: 'regen', cast: 0.4, fx: 'heal', d: ['讓同伴持續回復體力。', 'A friend keeps healing for a while.'] }),
  lumen: S(['光芒', 'Lumen'], { mp: 22, kind: 'dmg', tgt: 'foes', power: 105, el: 'holy', cast: 0.8, fx: 'holy', d: ['神聖之光照向全體敵人。', 'Holy light falls on every foe.'] }),
  aegis: S(['神盾', 'Aegis'], { mp: 26, kind: 'buff2', tgt: 'allies', st: ['protect', 'ward'], cast: 0.8, fx: 'buff', d: ['全體同伴獲得護壁與魔障。', 'Protect and Ward on every friend.'] }),
  sanctuary: S(['聖域', 'Sanctuary'], { mp: 30, kind: 'heal', tgt: 'allies', power: 120, regen: true, cast: 0.9, fx: 'heal', d: ['回復全體同伴並持續再生。伊索爾德院長的祈禱。', "Heals every friend and keeps them healing. Prioress Ysolde's prayer."] }),
  dawnchoir: S(['曙光頌', 'Dawn Choir'], { mp: 60, kind: 'revive', tgt: 'allies', power: 0.5, all: true, cast: 1.6, fx: 'heal', dead: true, d: ['讓所有倒下的同伴復活。', 'Brings every fallen friend back.'] }),
  // black: wind and shadow
  gale: S(['風刃', 'Galeslash'], { mp: 16, kind: 'dmg', tgt: 'foe', multi: 1, power: 84, el: 'wind', cast: 0.7, fx: 'wind' }),
  tempest: S(['暴風', 'Tempest'], { mp: 34, kind: 'dmg', tgt: 'foe', multi: 1, power: 200, el: 'wind', cast: 1.3, fx: 'wind' }),
  shade: S(['暗影', 'Shade'], { mp: 18, kind: 'dmg', tgt: 'foe', power: 120, el: 'dark', cast: 0.7, fx: 'dark' }),
  nightfall: S(['夜幕', 'Nightfall'], { mp: 40, kind: 'dmg', tgt: 'foes', power: 175, el: 'dark', cast: 1.4, fx: 'dark' }),
  gowanstar: S(['星墜', 'Starfall'], { mp: 80, kind: 'dmg', tgt: 'foes', power: 420, cast: 1.6, fx: 'star', d: ['高文留下的星之魔法。', 'The star-spell Gowan left behind.'] }),
  stop: S(['停滯', 'Still'], { mp: 14, kind: 'status', tgt: 'foe', st: 'stop', hit: 0.6, cast: 0.6, fx: 'dark', d: ['讓敵人的時間暫時停下。', "Freezes a foe's time for a moment."] }),
  // songs (Ilse)
  hearth: S(['爐火之歌', 'Hearthsong'], { mp: 8, kind: 'buff', tgt: 'allies', st: 'regen', cast: 0.6, fx: 'song', song: true, d: ['溫暖的歌，全體同伴持續回復。', 'A warm song: every friend keeps healing.'] }),
  ironmarch: S(['鐵之行進曲', 'Iron March'], { mp: 12, kind: 'buff', tgt: 'allies', st: 'protect', cast: 0.6, fx: 'song', song: true, d: ['全體同伴獲得護壁。', 'Protect on every friend.'] }),
  lullaby: S(['搖籃曲', 'Lullaby'], { mp: 10, kind: 'status', tgt: 'foes', st: 'sleep', hit: 0.55, cast: 0.6, fx: 'song', song: true, d: ['讓敵人沉睡。', 'Sends the foes to sleep.'] }),
  wardhymn: S(['守護讚歌', 'Ward Hymn'], { mp: 14, kind: 'buff', tgt: 'allies', st: 'ward', cast: 0.6, fx: 'song', song: true, d: ['全體同伴獲得魔障。', 'Ward on every friend.'] }),
  dirge: S(['輓歌', 'Dirge'], { mp: 16, kind: 'status', tgt: 'foes', st: 'slow', hit: 0.7, cast: 0.6, fx: 'song', song: true, d: ['讓全體敵人減速。', 'Slows every foe.'] }),
  quickstep: S(['疾步之歌', 'Quickstep'], { mp: 28, kind: 'buff', tgt: 'allies', st: 'haste', cast: 0.8, fx: 'song', song: true, d: ['全體同伴加速。', 'Haste on every friend.'] }),
  requiem: S(['安魂曲', 'Requiem'], { mp: 30, kind: 'dmg', tgt: 'foes', power: 150, el: 'holy', cast: 1.0, fx: 'song', song: true, d: ['送別亡魂的歌，對全體敵人造成神聖傷害。', 'A song for the dead. Holy damage to every foe.'] }),
  namesong: S(['名之歌', 'Song of Names'], { mp: 50, kind: 'revive', tgt: 'allies', power: 0.3, all: true, cure: true, cast: 1.2, fx: 'song', song: true, dead: true, d: ['呼喚每一個名字：倒下的同伴復活，異常全部解除。', 'Calls every name: the fallen rise and all ailments lift.'] }),
  // Brin's leaps
  leap: S(['跳躍', 'Leap'], { mp: 0, kind: 'leap', tgt: 'foe', mult: 2, air: 80, d: ['跳到空中，落下時刺擊。', 'Leap out of reach and land on a foe.'] }),
  highjump: S(['高跳', 'High Jump'], { mp: 0, kind: 'leap', tgt: 'foe', mult: 3, air: 130, d: ['跳得更高更久，落下時威力三倍。', 'A higher, longer leap that lands three times as hard.'] }),
  wyrmdive: S(['龍落', 'Wyrm Dive'], { mp: 0, kind: 'leap', tgt: 'foes', mult: 1.35, air: 100, d: ['化作流星落下，刺穿全體敵人。', 'Falls like a star on every foe.'] }),
  // Tal's arts
  kick: S(['迴旋踢', 'Kick'], { mp: 0, kind: 'art', tgt: 'foes', d: ['踢擊全體敵人。', 'Kicks every foe.'] }),
  chakra: S(['氣功', 'Chakra'], { mp: 0, kind: 'art', tgt: 'self', cast: 0.4, d: ['調息回復自己三成體力，並治好中毒與黑暗。', 'Breathes deep: heals a third of his HP and clears poison and blindness.'] }),
  tigerrush: S(['猛虎連擊', 'Tiger Rush'], { mp: 0, kind: 'art', tgt: 'foes', d: ['四連擊，隨機打向敵人。', 'Four blows at random foes.'] }),
  counterstance: S(['架勢', 'Stance'], { mp: 0, kind: 'art', tgt: 'self', d: ['擺好架勢，下次被打時必定反擊。', 'Takes a stance: the next blow against him is always answered.'] }),
  // Hale's vows
  holyblade: S(['聖光斬', 'Holy Blade'], { mp: 12, kind: 'phys', tgt: 'foe', power: 1.8, el: 'holy', cast: 0, fx: 'holy', vow: true, d: ['以光之劍斬擊。', 'A cut of pure light.'] }),
  shieldwall: S(['盾牆', 'Shield Wall'], { mp: 16, kind: 'buff', tgt: 'allies', st: 'protect', cast: 0, fx: 'buff', vow: true, d: ['為全體同伴張起護壁。', 'Raises Protect on every friend.'] }),
  dawnbreak: S(['破曉', 'Dawnbreak'], { mp: 0, kind: 'phys', tgt: 'foes', power: 1.6, el: 'holy', hpcost: 0.15, cast: 0, fx: 'holy', vow: true, d: ['以生命為代價的曙光一擊，打向全體敵人。', 'Spends his own life on a blow of dawn against every foe.'] }),
  // skills that equipment teaches
  powerbreak: S(['破甲擊', 'Armor Break'], { mp: 6, kind: 'phys', tgt: 'foe', power: 1.1, st: 'brk', hit: 0.9, cast: 0, fx: 'hit', skill: true, d: ['擊碎敵人的防禦。', "Smashes a foe's defence."] }),
  drainblade: S(['噬命斬', 'Life Cut'], { mp: 8, kind: 'phys', tgt: 'foe', power: 1.3, drain: 0.4, cast: 0, fx: 'dark', skill: true, d: ['斬擊並吸取體力。', 'A cut that drinks some of the damage back as HP.'] }),
  shockwave: S(['衝擊波', 'Shockwave'], { mp: 10, kind: 'phys', tgt: 'foes', power: 0.9, cast: 0, fx: 'quake', skill: true, d: ['震地的一擊，打向全體敵人。', 'A ground-shaking blow at every foe.'] }),
  bladestorm: S(['劍風', 'Bladestorm'], { mp: 14, kind: 'phys', tgt: 'foes', power: 0.6, hits: 4, cast: 0, fx: 'wind', skill: true, d: ['四道劍風隨機打向敵人。', 'Four wind-blades at random foes.'] }),
  provoke: S(['挑釁', 'Provoke'], { mp: 4, kind: 'buff', tgt: 'self', st: 'taunt', cast: 0, fx: 'buff', skill: true, d: ['吸引敵人的攻擊。', 'Draws the foes\' blows to yourself.'] }),
  mend: S(['包紮', 'Bandage'], { mp: 6, kind: 'heal', tgt: 'ally', power: 70, cast: 0, fx: 'heal', skill: true, d: ['替同伴包紮傷口。', "Binds a friend's wounds."] }),
  // summons (Nyra)
  galeroc: S(['風鵬', 'Galeroc'], { mp: 40, kind: 'summon', tgt: 'foes', power: 235, el: 'wind', cast: 1.2, art: 'e_novaram', look: { hue: 60, sat: 1.2 }, fx: 'wind', d: ['雲海之主，以暴風吹襲全體敵人。', 'Lord of the Cloud Sea. Hurls a gale at every foe.'] }),
  ashphoenix: S(['灰鳳', 'Ashphoenix'], { mp: 48, kind: 'summon', tgt: 'foes', power: 170, el: 'fire', revive: 0.3, cast: 1.3, art: 'e_baacklaal', look: { hue: 20, lum: 1.15 }, fx: 'fire', d: ['從荊棘村的灰燼中重生的火鳥。焚燒敵人，並讓倒下的同伴復活。', "The firebird reborn from Thornby's ashes. Burns every foe and raises fallen friends."] }),
  lumenwisp: S(['光精', 'Lumenwisp'], { mp: 36, kind: 'summon', tgt: 'foes', power: 215, el: 'holy', cast: 1.1, art: 'i_ghostgold', fx: 'holy', d: ['鐘鳴村的守燈精，以聖光照射全體敵人。', "Belltoll's lamp spirit. Holy light on every foe."] }),
  deepcoil: S(['淵蛇', 'Deepcoil'], { mp: 60, kind: 'summon', tgt: 'foes', power: 380, el: 'water', cast: 1.5, art: 'e_onodemato', look: { hue: -30, lum: 0.8 }, fx: 'water', d: ['深淵的大蛇，掀起漩渦吞噬全體敵人。', 'The serpent of the deep drags every foe into its whirlpool.'] }),
  mycel: S(['菌母', 'Mother Mycel'], { mp: 32, kind: 'summon', tgt: 'foes', power: 120, el: 'earth', st: 'poison', st2: 'sleep', hit: 0.6, cast: 1.0, art: 'e_poblade', fx: 'poison', d: ['根底的菌母，撒下毒與睡眠的孢子。', 'The Mycel Mother of the Rootdeep scatters spores of poison and sleep.'] }),
  // Dorrin's new gadgets
  netgun: S(['捕網槍', 'Net Gun'], { mp: 10, kind: 'status', tgt: 'foe', st: 'stop', hit: 0.7, cast: 0, fx: 'dark', gadget: true, d: ['用網子罩住敵人，讓它動彈不得。', 'Nets a foe so it cannot move.'] }),
  drone: S(['修理機', 'Repair Drone'], { mp: 16, kind: 'heal', tgt: 'allies', power: 130, cast: 0, fx: 'heal', gadget: true, d: ['小小的機器飛過，修補全體同伴。', 'A little machine flies round patching every friend.'] }),
  shockmine: S(['電擊地雷', 'Shock Mine'], { mp: 20, kind: 'dmg', tgt: 'foes', power: 140, el: 'bolt', st: 'stop', hit: 0.25, cast: 0, fx: 'bolt', gadget: true }),
  turbine: S(['風力渦輪', 'Turbine'], { mp: 22, kind: 'dmg', tgt: 'foes', power: 165, el: 'wind', cast: 0, fx: 'wind', gadget: true }),
  barrier: S(['防護力場', 'Barrier Field'], { mp: 30, kind: 'buff2', tgt: 'allies', st: ['protect', 'ward'], cast: 0, fx: 'buff', gadget: true }),
  etherpump: S(['乙太泵', 'Ether Pump'], { mp: 4, kind: 'mpgive', tgt: 'ally', power: 60, cast: 0, fx: 'heal', gadget: true, d: ['把乙太灌給同伴，回復 60 魔力。', 'Pumps ether into a friend: 60 MP.'] }),
  steamcannon: S(['蒸汽砲', 'Steam Cannon'], { mp: 34, kind: 'dmg', tgt: 'foe', power: 520, el: 'fire', cast: 0, fx: 'boom', gadget: true }),
  starburst: S(['星爆彈', 'Starburst'], { mp: 60, kind: 'dmg', tgt: 'foes', power: 480, el: 'holy', cast: 0, fx: 'star', gadget: true, d: ['柯溫的最後設計。', "Corwin's last design."] }),
};
export const BLACK2 = ['gale', 'tempest', 'shade', 'nightfall', 'stop', 'gowanstar'];

// ---------- passive abilities ----------
export const PASSIVES = {
  counter: { n: ['反擊', 'Counter'], d: ['受到物理攻擊時有時會反擊。', 'Sometimes strikes back when hit.'] },
  autoregen: { n: ['自動再生', 'Auto-Regen'], d: ['戰鬥開始時獲得再生。', 'Starts every battle with Regen.'] },
  autohaste: { n: ['自動加速', 'Auto-Haste'], d: ['戰鬥開始時獲得加速。', 'Starts every battle with Haste.'] },
  autoprotect: { n: ['自動護壁', 'Auto-Protect'], d: ['戰鬥開始時獲得護壁。', 'Starts every battle with Protect.'] },
  autoward: { n: ['自動魔障', 'Auto-Ward'], d: ['戰鬥開始時獲得魔障。', 'Starts every battle with Ward.'] },
  hpplus: { n: ['體力 +20%', 'HP +20%'], d: ['最大體力增加兩成。', 'Max HP is 20% higher.'] },
  mpplus: { n: ['魔力 +20%', 'MP +20%'], d: ['最大魔力增加兩成。', 'Max MP is 20% higher.'] },
  expup: { n: ['經驗 +50%', 'EXP +50%'], d: ['獲得的經驗值增加五成。', 'Gains half again as much EXP.'] },
  goldup: { n: ['金幣 +50%', 'Gold +50%'], d: ['戰鬥得到的金幣增加五成。', 'Battles pay half again as much gold.'] },
  apup: { n: ['學習 ×2', 'AP x2'], d: ['從裝備學習的速度加倍。', 'Learns from gear twice as fast.'] },
  firststrike: { n: ['先制', 'First Strike'], d: ['更容易搶先行動。', 'More often gets the jump on foes.'] },
  mphalf: { n: ['魔力減半', 'Half MP'], d: ['施法消耗的魔力減半。', 'Spells cost half as much MP.'] },
  critup: { n: ['會心', 'Keen Eye'], d: ['更容易打出會心一擊。', 'Lands critical hits more often.'] },
  autolife: { n: ['不死鳥', 'Rebirth'], d: ['每場戰鬥一次，倒下時自動復活。', 'Once a battle, rises again when felled.'] },
  quiet: { n: ['靜步', 'Quiet Step'], d: ['遇到敵人的次數減半。', 'Half as many random battles.'] },
  breaker: { n: ['破限', 'Limit Break'], d: ['傷害上限提升到 99999。', 'Damage can go past 9999.'] },
};

// ---------- items ----------
const I = (n, o) => ({ n, ...o });
export const ITEMS2 = {
  healmist: I(['治癒之霧', 'Healing Mist'], { price: 900, use: 'heal', power: 400, tgt: 'allies', d: ['全體同伴回復 400 體力。', 'Restores 400 HP to every friend.'] }),
  etherdew: I(['乙太露', 'Ether Dew'], { price: 1500, use: 'mp', power: 150, tgt: 'ally', d: ['回復 150 魔力。', 'Restores 150 MP.'] }),
  grandelixir: I(['大靈藥', 'Grand Elixir'], { price: 0, use: 'full', tgt: 'allies', d: ['全體同伴完全回復。', 'Fully restores every friend.'] }),
  phoenixplume: I(['鳳凰尾羽', 'Phoenix Plume'], { price: 0, use: 'revive', power: 0.5, tgt: 'allies', dead: true, d: ['讓所有倒下的同伴復活。', 'Brings every fallen friend back.'] }),
  wakebell: I(['醒鈴', 'Waking Bell'], { price: 30, use: 'cure', st: ['sleep', 'stop'], tgt: 'ally', d: ['叮的一聲，叫醒沉睡與停滯的同伴。', 'Ding! Wakes a sleeping or stilled friend.'] }),
  lozenge: I(['潤喉糖', 'Throat Drop'], { price: 40, use: 'cure', st: ['mute'], tgt: 'ally', d: ['治好沉默。', 'Cures silence.'] }),
  quickdraught: I(['疾風藥', 'Swift Draught'], { price: 300, use: 'buff', st: 'haste', tgt: 'ally', d: ['讓同伴加速。', 'Hastes a friend.'] }),
  irontonic: I(['鐵壁藥', 'Iron Tonic'], { price: 250, use: 'buff', st: 'protect', tgt: 'ally', d: ['讓同伴獲得護壁。', 'Gives a friend Protect.'] }),
  wardtonic: I(['魔障藥', 'Ward Tonic'], { price: 250, use: 'buff', st: 'ward', tgt: 'ally', d: ['讓同伴獲得魔障。', 'Gives a friend Ward.'] }),
  thunderjar: I(['雷電瓶', 'Thunder Jar'], { price: 150, use: 'dmg', power: 110, el: 'bolt', tgt: 'foes', d: ['對全體敵人造成雷電傷害。', 'Lightning damage to every foe.'] }),
  galefan: I(['疾風扇', 'Gale Fan'], { price: 420, use: 'dmg', power: 220, el: 'wind', tgt: 'foes', d: ['對全體敵人造成風傷害。', 'Wind damage to every foe.'] }),
  holywater: I(['聖水', 'Holy Water'], { price: 300, use: 'dmg', power: 500, el: 'holy', tgt: 'foe', d: ['對一名敵人造成神聖傷害，亡靈特別怕它。', 'Holy damage to one foe. The dead hate it.'] }),
  starshard: I(['星之碎片', 'Star Shard'], { price: 0, use: 'dmg', power: 900, tgt: 'foes', d: ['墜落之星的碎片，對全體敵人造成巨大傷害。', 'A piece of the fallen star. Huge damage to every foe.'] }),
  smokebomb: I(['煙霧彈', 'Smoke Bomb'], { price: 200, use: 'escape', tgt: 'self', d: ['一定能從普通戰鬥中逃走。', 'Always escapes an ordinary battle.'] }),
  // forge materials, dropped by monsters
  m_hide: I(['堅韌獸皮', 'Tough Hide'], { price: 60, mat: true, d: ['鍛造用的素材。', 'A forging material.'] }),
  m_ore: I(['暗鐵礦', 'Dark Ore'], { price: 90, mat: true, d: ['鍛造用的素材。', 'A forging material.'] }),
  m_fang: I(['利牙', 'Keen Fang'], { price: 70, mat: true, d: ['鍛造用的素材。', 'A forging material.'] }),
  m_feather: I(['風羽', 'Wind Plume'], { price: 80, mat: true, d: ['鍛造用的素材。', 'A forging material.'] }),
  m_scale: I(['龍鱗', 'Drake Scale'], { price: 140, mat: true, d: ['鍛造用的素材。', 'A forging material.'] }),
  m_crystal: I(['湖晶', 'Lake Crystal'], { price: 120, mat: true, d: ['鍛造用的素材。', 'A forging material.'] }),
  m_ember: I(['燼核', 'Ember Core'], { price: 150, mat: true, d: ['鍛造用的素材。', 'A forging material.'] }),
  m_frost: I(['霜核', 'Frost Core'], { price: 150, mat: true, d: ['鍛造用的素材。', 'A forging material.'] }),
  m_storm: I(['雷鳥羽', 'Storm Quill'], { price: 160, mat: true, d: ['鍛造用的素材。', 'A forging material.'] }),
  m_root: I(['古根', 'Old Root'], { price: 110, mat: true, d: ['鍛造用的素材。', 'A forging material.'] }),
  m_gear: I(['精密齒輪', 'Fine Gear'], { price: 130, mat: true, d: ['鍛造用的素材。', 'A forging material.'] }),
  m_silk: I(['月絲', 'Moonsilk'], { price: 120, mat: true, d: ['鍛造用的素材。', 'A forging material.'] }),
  m_pale: I(['蒼白碎片', 'Pale Shard'], { price: 200, mat: true, d: ['被遺忘之物的碎片。鍛造用的素材。', 'A piece of something forgotten. A forging material.'] }),
  m_star: I(['星塵', 'Stardust'], { price: 400, mat: true, d: ['稀有的鍛造素材。', 'A rare forging material.'] }),
  // key items
  rootlens: I(['根之泉鏡', 'Root Lens'], { key: true, d: ['荊棘村古棘守護的泉鏡。', 'The lens the Elder Thorn kept for Thornby.'] }),
  emberlens: I(['燼之泉鏡', 'Ember Lens'], { key: true, d: ['沙爾特王國的泉鏡。', 'The lens of the Kingdom of Salt.'] }),
  namebell: I(['名之鈴', 'Name Bell'], { key: true, d: ['伊爾賽的小鈴鐺。搖響時，會想起被忘記的名字。', "Ilse's little bell. When it rings, forgotten names come back."] }),
  spade: I(['尋寶鏟', 'Treasure Spade'], { key: true, d: ['在大地圖上對著腳下按 Z 就能挖掘。', 'Press Z on the world map to dig where you stand.'] }),
  tmap1: I(['藏寶圖（一）', 'Treasure Map I'], { key: true, map: 1, d: ['使用後可以看到藏寶地點。', 'Use it to see where the treasure lies.'] }),
  tmap2: I(['藏寶圖（二）', 'Treasure Map II'], { key: true, map: 2, d: ['使用後可以看到藏寶地點。', 'Use it to see where the treasure lies.'] }),
  tmap3: I(['藏寶圖（三）', 'Treasure Map III'], { key: true, map: 3, d: ['使用後可以看到藏寶地點。', 'Use it to see where the treasure lies.'] }),
  tmap4: I(['藏寶圖（四）', 'Treasure Map IV'], { key: true, map: 4, d: ['使用後可以看到藏寶地點。', 'Use it to see where the treasure lies.'] }),
  tmap5: I(['藏寶圖（五）', 'Treasure Map V'], { key: true, map: 5, d: ['一張畫著金色螃蟹的藏寶圖。', 'A treasure map with a golden crab drawn on it.'] }),
  whistle: I(['馴龍笛', 'Drake Whistle'], { key: true, d: ['蘆洲的龍騎賽通行證。', 'Your pass to the Reedholm drake races.'] }),
  page1: I(['高文的筆記（一）', "Gowan's Notes I"], { key: true, d: ['「我曾有過一個學生，在莫凡之前。可我想不起他的臉。」', '"I had a student once, before Morvane. I cannot remember his face."'] }),
  page2: I(['高文的筆記（二）', "Gowan's Notes II"], { key: true, d: ['「名字是一根線。剪斷了，人就會從所有人的記憶裡滑落。」', '"A name is a thread. Cut it, and a person slips out of everyone\'s memory."'] }),
  page3: I(['高文的筆記（三）', "Gowan's Notes III"], { key: true, d: ['「那孩子想讓死去的人不再被哀悼。他錯了，可他不壞。」', '"The boy wanted the dead to stop being mourned. He was wrong, but he was not wicked."'] }),
  page4: I(['高文的筆記（四）', "Gowan's Notes IV"], { key: true, d: ['「如果有人讀到這裡：替我記住他。他叫奧瑞爾。」', '"If anyone reads this: remember him for me. His name was Aurel."'] }),
  skycore: I(['天空核心', 'Sky Core'], { key: true, d: ['柯溫留下的引擎核心。讓鷦鷯號飛上雲海。', 'The engine core Corwin left. It lifts the Wren to the Cloud Sea.'] }),
  windname: I(['風之真名', "The Wind's Name"], { key: true, d: ['天棧的長老教你的古老名字。唸出它，濃霧就會散開。', 'An old name the Skyreach elder taught you. Speak it, and the grey mist parts.'] }),
  arenapass: I(['鬥技場證', 'Arena Pass'], { key: true, d: ['沙爾特鬥技場的參賽證。', 'An entry pass for the Salt Colosseum.'] }),
  weddingring: I(['婚戒', 'Wedding Ring'], { key: true, d: ['刻著「給瑪拉」的戒指。', 'A ring engraved "For Mara".'] }),
  lakepearl: I(['湖之珍珠', 'Lake Pearl'], { key: true, d: ['淹沒迴廊裡找到的珍珠。', 'A pearl from the Drowned Cloister.'] }),
  kite: I(['紅風箏', 'Red Kite'], { key: true, d: ['天棧的小孩弄丟的風箏。', 'A kite a Skyreach child lost.'] }),
  palekey: I(['蒼白之鑰', 'Pale Key'], { key: true, d: ['打開蒼白高塔的頂層。', 'Opens the top of the Pale Spire.'] }),
  sunsigil: I(['陽之印', 'Sun Sigil'], { key: true, d: ['陽炎神殿的通行印記。', 'The seal that opens the Sunfire Temple.'] }),
  barrackskey: I(['兵營鑰匙', 'Barracks Key'], { key: true, d: ['瓦恩城舊兵營的鑰匙。', "The key to Castle Varn's old barracks."] }),
};

// ---------- equipment ----------
// teach: an ability learned by winning battles with it equipped (ap needed); pass: passive while worn
const E = (n, slot, cls, price, st, o = {}) => ({ n, slot, cls, price, ...st, ...o });
export const EQUIP2 = {
  // swords
  runeblade: E(['符文劍', 'Runeblade'], 'weapon', 'sword', 7800, { atk: 58, mag: 4 }, { teach: 'powerbreak', ap: 40 }),
  sunsteel: E(['陽鋼劍', 'Sunsteel'], 'weapon', 'sword', 0, { atk: 66 }, { el: 'fire', teach: 'shockwave', ap: 60 }),
  vowblade: E(['誓約之劍', 'Vowblade'], 'weapon', 'sword', 0, { atk: 78, mag: 8 }, { el: 'holy', teach: 'drainblade', ap: 60 }),
  daybreaker: E(['破曉之劍', 'Daybreaker'], 'weapon', 'sword', 0, { atk: 110, mag: 14 }, { el: 'holy', pass: ['breaker'], d: ['燼井深淵中沉睡的劍。傷害沒有上限。', 'A sword asleep in the Starwell Abyss. Its damage knows no limit.'] }),
  // lances
  silverlance: E(['銀槍', 'Silver Lance'], 'weapon', 'lance', 7200, { atk: 56 }, { teach: 'shockwave', ap: 50 }),
  thunderpike: E(['雷霆戟', 'Thunder Pike'], 'weapon', 'lance', 0, { atk: 70 }, { el: 'bolt', teach: 'bladestorm', ap: 70 }),
  skypiercer: E(['穿天槍', 'Skypiercer'], 'weapon', 'lance', 0, { atk: 104 }, { pass: ['breaker'], d: ['傷害沒有上限。', 'Its damage knows no limit.'] }),
  // rods
  galerod: E(['疾風杖', 'Gale Rod'], 'weapon', 'rod', 6400, { atk: 14, mag: 14 }, { boost: 'wind' }),
  nightrod: E(['夜之杖', 'Night Rod'], 'weapon', 'rod', 0, { atk: 16, mag: 17 }, { boost: 'dark', teach: 'mpplus', ap: 60 }),
  cosmosrod: E(['星海之杖', 'Cosmos Rod'], 'weapon', 'rod', 0, { atk: 22, mag: 30 }, { pass: ['mphalf'] }),
  // staves
  moonstaff: E(['月之杖', 'Moon Staff'], 'weapon', 'staff', 6800, { atk: 18, mag: 15 }, { teach: 'mend', ap: 30 }),
  lifestaff: E(['生命之杖', 'Staff of Life'], 'weapon', 'staff', 0, { atk: 20, mag: 19 }, { teach: 'autoregen', ap: 70 }),
  aurorastaff: E(['極光之杖', 'Aurora Staff'], 'weapon', 'staff', 0, { atk: 26, mag: 30 }, { pass: ['mphalf'] }),
  // claws
  flameclaw: E(['炎爪', 'Flame Claw'], 'weapon', 'claw', 7400, { atk: 58 }, { el: 'fire' }),
  stormclaw: E(['雷爪', 'Storm Claw'], 'weapon', 'claw', 0, { atk: 70 }, { el: 'bolt', teach: 'counter', ap: 70 }),
  skyfist: E(['天拳', 'Sky Fist'], 'weapon', 'claw', 0, { atk: 104 }, { pass: ['breaker', 'critup'], d: ['鬥技場冠軍的拳套。', "The Colosseum champion's gauntlets."] }),
  // hammers
  gearhammer: E(['齒輪鎚', 'Gear Hammer'], 'weapon', 'hammer', 7400, { atk: 58, mag: 4 }, { teach: 'powerbreak', ap: 40 }),
  thunderhammer: E(['雷神鎚', 'Thunder Maul'], 'weapon', 'hammer', 0, { atk: 72, mag: 6 }, { el: 'bolt', teach: 'shockwave', ap: 60 }),
  starforge: E(['星鍛之鎚', 'Starforge'], 'weapon', 'hammer', 0, { atk: 104, mag: 12 }, { pass: ['breaker'], d: ['柯溫鍛造的最後一把鎚。', 'The last hammer Corwin forged.'] }),
  // harps (Ilse)
  lyre: E(['小豎琴', 'Lyre'], 'weapon', 'harp', 3000, { atk: 18, mag: 8 }),
  silverharp: E(['銀豎琴', 'Silver Harp'], 'weapon', 'harp', 6600, { atk: 26, mag: 12 }, { teach: 'autoward', ap: 50 }),
  bellharp: E(['鈴之豎琴', 'Bell Harp'], 'weapon', 'harp', 0, { atk: 34, mag: 18 }, { teach: 'hpplus', ap: 70 }),
  starharp: E(['星之豎琴', 'Star Harp'], 'weapon', 'harp', 0, { atk: 44, mag: 30 }, { pass: ['mphalf'] }),
  // armour
  crystalplate: E(['水晶鎧', 'Crystal Plate'], 'armor', 'heavy', 8200, { def: 40, mdef: 16 }),
  vowplate: E(['誓約之鎧', 'Vow Plate'], 'armor', 'heavy', 0, { def: 50, mdef: 22 }, { teach: 'autoprotect', ap: 70 }),
  starplate: E(['星辰之鎧', 'Star Plate'], 'armor', 'heavy', 0, { def: 66, mdef: 34 }, { resists: ['fire', 'ice', 'bolt'] }),
  stormcoat: E(['雷紋衣', 'Storm Coat'], 'armor', 'light', 7000, { def: 30, mdef: 18, spd: 2 }, { resists: ['bolt'] }),
  shadowgarb: E(['影之衣', 'Shadow Garb'], 'armor', 'light', 0, { def: 36, mdef: 22, spd: 3 }, { teach: 'firststrike', ap: 50 }),
  skyweave: E(['天織衣', 'Skyweave'], 'armor', 'light', 0, { def: 48, mdef: 34, spd: 4 }, { resists: ['wind', 'water'] }),
  lumenrobe: E(['光之袍', 'Lumen Robe'], 'armor', 'robe', 7200, { def: 22, mdef: 32, mag: 5 }),
  belltollrobe: E(['鐘鳴袍', 'Belltoll Robe'], 'armor', 'robe', 0, { def: 28, mdef: 38, mag: 8 }, { teach: 'mphalf', ap: 90 }),
  cosmicrobe: E(['星海袍', 'Cosmic Robe'], 'armor', 'robe', 0, { def: 36, mdef: 50, mag: 12 }, { resists: ['dark', 'holy'] }),
  // accessories
  regenring: E(['再生戒指', 'Regen Ring'], 'acc', 'any', 0, { mdef: 2 }, { pass: ['autoregen'], teach: 'autoregen', ap: 100 }),
  hastecharm: E(['加速護符', 'Haste Charm'], 'acc', 'any', 0, { spd: 2 }, { pass: ['autohaste'] }),
  protectring: E(['護壁戒指', 'Guard Ring'], 'acc', 'any', 5200, { def: 4 }, { pass: ['autoprotect'] }),
  wardamulet: E(['魔障項鍊', 'Ward Amulet'], 'acc', 'any', 5200, { mdef: 4 }, { pass: ['autoward'] }),
  counterbadge: E(['反擊徽章', 'Counter Badge'], 'acc', 'any', 0, { str: 3 }, { pass: ['counter'], teach: 'counter', ap: 80 }),
  learnersring: E(['學徒戒指', "Learner's Ring"], 'acc', 'any', 0, { mag: 2 }, { pass: ['apup'] }),
  luckycoin: E(['幸運金幣', 'Lucky Coin'], 'acc', 'any', 0, {}, { pass: ['goldup'] }),
  sagesring: E(['賢者之戒', "Sage's Ring"], 'acc', 'any', 0, { mag: 3 }, { pass: ['expup'] }),
  quietboots: E(['靜步之靴', 'Quiet Boots'], 'acc', 'any', 0, { spd: 1 }, { pass: ['quiet'], teach: 'quiet', ap: 60 }),
  phoenixcharm: E(['鳳凰護符', 'Phoenix Charm'], 'acc', 'any', 0, { mdef: 3 }, { pass: ['autolife'] }),
  frostguard: E(['霜之護符', 'Frost Ward'], 'acc', 'any', 3800, { mdef: 3 }, { resists: ['ice'] }),
  stormguard: E(['雷之護符', 'Storm Ward'], 'acc', 'any', 3800, { mdef: 3 }, { resists: ['bolt'] }),
  tideguard: E(['潮之護符', 'Tide Ward'], 'acc', 'any', 3800, { mdef: 3 }, { resists: ['water'] }),
  captainbadge: E(['隊長徽章', "Captain's Badge"], 'acc', 'any', 0, { str: 6, def: 6 }, { d: ['灰衛隊長代代相傳的徽章。', 'The badge every captain of the Ashguard has worn.'] }),
  drakefeather: E(['龍羽', 'Drake Plume'], 'acc', 'any', 0, { spd: 6 }, { d: ['龍騎賽的獎品。', 'A drake-race prize.'] }),
  mpcharm: E(['省魔護符', 'Thrift Charm'], 'acc', 'any', 0, { mag: 2 }, { pass: ['mphalf'], teach: 'mphalf', ap: 120 }),
  keenring: E(['會心戒指', 'Keen Ring'], 'acc', 'any', 6000, { str: 2 }, { pass: ['critup'], teach: 'critup', ap: 60 }),
  giantbelt: E(['巨人腰帶', "Giant's Belt"], 'acc', 'any', 0, { str: 4 }, { pass: ['hpplus'], teach: 'hpplus', ap: 80 }),
  mindgem: E(['心靈寶石', 'Mind Gem'], 'acc', 'any', 0, { mag: 4 }, { pass: ['mpplus'], teach: 'mpplus', ap: 80 }),
  ribbonplus: E(['名之緞帶', 'Ribbon of Names'], 'acc', 'any', 0, { mdef: 12, str: 4, mag: 4 }, { immune: true, d: ['防止所有異常狀態。圖鑑全部完成的獎勵。', 'Wards off every ailment. The prize for a full bestiary.'] }),
  provokering: E(['挑釁之戒', 'Taunt Ring'], 'acc', 'any', 2600, { def: 2 }, { teach: 'provoke', ap: 20 }),
  bandana: E(['醫者頭巾', "Medic's Scarf"], 'acc', 'any', 2600, { mdef: 2 }, { teach: 'mend', ap: 20 }),
};

// ---------- monster skills ----------
const K = (n, o) => ({ n, ...o });
export const FSK2 = {
  tidepull: K(['潮汐拉扯', 'Undertow'], { kind: 'magic', tgt: 'one', power: 75, el: 'water', fx: 'water' }),
  whirl: K(['漩渦', 'Whirlpool'], { kind: 'magic', tgt: 'all', power: 120, el: 'water', fx: 'water' }),
  mournsong: K(['哀歌', 'Lament'], { kind: 'status', tgt: 'all', st: 'mute', hit: 0.45, fx: 'dark' }),
  hollowtouch: K(['空洞之觸', 'Hollow Touch'], { kind: 'drain', tgt: 'one', power: 80, fx: 'dark' }),
  forget: K(['遺忘', 'Forget'], { kind: 'status', tgt: 'one', st: 'stop', hit: 0.5, fx: 'dark' }),
  pale: K(['蒼白之光', 'Pale Light'], { kind: 'magic', tgt: 'all', power: 120, fx: 'holy' }),
  sporecloud: K(['毒孢子', 'Spore Cloud'], { kind: 'status', tgt: 'all', st: 'poison', hit: 0.5, fx: 'poison' }),
  rootbind: K(['根縛', 'Root Bind'], { kind: 'status', tgt: 'one', st: 'slow', hit: 0.7, fx: 'dark' }),
  sandblast: K(['沙暴', 'Sandstorm'], { kind: 'magic', tgt: 'all', power: 95, el: 'earth', st: 'blind', hit: 0.3, fx: 'quake' }),
  scorch: K(['灼燒', 'Scorch'], { kind: 'magic', tgt: 'one', power: 130, el: 'fire', fx: 'fire' }),
  magma: K(['岩漿噴發', 'Eruption'], { kind: 'magic', tgt: 'all', power: 150, el: 'fire', fx: 'fire' }),
  gearshot: K(['齒輪彈', 'Gear Shot'], { kind: 'phys', tgt: 'one', power: 1.6 }),
  laser: K(['光線', 'Beam'], { kind: 'magic', tgt: 'one', power: 160, el: 'bolt', fx: 'bolt' }),
  repair: K(['自我修復', 'Self-Repair'], { kind: 'heal', tgt: 'self', power: 0.2 }),
  missile: K(['飛彈', 'Rocket'], { kind: 'phys', tgt: 'all', power: 1.0 }),
  galeslash: K(['風刃', 'Wind Blade'], { kind: 'magic', tgt: 'one', power: 125, el: 'wind', fx: 'wind' }),
  cyclone: K(['龍捲風', 'Cyclone'], { kind: 'magic', tgt: 'all', power: 140, el: 'wind', fx: 'wind' }),
  peck: K(['猛啄', 'Peck'], { kind: 'phys', tgt: 'one', power: 1.4 }),
  blizzard: K(['暴風雪', 'Blizzard'], { kind: 'magic', tgt: 'all', power: 150, el: 'ice', fx: 'ice' }),
  frostbite: K(['凍咬', 'Frostbite'], { kind: 'phys', tgt: 'one', power: 1.3, st: 'slow', hit: 0.5 }),
  voidbolt: K(['虛無彈', 'Void Bolt'], { kind: 'magic', tgt: 'one', power: 180, el: 'dark', fx: 'dark' }),
  nightfall: K(['夜幕', 'Nightfall'], { kind: 'magic', tgt: 'all', power: 165, el: 'dark', fx: 'dark' }),
  acid: K(['強酸', 'Acid'], { kind: 'phys', tgt: 'one', power: 1.0, st: 'brk', hit: 0.6 }),
  drainkiss: K(['吸魂之吻', 'Soul Kiss'], { kind: 'drain', tgt: 'one', power: 120, fx: 'dark' }),
  haunt: K(['作祟', 'Haunt'], { kind: 'status', tgt: 'one', st: 'blind', hit: 0.6, fx: 'dark' }),
  rage: K(['狂怒', 'Rage'], { kind: 'buff', tgt: 'self', st: 'berserk' }),
  thrust: K(['突刺', 'Lance Thrust'], { kind: 'phys', tgt: 'one', power: 2.0 }),
  bash: K(['盾擊', 'Shield Bash'], { kind: 'phys', tgt: 'one', power: 1.2, st: 'stop', hit: 0.25 }),
  eyebeam: K(['邪眼', 'Evil Eye'], { kind: 'status', tgt: 'one', st: 'stop', hit: 0.45, fx: 'dark' }),
  shriek: K(['尖叫', 'Shriek'], { kind: 'status', tgt: 'all', st: 'blind', hit: 0.4, fx: 'dark' }),
  bodyslam: K(['泰山壓頂', 'Body Slam'], { kind: 'phys', tgt: 'one', power: 2.2 }),
  quake3: K(['崩地', 'Upheaval'], { kind: 'magic', tgt: 'all', power: 170, el: 'earth', fx: 'quake' }),
  holyray: K(['聖光', 'Holy Ray'], { kind: 'magic', tgt: 'one', power: 170, el: 'holy', fx: 'holy' }),
  // boss moves
  veil: K(['蒼白面紗', 'Pale Veil'], { kind: 'buff', tgt: 'self', st: 'ward' }),
  grief: K(['悲慟', 'Grief'], { kind: 'magic', tgt: 'all', power: 140, fx: 'dark' }),
  lastorder: K(['最後的命令', 'Last Order'], { kind: 'buff', tgt: 'allfoes', st: 'berserk' }),
  palm: K(['掌擊', 'Palm Strike'], { kind: 'phys', tgt: 'one', power: 1.8 }),
  corebeam: K(['核心光砲', 'Core Cannon'], { kind: 'magic', tgt: 'all', power: 260, el: 'fire', fx: 'boom' }),
  galedive: K(['疾風俯衝', 'Gale Dive'], { kind: 'phys', tgt: 'all', power: 1.6 }),
  toll: K(['喪鐘', 'Death Toll'], { kind: 'status', tgt: 'all', st: 'mute', hit: 0.6, fx: 'song' }),
  erase: K(['抹名', 'Unname'], { kind: 'status', tgt: 'one', st: 'stop', hit: 0.85, fx: 'dark' }),
  oblivion: K(['忘卻', 'Oblivion'], { kind: 'magic', tgt: 'all', power: 240, fx: 'star' }),
  unwrite: K(['抹消', 'Unwrite'], { kind: 'magic', tgt: 'all', power: 360, fx: 'star' }),
  goldsnatch: K(['搶金', 'Gold Grab'], { kind: 'phys', tgt: 'one', power: 1.0 }),
  burrow: K(['潛沙', 'Burrow'], { kind: 'nothing', tgt: 'self' }),
};

// ---------- monsters ----------
// a stat line from level and build, so the new families sit on one curve
const BUILD = {
  base: {}, tank: { hp: 1.3, def: 1.35, spd: 0.7 }, brute: { hp: 1.25, def: 1.1, mag: 0.5 }, caster: { hp: 0.8, def: 0.8, mag: 1.35, mdef: 1.3 },
  fast: { hp: 0.85, def: 0.9, spd: 1.5 }, swarm: { hp: 0.6, exp: 0.6, gold: 0.6 }, elite: { hp: 1.6, exp: 1.7, gold: 1.5, def: 1.1 },
};
function line(lv, b = 'base') {
  const m = BUILD[b], k = (n) => m[n] || 1;
  return {
    lv, hp: Math.round((0.8 * lv * lv + 20) * k('hp')), atk: 0, def: Math.round((0.8 * lv + 2) * k('def')), mag: Math.round((lv + 2) * k('mag')),
    mdef: Math.round(0.75 * lv * k('mdef')), spd: Math.round((6 + lv * 0.22) * k('spd')), exp: Math.round(0.2 * lv * lv * k('exp')), gold: Math.round((0.14 * lv * lv + 10) * k('gold')),
  };
}
const M = (n, art, lv, b, o = {}) => ({ n, art, ...line(lv, b), ...o });
const G = { lum: 0.9, sat: 0.15 }; // the Hush leaves things grey
export const MON2 = {
  // the old roads after the Ember (Part II overworld)
  hollowman: M(['空洞之人', 'Hollow'], 'person:bard1', 28, 'base', { scale: 2, human: true, look: G, weak: ['holy'], acts: [['atk', 3], ['hollowtouch', 1]], drop: ['m_pale', 0.1] }),
  greywolf: M(['灰狼', 'Grey Wolf'], 'leogan', 28, 'fast', { look: { hue: 0, sat: 0.2, lum: 1.1 }, acts: [['atk', 3], ['bite', 2]], drop: ['m_fang', 0.2] }),
  duskbat: M(['暮色蝙蝠', 'Dusk Bat'], 'r_bat', 29, 'fast', { weak: ['wind'], acts: [['atk', 2], ['drainbite', 1]], drop: ['m_feather', 0.15] }),
  thornimp: M(['荊棘小鬼', 'Thorn Imp'], 'i_gobgreen', 29, 'swarm', { weak: ['fire'], acts: [['atk', 3], ['poisonbite', 1]], drop: ['m_hide', 0.2] }),
  // the Drowned Cloister
  drownwisp: M(['溺魂', 'Drowned Wisp'], 'i_ghost', 29, 'caster', { undead: true, weak: ['holy', 'bolt'], absorb: ['water'], acts: [['tidepull', 2], ['mournsong', 1], ['haunt', 1]], drop: ['m_crystal', 0.15] }),
  reefling: M(['礁蜥人', 'Reefling'], 'i_zibblue', 30, 'base', { weak: ['bolt'], resist: ['water'], acts: [['atk', 3], ['squirt', 1]], drop: ['m_scale', 0.12] }),
  brineooze: M(['鹹水泥怪', 'Brine Ooze'], 'r_slime', 30, 'tank', { look: { hue: 150, sat: 1.1 }, weak: ['bolt', 'fire'], absorb: ['water'], acts: [['atk', 2], ['acid', 1]], drop: ['antidote', 0.3] }),
  tideserpent: M(['潮紋海蛇', 'Tide Serpent'], 'e_elapoline', 31, 'base', { weak: ['bolt'], absorb: ['water'], acts: [['atk', 2], ['tidepull', 2], ['whirl', 1]], drop: ['m_scale', 0.15] }),
  mournbell: M(['哀鐘花', 'Mourning Bell'], 'e_elphobella', 30, 'caster', { weak: ['fire'], acts: [['mournsong', 1], ['spore', 1], ['atk', 1]], drop: ['lozenge', 0.3] }),
  palepriestess: M(['蒼白院長', 'The Pale Prioress'], 'person:devout3', 32, 'base', { hp: 24000, atk: 95, def: 30, mag: 56, mdef: 40, spd: 13, exp: 3600, gold: 4000, boss: 'prioress', scale: 3, human: true, look: { sat: 0.1, lum: 1.25 }, weak: ['fire'], acts: [['grief', 1], ['hollowtouch', 2], ['icicle', 1], ['mournsong', 1]] }),
  // the Rootdeep
  rootcrawler: M(['根爬蟲', 'Rootcrawler'], 'r_worm', 31, 'brute', { look: { hue: 30, sat: 0.8, lum: 0.8 }, weak: ['fire'], resist: ['earth'], acts: [['atk', 3], ['bite', 1]], drop: ['m_root', 0.2] }),
  mycelite: M(['菌人', 'Mycelite'], 'e_tinybedo', 31, 'caster', { weak: ['fire'], acts: [['sporecloud', 1], ['spore', 1], ['atk', 2]], drop: ['m_root', 0.15] }),
  snapvine: M(['咬咬藤', 'Snapvine'], 'r_plant', 32, 'base', { weak: ['fire', 'ice'], acts: [['atk', 2], ['thornlash', 1], ['rootbind', 1]], drop: ['m_root', 0.2] }),
  sproutling: M(['芽芽', 'Sproutling'], 'r_sprout', 31, 'swarm', { weak: ['fire'], acts: [['atk', 2], ['heal', 1]], drop: ['potion', 0.3] }),
  glowcap: M(['光蕈', 'Glowcap'], 'e_voongopa', 32, 'caster', { weak: ['fire'], acts: [['zap', 2], ['sporecloud', 1]], drop: ['ether', 0.06] }),
  bogslime: M(['腐泥巨怪', 'Bog Lump'], 'i_bigslime', 32, 'tank', { scale: 2, weak: ['fire'], acts: [['atk', 2], ['acid', 1], ['bodyslam', 1]], drop: ['m_hide', 0.25] }),
  ashwraith: M(['灰燼怨靈', 'Ash Wraith'], 'i_ghostdark', 32, 'caster', { undead: true, weak: ['holy'], acts: [['drainbite', 2], ['ember', 1], ['haunt', 1]], drop: ['m_ember', 0.1] }),
  hollowgarrick: M(['空洞的加瑞克', 'Hollow Garrick'], 'person:soldier6', 34, 'base', { hp: 20000, atk: 95, def: 32, mag: 30, mdef: 30, spd: 13, exp: 4500, gold: 4500, boss: 'garrick2', scale: 3, human: true, look: G, weak: ['holy'], acts: [['atk', 3], ['slash', 2], ['sweep', 1]] }),
  mycelmother: M(['菌母', 'Mother Mycel'], 'e_poblade', 38, 'base', { hp: 34000, atk: 105, def: 28, mag: 60, mdef: 36, spd: 9, exp: 5400, gold: 6000, boss: 'mycel', scale: 2, weak: ['fire'], acts: [['sporecloud', 2], ['spore', 1], ['atk', 2], ['rootbind', 1]] }),
  // the Sunfire Temple and the deep desert
  cinderslime: M(['焰泥', 'Cinder Slime'], 'i_fslime', 33, 'base', { weak: ['ice', 'water'], absorb: ['fire'], acts: [['atk', 2], ['scorch', 1]], drop: ['m_ember', 0.15] }),
  dunesnake: M(['沙紋蛇', 'Dune Viper'], 'r_snake', 33, 'fast', { look: { hue: 50, sat: 0.9, lum: 1.1 }, weak: ['ice'], acts: [['atk', 2], ['poisonbite', 2]], drop: ['m_hide', 0.2] }),
  firewhirl: M(['火旋風', 'Fire Whirl'], 'e_wapemeroll', 34, 'caster', { weak: ['water', 'ice'], absorb: ['fire'], acts: [['scorch', 2], ['magma', 1]], drop: ['m_ember', 0.2] }),
  sunlizard: M(['陽炎蜥', 'Sun Lizard'], 's_29', 34, 'base', { weak: ['ice'], resist: ['fire'], acts: [['atk', 3], ['ember', 1]], drop: ['m_scale', 0.15] }),
  templeguard: M(['神殿石衛', 'Temple Guardian'], 'golem', 35, 'tank', { look: { hue: 40, sat: 0.8, lum: 1.15 }, weak: ['water'], resist: ['earth', 'fire'], acts: [['atk', 3], ['quake2', 1]], drop: ['m_ore', 0.25] }),
  emberfiend: M(['燼月餘魔', 'Ember Fiend'], 'e_anosith', 35, 'caster', { weak: ['ice', 'water'], absorb: ['fire'], acts: [['scorch', 2], ['flame', 1], ['atk', 1]], drop: ['m_ember', 0.2] }),
  sandworm: M(['沙丘巨蟲', 'Dune Wyrm'], 'r_worm', 36, 'base', { hp: 26000, atk: 110, def: 34, mag: 40, mdef: 28, spd: 10, exp: 4800, gold: 7000, boss: 'dunewyrm', scale: 2, look: { hue: 30, sat: 0.6, lum: 1.1 }, weak: ['ice', 'water'], resist: ['earth'], acts: [['atk', 2], ['bodyslam', 2], ['sandblast', 1]] }),
  masteroro: M(['奧羅師父', 'Master Oro'], 'person:devout4', 36, 'base', { hp: 32000, atk: 110, def: 30, mag: 40, mdef: 34, spd: 16, exp: 5400, gold: 5000, boss: 'oro', scale: 3, human: true, look: { hue: 180, sat: 0.3, lum: 0.9 }, acts: [['atk', 3], ['palm', 2], ['sweep', 1]] }),
  // Emberfall isle and the Gearworks
  cogspider: M(['齒輪蜘蛛', 'Cog Spider'], 'r_spider', 35, 'fast', { weak: ['bolt'], acts: [['atk', 2], ['gearshot', 1]], drop: ['m_gear', 0.2] }),
  steamtank: M(['蒸汽戰車', 'Steam Tank'], 'r_tank', 36, 'tank', { look: { hue: -90, sat: 0.6 }, weak: ['bolt', 'water'], acts: [['atk', 2], ['missile', 1], ['gearshot', 1]], drop: ['m_gear', 0.25] }),
  clockknight: M(['發條騎士', 'Clockwork Knight'], 's_03', 36, 'brute', { weak: ['bolt'], acts: [['atk', 3], ['laser', 1]], drop: ['m_gear', 0.2] }),
  brasshulk: M(['黃銅巨像', 'Brass Hulk'], 's2_00', 37, 'tank', { weak: ['bolt'], acts: [['atk', 3], ['bodyslam', 1], ['repair', 1]], drop: ['m_ore', 0.25] }),
  scrapcrawler: M(['廢鐵爬行者', 'Scrap Crawler'], 'r_crawler', 37, 'base', { weak: ['bolt', 'water'], acts: [['atk', 2], ['gearshot', 2]], drop: ['m_gear', 0.2] }),
  sentrybot: M(['哨戒機', 'Sentry'], 's_18', 36, 'swarm', { weak: ['bolt'], acts: [['laser', 1], ['atk', 2]], drop: ['thunderjar', 0.15] }),
  lavamite: M(['熔岩蟎', 'Lava Mite'], 's2_28', 35, 'swarm', { look: { hue: 20, sat: 1.2 }, weak: ['ice', 'water'], absorb: ['fire'], acts: [['atk', 2], ['ember', 1]], drop: ['m_ember', 0.1] }),
  colossus: M(['發條巨神', 'Clockwork Colossus'], 's_00', 38, 'base', { hp: 36000, atk: 115, def: 40, mag: 50, mdef: 30, spd: 10, exp: 6000, gold: 6000, boss: 'colossus', scale: 3, weak: ['bolt'], acts: [['atk', 3], ['missile', 2], ['laser', 1]] }),
  // Grayhold keep: the Thornsworn
  thornsworn: M(['荊誓兵', 'Thornsworn'], 'person:ashguard', 37, 'base', { scale: 2, human: true, look: { hue: 100, sat: 1.4, lum: 0.8 }, acts: [['atk', 3], ['slash', 1], ['thrust', 1]], drop: ['m_ore', 0.15] }),
  thornarcher: M(['荊誓弓手', 'Thornsworn Archer'], 'person:scout1', 37, 'fast', { scale: 2, human: true, look: { hue: 100, sat: 0.8, lum: 0.8 }, acts: [['atk', 2], ['dive', 1]], drop: ['m_feather', 0.15] }),
  thornmage: M(['荊誓術士', 'Thornsworn Mage'], 'person:conjurer6', 38, 'caster', { scale: 2, human: true, look: { hue: 100, sat: 0.8 }, acts: [['darkfire', 1], ['thornbind', 1], ['zap', 1]], drop: ['ether', 0.1] }),
  warhound: M(['戰犬', 'War Hound'], 'leogan', 37, 'fast', { look: { hue: 120, sat: 0.6, lum: 0.7 }, acts: [['atk', 3], ['bite', 2], ['howl', 1]], drop: ['m_fang', 0.25] }),
  darkknight: M(['荊之黑騎', 'Thorn Knight'], 'r_knight', 38, 'elite', { weak: ['holy'], acts: [['atk', 3], ['thrust', 1], ['bash', 1]], drop: ['m_ore', 0.3] }),
  sable: M(['賽柏', 'Sable'], 'person:soldier7', 39, 'base', { hp: 38000, atk: 120, def: 36, mag: 30, mdef: 32, spd: 17, exp: 6600, gold: 6500, boss: 'sable', scale: 3, human: true, look: { hue: 100, sat: 1.2, lum: 0.75 }, acts: [['atk', 3], ['thrust', 2], ['leapfoe', 1]] }),
  // the old barracks under Varn
  hollowguard: M(['空洞衛兵', 'Hollow Guard'], 'person:ashguard', 38, 'brute', { scale: 2, human: true, look: G, undead: true, weak: ['holy'], acts: [['atk', 3], ['slash', 1], ['hollowtouch', 1]], drop: ['m_pale', 0.15] }),
  barrackghost: M(['兵營幽魂', 'Barracks Ghost'], 'i_ghostred', 38, 'caster', { undead: true, weak: ['holy'], acts: [['drainkiss', 1], ['haunt', 1], ['atk', 1]], drop: ['m_pale', 0.12] }),
  wraithmage: M(['怨靈法師', 'Wraith Mage'], 'r_wizard', 39, 'caster', { undead: true, weak: ['holy', 'fire'], acts: [['voidbolt', 1], ['blizzard', 1], ['mournsong', 1]], drop: ['etherdew', 0.05] }),
  legion: M(['無名軍團', 'The Nameless Legion'], 'person:ashguard', 40, 'base', { hp: 18000, atk: 120, def: 34, mag: 30, mdef: 30, spd: 12, exp: 2400, gold: 2500, boss: 'legion', scale: 3, human: true, look: { sat: 0.05, lum: 0.7 }, undead: true, weak: ['holy'], acts: [['atk', 3], ['slash', 2], ['sweep', 1]] }),
  // the Cloud Sea
  skywyrm: M(['雲龍', 'Cloud Wyrm'], 'e_novaram', 39, 'base', { weak: ['bolt'], absorb: ['wind'], acts: [['atk', 2], ['galeslash', 2], ['dive', 1]], drop: ['m_feather', 0.25] }),
  stormjester: M(['雷鳴小丑', 'Storm Jester'], 'e_glowjester', 39, 'caster', { absorb: ['bolt'], weak: ['wind'], acts: [['zap', 2], ['storm', 1], ['laser', 1]], drop: ['m_storm', 0.2] }),
  dreamwyrm: M(['夢翼龍', 'Dream Wyvern'], 'e_muldream', 40, 'fast', { weak: ['ice'], acts: [['atk', 2], ['spore', 1], ['galeslash', 1]], drop: ['m_feather', 0.2] }),
  windwasp: M(['風蜂', 'Gale Wasp'], 'r_wasp', 39, 'swarm', { weak: ['ice'], acts: [['atk', 2], ['poisonbite', 2]], drop: ['m_silk', 0.2] }),
  cloudwitch: M(['雲上魔女', 'Cloud Witch'], 'i_witchblue', 40, 'caster', { weak: ['bolt'], acts: [['blizzard', 1], ['galeslash', 1], ['eyebeam', 1]], drop: ['m_silk', 0.2] }),
  balloon: M(['氣球眼', 'Drifting Eye'], 'r_balloon', 40, 'caster', { weak: ['wind'], acts: [['eyebeam', 1], ['zap', 1], ['atk', 1]], drop: ['m_storm', 0.15] }),
  stormroc: M(['風暴巨鵬', 'Stormroc'], 'e_shugaeram', 42, 'base', { hp: 60000, atk: 125, def: 34, mag: 56, mdef: 36, spd: 18, exp: 7200, gold: 7000, boss: 'stormroc', scale: 2, look: { hue: 160, sat: 1.1 }, weak: ['bolt', 'ice'], absorb: ['wind'], acts: [['atk', 2], ['cyclone', 1], ['peck', 2]] }),
  // Mirefen, the southern swamp
  mirefrog: M(['沼地巨蛙', 'Mire Frog'], 'frogsia', 37, 'brute', { weak: ['ice'], acts: [['atk', 2], ['ink', 1], ['poisonbite', 1]], drop: ['m_hide', 0.2] }),
  bogzib: M(['沼蜥人', 'Bogling'], 'i_zib', 37, 'base', { weak: ['fire'], acts: [['atk', 3], ['acid', 1]], drop: ['m_scale', 0.12] }),
  mirecoil: M(['泥沼蛇', 'Mire Coil'], 'e_vedeon', 38, 'base', { weak: ['ice'], resist: ['water'], acts: [['atk', 2], ['poisonbite', 2], ['whirl', 1]], drop: ['m_scale', 0.2] }),
  fenwisp: M(['沼澤磷火', 'Fen Wisp'], 'i_ghostgreen', 37, 'caster', { undead: true, weak: ['holy', 'wind'], acts: [['ember', 1], ['sporecloud', 1], ['haunt', 1]], drop: ['m_pale', 0.08] }),
  tentacle: M(['泥中觸手', 'Mud Tentacle'], 's_15', 38, 'swarm', { weak: ['fire'], acts: [['atk', 2], ['rootbind', 1]], drop: ['m_hide', 0.15] }),
  deepeel: M(['深淵電鰻', 'Abyss Eel'], 'e_veravascorr', 41, 'fast', { weak: ['earth'], absorb: ['bolt'], acts: [['zap', 2], ['storm', 1], ['atk', 1]], drop: ['m_storm', 0.15] }),
  grottocrab: M(['洞窟巨蟹', 'Grotto Crab'], 'crab3', 41, 'tank', { look: { hue: 200, sat: 1.1 }, weak: ['bolt'], absorb: ['water'], acts: [['atk', 2], ['pinch', 2], ['shell', 1]], drop: ['m_crystal', 0.2] }),
  deepcoilboss: M(['淵蛇', 'Deepcoil'], 'e_onodemato', 45, 'base', { hp: 75000, atk: 135, def: 36, mag: 66, mdef: 40, spd: 14, exp: 9000, gold: 9000, boss: 'deepcoil', scale: 2, look: { hue: -30, lum: 0.8 }, weak: ['earth', 'bolt'], absorb: ['water'], acts: [['atk', 2], ['whirl', 1], ['tidepull', 2], ['bite', 1]] }),
  goldmaw: M(['黃金巨鉗', 'Goldmaw'], 'crab2', 44, 'base', { hp: 60000, atk: 130, def: 70, mag: 30, mdef: 50, spd: 9, exp: 7200, gold: 30000, boss: 'goldmaw', scale: 2, look: { hue: 10, sat: 1.4, lum: 1.2 }, weak: ['bolt'], acts: [['atk', 2], ['pinch', 2], ['shell', 1], ['goldsnatch', 1]] }),
  // Hollowmere, the grey north
  snowwolf: M(['雪原狼', 'Snow Wolf'], 'leogan', 41, 'fast', { look: { hue: 180, sat: 0.3, lum: 1.3 }, weak: ['fire'], resist: ['ice'], acts: [['atk', 3], ['frostbite', 1], ['howl', 1]], drop: ['m_frost', 0.15] }),
  frostling: M(['霜靈', 'Frostling'], 'e_orrhoanel', 41, 'caster', { weak: ['fire'], absorb: ['ice'], acts: [['icicle', 2], ['blizzard', 1]], drop: ['m_frost', 0.2] }),
  greyshade: M(['灰影', 'Grey Shade'], 'i_ghostdark', 42, 'caster', { look: { sat: 0.1, lum: 1.2 }, undead: true, weak: ['holy'], acts: [['forget', 1], ['hollowtouch', 1], ['pale', 1]], drop: ['m_pale', 0.2] }),
  icespider: M(['冰晶蜘蛛', 'Rime Spider'], 's2_28', 42, 'base', { weak: ['fire'], resist: ['ice'], acts: [['atk', 2], ['frostbite', 1], ['acid', 1]], drop: ['m_silk', 0.2] }),
  frozentree: M(['凍木', 'Frozen Ent'], 'e_greyaenodda', 42, 'tank', { weak: ['fire'], absorb: ['ice'], acts: [['atk', 2], ['thornlash', 1], ['blizzard', 1]], drop: ['m_root', 0.2] }),
  hollowfolk: M(['鐘鳴村的空洞人', 'Hollowed Villager'], 'person:mychars2', 41, 'swarm', { scale: 2, human: true, look: G, acts: [['atk', 3], ['forget', 1]], drop: ['m_pale', 0.15] }),
  greywitch: M(['灰之魔女', 'Grey Witch'], 'i_witchgrey', 43, 'caster', { weak: ['holy'], acts: [['voidbolt', 1], ['blizzard', 1], ['mournsong', 1]], drop: ['m_silk', 0.2] }),
  greyeye: M(['灰色邪眼', 'Grey Eye'], 'i_sendergrey', 43, 'caster', { weak: ['holy'], acts: [['eyebeam', 2], ['pale', 1]], drop: ['m_pale', 0.15] }),
  bellwraith: M(['鐘魂', 'The Bellwraith'], 'i_ghost', 44, 'base', { hp: 55000, atk: 125, def: 32, mag: 70, mdef: 44, spd: 14, exp: 7800, gold: 7000, boss: 'bellwraith', scale: 3, look: { sat: 0.2, lum: 1.2 }, undead: true, weak: ['holy'], acts: [['pale', 2], ['drainkiss', 1], ['mournsong', 1]] }),
  // the Pale Spire
  paleknight: M(['蒼白騎士', 'Pale Knight'], 'r_knight', 45, 'elite', { look: { sat: 0.1, lum: 1.35 }, weak: ['dark'], resist: ['holy'], acts: [['atk', 3], ['thrust', 1], ['bash', 1]], drop: ['m_pale', 0.25] }),
  palemask: M(['無面者', 'Faceless'], 'i_zeogrey', 46, 'caster', { weak: ['dark'], acts: [['voidbolt', 1], ['pale', 1], ['forget', 1]], drop: ['m_pale', 0.25] }),
  palewyrm: M(['蒼白翼龍', 'Pale Wyvern'], 'e_lospobsdo', 46, 'fast', { look: { sat: 0.15, lum: 1.3 }, weak: ['dark'], acts: [['atk', 2], ['dive', 1], ['pale', 1]], drop: ['m_feather', 0.2] }),
  paleooze: M(['蒼白泥', 'Pale Ooze'], 'smudge3', 45, 'tank', { look: { sat: 0.1, lum: 1.4 }, weak: ['fire'], acts: [['atk', 2], ['acid', 1], ['forget', 1]], drop: ['m_pale', 0.2] }),
  eraser: M(['抹名者', 'Eraser'], 'e_ygmytious', 47, 'caster', { look: { sat: 0.2, lum: 1.2 }, weak: ['dark', 'holy'], acts: [['erase', 1], ['nightfall', 1], ['atk', 1]], drop: ['etherdew', 0.08] }),
  stillbloom: M(['寂靜之花', 'Stillbloom'], 'e_muonille', 46, 'base', { look: { sat: 0.1, lum: 1.3 }, weak: ['fire'], acts: [['spore', 1], ['mournsong', 1], ['atk', 2]], drop: ['m_silk', 0.2] }),
  nameless: M(['無名者', 'The Nameless'], 'person:conjurer0', 48, 'base', { hp: 60000, atk: 135, def: 38, mag: 80, mdef: 48, spd: 16, exp: 0, gold: 0, boss: 'nameless', scale: 3, human: true, look: { sat: 0.05, lum: 1.35 }, acts: [['voidbolt', 2], ['blizzard', 1], ['pale', 2]] }),
  hush: M(['寂靜之心', 'The Hush'], 'reddragon', 52, 'base', { hp: 72000, atk: 145, def: 40, mag: 88, mdef: 46, spd: 15, exp: 0, gold: 0, boss: 'hush', look: { hue: 190, sat: 0.35, lum: 1.35 }, absorb: ['ice'], weak: ['fire'], acts: [['atk', 2], ['blizzard', 2], ['pale', 1], ['forget', 1]] }),
  // the Colosseum
  champion: M(['不屈的拉什', 'Raszh the Unbowed'], 'person:ninja', 46, 'base', { hp: 70000, atk: 150, def: 36, mag: 30, mdef: 30, spd: 24, exp: 6000, gold: 0, boss: 'champion', scale: 3, human: true, acts: [['atk', 3], ['slash', 2], ['palm', 1]] }),
  gladiator: M(['鬥士', 'Gladiator'], 'person:soldier4', 36, 'elite', { scale: 2, human: true, acts: [['atk', 3], ['slash', 1], ['shout', 1]] }),
  // the Starwell Abyss (after the end)
  abyssooze: M(['深淵泥', 'Abyss Ooze'], 'smudge4', 52, 'tank', { look: { hue: 220, lum: 0.6 }, weak: ['holy'], acts: [['atk', 2], ['acid', 1], ['voidbolt', 1]], drop: ['m_star', 0.05] }),
  starhound: M(['噬星犬', 'Star Hound'], 's_19', 52, 'fast', { look: { hue: 200, lum: 0.9 }, acts: [['atk', 3], ['bite', 2], ['howl', 1]], drop: ['m_fang', 0.3] }),
  abysseye: M(['深淵之眼', 'Abyss Eye'], 'r_eye', 54, 'caster', { look: { hue: 240, sat: 1.2 }, weak: ['holy'], acts: [['eyebeam', 1], ['nightfall', 1], ['laser', 1]], drop: ['m_star', 0.06] }),
  voidtree: M(['虛空之木', 'Void Tree'], 'e_oddlemudd', 54, 'tank', { weak: ['fire'], acts: [['atk', 2], ['thornlash', 1], ['nightfall', 1]], drop: ['m_root', 0.3] }),
  emberdrake: M(['燼龍', 'Ember Drake'], 'dragon', 56, 'elite', { look: { hue: 160, sat: 1.3 }, absorb: ['fire'], weak: ['ice'], acts: [['atk', 2], ['magma', 1], ['flame', 1]], drop: ['m_ember', 0.3] }),
  voidmask: M(['虛空之面', 'Void Mask'], 'i_zeo', 56, 'caster', { look: { hue: 200, lum: 0.7 }, acts: [['voidbolt', 2], ['nightfall', 1], ['erase', 1]], drop: ['m_star', 0.08] }),
  abysswyrm: M(['深淵翼龍', 'Abyss Wyvern'], 'e_orcosa', 55, 'fast', { look: { hue: 220, lum: 0.7 }, acts: [['atk', 2], ['dive', 2], ['nightfall', 1]], drop: ['m_scale', 0.3] }),
  morvaneecho: M(['莫凡的殘響', "Morvane's Echo"], 'person:morvane', 56, 'base', { hp: 60000, atk: 145, def: 40, mag: 90, mdef: 50, spd: 16, exp: 12000, gold: 10000, boss: 'echo', scale: 3, human: true, look: { lum: 0.6 }, acts: [['darkfire', 2], ['thunder2', 2], ['nightfall', 1]] }),
  unwritten: M(['未書者', 'The Unwritten'], 'i_zeogrey', 62, 'base', { hp: 140000, atk: 170, def: 46, mag: 100, mdef: 52, spd: 18, exp: 30000, gold: 30000, boss: 'unwritten', scale: 3, look: { sat: 0, lum: 0.35 }, acts: [['atk', 2], ['voidbolt', 2], ['nightfall', 1], ['blizzard', 1]] }),
};

// ---------- troops and zones ----------
export const ZONES2 = {
  p2world: [[3, ['hollowman', 'hollowman']], [3, ['greywolf', 'greywolf']], [2, ['duskbat', 'thornimp', 'thornimp']], [2, ['goldwyv', 'greywolf']], [1, ['hollowman', 'duskbat', 'hollowman']]],
  cloister: [[3, ['drownwisp', 'reefling']], [3, ['brineooze', 'drownwisp']], [2, ['tideserpent']], [2, ['mournbell', 'reefling', 'reefling']], [1, ['tideserpent', 'drownwisp']]],
  rootdeep: [[3, ['rootcrawler', 'sproutling', 'sproutling']], [3, ['mycelite', 'snapvine']], [2, ['glowcap', 'mycelite']], [2, ['bogslime']], [2, ['ashwraith', 'ashwraith']]],
  sunfire: [[3, ['cinderslime', 'cinderslime']], [3, ['dunesnake', 'sunlizard']], [2, ['firewhirl', 'emberfiend']], [2, ['templeguard']], [1, ['emberfiend', 'cinderslime', 'cinderslime']]],
  ddesert: [[3, ['dunesnake', 'dunesnake']], [3, ['sunlizard', 'firewhirl']], [2, ['sandgolem', 'sandgolem']], [2, ['cinderslime', 'dunesnake']]],
  ember: [[3, ['lavamite', 'lavamite', 'lavamite']], [3, ['firewhirl', 'cogspider']], [2, ['steamtank']], [2, ['lavamite', 'emberfiend']]],
  gearworks: [[3, ['cogspider', 'cogspider']], [3, ['clockknight', 'sentrybot']], [2, ['steamtank', 'sentrybot']], [2, ['brasshulk']], [2, ['scrapcrawler', 'cogspider']]],
  keep: [[3, ['thornsworn', 'thornsworn']], [3, ['thornarcher', 'thornmage']], [2, ['warhound', 'warhound', 'thornsworn']], [2, ['darkknight']], [1, ['thornmage', 'thornsworn', 'thornarcher']]],
  barracks: [[3, ['hollowguard', 'hollowguard']], [3, ['barrackghost', 'barrackghost']], [2, ['wraithmage', 'hollowguard']], [2, ['barrackghost', 'wraithmage']]],
  sky: [[3, ['skywyrm', 'windwasp']], [3, ['stormjester', 'balloon']], [2, ['dreamwyrm', 'dreamwyrm']], [2, ['cloudwitch', 'windwasp', 'windwasp']]],
  aerie: [[3, ['skywyrm', 'skywyrm']], [3, ['cloudwitch', 'stormjester']], [2, ['dreamwyrm', 'balloon']], [2, ['windwasp', 'windwasp', 'windwasp']]],
  mire: [[3, ['mirefrog', 'bogzib']], [3, ['mirecoil', 'fenwisp']], [2, ['tentacle', 'tentacle', 'bogzib']], [2, ['mirefrog', 'mirefrog']]],
  grotto: [[3, ['deepeel', 'grottocrab']], [3, ['mirecoil', 'deepeel']], [2, ['grottocrab', 'grottocrab']], [2, ['tentacle', 'deepeel', 'tentacle']]],
  snow: [[3, ['snowwolf', 'snowwolf']], [3, ['frostling', 'icespider']], [2, ['frozentree', 'snowwolf']], [2, ['greyshade', 'frostling']]],
  bell: [[3, ['hollowfolk', 'hollowfolk', 'greyshade']], [3, ['greywitch', 'greyeye']], [2, ['icespider', 'greyshade']], [2, ['frozentree', 'greywitch']], [1, ['greyeye', 'greyeye', 'greyeye']]],
  pale: [[3, ['paleknight', 'palemask']], [3, ['palewyrm', 'paleooze']], [2, ['eraser', 'stillbloom']], [2, ['paleknight', 'paleknight']], [1, ['palemask', 'eraser', 'palemask']]],
  abyss: [[3, ['abyssooze', 'starhound']], [3, ['abysseye', 'voidtree']], [2, ['emberdrake']], [2, ['voidmask', 'abysswyrm']], [2, ['starhound', 'starhound', 'abysseye']]],
};
export const BOSSES2 = {
  prioress: ['drownwisp', 'palepriestess', 'drownwisp'], garrick2: ['ashwraith', 'hollowgarrick', 'ashwraith'], mycel: ['mycelmother'], dunewyrm: ['sandworm'],
  oro: ['masteroro'], colossus: ['colossus'], sable: ['thornsworn', 'sable', 'thornsworn'], legion: ['legion', 'legion', 'legion'],
  stormroc: ['stormroc'], deepcoil: ['deepcoilboss'], goldmaw: ['goldmaw'], bellwraith: ['bellwraith'], nameless: ['nameless'], hush: ['hush'],
  champion: ['champion'], echo: ['morvaneecho'], unwritten: ['unwritten'],
};
export const BG2 = {
  p2world: 'plains', cloister: 'cloister', rootdeep: 'root', sunfire: 'temple', ddesert: 'desert', ember: 'volcano', gearworks: 'gear', keep: 'castle',
  barracks: 'castle', sky: 'sky', aerie: 'sky', mire: 'swamp', grotto: 'cloister', snow: 'snow', bell: 'snow', pale: 'pale', abyss: 'well',
};
export const SHOPS2 = {
  p2varn: ['hipotion', 'xpotion', 'remedy', 'phoenix', 'ether', 'tent', 'wakebell', 'lozenge', 'irontonic', 'wardtonic', 'smokebomb', 'runeblade', 'silverlance', 'crystalplate', 'stormcoat', 'lumenrobe', 'lyre'],
  reedholm: ['hipotion', 'xpotion', 'remedy', 'phoenix', 'ether', 'healmist', 'tent', 'thunderjar', 'holywater', 'smokebomb', 'galerod', 'moonstaff', 'flameclaw', 'gearhammer', 'silverharp', 'stormcoat', 'tideguard', 'frostguard'],
  skyreach: ['xpotion', 'remedy', 'phoenix', 'etherdew', 'healmist', 'quickdraught', 'galefan', 'holywater', 'keenring', 'protectring', 'wardamulet', 'stormguard', 'provokering', 'bandana'],
  belltoll: ['xpotion', 'remedy', 'phoenix', 'etherdew', 'healmist', 'tent', 'wakebell', 'holywater', 'galefan', 'quickdraught'],
  arena: ['xpotion', 'phoenix', 'etherdew', 'healmist', 'quickdraught', 'irontonic', 'wardtonic'],
};

// ---------- the forge at Kestrel ----------
export const RECIPES = [
  ['sunsteel', 6000, { m_ember: 3, m_ore: 2 }], ['vowblade', 12000, { m_pale: 3, m_ore: 3, m_crystal: 1 }],
  ['thunderpike', 9000, { m_storm: 3, m_ore: 2 }], ['stormclaw', 9000, { m_storm: 2, m_fang: 3 }],
  ['thunderhammer', 9000, { m_storm: 2, m_gear: 3 }], ['nightrod', 8000, { m_pale: 2, m_silk: 2 }],
  ['lifestaff', 8000, { m_root: 3, m_crystal: 2 }], ['bellharp', 8000, { m_silk: 3, m_crystal: 2 }],
  ['vowplate', 12000, { m_ore: 4, m_pale: 2 }], ['shadowgarb', 9000, { m_silk: 3, m_hide: 3 }],
  ['belltollrobe', 9000, { m_silk: 3, m_frost: 2 }], ['regenring', 6000, { m_root: 2, m_crystal: 1 }],
  ['counterbadge', 5000, { m_fang: 4, m_hide: 2 }], ['quietboots', 5000, { m_hide: 3, m_feather: 3 }],
  ['phoenixcharm', 9000, { m_ember: 3, m_feather: 3 }], ['mpcharm', 12000, { m_star: 1, m_crystal: 3 }],
  ['giantbelt', 9000, { m_hide: 4, m_scale: 3 }], ['mindgem', 9000, { m_crystal: 4, m_pale: 1 }],
  ['learnersring', 10000, { m_star: 1, m_gear: 2 }], ['grandelixir', 3000, { m_star: 1, m_root: 1 }],
];

// ---------- the Colosseum at Salt ----------
// each rank is fought in a row; HP and MP carry over between rounds
export const ARENA = [
  { n: ['銅階', 'Bronze'], fee: 1000, fights: [['gladiator'], ['warhound', 'warhound'], ['templeguard']], prize: 'counterbadge' },
  { n: ['銀階', 'Silver'], fee: 3000, fights: [['darkknight'], ['steamtank', 'cogspider'], ['gladiator', 'gladiator']], prize: 'hastecharm' },
  { n: ['金階', 'Gold'], fee: 6000, fights: [['brasshulk', 'clockknight'], ['cloudwitch', 'stormjester'], ['darkknight', 'darkknight']], prize: 'learnersring' },
  { n: ['冠軍戰', 'Champion'], fee: 10000, fights: [['champion']], prize: 'skyfist' },
];

// ---------- drake races at Reedholm ----------
export const CUPS = [
  { n: ['新手盃', 'Hatchling Cup'], fee: 200, rivals: [0.86, 0.9, 0.93], prize: 'drakefeather' },
  { n: ['沼澤盃', 'Fen Cup'], fee: 600, rivals: [0.95, 0.98, 1.01], prize: 'quietboots' },
  { n: ['龍王盃', 'Drake King Cup'], fee: 1500, rivals: [1.02, 1.05, 1.08], prize: 'phoenixcharm' },
];

// ---------- bestiary prizes from the Wenmere archivist ----------
export const BEAST_PRIZES = [[20, 'etherdew', 3], [50, 'sagesring', 1], [80, 'luckycoin', 1], [0, 'ribbonplus', 1]]; // 0 = every monster
