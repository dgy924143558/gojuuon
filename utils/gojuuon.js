// 五十音图全部假名数据
const gojuuon = [
  // あ行
  { kata: 'ア', hira: 'あ', roma: 'a' },
  { kata: 'イ', hira: 'い', roma: 'i' },
  { kata: 'ウ', hira: 'う', roma: 'u' },
  { kata: 'エ', hira: 'え', roma: 'e' },
  { kata: 'オ', hira: 'お', roma: 'o' },
  // か行
  { kata: 'カ', hira: 'か', roma: 'ka' },
  { kata: 'キ', hira: 'き', roma: 'ki' },
  { kata: 'ク', hira: 'く', roma: 'ku' },
  { kata: 'ケ', hira: 'け', roma: 'ke' },
  { kata: 'コ', hira: 'こ', roma: 'ko' },
  // さ行
  { kata: 'サ', hira: 'さ', roma: 'sa' },
  { kata: 'シ', hira: 'し', roma: 'shi' },
  { kata: 'ス', hira: 'す', roma: 'su' },
  { kata: 'セ', hira: 'せ', roma: 'se' },
  { kata: 'ソ', hira: 'そ', roma: 'so' },
  // た行
  { kata: 'タ', hira: 'た', roma: 'ta' },
  { kata: 'チ', hira: 'ち', roma: 'chi' },
  { kata: 'ツ', hira: 'つ', roma: 'tsu' },
  { kata: 'テ', hira: 'て', roma: 'te' },
  { kata: 'ト', hira: 'と', roma: 'to' },
  // な行
  { kata: 'ナ', hira: 'な', roma: 'na' },
  { kata: 'ニ', hira: 'に', roma: 'ni' },
  { kata: 'ヌ', hira: 'ぬ', roma: 'nu' },
  { kata: 'ネ', hira: 'ね', roma: 'ne' },
  { kata: 'ノ', hira: 'の', roma: 'no' },
  // は行
  { kata: 'ハ', hira: 'は', roma: 'ha' },
  { kata: 'ヒ', hira: 'ひ', roma: 'hi' },
  { kata: 'フ', hira: 'ふ', roma: 'fu' },
  { kata: 'ヘ', hira: 'へ', roma: 'he' },
  { kata: 'ホ', hira: 'ほ', roma: 'ho' },
  // ま行
  { kata: 'マ', hira: 'ま', roma: 'ma' },
  { kata: 'ミ', hira: 'み', roma: 'mi' },
  { kata: 'ム', hira: 'む', roma: 'mu' },
  { kata: 'メ', hira: 'め', roma: 'me' },
  { kata: 'モ', hira: 'も', roma: 'mo' },
  // や行
  { kata: 'ヤ', hira: 'や', roma: 'ya' },
  { kata: 'ユ', hira: 'ゆ', roma: 'yu' },
  { kata: 'ヨ', hira: 'よ', roma: 'yo' },
  // ら行
  { kata: 'ラ', hira: 'ら', roma: 'ra' },
  { kata: 'リ', hira: 'り', roma: 'ri' },
  { kata: 'ル', hira: 'る', roma: 'ru' },
  { kata: 'レ', hira: 'れ', roma: 're' },
  { kata: 'ロ', hira: 'ろ', roma: 'ro' },
  // わ行 + ん
  { kata: 'ワ', hira: 'わ', roma: 'wa' },
  { kata: 'ヲ', hira: 'を', roma: 'wo' },
  { kata: 'ン', hira: 'ん', roma: 'n' },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

module.exports = { gojuuon, shuffle }
