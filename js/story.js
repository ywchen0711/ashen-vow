// The story: every scene, conversation and event, in Chinese and English.
// A script is async (E, ent) => {...}; E is the toolbox main.js hands over.
import { L } from './i18n.js';
import { S, member, stats, isDawn } from './party.js';
import { ITEMS, SHOPS, nm } from './data.js';

const has = (id) => S.members.some((m) => m.id === id);
export const SCRIPTS = {};
const def = (id, f) => { SCRIPTS[id] = f; };

// ---------- generic ----------
def('chest', async (E, e) => {
  if (e.open) { await E.say(null, L('寶箱是空的。', 'The chest is empty.')); return; }
  e.open = true; S.flags['chest:' + e.id] = true;
  E.sfx('chest');
  if (e.gold) { S.gold += e.gold; await E.say(null, L(`得到了 ${e.gold} 金幣！`, `Found ${e.gold} gold!`)); return; }
  E.give(e.item, e.n || 1);
  await E.say(null, L(`得到了「${nm(ITEMS[e.item])}」${e.n > 1 ? '×' + e.n : ''}！`, `Found ${nm(ITEMS[e.item])}${e.n > 1 ? ' x' + e.n : ''}!`));
});
def('save', async (E) => {
  E.sfx('save');
  const tents = S.inv.tent || 0;
  const opts = [L('記錄', 'Save'), L(`使用帳篷（${tents}）`, `Use a Tent (${tents})`), L('離開', 'Leave')];
  const r = await E.ask(null, L('柔和的藍光包圍著你們。', 'A soft blue light surrounds you.'), opts);
  if (r === 0) { const ok = E.save(); E.sfx(ok ? 'save' : 'buzz'); await E.say(null, ok ? L('冒險已記錄。', 'Your journey has been saved.') : L('無法存檔。', 'Could not save.')); }
  if (r === 1) { if (!tents) { await E.say(null, L('沒有帳篷。', 'You have no tents.')); return; } E.give('tent', -1); await E.rest(L('在帳篷裡好好休息了一晚。', 'You rest well in the tent.')); }
});
const inn = (price) => async (E) => {
  const r = await E.ask('旅店老闆', L(`歡迎光臨！住一晚 ${price} 金幣，要休息嗎？`, `Welcome! A night is ${price} gold. Will you stay?`), [L('住宿', 'Stay'), L('不用了', 'No thanks')]);
  if (r !== 0) return;
  if (S.gold < price) { await E.say('旅店老闆', L('……錢好像不太夠呢。', "...You don't seem to have enough."));
    return; }
  S.gold -= price;
  await E.rest(L('早安！路上小心喔。', 'Good morning! Take care out there.'), '旅店老闆');
};
const shopTalk = (list, line) => async (E) => { await E.say('商人', line()); await E.shop(SHOPS[list]); };

// ---------- chapter 1: Castle Varn ----------
def('opening', async (E) => {
  E.music('empire');
  await E.wait(30);
  await E.say(null, L('瓦恩城——統治大陸中央的古老王國。\n灰衛隊長海爾，剛從東南的文湖回來。', 'Castle Varn, the old kingdom at the heart of the land.\nHale, captain of the Ashguard, has just come home from Wenmere.'));
  const brin = E.ent('brin_yard');
  if (brin) await E.walk(brin, 'ddd', 1);
  await E.say('布琳', L('海爾！你們回來了。……怎麼了？臉色比鎧甲還灰。', "Hale! You're back. ...What's wrong? Your face is greyer than your armour."));
  await E.say('海爾', L('布琳。……「泉鏡」拿到了。照國王的命令，從文湖修道院。', 'Brin. ...We have the lens. From the Wenmere priory, as the King ordered.'));
  await E.say('海爾', L('修道院長伊索爾德不肯交出來。她擋在祭壇前……灰衛的劍，沒有停下來。', "Prioress Ysolde wouldn't give it up. She stood in front of the altar... and the Ashguard's swords didn't stop."));
  await E.say('布琳', L('……那不是你的錯。是命令。', "...That wasn't your fault. It was an order."));
  await E.say('海爾', L('命令。是啊。我這把「灰燼之劍」每砍一次，就從我身上吸走一點什麼……我已經分不清是血，還是別的東西了。', 'An order. Yes. Every time this Ashbrand cuts, it drinks something out of me... I can no longer tell if it is blood, or something else.'));
  await E.say('布琳', L('國王在王座廳等你。莫凡大臣也在。……小心點，最近國王變得很奇怪。', "The King is waiting in the throne room. Chancellor Morvane is with him. ...Be careful. The King hasn't been himself lately."));
  if (brin) await E.walk(brin, 'uuu', 1);
  S.flags.opened = true;
});
def('brin_yard', async (E) => {
  await E.say('布琳', L('國王在王座廳等你。我在這裡等，結束後一起去喝一杯吧。', "The King is waiting in the throne room. I'll wait here. Let's get a drink after."));
});
def('king', async (E) => {
  if (S.flags.spire_done && !S.flags.king_freed) { await SCRIPTS.king_possessed(E); return; }
  if (S.flags.king_freed) { await SCRIPTS.king_after(E); return; }
  if (S.flags.ch1_throne) { await E.say('國王', L('……還站在這裡做什麼？去吧。', '...Why are you still standing there? Go.')); return; }
  S.flags.ch1_throne = true;
  E.music('villain');
  await E.say('國王', L('海爾，泉鏡呢？', 'Hale. The lens?'));
  E.sfx('chest');
  await E.say(null, L('海爾交出了「潮之泉鏡」。', 'Hale hands over the Tide Lens.'));
  await E.say('莫凡', L('呵呵……潮之泉鏡。很好，很好。剩下的三枚，也很快就會回到陛下手中。', 'Heh heh... The Tide Lens. Good, very good. The other three will soon be in Your Majesty\'s hands as well.'));
  await E.say('海爾', L('陛下。泉鏡守護著各地的水與土，取走它們，文湖的湖水已經開始混濁了。我想知道——為什麼？', 'Your Majesty. The lenses guard the water and the earth of every land. Since we took it, the lake at Wenmere has begun to cloud. I want to know: why?'));
  await E.say('國王', L('……你在質疑我？', '...You question me?'));
  await E.say('莫凡', L('陛下，看來灰衛隊長的心，已經比他的劍還要鈍了。', 'Your Majesty, it seems the Ashguard captain\'s heart has grown duller than his sword.'));
  await E.say('國王', L('海爾。你被解除灰衛隊長之職。', 'Hale. You are relieved of command of the Ashguard.'));
  await E.say('國王', L('明天一早，把這個木盒送到北方的灰岩堡，交給加瑞克隊長。路上經過苔道洞窟，聽說最近出現了怪物。', "At dawn, take this box to Grayhold in the north and give it to Captain Garrick. The road goes through Mossway Cave; they say monsters have appeared there."));
  E.give('sealbox');
  E.sfx('chest');
  await E.say(null, L('得到了「封印的木盒」。', 'Received the Sealed Box.'));
  await E.say('莫凡', L('布琳騎士會陪你同行。……畢竟，路上什麼事都可能發生。', 'Lady Brin will ride with you. ...After all, anything can happen on the road.'));
  await E.flash('#000000', 30);
  for (const id of ['king', 'morvane']) E.removeEnt(id);
  E.music('empire');
  await E.say('海爾', L('（國王的眼神……像是隔著一層霧在看我。）', "(The King's eyes... It was as if he were looking at me through a fog.)"));
  E.join('brin', 1);
  await E.say('布琳', L('聽說了！我跟你一起去。灰岩堡的加瑞克是我們的老朋友，送個盒子而已，就當散心吧。', "I heard! I'm coming with you. Garrick at Grayhold is an old friend. It's only a box. Think of it as a trip to clear your head."));
  await E.say(null, L('布琳加入了隊伍！', 'Brin joined the party!'));
  E.sfx('fanfare');
  await E.say(null, L('出城往北，經過苔道洞窟就能到灰岩堡。\nC 鍵可以開啟選單，按住 X 可以跑步。', 'Leave the castle and head north through Mossway Cave to reach Grayhold.\nPress C for the menu; hold X to run.'));
  S.flags.ch1_done = true;
});
def('morvane_hall', async (E) => { await E.say('莫凡', L('隊長，國王在等你。不要讓陛下失望喔……呵呵。', 'Captain, the King awaits. Do not disappoint His Majesty... heh heh.')); });
def('c_maid', async (E) => {
  if (S.flags.king_freed) { await E.say('侍女', L('國王陛下終於像以前一樣笑了。謝謝您，海爾大人。', 'His Majesty smiles like he used to. Thank you, Sir Hale.')); return; }
  await E.say('侍女', L('自從莫凡大臣來了以後，國王陛下晚上都不睡覺，一直盯著那輪紅色的月亮……', 'Ever since Chancellor Morvane came, His Majesty does not sleep. He just stares at that red moon all night...'));
});
def('c_guard', async (E) => { await E.say('衛兵', S.flags.spire_done ? L('城裡到處都長出了荊棘……王座廳的方向傳來奇怪的聲音。', 'Thorns are growing all over the castle... There are strange sounds from the throne room.') : L('隊長，您房間的寶箱裡放了藥水，出發前記得帶上。', "Captain, there are potions in the chest in your room. Take them before you go.")); });
def('c_yard', async (E) => { await E.say('衛兵', L('二十年前，天上多了一輪紅月。大家都叫它「燼月」。它從來不動，也從來不落下。', 'Twenty years ago a red moon appeared in the sky. They call it the Ember. It never moves, and it never sets.')); });
def('c_gardener', async (E) => { await E.say('老人', L('這座城底下，傳說封著一口很深很深的井。老國王說過，那口井裡睡著一顆星星。', "They say there's a deep, deep well sealed beneath this castle. The old king said a star sleeps inside it.")); });
def('king_possessed', async (E) => {
  E.music('villain');
  await E.say('亞爾多斯王', L('海……爾……你回來了……', 'Ha... le... You came back...'));
  await E.say('海爾', L('陛下！額頭上那是……荊之烙印！', "Your Majesty! On your brow... the thornbrand!"));
  await E.say('亞爾多斯王', L('燼月在……呼喚……把泉鏡……交出來……！', 'The Ember... calls... Give me... the lenses...!'));
  await E.battle('aldous', { bg: 'castle' });
  S.flags.king_freed = true; S.flags.well_open = true;
  E.music('empire');
  await E.say('亞爾多斯王', L('……我……做了什麼……？海爾……對不起……', '...What... have I done...? Hale... I am sorry...'));
  await E.say('亞爾多斯王', L('莫凡在王座下打開了「燼井」……二十年前，他就是從那口井裡聽見了燼月的聲音。', 'Morvane opened the Starwell beneath the throne... Twenty years ago, it was from that well that he first heard the Ember\'s voice.'));
  await E.say('亞爾多斯王', L('那不是月亮。那是一顆墜落的星星的「心」，被封在井底幾千年了。它想要回到天上，把整片大地一起燒成灰。', 'It is not a moon. It is the heart of a fallen star, sealed at the bottom of that well for thousands of years. It wants to rise again, and burn the whole land to ash.'));
  await E.say('亞爾多斯王', L('四枚泉鏡……就是封印的鑰匙。去吧，灰衛隊長……不，曙光騎士。', 'The four lenses... are the keys to its seal. Go, captain of the Ashguard... No. Dawn Knight.'));
  await E.say(null, L('王座後方出現了往下的階梯。', 'Stairs leading down have appeared behind the throne.'));
});
def('king_after', async (E) => { await E.say('亞爾多斯王', L('燼井就在王座後面。願光與你們同在。', 'The Starwell lies behind the throne. May the light go with you.')); });

// ---------- Varn town ----------
def('v_child', async (E) => { await E.say('小孩', S.flags.spire_done ? L('紅色的月亮變得好大！媽媽說不要一直看它。', "The red moon got so big! Mum says not to stare at it.") : L('灰衛隊的盔甲好帥喔！我長大也要當灰衛！', "The Ashguard's armour is so cool! I'm going to be in the Ashguard when I grow up!")); });
def('v_shop', shopTalk('varn', () => L('旅行用品和武器都在這裡。', 'Travel goods and arms, right here.')));
def('v_woman', async (E) => { await E.say('村民', L('聽說東南的文湖最近湖水變黑了，魚都死了。是不是跟灰衛隊有關啊……', "They say the lake at Wenmere has turned black and the fish are dying. Is it something to do with the Ashguard...?")); });
def('v_old', async (E) => { await E.say('老人', L('北邊的苔道洞窟住著一隻大蜥蜴。怕火喔，帶點火的東西去吧。', 'A great lizard lives in Mossway Cave to the north. It fears fire, so take something that burns.')); });
def('v_inn', inn(20));
def('v_soldier', async (E) => { await E.say('士兵', L('東邊的大橋被封鎖了。說是莫凡大臣的命令。', 'The great bridge to the east is closed. Chancellor Morvane\'s orders, they say.')); });
def('bridgeguard', async (E) => { await E.say('衛兵', L('這座橋奉莫凡大臣之命封鎖中。任何人都不准通過。', 'This bridge is closed by order of Chancellor Morvane. No one may cross.')); });

// ---------- the Mossway ----------
def('mossmaw', async (E) => {
  E.shake(20); E.sfx('quake');
  await E.say('布琳', L('地面在晃……！海爾，上面！', 'The ground is shaking...! Hale, above us!'));
  await E.say(null, L('長滿苔蘚的巨蜥從岩縫中爬了出來！', 'A moss-covered giant lizard crawls out of the rocks!'));
  await E.battle('mossmaw', { bg: 'cave' });
  await E.say('布琳', L('呼……沒事吧？你那把劍，又吸走你的體力了吧。少用一點「灰刃」啊。', "Phew... You alright? That sword drank from you again, didn't it. Go easy on the Ashedge."));
});

// ---------- chapter 2: Grayhold and Thornby ----------
def('garrick', async (E) => {
  if (S.flags.grayhold_done) return;
  E.music('rage');
  await E.say('加瑞克', L('海爾！布琳！真難得，你們兩個一起來。國王有什麼吩咐？', 'Hale! Brin! What a surprise, the two of you together. What does the King want?'));
  await E.say(null, L('海爾把封印的木盒交給了加瑞克。', 'Hale hands the sealed box to Garrick.'));
  E.give('sealbox', -1);
  await E.wait(30);
  await E.say('加瑞克', L('……', '...'));
  await E.say('加瑞克', L('「灰岩堡守軍，即刻出兵，燒毀荊棘村——喚靈師之村。」', '"The Grayhold garrison is to march at once and burn Thornby, the village of the callers."'));
  await E.say('加瑞克', L('「送信者海爾，以叛國罪就地拘捕。」', '"The bearer, Hale, is to be arrested on the spot for treason."'));
  await E.say('布琳', L('什麼！？', 'What!?'));
  await E.say('加瑞克', L('……抱歉了，老朋友。我在瓦恩還有家人。部隊昨晚就出發了，現在大概已經……', "...I'm sorry, old friend. I have a family in Varn. The troops left last night. By now they've probably..."));
  await E.say('加瑞克', L('抓住他們！', 'Seize them!'));
  await E.battle(['ashguard', 'ashguard'], { bg: 'castle', noRun: true });
  E.removeEnt('gh_soldier1'); E.removeEnt('gh_soldier2'); E.removeEnt('garrick');
  S.flags.grayhold_done = true; S.flags.thornby_burned = true;
  await E.say('布琳', L('加瑞克跑了……他往東邊去了！荊棘村就在東邊的森林裡！', "Garrick's gone... He went east! Thornby is in the forest to the east!"));
  await E.say('海爾', L('……那個盒子，是我親手送來的。', '...I carried that box here with my own hands.'));
  await E.say('布琳', L('現在不是自責的時候！走吧！', "This is no time to blame yourself! Let's go!"));
});
def('gh_soldier', async (E) => { await E.say('灰衛兵', L('隊長……對不起。', 'Captain... I\'m sorry.')); });
def('thornby_fire', async (E) => {
  E.music('prelude');
  await E.say(null, L('村子已經燒成了一片灰燼。', 'The village has burned to ash.'));
  await E.say('布琳', L('……來晚了。', "...We're too late."));
  const girl = E.spawn({ type: 'npc', id: 'nyra_g', sprite: 'bard7', x: 11, y: 6, dir: 'd' });
  await E.wait(20);
  await E.say('？？？', L('……那身灰色的盔甲。', '...That grey armour.'));
  await E.walk(girl, 'dd', 1);
  await E.say('？？？', L('是你們。是你們燒了村子。媽媽……大家……都在火裡……', 'It was you. You burned the village. Mother... everyone... in the fire...'));
  await E.say('海爾', L('等一下，我們不是——', "Wait, we're not—"));
  await E.say('？？？', L('石龜！保護我！', 'Stonebak! Protect me!'));
  E.flash('#ffffff', 20); E.sfx('warp');
  await E.battle('stonebak', { bg: 'burnt', noSpoils: true });
  E.shake(50); E.sfx('quake');
  await E.say(null, L('石龜的力量讓大地裂開了！', "The tortoise's power splits the ground open!"));
  await E.say('布琳', L('海爾——！', 'Hale——!'));
  E.flash('#000000', 20);
  E.leave('brin');
  S.flags.brin_lost = true;
  await E.say('海爾', L('布琳！布琳！！', 'Brin! BRIN!!'));
  await E.say(null, L('布琳掉進了裂縫，看不見了……', 'Brin fell into the chasm and is gone...'));
  await E.say('？？？', L('我……我不是故意的……石龜它……', "I... I didn't mean to... Stonebak just..."));
  E.music('rage');
  const gar = E.spawn({ type: 'npc', id: 'gar_t', sprite: 'soldier6', x: 12, y: 19, dir: 'u' });
  await E.walk(gar, 'uuuuu', 1);
  await E.say('加瑞克', L('還有活口嗎。喚靈師的孩子……還有叛徒海爾。正好，一起收拾。', 'One left alive. A caller child... and Hale the traitor. Good. I\'ll finish you both.'));
  await E.say('海爾', L('加瑞克……這就是你要守護的家人想看到的樣子嗎！', 'Garrick... Is this what your family would want to see!?'));
  await E.say('？？？', L('……我也要打。我不會原諒你們任何一個人。', "...I'll fight too. I won't forgive any of you."));
  E.removeEnt('nyra_g');
  E.join('nyra', 5);
  E.heal(); E.sfx('heal');
  await E.say(null, L('石龜殼上的苔蘚發出微光，海爾的傷口癒合了。', "The moss on the tortoise's shell glows, and Hale's wounds close."));
  await E.battle('garrick', { bg: 'burnt', noRun: true });
  await E.say('加瑞克', L('咳……你還是一樣強啊，海爾……', "Hah... still as strong as ever, Hale..."));
  await E.say('加瑞克', L('聽好……國王已經不是國王了。莫凡在他額頭上……刻了荊之烙印……我們全都……', "Listen... The King is no longer the King. Morvane carved... a thornbrand on his brow... all of us..."));
  await E.say('加瑞克', L('往南走……穿過荊棘林……去文湖……', "Go south... through Thornwood... to Wenmere..."));
  E.removeEnt('gar_t');
  E.music('prelude');
  await E.say('奈菈', L('我叫奈菈。……我不是要跟你走。我要親眼看著，是誰下的命令。', "I'm Nyra. ...I'm not coming with you. I'm coming to see with my own eyes who gave that order."));
  await E.say('海爾', L('……嗯。我也想知道。', "...Yes. So do I."));
  await E.say(null, L('奈菈加入了隊伍！', 'Nyra joined the party!'));
  E.sfx('fanfare');
  S.flags.ch2_nyra = true;
});
def('tb_ghost', async (E) => {
  await E.say('聲音', L('……奈菈……要好好活下去……', '...Nyra... live on...'));
  if (has('nyra')) await E.say('奈菈', L('……媽媽。', '...Mother.'));
});

// ---------- chapter 3: Wenmere ----------
def('w_prioress', async (E) => {
  if (S.flags.tide_dead) { await E.say('院長', L('湖水恢復清澈了。伊索爾德院長的在天之靈，也會安息吧。莫凡的飛空艇往西飛去了，聽說是去沙爾特，那裡有「燼之泉鏡」。', 'The lake runs clear again. Prioress Ysolde can rest now. Morvane\'s airships flew west, toward Salt, where the Ember Lens is kept.')); await E.say('院長', L('往西要先繞到湖的南岸，從乾谷隘道穿過山脈。', 'To go west, go round the south shore of the lake and through Dry Pass in the mountains.')); return; }
  await E.say('院長', L('自從潮之泉鏡被奪走後，湖底的潮龍就發狂了。牠是這座湖的守護者，沒有泉鏡的光，牠痛苦得像被火燒。', 'Since the Tide Lens was taken, the Tidewyrm beneath the lake has gone mad. It is the lake\'s guardian, and without the lens\'s light it burns as if on fire.'));
  await E.say('院長', L('湖中小島上的沉沒神殿，是潮龍的巢。……拜託你們了。', 'The Sunken Shrine on the island in the lake is its den. ...Please, help it.'));
});
def('w_miel', async (E) => {
  if (S.flags.has_miel) return;
  await E.say('蜜兒', L('……灰衛隊長。', '...The Ashguard captain.'));
  await E.say('蜜兒', L('你就是那天的那個人。伊索爾德院長倒下的時候，你就站在那裡。', 'You were the one that day. When Prioress Ysolde fell, you were standing right there.'));
  await E.say('海爾', L('……是我。', '...I was.'));
  await E.say('蜜兒', L('我想打你。我想對你大吼。可是院長最後說的話是「不要恨他們」。……我做不到，但我想試試看。', 'I want to hit you. I want to scream at you. But the last thing the prioress said was "Don\'t hate them." ...I can\'t do that. But I want to try.'));
  await E.say('蜜兒', L('湖裡的潮龍快要撐不住了。我要去沉沒神殿。你們……就來看看自己做了什麼吧。', "The Tidewyrm in the lake won't last much longer. I'm going to the Sunken Shrine. You... come and see what you've done."));
  E.removeEnt('miel_w');
  E.join('miel', 9);
  await E.say(null, L('蜜兒加入了隊伍！', 'Miel joined the party!'));
  E.sfx('fanfare');
  S.flags.has_miel = true;
});
def('w_gowan', async (E) => {
  if (S.flags.has_gowan) return;
  await E.say('高文', L('喔？那把灰燼之劍……你就是瓦恩的灰衛隊長吧。', 'Oh? That Ashbrand... You must be the Ashguard captain of Varn.'));
  await E.say('高文', L('我叫高文，一個老掉牙的魔法師。我在找我以前的徒弟——莫凡。', "My name is Gowan, a doddering old mage. I'm looking for my former apprentice: Morvane."));
  await E.say('奈菈', L('莫凡！？就是那個大臣！', 'Morvane!? The chancellor!'));
  await E.say('高文', L('二十年前，他在瓦恩城底下的古井邊修行，從此就變了一個人。他說井底有人在跟他說話。', "Twenty years ago he trained beside an old well beneath Castle Varn, and after that he was a different man. He said someone at the bottom of the well was talking to him."));
  await E.say('高文', L('我老了，很多魔法都想不起來了。不過帶上我，總比沒有好吧？', "I'm old, and I've forgotten most of my magic. But bringing me along is better than nothing, eh?"));
  E.removeEnt('gowan_w');
  E.join('gowan', 12);
  await E.say(null, L('高文加入了隊伍！', 'Gowan joined the party!'));
  E.sfx('fanfare');
  S.flags.has_gowan = true;
});
def('w_shop', shopTalk('wenmere', () => L('湖邊的商店。想看看什麼？', 'The lakeside shop. What can I get you?')));
def('w_inn', inn(50));
def('w_fisher', async (E) => { await E.say('漁夫', S.flags.tide_dead ? L('魚又回來了！今天的晚餐有著落了。', 'The fish are back! Dinner is sorted tonight.') : L('湖水黑成這樣，船都不敢出了。神殿在湖中央的小島上，從東岸有一座長橋可以走過去。', "With the lake this black, nobody dares take a boat out. The shrine is on the island in the middle; a long bridge runs out to it from the east shore.")); });
def('tidewyrm', async (E) => {
  E.music('rage');
  await E.say(null, L('祭壇前，巨大的水龍痛苦地翻騰著！', 'Before the altar, a vast water dragon thrashes in agony!'));
  if (has('miel')) await E.say('蜜兒', L('潮龍！是我啊！……不行，牠已經聽不見了。', "Tidewyrm! It's me! ...No. It can't hear me anymore."));
  await E.say('高文', L('牠怕雷！奈菈、海爾，讓牠冷靜下來，但不要殺了牠！', "It fears lightning! Nyra, Hale, calm it down, but don't kill it!"));
  await E.battle('tidewyrm', { bg: 'shrine' });
  E.music('sanctuary');
  await E.say(null, L('潮龍安靜下來了。牠低下巨大的頭，望著奈菈。', 'The Tidewyrm grows still. It lowers its huge head and looks at Nyra.'));
  await E.say('奈菈', L('……牠在說，「謝謝」。還有……牠願意借我力量。', '...It\'s saying "thank you". And... it will lend me its strength.'));
  S.calls.push('tide');
  E.sfx('fanfare');
  await E.say(null, L('奈菈能召喚「潮龍」了！', 'Nyra can now call the Tidewyrm!'));
  await E.say('蜜兒', L('……海爾。你剛剛擋在我前面。為什麼？', '...Hale. You stood in front of me just now. Why?'));
  await E.say('海爾', L('我不知道。也許……是想找回一點什麼。', "I don't know. Maybe... I'm trying to win something back."));
  await E.say('蜜兒', L('……回去向院長報告吧。', "...Let's go and tell the prioress."));
});

// ---------- chapter 4: Salt ----------
def('s_king', async (E) => {
  if (S.flags.salt_done) { await E.say('沙爾特王', L('燼之泉鏡被奪走了……。塔爾，就拜託你了。', 'The Ember Lens has been taken... Tal, I leave it to you.')); return; }
  await E.say('沙爾特王', L('瓦恩的騎士？莫凡已經派人來要過三次「燼之泉鏡」了。我的回答都一樣：不給。', 'A knight of Varn? Morvane has sent for the Ember Lens three times. My answer is always the same: no.'));
  await E.say('海爾', L('陛下，莫凡的飛空艇正在往這裡飛來。', "Your Majesty, Morvane's airships are flying this way."));
  await E.say('沙爾特王', L('什麼！？塔爾，加強宮殿的守衛！', 'What!? Tal, double the palace guard!'));
});
def('s_tal', async (E) => {
  if (S.flags.has_tal) return;
  await E.say('塔爾', L('我是塔爾，守護泉鏡的武僧。你就是那個灰衛隊長？聽說你的劍會吸主人的血，真是把怪劍。', "I'm Tal, the monk who guards the lens. You're that Ashguard captain? I hear your sword drinks its owner's blood. Strange blade."));
  E.music('rage');
  E.shake(30); E.sfx('boom');
  await E.say('衛兵', L('敵襲！天上……天上有黑色的飛空艇！', 'We\'re under attack! In the sky... black airships!'));
  E.flash('#ffffff', 16);
  const b = E.spawn({ type: 'npc', id: 'brin_s', sprite: 'soldier3', x: 15, y: 7, dir: 'u' });
  await E.walk(b, 'uu', 1);
  await E.say('海爾', L('布琳！？妳還活著！', 'Brin!? You\'re alive!'));
  await E.say('布琳', L('……泉鏡。交出來。', '...The lens. Hand it over.'));
  await E.say('奈菈', L('她額頭上有紅色的荊棘印記……！', 'There\'s a red thorn mark on her brow...!'));
  await E.say('高文', L('荊之烙印！莫凡用它控制了她的心！', 'A thornbrand! Morvane has bound her mind with it!'));
  await E.battle('brin', { bg: 'desert', noSpoils: false });
  await E.say('布琳', L('……海……爾……', '...Ha...le...'));
  E.shake(20); E.sfx('boom');
  await E.say('莫凡', L('呵呵，做得很好，布琳。泉鏡已經到手了。', 'Heh heh, well done, Brin. The lens is mine.'));
  await E.say(null, L('黑色飛空艇的影子掠過大廳——燼之泉鏡被奪走了！', "The shadow of a black airship sweeps across the hall. The Ember Lens has been taken!"));
  await E.say('高文', L('莫凡！！', 'Morvane!!'));
  E.flash('#a000a0', 24); E.sfx('fire');
  await E.say('莫凡', L('老師，好久不見。您還是一樣囉嗦。', 'Teacher, it has been a long time. You talk too much, as ever.'));
  await E.say(null, L('黑色的火焰擊中了高文！', 'Black flame strikes Gowan!'));
  E.removeEnt('brin_s');
  await E.wait(30);
  E.music('prelude');
  await E.say('高文', L('咳……我這把老骨頭……暫時走不動了。你們先走吧……', "Ugh... these old bones... won't carry me for a while. Go on without me..."));
  E.leave('gowan');
  await E.say('塔爾', L('泉鏡是我的責任。讓我一起去，我要親手把它拿回來。', "The lens was mine to guard. Let me come. I'll take it back with my own hands."));
  E.join('tal', 15);
  await E.say(null, L('塔爾加入了隊伍！', 'Tal joined the party!'));
  E.sfx('fanfare');
  await E.say('奈菈', L('……海爾。你的劍，剛才又吸了你好多血。', "...Hale. Your sword drank so much of your blood just now."));
  await E.say('奈菈', L('荊棘村的「古棘」也許能幫你。牠是村子的守護樹靈，能看見人心。如果是牠……也許能斬斷那把劍的詛咒。', "The Elder Thorn of Thornby might be able to help you. It's the village's guardian tree spirit, and it can see into hearts. If anyone can... it could cut that sword's curse."));
  await E.say('奈菈', L('……我才不是在擔心你。只是你倒下了，就沒人幫我找莫凡算帳了。', "...It's not that I'm worried about you. If you collapse, nobody will help me settle things with Morvane, that's all."));
  S.flags.salt_done = true; S.flags.trial_open = true; S.flags.has_tal = true;
  await E.say(null, L('回到荊棘村，去見古棘吧。', 'Return to Thornby and seek the Elder Thorn.'));
});
def('s_guard', async (E) => { await E.say('衛兵', L('沙爾特位於沙漠的中心。往南走到海岸，就是工匠聚集的紅隼港。', 'Salt lies at the heart of the desert. South, on the coast, is Kestrel, the port of artisans.')); });
def('s_shop', shopTalk('salt', () => L('沙漠商隊帶來的好東西！', 'Fine goods from the desert caravans!')));
def('s_inn', inn(80));
def('s_dancer', async (E) => { await E.say('村民', L('今晚在月下跳舞吧～……可是那輪紅月，總覺得它在看著我們。', 'Shall we dance under the moon tonight~? ...Though that red moon always seems to be watching us.')); });
def('s_trader', async (E) => { await E.say('商人', L('紅隼港的朵琳是個天才工匠，聽說她在造一艘不用帆也能飛的船！', 'Dorrin in Kestrel is a genius artisan. They say she is building a ship that flies without sails!')); });

// ---------- chapter 5: the trial ----------
def('tb_elder', async (E) => { await E.say('聲音', L('……到村子最深處的大樹那裡去吧。古棘在等你。', '...Go to the great tree at the far end of the village. The Elder Thorn awaits you.')); });
def('elder_tree', async (E) => {
  if (!S.flags.trial_open) { await E.say(null, L('村子的守護樹。被火燒焦的枝幹之間，還透著一點綠意。', "The village's guardian tree. Between its scorched branches, a little green remains.")); return; }
  if (S.flags.dawn) { await E.say('古棘', L('……願你手中的光，不再熄滅。', '...May the light in your hands never go out.')); return; }
  E.music('sanctuary');
  await E.say('古棘', L('……灰燼的騎士。你為何而來？', '...Knight of ash. Why have you come?'));
  await E.say('海爾', L('我想放下這把劍。它吸走的東西太多了。', 'I want to lay down this sword. It has taken too much.'));
  await E.say('古棘', L('那就證明給我看。拔劍吧，你的同伴也一起。', 'Then prove it to me. Draw your sword, and your friends with you.'));
  await E.say('奈菈', L('（……海爾，古棘說「證明」。我想牠要看的不是你有多強。）', "(...Hale, the Elder Thorn said 'prove'. I don't think it wants to see how strong you are.)"));
  await E.battle('elder', { bg: 'burnt', music: 'boss', noSpoils: true });
  if (!S.flags.trial_won) S.flags.trial_won = true;
  E.flash('#ffffff', 40); E.sfx('holy');
  await E.say('古棘', L('灰燼之劍會吸取持有者的憎恨與悔恨。而你，在最後選擇了放下。', 'The Ashbrand feeds on its bearer\'s hatred and regret. And at the last, you chose to let them go.'));
  await E.say('古棘', L('這是曙光之劍。它會回應守護的心，而不是憎恨。', 'This is the Dawnblade. It answers a heart that protects, not one that hates.'));
  S.flags.dawn = true;
  const h = member('hale');
  if (h) { h.equip.weapon = 'dawnblade'; const s = stats(h); h.mp = s.maxmp; h.hp = s.maxhp; }
  E.sfx('fanfare');
  await E.say(null, L('海爾成為了「曙光騎士」！\n可以使用白魔法和「掩護」了。', 'Hale became a Dawn Knight!\nHe can now use White magic and Cover.'));
  S.calls.push('elder');
  await E.say(null, L('奈菈能召喚「古棘」了！', 'Nyra can now call the Elder Thorn!'));
  await E.say('奈菈', L('……那天燒了村子的人不是你。我早就知道了。只是，我需要一個可以恨的人。', "...It wasn't you who burned the village that day. I knew that already. I just needed someone to hate."));
  await E.say('奈菈', L('謝謝你沒有逃。', "Thank you for not running away."));
  await E.say('塔爾', L('好了，接下來去紅隼港吧。如果傳說是真的，那個叫朵琳的工匠能造出飛上天的船。', "Right. Next, Kestrel. If the stories are true, that artisan Dorrin can build a ship that flies."));
  S.flags.trial_done = true;
});

// ---------- chapter 6: Kestrel ----------
def('k_dorrin', async (E) => {
  if (S.flags.has_dorrin) return;
  await E.say('朵琳', L('喂喂，別碰那個齒輪！……什麼，你們想借我的船？', "Hey, hey, don't touch that gear! ...What, you want to borrow my ship?"));
  await E.say('朵琳', L('「鷦鷯號」還差最後一步。它的心臟要用我老爸留下的「風之泉鏡」——那是全世界最後一枚還沒被搶走的泉鏡。', "The Wren needs one last thing. Its heart has to be the Wind Lens my old man left me: the last lens in the world that hasn't been stolen."));
  E.music('rage'); E.shake(30); E.sfx('boom');
  await E.say('水手', L('不好了！灰衛隊的人帶著一個鐵巨人闖進碼頭了！', "Trouble! The Ashguard just broke into the docks with an iron giant!"));
  await E.say('朵琳', L('那是我設計圖被偷走後造出來的東西……！我自己的作品，我自己收拾！', "That thing was built from my stolen blueprints...! My own work. I'll clean it up myself!"));
  E.join('dorrin', 18);
  await E.say(null, L('朵琳加入了隊伍！', 'Dorrin joined the party!'));
  await E.battle('golem', { bg: 'castle' });
  E.music('airship');
  await E.say('朵琳', L('哼，設計是我的，弱點當然也是我最清楚。', "Hmph. My design, so of course I know its weak spot best."));
  await E.say('朵琳', L('好，把風之泉鏡裝上去……「鷦鷯號」，起飛！', "Right, in goes the Wind Lens... Wren, lift off!"));
  E.give('windlens');
  S.flags.has_dorrin = true; S.flags.airship = true;
  S.ship = { map: 'world', x: 10, y: 41 };
  E.sfx('fanfare');
  await E.say(null, L('得到了飛空艇「鷦鷯號」！\n走上船就能起飛，在空中按 Z 降落。', 'You got the airship Wren!\nStep onto it to take off; press Z in the air to land.'));
  await E.say('塔爾', L('莫凡的據點，聽說是東南外海孤島上的「荊棘高塔」。布琳一定也在那裡。', "Morvane's stronghold is said to be the Thorn Spire, on a lone island off the south-east coast. Brin must be there too."));
});
def('k_shop', shopTalk('kestrel', () => L('港口的工匠打造的裝備，品質保證！', 'Gear forged by the port\'s artisans. Quality guaranteed!')));
def('k_inn', inn(120));
def('k_sailor', async (E) => { await E.say('水手', S.flags.airship ? L('真的飛起來了……！朵琳那傢伙，從小就說要飛到燼月上面去。', "It really flies...! Ever since she was little, Dorrin's said she would fly up to the Ember.") : L('朵琳的工坊就在廣場旁邊。她脾氣不太好，但人很好喔。', "Dorrin's workshop is by the square. Bit of a temper, but a good heart.")); });

// ---------- chapter 7: the Thorn Spire ----------
def('brin_cap', async (E) => { await E.say('布琳', L('……', '...')); });
def('warden', async (E) => {
  E.music('villain');
  await E.say('海爾', L('布琳！', 'Brin!'));
  await E.say('莫凡', L('歡迎，曙光騎士。還特地把最後一枚泉鏡送上門來，真是辛苦你了。', 'Welcome, Dawn Knight. And you brought the last lens right to my door. How kind.'));
  await E.say('莫凡', L('荊之守衛，讓他們嚐嚐荊棘的滋味。', 'Thorn Warden. Let them taste the thorns.'));
  await E.battle('warden', { bg: 'tower' });
  E.music('rage');
  await E.say('莫凡', L('沒用的東西。……也罷。', 'Useless thing. ...No matter.'));
  E.flash('#a000a0', 20); E.sfx('drain');
  await E.say(null, L('荊棘纏住了朵琳！風之泉鏡被奪走了！', 'Thorns bind Dorrin! The Wind Lens is torn away!'));
  E.give('windlens', -1);
  await E.say('朵琳', L('還給我！那是老爸的……！', "Give it back! That's my dad's...!"));
  await E.say('莫凡', L('四枚泉鏡都到齊了。燼井的封印，今晚就會解開。', 'All four lenses are mine. The seal on the Starwell breaks tonight.'));
  E.flash('#ffffff', 30); E.sfx('warp');
  const g = E.spawn({ type: 'npc', id: 'gowan_sp', sprite: 'conjurer2', x: 10, y: 8, dir: 'u' });
  await E.say('高文', L('莫凡！！', 'Morvane!!'));
  await E.say('奈菈', L('高文爺爺！？你的傷……', 'Grandpa Gowan!? Your wounds...'));
  await E.say('高文', L('躺了這麼久，總算想起來了。我年輕時禁止自己使用的魔法……', "Lying abed this long, I finally remembered. The spell I forbade myself when I was young..."));
  await E.say('高文', L('「星墜」！！', '"Starfall"!!'));
  E.flash('#ffffff', 40); E.shake(60); E.sfx('boom');
  await E.wait(30);
  E.sfx('boom');
  await E.say('莫凡', L('老……老頭子……！哼，燼井見吧！', 'You... old man...! Hmph. We\'ll meet at the Starwell!'));
  await E.say(null, L('莫凡帶著泉鏡消失了。塔開始崩塌！', 'Morvane vanishes with the lenses. The tower begins to collapse!'));
  E.shake(80); E.sfx('quake');
  await E.say('布琳', L('……我……這裡是……？海爾？', '...I... where...? Hale?'));
  await E.say('高文', L('星墜把烙印也一起燒掉了。快走！塔要塌了，我來撐住！', 'The Starfall burned away the brand as well. Go! The tower is falling. I\'ll hold it up!'));
  await E.say('海爾', L('高文，你也一起——', 'Gowan, come with—'));
  await E.say('高文', L('傻小子。老人總要做點老人才做得到的事。', "Foolish boy. An old man has to do the things only an old man can."));
  await E.say('高文', L('奈菈、蜜兒，還有海爾……阻止莫凡。那孩子……曾經是個好孩子啊。', "Nyra, Miel, and Hale... stop Morvane. That boy... was a good boy, once."));
  E.music('prelude');
  await E.fadeOut();
  E.removeEnt('gowan_sp'); E.removeEnt('brin_cap');
  S.flags.spire_done = true; S.flags.bridge_open = true; S.flags.gowan_gone = true;
  E.join('brin', 24);
  await E.warp('world', 55, 43, 'u', true);
  await E.say(null, L('高塔崩塌了。高文沒有回來。', 'The tower fell. Gowan did not come back.'));
  await E.say('布琳', L('……對不起。我做了很多……很多不可原諒的事。', "...I'm sorry. I did so many... so many unforgivable things."));
  await E.say('海爾', L('我也一樣。所以，我們一起去還吧。', 'So did I. So let\'s go and make them right, together.'));
  await E.say(null, L('布琳回到了隊伍！\n（隊伍最多五人，可以在選單的「隊伍」更換成員。）', "Brin is back!\n(Up to five can fight; swap members with Party in the menu.)"));
  E.sfx('fanfare');
  await E.say('朵琳', L('莫凡要去燼井——瓦恩城的正下方。上船吧，直接飛過去！', "Morvane is going to the Starwell, right under Castle Varn. Get on board, we'll fly straight there!"));
});

// ---------- chapter 8: the Starwell ----------
def('morvane_final', async (E) => {
  E.music('villain');
  await E.say('莫凡', L('來了啊，海爾。看，四枚泉鏡已經嵌進井壁了。', "So you came, Hale. Look: the four lenses are set into the walls of the well."));
  await E.say('莫凡', L('二十年前，我在這口井邊聽見了祂的聲音。祂說，只要讓祂回到天上，我就能永遠不死，永遠不被遺忘。', 'Twenty years ago, beside this well, I heard its voice. It said that if I helped it back into the sky, I would never die, and never be forgotten.'));
  await E.say('布琳', L('所以你就控制國王、燒了村子、利用了所有人？', 'So you took the King, burned a village, and used everyone?'));
  await E.say('莫凡', L('被遺忘的人，就跟死了一樣。我那位老師就是。誰還記得高文？', 'To be forgotten is to be dead. Like my teacher. Who remembers Gowan?'));
  await E.say('奈菈', L('我們記得！！', 'WE remember!!'));
  await E.battle('morvane', { bg: 'well', noRun: true });
  E.shake(60); E.sfx('quake');
  await E.say('莫凡', L('不……燼月……大人……我還……', 'No... my lord Ember... I still...'));
  await E.say('燼月', L('……沒用的容器。', '...A useless vessel.'));
  E.flash('#f83800', 40); E.sfx('fire');
  await E.say(null, L('莫凡被火焰吞沒了。井底，巨大的紅光睜開了眼睛。', 'Morvane is swallowed by flame. At the bottom of the well, a vast red light opens its eyes.'));
  await E.say('燼月', L('小小的光啊。我燃燒了一萬年，只為了回到天上。你們要擋在我面前嗎？', 'Little lights. I have burned for ten thousand years only to return to the sky. Will you stand in my way?'));
  await E.say('海爾', L('曾經，我的劍也只會燃燒。但現在不同了。', 'Once, my sword knew only how to burn. Not anymore.'));
  await E.say('海爾', L('這把劍，是為了守護而揮的！', 'This sword is swung to protect!'));
  await E.battle('ember', { bg: 'well', noRun: true, music: 'potentiam' });
  await E.emberFalls();
});
