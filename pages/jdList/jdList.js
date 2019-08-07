// pages/jdList/jdList.js
let app = getApp();
let baseUrl = app.globalData.baseHttpUrl;

let md5 = require('../../lib/md5.js');
let Utils = require("../../lib/Utils.js")


Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods_list: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let data = {};
    data.success = this.onGetJdGoods;
    data.params = {};
    data.params.eliteId = 2;
    data.params.pageIndex = 1;
    data.params.pageSize = 20;
    //data.params.sortName = "price";
    //data.params.sort = "desc";
    Utils.get_jd_goods(data);
    this.getGoodsInfo()
  },

  onGetJdGoods(goods_list) {
    console.log(goods_list)
    this.setData({
      goods_list: JSON.stringify(goods_list)
    })
  },

  getGoodsInfo() {
    let that = this;
    wx.request({
      url: `${baseUrl}/index.php?c=goods&id=153`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {

      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));

        console.log(res)
      },
      fail: function (err) {
        //console.log(err)
        wx.showToast({
          title: '请求失败，请检查网络重试',
          icon: 'none',
          duration: 2000
        })
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