// pages/compressorInfoList/compressorInfoList.js
const { $api, $interface } = wx
const app = getApp()
Page({
  data: {
    isSuccess: false, //获取列表是否成功
    zfId: 0,
    listData: [],
  },
  toCreateCompressorInfo(str = '') { //跳转至压缩机创建页
    wx.navigateTo({ url: `/pages/createCompressorInfo/createCompressorInfo${str}` })
  },
  backInfoList() {
    wx.navigateBack({ delta: 1 })
  },
  create() { //创建
    app.copyBlowerData = { //创建一个空白的页面，这两个信息重置
      zfId: this.data.zfId,
      Num: this.ergodicNum(),
    }
    this.toCreateCompressorInfo()
  },
  revise(e) { //修改
    const str = `?ysjId=${+e.currentTarget.dataset.ysjid}`
    this.toCreateCompressorInfo(str)
  },
  delete(e) { //删除
    const index = +e.currentTarget.dataset.index
    let { listData, zfId } = this.data
    $api.loading('删除中...')
    $api.request($interface.DelYsj, { ysjId: listData[index].ysjId, zfId })
      .then(res => {
        $api.hide()
        if (res.data.res) {
          listData.splice(index, 1)
          this.ergodicNum(true)
        }
      })
      .catch(() => {
        $api.hide()
        $api.showToast('删除失败')
      })
  },
  copy(e) { //复制数据
    $api.loading()
    $api.request($interface.ysjinfo, { ysjId: +e.currentTarget.dataset.ysjid })
      .then(res => {
        $api.hide()
        let data = res.data.data
        data.Num = this.ergodicNum()
        data.yaliset = ''
        data.RunTime = ''
        data.LoadTime = ''
        data.Img = ''
        app.copyBlowerData = data
        this.toCreateCompressorInfo()
      })
      .catch(() => {
        $api.hide()
        $api.showToast('请求失败')
      })
  },
  ergodicNum(isView) { //更新并改正序列号，且返回下次需要添加的序列号
    let { listData } = this.data
    for (let i = 0, len = listData.length; i < len; i++) {
      listData[i].Num = i + 1
    }
    isView && this.setData({ listData })
    return listData.length + 1
  },
  getList() {
    $api.loading()
    $api.request($interface.compressorlist, { zfId: this.data.zfId })
      .then(res => {
        $api.hide()
        this.data.listData = res.data.List
        this.setData({ isSuccess: true })
        app.copyBlowerData.Num = this.ergodicNum(true)
      })
      .catch(() => {
        $api.hide()
        $api.showToast('请求失败')
        this.setData({ isSuccess: false })
      })
  },
  onLoad: function (options) {
    const zfId = +options.zfId || 0
    this.data.zfId = app.copyBlowerData.zfId = zfId
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getList()
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