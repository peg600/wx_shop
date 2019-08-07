var app = getApp();
const baseUrl = app.globalData.baseHttpUrl;
const shop_id = app.globalData.shop_id;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    session_id: "",
    goods_id: "",
    cat_id: "",
    url: "",
    ios: false
  },

  onTabItemTap(item) {
  
      // wx.hideTabBar(
      //   {
      //     aniamtion: true
      //   }
      // )
  
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //getApp().parseInviter(options);
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        if (res.system.indexOf("iOS") != -1) {
          that.setData({
            ios: true
          })
        } else {
          that.setData({
            ios: false
          })
        }
      }
    })
    this.setData({
      session_id: wx.getStorageSync('session_id')
    })
    if(options.goods_id) {
      this.setData({
        goods_id: options.goods_id
      })
    }
    if(options.cat_id) {
      this.setData({
        cat_id: options.cat_id
      })
    }
    if (options.shop_id) {
      this.setData({
        shop_id: options.shop_id
      })
    }
    if (options.shop_name) {
      this.setData({
        shop_name: options.shop_name
      })
    }
    var app = getApp().globalData;
    var url = `https://holotest.feeai.cn/h5/fitting1/b8c6da3834070b503d7d5ccad280562f.php?session_id=${this.data.session_id}&goods_id=${this.data.goods_id}&cat_id=${this.data.cat_id}&inviter=${app.inviter}&sourcer=${app.current_user_id}&version=${app.fittingVersion}&shop_id=${this.data.shop_id}&baseUrl=${baseUrl}/&shop_name=${this.data.shop_name}`
    console.log(url)
    this.setData({
      url: url
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
    app.globalData.nextDirection = "index";
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
    // //console.log(this.data.ios)
    // if(this.data.ios) {
      //因ios截图为黑屏，故用默认图分享
      return {
        title: '好Shopping，都是对美的一试钟情',
        imageUrl: "/pages/img/default_share_pic.jpg",
        path: getApp().fillPathParams('/pages/fitview/fitview')
      }
  }
})