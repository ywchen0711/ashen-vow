// Part II, "The Hush": eight new chapters, an episode for every friend, side stories and the
// Starwell Abyss after the end. Chinese and English, like story.js.
import { L } from './i18n.js';
import { S, member, stats, addItem, fullHeal } from './party.js';
import { ITEMS, SHOPS, nm } from './data.js';
import { SCRIPTS } from './story.js';
import { MAPS } from './maps.js';
import { entryOf } from './maps2.js';

const def = (id, f) => { SCRIPTS[id] = f; };
const has = (id) => S.members.some((m) => m.id === id);
const F_ = () => S.flags;
// make sure a friend is in the fighting party for their own story
function ensure(id) {
  const m = member(id);
  if (!m || S.members.includes(m)) return;
  const out = [...S.members].reverse().find((x) => !['hale', 'ilse', id].includes(x.id)) || S.members[S.members.length - 1];
  const i = S.members.indexOf(out), j = S.reserve.indexOf(m);
  S.members[i] = m; S.reserve[j] = out;
  if (m.hp <= 0) m.hp = 1;
}
const inn = (price) => async (E) => {
  const r = await E.ask('旅店老闆', L(`歡迎！住一晚 ${price} 金幣。`, `Welcome! A night is ${price} gold.`), [L('住宿', 'Stay'), L('不用了', 'No thanks')]);
  if (r !== 0) return;
  if (S.gold < price) { await E.say('旅店老闆', L('……錢好像不太夠呢。', "...You don't seem to have enough.")); return; }
  S.gold -= price;
  await E.rest(L('早安！路上小心。', 'Good morning! Take care.'), '旅店老闆');
};
const shop = (list, line) => async (E) => { await E.say('商人', line()); await E.shop(SHOPS[list]); };
// wrap a Part I script with a Part II version
const p2wrap = (id, f) => { const orig = SCRIPTS[id]; def(id, async (E, e) => { if (S.flags.p2 && (await f(E, e)) !== false) return; if (orig) await orig(E, e); }); };

// ---------- where to go next (the King, Ilse and the inns all know) ----------
export function hint() {
  const f = F_();
  if (!f.p2_tide) return L('把潮之泉鏡送回文湖湖心的沉沒神殿。神殿深處出現了往下的階梯。', 'Take the Tide Lens back to the Sunken Shrine in Lake Wenmere. Stairs have opened in its depths.');
  if (!f.p2_root) return L('根之泉鏡屬於荊棘村。去村子最深處的古棘那裡吧。', 'The Root Lens belongs to Thornby. Go to the Elder Thorn at the far end of the village.');
  if (!f.p2_sigil) return L('燼之泉鏡要回到沙爾特。先去見沙爾特王。', 'The Ember Lens goes home to Salt. See the King of Salt first.');
  if (!f.p2_ember) return L('陽炎神殿在沙爾特西方的沙漠裡（世界地圖左側）。', 'The Sunfire Temple lies in the desert west of Salt.');
  if (!f.p2_gwopen) return L('紅隼港的老鐵匠霍伯也許知道柯溫的工坊在哪裡。', 'Old Hob, the smith in Kestrel, may know where Corwin\'s workshop is.');
  if (!f.p2_wind) return L('齒輪工坊在東南外海的燼落島上。', 'The Gearworks is on Emberfall, the burning isle out in the south-east sea.');
  if (!f.p2_brin) return L('荊誓兵占領了北方的灰岩堡。去奪回來吧。', 'The Thornsworn have taken Grayhold in the north. Win it back.');
  if (!f.p2_hale) return L('瓦恩城東側房間的樓梯通往舊兵營。', 'The stairs in the east room of Castle Varn lead down to the old barracks.');
  if (!f.p2_sky) return L('在飛空艇上按 X 飛上雲海，到天棧找長老，再去風暴巨鵬之巢。', 'Press X aboard the Wren to climb to the Cloud Sea. Find the elder in Skyreach, then the Stormroc\'s Aerie.');
  if (!f.p2_belltoll) return L('灰霧散開了。去東北群島的鐘鳴村吧。', 'The mist has parted. Go to Belltoll in the north-east isles.');
  if (!f.p2_bell) return L('鐘鳴村北邊的鐘樓。讓大鐘再響一次。', 'The Bell Tower north of Belltoll. Make the Great Bell ring again.');
  if (!f.p2_end) return L('蒼白高塔從鐘鳴村南邊的海中升起了。', 'The Pale Spire has risen from the sea south of Belltoll.');
  return L('燼井的底下，好像還有路通往更深的地方……', 'There seems to be a way down, even deeper, at the bottom of the Starwell...');
}

// =====================================================================================
// Chapter 9: After the Ashes
// =====================================================================================
def('part2_begin', async (E) => {
  S.flags.p2 = true;
  E.heal();
  await E.warp('varncastle', 12, 6, 'u', true);
  E.removeEnt('maid'); E.removeEnt('castle_guard');
  const maid = E.spawn({ type: 'npc', id: 'p2maid', sprite: 'mychars5', x: 9, y: 6, dir: 'r' });
  E.spawn({ type: 'npc', id: 'p2guard', sprite: 'soldier0', x: 15, y: 6, dir: 'l' });
  E.music('empire');
  await E.say(null, L('第二部　寂靜之心\n\n三天後，瓦恩城。', 'Part II: The Hush\n\nThree days later. Castle Varn.'));
  await E.say('亞爾多斯王', L('今晚是慶功宴。城裡每一盞燈都點亮了……很久沒有這麼亮了。', 'Tonight we feast. Every lamp in the castle is lit... It has not been this bright in a long time.'));
  if (has('tal')) await E.say('塔爾', L('陛下，我們從燼井的井壁上取回了四枚泉鏡。可是……您看。', 'Your Majesty, we took the four lenses back from the walls of the Starwell. But... look.'));
  await E.say(null, L('四枚泉鏡都失去了光芒，像普通的石頭一樣灰暗。', 'All four lenses have lost their light. They are as grey as common stones.'));
  for (const k of ['tidelens', 'rootlens', 'emberlens', 'windlens']) if (!S.inv[k]) addItem(k);
  E.sfx('chest');
  await E.say(null, L('得到了四枚泉鏡：潮、根、燼、風。', 'You have the four lenses: Tide, Root, Ember and Wind.'));
  if (has('dorrin')) await E.say('朵琳', L('風之泉鏡拔出來以後，鷦鷯號還飛得起來，是靠我臨時裝的備用引擎。撐不了多久的喔。', 'With the Wind Lens out, the Wren only flies on a spare engine I rigged. It won\'t last forever.'));
  await E.wait(30);
  await E.walk(maid, 'rr', 1);
  await E.say('侍女', L('海爾大人，請用……咦？', 'Sir Hale, please, have some... Huh?'));
  await E.say('侍女', L('對不起，我……我叫什麼名字來著？我明明在這裡工作了十年……', 'I\'m sorry, I... what is my name? I\'ve worked here ten years...'));
  await E.say('衛兵', L('我……我在守衛誰？這裡是……哪裡？', 'Who... who am I guarding? Where... is this?'));
  E.music('deities');
  await E.flash('#c0c0d0', 30);
  await E.say(null, L('灰色的霧從窗縫裡湧進來。燈火一盞接一盞地暗了下去。', 'A grey mist seeps in through the windows. The lamps dim, one after another.'));
  await E.wait(20);
  E.sfx('save');
  await E.say('？？？', L('不要聽那片寂靜！抓住你們的名字！', 'Don\'t listen to the quiet! Hold on to your names!'));
  const ilse = E.spawn({ type: 'npc', id: 'ilse_c', sprite: 'bluegirl', x: 12, y: 11, dir: 'u' });
  await E.walk(ilse, 'uu', 1);
  E.sfx('save'); await E.flash('#ffffff', 16); E.sfx('save');
  await E.say(null, L('清脆的鈴聲響起。霧氣像被風吹散一樣退去了。', 'A clear bell rings out. The mist draws back as if a wind had blown it away.'));
  await E.say('侍女', L('……瑪莉。我叫瑪莉！我想起來了！', '...Mary. My name is Mary! I remember!'));
  E.music('sanctuary');
  await E.say('？？？', L('還好趕上了。我叫伊爾賽，是北方灰霧群島「鐘鳴村」的記名師。', 'Just in time. My name is Ilse. I\'m a Namekeeper, from Belltoll in the grey isles of the north.'));
  await E.say('海爾', L('記名師？剛才那片霧是什麼？', 'A Namekeeper? What was that mist?'));
  await E.say('伊爾賽', L('很久很久以前，一顆星星墜落在這片大地上，碎成了兩顆「心」。一顆是燃燒的心——你們剛剛熄滅的燼月。', 'Long, long ago, a star fell on this land and broke into two hearts. One was a burning heart: the Ember you have just put out.'));
  await E.say('伊爾賽', L('另一顆是冰冷的心，我們叫它「寂靜之心」。它不燒東西。它吃掉名字，吃掉記憶，讓一切變得安靜。', 'The other is a cold heart. We call it the Hush. It burns nothing. It eats names, and memories, and makes everything quiet.'));
  await E.say('伊爾賽', L('兩顆心互相拉扯，才一起睡了幾千年。燼月熄滅以後，天秤倒向了另一邊……寂靜之心醒了。', 'The two hearts pulled against each other, and so they slept for thousands of years. With the Ember gone, the scales have tipped... and the Hush is waking.'));
  if (has('nyra')) await E.say('奈菈', L('所以……我們封印了燼月，反而把另一個東西叫醒了？', 'So... by sealing the Ember, we woke up something else?'));
  await E.say('伊爾賽', L('你們做的沒有錯。燼月不封印，整片大地都會燒成灰。只是，事情還沒結束。', 'You did nothing wrong. Without the seal, the whole land would have burned to ash. It just isn\'t over yet.'));
  await E.say('伊爾賽', L('泉鏡會變暗，是因為它們離開了自己的家。把每一枚送回原本的祭壇，讓它重新亮起來，寂靜就會退回去。', 'The lenses went dark because they were taken from their homes. Bring each one back to its own altar and wake it, and the Hush will draw back.'));
  await E.say('伊爾賽', L('還有……一年前，一個沒有名字的男人來到了鐘鳴村。從那天起，村裡的人一個接一個忘記了自己是誰。我是唯一逃出來的人。', 'And... a year ago a man with no name came to Belltoll. From that day, one by one, the people there forgot who they were. I\'m the only one who got away.'));
  await E.say('海爾', L('……一個人忘記自己做過什麼，是不是比較輕鬆？', '...Would it be easier, I wonder, to forget the things you\'ve done?'));
  await E.say('伊爾賽', L('也許吧。可是那樣的話，你就再也沒有機會彌補了。', 'Maybe. But then you would never get the chance to make them right.'));
  if (has('miel')) await E.say('蜜兒', L('……先從潮之泉鏡開始吧。文湖，是我的家。', '...Let\'s start with the Tide Lens. Wenmere is my home.'));
  E.removeEnt('ilse_c');
  E.join('ilse', 30);
  ensure('ilse');
  E.give('namebell');
  await E.say(null, L('伊爾賽加入了隊伍！\n（戰鬥最多五人，可以在選單的「隊伍」裡更換。）', 'Ilse joined the party!\n(Up to five can fight; swap members with Party in the menu.)'));
  E.sfx('fanfare');
  E.removeEnt('p2maid'); E.removeEnt('p2guard');
  S.flags.p2_ilse = true;
  E.setShip('world', 23, 16);
  await E.say(null, L('新的旅程開始了。\n選單裡多了「圖鑑」。伊爾賽的「解讀」可以看穿魔物的弱點。', 'A new journey begins.\nThe menu now has a Bestiary, and Ilse can Read a monster to learn its weaknesses.'));
  E.music('empire');
});

// the King points the way in Part II
p2wrap('king', async (E) => {
  if (!S.flags.king_freed) return false;
  await E.say('亞爾多斯王', hint());
  if (S.flags.p2_brin && !S.flags.p2_hale) await E.say('亞爾多斯王', L('舊兵營的鑰匙在我這裡……不，門已經為你開了。那是灰衛隊的地方，也是你的。', 'The key to the old barracks is mine... no, the door is already open for you. It was the Ashguard\'s place, and yours.'));
  if (S.flags.cleared) await E.say('亞爾多斯王', L('城門前的石碑，每天都有人去讀。', 'Every day, someone goes to read the stone before the gate.'));
});
p2wrap('c_maid', async (E) => { await E.say('侍女', S.flags.p2_end ? L('瑪莉，我叫瑪莉。我每天早上都對著鏡子說一次。', 'Mary. My name is Mary. I say it to the mirror every morning.') : L('我叫瑪莉。……謝謝那位北方來的小姐。我把名字寫在手上了。', 'I\'m Mary. ...Thanks to that girl from the north. I\'ve written my name on my hand.')); });
p2wrap('c_guard', async (E) => { await E.say('衛兵', S.flags.p2_brin && !S.flags.p2_hale ? L('東邊房間的樓梯下面，是灰衛隊的舊兵營。最近半夜會傳出點名的聲音……', 'Below the stairs in the east room are the Ashguard\'s old barracks. Lately, at midnight, you can hear a roll being called...') : L('灰霧來的時候，記得大聲叫自己的名字。這是國王的命令。', 'When the grey mist comes, say your own name out loud. King\'s orders.')); });
p2wrap('c_yard', async (E) => { await E.say('衛兵', L('紅色的月亮不見了，可是天上的白月亮，最近看起來好冷。', 'The red moon is gone, but lately the white moon looks so cold.')); });
p2wrap('c_gardener', async (E) => { await E.say('老人', L('我在城門前種了花。等這一切結束，要在旁邊立一塊石碑。', 'I planted flowers by the gate. When all this is over, there should be a stone beside them.')); });

// ---------- Varn town in Part II ----------
p2wrap('v_shop', async (E) => { await E.say('商人', L('最近大家都在買「醒鈴」。叮一聲，就想起來了。', 'Everyone\'s buying Waking Bells lately. Ding, and it comes back to you.')); await E.shop(SHOPS.p2varn); });
p2wrap('v_child', async (E) => { await E.say('小孩', L('媽媽每天晚上都問我叫什麼名字。我已經答了好多次了！', 'Every night Mum asks me my name. I\'ve answered so many times!')); });
p2wrap('v_old', async (E) => { await E.say('老人', L('苔道洞窟最近有人進去採蘑菇。那個瑪拉的丈夫也去了……', 'Folk have been going into Mossway for mushrooms lately. Mara\'s husband went too...')); });
p2wrap('v_soldier', async (E) => { await E.say('士兵', L('東邊的大橋開了。商人們說南方的海上，有一座長滿蘆葦的城鎮。', 'The great bridge east is open. Merchants say there\'s a town of reeds out on the southern sea.')); });
def('v_mara', async (E) => {
  const f = F_();
  if (f.sq_ring_done) { await E.say('瑪拉', L('戒指一直戴著喔。我先生說，他再也不會弄丟了。', 'I wear the ring always. My husband says he\'ll never lose it again.')); return; }
  if (S.inv.weddingring) {
    E.give('weddingring', -1); f.sq_ring_done = true; S.gold += 3000; E.give('quickdraught', 3); E.sfx('chest');
    await E.say('瑪拉', L('這是……我的戒指！他在洞窟裡忘了自己是誰的時候，把它掉了。他回來後什麼都想起來了，就是一直在哭，說找不到戒指。', 'This is... my ring! He dropped it in the cave when he forgot who he was. He came home remembering everything, but he kept crying that he\'d lost the ring.'));
    await E.say('瑪拉', L('謝謝你們。這是一點心意。', 'Thank you. Please, take this.'));
    await E.say(null, L('得到了 3000 金幣和三瓶「疾風藥」！', 'Received 3000 gold and three Swift Draughts!'));
    return;
  }
  f.sq_ring = true;
  await E.say('瑪拉', L('我先生前陣子在苔道洞窟裡迷路了，被灰霧弄得連自己是誰都忘了。人是回來了，可是我們的婚戒，掉在洞窟深處……', 'My husband got lost in Mossway Cave. The grey mist made him forget who he was. He came home, but our wedding ring fell somewhere deep in the cave...'));
  await E.say('瑪拉', L('如果你們經過苔道洞窟，可以幫我找找嗎？', 'If you pass through Mossway, could you look for it?'));
});
MAPS.varn.extra = (f) => (f.p2 ? [{ id: 'v_mara', sprite: 'bard4', x: 6, y: 7, dir: 'd', talk: 'v_mara' }] : []);
// =====================================================================================
// Chapter 9b: the Drowned Cloister (Miel)
// =====================================================================================
p2wrap('w_prioress', async (E) => {
  if (S.flags.p2_tide) { await E.say('院長', L('湖水又清了。蜜兒，伊索爾德院長一定以妳為榮。', 'The lake runs clear again. Miel, Prioress Ysolde would be proud of you.')); await E.say('院長', hint()); return; }
  await E.say('院長', L('湖水又變灰了……修女們說，晚上會看到伊索爾德院長在湖面上走。', 'The lake has gone grey again... The sisters say they see Prioress Ysolde walking on the water at night.'));
  await E.say('院長', L('沉沒神殿的祭壇旁邊，出現了往下的階梯。泉鏡原本的家，在神殿下面的「淹沒迴廊」。', 'Beside the altar in the Sunken Shrine, a stair has opened downward. The lens\'s true home is below the shrine, in the Drowned Cloister.'));
  if (has('miel')) await E.say('蜜兒', L('……院長她，還在等著什麼嗎？', '...Is the prioress still waiting for something?'));
  S.flags.p2_shrine = true;
});
p2wrap('w_fisher', async (E) => { await E.say('漁夫', S.flags.p2_tide ? L('湖又亮了！伊索爾德院長以前常常坐在那邊的石頭上看我們撒網。', 'The lake shines again! Prioress Ysolde used to sit on that rock and watch us cast our nets.') : L('湖水又灰了。我女兒說她在找什麼「湖之珍珠」。', 'The lake\'s gone grey again. My daughter keeps talking about some "lake pearl".')); });
def('w_girl', async (E) => {
  const f = F_();
  if (f.sq_pearl_done) { await E.say('女孩', L('珍珠我放在院長的墓前了。院長以前說，湖會記得每一個人。', 'I put the pearl on the prioress\'s grave. She used to say the lake remembers everyone.')); return; }
  if (S.inv.lakepearl) { E.give('lakepearl', -1); f.sq_pearl_done = true; E.give('tideguard'); E.sfx('chest'); await E.say('女孩', L('是湖之珍珠！院長說過，湖底的迴廊裡藏著一顆，是她小時候放進去的。謝謝你們！這個給你們。', 'The lake pearl! The prioress said she hid one in the cloister under the lake when she was little. Thank you! Take this.')); await E.say(null, L('得到了「潮之護符」！', 'Received the Tide Ward!')); return; }
  f.sq_pearl = true;
  await E.say('女孩', L('伊索爾德院長說，湖底的迴廊裡藏著一顆珍珠，是她小時候放進去的。我想把它放在院長的墓前……可是我不敢下去。', 'Prioress Ysolde told me a pearl is hidden in the cloister under the lake. She put it there as a girl. I want to lay it on her grave... but I\'m scared to go down.'));
});
def('w_archivist', async (E) => {
  if (!S.flags.archivist_met) { S.flags.archivist_met = true; await E.say('學者', L('我在編一本魔物的圖鑑。灰霧讓好多奇怪的東西冒出來了……你們在旅途中打倒的魔物，都會記在選單的「圖鑑」裡。', 'I\'m compiling a bestiary. The grey mist has stirred up so many strange creatures... Every monster you defeat is recorded in the Bestiary in your menu.')); }
  await E.beastPrizes();
});
MAPS.wenmere.extra = (f) => (f.p2 ? [{ id: 'w_archivist', sprite: 'conjurer3', x: 4, y: 13, dir: 'd', talk: 'w_archivist' }, { id: 'w_girl', sprite: 'bard3', x: 8, y: 17, dir: 'd', talk: 'w_girl', wander: true }] : []);

def('cl_memory', async (E) => {
  ensure('miel');
  await E.say('蜜兒', L('這裡……院長小時候，就是在這片湖裡學會游泳的。後來她也這樣教我。', 'Here... this is the lake where the prioress learned to swim as a girl. Later she taught me the same way.'));
  await E.say('蜜兒', L('她說，被水抱住的時候，不要掙扎，要相信它。……我那天，好想相信些什麼。', 'She said, when the water holds you, don\'t fight it; trust it. ...That day, I wanted so badly to trust something.'));
  await E.say('伊爾賽', L('寂靜之心最喜歡悲傷。悲傷越深，它就越容易把人的記憶拿走，留下空殼。', 'The Hush loves grief most of all. The deeper the grief, the easier it is to take someone\'s memories and leave an empty shell.'));
  await E.say('海爾', L('……如果迴廊深處的是院長，那是我造成的悲傷。這一次，我會站在前面。', '...If the prioress is waiting down there, that grief is mine. This time I will stand in front.'));
});
def('cl_prioress', async (E) => {
  ensure('miel');
  E.music('villain');
  await E.say(null, L('祭壇前，站著一個蒼白的身影。她的臉像被水洗過的畫，看不清楚。', 'Before the altar stands a pale figure. Her face is like a painting the water has washed away.'));
  await E.say('蜜兒', L('院長……！', 'Prioress...!'));
  await E.say('蒼白院長', L('……不要……恨……不要……', '...don\'t... hate... don\'t...'));
  await E.say('伊爾賽', L('那不是她本人！是寂靜之心用她的悲傷做成的空殼。只剩下最後一句話在重複……', 'That isn\'t really her! It\'s a shell the Hush made out of her grief. Only her last words are left, repeating...'));
  await E.say('蜜兒', L('我知道。……所以，我要讓她好好說完。', 'I know. ...So I\'m going to let her finish.'));
  await E.battle('prioress', { bg: 'cloister', noRun: true });
  E.music('sanctuary');
  await E.say(null, L('蒼白的身影慢慢變透明了。潮之泉鏡在祭壇上發出了藍色的光。', 'The pale figure slowly turns clear. On the altar, the Tide Lens begins to glow blue.'));
  await E.say('伊索爾德', L('……蜜兒。妳長大了。', '...Miel. You\'ve grown.'));
  await E.say('蜜兒', L('院長！', 'Prioress!'));
  await E.say('伊索爾德', L('那天我說「不要恨他們」。其實我還有半句話，來不及說完。', 'That day I told you, "Don\'t hate them." There was half a sentence more I never got to say.'));
  await E.say('伊索爾德', L('「也不要恨妳自己。」妳沒能救我，那不是妳的錯。', '"And don\'t hate yourself." You couldn\'t save me. That was never your fault.'));
  await E.say('伊索爾德', L('灰衛隊長。……你還在揮劍嗎？', 'Captain of the Ashguard. ...Do you still swing your sword?'));
  await E.say('海爾', L('是的。現在，是為了守護而揮。', 'I do. Now I swing it to protect.'));
  await E.say('伊索爾德', L('那就好。湖會記得每一個人……也會記得你們。', 'Then that is enough. The lake remembers everyone... and it will remember you.'));
  await E.flash('#a0e0ff', 30);
  E.give('tidelens', -1);
  S.flags.p2_tide = true;
  E.sfx('fanfare');
  await E.say(null, L('潮之泉鏡回到了它的家，重新亮了起來！\n蜜兒學會了伊索爾德院長的祈禱「聖域」！', 'The Tide Lens is home and shines again!\nMiel learned Prioress Ysolde\'s prayer: Sanctuary!'));
  await E.say('蜜兒', L('……海爾。我們一起往前走吧。不是原諒，是一起。', '...Hale. Let\'s go on together. Not forgiveness. Together.'));
  await E.say('伊爾賽', L('一枚了。下一枚是根之泉鏡，屬於荊棘村。', 'One. The next is the Root Lens. It belongs to Thornby.'));
  await E.warp('shrine', 11, 3, 'd');
});

// =====================================================================================
// Chapter 10: Roots of Thornby (Nyra)
// =====================================================================================
p2wrap('elder_tree', async (E) => {
  if (!S.flags.p2_tide) { await E.say('古棘', L('……先讓湖安靜下來吧。根，會等你們。', '...Let the lake grow quiet first. The roots will wait for you.')); return; }
  if (S.flags.p2_root) { await E.say('古棘', L('根之泉鏡又在我的心裡跳動了。去吧，曙光騎士。', 'The Root Lens beats in my heart again. Go, Dawn Knight.')); return; }
  E.music('sanctuary');
  await E.say('古棘', L('……奈菈。妳帶著根之泉鏡回來了。', '...Nyra. You have brought the Root Lens home.'));
  await E.say('古棘', L('它的家在我根的最深處。那裡有一個你們認識的人在等著……他忘了自己是誰，卻還記得火。', 'Its home is at the very bottom of my roots. Someone you know waits there... He has forgotten who he is, but he still remembers fire.'));
  await E.say(null, L('大樹的根之間，裂開了一道通往地底的縫隙。', 'Between the great tree\'s roots, a crack opens into the earth.'));
  await E.warp('rootdeep1', ...entryOf('rootdeep1'), 'u');
});
p2wrap('tb_ghost', async (E) => { await E.say('聲音', L('……奈菈……妳交到朋友了呢……', '...Nyra... you\'ve made friends...')); });
def('tb_builder', async (E) => { await E.say('村民', S.flags.p2_root ? L('古棘發新芽了！今年春天，一定會開好多花。', 'The Elder Thorn has new buds! There\'ll be so many flowers this spring.') : L('我們回來重建村子了。房子會蓋好的，只是……有些名字，再也蓋不回來了。', 'We\'ve come back to rebuild. The houses will stand again. But... some names can\'t be built back.')); });
def('tb_farmer', async (E) => {
  const f = F_();
  if (f.mycel_dead && !f.sq_mycel_done) { f.sq_mycel_done = true; S.gold += 5000; E.give('m_root', 3); E.sfx('chest'); await E.say('農夫', L('菌母安靜下來了？太好了！新苗又長出來了。這是謝禮。', 'Mother Mycel has settled? Wonderful! The seedlings are growing again. Here\'s a thank-you.')); await E.say(null, L('得到了 5000 金幣和三個「古根」！', 'Received 5000 gold and three Old Roots!')); return; }
  if (f.sq_mycel_done) { await E.say('農夫', L('今年的收成一定很好。', 'It\'ll be a fine harvest this year.')); return; }
  f.sq_mycel = true;
  await E.say('農夫', L('根底下面有一隻「菌母」，牠的孢子一直冒上來，把新種的苗都悶死了。如果你們下去，能不能讓牠安靜一點？', 'There\'s a Mother Mycel down in the Rootdeep. Her spores keep rising and choking our new seedlings. If you go down, could you quiet her?'));
  await E.say('農夫', L('牠住在中層的一條死路裡。', 'She lives at a dead end on the middle level.'));
});
MAPS.thornby.extra = (f) => (f.p2 ? [{ id: 'tb_builder', sprite: 'mychars0', x: 8, y: 13, dir: 'd', talk: 'tb_builder', wander: true }, { id: 'tb_farmer', sprite: 'd_leafy', x: 17, y: 15, dir: 'd', talk: 'tb_farmer' }] : []);

def('rd_echo', async (E) => {
  ensure('nyra');
  await E.say('媽媽的聲音', L('……奈菈，要好好吃飯喔。不可以一個人哭。', '...Nyra, eat properly. And don\'t cry alone.'));
  await E.say('奈菈', L('媽媽！？', 'Mother!?'));
  await E.say('伊爾賽', L('是大地記住的聲音。古棘的根把村子裡的記憶，都藏在這裡了。', 'It\'s a voice the earth remembers. The Elder Thorn\'s roots keep the village\'s memories down here.'));
  await E.say('奈菈', L('……我以前，一直想把那天的事忘掉。可是如果忘掉，媽媽的聲音也會一起不見吧。', '...I used to want to forget that day so badly. But if I forgot it, Mother\'s voice would go too, wouldn\'t it.'));
  await E.say('奈菈', L('我不忘。痛也不忘。', 'I won\'t forget. Even if it hurts.'));
});
def('rd_mycel', async (E) => {
  await E.say(null, L('巨大的菌菇蠕動著，噴出了一大片孢子！', 'A giant fungus heaves and spews a cloud of spores!'));
  await E.battle('mycel', { bg: 'root' });
  S.calls.push('mycel');
  E.sfx('fanfare');
  await E.say('奈菈', L('牠……不是壞東西。牠只是被灰霧弄得餓壞了。牠說，願意幫我們。', 'She... isn\'t wicked. The mist just left her starving. She says she\'ll help us.'));
  await E.say(null, L('奈菈能召喚「菌母」了！', 'Nyra can now call Mother Mycel!'));
});
def('rd_garrick', async (E) => {
  ensure('nyra');
  E.music('rage');
  await E.say(null, L('在根的中心，一個灰色的騎士背對著你們，看著一團早已熄滅的火。', 'At the heart of the roots, a grey knight stands with his back to you, staring into a fire that went out long ago.'));
  await E.say('空洞的加瑞克', L('……燒……要燒掉……命令……是誰的命令……', '...burn... must burn... the order... whose order was it...'));
  await E.say('海爾', L('加瑞克……', 'Garrick...'));
  await E.say('奈菈', L('他忘了自己是誰。可是還記得燒村子的事。', 'He\'s forgotten who he is. But he still remembers burning the village.'));
  await E.say('伊爾賽', L('最深的悔恨，連寂靜之心都吃不掉。它就把人做成只剩悔恨的空殼。', 'The deepest regret is the one thing even the Hush can\'t eat. So it makes a shell with nothing left in it but regret.'));
  await E.battle('garrick2', { bg: 'root', noRun: true });
  E.music('prelude');
  await E.say('加瑞克', L('……奈菈……是叫這個名字吧。喚靈師的孩子。', '...Nyra... that was the name, wasn\'t it. The caller\'s child.'));
  await E.say('加瑞克', L('我想起來了。全部。……我沒有資格請妳原諒。', 'I remember now. All of it. ...I have no right to ask your forgiveness.'));
  await E.say('奈菈', L('我不會原諒你。可是我也不會忘記你。', 'I won\'t forgive you. But I won\'t forget you either.'));
  await E.say('奈菈', L('不是為了懲罰你。是為了讓這種事，再也不要發生。', 'Not to punish you. So that nothing like it ever happens again.'));
  await E.say('加瑞克', L('……謝謝。海爾，替我……照顧好她們。', '...Thank you. Hale... look after them for me.'));
  await E.flash('#80f080', 30);
  E.give('rootlens', -1);
  S.flags.p2_root = true;
  await E.say(null, L('根之泉鏡回到了古棘的心裡，重新亮了起來！', 'The Root Lens is back in the Elder Thorn\'s heart and shines again!'));
  await E.say(null, L('灰燼之中，一隻火紅的鳥振翅飛起。牠的眼睛，像奈菈的媽媽一樣溫柔。', 'From the ashes a fiery bird beats its wings and rises. Its eyes are gentle, like Nyra\'s mother\'s.'));
  S.calls.push('ashphoenix');
  E.sfx('fanfare');
  await E.say(null, L('奈菈能召喚「灰鳳」了！', 'Nyra can now call the Ashphoenix!'));
  await E.say('伊爾賽', L('兩枚了。下一枚，燼之泉鏡——沙爾特。', 'Two. Next, the Ember Lens: Salt.'));
  await E.warp('thornby', 12, 4, 'd');
});

// =====================================================================================
// Chapter 11: The Burning Sands (Tal)
// =====================================================================================
p2wrap('s_king', async (E) => {
  if (!S.flags.p2_root) { await E.say('沙爾特王', L('燼之泉鏡……是嗎。先把其他的事辦完吧，我們沙爾特等得起。', 'The Ember Lens... I see. Finish your other errands first. Salt can wait.')); return; }
  if (S.flags.p2_ember) { await E.say('沙爾特王', L('塔爾，你的師父以你為傲。……我也是。', 'Tal, your master is proud of you. ...So am I.')); return; }
  await E.say('沙爾特王', L('塔爾！你回來了。……奧羅師父出事了。', 'Tal! You\'re back. ...Something has happened to Master Oro.'));
  await E.say('沙爾特王', L('灰霧來的那天，他說要去西方沙漠的「陽炎神殿」守住泉鏡的祭壇，之後就再也沒有回來。', 'The day the grey mist came, he said he would go to the Sunfire Temple in the western desert and guard the lens\'s altar. He never came back.'));
  if (has('tal')) await E.say('塔爾', L('師父……！', 'Master...!'));
  E.give('sunsigil'); E.sfx('chest');
  S.flags.p2_sigil = true;
  await E.say(null, L('得到了「陽之印」！神殿就在沙爾特西方的沙漠裡。', 'Received the Sun Sigil! The temple lies in the desert west of Salt.'));
});
p2wrap('s_guard', async (E) => { await E.say('衛兵', S.flags.p2_ember ? L('鬥技場重新開張了！在城下町的東邊。', 'The Colosseum is open again! East side of town.') : L('陽炎神殿在西邊的沙丘之間，大門刻著太陽。', 'The Sunfire Temple is among the western dunes. Its doors bear the sun.')); });
p2wrap('s_dancer', async (E) => { await E.say('村民', L('紅月不見了，可是月光好冷。今晚我們還是要跳舞，這樣才不會忘記彼此的臉。', 'The red moon is gone, but the moonlight is so cold. We\'ll still dance tonight, so we don\'t forget each other\'s faces.')); });
p2wrap('s_trader', async (E) => { await E.say('商人', L('南方海上的蘆洲有龍騎賽！贏了有好東西拿喔。', 'Reedholm, out on the southern sea, holds drake races! Win and you get fine prizes.')); });
def('s_arena', async (E) => {
  if (!S.flags.p2_ember) { await E.say('鬥技場主', L('鬥技場因為灰霧暫停營業中。等神殿的事解決了再來吧。', 'The Colosseum is closed because of the mist. Come back once the temple is settled.')); return; }
  if (!S.inv.arenapass) { E.give('arenapass'); await E.say('鬥技場主', L('塔爾的朋友？這是參賽證，拿去吧！', 'Friends of Tal? Here\'s your entry pass!')); }
  const k = await E.ask('鬥技場主', L('歡迎來到沙爾特鬥技場！', 'Welcome to the Salt Colosseum!'), [L('挑戰', 'Fight'), L('買東西', 'Shop'), L('離開', 'Leave')]);
  if (k === 0) await E.arena();
  if (k === 1) await E.shop(SHOPS.arena);
});
def('s_caravan', async (E) => {
  const f = F_();
  if (!f.p2_ember) { await E.say('商隊長', L('沙漠裡有一隻巨蟲在吃商隊。真希望有人能幫忙……', 'There\'s a giant worm out in the desert eating caravans. If only someone could help...')); return; }
  if (f.dunewyrm_dead) { await E.say('商隊長', L('多虧你們，商隊又能走了。', 'Thanks to you, the caravans run again.')); return; }
  const k = await E.ask('商隊長', L('沙丘巨蟲在西邊的沙丘埋伏。你們能幫我們除掉牠嗎？', 'The Dune Wyrm lurks in the western dunes. Will you get rid of it for us?'), [L('出發', "Let's go"), L('等一下', 'Not yet')]);
  if (k !== 0) return;
  await E.say(null, L('你們跟著商隊來到了沙丘……沙子突然隆起！', 'You follow the caravan into the dunes... The sand heaves!'));
  await E.battle('dunewyrm', { bg: 'desert' });
  f.dunewyrm_dead = true;
  E.give('phoenixplume'); S.gold += 6000; E.sfx('chest');
  await E.say('商隊長', L('太厲害了！這是商隊的謝禮。', 'Incredible! The caravan\'s thanks.'));
  await E.say(null, L('得到了「鳳凰尾羽」和 6000 金幣！', 'Received a Phoenix Plume and 6000 gold!'));
});
MAPS.salt.extra = (f) => (f.p2 ? [{ id: 's_arena', sprite: 'soldier4', x: 20, y: 17, dir: 'd', talk: 's_arena' }, { id: 's_caravan', sprite: 'd_capped', x: 25, y: 20, dir: 'd', talk: 's_caravan' }] : []);

def('sf_tal', async (E) => {
  ensure('tal');
  await E.say('塔爾', L('奧羅師父是撿到我的人。我是沙漠裡的孤兒，他教我呼吸，教我站立，教我守護。', 'Master Oro found me. I was a desert orphan. He taught me to breathe, to stand, to guard.'));
  await E.say('塔爾', L('莫凡的飛空艇來的時候，我的腳動不了。泉鏡在我眼前被拿走了。', 'When Morvane\'s airships came, my feet wouldn\'t move. The lens was taken right in front of me.'));
  await E.say('塔爾', L('師父什麼都沒說。……他什麼都沒說，比罵我還難受。', 'Master said nothing. ...His silence hurt more than any scolding.'));
  await E.say('伊爾賽', L('那他現在，一定很想跟你說話。', 'Then right now, he must want very much to talk to you.'));
});
def('sf_oro', async (E) => {
  ensure('tal');
  E.music('rage');
  await E.say(null, L('聖火的祭壇前，一位老武僧閉著眼睛站著。他的身體像灰色的石頭。', 'Before the altar of the sacred flame, an old monk stands with his eyes closed. His body is like grey stone.'));
  await E.say('塔爾', L('師父！', 'Master!'));
  await E.say('奧羅', L('……你是誰，孩子。我想不起來……可是我的拳頭，好像認得你。', '...Who are you, boy. I cannot remember... but my fists seem to know you.'));
  await E.say('塔爾', L('那就用拳頭想起來吧！', 'Then remember with your fists!'));
  await E.battle('oro', { bg: 'temple', noRun: true });
  E.music('sanctuary');
  await E.say('奧羅', L('……塔爾。對了，是塔爾。我給你取的名字。', '...Tal. Yes, Tal. The name I gave you.'));
  await E.say('奧羅', L('那天我沒有說話，不是在生你的氣。是我在氣我自己，沒能把你教得更好。', 'That day I said nothing, not because I was angry with you. I was angry with myself, for not teaching you better.'));
  await E.say('奧羅', L('最後一課：「猛虎連擊」。四拳，不為了打倒，是為了守住身後的人。', 'One last lesson: the Tiger Rush. Four blows, not to strike down, but to guard the ones behind you.'));
  S.flags.p2_ember = true;
  E.give('emberlens', -1);
  await E.flash('#f8b000', 30);
  E.sfx('fanfare');
  await E.say(null, L('燼之泉鏡回到了聖火的祭壇，重新亮了起來！\n塔爾學會了「猛虎連擊」！', 'The Ember Lens is back on the altar of the sacred flame and shines again!\nTal learned the Tiger Rush!'));
  await E.say('奧羅', L('我老了，就留在這裡守著聖火吧。塔爾，去吧。你身後，還有很多人。', 'I am old. I will stay and keep the flame. Go, Tal. There are many behind you still.'));
  await E.say('伊爾賽', L('三枚了。最後一枚是風之泉鏡……', 'Three. The last is the Wind Lens...'));
  if (has('dorrin')) await E.say('朵琳', L('風之泉鏡的家，是我老爸以前的工坊。他從來沒告訴我在哪裡……紅隼港的霍伯爺爺也許知道。', 'The Wind Lens\'s home was my dad\'s old workshop. He never told me where it was... Old Hob in Kestrel might know.'));
  await E.warp('world', 6, 31, 'd');
});

// =====================================================================================
// Chapter 12: The Wren Ascends (Dorrin)
// =====================================================================================
def('k_hob', async (E) => {
  const f = F_();
  if (f.p2_wind) {
    const k = await E.ask('霍伯', L('柯溫的工具都搬回來了。有素材的話，我幫你們打點好東西。', 'Corwin\'s tools are all here now. Bring me materials and I\'ll forge you something good.'), [L('鍛造', 'Forge'), L('離開', 'Leave')]);
    if (k === 0) await E.forge();
    return;
  }
  if (!f.p2_ember) { await E.say('霍伯', L('我是霍伯，柯溫的老朋友。朵琳那丫頭小時候，都是坐在我的鐵砧上玩的。', 'I\'m Hob, an old friend of Corwin\'s. When Dorrin was small she used to play sitting on my anvil.')); return; }
  if (!f.p2_gwopen) {
    await E.say('霍伯', L('柯溫的秘密工坊？……他交代過我，等朵琳準備好了才能說。', 'Corwin\'s secret workshop? ...He told me not to say until Dorrin was ready.'));
    if (has('dorrin')) await E.say('朵琳', L('霍伯爺爺，我準備好了。', 'Grandpa Hob, I\'m ready.'));
    await E.say('霍伯', L('……東南外海有一座會冒火的島，叫燼落島。柯溫利用火山的熱，在那裡蓋了「齒輪工坊」。這是他留下的鑰匙。', '...Out in the south-east sea there\'s an island that breathes fire: Emberfall. Corwin used the volcano\'s heat to build the Gearworks there. Here is the key he left.'));
    f.p2_gwopen = true; E.sfx('chest');
    await E.say(null, L('得到了齒輪工坊的鑰匙！', 'Received the key to the Gearworks!'));
    return;
  }
  await E.say('霍伯', L('燼落島就在東南邊的海上。小心火山。', 'Emberfall is out in the south-east sea. Mind the volcano.'));
});
p2wrap('k_sailor', async (E) => { await E.say('水手', S.flags.p2_wind ? L('鷦鷯號飛上雲裡去了！我親眼看到的！', 'The Wren flew right up into the clouds! I saw it with my own eyes!') : L('東南邊的燼落島一直在冒煙。柯溫大叔以前常常一個人開船過去。', 'Emberfall in the south-east is always smoking. Old Corwin used to sail out there alone.')); });
MAPS.kestrel.extra = (f) => (f.p2 ? [{ id: 'k_hob', sprite: 'd_bald', x: 6, y: 10, dir: 'd', talk: 'k_hob' }] : []);

def('gw_letter', async (E) => {
  ensure('dorrin');
  await E.say(null, L('工作台上放著一個小小的音樂盒。朵琳打開了它。', 'A little music box sits on the workbench. Dorrin opens it.'));
  E.sfx('save');
  await E.say('柯溫', L('「朵琳，如果妳聽到這個，代表妳已經長大，能自己找到這裡了。」', '"Dorrin, if you\'re hearing this, you\'ve grown up enough to find this place on your own."'));
  await E.say('柯溫', L('「我要去北方的灰霧群島。那裡傳來一種鈴聲，我想知道，是什麼樣的機關能發出讓人想起事情的聲音。」', '"I\'m going north, to the grey isles. A bell rings out there, and I want to know what kind of machine makes a sound that helps people remember."'));
  await E.say('柯溫', L('「工坊深處有新的引擎核心。用它，鷦鷯號就能飛得比雲還高。……爸爸愛妳。」', '"Deep in the workshop is a new engine core. With it, the Wren can fly higher than the clouds. ...Dad loves you."'));
  await E.say('朵琳', L('……笨蛋老爸。說什麼愛不愛的，你人到底在哪裡啊。', '...Stupid old man. Going on about love. Where even are you.'));
  await E.say('伊爾賽', L('……北方的鈴聲。是鐘鳴村的大鐘。', '...A bell in the north. That\'s the Great Bell of Belltoll.'));
});
def('gw_colossus', async (E) => {
  ensure('dorrin');
  E.music('rage');
  await E.say(null, L('工坊的核心前，一座巨大的發條巨神動了起來！它的胸口刻著灰衛隊的紋章。', 'Before the workshop\'s core, a huge clockwork colossus lurches to life! The Ashguard crest is carved on its chest.'));
  await E.say('朵琳', L('又是用老爸的設計圖做的！……這次，我要讓它真正停下來。', 'Built from Dad\'s blueprints again! ...This time I\'m going to make it stop for good.'));
  await E.battle('colossus', { bg: 'gear', noRun: true });
  E.music('airship');
  await E.say(null, L('核心室的中央，有一座小小的祭壇，和一顆閃著藍光的引擎核心。', 'In the middle of the core room stand a small altar and an engine core glowing blue.'));
  await E.say('朵琳', L('風之泉鏡的祭壇……老爸把工坊蓋在這上面，是為了守著它。', 'The Wind Lens\'s altar... Dad built the workshop on top of it to guard it.'));
  E.give('windlens', -1);
  await E.flash('#c0ffc0', 30);
  E.give('skycore');
  S.flags.p2_wind = true; S.flags.wren2 = true;
  E.sfx('fanfare');
  await E.say(null, L('風之泉鏡回到了祭壇，重新亮了起來！\n得到了「天空核心」！鷦鷯號可以飛上雲海了（飛行時按 X）。', 'The Wind Lens is home and shines again!\nYou got the Sky Core! The Wren can now climb to the Cloud Sea (press X in flight).'));
  await E.say(null, L('朵琳做好了「星爆彈」！柯溫的最後設計。\n紅隼港的霍伯開始幫忙鍛造了。', 'Dorrin built a Starburst, Corwin\'s last design!\nHob in Kestrel can now forge for you.'));
  await E.say('伊爾賽', L('四枚泉鏡都亮了。……可是我的鈴聲，還是傳不到鐘鳴村。北方的灰霧太濃了。', 'All four lenses shine. ...But my bell still can\'t be heard in Belltoll. The northern mist is too thick.'));
  if (has('brin')) await E.say('布琳', L('海爾，瓦恩送來了信鴿。……灰岩堡被「荊誓兵」占領了。是莫凡留下來的死忠部下。', 'Hale, a pigeon from Varn. ...Grayhold has been seized by the Thornsworn. Morvane\'s last loyal men.'));
  await E.warp('world', 80, 51, 'd');
});

// =====================================================================================
// Chapter 13: The Lance Returns (Brin)
// =====================================================================================
def('gh_captain', async (E) => {
  if (S.flags.p2_brin) { await E.say('隊長', L('灰岩堡又是瓦恩的了。賽柏自己走進了牢房，說要等審判。', 'Grayhold is Varn\'s again. Sable walked into the cells himself and said he\'d await judgement.')); return; }
  await E.say('隊長', L('荊誓兵守著內城。帶頭的是賽柏……布琳大人，是您以前帶過的侍從。', 'The Thornsworn hold the keep. Their leader is Sable... Lady Brin, your old squire.'));
  if (has('brin')) await E.say('布琳', L('……我知道。', '...I know.'));
});
def('gh_graves', async (E) => {
  const f = F_();
  if (!f.p2_hale) { await E.say(null, L('城外有一排簡陋的墳墓。墓碑上沒有名字。', 'Outside the walls is a row of plain graves. The stones bear no names.')); return; }
  if (f.sq_graves) { await E.say(null, L('墓碑上刻滿了名字。有人在墓前放了花。', 'Names are carved all over the stones now. Someone has left flowers.')); return; }
  f.sq_graves = true;
  await E.say(null, L('城外有一排沒有名字的墳墓。是灰衛隊在荊棘村那晚之後，倒下的士兵們。', 'Outside the walls is a row of nameless graves: Ashguard soldiers who fell after the night at Thornby.'));
  await E.say('海爾', L('我在兵營裡讀過點名冊。……每一個名字，我都記得。', 'I read the roll in the barracks. ...I remember every name.'));
  await E.say(null, L('海爾一個字一個字地，把名字刻在墓碑上。', 'Letter by letter, Hale carves the names into the stones.'));
  await E.say('隊長', L('……灰衛隊長的徽章。加瑞克隊長臨走前交給我的，說要還給「真正的隊長」。', '...The Ashguard captain\'s badge. Captain Garrick gave it to me before he left, to return to "the real captain".'));
  E.give('captainbadge'); E.sfx('chest');
  await E.say(null, L('得到了「隊長徽章」！', "Received the Captain's Badge!"));
});
MAPS.grayhold.extra = (f) => (f.p2 ? [{ id: 'gh_captain', sprite: 'soldier0', x: 12, y: 9, dir: 'd', talk: 'gh_captain' }, { type: 'sign', id: 'gh_graves', x: 5, y: 11, talk: 'gh_graves' }] : []);

def('kp_brin', async (E) => {
  ensure('brin');
  await E.say('布琳', L('賽柏是我帶的第一個侍從。他什麼都學我：握槍的方法、走路的樣子，連喝酒都學。', 'Sable was the first squire I trained. He copied everything: how I held a lance, how I walked, even how I drank.'));
  await E.say('布琳', L('被烙印控制的時候，我命令他向莫凡宣誓效忠。……他到現在，都還守著那個誓言。', 'While the brand held me, I ordered him to swear himself to Morvane. ...He is still keeping that oath.'));
  await E.say('海爾', L('那就由妳去解開它。', 'Then you\'re the one to release him.'));
});
def('kp_sable', async (E) => {
  ensure('brin');
  E.music('rage');
  await E.say('賽柏', L('布琳大人。您終於來了。', 'Lady Brin. You\'ve come at last.'));
  await E.say('賽柏', L('是您教我的：騎士一旦宣誓，到死都不能背棄。我照做了。您呢？', 'You taught me: once a knight swears, he keeps it until death. I have. And you?'));
  await E.say('布琳', L('我錯了，賽柏。那不是我的誓言，是烙印逼我說的話。可是讓你相信它的，是我。', 'I was wrong, Sable. That oath wasn\'t mine; the brand spoke it through me. But I\'m the one who made you believe it.'));
  await E.say('賽柏', L('那就用槍來證明吧！', 'Then prove it with your lance!'));
  await E.battle('sable', { bg: 'castle', noRun: true });
  E.music('prelude');
  await E.say('賽柏', L('……您的槍，還是那麼快。', '...Your lance is as quick as ever.'));
  await E.say('布琳', L('賽柏，我以布琳之名解除你的誓言。從今天起，你只需要守護你自己選擇的東西。', 'Sable, in my own name I release you from your oath. From today, you guard only what you choose.'));
  await E.say('賽柏', L('……是。還有，大人，有一件事要報告。一個沒有名字的男人僱用了我們，要我們挖開瓦恩城底下的舊兵營，找「點名冊」。', '...Yes, my lady. And there is something I must report. A man with no name hired us to dig into the old barracks under Castle Varn, for the Roll.'));
  await E.say('海爾', L('灰衛隊的點名冊……！', 'The Ashguard\'s roll...!'));
  S.flags.p2_brin = true;
  E.sfx('fanfare');
  await E.say(null, L('布琳學會了「龍落」！', 'Brin learned Wyrm Dive!'));
  await E.warp('grayhold', 11, 3, 'd');
});

// =====================================================================================
// Chapter 13b: The Roll of the Ashguard (Hale)
// =====================================================================================
def('br_roll', async (E) => {
  ensure('hale');
  await E.say(null, L('桌上攤著一本厚厚的名冊。是灰衛隊的點名冊，最後一頁，寫著海爾的名字。', 'A thick book lies open on the table: the Ashguard\'s roll. Hale\'s name is on the last page.'));
  await E.say('海爾', L('四十個人。荊棘村那晚、文湖那天，他們都是聽我的命令行動的。', 'Forty men. The night at Thornby, the day at Wenmere: they all moved on my orders.'));
  await E.say('伊爾賽', L('無名者想讓這些名字消失。這樣一來，那些事就只剩下你一個人記得。', 'The Nameless wants these names gone. Then you alone would remember what happened.'));
  await E.say('海爾', L('……一個人背著所有的事，然後被它壓垮。他想要的，是這個吧。', '...Carrying it all alone, until it crushes you. That\'s what he wants, isn\'t it.'));
  if (has('brin')) await E.say('布琳', L('不會只有你一個人的。我也是灰衛隊的人。', 'You won\'t be alone. I was Ashguard too.'));
});
def('br_legion', async (E) => {
  ensure('hale');
  E.music('villain');
  await E.say(null, L('點名廳裡，灰色的士兵們整齊地列隊。他們沒有臉，只有一個聲音在重複：「隊長……下命令……」', 'In the roll hall, grey soldiers stand in perfect ranks. They have no faces, only one voice repeating: "Captain... your orders..."'));
  await E.say('海爾', L('……全員，聽令。', '...All of you. Attention.'));
  await E.battle('legion', { bg: 'castle', noRun: true });
  E.music('sanctuary');
  await E.say('海爾', L('我來點名。', 'I will call the roll.'));
  await E.say('海爾', L('鐵匠的兒子，羅德。喜歡唱歌的，艾文。第一次出任務就迷路的，小湯姆……', 'Rodd, the smith\'s son. Evan, who loved to sing. Little Tom, who got lost on his first patrol...'));
  await E.say(null, L('海爾念出了四十個名字。每念一個，就有一個灰色的身影低下頭，化成光散去。', 'Hale reads out forty names. With each one, a grey figure bows its head and fades into light.'));
  await E.say('海爾', L('……解散。辛苦了。', '...Dismissed. Well done, all of you.'));
  S.flags.p2_hale = true;
  E.sfx('fanfare');
  await E.say(null, L('海爾立下了新的誓約！\n可以使用「誓約」：聖光斬、盾牆、破曉。', 'Hale swore a new vow!\nHe can now use Vow: Holy Blade, Shield Wall and Dawnbreak.'));
  await E.say('伊爾賽', L('……要穿過北方的灰霧，需要「風之真名」。只有雲海上的天棧居民知道。', '...To pierce the northern mist we need the Wind\'s Name. Only the folk of Skyreach in the Cloud Sea know it.'));
  if (has('dorrin')) await E.say('朵琳', L('交給鷦鷯號吧！在天上按 X，就能衝上雲海！', 'Leave it to the Wren! Press X in the air and we\'ll shoot up into the Cloud Sea!'));
  await E.warp('varncastle', 18, 5, 'd');
});

// =====================================================================================
// Chapter 14: The Cloud Sea
// =====================================================================================
def('sk_elder', async (E) => {
  const f = F_();
  if (f.p2_sky) { await E.say('天棧長老', L('風記得你們的名字。去吧，北方在等你們。', 'The wind remembers your names. Go; the north is waiting.')); return; }
  if (!f.p2_hale) { await E.say('天棧長老', L('地上的人？真稀奇。雲海上的風，最近也變得焦躁了。', 'Ground folk? How rare. Even the winds of the Cloud Sea have grown restless lately.')); return; }
  await E.say('天棧長老', L('想要「風之真名」？……那是風暴巨鵬守護的古老名字。', 'You want the Wind\'s Name? ...It is an old name the Stormroc guards.'));
  await E.say('天棧長老', L('自從灰霧升上來，巨鵬就發了狂，在東北方的巢裡到處颳風。牠不讓任何人靠近。', 'Since the grey mist rose, the Stormroc has gone mad, raging in its nest to the north-east. It lets no one near.'));
  await E.say('天棧長老', L('讓牠冷靜下來，牠也許會把名字告訴你們。我解開巢穴入口的風封吧。', 'Calm it, and perhaps it will tell you the name. I will lift the wind-seal on the nest\'s entrance.'));
  f.p2_skyelder = true;
});
def('sk_child', async (E) => {
  const f = F_();
  if (f.sq_kite_done) { await E.say('小孩', L('風箏飛得好高喔！比雲還高！', 'My kite flies so high! Higher than the clouds!')); return; }
  if (S.inv.kite) { E.give('kite', -1); f.sq_kite_done = true; E.give('tmap4'); E.sfx('chest'); await E.say('小孩', L('我的風箏！謝謝！這張地圖給你們，是爺爺從地上撿來的，說是藏寶圖喔！', 'My kite! Thank you! Have this map. Grandpa found it down on the ground; he says it\'s a treasure map!')); await E.say(null, L('得到了「藏寶圖（四）」！', 'Received Treasure Map IV!')); return; }
  f.sq_kite = true;
  await E.say('小孩', L('我的紅風箏被風吹走了……飛到西北邊那座小小的浮島上了。我飛不過去……', 'The wind took my red kite... it flew to that tiny floating island to the north-west. I can\'t get there...'));
});
def('sk_weaver', async (E) => { await E.say('織女', L('我們用雲織布。天織衣可以擋住風和水，聽說巨鵬的巢裡藏著一件。', 'We weave cloth from clouds. Skyweave turns aside wind and water; they say there\'s one hidden in the Stormroc\'s nest.')); });
def('sk_watch', async (E) => { await E.say('守望者', L('從雲海往下看，北方的群島被灰霧包得像一顆繭。', 'Looking down from the Cloud Sea, the northern isles are wrapped in grey mist like a cocoon.')); });
def('sk_shop', shop('skyreach', () => L('雲上的東西，地上買不到喔。', 'Things from above the clouds. You won\'t find them below.')));
def('sk_inn', inn(300));
def('ae_roc', async (E) => {
  E.music('rage');
  await E.say(null, L('巢的頂端，一隻巨大的鳥張開翅膀，捲起了暴風！', 'At the crown of the nest, a vast bird spreads its wings and whips up a storm!'));
  await E.say('伊爾賽', L('牠的名字被灰霧吃掉一半了……所以才這麼痛苦！', 'The mist has eaten half its name... That\'s why it\'s in such pain!'));
  await E.battle('stormroc', { bg: 'sky', noRun: true });
  E.music('sanctuary');
  await E.say(null, L('巨鵬收起翅膀，低下了頭。伊爾賽搖響了名之鈴。', 'The great bird folds its wings and bows its head. Ilse rings the Name Bell.'));
  E.sfx('save');
  await E.say('風暴巨鵬', L('……想起來了。我的名字，和風的名字。', '...I remember. My name, and the name of the wind.'));
  await E.say('風暴巨鵬', L('地上的孩子們，把它帶去北方吧。唸出它，灰霧就會讓路。', 'Children of the ground, carry it north. Speak it, and the mist will make way.'));
  E.give('windname'); S.flags.p2_sky = true;
  S.calls.push('galeroc');
  E.sfx('fanfare');
  await E.say(null, L('得到了「風之真名」！\n奈菈能召喚「風鵬」了！', "You received the Wind's Name!\nNyra can now call the Galeroc!"));
  await E.say('伊爾賽', L('……終於。鐘鳴村，我回來了。', '...At last. Belltoll, I\'m coming home.'));
  await E.warp('sky', 52, 13, 'd');
});

// =====================================================================================
// Mirefen: Reedholm, treasure, drake races and the Deepcoil
// =====================================================================================
def('rh_elder', async (E) => { await E.say('長老', L('歡迎來到蘆洲。我們蓋在水上的房子，灰霧來了也淹不掉。……只是最近，連魚都忘記怎麼游了。', 'Welcome to Reedholm. Our houses stand on the water; even the mist can\'t drown them. ...Though lately, even the fish forget how to swim.')); });
def('rh_shop', shop('reedholm', () => L('沼澤的特產！還有龍騎賽的紀念品！', 'Swamp goods! And drake-race keepsakes!')));
def('rh_inn', inn(250));
def('rh_racer', async (E) => {
  if (!S.inv.whistle) { E.give('whistle'); await E.say('龍騎賽主持', L('來參加龍騎賽的嗎？這是馴龍笛，拿去當參賽證吧！', 'Here for the drake races? Take this Drake Whistle as your pass!')); }
  await E.race();
});
def('rh_digger', async (E) => {
  const f = F_();
  if (!S.inv.spade) {
    E.give('spade'); E.give('tmap1'); E.sfx('chest');
    await E.say('掘寶人', L('我年輕時是挖寶的。現在腰不行了……這把鏟子和第一張藏寶圖送你們吧。', 'I was a treasure hunter in my youth. My back\'s given out now... Have my spade and my first treasure map.'));
    await E.say(null, L('得到了「尋寶鏟」和「藏寶圖（一）」！\n在道具裡使用藏寶圖，然後在大地圖上找到打叉的地方，按 Z 挖掘。', 'Received the Treasure Spade and Treasure Map I!\nUse a map from Items, find the X on the world map, and press Z to dig.'));
    return;
  }
  const found = [1, 2, 3, 4, 5].filter((i) => f['dug' + i]).length;
  if (found >= 4 && !S.inv.tmap5 && !f.dug5) { E.give('tmap5'); E.sfx('chest'); await E.say('掘寶人', L(`挖到 ${found} 個寶藏了？了不起！這是我最後一張地圖……畫著金色螃蟹的那張。小心點。`, `${found} treasures already? Impressive! Here's my last map... the one with the golden crab. Careful.`)); return; }
  await E.say('掘寶人', L(`已經挖到 ${found} 個寶藏了。藏寶圖還有幾張散落在各地：雲海、淵蛇洞窟……`, `${found} treasures found so far. A few more maps are scattered about: the Cloud Sea, Deepcoil Grotto...`));
});
def('rh_fisher', async (E) => {
  const f = F_();
  if (f.deepcoil_dead) { await E.say('漁夫', L('淵蛇安靜了，魚又回來了！', 'The Deepcoil\'s quiet, and the fish are back!')); return; }
  f.sq_deep = true;
  await E.say('漁夫', L('東南邊的洞窟裡住著一條叫「淵蛇」的大蛇。牠一翻身，整片沼澤的魚都會被捲走。……很強喔，等你們夠強了再去吧。', 'A great serpent called the Deepcoil lives in the grotto to the south-east. When it turns over, every fish in the fen gets swept away. ...It\'s strong. Go when you\'re strong enough.'));
});
def('rh_child', async (E) => { await E.say('小孩', L('龍跑得最快的時候，不是一直催牠，是讓牠喘口氣再衝！', 'A drake runs fastest when you let it catch its breath before the sprint, not when you push it all the time!')); });
def('gr_deepcoil', async (E) => {
  E.music('rage');
  await E.say(null, L('漆黑的水面捲起了漩渦。巨大的蛇從深淵中抬起頭！', 'The black water spins into a whirlpool. A gigantic serpent rears up from the deep!'));
  await E.battle('deepcoil', { bg: 'cloister' });
  S.calls.push('deepcoil');
  E.sfx('fanfare');
  await E.say('奈菈', L('牠說……被灰霧弄得連自己有多大都忘了。現在想起來了。牠願意借我力量。', 'It says... the mist made it forget even how big it was. Now it remembers. It\'ll lend me its strength.'));
  await E.say(null, L('奈菈能召喚「淵蛇」了！', 'Nyra can now call the Deepcoil!'));
});

// =====================================================================================
// Chapter 15: Hollowmere (Ilse)
// =====================================================================================
def('bl_keeper', async (E) => {
  const f = F_();
  if (f.p2_end) { await E.say('老記名師', L('伊爾賽是我最好的學生。……我說過這句話嗎？說幾次都不嫌多。', 'Ilse is my finest student. ...Have I said that before? It bears saying again.')); return; }
  if (f.p2_belltoll) { await E.say('老記名師', L('……鐘……', '...the bell...')); return; }
  ensure('ilse');
  E.music('prelude');
  await E.say(null, L('村子裡安靜得可怕。人們站在原地，灰色的臉上什麼表情也沒有。', 'The village is terribly quiet. People stand where they are, their grey faces empty.'));
  await E.say('伊爾賽', L('老師！是我，伊爾賽！', 'Teacher! It\'s me, Ilse!'));
  await E.say('老記名師', L('……伊……誰？……鐘……要敲鐘……', '...Il... who? ...the bell... ring the bell...'));
  E.sfx('save');
  await E.say(null, L('伊爾賽用力搖著名之鈴，可是鈴聲被灰霧吞掉了。', 'Ilse rings the Name Bell with all her might, but the mist swallows the sound.'));
  await E.say('伊爾賽', L('不行……我的小鈴鐺不夠。要讓北邊鐘樓的「大鐘」響起來才行。', 'It\'s no use... my little bell isn\'t enough. The Great Bell in the tower to the north has to ring.'));
  if (has('dorrin')) {
    await E.say('朵琳', L('……等一下。那個人。在那邊修東西的那個人。', '...Wait. That man. The one over there, fixing something.'));
    await E.say('朵琳', L('老爸……？', 'Dad...?'));
    await E.say('修補匠', L('……齒輪……要轉……我是誰……我在修什麼……', '...gears... must turn... who am I... what am I fixing...'));
    await E.say('朵琳', L('是我啊！朵琳！你的女兒！……你連我都忘了嗎！？', 'It\'s me! Dorrin! Your daughter! ...You\'ve forgotten even me!?'));
    await E.say('伊爾賽', L('朵琳……大鐘響起的時候，他一定會想起來的。我保證。', 'Dorrin... when the Great Bell rings, he will remember. I promise.'));
  }
  f.p2_belltoll = true;
  await E.say(null, L('鐘樓的冰封鬆動了。', 'The ice sealing the tower has loosened.'));
});
def('bl_mother', async (E) => { await E.say('鐘鳴村的母親', F_().p2_end ? L('伊爾賽小時候，一天到晚都在搖鈴鐺。吵死了……真好。', 'When Ilse was little, she rang that bell all day long. So noisy... So lovely.') : L('……我好像……有一個女兒……', '...I think... I had a daughter...')); });
def('bl_tinker', async (E) => { await E.say(F_().p2_end ? '柯溫' : '修補匠', F_().p2_end ? L('我留在這裡幫忙修大鐘。朵琳說，修好以後要載我回家。', 'I\'m staying to help mend the Great Bell. Dorrin says she\'ll fly me home after.') : L('……齒輪……要轉……', '...gears... must turn...')); });
def('bl_child', async (E) => { await E.say('小孩', F_().p2_end ? L('我叫琪琪！我記得！', 'My name is Kiki! I remember!') : L('……', '...')); });
def('bl_old', async (E) => { await E.say('老人', F_().p2_end ? L('那個沒有名字的人……我們村裡，會替他刻一塊碑。', 'That man with no name... our village will carve a stone for him.') : L('……好安靜……好安靜……', '...so quiet... so quiet...')); });
def('bl_shop', shop('belltoll', () => (F_().p2_end ? L('歡迎光臨！……我是說，歡迎回來！', 'Welcome! ...I mean, welcome back!') : L('……要……買……什麼……', '...what... will you... buy...'))));
def('bl_inn', inn(300));

def('bt_ilse', async (E) => {
  ensure('ilse');
  await E.say('伊爾賽', L('一年前，那個男人來到村裡。他很溫柔，說話很輕。', 'A year ago that man came to the village. He was gentle, and spoke softly.'));
  await E.say('伊爾賽', L('他問我：「妳的爸爸死了，妳很難過吧？我可以讓妳忘記他，這樣就不會痛了。」', 'He asked me, "Your father died. It hurts, doesn\'t it? I can make you forget him, and then it won\'t hurt anymore."'));
  await E.say('伊爾賽', L('我說不要。忘記爸爸，比痛還可怕。……可是村裡很多人，都說了好。', 'I said no. Forgetting Father was more frightening than any pain. ...But many in the village said yes.'));
  await E.say('伊爾賽', L('然後，他就一個一個地，連其他的名字也拿走了。', 'And then, one by one, he took their other names too.'));
  await E.say('海爾', L('……我也想過，如果能忘記文湖的那一天就好了。', '...I have wished, too, that I could forget that day at Wenmere.'));
  await E.say('伊爾賽', L('嗯。所以我覺得，他其實……是個非常寂寞的人。', 'I know. That\'s why I think he is... a very lonely man.'));
});
def('bt_wraith', async (E) => {
  E.music('villain');
  await E.say(null, L('鐘室的中央，巨大的銅鐘被灰色的霧纏住了。霧裡浮出一張蒼白的臉。', 'In the middle of the belfry the great bronze bell is bound in grey mist. A pale face rises out of it.'));
  await E.say('鐘魂', L('……不要……再響了……響了……就會想起來……想起來……就會痛……', '...don\'t... ring again... if it rings... they\'ll remember... if they remember... it will hurt...'));
  await E.say('伊爾賽', L('痛也沒關係！大鐘，醒過來！', 'It\'s alright if it hurts! Great Bell, wake up!'));
  await E.battle('bellwraith', { bg: 'snow', noRun: true });
  E.music('deities');
  E.sfx('save'); await E.flash('#ffffff', 20); E.sfx('save');
  await E.say(null, L('大鐘發出了深沉的一響——可是聲音在半空中停住了。', 'The Great Bell lets out a deep peal, but the sound stops dead in the air.'));
  const nl = E.spawn({ type: 'npc', id: 'nameless_bt', sprite: 'conjurer0', x: 12, y: 5, dir: 'd', lookGrey: true });
  await E.say('無名者', L('辛苦了。可是，到此為止吧。', 'Well done. But this is far enough.'));
  await E.say('海爾', L('你就是……沒有名字的人。', 'You are... the man with no name.'));
  await E.say('無名者', L('我曾經有過名字。在很久以前，我是一位老魔法師的學生，在莫凡之前。', 'I had a name once. Long ago I was the student of an old mage, before Morvane.'));
  if (has('nyra')) await E.say('奈菈', L('高文爺爺的……學生！？', 'Grandpa Gowan\'s... student!?'));
  await E.say('無名者', L('我的妹妹死了。全村都在哭，哭了好多年。我想，如果沒有人記得她，就沒有人會痛了。', 'My sister died. The whole village wept, for years. I thought: if no one remembered her, no one would hurt.'));
  await E.say('無名者', L('所以我向寂靜之心借了力量，把她的名字剪掉了。然後是我自己的。連老師，也忘了我。', 'So I borrowed the Hush\'s power and cut her name away. Then my own. Even my teacher forgot me.'));
  await E.say('無名者', L('看，多安靜。沒有人會痛了。我會把這份安靜，送給整片大地。', 'See how quiet it is. No one hurts. I will give this quiet to the whole land.'));
  await E.say('伊爾賽', L('那不是安靜！那是空的！', 'That isn\'t quiet! It\'s empty!'));
  await E.say('無名者', L('南邊的海上，蒼白高塔已經升起來了。在塔頂，寂靜之心會完全醒來。……來吧，如果你們還記得自己為什麼要來。', 'On the sea to the south, the Pale Spire has risen. At its summit the Hush will wake fully. ...Come, if you still remember why you came.'));
  E.removeEnt('nameless_bt');
  await E.flash('#ffffff', 20);
  await E.say(null, L('大鐘旁邊，一盞小小的燈亮了起來。燈裡住著一個溫暖的光精。', 'Beside the Great Bell, a small lamp lights up. A warm spirit of light lives inside it.'));
  S.calls.push('lumenwisp');
  E.sfx('fanfare');
  await E.say(null, L('奈菈能召喚「光精」了！', 'Nyra can now call the Lumenwisp!'));
  S.flags.p2_bell = true;
  await E.say('伊爾賽', L('……我們走吧。去告訴他，痛，也是記得的一部分。', '...Let\'s go. Let\'s tell him that hurting is part of remembering, too.'));
  await E.warp('world', 86, 7, 'd');
});

// =====================================================================================
// Chapter 16: The Pale Spire
// =====================================================================================
def('ps_enter', async (E) => {
  await E.say(null, L('塔裡沒有一點聲音。連腳步聲，都像被什麼吞掉了。', 'There is no sound in the tower. Even footsteps seem to be swallowed.'));
  await E.say('伊爾賽', L('大家，邊走邊說話吧。說什麼都好。叫彼此的名字。', 'Everyone, let\'s talk as we go. About anything. Say each other\'s names.'));
  if (has('brin')) await E.say('布琳', L('那我先來。海爾！欠我的那杯酒，別想賴掉！', 'Me first, then. Hale! Don\'t think you\'re getting out of that drink you owe me!'));
  await E.say('海爾', L('……布琳。我記得。', '...Brin. I remember.'));
});
def('ps_gowan', async (E) => {
  E.music('sanctuary');
  await E.say(null, L('一道柔和的星光，從塔頂的縫隙裡灑了下來。', 'A soft starlight falls through a crack high in the tower.'));
  await E.say('高文的聲音', L('……喔，這不是那群愛逞強的孩子們嗎。', '...Oh, if it isn\'t that bunch of reckless children.'));
  if (has('nyra')) await E.say('奈菈', L('高文爺爺！', 'Grandpa Gowan!'));
  await E.say('高文的聲音', L('我變成星星以後，看得很清楚。那孩子……奧瑞爾。我想起他的名字了。', 'Since I became a star, I see very clearly. That boy... Aurel. I remember his name now.'));
  await E.say('高文的聲音', L('替我告訴他：老師對不起他。沒能陪他一起難過，是我的錯。', 'Tell him for me: his teacher is sorry. It was my fault, not grieving alongside him.'));
  await E.say('高文的聲音', L('還有，海爾。你的劍，現在很亮喔。', 'And Hale. Your sword shines very brightly now.'));
  E.heal(); E.sfx('heal');
  await E.say(null, L('星光包圍了大家，所有人都恢復了。', 'The starlight surrounds everyone, and all are restored.'));
  E.music('pagoda');
});
def('ps_final', async (E) => {
  E.music('villain');
  await E.say('無名者', L('你們真的來了。還記得自己的名字嗎？', 'You really came. Do you still remember your names?'));
  await E.say('海爾', L('我是海爾。曾經是灰衛隊長，現在是曙衛隊長。我燒過村子，奪過泉鏡，也背叛過自己。', 'I am Hale. Once captain of the Ashguard, now captain of the Dawnguard. I have burned a village, stolen lenses, betrayed myself.'));
  await E.say('海爾', L('這些，我一件都不會忘。', 'I will forget none of it.'));
  await E.say('無名者', L('……為什麼？明明忘掉就不會痛了。', '...Why? If you forgot, it wouldn\'t hurt.'));
  await E.say('伊爾賽', L('奧瑞爾。高文老師要我們轉告你：他對不起你。沒能陪你一起難過，是他的錯。', 'Aurel. Teacher Gowan asked us to tell you: he is sorry. Not grieving alongside you was his fault.'));
  await E.say('無名者', L('……奧瑞爾。那是……我的……', '...Aurel. That is... my...'));
  await E.say('無名者', L('不要！不要叫那個名字！想起來的話……妹妹的事……也會……！', 'No! Don\'t call me that! If I remember... my sister... will...!'));
  await E.battle('nameless', { bg: 'pale', noRun: true });
  await E.say('奧瑞爾', L('……莉娜。我的妹妹，叫莉娜。', '...Lina. My sister\'s name was Lina.'));
  await E.say('奧瑞爾', L('好痛……可是……我想起她笑的樣子了。', 'It hurts... but... I remember her smile.'));
  E.shake(60); E.sfx('quake');
  await E.say('寂靜之心', L('……………………', '..........'));
  await E.say(null, L('塔頂的地板裂開了。冰冷的光從下面升起，所有的聲音都被吸進去了。', 'The floor of the summit cracks open. A cold light rises from below, and every sound is pulled into it.'));
  await E.say('奧瑞爾', L('寂靜之心……醒了。我已經……控制不住它了。對不起……', 'The Hush... is awake. I can\'t... hold it anymore. I\'m sorry...'));
  await E.say('伊爾賽', L('大家，大聲說話！叫彼此的名字！只要還有人在說話，它就吃不掉我們！', 'Everyone, speak up! Call each other\'s names! As long as someone is speaking, it can\'t swallow us!'));
  await E.say('海爾', L('我們的名字，是背著一切走到這裡的證明！', 'Our names are the proof that we carried everything all the way here!'));
  await E.battle('hush', { bg: 'pale', noRun: true, music: 'potentiam' });
  await E.say(null, L('寂靜之心的光芒一點一點黯淡下去。伊爾賽搖響了名之鈴，大鐘遠遠地回應了。', 'Little by little, the Hush\'s light fades. Ilse rings the Name Bell, and far away the Great Bell answers.'));
  E.sfx('save');
  await E.say('奧瑞爾', L('……我會留在這裡，陪著寂靜之心一起睡。它也只是……一顆很寂寞的星星。', '...I will stay here and sleep beside the Hush. It is only... a very lonely star.'));
  await E.say('奧瑞爾', L('如果……如果有人願意記得我，就太好了。', 'If... if anyone would remember me, that would be enough.'));
  await E.say('海爾', L('我們會記得。奧瑞爾。', 'We will remember. Aurel.'));
  await E.ending();
});

// =====================================================================================
// After the end: the Starwell Abyss
// =====================================================================================
def('ab_echo', async (E) => {
  E.music('villain');
  await E.say(null, L('深淵中，一個熟悉的身影背對著你們站著。', 'In the abyss, a familiar figure stands with his back to you.'));
  await E.say('莫凡的殘響', L('……海爾。你們把我的老師，變成了星星。', '...Hale. You turned my teacher into a star.'));
  await E.say('莫凡的殘響', L('我留在這裡的，只是一點不甘心。打倒我吧。讓我……安心地被忘記。', 'All I left here is a little bitterness. Strike me down. Let me be... peacefully forgotten.'));
  await E.say('海爾', L('不。我們會打倒你，可是不會忘記你。', 'No. We will strike you down, but we will not forget you.'));
  await E.battle('echo', { bg: 'well', noRun: true });
  await E.say('莫凡的殘響', L('……不被忘記，原來是這種感覺。……謝謝。', '...So this is what it feels like, not to be forgotten. ...Thank you.'));
  E.music('deities');
});
def('ab_unwritten', async (E) => {
  E.music('villain');
  await E.say(null, L('深淵的最底部，什麼都沒有。連「什麼都沒有」這件事，都像要被抹掉一樣。', 'At the very bottom of the abyss there is nothing. Even the nothing seems about to be rubbed away.'));
  await E.say('未書者', L('……………', '..........'));
  await E.say('伊爾賽', L('這是……被所有人遺忘的東西，最後流到的地方。它想把一切都變成沒寫過的紙。', 'This is... where everything that everyone forgot finally drains away. It wants to turn all things into an unwritten page.'));
  await E.say('海爾', L('那我們就在上面，寫下自己的名字。', 'Then we will write our names on it.'));
  await E.battle('unwritten', { bg: 'well', noRun: true, music: 'potentiam' });
  E.music('reunion');
  await E.say(null, L('未書者散成了無數的光點。每一個光點裡，都有一個被想起來的名字。', 'The Unwritten scatters into countless points of light. In each one, a name is remembered.'));
  S.flags.unwritten_dead = true;
  E.give('grandelixir', 3); E.sfx('fanfare');
  await E.say(null, L('得到了三瓶「大靈藥」！\n灰誓騎士的故事，在這裡真正寫完了。謝謝你的遊玩！', 'Received three Grand Elixirs!\nThe tale of the Ashen Vow is truly written. Thank you for playing!'));
});

// Gowan's notes: when all four pages are found, Nyra learns his star
const chest0 = SCRIPTS.chest;
def('chest', async (E, e) => {
  await chest0(E, e);
  if (e && e.item && /^page[1-4]$/.test(e.item) && !S.flags.gowan_pages && [1, 2, 3, 4].every((i) => S.inv['page' + i])) {
    S.flags.gowan_pages = true;
    await E.say(null, L('高文的筆記湊齊了。最後一頁的背面，畫著一個魔法陣。', "Gowan's notes are complete. On the back of the last page is a magic circle."));
    E.sfx('fanfare');
    await E.say(null, L('奈菈學會了高文的「星墜」！', "Nyra learned Gowan's Starfall!"));
  }
  if (e && e.item === 'weddingring') S.flags.sq_ring_found = true;
});
// the wedding ring lies in Mossway once Mara has asked
MAPS.mossway.extra = (f) => (f.sq_ring ? [{ type: 'chest', id: 'mw_ring', item: 'weddingring', n: 1, x: 16, y: 20 }] : []);
void fullHeal; void stats; void ITEMS; void nm;
