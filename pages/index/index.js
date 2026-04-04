// pages/index/index.js
const { gojuuon, shuffle } = require('../../utils/gojuuon')

Page({
  data: {
    mode: 'kata-hira',
    modes: [
      { id: 'kata-hira', label: '片 → 平', desc: '看片假名，想平假名' },
      { id: 'hira-kata', label: '平 → 片', desc: '看平假名，想片假名' },
      { id: 'romaji',    label: '假名 → 读音', desc: '看假名，想罗马字读音' },
    ],
    totalCards: gojuuon.length,
  },

  selectMode(e) {
    this.setData({ mode: e.currentTarget.dataset.id })
  },

  startStudy() {
    // 每张牌携带 errorCount（不认识的次数）
    const deck = shuffle(gojuuon.map(c => ({ ...c, errorCount: 0 })))
    getApp().globalData.session = {
      deck,
      known: [],
      mode: this.data.mode,
      total: gojuuon.length,
    }
    wx.navigateTo({ url: '/pages/study/study' })
  },
})
