// pages/toPersonalShop/personal_history/personal_history.js
const app = getApp()
var baseUrl = app.globalData.baseHttpUrl;
var htmlUrl = app.globalData.htmlUrl;
const shop_id = app.globalData.shop_id;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    history_list: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      current_user_id: app.globalData.current_user_id
    })
    let that = this;

    this.getHistory();
    
  },

  getHistory() {
    let that = this;
    wx.request({
      url: baseUrl + '/index.php?m=default&c=shop&a=get_personal_shop_visit_history',
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        session_id: wx.getStorageSync('session_id'),
        shop_id: shop_id,
        start: 0,
        end: 6
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        console.log(res)
        that.setData({
          history_list: res
        })
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

  toShop(e) {
    if (e.currentTarget.dataset.user_id) {
      let user_id = e.currentTarget.dataset.user_id;
      wx.navigateTo({
        url: `/pages/personalShop/personalShop?user_id=${user_id}`,
      })
    }
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