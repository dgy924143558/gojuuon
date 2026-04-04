// 用 ffmpeg 压缩五十音 MP3，目标每个文件 < 20KB
const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ffmpeg = require('ffmpeg-static')
const audioDir = path.join(__dirname, '../audio')

const files = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3'))

let ok = 0
for (const file of files) {
  const src = path.join(audioDir, file)
  const tmp = src + '.tmp.mp3'
  const before = fs.statSync(src).size

  try {
    execFileSync(ffmpeg, [
      '-y', '-i', src,
      '-ar', '22050',    // 采样率 22kHz（原声音效足够清晰）
      '-ac', '1',        // 单声道
      '-b:a', '24k',     // 比特率 24kbps（语音级别，清晰度足够）
      tmp
    ], { stdio: 'pipe' })

    fs.renameSync(tmp, src)
    const after = fs.statSync(src).size
    console.log(`✓ ${file}  ${(before/1024).toFixed(1)}KB → ${(after/1024).toFixed(1)}KB`)
    ok++
  } catch (e) {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp)
    console.error(`✗ ${file}  ${e.message}`)
  }
}

// 统计总大小
const total = files.reduce((s, f) => s + fs.statSync(path.join(audioDir, f)).size, 0)
console.log(`\n完成：${ok}/${files.length} 个文件，总计 ${(total/1024).toFixed(1)} KB`)
