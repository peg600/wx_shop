// pages/lottery/ticket/ticket.js
let app = getApp();
let baseUrl = app.globalData.baseHttpUrl;
let Utils = require("../../../lib/Utils.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    current_lottery:'',
    lotteries:[],
    tickets:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getLotteries();
    this.getTickets();
  },

  goMyTicket()
  {
    let that = this;
    wx.navigateTo({
      url: '/pages/lottery/myTicket/myTicket?lottery_id=' + that.data.current_lottery.lottery_id + "&index" + that.data.current_lottery.lottery_index ,
    })
  },

  joinLottery()
  {
    let that = this;
    let ticket = undefined;
    for (var i = 0 ; i < this.data.tickets.length;i ++)
    {
      if(this.data.tickets[i].is_used == 0)
      {
        ticket = this.data.tickets[i];
        break;
      }
    }
    //console.log(ticket)
    if (ticket)
    {
      wx.showModal({
        title: '提示',
        content: '参与活动将会使用一张奖券，确认继续?',
        success: function(res)
        {
          if(res.confirm) {
            Utils.request({
              url: `${baseUrl}/index.php?m=default&c=lottery&a=joinLottery`,
              data: {
                ticket_id: ticket.ticket_id,
                lottery_id: that.data.current_lottery.lottery_id
              },
              success: function (res1) {
                res1 = JSON.parse(Utils.Trim(res1.data));
                if (res1.count == 1) {
                  wx.showModal({
                    title: '恭喜',
                    content: '你已成功参与此次抽奖，请注意关注小程序和公众号消息以免错过中奖信息',
                    showCancel: false,
                    confirmText: "知道了"
                  });
                  that.data.current_lottery.num = res1["attendee_num"];
                  that.setData({
                    current_lottery: that.data.current_lottery
                  })

                  ticket.is_used = 1;
                }
                else {
                  wx.showModal({
                    title: '出错了',
                    content: '抱歉，提交过程中发生错误，请重试!',
                    showCancel: false,
                    confirmText: "知道了"
                  })
                }
              }
            })
          }
        }
      })
    }
    //没有可用奖券，引导进入购物模块
    else
    {
      wx.showModal({
        title: '提示',
        content: '抱歉，你没有可用奖券，不能参与活动！你可以通过购物获取新的奖券！',
        confirmText:"去购物",
        confirmColor:"#ec3721",
        success:function(res)
        {
          if(res.confirm)
          {
            wx.switchTab({
              url: '/pages/New/index',
            })
          }
        }
      })
    }
  },

  //获取当前
  getLotteries()
  {
    let that = this;
    Utils.request({
      url: `${baseUrl}/index.php?m=default&c=lottery&a=getLotteries`,
      data:{
        type:0,
      },
      success:function(res){
        res = JSON.parse(Utils.Trim(res.data));
        let current_lottery = [];
        let lotteries = [];
        let index = 0;
        for(var i = 0;i < res.length ; i ++)
        {
          if(res[i].lottery_status == 1)
            current_lottery = res[i];
          else if (res[i].lottery_status == 2)
            lotteries.push(res[i]);

          if (res[i].lottery_status != 0)
            index ++;
        }

        that.setData({
          current_lottery:current_lottery,
          lotteries:lotteries
        });
      }
    })
  },

  getTickets()
  {
    let that = this;
    Utils.request({
      url: `${baseUrl}/index.php?m=default&c=lottery&a=getTicketsOfUser`,
      data: {
        type: 0,
        used: 0
      },
      success:function(res)
      {
        res = JSON.parse(Utils.Trim(res.data));
        that.setData({
          tickets:res
        })
      }
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
    return {
      title: "开心购好物，刷脸赢春节机票",
    }
  }
})