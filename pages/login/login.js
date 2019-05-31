// pages/login/login.js
const { $api, $interface } = wx
Page({
  data: {
    phone: ''
  },
  inputPhone(e) {
    this.data.phone = e.detail.value
  },
  toInfoList() {
    wx.redirectTo({ url: '/pages/infoList/infoList' })
  },
  login() { //登录
    const { phone } = this.data
    if (!$interface.phoneReg.test(phone)) return $api.showToast('手机号不正确')
    $api.loading()
    $api.getOpenId()
      .then(() => $api.request($interface.SaveOpenId, { openid: wx.getStorageSync('openid'), tell: +phone }))
      .then(res => {
        console.log(res)
        $api.hide()
        if (res.data.res) {
          wx.setStorageSync('isLogin', true)
          this.toInfoList()
        } else {
          $api.showToast('绑定失败')
        }
      })
      .catch($api.hide)
  },
  onLoad: function (options) {
    $api.getOpenId()
      .then(() => { if (wx.getStorageSync('isLogin')) this.toInfoList() })
  },
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return $api.share()
  }
})