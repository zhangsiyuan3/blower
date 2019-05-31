//app.js
App({
  onLaunch() {
    wx.$interface = require('./utils/interface.js')
    wx.$api = require('./utils/api.js')
  },
  onPageNotFound() {
    wx.redirectTo({ url: '/pages/login/login' })
  },
  reviseWorkData: null, //修改站房信息，夸页面回显暂存
  copyBlowerData: {   //复制后保存
    zfId: 0, //站房id    要时刻注意修改这个两个参数
    Num: 1, //序列号
  },
})