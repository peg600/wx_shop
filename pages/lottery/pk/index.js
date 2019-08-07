// pages/lottery/pk/index.js
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    selected_index:0,
    selectedEmojiIndex:1,
    selectedEmoji:"大笑",
    show_selector:false,
    autoHide:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      navbar_height: app.globalData.height
    })
    if (!app.globalData.hasAirlineSetting) {
      wx.switchTab({
        url: '/pages/lottery/lottery',
      })
      return;
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

  },

  switchtab(e){
    var index = e.currentTarget.dataset.index;
    this.setData({
      selected_index: index
    })
  },

  switchEmoji(e)
  {
    var index = e.currentTarget.dataset.index;
    var emoji = e.currentTarget.dataset.emoji;
    this.setData({
      selectedEmojiIndex: index,
      selectedEmoji:emoji
    })
  },

  confirmPK(e)
  {
    var emoji = this.data.selectedEmojiIndex;
    app.globalData.action_type = emoji;
    wx.setStorageSync("action_type", emoji);
    var url = '/pages/faceTest/choosePhoto/choosePhoto?type=' + emoji + "&targetUrl=" + encodeURI("/pages/lottery/pk/preview/preview");
    wx.navigateTo({
      url: url,
    });
    this.setData({
      show_selector:false
    })
  },

  newPK(e)
  {
    this.setData({
      show_selector:true
    })
  }
})