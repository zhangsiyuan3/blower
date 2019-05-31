const domain = `https://blower.1-zhao.cn`
const phoneReg = /^(1[3456789]|9[28])\d{9}$/ // 正则手机号码
const uploadUrl = `${domain}/Images/` //上传图片的地址
module.exports = {
    phoneReg,
    uploadUrl,
    //获取openId
    GetOpenId: `${domain}/LittleProgram/Blower/GetOpenId`,
    //手机号登录
    SaveOpenId: `${domain}/LittleProgram/Blower/SaveOpenId`,
    //获取站房列表
    BlowerList: `${domain}/LittleProgram/Blower/BlowerList`,
    //创建站房
    CreateStation: `${domain}/LittleProgram/Blower/CreateStation`,
    //上传图片
    UploadImg: `${domain}/LittleProgram/Blower/UploadImg`,
    //删除图片
    DeleteImg: `${domain}/LittleProgram/Blower/DeleteImg`,
    //获取本人名称
    GetSellUserInfo: `${domain}/LittleProgram/Blower/GetSellUserInfo`,
    //修改前-获取站房信息
    zfinfo: `${domain}/LittleProgram/Blower/zfinfo`,
    //修改站房信息
    UpdatezfInfo: `${domain}/LittleProgram/Blower/UpdatezfInfo`,
    //获取压缩机列表
    compressorlist: `${domain}/LittleProgram/Blower/compressorlist`,
    //获取压缩技术
    Ysjishu: `${domain}/LittleProgram/Blower/Ysjishu`,
    //添加压缩机信息
    addYsj: `${domain}/LittleProgram/Blower/addYsj`,
    //修改压缩机-获取信息
    ysjinfo: `${domain}/LittleProgram/Blower/ysjinfo`,
    //修改压缩机
    UpdateYsj: `${domain}/LittleProgram/Blower/UpdateYsj`,
    //删除压缩机
    DelYsj: `${domain}/LittleProgram/Blower/DelYsj`,
}