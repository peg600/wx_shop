//logs.js
const util = require('../../utils/util.js')
const app = getApp();
const baseUrl = app.globalData.baseHttpUrl;
const shop_id = app.globalData.shop_id;

Page({
  data: {
    logs: []
  },
  onLoad: function () {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return util.formatTime(new Date(log))
      })
    })
  }
})
