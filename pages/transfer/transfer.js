// pages/transfer/transfer.js
var app = getApp();
var baseUrl = app.globalData.baseHttpUrl;
const shop_id = app.globalData.shop_id;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsName:'',
    imgUrl:'',
    goodsId:'',
    baseUrl: baseUrl
  },
  getGoodsInfo(goodsId){
    var that = this;
    wx.request({
      url: baseUrl + '/index.php?m=default&c=flow&a=get_goods_by_goods_id',
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        goods_id: goodsId,
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
          goodsName: res.data.goods_name,
          imgUrl: that.data.baseUrl + '/' + res.data.goods_thumb,
          goodsId: res.data.goods_id
        })
        ////console.log(that.data)
      
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    ////console.log(options)
    if(options.goods_id){
      var goodsId = options.goods_id;
      this.getGoodsInfo(goodsId);
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
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
     var params = getApp().getShareParams();
    return params;
  }
})