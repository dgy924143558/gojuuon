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
    // 每张牌加 viewCount，用于记录被看了几次
    const deck = shuffle(gojuuon.map(c => ({ ...c, viewCount: 0 })))
    getApp().globalData.session = {
      deck,
      known: [],
      mode: this.data.mode,
      rounds: 0,
      total: gojuuon.length,
    }
    wx.navigateTo({ url: '/pages/study/study' })
  }
})
