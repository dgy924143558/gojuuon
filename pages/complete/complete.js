// pages/complete/complete.js
const { shuffle } = require('../../utils/gojuuon')

Page({
  data: {
    rounds: 0,
    total: 0,
  },

  onLoad() {
    const s = getApp().globalData.session
    if (!s) return
    this.setData({ rounds: s.rounds + 1, total: s.total })
  },

  // 再来一遍（全部重新洗牌）
  restart() {
    const s = getApp().globalData.session
    const { gojuuon } = require('../../utils/gojuuon')
    getApp().globalData.session = {
      deck: shuffle([...gojuuon]),
      known: [],
      mode: s.mode,
      rounds: 0,
      total: s.total,
    }
    wx.redirectTo({ url: '/pages/study/study' })
  },

  goHome() {
    wx.reLaunch({ url: '/pages/index/index' })
  },
})
