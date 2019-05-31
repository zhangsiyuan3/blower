const mapKey = require('./qqmap.js')
const $interface = require('./interface.js')
module.exports = {
  getLocation() { //获取当前坐标
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        altitude: true,
        success: resolve,
        fail: reject
      })
    })
  },
  geocoder(address = '北京市海淀区彩和坊路海淀西大街74号') { //腾讯地图,地址解析
    return new Promise((resolve, reject) => {
      mapKey.geocoder({
        address: address,
        success: resolve,
        fail: reject
      })
    })
  },
  reverseGeocoder(options) { //腾讯地图，逆地址解析
    const {
      latitude,
      longitude
    } = options
    return new Promise((resolve, reject) => {
      mapKey.reverseGeocoder({
        location: {
          latitude,
          longitude
        },
        success: res => res.status === 0 ? wx.setStorageSync('currentLocation', res.result) || resolve(res) : reject(res),
        fail: reject
      })
    })
  },
  getCurrentLocation() { //获取当前位置
    return new Promise((resolve, reject) => {
      this.getLocation()
        .then(this.reverseGeocoder)
        .then(resolve)
        .catch(reject)
    })
  },
  chooseImage(count) { //选择相片
    return new Promise((resolve, reject) => wx.chooseImage({
      count,
      success: resolve,
      fail: reject
    }))
  },
  uploadImage(filePath) { //上传图片
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: $interface.UploadImg,
        filePath,
        name: 'postFile',
        success: resolve,
        fail: reject
      })
    })
  },
  deleteImage(img) { //删除图片
    return this.request($interface.DeleteImg, {
      img
    })
  },
  timer: null,
  debounce(timer, timeout = 300) { //防抖
    timer = !timer && this.timer
    return new Promise((resolve, reject) => {
      clearTimeout(timer)
      timer = setTimeout(resolve, timeout)
    })
  },
  request(url, data, method = 'POST') { //请求
    return new Promise((resolve, reject) => wx.request({
      url,
      data,
      method,
      header: {
        'content-type': 'application/json'
      },
      success: resolve,
      fail: reject
    }))
  },
  unique(arr, id) { //数组去重
    let hash = {}
    return arr.reduce((item, target) => {
      hash[target[id]] ? '' : hash[target[id]] = true && item.push(target)
      return item
    }, [])
  },
  timeStamp(str) { //时间戳转换为时间
    let timeStamp = ('' + str).replace(/\D/g, '')
    let date = new Date(+timeStamp),
      y = date.getFullYear(),
      m = date.getMonth() + 1,
      d = date.getDate(),
      h = date.getHours(),
      mi = date.getMinutes(),
      s = date.getSeconds(),
      w = date.getDay()
    m < 10 && (m = '0' + m)
    d < 10 && (d = '0' + d)
    h < 10 && (h = '0' + h)
    mi < 10 && (mi = '0' + mi)
    s < 10 && (s = '0' + s)
    return {
      y,
      m,
      d,
      h,
      mi,
      s,
      w
    }
  },
  makePhoneCall(phoneNumber) { //拨打电话
    return new Promise((resolve, reject) => wx.makePhoneCall({
      phoneNumber,
      success: resolve,
      fail: reject
    }))
  },
  share(title = '鼓风机', path = '/path/login/login', imageUrl = null) { //分享
    return {
      title,
      path,
      imageUrl
    }
  },
  showModal(content = '你觉得缺点什么', showCancel = false, confirmText = '确定', title = '提示', cancelText = '取消') {
    return new Promise((resolve, reject) => wx.showModal({
      title,
      content,
      showCancel,
      confirmText,
      cancelText,
      success: resolve,
      fail: reject
    }))
  },
  showToast(title = '提示内容', icon = 'none', duration = 1500, mask = false) {
    return new Promise((resolve, reject) => wx.showToast({
      title,
      icon,
      mask,
      duration
    }))
  },
  openLocation(latitude = 23.099994, longitude = 113.324520, scale) { //打开地图查看位置
    return new Promise((resolve, reject) => wx.openLocation({
      latitude,
      longitude,
      scale,
      success: resolve,
      fail: reject
    }))
  },
  loading(title = '请求中...', mask = true) {
    wx.showLoading({
      title,
      mask
    })
  },
  hide() {
    wx.hideLoading()
  },
  login() {
    return new Promise((resolve, reject) => wx.login({
      success: resolve,
      fail: reject
    }))
  },
  getOpenId() { //获取openId
    return new Promise((resolve, reject) => {
      if (wx.getStorageSync('openid')) return resolve()
      this.login()
        .then(res => this.request($interface.GetOpenId, {
          code: res.code
        }))
        .then(res => {
          if (res.data.res) {
            wx.setStorageSync('openid', res.data.openid)
            resolve()
          }
        })
    })
  },
  trim(data) { //判断字符串是否为空
    return (str) => data[str].trim().length > 0
  },
  newDate(str = '') {
    let time = new Date(str)
    if (isNaN(time)) time = new Date(str.replace(/\-/g, '/')) //ios
    return time
  },
}