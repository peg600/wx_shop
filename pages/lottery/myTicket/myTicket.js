// pages/lottery/myTicket/myTicket.js
let app = getApp();
let baseUrl = app.globalData.baseHttpUrl;
let Utils = require("../../../lib/Utils.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedIndex:0,
    lottery_id:0,
    lottery_index:1,
    current_lottery_tickets:[],
    all_tickets:[],
    currentTickets:[],
    lotterLoaded:false,
    allLoaded:false,
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

    if(options.lottery_id)
    {
      this.data.lottery_id = options.lottery_id;
      this.getTicketsOfLottery();
    }
    else
    {
      this.getTickets();
    }
  },

  getTickets()
  {
    wx.showLoading({
      title: '正在加载...',
    })
    let that = this;
    Utils.request({
      url: `${baseUrl}/index.php?m=default&c=lottery&a=getTicketsOfUser`,
      data:{
        type:0
      },
      success:function(res)
      {
        res = JSON.parse(Utils.Trim(res.data));
        that.setData({
          all_tickets:res,
          currentTickets:res
        });
        that.data.allLoaded = true;
      },
      fail:function(res)
      {
        wx.hideLoading();
        Utils.showToast("网络错误，请检查重试！");
      },
      complete:function(res)
      {
        wx.hideLoading();
      }
    })
  },

  getTicketsOfLottery()
  {
    let that = this;
    Utils.request({
      url: `${baseUrl}/index.php?m=default&c=lottery&a=getTicketsOfUserInLottery`,
      data: {
        lottery_id:that.data.lottery_id
      },
      success: function (res) {
        res = JSON.parse(Utils.Trim(res.data));
        var title = "";
        if(res.length > 0)
        title = "第" + res[0].lottery_index + "期抽奖奖券";
        that.setData({
          current_lottery_tickets: res,
          lottery_text:title,
          currentTickets:res
        });
        that.data.lotterLoaded = true;
      },
      fail: function (res) {
        wx.hideLoading();
        Utils.showToast("网络错误，请检查重试！");
      },
      complete: function (res) {
        wx.hideLoading();
      }
    })
  },

  switchTab(e)
  {
    var index = e.currentTarget.dataset.index;
    this.setData({
      selectedIndex:index
    });
    if(index == 0)
    {
      if(!this.data.lotterLoaded)
        this.getTicketsOfLottery();
      else
      {
        this.setData({
          currentTickets:this.data.current_lottery_tickets
        })
      }
    }
    else if(index == 1)
    {
      if (!this.data.allLoaded)
        this.getTickets();
      else
      {
        this.setData({
          currentTickets: this.data.all_tickets
        })
      }
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
    if(this.data.currentTickets.length == 0 && this.data.selectedIndex == 1)
    {
      this.selectComponent("#goodlist").onReachBottom();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})