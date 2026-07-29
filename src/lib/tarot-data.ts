// 塔羅牌資料 — 完整 78 張牌（Step 18）
// 大阿爾克那 Major Arcana（22）+ 小阿爾克那 Minor Arcana（Wands / Cups / Swords / Pentacles，各 14 張）
// 圖片先使用假路徑 /cards/{id}.webp，之後補上正式圖片即可。

export type TarotSuit = "wands" | "cups" | "swords" | "pentacles";

export interface TarotCardData {
  id: string;
  name: string;
  englishName: string;
  suit?: TarotSuit;
  number?: number;
  image: string;
  keywords: string[];
  uprightMeaning: string;
  reversedMeaning: string;
}

export const majorArcana: TarotCardData[] = [
  {
    id: "fool",
    name: "愚者",
    englishName: "The Fool",
    image: "/cards/fool.webp",
    keywords: ["新開始", "冒險", "純真", "自由"],
    uprightMeaning:
      "象徵新的開始、冒險精神與無限可能。你正站在人生的十字路口，帶著初心勇敢踏出第一步。",
    reversedMeaning:
      "魯莽行事、缺乏計畫，或因猶豫不決而錯失機會，提醒你三思而後行。",
  },
  {
    id: "magician",
    name: "魔術師",
    englishName: "The Magician",
    image: "/cards/magician.webp",
    keywords: ["創造力", "行動力", "意志力", "資源整合"],
    uprightMeaning:
      "你擁有實現目標所需的一切資源與技能，是時候化想法為行動了。",
    reversedMeaning: "才能被浪費、缺乏自信，或利用技巧操弄他人，需留意言行是否誠實。",
  },
  {
    id: "high-priestess",
    name: "女祭司",
    englishName: "The High Priestess",
    image: "/cards/high-priestess.webp",
    keywords: ["直覺", "潛意識", "神秘", "內在智慧"],
    uprightMeaning:
      "傾聽內心的聲音，答案往往藏在直覺與潛意識之中，而非表面的邏輯。",
    reversedMeaning: "忽視直覺、資訊被隱藏，或與自己的內在失去連結。",
  },
  {
    id: "empress",
    name: "皇后",
    englishName: "The Empress",
    image: "/cards/empress.webp",
    keywords: ["豐盛", "母性", "創造", "自然"],
    uprightMeaning:
      "代表豐盛、滋養與創造力的展現，生活或計畫正在穩定成長茁壯。",
    reversedMeaning: "過度依賴、創造力受阻，或忽略自我照顧而感到枯竭。",
  },
  {
    id: "emperor",
    name: "皇帝",
    englishName: "The Emperor",
    image: "/cards/emperor.webp",
    keywords: ["權威", "秩序", "穩定", "領導"],
    uprightMeaning: "象徵結構、紀律與領導力，透過理性規劃建立穩固的基礎。",
    reversedMeaning: "專制、缺乏彈性，或因失去控制而感到混亂不安。",
  },
  {
    id: "hierophant",
    name: "教皇",
    englishName: "The Hierophant",
    image: "/cards/hierophant.webp",
    keywords: ["傳統", "信仰", "指導", "制度"],
    uprightMeaning:
      "尋求傳統智慧、正規教育或精神導師的指引，遵循既有的價值體系。",
    reversedMeaning: "打破常規、質疑權威，或感到被僵化的制度所束縛。",
  },
  {
    id: "lovers",
    name: "戀人",
    englishName: "The Lovers",
    image: "/cards/lovers.webp",
    keywords: ["愛情", "選擇", "和諧", "連結"],
    uprightMeaning:
      "代表深刻的情感連結與重要的抉擇，關係中的和諧與價值觀的契合。",
    reversedMeaning: "關係失衡、溝通不良，或面臨難以抉擇的內心掙扎。",
  },
  {
    id: "chariot",
    name: "戰車",
    englishName: "The Chariot",
    image: "/cards/chariot.webp",
    keywords: ["意志", "勝利", "決心", "掌控"],
    uprightMeaning: "憑藉堅定的意志力克服阻礙，朝目標全速前進並贏得勝利。",
    reversedMeaning: "方向失控、缺乏自律，或因內在衝突而停滯不前。",
  },
  {
    id: "strength",
    name: "力量",
    englishName: "Strength",
    image: "/cards/strength.webp",
    keywords: ["勇氣", "耐心", "內在力量", "溫柔堅定"],
    uprightMeaning:
      "以溫柔而堅定的力量克服恐懼，展現內在真正的勇氣與同理心。",
    reversedMeaning: "自我懷疑、缺乏耐心，或以強硬手段掩飾內心的脆弱。",
  },
  {
    id: "hermit",
    name: "隱者",
    englishName: "The Hermit",
    image: "/cards/hermit.webp",
    keywords: ["內省", "獨處", "智慧", "尋找真理"],
    uprightMeaning:
      "退一步向內探索，透過獨處與沉思找到屬於自己的答案與智慧。",
    reversedMeaning: "過度孤立、逃避現實，或拒絕他人的建議與陪伴。",
  },
  {
    id: "wheel-of-fortune",
    name: "命運之輪",
    englishName: "Wheel of Fortune",
    image: "/cards/wheel-of-fortune.webp",
    keywords: ["循環", "命運", "轉變", "機運"],
    uprightMeaning: "生命的循環正在轉動，一個新的機會或轉捩點即將到來。",
    reversedMeaning: "運勢受阻、抗拒改變，或感覺被外在環境所困。",
  },
  {
    id: "justice",
    name: "正義",
    englishName: "Justice",
    image: "/cards/justice.webp",
    keywords: ["公平", "真相", "因果", "平衡"],
    uprightMeaning:
      "誠實面對事實，做出公正且經過深思熟慮的決定，因果終將顯現。",
    reversedMeaning: "不公平的對待、逃避責任，或決策失衡帶來的後果。",
  },
  {
    id: "hanged-man",
    name: "吊人",
    englishName: "The Hanged Man",
    image: "/cards/hanged-man.webp",
    keywords: ["等待", "犧牲", "換位思考", "臣服"],
    uprightMeaning:
      "暫停腳步，換個角度看待處境，透過放手與等待獲得新的領悟。",
    reversedMeaning: "停滯不前、抗拒必要的犧牲，或陷入無謂的拖延。",
  },
  {
    id: "death",
    name: "死神",
    englishName: "Death",
    image: "/cards/death.webp",
    keywords: ["結束", "轉化", "重生", "釋放"],
    uprightMeaning:
      "一個階段的結束帶來蛻變與重生，放下舊有才能迎接新的開始。",
    reversedMeaning: "抗拒改變、停滯在過去，或害怕面對必要的結束。",
  },
  {
    id: "temperance",
    name: "節制",
    englishName: "Temperance",
    image: "/cards/temperance.webp",
    keywords: ["平衡", "調和", "耐心", "療癒"],
    uprightMeaning: "透過耐心與適度調和不同的面向，找到內在與外在的平衡。",
    reversedMeaning: "失去平衡、過度極端，或缺乏耐心導致衝突。",
  },
  {
    id: "devil",
    name: "惡魔",
    englishName: "The Devil",
    image: "/cards/devil.webp",
    keywords: ["束縛", "誘惑", "物質", "陰影"],
    uprightMeaning:
      "提醒你正被某種執念、慾望或關係所束縛，需正視內在的陰影面。",
    reversedMeaning: "掙脫束縛、覺察並釋放成癮或負面模式，重獲自由。",
  },
  {
    id: "tower",
    name: "高塔",
    englishName: "The Tower",
    image: "/cards/tower.webp",
    keywords: ["劇變", "崩塌", "覺醒", "解放"],
    uprightMeaning: "突如其來的變動打破舊有結構，雖然震盪但帶來必要的覺醒。",
    reversedMeaning: "抗拒無可避免的改變，或災難的影響逐漸緩和平復。",
  },
  {
    id: "star",
    name: "星星",
    englishName: "The Star",
    image: "/cards/star.webp",
    keywords: ["希望", "療癒", "信念", "靈感"],
    uprightMeaning: "在低潮之後迎來希望與療癒，對未來重新燃起信心與靈感。",
    reversedMeaning: "感到絕望、失去信念，或與自己的目標失去連結。",
  },
  {
    id: "moon",
    name: "月亮",
    englishName: "The Moon",
    image: "/cards/moon.webp",
    keywords: ["潛意識", "幻象", "不安", "直覺"],
    uprightMeaning:
      "情緒與潛意識浮現，事情可能不如表面所見，需信任直覺並謹慎前行。",
    reversedMeaning: "困惑逐漸消散、真相漸漸浮現，或走出恐懼與焦慮。",
  },
  {
    id: "sun",
    name: "太陽",
    englishName: "The Sun",
    image: "/cards/sun.webp",
    keywords: ["喜悅", "成功", "活力", "真實"],
    uprightMeaning: "象徵喜悅、成功與活力，事情朝著光明與正向的方向發展。",
    reversedMeaning: "暫時的低潮、過度樂觀，或成功尚未完全顯現。",
  },
  {
    id: "judgement",
    name: "審判",
    englishName: "Judgement",
    image: "/cards/judgement.webp",
    keywords: ["覺醒", "重生", "反思", "召喚"],
    uprightMeaning:
      "回顧過去並做出重要的覺醒與決斷，迎接自我更新與重生的召喚。",
    reversedMeaning: "自我批判過重、逃避真正的反思，或對過去耿耿於懷。",
  },
  {
    id: "world",
    name: "世界",
    englishName: "The World",
    image: "/cards/world.webp",
    keywords: ["圓滿", "完成", "整合", "成就"],
    uprightMeaning: "代表一個階段的圓滿完成，所有努力整合成豐碩的成果。",
    reversedMeaning: "尚未完成的遺憾、缺乏收尾，或需要再努力一步才能達成目標。",
  },
];

// 小阿爾克那 Minor Arcana（56 張）
const SUIT_NAME: Record<TarotSuit, string> = {
  wands: "權杖",
  cups: "聖杯",
  swords: "寶劍",
  pentacles: "錢幣",
};

interface MinorRank {
  rank: string;
  englishRank: string;
  number: number;
  keywords: string[];
  uprightMeaning: string;
  reversedMeaning: string;
}

const WANDS_RANKS: MinorRank[] = [
  {
    rank: "王牌",
    englishRank: "Ace",
    number: 1,
    keywords: ["靈感", "新契機", "創造力", "熱情"],
    uprightMeaning:
      "象徵靈感乍現與嶄新的行動契機，充滿熱情與創造的能量，適合展開新計畫。",
    reversedMeaning: "缺乏方向、遲遲無法行動，或熱情消退，計畫難以啟動。",
  },
  {
    rank: "二",
    englishRank: "Two",
    number: 2,
    keywords: ["規劃", "遠見", "抉擇", "拓展"],
    uprightMeaning: "站在十字路口展望未來，開始規劃更長遠的目標與可能性。",
    reversedMeaning: "猶豫不決、缺乏遠見，或害怕跨出舒適圈。",
  },
  {
    rank: "三",
    englishRank: "Three",
    number: 3,
    keywords: ["擴展", "遠航", "耐心等待", "機會"],
    uprightMeaning: "前期努力開始看見成果，眼光放遠，等待機會擴展版圖。",
    reversedMeaning: "進展受阻、計畫延遲，或過度樂觀而忽略細節。",
  },
  {
    rank: "四",
    englishRank: "Four",
    number: 4,
    keywords: ["慶祝", "穩定", "團圓", "里程碑"],
    uprightMeaning: "象徵慶祝與穩固的成果，家庭或團隊和諧，值得慶賀的里程碑。",
    reversedMeaning: "慶祝延後、根基不穩，或內部關係出現緊張。",
  },
  {
    rank: "五",
    englishRank: "Five",
    number: 5,
    keywords: ["競爭", "衝突", "較勁", "挑戰"],
    uprightMeaning: "面臨競爭與意見紛歧，多方角力帶來挑戰，也可能激發成長。",
    reversedMeaning: "逃避衝突、內部紛爭平息，或競爭轉為合作。",
  },
  {
    rank: "六",
    englishRank: "Six",
    number: 6,
    keywords: ["勝利", "認可", "榮耀", "自信"],
    uprightMeaning: "努力獲得肯定與勝利，公開的成就帶來自信與榮耀。",
    reversedMeaning: "遲來的認可、缺乏自信，或擔心他人看法。",
  },
  {
    rank: "七",
    englishRank: "Seven",
    number: 7,
    keywords: ["防禦", "堅持", "捍衛立場", "壓力"],
    uprightMeaning: "面對挑戰與質疑仍堅守立場，在壓力下捍衛自己的信念。",
    reversedMeaning: "感到不堪重負、放棄堅持，或防禦過度變得固執。",
  },
  {
    rank: "八",
    englishRank: "Eight",
    number: 8,
    keywords: ["迅速", "行動", "溝通", "進展"],
    uprightMeaning: "事情快速推進，溝通與行動力提升，好消息即將到來。",
    reversedMeaning: "進度延誤、溝通不良，或步調過快而失焦。",
  },
  {
    rank: "九",
    englishRank: "Nine",
    number: 9,
    keywords: ["堅韌", "防備", "最後衝刺", "疲憊"],
    uprightMeaning: "歷經考驗仍堅持到底，帶著警覺與韌性完成最後一哩路。",
    reversedMeaning: "身心俱疲、過度防備，或因猜忌而拒絕他人協助。",
  },
  {
    rank: "十",
    englishRank: "Ten",
    number: 10,
    keywords: ["負擔", "責任", "壓力", "收尾"],
    uprightMeaning: "肩負沉重的責任與壓力，即將完成階段性任務但感到吃力。",
    reversedMeaning: "放下不必要的負擔、學會授權，或壓力大到瀕臨崩潰。",
  },
  {
    rank: "侍者",
    englishRank: "Page",
    number: 11,
    keywords: ["探索", "熱忱", "學習", "冒險精神"],
    uprightMeaning: "帶著好奇與熱忱展開新的探索，充滿學習與冒險的活力。",
    reversedMeaning: "三分鐘熱度、缺乏方向，或計畫尚未成熟就貿然行動。",
  },
  {
    rank: "騎士",
    englishRank: "Knight",
    number: 12,
    keywords: ["衝勁", "冒險", "果斷", "急躁"],
    uprightMeaning: "充滿行動力與冒險精神，果斷追求目標，勇往直前。",
    reversedMeaning: "魯莽衝動、半途而廢，或因急躁而忽略風險。",
  },
  {
    rank: "王后",
    englishRank: "Queen",
    number: 13,
    keywords: ["自信", "魅力", "獨立", "溫暖"],
    uprightMeaning: "展現自信與獨立的個人魅力，溫暖而堅定地引領他人。",
    reversedMeaning: "過度強勢、缺乏安全感，或魅力被嫉妒所掩蓋。",
  },
  {
    rank: "國王",
    englishRank: "King",
    number: 14,
    keywords: ["領導", "願景", "果敢", "開創"],
    uprightMeaning: "具備領導力與遠見，果敢地開創新局並激勵他人。",
    reversedMeaning: "專斷獨行、過度自信，或領導方向偏離初衷。",
  },
];

const CUPS_RANKS: MinorRank[] = [
  {
    rank: "王牌",
    englishRank: "Ace",
    number: 1,
    keywords: ["情感", "新戀情", "直覺", "滿溢的愛"],
    uprightMeaning: "象徵情感的新開始，愛與直覺滿溢，內心充滿喜悅與連結。",
    reversedMeaning: "情感壓抑、關係失衡，或內心空虛難以敞開。",
  },
  {
    rank: "二",
    englishRank: "Two",
    number: 2,
    keywords: ["連結", "夥伴關係", "和諧", "吸引力"],
    uprightMeaning: "兩人之間建立深刻的情感連結，彼此吸引、和諧共鳴。",
    reversedMeaning: "關係失衡、誤解漸生，或連結逐漸疏遠。",
  },
  {
    rank: "三",
    englishRank: "Three",
    number: 3,
    keywords: ["慶祝", "友誼", "團聚", "喜悅"],
    uprightMeaning: "與親友歡聚慶祝，分享喜悅與豐盛的情感支持。",
    reversedMeaning: "群體疏離、過度享樂，或第三者介入關係。",
  },
  {
    rank: "四",
    englishRank: "Four",
    number: 4,
    keywords: ["沉思", "冷漠", "錯失機會", "不滿足"],
    uprightMeaning:
      "對現狀感到麻木或不滿足，沉浸在自己的情緒中而錯過眼前機會。",
    reversedMeaning: "重新打開心房、開始留意被忽略的機會。",
  },
  {
    rank: "五",
    englishRank: "Five",
    number: 5,
    keywords: ["失落", "悲傷", "遺憾", "重新出發"],
    uprightMeaning: "沉浸在失落與遺憾中，但仍有轉身重新出發的可能。",
    reversedMeaning: "走出悲傷、原諒過去，重新找回希望。",
  },
  {
    rank: "六",
    englishRank: "Six",
    number: 6,
    keywords: ["懷舊", "純真", "童年回憶", "給予"],
    uprightMeaning: "帶著懷舊與純真的心情，回顧過去美好的回憶與情感連結。",
    reversedMeaning: "過度沉溺過去、無法向前，或懷舊被理想化。",
  },
  {
    rank: "七",
    englishRank: "Seven",
    number: 7,
    keywords: ["幻想", "選擇", "迷惘", "誘惑"],
    uprightMeaning: "面對眾多選擇與幻想，容易迷失方向，需分辨真實與幻象。",
    reversedMeaning: "看清幻象、做出實際的選擇，擺脫優柔寡斷。",
  },
  {
    rank: "八",
    englishRank: "Eight",
    number: 8,
    keywords: ["放下", "尋找意義", "離開", "內在追尋"],
    uprightMeaning: "放下已擁有的一切，轉身尋找更深層的意義與滿足。",
    reversedMeaning: "害怕改變、逃避該放下的關係或處境。",
  },
  {
    rank: "九",
    englishRank: "Nine",
    number: 9,
    keywords: ["滿足", "願望成真", "享受", "感恩"],
    uprightMeaning: "願望得以實現，內心感到滿足與感恩，享受當下的美好。",
    reversedMeaning: "表面滿足、內在空虛，或貪求更多而忽略已擁有的。",
  },
  {
    rank: "十",
    englishRank: "Ten",
    number: 10,
    keywords: ["圓滿", "家庭幸福", "和諧", "情感豐盈"],
    uprightMeaning: "象徵情感與家庭的圓滿和諧，深刻的幸福與歸屬感。",
    reversedMeaning: "家庭失和、理想與現實有落差，或關係表面和諧內在疏離。",
  },
  {
    rank: "侍者",
    englishRank: "Page",
    number: 11,
    keywords: ["直覺訊息", "創意", "純真情感", "好奇心"],
    uprightMeaning:
      "帶著純真的好奇心接收直覺與創意的訊息，情感細膩敏銳。",
    reversedMeaning: "情緒化、逃避現實，或創意想法尚未成熟。",
  },
  {
    rank: "騎士",
    englishRank: "Knight",
    number: 12,
    keywords: ["浪漫", "理想主義", "追求", "溫柔"],
    uprightMeaning: "懷抱浪漫與理想，以溫柔而堅定的方式追求所愛。",
    reversedMeaning: "不切實際的幻想、情感反覆，或以浪漫掩飾逃避。",
  },
  {
    rank: "王后",
    englishRank: "Queen",
    number: 13,
    keywords: ["同理心", "直覺", "溫柔", "情感智慧"],
    uprightMeaning: "擁有深刻的同理心與直覺，以溫柔的情感智慧照顧他人。",
    reversedMeaning: "情緒氾濫、過度犧牲自己，或界線模糊。",
  },
  {
    rank: "國王",
    englishRank: "King",
    number: 14,
    keywords: ["情緒穩定", "智慧", "包容", "平衡"],
    uprightMeaning: "情緒成熟穩定，以智慧與包容平衡理性與感性。",
    reversedMeaning: "情緒壓抑、表面平靜內心波濤，或操控他人情感。",
  },
];

const SWORDS_RANKS: MinorRank[] = [
  {
    rank: "王牌",
    englishRank: "Ace",
    number: 1,
    keywords: ["清晰", "真相", "突破", "新觀點"],
    uprightMeaning:
      "象徵思緒清晰與真相浮現，帶來突破性的新觀點與決斷力。",
    reversedMeaning: "思緒混亂、誤解叢生，或濫用言語傷人。",
  },
  {
    rank: "二",
    englishRank: "Two",
    number: 2,
    keywords: ["猶豫", "僵局", "兩難", "逃避"],
    uprightMeaning: "面臨兩難的抉擇，選擇逃避或蒙蔽自己以維持表面平靜。",
    reversedMeaning: "猶豫終結、真相揭曉，或被迫做出決定。",
  },
  {
    rank: "三",
    englishRank: "Three",
    number: 3,
    keywords: ["心碎", "傷痛", "背叛", "釋放"],
    uprightMeaning: "經歷情感上的傷痛與背叛，痛苦但也是釋放與療癒的開始。",
    reversedMeaning: "傷痛逐漸癒合、學會原諒，或舊傷再度被觸動。",
  },
  {
    rank: "四",
    englishRank: "Four",
    number: 4,
    keywords: ["休息", "沉澱", "恢復", "暫停"],
    uprightMeaning:
      "需要暫停腳步，讓身心得到休息與沉澱，蓄積下一步的力量。",
    reversedMeaning: "被迫停下、休息不足，或重新回到緊繃的步調。",
  },
  {
    rank: "五",
    englishRank: "Five",
    number: 5,
    keywords: ["衝突", "爭執", "兩敗俱傷", "自我中心"],
    uprightMeaning:
      "爭執中即使獲勝也可能兩敗俱傷，需留意自我中心帶來的代價。",
    reversedMeaning: "化解衝突、放下爭鬥，或承認自己的過失。",
  },
  {
    rank: "六",
    englishRank: "Six",
    number: 6,
    keywords: ["過渡", "轉移", "離開困境", "前行"],
    uprightMeaning:
      "帶著過去的傷痛緩緩過渡到更平靜的處境，逐漸遠離困境。",
    reversedMeaning: "難以放下過去、轉變受阻，或重蹈覆轍。",
  },
  {
    rank: "七",
    englishRank: "Seven",
    number: 7,
    keywords: ["策略", "欺瞞", "獨自行動", "迴避"],
    uprightMeaning:
      "用策略或迂迴的方式達成目的，需留意誠信與獨自行動的風險。",
    reversedMeaning: "欺瞞被揭穿、良心不安，或決定坦誠面對。",
  },
  {
    rank: "八",
    englishRank: "Eight",
    number: 8,
    keywords: ["受限", "自我設限", "無助", "困境"],
    uprightMeaning: "感覺被困住、動彈不得，但限制多半來自自己的想法。",
    reversedMeaning: "掙脫束縛、找回自主權，看清其實有其他選擇。",
  },
  {
    rank: "九",
    englishRank: "Nine",
    number: 9,
    keywords: ["焦慮", "惡夢", "憂慮", "內心煎熬"],
    uprightMeaning: "深陷焦慮與憂慮的內心煎熬，恐懼往往比現實更誇大。",
    reversedMeaning: "走出焦慮、尋求協助，或憂慮開始緩解。",
  },
  {
    rank: "十",
    englishRank: "Ten",
    number: 10,
    keywords: ["結束", "谷底", "背叛", "重生前夕"],
    uprightMeaning:
      "象徵痛苦的結束與谷底，雖然艱難但也代表即將迎來重生。",
    reversedMeaning: "緩慢復原、拒絕接受結束，或最壞的情況已經過去。",
  },
  {
    rank: "侍者",
    englishRank: "Page",
    number: 11,
    keywords: ["好奇", "警覺", "溝通", "求知慾"],
    uprightMeaning:
      "充滿好奇心與求知慾，觀察敏銳，樂於學習新的想法與溝通方式。",
    reversedMeaning: "言語傷人、八卦是非，或想法尚未成熟就急於表達。",
  },
  {
    rank: "騎士",
    englishRank: "Knight",
    number: 12,
    keywords: ["果斷", "直接", "衝動", "速度"],
    uprightMeaning: "以果斷直接的態度快速行動，追求目標毫不猶豫。",
    reversedMeaning: "魯莽衝動、缺乏考慮，或言詞過於尖銳傷人。",
  },
  {
    rank: "王后",
    englishRank: "Queen",
    number: 13,
    keywords: ["理性", "獨立", "直言不諱", "洞察力"],
    uprightMeaning: "擁有清晰的洞察力與獨立思考，直言不諱且公正客觀。",
    reversedMeaning: "過於嚴苛、情感疏離，或言語尖酸刻薄。",
  },
  {
    rank: "國王",
    englishRank: "King",
    number: 14,
    keywords: ["權威", "邏輯", "公正", "智識"],
    uprightMeaning: "以邏輯與公正的態度行使權威，理性分析後做出明智決策。",
    reversedMeaning: "濫用權力、過度批判，或固執己見缺乏彈性。",
  },
];

const PENTACLES_RANKS: MinorRank[] = [
  {
    rank: "王牌",
    englishRank: "Ace",
    number: 1,
    keywords: ["機會", "豐盛", "新資源", "踏實開始"],
    uprightMeaning:
      "象徵物質層面的新機會，豐盛的資源與踏實的開始正在萌芽。",
    reversedMeaning: "錯失機會、財務不穩，或計畫缺乏實際基礎。",
  },
  {
    rank: "二",
    englishRank: "Two",
    number: 2,
    keywords: ["平衡", "調適", "多工", "彈性"],
    uprightMeaning: "在多項事務間靈活調適與平衡，保持彈性因應變化。",
    reversedMeaning: "失衡、蠟燭兩頭燒，或難以兼顧多重責任。",
  },
  {
    rank: "三",
    englishRank: "Three",
    number: 3,
    keywords: ["合作", "技藝", "團隊", "專業"],
    uprightMeaning: "透過團隊合作與專業技藝共同完成有價值的成果。",
    reversedMeaning: "團隊合作不順、缺乏認可，或各自為政。",
  },
  {
    rank: "四",
    englishRank: "Four",
    number: 4,
    keywords: ["掌控", "保守", "安全感", "執著"],
    uprightMeaning: "緊抓資源與安全感，重視穩定但也可能過於保守執著。",
    reversedMeaning: "過度控制物質、放手練習，或財務上的不安全感。",
  },
  {
    rank: "五",
    englishRank: "Five",
    number: 5,
    keywords: ["困頓", "匱乏", "孤立無援", "逆境"],
    uprightMeaning: "面臨物質或精神上的匱乏與困頓，感到孤立無援。",
    reversedMeaning: "逆境好轉、尋得援助，或走出經濟困境。",
  },
  {
    rank: "六",
    englishRank: "Six",
    number: 6,
    keywords: ["分享", "慷慨", "施與受", "公平"],
    uprightMeaning: "在施與受之間找到平衡，慷慨分享資源並獲得公平回饋。",
    reversedMeaning: "施捨帶有條件、資源分配不均，或過度依賴他人。",
  },
  {
    rank: "七",
    englishRank: "Seven",
    number: 7,
    keywords: ["耐心", "評估", "長期投資", "停頓反思"],
    uprightMeaning: "停下腳步評估成果，耐心等待長期努力開花結果。",
    reversedMeaning: "缺乏耐心、投資回報不如預期，或半途而廢。",
  },
  {
    rank: "八",
    englishRank: "Eight",
    number: 8,
    keywords: ["專注", "精進", "磨練技藝", "勤奮"],
    uprightMeaning: "專注投入、反覆磨練技藝，透過勤奮累積實力。",
    reversedMeaning: "缺乏動力、粗製濫造，或技能停滯不前。",
  },
  {
    rank: "九",
    englishRank: "Nine",
    number: 9,
    keywords: ["富足", "自立", "成果", "優雅獨立"],
    uprightMeaning: "憑藉自己的努力享有富足與自立，優雅地品味成果。",
    reversedMeaning: "過度依賴他人、揮霍成果，或表面富足內在空虛。",
  },
  {
    rank: "十",
    englishRank: "Ten",
    number: 10,
    keywords: ["傳承", "家族", "長久穩定", "財富"],
    uprightMeaning: "象徵長久的穩定與家族傳承，物質與情感基礎皆豐厚。",
    reversedMeaning: "家族紛爭、財務糾紛，或傳承出現斷層。",
  },
  {
    rank: "侍者",
    englishRank: "Page",
    number: 11,
    keywords: ["學習", "務實", "新機會", "腳踏實地"],
    uprightMeaning: "帶著務實的態度學習新技能，把握腳踏實地的成長機會。",
    reversedMeaning: "缺乏規劃、好高騖遠，或學習半途而廢。",
  },
  {
    rank: "騎士",
    englishRank: "Knight",
    number: 12,
    keywords: ["勤勉", "穩健", "責任感", "按部就班"],
    uprightMeaning: "以穩健勤勉的態度按部就班完成任務，值得信賴。",
    reversedMeaning: "固執保守、進度停滯，或過度謹慎錯失良機。",
  },
  {
    rank: "王后",
    englishRank: "Queen",
    number: 13,
    keywords: ["務實", "滋養", "豐盛", "居家"],
    uprightMeaning: "兼具務實與滋養特質，將豐盛的資源用心經營生活與家庭。",
    reversedMeaning: "過度操勞、忽略自我照顧，或財務規劃失衡。",
  },
  {
    rank: "國王",
    englishRank: "King",
    number: 14,
    keywords: ["富足", "穩健領導", "成就", "慷慨"],
    uprightMeaning:
      "憑藉穩健的領導與務實的態度累積財富與成就，慷慨大方。",
    reversedMeaning: "過度看重物質、固執保守，或濫用資源。",
  },
];

function buildSuit(suit: TarotSuit, ranks: MinorRank[]): TarotCardData[] {
  return ranks.map((r) => ({
    id: `${r.englishRank.toLowerCase()}-of-${suit}`,
    name: `${SUIT_NAME[suit]}${r.rank}`,
    englishName: `${r.englishRank} of ${
      suit.charAt(0).toUpperCase() + suit.slice(1)
    }`,
    suit,
    number: r.number,
    image: `/cards/${r.englishRank.toLowerCase()}-of-${suit}.webp`,
    keywords: r.keywords,
    uprightMeaning: r.uprightMeaning,
    reversedMeaning: r.reversedMeaning,
  }));
}

export const minorArcana: TarotCardData[] = [
  ...buildSuit("wands", WANDS_RANKS),
  ...buildSuit("cups", CUPS_RANKS),
  ...buildSuit("swords", SWORDS_RANKS),
  ...buildSuit("pentacles", PENTACLES_RANKS),
];

// 完整 78 張牌牌庫（大阿爾克那 22 ＋ 小阿爾克那 56），供抽牌邏輯使用。
export const tarotDeck: TarotCardData[] = [...majorArcana, ...minorArcana];
