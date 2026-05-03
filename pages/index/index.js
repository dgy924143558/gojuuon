// pages/index/index.js
const { gojuuon, shuffle } = require('../../utils/gojuuon')

Page({
  data: {
    mode: 'hira-roma',   // 默认：平假名 → 读音
    modes: [
      { id: 'hira-roma',  label: '平假名 → 读音', desc: '看平假名，想罗马字读音（推荐入门）', hot: true },
      { id: 'kata-hira',  label: '片 → 平',       desc: '看片假名，想平假名' },
      { id: 'hira-kata',  label: '平 → 片',       desc: '看平假名，想片假名' },
      { id: 'romaji',     label: '两种假名 → 读音', desc: '同时看片假名和平假名，想读音' },
    ],
    totalCards: gojuuon.length,
  },

  onLoad() {
    wx.showShareMenu({ withShareTicket: false, menus: ['shareAppMessage', 'shareTimeline'] })
  },

  onShareAppMessage() {
    return {
      title: '五十音记忆闪卡 · 2小时记住全部假名！',
      path: '/pages/index/index',
    }
  },

  onShareTimeline() {
    return { title: '五十音记忆闪卡 · 翻牌记忆日语假名' }
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
