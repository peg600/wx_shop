// pages/index/list/list.js
const app = getApp()
var baseUrl = app.globalData.baseHttpUrl;
var htmlUrl = app.globalData.htmlUrl;
const shop_id = app.globalData.shop_id;

Page({

  /**
   * 页面的初始数据
   */
  data: {
   numbers : false,
   dataChanged: 0,
   fitUrl : "",
   goods_name:"",
   top_order_id:""
  },
 
  /**
   * 生命周期函数--监听页面加载
   */
  updataPage: function (goods_id){
    //var rand = Math.random();
    this.setData({
      pathUrl: htmlUrl + "index.php?goods_id=" + goods_id + "&session_id=" + wx.getStorageSync('session_id') + "&shop_id=" + shop_id + "&inviter=" + getApp().inviter + "&baseUrl=" + baseUrl + "/&version=" + getApp().globalData.fittingVersion + "&top_order_id=" + this.data.top_order_id
    })
    console.log(this.data.pathUrl)
  },
  onLoad: function (options) {
    this.setData({
      shopid: options.shopid
    })
    if(options.top_order_id) {
      this.setData({
        top_order_id: options.top_order_id
      })
    }
    //console.log(htmlUrl);
    var that = this;
    wx.request({
      url: baseUrl + '/index.php?m=default&c=flow&a=get_goods_name',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      method: "POST",
      dataType: 'txt',
      data: {
        goods_id: options.shopid,
        shop_id: shop_id
      },
      success: function (res) {
        wx.setNavigationBarTitle({
          title: res.data
        })
        that.setData({
          goods_name: res.data
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
  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.updataPage(this.data.shopid);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if ((getApp().DataChanged == 2 || getApp().DataChanged == 3) && this.dataChanged != getApp().DataChanged )
    this.updataPage(this.data.shopid);
    this.dataChanged = getApp().DataChanged;
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
      title: this.data.goods_name,
      path: "/pages/index/list/list?shopid=" + this.data.shopid
    }
  },
 
})