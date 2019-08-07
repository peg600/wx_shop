// pages/CPA/CPA.js
const app = getApp();
const baseUrl = app.globalData.baseHttpUrl;
const shop_id = app.globalData.shop_id;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cash:0,
    orderCount:0,
    income:0
  },

  loadCPAData:function()
  {
    var that = this;
    var session_id = wx.getStorageSync('session_id');
    wx.request({
      url: baseUrl + '/index.php?m=default&c=flow&a=getcpa',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType: 'txt',
      data: {
        session_id: session_id,
        shop_id: shop_id
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data))

        var orderCount = 0;
        var total = 0;
        var cash = 0;
        for (var i = 0; i < res.data.length; i++)
        {
          orderCount ++;
          total += parseFloat(res.data[i].total);
          if(res.data[i].cash != undefined)
          cash = parseFloat(res.data[i].cash);
        }
        that.setData({
          orderCount: orderCount,
          income: total,
          cash:cash
        });
        that.orderCount = orderCount;
      },
      fail: function (err) {
        //console.log(err)
        wx.showToast({
          title: '请求失败，请检查网络重试',
          icon: 'none',
          duration: 2000
        })
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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
    this.loadCPAData();
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