// pages/lottery/luckfriend/luckmall/luckmall.js
let app = getApp();
let baseUrl = app.globalData.baseHttpUrl;
let Utils = require("../../../../lib/Utils.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    star_number:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      navbar_height: app.globalData.height
    })
    this.getStars();
  },

  newFinding() {
    wx.setStorageSync("action_type", 32);
    var url = '/pages/faceTest/choosePhoto/choosePhoto?type=32&targetUrl=' + encodeURI("/pages/lottery/luckfriend/preview/preview");
    wx.navigateTo({
      url: url,
    });
  },

  getStars() {
    wx.showLoading({
      title: '正在载入...',
    })
    let that = this;
    Utils.request({
      url: `${baseUrl}/index.php?m=default&c=lottery&a=getNumberOfStars`,
      data: {},
      success: function (res) {
        res = JSON.parse(Utils.Trim(res.data));
        if (res.error == 1) {
          Utils.showToast(res.msg);
        }
        else {
          that.setData({
            star_number: res.star_number,
            star2019_number: res.star2019_number
          })
        }
        that.setData({
          loaded: true
        })
      },
      fail: function (res) {
        that.setData({
          hasError: true
        })
      },
      complete: function (res) {
        wx.hideLoading();
      }
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
    var actionType = parseInt(wx.getStorageSync("action_type"));
    if ((actionType == 32 || actionType == 64) && app.globalData.newFaceTest) {
      app.globalData.newFaceTest = false;
      wx.navigateTo({
        url: '/pages/lottery/luckfriend/preview/preview'
      })
    }
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
    this.selectComponent("#goodlist").onReachBottom();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})