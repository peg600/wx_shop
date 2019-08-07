// pages/toPersonalShop/personal_shop_list/personal_shop_list.js
const app = getApp()
var baseUrl = app.globalData.baseHttpUrl;
var htmlUrl = app.globalData.htmlUrl;
const shop_id = app.globalData.shop_id;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    componentlist: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      current_user_id: app.globalData.current_user_id
    })
    var mode = 1;
    var limit = 100;
    this.data.componentlist.push({
      "name": "headpanel",
      "title": "我附近的小店",
      "subtitle":"哎呀，距离这么近，进去逛逛！！",
      "textsize":"1"
    });
    this.data.componentlist.push({
      "name": "shoplist",
      "listStyle": "3",
      "mode": "2",
      "limit": "100",
      "itemShopName": "1",
      "itemShopDesc": "1"
    });
    var that = this;
    that.setData({
      componentlist: that.data.componentlist
    });
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

  }
})