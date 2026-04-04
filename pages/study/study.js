// pages/study/study.js
const { shuffle } = require('../../utils/gojuuon')

Page({
  data: {
    // 卡片数据
    frontChar: '',
    backChar: '',
    backRoma: '',
    cardRoma: '',       // 当前牌罗马字（用于发音）
    cardRound: 1,       // 当前牌被看到第几次
    // 状态
    flipped: false,     // 是否已翻面
    animating: false,   // 动画/过渡中（禁止操作）
    // 统计
    deckCount: 0,
    knownCount: 0,
    total: 0,
    rounds: 0,
    progress: 0,
    // 牌堆层数（视觉）
    stackLayers: [],
    // 是否结束
    roundOver: false,
  },

  _session: null,
  _audioCtx: null,

  onShow() {
    const session = getApp().globalData.session
    if (!session) {
      wx.navigateBack()
      return
    }
    this._session = session
    this._renderCard()
  },

  onUnload() {
    if (this._audioCtx) {
      this._audioCtx.destroy()
      this._audioCtx = null
    }
  },

  _renderCard() {
    const s = this._session
    const layers = Math.min(s.deck.length - 1, 4)
    const stackLayers = Array.from({ length: layers }, (_, i) => ({ i }))

    if (s.deck.length === 0) {
      this.setData({ roundOver: true, deckCount: 0, knownCount: s.known.length })
      return
    }

    const card = s.deck[0]
    let frontChar, backChar, backRoma

    if (s.mode === 'kata-hira') {
      frontChar = card.kata
      backChar = card.hira
      backRoma = card.roma
    } else if (s.mode === 'hira-kata') {
      frontChar = card.hira
      backChar = card.kata
      backRoma = card.roma
    } else {
      // romaji mode: 正面同时显示两种假名，背面是罗马字
      frontChar = card.kata + '  ' + card.hira
      backChar = card.roma
      backRoma = ''
    }

    const progress = Math.round((s.known.length / s.total) * 100)

    this.setData({
      frontChar,
      backChar,
      backRoma,
      cardRoma: card.roma,
      cardRound: (card.viewCount || 0) + 1,
      flipped: false,
      roundOver: false,
      animating: false,
      deckCount: s.deck.length,
      knownCount: s.known.length,
      total: s.total,
      rounds: s.rounds,
      progress,
      stackLayers,
    })
  },

  // ── 我知道了 → 直接移出牌堆，不翻牌 ──
  markKnow() {
    if (this.data.animating) return
    this.setData({ animating: true })
    const s = this._session
    const card = s.deck.shift()
    s.known.push(card)
    wx.vibrateShort({ type: 'medium' })
    setTimeout(() => {
      this._renderCard()
    }, 250)
  },

  // ── 我不知道 → 翻牌显示读音 + 自动播放 + 1.5s后放牌底 ──
  markRetry() {
    if (this.data.animating) return
    this.setData({ flipped: true, animating: true })
    wx.vibrateShort({ type: 'light' })
    // 翻牌动画完成后自动播放读音
    setTimeout(() => {
      this._playAudio()
    }, 420)
    // 1.8s后放牌底，切下一张
    setTimeout(() => {
      const s = this._session
      const card = s.deck.shift()
      card.viewCount = (card.viewCount || 0) + 1
      s.deck.push(card)
      setTimeout(() => {
        this._renderCard()
      }, 250)
    }, 1800)
  },

  // ── 点击发音按钮（手动触发）──
  playAudio(e) {
    // 阻止冒泡，避免影响其他操作
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

  // ── 这轮牌空了 → 下一轮 ──
  nextRound() {
    const s = this._session
    s.rounds += 1

    if (s.known.length === s.total) {
      getApp().globalData.session = s
      wx.redirectTo({ url: '/pages/complete/complete' })
      return
    }

    s.deck = shuffle([...s.deck])
    this._renderCard()
  },

  goBack() {
    wx.navigateBack()
  },
})
