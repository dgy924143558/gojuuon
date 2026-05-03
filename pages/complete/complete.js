// pages/complete/complete.js
const { gojuuon, shuffle } = require('../../utils/gojuuon')

Page({
  data: {
    total: 0,
    firstTryCount: 0,
    firstTryPct: 0,
    retryCount: 0,
    distribution: [],   // [{errors:1,count:5}, ...]
    hardest: [],        // 错误最多的前8张
    mode: '',
    dateStr: '',
    saving: false,
  },

  _session: null,
  _reportTempFilePath: '',   // 缓存报告图路径，供分享用

  onLoad() {
    const s = getApp().globalData.session
    if (!s) return
    this._session = s
    // 启用右上角菜单分享
    wx.showShareMenu({ withShareTicket: false, menus: ['shareAppMessage', 'shareTimeline'] })

    const known = s.known
    const total = s.total
    const firstTryCount = known.filter(c => !c.errorCount).length
    const retryCount = total - firstTryCount
    const firstTryPct = Math.round(firstTryCount / total * 100)

    // 错误次数分布
    const distMap = {}
    known.forEach(c => {
      const e = c.errorCount || 0
      if (e > 0) distMap[e] = (distMap[e] || 0) + 1
    })
    const distribution = Object.entries(distMap)
      .sort((a, b) => +a[0] - +b[0])
      .map(([errors, count]) => ({ errors: +errors, count, pct: Math.round(count / total * 100) }))

    // 最难的前8张
    const modeKey = s.mode
    const hardest = known
      .filter(c => c.errorCount > 0)
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, 8)
      .map(c => ({
        kana: modeKey === 'hira-kata' ? c.hira
            : modeKey === 'kata-hira' ? c.kata
            : modeKey === 'hira-roma' ? c.hira
            : c.kata + ' ' + c.hira,
        roma: c.roma,
        errors: c.errorCount,
      }))

    const modeNames = {
      'hira-roma': '平假名 → 读音',
      'kata-hira': '片假名 → 平假名',
      'hira-kata': '平假名 → 片假名',
      'romaji':    '两种假名 → 读音',
    }

    const now = new Date()
    const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`

    this.setData({
      total, firstTryCount, firstTryPct, retryCount,
      distribution, hardest,
      mode: modeNames[modeKey] || modeKey,
      dateStr,
    })
  },

  // 页面渲染完成后，预先生成报告图（供分享时用）
  onReady() {
    this._buildCanvas(path => { this._reportTempFilePath = path })
  },

  // ── 分享给朋友 ──
  onShareAppMessage() {
    const { firstTryPct, total } = this.data
    return {
      title: `我记住了全部 ${total} 个假名！一次认识率 ${firstTryPct}%`,
      path: '/pages/index/index',
      imageUrl: this._reportTempFilePath || '',
    }
  },

  // ── 分享到朋友圈 ──
  onShareTimeline() {
    const { firstTryPct, total } = this.data
    return {
      title: `五十音记忆闪卡 · 全部 ${total} 个假名学完！一次认识率 ${firstTryPct}%`,
      imageUrl: this._reportTempFilePath || '',
    }
  },

  // ── 下载报告到相册 ──
  saveReport() {
    if (this.data.saving) return
    this.setData({ saving: true })
    wx.showLoading({ title: '生成中...' })

    this._buildCanvas(path => {
      wx.hideLoading()
      if (!path) {
        wx.showToast({ title: '生成失败', icon: 'none' })
        this.setData({ saving: false })
        return
      }
      this._reportTempFilePath = path
      wx.saveImageToPhotosAlbum({
        filePath: path,
        success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
        fail: () => wx.showModal({
          title: '需要相册权限',
          content: '请在右上角菜单 → 设置 → 允许访问相册',
          showCancel: false,
        }),
        complete: () => this.setData({ saving: false }),
      })
    }, true)
  },

  // ── 核心：绘制 Canvas 并返回临时文件路径 ──
  _buildCanvas(callback, showErr) {
    const query = wx.createSelectorQuery().in(this)
    query.select('#reportCanvas').fields({ node: true, size: true }, res => {
      if (!res || !res.node) {
        if (showErr) wx.showToast({ title: '画布错误', icon: 'none' })
        callback('')
        return
      }
      const canvas = res.node
      const dpr = wx.getSystemInfoSync().pixelRatio || 2
      const W = 600
      const { distribution, hardest } = this.data
      let H = 490
      if (distribution.length > 0) H += distribution.length * 52 + 60
      if (hardest.length > 0)      H += hardest.length * 56 + 60
      H += 60

      canvas.width  = W * dpr
      canvas.height = H * dpr
      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)
      this._drawReport(ctx, W, H)

      wx.canvasToTempFilePath({
        canvas,
        success: r => callback(r.tempFilePath),
        fail: e => { console.error(e); callback('') },
      })
    }).exec()
  },

  _drawReport(ctx, W, H) {
    const { total, firstTryCount, firstTryPct, retryCount,
            distribution, hardest, mode, dateStr } = this.data
    const P = 44  // padding

    // ── 背景 ──
    ctx.fillStyle = '#0e0e0f'
    ctx.fillRect(0, 0, W, H)

    // ── 顶部金条 ──
    ctx.fillStyle = '#c9a84c'
    ctx.fillRect(0, 0, W, 6)

    // ── 标题 ──
    ctx.fillStyle = '#c9a84c'
    ctx.font = 'bold 26px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('五十音学习报告', W / 2, 54)

    ctx.fillStyle = 'rgba(240,237,232,0.35)'
    ctx.font = '15px sans-serif'
    ctx.fillText(`${mode}  ·  ${dateStr}`, W / 2, 82)

    // ── 分割线 ──
    const hr = (y) => {
      ctx.strokeStyle = 'rgba(255,255,255,0.07)'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(P, y); ctx.lineTo(W - P, y); ctx.stroke()
    }
    hr(100)

    // ── 大百分比 ──
    const rateColor = firstTryPct >= 80 ? '#3aaa7a' : firstTryPct >= 50 ? '#c9a84c' : '#e8543a'
    ctx.fillStyle = rateColor
    ctx.font = 'bold 72px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${firstTryPct}%`, W / 2, 194)

    ctx.fillStyle = 'rgba(240,237,232,0.4)'
    ctx.font = '17px sans-serif'
    ctx.fillText('一次认识率', W / 2, 224)

    // ── 两个小统计框 ──
    const bw = (W - P * 2 - 16) / 2
    const by = 248, bh = 68

    const box = (x, color, fillAlpha, num, label) => {
      ctx.fillStyle = color.replace(')', `, ${fillAlpha})`).replace('rgb', 'rgba')
      this._rRect(ctx, x, by, bw, bh, 10); ctx.fill()
      ctx.strokeStyle = color.replace(')', ', 0.25)').replace('rgb', 'rgba')
      ctx.lineWidth = 1
      this._rRect(ctx, x, by, bw, bh, 10); ctx.stroke()
      ctx.fillStyle = color
      ctx.font = 'bold 28px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(num, x + bw / 2, by + 36)
      ctx.fillStyle = 'rgba(240,237,232,0.35)'
      ctx.font = '13px sans-serif'
      ctx.fillText(label, x + bw / 2, by + 57)
    }
    box(P,          'rgb(58,170,122)',  0.08, firstTryCount, '一次认识')
    box(P + bw + 16,'rgb(232,84,58)',   0.08, retryCount,    '需要复习')

    let y = by + bh + 36

    // ── 分布图 ──
    if (distribution.length > 0) {
      hr(y); y += 24
      ctx.fillStyle = 'rgba(240,237,232,0.28)'
      ctx.font = '15px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('错误次数分布', P, y); y += 28

      const maxC = Math.max(...distribution.map(d => d.count))
      const barMaxW = W - P * 2 - 70

      for (const d of distribution) {
        const bw2 = Math.max(6, Math.round(d.count / maxC * barMaxW))

        ctx.fillStyle = 'rgba(240,237,232,0.35)'
        ctx.font = '14px sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(`${d.errors}次`, P + 52, y + 18)

        ctx.fillStyle = `rgba(232,84,58,${Math.min(0.9, 0.3 + d.errors * 0.15)})`
        this._rRect(ctx, P + 60, y + 2, bw2, 22, 4); ctx.fill()

        ctx.fillStyle = 'rgba(240,237,232,0.4)'
        ctx.font = '13px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(`${d.count}张`, P + 60 + bw2 + 8, y + 18)

        y += 48
      }
      y += 8
    }

    // ── 重点复习 ──
    if (hardest.length > 0) {
      hr(y); y += 24
      ctx.fillStyle = 'rgba(240,237,232,0.28)'
      ctx.font = '15px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('重点复习', P, y); y += 28

      for (const card of hardest) {
        ctx.fillStyle = '#f0ede8'
        ctx.font = 'bold 28px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(card.kana, P, y + 22)

        ctx.fillStyle = 'rgba(240,237,232,0.35)'
        ctx.font = '14px sans-serif'
        ctx.fillText(card.roma, P + 72, y + 22)

        ctx.fillStyle = '#e8543a'
        ctx.font = 'bold 14px sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(`✗ ${card.errors}`, W - P, y + 22)

        y += 50
      }
    }

    // ── 底部署名 ──
    y += 20
    ctx.fillStyle = 'rgba(240,237,232,0.15)'
    ctx.font = '13px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('五十音记忆闪卡', W / 2, y)
  },

  // 圆角矩形辅助
  _rRect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arcTo(x + w, y, x + w, y + r, r)
    ctx.lineTo(x + w, y + h - r)
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
    ctx.lineTo(x + r, y + h)
    ctx.arcTo(x, y + h, x, y + h - r, r)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
  },

  restart() {
    const s = this._session
    getApp().globalData.session = {
      deck: shuffle(gojuuon.map(c => ({ ...c, errorCount: 0 }))),
      known: [],
      mode: s.mode,
      total: s.total,
    }
    wx.redirectTo({ url: '/pages/study/study' })
  },

  goHome() {
    wx.reLaunch({ url: '/pages/index/index' })
  },
})
