// pages/study/study.js
const { shuffle } = require('../../utils/gojuuon')

Page({
  data: {
    frontChar: '',
    cardRoma: '',
    errorCount: 0,      // 当前牌被标记"不认识"的次数
    cardExiting: false, // 退场动画
    animating: false,
    deckCount: 0,
    knownCount: 0,
    total: 0,
    progress: 0,
    stackLayers: [],
  },

  _session: null,
  _audioCtx: null,

  onShow() {
    const session = getApp().globalData.session
    if (!session) { wx.navigateBack(); return }
    this._session = session
    this._renderCard()
  },

  onUnload() {
    if (this._audioCtx) { this._audioCtx.destroy(); this._audioCtx = null }
  },

  _renderCard() {
    const s = this._session

    if (s.deck.length === 0) {
      // 全部认识 → 跳统计页
      getApp().globalData.session = s
      wx.redirectTo({ url: '/pages/complete/complete' })
      return
    }

    const card = s.deck[0]
    const layers = Math.min(s.deck.length - 1, 4)
    const stackLayers = Array.from({ length: layers }, (_, i) => ({ i }))

    let frontChar
    if (s.mode === 'kata-hira')      frontChar = card.kata
    else if (s.mode === 'hira-kata') frontChar = card.hira
    else                              frontChar = card.kata + '  ' + card.hira

    const progress = Math.round(s.known.length / s.total * 100)

    this.setData({
      frontChar,
      cardRoma: card.roma,
      errorCount: card.errorCount || 0,
      cardExiting: false,
      animating: false,
      deckCount: s.deck.length,
      knownCount: s.known.length,
      total: s.total,
      progress,
      stackLayers,
    })
  },

  // ── 认识 → 直接移出牌堆 ──
  markKnow() {
    if (this.data.animating) return
    this.setData({ animating: true, cardExiting: true })
    const s = this._session
    const card = s.deck.shift()
    s.known.push(card)
    wx.vibrateShort({ type: 'medium' })
    setTimeout(() => this._renderCard(), 350)
  },

  // ── 不认识 → 打标记数字，放牌底 ──
  markRetry() {
    if (this.data.animating) return
    const s = this._session
    const card = s.deck[0]
    card.errorCount = (card.errorCount || 0) + 1
    // 先更新徽章，再做退场
    this.setData({ errorCount: card.errorCount, animating: true })
    wx.vibrateShort({ type: 'light' })
    setTimeout(() => {
      this.setData({ cardExiting: true })
      setTimeout(() => {
        s.deck.shift()
        s.deck.push(card)
        this._renderCard()
      }, 280)
    }, 160)
  },

  // ── 发音按钮 ──
  playAudio() {
    this._playAudio()
  },

  _playAudio() {
    const roma = this.data.cardRoma
    if (!roma) return
    if (!this._audioCtx) {
      this._audioCtx = wx.createInnerAudioContext()
      this._audioCtx.obeyMuteSwitch = false
    }
    this._audioCtx.stop()
    this._audioCtx.src = `/audio/${roma}.mp3`
    this._audioCtx.play()
  },

  goBack() {
    wx.navigateBack()
  },
})
