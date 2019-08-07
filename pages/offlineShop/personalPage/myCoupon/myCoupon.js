// pages/offlineShop/personalPage/myCoupon/myCoupon.js
let app = getApp();
let baseUrl = app.globalData.baseHttpUrl;
let dataUrl = app.globalData.dataUrl;

let Utils = require("../../../../lib/Utils.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    coupons: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.parseInviter(options)

    if (options.shop_id) {
      this.setData({
        shop_id: options.shop_id
      })
    }

    if (options.scene) {
      let scene = decodeURIComponent(options.scene);
      let pattern = /shop_id=([0-9]+)/g;
      let match = pattern.exec(scene);
      if (match) {
        let shop_id = match[1];
        this.setData({
          shop_id: shop_id
        })
      }
    }
    this.getOfflineShopCoupons(this.data.shop_id)

    app.parseInviter(options);
  },

  getOfflineShopCoupons() {
    let that = this;
    let shop_id = this.data.shop_id;
    wx.request({
      url: `${baseUrl}/index.php?m=default&c=offlineShop&a=get_all_usable_coupons`,
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
        for (let i = 0; i < res.length; i++) {
          let is_intime = Utils.isInTime(false, res[i].end_time)
          if (!is_intime) {
            res[i].is_outdated = true;
          }
        }
        console.log(res)
        that.setData({
          coupons: res
        })
      }
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