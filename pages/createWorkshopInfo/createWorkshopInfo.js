// pages/createWorkshopInfo/createWorkshopInfo.js
const { $api, $interface } = wx
const app = getApp()
Page({
  data: {
    zfId: -1, //修改的时候传此id
    uploadUrl: $interface.uploadUrl,
    start: '1970-01-01',
    end: '',
    isAir: false, //空气品质
    isSewage: false, //污水处理
    isGas: false, //用气量
    isSurvey: true, //概况
    ComPany: '', //公司名称
    InnerTime: '', //拜访日期
    Address: '', //地址
    Contact: '', //联系人
    ContactTell: '', //联系电话
    Sell: {}, //销售
    yygy: '', //应用工艺
    wdyq: '', //温度要求
    other: '', //用途-其他
    watercontent: '', //含水量
    oilcontent: '', //含油量
    dustcontent: '', //含尘量
    zglyl: '', //主管路压力
    Sewagesource: '', //污水来源
    Treatmentprocess: '', //处理工艺
    TreatmentNum: '', //日处理量
    SewageOther: '', //污水-其他
    maxyql: '', //最大用气量
    minyql: '', //最小用气量
    avgyql: '', //平均
    electrovalency: '', //电价
    voltage: '', //电压
    yearrundate: '', //年度运行时间
    controllerListData: ['有', '无'],
    controllerIndex: 0,
    Controller: '有', //有无集中控制
    Chuqiguan: '', //储气罐
    Detail: '', //概况
    imageList: [], //图片列表
    imageMaxNum: 5, //图片最大数量
    focus: {}
  },
  changeMust(e) { //非必填项显隐
    const keyName = e.currentTarget.dataset.keyname
    this.setData({ [keyName]: !this.data[keyName] })
  },
  changeDate(e) { //拜访日期
    this.setData({ InnerTime: e.detail.value })
  },
  changeController(e) { //拜访日期
    const index = +e.detail.value
    this.setData({ controllerIndex: index, Controller: this.data.controllerListData[index] })
  },
  getAddress() { //获取当前位置
    $api.getLocation()
      .then(res => $api.reverseGeocoder(res))
      .then(res => this.setData({ Address: res.result.address }))
  },
  addImage() { //选择添加图片
    let { imageMaxNum, imageList } = this.data
    $api.chooseImage(imageMaxNum - imageList.length)
      .then(res => {
        console.log(res)
        $api.loading('上传中...')
        return Promise.all(res.tempFilePaths.map(item => $api.uploadImage(item)))
      })
      .then(res => {
        $api.hide()
        this.setData({ imageList: imageList.concat(res.map(item => JSON.parse(item.data).Results)) })
      })
      .catch(() => {
        $api.hide()
        $api.showToast('上传失败')
      })
  },
  deleteImage(e) { //删除图片
    const index = e.currentTarget.dataset.index
    let { imageList, zfId } = this.data
    zfId <= 0 && $api.deleteImage(`${imageList[index]}`) //修改假删
    imageList.splice(index, 1)
    this.setData({ imageList })
  },
  submit(e) { //提交
    let data = e.detail.value
    let { InnerTime, Sell, imageList, zfId, Controller } = this.data
    if (!this.judgeInfoIsPrefect(data)) return
    data.InnerTime = InnerTime
    data.SellUserId = Sell.SellUserId
    data.img = imageList.map(item => `${item}`).join('|')
    data.zfId = zfId
    data.Controller = Controller
    $api.loading('提交中...')
    // zfId //有id修改，无id添加
    $api.request(zfId ? $interface.UpdatezfInfo : $interface.CreateStation, data)
      .then(res => {
        $api.hide()
        if (res.data.res) {
          if (zfId) {
            let time = `${data.InnerTime} 00:00:00`
            data.InnerTime = `/Date(${$api.newDate(time).getTime()})/`
            app.reviseWorkData = data //存储用以回显暂存
            wx.navigateBack({ delta: 1 })
          } else {
            wx.redirectTo({ url: `/pages/compressorInfoList/compressorInfoList?zfId=${res.data.zfId}` })
          }
        } else {
          $api.showToast('提交失败')
        }
      })
      .catch(() => {
        $api.hide()
        $api.showToast('提交失败')
      })
  },
  getThisInfo() { //获取当前站房信息
    $api.loading()
    $api.request($interface.zfinfo, { zfId: this.data.zfId })
      .then(res => {
        $api.hide()
        let data = res.data.data
        let obj = $api.timeStamp(data.InnerTime)
        data.InnerTime = `${obj.y}-${obj.m}-${obj.d}`
        data.imageList = data.Img ? data.Img.split('|') : []
        let { controllerListData } = this.data
        for (let i = 0, len = controllerListData.length; i < len; i++) {
          if (controllerListData[i] === data.Controller) {
            data.controllerIndex = i
            break
          }
        }
        this.setData(data)
      })
      .catch(() => {
        $api.hide()
        $api.showToast('获取失败')
      })
  },
  toast(str) {
    $api.showToast(`请完善${str}`)
  },
  getFocus(key){ //使其主动获得焦点
    let { focus } = this.data
    if(!focus[key]) focus[key] = false
    let keys = `focus.${key}`
    this.setData({ [keys]: true })
  },
  judgeInfoIsPrefect(data) { //判断所填信息是否完善
    let t = $api.trim(data)
    switch (false) {
      case t('ComPany'): return (this.getFocus('ComPany'), this.toast('公司名称'))
      case t('Address'): return (this.getFocus('Address'), this.toast('地址'))
      case t('Contact'): return (this.getFocus('Contact'), this.toast('客户联系人'))
      case t('ContactTell'): return (this.getFocus('ContactTell'), this.toast('联系电话'))
      case $interface.phoneReg.test(data.ContactTell): return (this.getFocus('ContactTell'), $api.showToast('手机号不正确'), false)
      case t('yygy'): return (this.getFocus('yygy'), this.toast('应用工艺'))
      case t('wdyq'): return (this.getFocus('wdyq'), this.toast('用气终端温度要求'))
      default: return true
    }
    // if (t('ComPany') && t('Address') && t('Contact') && t('ContactTell') && t('yygy') && t('wdyq')) return true
    // $api.showToast('请完善信息')
  },
  getSellInfo() { //获取销售信息
    $api.request($interface.GetSellUserInfo, { openid: wx.getStorageSync('openid') })
      .then(res => this.setData({ Sell: res.data }))
  },
  initTime() {
    const currentDate = new Date().getTime()
    this.setData({
      end: this.reverseTime(currentDate + 31536000000),
      InnerTime: this.reverseTime(currentDate)
    })
  },
  reverseTime(time) {
    let obj = $api.timeStamp(time)
    return `${obj.y}-${obj.m}-${obj.d}`
  },
  onLoad: function (options) {
    this.data.zfId = +options.zfId || 0
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const { zfId } = this.data
    this.getSellInfo()
    this.initTime()
    if (zfId) return this.getThisInfo() //修改
    this.setData({ zfId: 0 }) //添加，一开始为-1避免修改前请求数据出错后面操作尴尬
  },

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