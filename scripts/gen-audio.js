// 用 Google TTS 生成五十音图全部发音 MP3
const https = require('https')
const fs = require('fs')
const path = require('path')

const outputDir = path.join(__dirname, '../audio')

// 所有假名：{ 文件名(罗马字): 用于 TTS 的平假名 }
const syllables = {
  'a': 'あ', 'i': 'い', 'u': 'う', 'e': 'え', 'o': 'お',
  'ka': 'か', 'ki': 'き', 'ku': 'く', 'ke': 'け', 'ko': 'こ',
  'sa': 'さ', 'shi': 'し', 'su': 'す', 'se': 'せ', 'so': 'そ',
  'ta': 'た', 'chi': 'ち', 'tsu': 'つ', 'te': 'て', 'to': 'と',
  'na': 'な', 'ni': 'に', 'nu': 'ぬ', 'ne': 'ね', 'no': 'の',
  'ha': 'は', 'hi': 'ひ', 'fu': 'ふ', 'he': 'へ', 'ho': 'ほ',
  'ma': 'ま', 'mi': 'み', 'mu': 'む', 'me': 'め', 'mo': 'も',
  'ya': 'や', 'yu': 'ゆ', 'yo': 'よ',
  'ra': 'ら', 'ri': 'り', 'ru': 'る', 're': 'れ', 'ro': 'ろ',
  'wa': 'わ', 'wo': 'を', 'n': 'ん',
}

function download(roma, kana) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(outputDir, `${roma}.mp3`)
    const text = encodeURIComponent(kana)
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${text}&tl=ja&client=tw-ob&ttsspeed=0.8`

    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://translate.google.com/',
      }
    }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${roma}`))
        return
      }
      const file = fs.createWriteStream(filePath)
      res.pipe(file)
      file.on('finish', () => {
        file.close()
        console.log(`✓ ${roma}.mp3  (${kana})`)
        resolve()
      })
      file.on('error', reject)
    })
    req.on('error', reject)
    req.setTimeout(10000, () => { req.destroy(); reject(new Error(`Timeout: ${roma}`)) })
  })
}

async function main() {
  const entries = Object.entries(syllables)
  console.log(`生成 ${entries.length} 个音频文件 → ${outputDir}\n`)
  let ok = 0, fail = 0
  // 逐个下载，避免触发限速
  for (const [roma, kana] of entries) {
    try {
      await download(roma, kana)
      ok++
      // 每次请求之间稍作等待
      await new Promise(r => setTimeout(r, 300))
    } catch (e) {
      console.error(`✗ ${roma}.mp3  错误: ${e.message}`)
      fail++
    }
  }
  console.log(`\n完成：${ok} 成功，${fail} 失败`)
}

main()
