// component/ticket/ticket.js 
const app = getApp();
var baseUrl = app.globalData.baseHttpUrl;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    tickets:{
      type:String,
      value:''
    },
    background:{
      type:String,
      value:"red"
    },
    color:{
      type:String,
      value:'white'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    items:[],
    totalLength:1500
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _getTicket:function(e)
    {
      var ticket_id = e.currentTarget.dataset.id;
      var user_id = e.currentTarget.dataset.userid;
      var index = e.currentTarget.dataset.index;
      var count = e.currentTarget.dataset.count;
      var num_condition = e.currentTarget.dataset.num_condition;
      if (count >= num_condition)
      {
        //console.log("已经领取");
        return;
      }
      var session_id = wx.getStorageSync('session_id');
      var that = this;
      wx.request({
        url: baseUrl + '/index.php?m=default&c=promotion&a=getTicketByUser',
        method: 'POST',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        dataType: 'txt',
        data: {
          session_id: session_id,
          ticket_id:ticket_id,
          count: count,
        },
        success: function (res) {
          function Trim(str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
          }
          res.data = JSON.parse(Trim(res.data));
          if(res.data.error == 0)
          {
            wx.showToast({
              title: '领取成功',
            })
            that.data.items[index].count ++;
            that.setData(
              {
                items:that.data.items
              }
            )
          }
          else
          {
            wx.showToast({
              title: '领取失败',
            })
          }
        }
      });
    }
  },

  attached: function () {
    var tickets = this.data.tickets;
    var that = this;
    var session_id = wx.getStorageSync('session_id');
    wx.request({
      url: baseUrl + '/index.php?m=default&c=promotion&a=getTicketInfo',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType: 'txt',
      data: {
        session_id: session_id,
        id: tickets,
      },
      success: res => {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        that.data.items = JSON.parse(Trim(res.data));
        for (var i = 0;i < that.data.items.length; i ++)
        {
          that.data.items[i].num_condition = parseInt(that.data.items[i].num_condition);
          that.data.items[i].count = parseInt(that.data.items[i].count);
        }
        that.setData({
          items: that.data.items
        })
      }
    });
  }
})
