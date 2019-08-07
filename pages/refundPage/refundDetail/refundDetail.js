// pages/refundPage/refundDetail/refundDetail.js
var app = getApp();
var baseUrl = app.globalData.baseHttpUrl;
const shop_id = app.globalData.shop_id;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrl: baseUrl,
    rec_id:0,
    goodsInfo:{}
  },
  getOrderInfo: function (rec_id) {
    var that = this;
    wx.request({
      url: baseUrl + '/index.php?m=default&c=flow&a=get_goods_by_rec_id',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      method: "POST",
      dataType: 'txt',
      data: {
        rec_id: rec_id,
        shop_id: shop_id
      },
      success: function (res) {
        //console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data));
        //console.log(res.data)
        that.setData({
          goodsInfo: res.data.goods
        })

      },
      fail: function (err) {
        //console.log(err)
        wx.showToast({
          title: '请求失败，请检查网络重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  //撤销申请
  cancelRefund:function(){
    var rec_id = this.data.rec_id;
    wx.showModal({
      title: '撤销申请',
      content: '确认撤销该申请？',
      success:function(res){
        if(res.confirm){
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
              //console.log(res)
              function Trim(str) {
                return str.replace(/(^\s*)|(\s*$)/g, "");
              }
              res.data = JSON.parse(Trim(res.data));
              //console.log(res.data)
              wx.hideLoading();
              if(res.data.error == 0){
                  wx.showToast({
                    title: '撤销成功',
                    icon:'success'
                  })
                  setTimeout(function(){
                    wx.navigateBack({
                      delta:1
                    })
                  },1500)
              }else{
                wx.showToast({
                  title: '撤销失败，稍后再试',
                  icon: 'fail'
                })
              }

            },
            fail: function (err) {
              //console.log(err)
              wx.showToast({
                title: '请求失败，请检查网络重试',
                icon: 'none',
                duration: 2000
              })
            }
          })
        }else if(res.cancel){
          //console.log('用户取消申请')
        }
      }
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getApp().parseInviter(options);
    if(options.rec_id){
      this.setData({
        rec_id: options.rec_id
      })
    }
    //console.log(this.data.rec_id)
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
    this.getOrderInfo(this.data.rec_id)
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