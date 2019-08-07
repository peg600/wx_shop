// pages/offlineShop/cash/cash.js
let app = getApp();
let baseUrl = app.globalData.baseHttpUrl;
let dataUrl = app.globalData.dataUrl;

let Utils = require("../../../lib/Utils.js")
let Sign = require("../../../lib/Sign.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    endorser_bonus: "",     //可提现金额
    endorser_virtual_bonus: "",     //待结算金额
    price: "",
    record_list: "",    //佣金记录

    current_mode: 0,
    cash_list: "",
    changed_cash: "",
    show_change: false,

    current_cash: "",     //订单详情
    show_detail: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.parseInviter(options)
    
    this.getDrawCashList();
  },

  // getEndorserBonus() {
  //   let that = this;
  //   wx.request({
  //     url: `${baseUrl}/index.php?m=default&c=endorser&a=get_user_endorser_bonus`,
  //     method: 'POST',
  //     dataType: 'txt',
  //     header: { 'content-type': 'application/x-www-form-urlencoded' },
  //     data: {
  //       session_id: wx.getStorageSync('session_id')
  //     },
  //     success: function (res) {
  //       function Trim(str) {
  //         return str.replace(/(^\s*)|(\s*$)/g, "");
  //       }
  //       res = JSON.parse(Trim(res.data));
      
  //       console.log(res)
  //       that.setData({
  //         endorser_bonus: res.endorser_bonus,
  //         endorser_virtual_bonus: res.endorser_virtual_bonus
  //       })

  //       that.getEndorserRecord();
  //     }
  //   });
  // },

  getEndorserRecord() {
    let that = this;
    wx.request({
      url: `${baseUrl}/index.php?m=default&c=endorser&a=get_user_endorser_record`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        session_id: wx.getStorageSync('session_id')
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        that.setData({
          record_list: res
        })
      }
    });
  },

  getDrawCashList() {
    let that = this;
    wx.request({
      url: `${baseUrl}/index.php?m=default&c=offlineShop&a=get_draw_cash_list`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        session_id: wx.getStorageSync('session_id'),
        is_bank_pay: 0
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        console.log(res)
        let show_change = false;
        if (res.changed_cash.length > 0) {
          show_change = true;
        }
        that.setData({
          cash_list: res.cash_list,
          changed_cash: res.changed_cash,
          show_change: show_change
        })
      }
    });
  },

  changeMode(e) {
    let mode = e.currentTarget.dataset.mode;
    this.setData({
      current_mode: mode
    })
    this.getDrawCashList();
  },

  toggleShowDetail(e) {
    let that = this;
    let cash_info = "";
    if (e.currentTarget.dataset.cash_info) {
      cash_info = e.currentTarget.dataset.cash_info;
    }
    console.log(cash_info)
    
    this.setData({
      current_cash: cash_info,
      show_detail: !that.data.show_detail
    })
  },

  hideChange() {
    this.setData({
      show_change: false
    })
  },

  toService(e) {
    let partner_trade_no = e.currentTarget.dataset.partner_trade_no;
    wx.navigateTo({
      url: `/pages/offlineShop/service/service?partner_trade_no=${partner_trade_no}`,
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

  }
})