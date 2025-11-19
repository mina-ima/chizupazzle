
import { Prefecture } from './types';

// Metadata for Japan's 47 prefectures.
// Geometry (SVG Paths) is now loaded dynamically via utils/geoUtils.ts
export const PREFECTURES: Prefecture[] = [
  { code: 1, name: "北海道", romaji: "Hokkaido" },
  { code: 2, name: "青森", romaji: "Aomori" },
  { code: 3, name: "岩手", romaji: "Iwate" },
  { code: 4, name: "宮城", romaji: "Miyagi" },
  { code: 5, name: "秋田", romaji: "Akita" },
  { code: 6, name: "山形", romaji: "Yamagata" },
  { code: 7, name: "福島", romaji: "Fukushima" },
  { code: 8, name: "茨城", romaji: "Ibaraki" },
  { code: 9, name: "栃木", romaji: "Tochigi" },
  { code: 10, name: "群馬", romaji: "Gunma" },
  { code: 11, name: "埼玉", romaji: "Saitama" },
  { code: 12, name: "千葉", romaji: "Chiba" },
  { code: 13, name: "東京", romaji: "Tokyo" },
  { code: 14, name: "神奈川", romaji: "Kanagawa" },
  { code: 15, name: "新潟", romaji: "Niigata" },
  { code: 16, name: "富山", romaji: "Toyama" },
  { code: 17, name: "石川", romaji: "Ishikawa" },
  { code: 18, name: "福井", romaji: "Fukui" },
  { code: 19, name: "山梨", romaji: "Yamanashi" },
  { code: 20, name: "長野", romaji: "Nagano" },
  { code: 21, name: "岐阜", romaji: "Gifu" },
  { code: 22, name: "静岡", romaji: "Shizuoka" },
  { code: 23, name: "愛知", romaji: "Aichi" },
  { code: 24, name: "三重", romaji: "Mie" },
  { code: 25, name: "滋賀", romaji: "Shiga" },
  { code: 26, name: "京都", romaji: "Kyoto" },
  { code: 27, name: "大阪", romaji: "Osaka" },
  { code: 28, name: "兵庫", romaji: "Hyogo" },
  { code: 29, name: "奈良", romaji: "Nara" },
  { code: 30, name: "和歌山", romaji: "Wakayama" },
  { code: 31, name: "鳥取", romaji: "Tottori" },
  { code: 32, name: "島根", romaji: "Shimane" },
  { code: 33, name: "岡山", romaji: "Okayama" },
  { code: 34, name: "広島", romaji: "Hiroshima" },
  { code: 35, name: "山口", romaji: "Yamaguchi" },
  { code: 36, name: "徳島", romaji: "Tokushima" },
  { code: 37, name: "香川", romaji: "Kagawa" },
  { code: 38, name: "愛媛", romaji: "Ehime" },
  { code: 39, name: "高知", romaji: "Kochi" },
  { code: 40, name: "福岡", romaji: "Fukuoka" },
  { code: 41, name: "佐賀", romaji: "Saga" },
  { code: 42, name: "長崎", romaji: "Nagasaki" },
  { code: 43, name: "熊本", romaji: "Kumamoto" },
  { code: 44, name: "大分", romaji: "Oita" },
  { code: 45, name: "宮崎", romaji: "Miyazaki" },
  { code: 46, name: "鹿児島", romaji: "Kagoshima" },
  { code: 47, name: "沖縄", romaji: "Okinawa" }
];

export const CAPITALS: Record<number, string> = {
  1: "札幌", 2: "青森", 3: "盛岡", 4: "仙台", 5: "秋田", 6: "山形", 7: "福島",
  8: "水戸", 9: "宇都宮", 10: "前橋", 11: "さいたま", 12: "千葉", 13: "東京", 14: "横浜",
  15: "新潟", 16: "富山", 17: "金沢", 18: "福井", 19: "甲府", 20: "長野", 21: "岐阜",
  22: "静岡", 23: "名古屋", 24: "津", 25: "大津", 26: "京都", 27: "大阪", 28: "神戸",
  29: "奈良", 30: "和歌山", 31: "鳥取", 32: "松江", 33: "岡山", 34: "広島", 35: "山口",
  36: "徳島", 37: "高松", 38: "松山", 39: "高知", 40: "福岡", 41: "佐賀", 42: "長崎",
  43: "熊本", 44: "大分", 45: "宮崎", 46: "鹿児島", 47: "那覇"
};

export const GOURMET_DATA: Record<number, string> = {
  1: "ジンギスカン", 2: "りんご", 3: "わんこそば", 4: "牛タン", 5: "きりたんぽ", 6: "さくらんぼ", 7: "桃",
  8: "納豆", 9: "餃子", 10: "こんにゃく", 11: "草加せんべい", 12: "落花生", 13: "もんじゃ焼き", 14: "中華街の肉まん",
  15: "お米（コシヒカリ）", 16: "ます寿司", 17: "金沢カレー", 18: "越前ガニ", 19: "ほうとう", 20: "信州そば", 21: "飛騨牛",
  22: "お茶", 23: "みそかつ", 24: "松阪牛", 25: "近江牛", 26: "八つ橋", 27: "たこ焼き", 28: "神戸牛",
  29: "柿の葉寿司", 30: "みかん", 31: "梨", 32: "出雲そば", 33: "きびだんご", 34: "お好み焼き", 35: "ふぐ",
  36: "すだち", 37: "讃岐うどん", 38: "みかん", 39: "カツオのたたき", 40: "明太子", 41: "佐賀牛", 42: "ちゃんぽん",
  43: "からし蓮根", 44: "とり天", 45: "マンゴー", 46: "黒豚", 47: "ゴーヤチャンプルー"
};

export const LANDMARK_DATA: Record<number, string> = {
  1: "時計台", 2: "ねぶた祭り", 3: "中尊寺金色堂", 4: "松島", 5: "なまはげ", 6: "蔵王の樹氷", 7: "スパリゾートハワイアンズ",
  8: "偕楽園", 9: "日光東照宮", 10: "草津温泉", 11: "鉄道博物館", 12: "ディズニーランド", 13: "スカイツリー", 14: "みなとみらい",
  15: "佐渡島", 16: "黒部ダム", 17: "兼六園", 18: "恐竜博物館", 19: "富士山", 20: "善光寺", 21: "白川郷",
  22: "富士山", 23: "名古屋城", 24: "伊勢神宮", 25: "琵琶湖", 26: "金閣寺", 27: "大阪城", 28: "姫路城",
  29: "東大寺の大仏", 30: "アドベンチャーワールド", 31: "鳥取砂丘", 32: "出雲大社", 33: "倉敷美観地区", 34: "厳島神社", 35: "錦帯橋",
  36: "鳴門の渦潮", 37: "金刀比羅宮", 38: "道後温泉", 39: "桂浜", 40: "太宰府天満宮", 41: "吉野ヶ里遺跡", 42: "ハウステンボス",
  43: "阿蘇山", 44: "別府温泉", 45: "高千穂峡", 46: "桜島", 47: "美ら海水族館"
};

export const MASCOT_DATA: Record<number, string> = {
  1: "キュンちゃん", 2: "いくべぇ", 3: "そばっち", 4: "むすび丸", 5: "んだッチ", 6: "きてけろくん", 7: "キビタン",
  8: "ハッスル黄門", 9: "とちまるくん", 10: "ぐんまちゃん", 11: "コバトン", 12: "チーバくん", 13: "ゆりーと", 14: "かながわキンタロウ",
  15: "トッキッキ", 16: "きときと君", 17: "ひゃくまんさん", 18: "はぴりゅう", 19: "武田菱丸", 20: "アルクマ", 21: "ミナモ",
  22: "ふじっぴー", 23: "はち丸", 24: "シロモチくん", 25: "ひこにゃん", 26: "まゆまろ", 27: "もずやん", 28: "はばタン",
  29: "せんとくん", 30: "きいちゃん", 31: "トリピー", 32: "しまねっこ", 33: "ももっち", 34: "ブンカッキー", 35: "ちょるる",
  36: "すだちくん", 37: "うどん脳", 38: "みきゃん", 39: "くろしおくん", 40: "エコトン", 41: "壺侍", 42: "がんばくん",
  43: "くまモン", 44: "めじろん", 45: "みやざき犬", 46: "ぐりぶー", 47: "花笠マハエ"
};

// Manual Image Override for Mascots (Fill in URLs here to skip auto-fetch)
export const MASCOT_IMAGES: Record<number, string> = {
  1: "https://gotouchi-chara.jp/org/wp-content/uploads/2020/03/kyunchan.png", // 北海道: キュンちゃん
  2: "https://www.yurugp.jp/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsiZGF0YSI6Mzg1MywicHVyIjoiYmxvYl9pZCJ9fQ==--2db0346eefa223d7424d21a1ee8bf7f24f030c1a/00000439.jpg", // 青森: いくべぇ
  3: "https://www.yurugp.jp/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MzU4NjYsInB1ciI6ImJsb2JfaWQifX0=--8403e5fe97e1d8b832e0e00f3300ffafd8efc824/00004176.jpg", // 岩手: そばっち
  4: "https://gotouchi-chara.jp/org/wp-content/uploads/2020/03/musubimaru.png", // 宮城: むすび丸
  5: "https://www.pref.akita.lg.jp/uploads/public/archive_0000033524_00/imagetools0_0.png", // 秋田: んだッチ
  6: "https://www.yurugp.jp/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTE1ODQsInB1ciI6ImJsb2JfaWQifX0=--637effeaaa5ba1e3f20c49e74677e7114dd70bdf/00001344.jpg", // 山形: きてけろくん
  7: "https://www.yurugp.jp/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsiZGF0YSI6OTgyLCJwdXIiOiJibG9iX2lkIn19--bea7434b9d810a638bb04d3c83fc0b6f95630a38/00000111.jpg", // 福島: キビタン
  8: "https://gotouchi-chara.jp/org/wp-content/uploads/2020/03/hassurukoumon.png", // 茨城: ハッスル黄門
  9: "https://www.pref.tochigi.lg.jp/c05/intro/tochigiken/hakken/images/45_tochimaru_l.jpg", // 栃木: とちまるくん
  10: "https://gunmachan-official.jp/animation/wp/wp-content/uploads/2021/06/gunmachan.png", // 群馬: ぐんまちゃん
  11: "https://www.pref.saitama.lg.jp/images/147721/5-1-01.png", // 埼玉: コバトン
  12: "https://www.pref.chiba.lg.jp/kouhou/miryoku/chi-ba-kun/images/chi-ba_big.gif", // 千葉: チーバくん
  13: "https://www.lip-luck.co.jp/lip-luck_new/wp-content/uploads/2020/01/%E6%9D%B1%E4%BA%AC%E5%9B%BD%E4%BD%932013-%E3%82%86%E3%82%8A%E3%83%BC%E3%81%A81.jpg", // 東京: ゆりーと
  14: "https://yurugp.jp/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTIyMTQsInB1ciI6ImJsb2JfaWQifX0=--52bf81ada73e956b8717e34a001fab52832cf04d/00001414.jpg", // 神奈川: かながわキンタロウ
  15: "https://www.pref.niigata.lg.jp/uploaded/image/27514.gif", // 新潟: トッキッキ
  16: "https://www.pref.toyama.jp/images/45537/kigurumi.jpg", // 富山: きときと君
  17: "https://pbs.twimg.com/profile_images/1809057371328761859/hKWQn3Oy_400x400.jpg", // 石川: ひゃくまんさん
  18: "https://happy-ryu-fukui.com/wordpress/wp-content/uploads/2019/09/design.png", // 福井: はぴりゅう
  19: "https://www.yamanashi-kankou.jp/kankou/event/images/hishimaru.png", // 山梨: 武田菱丸
  20: "https://arukuma.jp/wp/wp-content/themes/world/images/common/arukuma_about.png", // 長野: アルクマ
  21: "https://www.pref.gifu.lg.jp/uploaded/image/12676.jpg", // 岐阜: ミナモ
  22: "https://prcdn.freetls.fastly.net/release_image/79445/96/79445-96-a20f39be753c535adadcc6d44af2be0a-1187x1339.png?format=jpeg&auto=webp&quality=85%2C65&width=1950&height=1350&fit=bounds", // 静岡: ふじっぴー
  23: "https://www.city.nagoya.jp/_res/projects/default_project/_page_/001/014/025/hachimaru.jpg", // 愛知: はち丸
  24: "https://www.yurugp.jp/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsiZGF0YSI6NDQwOTYsInB1ciI6ImJsb2JfaWQifX0=--a523e327ca65dd01711b562c9437b32d52325588/00000087.jpg", // 三重: シロモチくん
  25: "https://www.city.hikone.lg.jp/material/images/group/4/shoukai.png", // 滋賀: ひこにゃん
  26: "https://mayumaro.jp/assets/img/prof_mayumaro.png", // 京都: まゆまろ
  27: "https://www.pref.osaka.lg.jp/images/27681/01_1.jpg", // 大阪: もずやん
  28: "https://web.pref.hyogo.lg.jp/kk03/images/habatan5.jpg", // 兵庫: はばタン
  29: "https://www.pref.nara.jp/secure/125341/piisu_thumb.png", // 奈良: せんとくん
  30: "https://www.pref.wakayama.lg.jp/prefg/000200/wakayamaprcharacter/kiichan_profile_d/img/001.jpg", // 和歌山: きいちゃん
  31: "https://gotouchi-chara.jp/org/wp-content/uploads/2020/03/toripii.png", // 鳥取: トリピー
  32: "https://www.kankou-shimane.com/shimanekko/images/design/dl01/char07.png", // 島根: しまねっこ
  33: "https://miryoku-harenokuni-okayama.jp/momo-ura/images/profile-momo.gif", // 岡山: ももっち
  34: "https://pbs.twimg.com/media/Ggkg3ztbUAA8yra.png", // 広島: ブンカッキー
  35: "https://choruru.jp/wordperss/wp-content/themes/choruru-tmp/images/top/img_slider_1@2x.png", // 山口: ちょるる
  36: "https://sudachikun.jp/images/introduction/full01.png", // 徳島: すだちくん
  37: "https://prtimes.jp/i/23616/126/resize/d23616-126-202672-0.png", // 香川: うどん脳
  38: "https://www.pref.ehime.jp/img/site/mican/img_mican01_sp.png", // 愛媛: みきゃん
  39: "https://mangaoukoku-tosa.jp/old/data/504/L152.jpg", // 高知: くろしおくん
  40: "https://www.smappon.jp/cc101914/file/96740.jpg", // 福岡: エコトン
  41: "https://prtimes.jp/i/27600/144/resize/d27600-144-195376-3.jpg", // 佐賀: 壺侍
  42: "https://www.pref.nagasaki.jp/shared/uploads/2023/01/1674873875-252x300.jpg", // 長崎: がんばくん
  43: "https://kumamon-land.jp/profile/img/ph_profile.png", // 熊本: くまモン
  44: "https://www.pref.oita.jp/img/ogp-oita-pref.png", // 大分: めじろん
  45: "https://ouendan.kanko-miyazaki.jp/wp-content/themes/hinata-oendan/img/img-muchan.png", // 宮崎: みやざき犬
  46: "https://greboo.com/system/wp-content/themes/greboo2015/function/img/page/profile/greboo_img.png", // 鹿児島: ぐりぶー
  47: "https://www.ocvb.or.jp/res/img/activities/mahae/profile_mahae.jpg", // 沖縄: 花笠マハエ
};


// 日本一・産業 (Production/Industry No.1 or Famous)
export const RANKING_DATA: Record<number, string> = {
  1: "じゃがいも日本一", 2: "にんにく日本一", 3: "ホップ日本一", 4: "サメの水揚げ", 5: "じゅんさい", 6: "西洋ナシ", 7: "桃の消費量",
  8: "メロン日本一", 9: "いちご日本一", 10: "こんにゃく芋", 11: "ひな人形", 12: "醤油（しょうゆ）", 13: "本の出版数", 14: "シュウマイ",
  15: "米菓（せんべい）", 16: "チューリップ球根", 17: "金箔（きんぱく）", 18: "メガネフレーム", 19: "ぶどう日本一", 20: "レタス日本一", 21: "包丁・刃物",
  22: "お茶日本一", 23: "自動車づくり", 24: "ろうそく", 25: "ふなずし", 26: "西陣織", 27: "歯ブラシ", 28: "酒米（日本酒）",
  29: "靴下（くつした）", 30: "梅（うめ）日本一", 31: "カニの水揚げ", 32: "シジミ", 33: "学生服", 34: "レモン日本一", 35: "瓦（かわら）",
  36: "LED（光るやつ）", 37: "うちわ", 38: "タオルの生産", 39: "ゆず日本一", 40: "家具（かぐ）", 41: "海苔（のり）", 42: "ビワ日本一",
  43: "トマト日本一", 44: "温泉の数日本一", 45: "ピーマン", 46: "さつまいも", 47: "パイナップル"
};

// 伝統工芸 (Traditional Crafts)
export const CRAFT_DATA: Record<number, string> = {
  1: "二風谷イタ", 2: "津軽塗", 3: "南部鉄器", 4: "宮城伝統こけし", 5: "曲げわっぱ", 6: "天童将棋駒", 7: "赤べこ",
  8: "結城紬", 9: "益子焼", 10: "高崎だるま", 11: "岩槻人形", 12: "房州うちわ", 13: "江戸切子", 14: "寄木細工",
  15: "小千谷縮", 16: "高岡銅器", 17: "輪島塗", 18: "越前和紙", 19: "甲州印伝", 20: "木曽漆器", 21: "美濃焼",
  22: "駿河竹千筋細工", 23: "瀬戸焼", 24: "伊勢型紙", 25: "信楽焼", 26: "清水焼", 27: "大阪浪華錫器", 28: "丹波立杭焼",
  29: "奈良筆", 30: "紀州漆器", 31: "因州和紙", 32: "石見焼", 33: "備前焼", 34: "熊野筆", 35: "萩焼",
  36: "阿波おどり用品", 37: "丸亀うちわ", 38: "砥部焼", 39: "土佐和紙", 40: "博多織", 41: "有田焼", 42: "波佐見焼",
  43: "山鹿灯籠", 44: "別府竹細工", 45: "都城大弓", 46: "薩摩切子", 47: "琉球ガラス"
};

// 人口ランキング (Approx 2020 Census data for stability)
export const POPULATION_DATA: Record<number, string> = {
  13: "人口 1位\n約1400万人", // Tokyo
  14: "人口 2位\n約920万人", // Kanagawa
  27: "人口 3位\n約880万人", // Osaka
  23: "人口 4位\n約750万人", // Aichi
  11: "人口 5位\n約730万人", // Saitama
  12: "人口 6位\n約620万人", // Chiba
  28: "人口 7位\n約540万人", // Hyogo
  1:  "人口 8位\n約520万人", // Hokkaido
  40: "人口 9位\n約510万人", // Fukuoka
  22: "人口 10位\n約360万人", // Shizuoka
  8:  "人口 11位\n約280万人", // Ibaraki
  34: "人口 12位\n約280万人", // Hiroshima
  26: "人口 13位\n約250万人", // Kyoto
  4:  "人口 14位\n約230万人", // Miyagi
  15: "人口 15位\n約220万人", // Niigata
  20: "人口 16位\n約200万人", // Nagano
  21: "人口 17位\n約190万人", // Gifu
  10: "人口 18位\n約190万人", // Gunma
  9:  "人口 19位\n約190万人", // Tochigi
  33: "人口 20位\n約180万人", // Okayama
  7:  "人口 21位\n約180万人", // Fukushima
  24: "人口 22位\n約170万人", // Mie
  43: "人口 23位\n約170万人", // Kumamoto
  46: "人口 24位\n約150万人", // Kagoshima
  47: "人口 25位\n約140万人", // Okinawa
  25: "人口 26位\n約140万人", // Shiga
  35: "人口 27位\n約130万人", // Yamaguchi
  38: "人口 28位\n約130万人", // Ehime
  42: "人口 29位\n約130万人", // Nagasaki
  29: "人口 30位\n約130万人", // Nara
  2:  "人口 31位\n約120万人", // Aomori
  3:  "人口 32位\n約120万人", // Iwate
  17: "人口 33位\n約110万人", // Ishikawa
  44: "人口 34位\n約110万人", // Oita
  45: "人口 35位\n約100万人", // Miyazaki
  6:  "人口 36位\n約100万人", // Yamagata
  16: "人口 37位\n約100万人", // Toyama
  5:  "人口 38位\n約95万人",  // Akita
  37: "人口 39位\n約95万人",  // Kagawa
  30: "人口 40位\n約90万人",  // Wakayama
  19: "人口 41位\n約80万人",  // Yamanashi
  41: "人口 42位\n約80万人",  // Saga
  18: "人口 43位\n約76万人",  // Fukui
  36: "人口 44位\n約70万人",  // Tokushima
  39: "人口 45位\n約69万人",  // Kochi
  32: "人口 46位\n約67万人",  // Shimane
  31: "人口 47位\n約55万人"   // Tottori
};

// 面積ランキング (Area Ranking - standard approx)
export const AREA_DATA: Record<number, string> = {
  1:  "面積 1位\n約83,400km²", // Hokkaido
  3:  "面積 2位\n約15,200km²", // Iwate
  7:  "面積 3位\n約13,700km²", // Fukushima
  20: "面積 4位\n約13,500km²", // Nagano
  15: "面積 5位\n約12,500km²", // Niigata
  5:  "面積 6位\n約11,600km²", // Akita
  21: "面積 7位\n約10,600km²", // Gifu
  2:  "面積 8位\n約9,600km²",  // Aomori
  6:  "面積 9位\n約9,300km²",  // Yamagata
  46: "面積 10位\n約9,100km²", // Kagoshima
  34: "面積 11位\n約8,400km²", // Hiroshima
  28: "面積 12位\n約8,400km²", // Hyogo
  22: "面積 13位\n約7,700km²", // Shizuoka
  45: "面積 14位\n約7,700km²", // Miyazaki
  43: "面積 15位\n約7,400km²", // Kumamoto
  4:  "面積 16位\n約7,200km²", // Miyagi
  33: "面積 17位\n約7,100km²", // Okayama
  39: "面積 18位\n約7,100km²", // Kochi
  32: "面積 19位\n約6,700km²", // Shimane
  9:  "面積 20位\n約6,400km²", // Tochigi
  10: "面積 21位\n約6,300km²", // Gunma
  44: "面積 22位\n約6,300km²", // Oita
  35: "面積 23位\n約6,100km²", // Yamaguchi
  8:  "面積 24位\n約6,000km²", // Ibaraki
  24: "面積 25位\n約5,700km²", // Mie
  38: "面積 26位\n約5,600km²", // Ehime
  23: "面積 27位\n約5,100km²", // Aichi
  12: "面積 28位\n約5,100km²", // Chiba
  40: "面積 29位\n約4,900km²", // Fukuoka
  30: "面積 30位\n約4,700km²", // Wakayama
  26: "面積 31位\n約4,600km²", // Kyoto
  19: "面積 32位\n約4,400km²", // Yamanashi
  16: "面積 33位\n約4,200km²", // Toyama
  18: "面積 34位\n約4,100km²", // Fukui
  17: "面積 35位\n約4,100km²", // Ishikawa
  36: "面積 36位\n約4,100km²", // Tokushima
  42: "面積 37位\n約4,100km²", // Nagasaki
  11: "面積 38位\n約3,700km²", // Saitama
  29: "面積 39位\n約3,600km²", // Nara
  31: "面積 40位\n約3,500km²", // Tottori
  25: "面積 41位\n約4,000km²", // Shiga (Actually includes Lake Biwa area, officially ~4017)
  47: "面積 42位\n約2,200km²", // Okinawa
  14: "面積 43位\n約2,400km²", // Kanagawa
  41: "面積 44位\n約2,400km²", // Saga
  13: "面積 45位\n約2,100km²", // Tokyo
  27: "面積 46位\n約1,900km²", // Osaka
  37: "面積 47位\n約1,800km²"  // Kagawa
};
