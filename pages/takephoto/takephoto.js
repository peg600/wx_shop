//index.js
//获取应用实例
const app = getApp()
app.globalData.test=0
const baseUrl = app.globalData.baseHttpUrl;
const shop_id = app.globalData.shop_id;
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    ghj: app.globalData.test,
    canGoBack:false,
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function (options) {
    if(options.scene) {
      var scene = decodeURIComponent(options.scene);
      console.log(scene)
      wx.navigateTo({
        url: `/pages/offlineShop/couponPage/couponPage?${scene}`,
      })
    }

    
    // if (app.globalData.userInfo) {
    //   this.setData({
    //     userInfo: app.globalData.userInfo,
    //     hasUserInfo: true
    //   })
    //   wx.navigateTo({
    //     url: '/pages/fitview/fitview',
    //   })
    // } else if (this.data.canIUse){
    //   // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //   // 所以此处加入 callback 以防止这种情况
    //   app.userInfoReadyCallback = res => {
    //     this.setData({
    //       userInfo: res.userInfo,
    //       hasUserInfo: true
    //     })
    //     wx.navigateTo({
    //       url: '/pages/fitview/fitview',
    //     })
    //   }
    // } else {
    //   // 在没有 open-type=getUserInfo 版本的兼容处理
    //   wx.getUserInfo({
    //     success: res => {
    //       app.globalData.userInfo = res.userInfo
    //       this.setData({
    //         userInfo: res.userInfo,
    //         hasUserInfo: true
    //       })
    //       //console.log(3)
    //       wx.navigateTo({
    //         url: '/pages/fitview/fitview',
    //       })
    //     }
    //   })
    // }
  },

  onShow:function(options){
    // var pages = getCurrentPages();
    // //console.log(pages);
    // var direction = getApp().globalData.nextDirection;
    // //console.log(direction);
    // if(direction == "fitview") {
    //   wx.navigateTo({
    //     url: '/pages/fitview/fitview',
    //   })
    // }else{
    //   wx.switchTab({
    //     url: '/pages/New/index',
    //   });
    //   getApp().globalData.nextDirection = "fitview";
    // }
  },

  onPullDownRefresh:function(){
    this.setData({
      motto:"good"
    })
  },
  getUserInfo: function(e) {
    //console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
