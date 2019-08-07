// pages/endorser/takePhoto/takePhoto.js
const app = getApp();
var baseUrl = app.globalData.baseHttpUrl;
let Utils = require("../../../lib/Utils.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    src: "",
    device_position: "front",
    show_preview: false, //预览确认
    blankHeight: 750,
    preview_height: 750,
    previewBtnPos: 200,
    bounds_preview_left: {},   //预览页面下方按钮的formbutton位置数据
    bounds_preview_right: {},

    path: "",
    top: 0,
    bottom: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.path) {
      this.setData({
        path: options.path
      })
    }
    if(options.src) {
      this.setData({
        src: options.src,
        show_preview: true
      })
    }else{
      this.chooseImage()
    }

    this.ctx = wx.createCameraContext();
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        let h = 750 * res.windowHeight / res.windowWidth;
        var h1 = 750 * 4.0 / 3.0;
        var scale = res.pixelRatio;
        h = h - h1;
        var h1 = h * 0.5 - 40;
        let h2 = (h - 160) / 2;   //拍照按钮的自适应位置

        var width = res.windowWidth;
        var height = width * 4.0 / 3.0;
        var bottomHeight = res.windowHeight - height;
        var center = height + bottomHeight / 2;
        var bounds = new Object();
        bounds.top = center - 40;
        bounds.left = (width / 2 - 40);
        bounds.width = 80;
        bounds.height = 80;
        that.setData({
          blankHeight: h,
          previewBtnPos: h1,
          top: center - 40
        })
        that.selectComponent("#formbutton").setBounds(bounds);

        var bounds_album = new Object();
        bounds_album.top = center - 40;
        bounds_album.left = 20;
        bounds_album.width = 80;
        bounds_album.height = 80;
        that.selectComponent("#formbutton-album").setBounds(bounds_album);

        var bounds_change = new Object();
        bounds_change.top = center - 40;
        bounds_change.left = width - 100;
        bounds_change.width = 80;
        bounds_change.height = 80;
        that.selectComponent("#formbutton-change").setBounds(bounds_change);

        var bounds_preview_left = new Object();
        bounds_preview_left.top = center - 40;
        bounds_preview_left.left = 40;
        bounds_preview_left.width = 80;
        bounds_preview_left.height = 80;
        that.setData({
          bounds_preview_left: bounds_preview_left
        })

        var bounds_preview_right = new Object();
        bounds_preview_right.top = center - 40;
        bounds_preview_right.left = width - 120;
        bounds_preview_right.width = 80;
        bounds_preview_right.height = 80;
        that.setData({
          bounds_preview_right: bounds_preview_right
        })
        if(options.src) {
          that.previewBtnPos();
        }
      }
    })
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
          src: res.tempFilePaths[0],
          show_preview: true
        })
        that.previewBtnPos();
      },
      fail: function(e) {
        console.log(e)
        if (e.errMsg != "chooseImage:fail cancel") {
          let pages = getCurrentPages() //获取加载的页面
          let url = app.getPageUrl(pages);
          wx.redirectTo({
            url: `/pages/authorize/authorize?type=3&url=${url}`,
          })
        }
      }
    })
  },

  takePhoto() {
    let that = this;
    this.ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        that.setData({
          src: res.tempImagePath,
          show_preview: true
        })
        that.previewBtnPos();
      },
      fail: function (e) {
        let pages = getCurrentPages() //获取加载的页面
        let url = app.getPageUrl(pages);
        wx.redirectTo({
          url: `/pages/authorize/authorize?type=2&url=${url}`,
        })
      }
    })
  },

  changeDevice() {
    if (this.data.device_position === "front") {
      this.setData({
        device_position: "back"
      })
    } else {
      this.setData({
        device_position: "front"
      })
    }
  },

  calcPhotoHeight(e) {
    let n = e.detail.height / e.detail.width;
    this.setData({
      preview_height: 750 * n
    })
  },

  close() {
    this.setData({
      show_info: false
    })
  },

  closePreview() {
    this.setData({
      show_preview: false
    })
  },

  chosen() {
    let that = this;
    let src = this.data.src;
    wx.navigateTo({
      url: `${that.data.path}?src=${src}`,
    })
  },

  //定位预览页的下方formbutton
  previewBtnPos() {
    let that = this;
    this.selectComponent("#formbutton-preview-left").setBounds(that.data.bounds_preview_left);
    this.selectComponent("#formbutton-preview-right").setBounds(that.data.bounds_preview_right);
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
      title: "分享测试",
      path: `/pages/authorize/authorize?inviter=${app.globalData.current_user_id}`
    }
  }
})