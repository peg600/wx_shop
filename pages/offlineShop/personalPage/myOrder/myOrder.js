// pages/offlineShop/personalPage/myOrder/myOrder.js

let app = getApp();
let baseUrl = app.globalData.baseHttpUrl;
let dataUrl = app.globalData.dataUrl;

let Utils = require("../../../../lib/Utils.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    order_list: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  getOrderList() {
    let that = this;
    let shop_id = this.data.shop_id;
    wx.request({
      url: `${baseUrl}/index.php?m=default&c=offlineShop&a=get_order_list_by_user_id`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        appid: app.globalData.appId,
        session_id: wx.getStorageSync('session_id')
      },
      success: function (res) {
        console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        console.log(res)
        
        that.setData({
          order_list: res
        })
      }
    });
  },

  //未付款订单重新付款
  pay(e) {
    let that = this;
    let order_info = e.currentTarget.dataset.order_info;
    wx.navigateTo({
      url: `/pages/offlineShop/pay/pay?shop_id=${order_info.shop_id}&goods_id=${order_info.goods_id}&type=${order_info.type}&price=${order_info.price}&group_purchase_id=${order_info.group_purchase_id}&order_id=${order_info.order_id}`,
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
    this.getOrderList();
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