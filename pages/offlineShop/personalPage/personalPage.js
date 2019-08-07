// pages/offlineShop/personalPage/personalPage.js
let app = getApp();
let baseUrl = app.globalData.baseHttpUrl;
let dataUrl = app.globalData.dataUrl;

let Utils = require("../../../lib/Utils.js")
let Sign = require("../../../lib/Sign.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    endorser_info: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.parseInviter(options)
    
    this.getEndorserInfo();
  },

  getEndorserInfo() {
    let that = this;
    wx.request({
      url: `${baseUrl}/index.php?m=default&c=endorser&a=get_endorser_info`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        session_id: wx.getStorageSync('session_id')
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        console.log(res)

        if(res.endorser_grade == 1) {
          res.current_grade = "普通会员";
          res.next_grade = "营销经理";
          res.need_number = 5;
        }else{
          res.current_grade = "营销经理";
          res.next_grade = "高级营销经理";
          res.need_number = 100;
        }

        that.setData({
          endorser_info: res
        })
      }
    });
  },

  //发起提现请求
  drawCash() {
    wx.showLoading({
      title: '请稍候...',
    })
    let that = this;
    wx.request({
      url: `${baseUrl}/index.php?m=default&c=offlineShop&a=draw_cash`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        session_id: wx.getStorageSync('session_id'),
        appid: 0
      },
      success: function (res) {
        wx.hideLoading();
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        console.log(res)
       
        if(res.error == 0) {
          wx.showToast({
            title: '提现成功！',
            duration: 2000
          })
        }else{
          wx.showToast({
            title: res.message,
            icon: 'none',
            duration: 2000
          })
        }
        that.getEndorserInfo();
      },
      fail: function() {
        wx.hideLoading();
        wx.showToast({
          title: "请求失败，请检查网络",
          icon: 'none',
          duration: 2000
        })
      },
      complete: function() {
       
      }
    });
  },

  gotoCash() {
    wx.navigateTo({
      url: '/pages/offlineShop/cash/cash',
    })
  },

  gotoFans() {
    wx.navigateTo({
      url: '/pages/offlineShop/personalPage/fans/fans',
    })
  },

  gotoCoupon() {
    wx.navigateTo({
      url: '/pages/offlineShop/personalPage/myCoupon/myCoupon',
    })
  },

  gotoCashCoupon() {
    wx.navigateTo({
      url: '/pages/offlineShop/personalPage/myCashCoupon/myCashCoupon',
    })
  },

  gotoOrder() {
    wx.navigateTo({
      url: '/pages/offlineShop/personalPage/myOrder/myOrder',
    })
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
    let that = this;
    return {
      path: `/pages/New/index?inviter=${app.globalData.current_user_id}`
    }
  }
})