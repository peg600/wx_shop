// pages/authorize/authorize.js
const app = getApp();
var baseUrl = app.globalData.baseHttpUrl;
var htmlUrl = app.globalData.htmlUrl;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: "1", //授权种类，1：用户信息；2：拍照; 3:保存图片; 4:获取位置
    url: "/pages/New/index", //跳回的路径
    ready: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.data.url = encodeURIComponent(this.data.url);
    if (options.type) {
      this.setData({
        type: options.type
      })
    }
    if (options.url) {
      this.setData({
        url: options.url
      })
    }

    let that = this;
    wx.getSystemInfo({
      success: function(res) {
        let h = 750 * res.windowHeight / res.windowWidth;
        that.setData({
          screenHeight: h
        });
      }
    });

    var ready = function()
    {
      that.setData({
        ready:true
      })
    }

    let type = this.data.type;
    wx.getSetting({
      success: function (res) {
        if(type == "1") {
          if (res.authSetting["scope.userInfo"]) {
            that.gotoFiestPage();
          }
          else {
            ready();
          }
        } else if (type == "2") {
          if (res.authSetting["scope.camera"]) {
            that.gotoFiestPage();
          }
          else {
            wx.authorize({
              scope: 'scope.camera',
              success() {
                // 用户已经同意小程序使用拍照功能，后续调用不会弹窗询问
                that.gotoFiestPage();
              },
              fail() {
                ready();
              }
            })
          }
        } else if(type == "3") {
          if (res.authSetting["scope.writePhotosAlbum"]) {
            that.gotoFiestPage();
          }
          else {
            wx.authorize({
              scope: 'scope.writePhotosAlbum',
              success() {
                // 用户已经同意小程序使用拍照功能，后续调用不会弹窗询问
                that.gotoFiestPage();
              },
              fail() {
                ready();
              }
            })
          }
        } else if (type == "4") {
          if (res.authSetting["scope.userLocation"]) {
            that.gotoFiestPage();
          } else {
            wx.authorize({
              scope: 'scope.userLocation',
              success() {
                // 用户已经同意小程序使用位置功能，后续调用不会弹窗询问
                that.gotoFiestPage();
              },
              fail() {
                ready();
              }
            })
          }
        } else {
          that.gotoFiestPage();
        }
      },
      fail: res => {
        ready();
      }
    })
    
  },

  onGoUserInfo(e) {
    let that = this;
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      wx.showToast({
        title: '正在登录...',
      })
      let userInfo = e.detail.userInfo;
      wx.request({
        url: baseUrl + '/index.php?m=default&c=flow&a=update_user_info_by_user_id',
        method: 'POST',
        dataType: 'txt',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          appid: app.globalData.appId,
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv,
          session_id: wx.getStorageSync('session_id'),
          nick_name: userInfo.nickName,
          avatar_url: userInfo.avatarUrl,
          city: userInfo.city,
          country: userInfo.country,
          gender: userInfo.gender,
          province: userInfo.province
        },
        success: function(res) {
          app.globalData.nick_name = userInfo.nickName;
          that.gotoFiestPage();
        },
        fail: function(err) {
          console.log(err)
        },
        complete: function(res) {
          wx.hideLoading();
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '你拒绝了授权申请，开心小集可能会无法正常工作',
        showCancel: false,
      })
    }
  },

  onOpenSetting(e) {
    let that = this;
    let authSetting = e.detail.authSetting;
    
    console.log(e)
    if (this.data.type == 2) { //相机授权
      if (authSetting['scope.camera']) {
        that.gotoFiestPage();
      }
    } else if (this.data.type == 3) { //保存图片
      if (authSetting['scope.writePhotosAlbum']) {
        that.gotoFiestPage();
      }
    } else if (this.data.type == 4) { //保存图片
      if (authSetting['scope.userLocation']) {
        that.gotoFiestPage();
      }
    }else{ 
      wx.navigateBack()
    }
  },

  gotoFiestPage() {
    let that = this;
    wx.redirectTo({
      url: decodeURIComponent(that.data.url),
      fail: function (e) {
        wx.switchTab({
          url: decodeURIComponent(that.data.url)
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    app.uploadFormIds();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})