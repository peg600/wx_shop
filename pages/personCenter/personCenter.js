var app = getApp();
var baseUrl = app.globalData.baseHttpUrl;
const shop_id = app.globalData.shop_id;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nickList :null,
    dataChanged: 0,
    showCPA:0,
    oNum:{}
  },
  
  //进入设置页面
  setToPages : function(e){
    
      wx.navigateTo({
        url: '/pages/personCenter/setting/setting'
      })
  },
  //进入我的收藏页面
  toCollection:function(e){
    wx.navigateTo({
      url: '/pages/collection/collection'
    })
  },
  //全部订单，发货，付款，评价方法

  checkTypelist : function(e){
    //console.log(e)
   
      wx.navigateTo({
        url: '/pages/orderInfo/orderInfo?status=' + e.currentTarget.id,
        
      })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     getApp().parseInviter(options);
     this.setData({
       showCPA:getApp().globalData.showCPA
     });
  },
  getOrderStatusInfo:function(){
    var that = this;
    //console.log("session_id" + wx.getStorageSync('session_id'));
    wx.request({
      url: baseUrl + '/index.php?c=flow&a=get_order_info_nums',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType: 'txt',
      data: {
        session_id: wx.getStorageSync('session_id'),
        shop_id: shop_id
      },
      success: function (res) {
        //console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data));
        getApp().orderSummary = res.data.result;
        //console.log(res.data)
        that.setData({
          oNum:res.data.result
        })
        console.log(that.data.oNum)
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
  toAfterSale:function(){
    wx.navigateTo({
      url: '/pages/afterSale/afterSale',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getOrderStatusInfo();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if((getApp().DataChanged == 1 || getApp().DataChanged == 3))
    {
      this.getOrderStatusInfo();
      
    }
    getApp().DataChanged = 0;
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