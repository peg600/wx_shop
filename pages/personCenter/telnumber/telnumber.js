// pages/personCenter/telnumber/telnumber.js
var app = getApp();
var baseUrl = app.globalData.baseHttpUrl;
const shop_id = app.globalData.shop_id;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShow:-1,
    telValue:'',
    codeValue:'',
    telNumber:'',
    isBind:true,
    codeText:'获取验证码',
    isDisabled:false,
    isClickGetCode:true,
    second:60
  },
  //获取验证码
  getCode:function(){
    if (!this.isPoneAvailable(this.data.telValue)) {
      wx.showToast({
        title:'请填写正确的手机号',
        icon: 'none'
      })
      return
    }
    if (this.data.isClickGetCode){
      var that = this;
      this.setData({
        isClickGetCode:false,
        isDisabled:true
      })
      var timer = setInterval(function(){
        if (that.data.second >0){
          that.setData({
            codeText:that.data.second+'秒后再次获取',
            second: --that.data.second
          })
        }else{
          clearInterval(timer)
          that.setData({
            isClickGetCode: true,
            isDisabled: false,
            second:60,
            codeText:'获取验证码'
          })
        }
      },1000)
      //向后台发送手机号和用户名，生成相应的验证码和时间并发送短信
      wx.request({
        url: baseUrl + '/index.php?m=default&c=flow&a=creat_code_and_send',
        method: 'POST',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        dataType: 'txt',
        data: {
          session_id: wx.getStorageSync('session_id'),
          tel: that.data.telValue,
          shop_id: shop_id
        },
        success: function (res) {
          function Trim(str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
          }
          res.data = JSON.parse(Trim(res.data))
          //console.log(res.data)
          if(res.data.error != 0) {
            wx.showToast({
              title: '获取验证码失败，请重新获取',
              icon: 'none',
              duration: 3000
            })
            return
          }
        },
        error:function() {
          //console.log(2)
          wx.showToast({
            title: '获取验证码失败，请重新获取',
            icon: 'none',
            duration: 3000
          })
          return
        }
      })
    }
  },

  telValue:function(e){
    this.setData({
      telValue:e.detail.value
    })
  },
  codeValue: function (e) {
    this.setData({
      codeValue: e.detail.value
    })
  },
  isPoneAvailable: function (pone) {
    //console.log(pone)
    var myreg = /^[1][3,4,5,6,7,8][0-9]{9}$/;
    if (!myreg.test(pone)) {
      return false;
    } else {
      return true;
    }
  },
  binTel:function(){
    var tel = this.data.telValue;
    var codeValue = this.data.codeValue;
    var that = this;
    if(!this.data.isBind){
      wx.showToast({
        title: '请先同意服务声明',
        icon: 'none'
      })
      return 
    }
    if (!this.isPoneAvailable(tel)){
      wx.showToast({
        title: '请填写正确的手机号',
        icon: 'none'
      })
    }else{
      wx.request({
        url: baseUrl + '/index.php?m=default&c=flow&a=bind_tel_by_user',
        method: 'POST',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        dataType: 'txt',
        data: {
          session_id: wx.getStorageSync('session_id'),
          tel: tel,
          code: codeValue,
          shop_id: shop_id
        },
        success: function (res) {
          function Trim(str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
          }
          res.data = JSON.parse(Trim(res.data))
          //console.log(res.data)
          if(res.data.error == 0){
            wx.showToast({
              title: '绑定成功',
              icon:'success'
            })
            that.getUserTel();
          }else{
            if(res.data.message == "time over") {
              wx.showToast({
                title: '该验证码已过期，请重新获取',
                icon: 'none',
                duration: 3000
              })
              return;
            } else if (res.data.message == "code different") {
              wx.showToast({
                title: '验证码错误，请重新输入',
                icon: 'none',
                duration: 3000
              })
              return;
            }else{
              wx.showToast({
                title: '绑定失败，请检查网络或重新获取验证码',
                icon: 'none',
                duration: 3000
              })
              return;
            }
          }
        }
      })
    }
  },
  removeBindTel:function(e){
    var that = this;
    wx.showModal({
      title: '解除绑定',
      content: '确认解除当前绑定手机？',
      success:function(res){
        if(res.confirm){
          wx.request({
            url: baseUrl + '/index.php?m=default&c=flow&a=remove_tel',
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            dataType: 'txt',
            data: {
              session_id: wx.getStorageSync('session_id'),
              shop_id: shop_id
            },
            success: function (res) {
              function Trim(str) {
                return str.replace(/(^\s*)|(\s*$)/g, "");
              }
              res.data = JSON.parse(Trim(res.data))
              //console.log(res.data)
              if(res.data.error == 0){
                wx.showToast({
                  title: '解绑成功',
                  icon:'success'
                })
                that.getUserTel();
              }
            }
          })
        }else if(res.cancel){
          //console.log('用户取消解除绑定')
        }
      }
    })
  },
  getUserTel:function(){
    wx.showLoading({
      title: '请稍候',
      mask:true
    })
    var that = this;
    wx.request({
      url: baseUrl + '/index.php?m=default&c=flow&a=get_tel_by_user',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType: 'txt',
      data: {
        session_id: wx.getStorageSync('session_id'),
        shop_id: shop_id
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data))
        if (res.data.result.mobile_phone) {
          that.setData({
            isShow: 1,
            telNumber: res.data.result.mobile_phone
          })
        }else{
          that.setData({
            isShow: 0
          })
        }
        wx.hideLoading();
      }
    })
  },
  changeImg:function(e){
    this.setData({
      isBind:!this.data.isBind
    })
  },

  goBack:function() {
    wx.navigateBack();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getApp().parseInviter(options);
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
    this.getUserTel();
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
     var params = getApp().getShareParams();
    return params;
  }
})