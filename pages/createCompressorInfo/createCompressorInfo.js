// pages/createCompressorInfo/createCompressorInfo.js
const { $api, $interface } = wx
const app = getApp()
let skillStack = {}
import brandStack from '../../utils/brandStack.js'
Page({
  data: {
    ysjId: -1, //当前机器id
    uploadUrl: $interface.uploadUrl,
    start: '1970-01-01',
    end: '',
    timeList: [[], []],
    timeIndex: [0, 0],
    Num: 1, //序号
    pressureType: 0, //业务类型
    pressureList: [{ name: '低压', spec: '(<4barg)' },
    { name: '中压', spec: '(2.5~16barg)' },
    { name: '高压', spec: '(>16barg)' }],
    Brand: '', //品牌
    brankIndex: -1,
    brandList: [],
    isBrandInput: false, //品牌是否显示输入框
    CreateTime: '', //出场日期
    Price: '', //价格
    Number: '', //型号
    cd: 0, //冷却形式
    cdList: ['风冷', '水冷'],
    skill: -1, //技术
    skillList: [],
    yasuoOther: '',
    kw: '', //电机功率
    imageList: [], //图片列表
    imageMaxNum: 5, //图片最大数量
    controlModel: -1, //控制模式
    controlModelList: ['流量控制', '压力控制'],
    RunTime: '', //运行时间
    LoadTime: '', //加载时间
    yali: '', //铭牌额定压力
    paiqiliang: '', //排气量
    yaliset: '', //实际工作压力
    detail: '', //运动压力
    status: -1, //及时状态
    statusList: ['运行', '待机', '故障'],
    info: '', //报警信息
    other: '', //其他
    otherList: ['三用一备', '有热备机'],
    focus: {}
  },
  changePressure(e) { //业务类型选择
    const { pressureType } = this.data
    const index = e.currentTarget.dataset.index
    if (pressureType === index) return //选项没有变
    this.setData({
      pressureType: index,
      skill: -1,
      Brand: '',
      brankIndex: -1,
      brandList: [],
      isBrandInput: false,
    })
    this.getSkillData(this.handleBrand)
  },
  changeDate(e) { //出场日期
    const { timeList } = this.data
    const timeIndex = e.detail.value
    const CreateTime = `${timeList[0][timeIndex[0]]}-${timeList[1][timeIndex[1]]}`
    this.setData({ CreateTime, timeIndex })
  },
  changeCd(e) { //切换冷却状态
    this.setData({ cd: e.currentTarget.dataset.index })
  },
  changeSkill(e) { //切换压缩技术
    this.setData({ skill: +e.detail.value, brandIndex: -1 })
    this.handleBrand()
  },
  inputSkill(e) { //压缩技术输入框
    this.data.yasuoOther = e.detail.value
  },
  handleBrand() { //根据压缩技术，处理品牌 
    let { skillList, skill, pressureType, Brand } = this.data
    let arr = brandStack[pressureType]
    let index = -1
    if (skillList[skill].ys) { //压缩技术没选其他
      for (let i = 0, len = arr.length; i < len; i++) {
        if (arr[i].title === skillList[skill].TypeName) {
          index = i
          break
        }
      }
    }
    let isBrandInput = true
    let brandList = []
    if (index !== -1) { //品牌不需要输入框输入
      brandList = arr[index].list
      isBrandInput = false
    }
    if (Brand) { //针对修改时的回显做处理
      if (Brand === '其他') {
        isBrandInput = true
      } else {
        let index = -1
        for (let i = 0, len = brandList.length; i < len; i++) {
          if (Brand === brandList[i]) {
            index = i
            break
          }
        }
        isBrandInput = index === -1 ? true : false
      }
    }
    this.setData({ isBrandInput, brandList })
  },
  changeBrand(e) { //切换品牌,三级联动了都
    let { brandList, brandIndex } = this.data
    brandIndex = +e.detail.value
    let Brand = brandList[brandIndex]
    let isBrandInput = false
    if (Brand === '其他') {
      Brand = ''
      isBrandInput = true
    }
    this.setData({ Brand, brandIndex, isBrandInput })
  },
  inputBrand(e) { //品牌输入框
    this.data.Brand = e.detail.value
  },
  addImage() { //选择添加图片
    let { imageMaxNum, imageList } = this.data
    $api.chooseImage(imageMaxNum - imageList.length)
      .then(res => {
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
    let { imageList, ysjId } = this.data
    // ysjId <= 0 && $api.deleteImage(`${imageList[index]}`) //修改和复制后添加，只能假删，不管了
    imageList.splice(index, 1)
    this.setData({ imageList })
  },
  changeControlModel(e) { //控制模式
    this.setData({ controlModel: +e.detail.value })
  },
  changeStatus(e) { //切换及时状态
    this.setData({ status: +e.detail.value })
  },
  changeOther(e) { //切换其他
    this.setData({ other: +e.detail.value })
  },
  submit(e) {
    let data = e.detail.value
    console.log(e.detail.value)
    let { skill, skillList, yasuoOther, ysjId } = this.data
    if (skill === -1) return this.toast('压缩技术')
    let ys = skillList[skill].ys
    if (ys === 0 && yasuoOther.trim().length <= 0) return this.toast('压缩技术')
    let { Brand, zfId, Num, pressureType, CreateTime, cd, imageList, controlModel,
      controlModelList, status, statusList, other, otherList } = this.data
    data.Brand = Brand
    data.zfId = zfId
    data.Num = Num
    data.Type = pressureType + 1
    data.CreateTime = `${CreateTime}-01`
    data.LqType = +cd
    data.ys = ys
    data.yasuoOther = yasuoOther
    data.Img = imageList.map(item => `${item}`).join('|')
    data.mode = controlModelList[controlModel] || ''
    data.state = statusList[status] || ''
    data.other = other || ''
    data.ysjId = ysjId //大于0 修改 小于等于0添加
    if (!this.judgeInfoIsPrefect(data)) return
    $api.loading('提交中...')
    $api.request(ysjId > 0 ? $interface.UpdateYsj : $interface.addYsj, data)
      .then(res => {
        $api.hide()
        if (res.data.res) wx.navigateBack({ detail: 1 })
      })
      .catch(() => {
        $api.hide()
        $api.showToast('提交失败')
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
    const checkYS = (data) => { //“排气量”压缩技术为离心机时，非必填项; 返回  true为匹配成功
      const { skillList } = this.data
      return !skillList.every((item) => {
        return item.ys === data.ys ? (item.TypeName !== '离心机') : true
      })
    }
    switch (false) {
      case t('Brand'): return this.toast('品牌')
      // case t('Price'): return this.toast('价格')
      case t('Number'): return (this.getFocus('Number'), this.toast('型号'))
      case t('kw'): return (this.getFocus('kw'), this.toast('电机功率'))
      case t('Img'): return this.toast('拍照')
      // case t('mode'): return this.toast('控制模式')
      // case t('RunTime'): return this.toast('运行时间')
      // case t('LoadTime'): return this.toast('加载时间')
      case t('yali'): return (this.getFocus('yali'), this.toast('铭牌额定压力'))
      case checkYS(data) || t('paiqiliang'): return (this.getFocus('paiqiliang'), this.toast('排气量'))
      case t('yaliset'): return (this.getFocus('yaliset'), this.toast('实际工作压力'))
      // case t('detail'): return this.toast('运行压力')
      case t('state'): return this.toast('即时状态')
      // case t('info'): return this.toast('报警信息')
      // case t('other'): return this.toast('其他信息')
      default: return true
    }
    // if (t('Brand') && t('Price') && t('Number') && t('kw') && t('Img') && t('mode')
    //   && t('RunTime') && t('LoadTime') && t('yali') && t('paiqiliang') && t('yaliset')
    //   && t('detail') && t('state') && t('info') && t('other')) return true
    // $api.showToast('请完善信息')
  },
  getSkillData(ys, callback = () => { }) { //获取压缩技术
    let { pressureType } = this.data
    //有缓存走缓存 没缓存请求
    if (skillStack[pressureType]) {
      this.setData({ skillList: skillStack[pressureType] })
      if (ys) this.changeReviseSkill(ys, callback)
      return
    }
    $api.loading()
    $api.request($interface.Ysjishu, { Type: pressureType + 1 }) //type 1 低压 2 中压 3 高压
      .then(res => {
        $api.hide()
        let arr = res.data.list
        arr.push({ TypeName: '其他', ys: 0 })
        skillStack[pressureType] = arr
        this.setData({ skillList: arr })
        if (ys) this.changeReviseSkill(ys, callback)
      })
      .catch(() => {
        $api.hide()
        $api.showToast('请求失败')
      })
  },
  changeReviseSkill(ys, callback) {
    const { skillList } = this.data
    let index = -1
    for (let i = 0, len = skillList.length; i < len; i++) {
      if (skillList[i].ys === +ys) {
        index = i
        break
      }
    }
    this.setData({ skill: index })
    callback()
  },
  getThisInfo() { //修改-获取当前信息
    $api.loading()
    $api.request($interface.ysjinfo, { ysjId: this.data.ysjId })
      .then(res => {
        $api.hide()
        this.viewData(res.data.data)
      })
      .catch(() => {
        $api.hide()
        $api.showToast('请求失败')
      })
  },
  eachTime(y, m) { //遍历出场日期并复制当前下标
    const { timeList } = this.data
    let yIndex = 0
    let mIndex = 0
    for (let i = 0, len = timeList[0].length; i < len; i++) if (+timeList[0][i] === +y) { yIndex = i; break }
    for (let i = 0, len = timeList[1].length; i < len; i++) if (+timeList[1][i] === +m) { mIndex = i; break }
    this.setData({ timeIndex: [yIndex, mIndex] })
  },
  viewData(data) { //渲染数据于页面
    if (data.CreateTime) {
      const o = $api.timeStamp(data.CreateTime)
      const { y, m } = o
      data.CreateTime = `${y}-${m}`
      this.eachTime(y, m)
    }
    data.pressureType = data.Type ? data.Type - 1 : 0
    data.Brand = data.Brand === void 0 ? '' : data.Brand
    data.cd = data.LqType ? +data.LqType : 0
    data.imageList = data.Img ? data.Img.split('|') : []
    data.controlModel = this.getPickerIndex(data.mode, 'controlModelList')
    data.status = this.getPickerIndex(data.state, 'statusList')
    // let other = this.getPickerIndex(data.other, 'otherList')
    // data.other = other === -1 ? 0 : other
    data.other = data.other === void 0 ? '' : data.other
    this.setData(data)
    let ys = typeof data.ys === 'undefined' ? false : '' + data.ys //undefined 创建，且没有复制 ||有可能修改，有可能复制
    this.getSkillData(ys, this.handleBrand)
  },
  getPickerIndex(target, strList) {
    if (!target) return -1
    let index = -1
    let list = this.data[strList]
    for (let i = 0, len = list.length; i < len; i++) {
      if (list[i] === target) {
        index = i
        break
      }
    }
    return index
  },
  initTime() { //初始化时间，出场日期只要年月
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1
    const endYear = currentYear + 3
    let yList = []
    let mList = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'] //月
    let yIndex = 0
    let mIndex = 0
    for (let i = 1970; i < endYear; i++) yList.push(`${i}`)
    for (let i = 0, len = yList.length; i < len; i++) if (currentYear === +yList[i]) yIndex = i
    for (let i = 0, len = mList.length; i < len; i++) if (currentMonth === +mList[i]) mIndex = i
    this.setData({ timeList: [yList, mList], timeIndex: [yIndex, mIndex] })
    // const currentDate = new Date().getTime()
    // this.setData({
    //   end: this.reverseTime(currentDate + 31536000000),
    //   CreateTime: this.reverseTime(currentDate)
    // })
  },
  reverseTime(time) {
    let obj = $api.timeStamp(time)
    return `${obj.y}-${obj.m}-${obj.d}`
  },
  onLoad: function (options) {
    this.data.ysjId = +options.ysjId || 0 //0 添加 >0 修改 -1进入页面请求出错，页面就不显示了省得后面操作尴尬
  },
  onReady: function () {
    const { ysjId } = this.data
    this.initTime()
    //修改
    if (ysjId) return this.getThisInfo()
    //创建的
    let data = app.copyBlowerData
    data.ysjId = 0
    this.viewData(data)
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