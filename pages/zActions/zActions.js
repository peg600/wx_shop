// pages/zActions/zActions.js
const app = getApp();
const baseUrl = app.globalData.baseHttpUrl;
const shop_id = app.globalData.shop_id;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    noAction: false,
    actionPageUrl: "",
    title: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (options.actionPageUrl) {
      var url = decodeURIComponent(options.actionPageUrl);
      this.setData({
        actionPageUrl: url
      })
      if (options.title) {
        var title = decodeURIComponent(options.title );
        this.setData({
          title: title
        })
        wx.setNavigationBarTitle({
          title: title
        })
      }
    }else{
      this.setData({
        noAction: true
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
     var params = getApp().getShareParams();
     console.log(params)
     var title = params.title;
     var path = params.path
     path = `${path}&title=${this.data.title}&actionPageUrl=${this.data.actionPageUrl}`
    return {
      title: title,
      path: path
    }
  }
})