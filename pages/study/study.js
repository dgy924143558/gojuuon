// pages/study/study.js
const { shuffle } = require('../../utils/gojuuon')

Page({
  data: {
    frontChar: '',
    backChar: '',
    backRoma: '',
    cardRoma: '',
    errorCount: 0,
    flipped: false,      // 是否已翻牌（点「忘记了」后）
    cardExiting: false,  // 退场动画
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
      getApp().globalData.session = s
      wx.redirectTo({ url: '/pages/complete/complete' })
      return
    }

    const card = s.deck[0]
    const layers = Math.min(s.deck.length - 1, 4)
    const stackLayers = Array.from({ length: layers }, (_, i) => ({ i }))

    let frontChar, backChar, backRoma

    if (s.mode === 'hira-roma') {
      frontChar = card.hira
      backChar  = card.roma
      backRoma  = ''
    } else if (s.mode === 'kata-hira') {
      frontChar = card.kata
      backChar  = card.hira
      backRoma  = card.roma
    } else if (s.mode === 'hira-kata') {
      frontChar = card.hira
      backChar  = card.kata
      backRoma  = card.roma
    } else {
      // romaji: 正面同时显示两种假名
      frontChar = card.kata + '  ' + card.hira
      backChar  = card.roma
      backRoma  = ''
    }

    const progress = Math.round(s.known.length / s.total * 100)

    this.setData({
      frontChar, backChar, backRoma,
      cardRoma: card.roma,
      errorCount: card.errorCount || 0,
      flipped: false,
      cardExiting: false,
      animating: false,
      deckCount: s.deck.length,
      knownCount: s.known.length,
      total: s.total,
      progress,
      stackLayers,
    })
  },

  // ── 「这个假名我已经认识」→ 直接移出牌堆，不翻牌 ──
  markKnow() {
    if (this.data.animating || this.data.flipped) return
    this.setData({ animating: true, cardExiting: true })
    const s = this._session
    const card = s.deck.shift()
    s.known.push(card)
    wx.vibrateShort({ type: 'medium' })
    setTimeout(() => this._renderCard(), 350)
  },

  // ── 「这个假名我忘记了」→ 翻牌显示答案+读音，自动播放发音 ──
  markRetry() {
    if (this.data.animating || this.data.flipped) return
    this.setData({ flipped: true, animating: true })
    wx.vibrateShort({ type: 'light' })
    // 等翻牌动画完成后播放读音
    setTimeout(() => {
      this.setData({ animating: false })
      this._playAudio()
    }, 420)
  },

  // ── 「将其置于牌底」→ errorCount+1，放牌底 ──
  markBottom() {
    if (this.data.animating) return
    this.setData({ animating: true, cardExiting: true })
    const s = this._session
    const card = s.deck[0]
    card.errorCount = (card.errorCount || 0) + 1
    wx.vibrateShort({ type: 'light' })
    setTimeout(() => {
      s.deck.shift()
      s.deck.push(card)
      this._renderCard()
    }, 350)
  },

  // ── 发音按钮（手动）──
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
