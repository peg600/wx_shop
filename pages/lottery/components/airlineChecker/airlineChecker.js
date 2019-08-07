// pages/lottery/components/airlineChecker/airlineChecker.
let app = getApp();
let baseUrl = app.globalData.baseHttpUrl;
let Utils = require("../../../../lib/Utils.js");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    autoChecked: {
      type: Boolean,
      value: true
    }
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
    hasAirlineAddress(auto) {
      return;
      let that = this;
      if (app.globalData.hasAirlineSetting == undefined) {
        Utils.request({
          url: `${baseUrl}/index.php?m=default&c=airline&a=has_airline_address`,
          data: {
          },
          success: function(res) {
            res = JSON.parse(Utils.Trim(res.data));

            if (res._from) {
              app.globalData.hasAirlineSetting = true;
              that.triggerEvent("hasAirSetting");
            } else {
              app.globalData.hasAirlineSetting = false;
              that.triggerEvent("noAirSetting");
              if (auto)
                that.redirect();
            }
          },
          fail: function(e) {}
        });
      }
      else if(auto)
        this.redirect();
      else
      {
        if(app.globalData.hasAirlineSetting)
          that.triggerEvent("hasAirSetting");
        else 
          that.triggerEvent("noAirSetting");
      }
    },

    redirect() {
      if (app.globalData.hasAirlineSetting == false) {
        var pages = getCurrentPages();
        var currentPage = pages[pages.length - 1] //获取当前页面的对象

        var url = currentPage.route;
        if (currentPage.options) {
          url = url + "?";
          for (var key in currentPage.options) {
            url += (key + "=" + currentPage.options[key]);
          }
        }
        app.globalData.backUrl = encodeURIComponent("/" + url);
        wx.switchTab({
          url: '/pages/lottery/lottery',
        })
      }
    },
  },

  attached: function () {
    if (this.data.autoChecked)
      this.hasAirlineAddress(true);
  }
})