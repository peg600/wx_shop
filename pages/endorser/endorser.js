// pages/endorser/endorser.js
const app = getApp();
var baseUrl = app.globalData.baseHttpUrl;

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.parseInviter(options);
  },

  toTakePhoto(e) {
    let destination = e.target.dataset.destination;
    if (destination == "similar") {
      wx.navigateTo({
        url: '/pages/endorser/takePhoto/takePhoto?path=/pages/endorser/similar/similar',
      })
    }else{
      wx.navigateTo({
        url: '/pages/endorser/takePhoto/takePhoto?path=/pages/endorser/poster/poster',
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
    return {
      title: "分享测试",
      path: `/pages/authorize/authorize?inviter=${app.globalData.current_user_id}`
    }
  }
})