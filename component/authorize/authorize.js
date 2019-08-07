// pages/components/checkAuth/checkAuth.js
let app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    type: {   //要检查的权限种类，用户信息必会检查，1：用户信息；2：拍照; 3:保存图片
      type: String,
      value: "1"
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {

  },

  attached: function () {
    let that = this;
    var goAuthorize = function () {
      
      var pages = getCurrentPages();
      var currentPage = pages[pages.length - 1] //获取当前页面的对象

      var url = currentPage.route;
      if (currentPage.options) {
        url = url + "?";
        for (var key in currentPage.options) {
          url += (key + "=" + currentPage.options[key]);
        }
      }
      wx.redirectTo({
        url: `/pages/authorize/authorize?url=/${encodeURIComponent(url)}&type=${that.data.type}`
      })
    }
    wx.getSetting({
      success: function (res) {
        if (res.authSetting && !res.authSetting["scope.userInfo"]) {
          goAuthorize();
        } else {
          let type = that.data.type;
          if (type && type != "1") {
            if (type == "2") {
              if (res.authSetting && !res.authSetting["scope.camera"]) {
                goAuthorize();
              } else {
                that.triggerEvent("authorized");
              }
            } else if (type == "3") {
              if (res.authSetting && !res.authSetting["scope.writePhotosAlbum"]) {
                goAuthorize();
              } else {
                that.triggerEvent("authorized");
              }
            } else if (type == "4") {
              if (res.authSetting && !res.authSetting["scope.userLocation"]) {
                goAuthorize();
              } else {
                that.triggerEvent("authorized");
              }
            } else {
              that.triggerEvent("authorized");
            }
          } else {
            that.triggerEvent("authorized");
          }
        }
      }
    });
  }
})
