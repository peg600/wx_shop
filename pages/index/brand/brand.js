// pages/index/brand/brand.js
// var baseUrl = app.globalData.baseHttpUrl;
const app = getApp();
const shop_id = app.globalData.shop_id;
const baseUrl = app.globalData.baseHttpUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrl: baseUrl,
    brand_data:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	  getApp().parseInviter(options);
    var that = this;
    wx.request({
      url: baseUrl + '/index.php?m=default&c=flow&a=get_all_brands_info',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType: 'txt',
      data: {
        shop_id: shop_id
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data));
        //console.log(res.data)
        let sortObj = res.data;
        for (let i = 0; i < sortObj.length; i++) {
          let tmp = sortObj[i].brand_logo;
          if (sortObj[i].brand_logo && sortObj[i].brand_logo !== "") {
            sortObj[i].brand_logo = `${baseUrl}/data/attached/brandlogo/${tmp}`;
          }
        }
        // if (!res && res.data.list.length == 0) {
        //   return
        // } //console.log(res.data)
        // //console.log(res.data.list + 'aa')
        that.setData({
          brand_data: res.data,
         // hidden: true
        })
        // wx.clearStorageSync('isShowNav')
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


  toBrandGoodsPage: e => {
    //console.log(e.currentTarget)
    wx.navigateTo({
      url: "/pages/index/brand/brand-goods/brand-goods?brandid=" + e.currentTarget.dataset.brandid + "&brandname=" + e.currentTarget.dataset.brandname,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
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
     var params = getApp().getShareParams();
    return params;
  }
})