const app = getApp();
var baseUrl = app.globalData.baseHttpUrl;
Page({
  data: {
    componentlist: [],
  },

  onLoad(options) {
    var that = this;
    if (options.page_id != undefined) {
      wx.request({
        url: baseUrl + '/?c=page&a=getPage&id=' + options.page_id,
        method: "POST",
        dataType: 'txt',
        success: res => {
          function Trim(str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
          }
          var pages = JSON.parse(Trim(res.data));
          that.data.componentlist = JSON.parse(pages.pages);

          that.setData({
            componentlist: that.data.componentlist
          });
        }
      });
    }
  },
})