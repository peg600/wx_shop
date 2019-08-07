// pages/group_purchase/group_purchase_complete/group_purchase_complete.js
 
const app = getApp()
var baseUrl = app.globalData.baseHttpUrl;
var htmlUrl = app.globalData.htmlUrl;
const shop_id = app.globalData.shop_id;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    captain_order_id: "",
    order_id: "",  //当前用户订单id
    users_info: {},
    order_info: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.order_id) {
      this.setData({
        order_id: options.order_id
      })
    }
    if (options.captain_order_id) {
      this.setData({
        captain_order_id: options.captain_order_id
      })
    }

    let that = this;
    // 根据团长order_id获取拼团用户信息
    wx.request({
      url: baseUrl + '/index.php?c=flow&a=get_group_users_by_order_id',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType: 'txt',
      data: {
        session_id: wx.getStorageSync('session_id'),
        order_id: that.data.captain_order_id,
        shop_id: shop_id
      },
      success: function (res) {
        //console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        that.setData({
          users_info: res
        })
        console.log(that.data.users_info)
      }
    });

    wx.request({
      url: baseUrl + '/index.php?c=flow&a=get_order_info',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType: 'txt',
      data: {
        session_id: wx.getStorageSync('session_id'),
        order_id: that.data.order_id,
        shop_id: shop_id
      },
      success: function (res) {
        //console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        that.setData({
          order_info: res[0]
        })
        console.log(that.data.order_info)
      }
    });
  },

  gotoDetail: function () {
    wx.navigateTo({
      url: "/pages/detailPage/detailPage?goods_id=" + this.data.order_info.goods_id,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  goBack: function() {
    wx.switchTab({
      url: '/pages/New/index',
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