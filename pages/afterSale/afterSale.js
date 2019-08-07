// pages/afterSale/afterSale.js
const app = getApp()
var baseUrl = app.globalData.baseHttpUrl;
var dataUrl = app.globalData.dataUrl;

const shop_id = app.globalData.shop_id;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderArr:[],
    dataUrl: dataUrl,
  },
  cancelRefund: function (e) {
    var that = this;
    ////console.log(e)
    var rec_id = e.currentTarget.dataset.recid;
    wx.showModal({
      title: '撤销申请',
      content: '确认撤销该申请？',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({
            title: '处理中',
          })
          wx.request({
            url: baseUrl + '/index.php?m=default&c=flow&a=cancel_refund_by_rec_id',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            method: "POST",
            dataType: 'txt',
            data: {
              rec_id: rec_id,
              session_id: wx.getStorageSync('session_id'),
              shop_id: shop_id
            },
            success: function (res) {
              ////console.log(res)
              function Trim(str) {
                return str.replace(/(^\s*)|(\s*$)/g, "");
              }
              res.data = JSON.parse(Trim(res.data));
              ////console.log(res.data)
              wx.hideLoading();
              if (res.data.error == 0) {
                wx.showToast({
                  title: '撤销成功',
                  icon: 'success'
                })
                setTimeout(function () {
                  that.getOrderInfo();
                }, 1500)
              }
            },
            fail: function (err) {
              ////console.log(err)
              wx.showToast({
                title: '请求失败，请检查网络重试',
                icon: 'none',
                duration: 2000
              })
            }
          })
        } else if (res.cancel) {
          ////console.log('用户取消申请')
        }
      }
    })

  },
  getOrderInfo:function(){
    var that = this;
    wx.showLoading({
      title: '请稍候',
    })
    wx.request({
      url: baseUrl + '/index.php?m=default&c=flow&a=get_after_sale',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      method: "POST",
      dataType: 'txt',
      data: {
        session_id: wx.getStorageSync('session_id'),
        shop_id: shop_id
      },
      success: function (res) {
        ////console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data));
        ////console.log(res.data)
        that.setData({
          orderArr: res.data
        })
        ////console.log(that.data.orderArr.length)
        wx.hideLoading();
      },
      fail: function (err) {
        ////console.log(err)
        wx.showToast({
          title: '请求失败，请检查网络重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  toRefundPage:function(e){
    var rec_id = e.currentTarget.dataset.recid;
      wx.navigateTo({
        url: '/pages/refundPage/refundDetail/refundDetail?rec_id=' + rec_id,
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      navbar_height: app.globalData.height
    })
  getApp().parseInviter(options);
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
    this.getOrderInfo();
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
    var params = getApp().getShareParams();
    return params;
  }
})