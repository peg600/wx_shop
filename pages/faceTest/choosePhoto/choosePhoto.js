// pages/jingku/choosePhoto/choosePhoto.js

const app = getApp();
var baseUrl = app.globalData.baseHttpUrl;
app.globalData.test = 0
const shop_id = app.globalData.shop_id;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    src: "",
    device_position: "front",
    share: ""     //是否跳转线下店分享
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.share) {
      this.setData({
        share: options.share
      })
    }
    this.ctx = wx.createCameraContext();
  },

  chooseImage() {
    let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: 'album',
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          src: res.tempFilePaths[0]
        })
        // wx.navigateTo({
        //   url: `/pages/faceTest/cutPhoto/cutPhoto?src=${that.data.src}&share=${that.data.share}`,
        // })
        wx.navigateTo({
          url: `/pages/offlineShop/share/share?src=${that.data.src}`,
        })
      }
    })
  },

  takePhoto() {
    let that = this;
    this.ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        that.setData({
          src: res.tempImagePath
        })
      
        wx.navigateTo({
          url: `/pages/offlineShop/share/share?src=${that.data.src}`,
        })
      }
    })
  },

  changeDevice() {
    if (this.data.device_position === "front") {
      this.setData({
        device_position: "back"
      })
    }else{
      this.setData({
        device_position: "front"
      })
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

  }
})