// pages/offlineShop/map/map.js
let app = getApp();
let baseUrl = app.globalData.baseHttpUrl;
let dataUrl = app.globalData.dataUrl;

let Utils = require("../../../lib/Utils.js")
let Sign = require("../../../lib/Sign.js")
let QQMapWX = require('../../../lib/qqmap-wx-jssdk.js');
let qqmapsdk;
let amapFile = require('../../../lib/amap-wx.js');
let myAmapFun;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shop_id: "1",
    shop_info: {},
    map_width: "",
    map_height: "",
    longitude: "",
    latitude: "",
    markers: []   //标记点的对象数组

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.parseInviter(options)
    
    if(options.shop_id) {
      this.setData({
        shop_id: options.shop_id
      })
    }

    qqmapsdk = new QQMapWX({    //坐标sdk
      key: 'VT4BZ-6XKL5-YKYIQ-QFJVR-5Y276-SUBSB'
    });

    myAmapFun = new amapFile.AMapWX({
      key: 'cb274a1c73283af39fee7a3da7d7c28f'
    });

    // let sys_info = wx.getSystemInfoSync();
    // this.setData({
    //   map_width: sys_info.windowWidth,
    //   map_height: sys_info.windowHeight
    // })
    this.getOfflineShopInfo()
    
  },

  getOfflineShopInfo() {
    let that = this;
    let shop_id = this.data.shop_id;
    wx.request({
      url: `${baseUrl}/index.php?m=default&c=offlineShop&a=get_shop_info_by_shop_id`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        shop_id: shop_id
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        res.images = res.images.split(",")
        console.log(res)

        let marker = {};
        marker.id = res.shop_id;
        marker.latitude = parseFloat(res.latitude);
        marker.longitude = parseFloat(res.longitude);
        marker.title = res.shop_name;
        let markers = that.data.markers;
        markers.push(marker)

        that.setData({
          shop_info: res,
          markers: markers
        })

        that.getLocation();
      }
    });
  },

  getLocation() {
    let that = this;
    wx.showLoading({
      title: '正在定位...',
    })
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        console.log(res)
        let latitude = res.latitude;
        let longitude = res.longitude;

        that.mapCtx = wx.createMapContext('myMap');
        // that.setData({
        //   longitude: longitude,
        //   latitude: latitude
        // })
        //that.mapCtx.moveToLocation() //将地图中心移动到店铺位置
        that.showIncludePoints()
      },
      fail: function (res) {
        wx.showToast({
          title: '获取定位失败',
          icon: 'none',
          duration: 3000
        })
      },
      complete: function (res) {
        wx.hideLoading();
      }
    })
  },

  //缩放地图已同时展示自己和商铺的位置
  showIncludePoints() {
    let that = this;
    let shop_point = {};
    shop_point.longitude = that.data.shop_info.longitude;
    shop_point.latitude = that.data.shop_info.latitude;

    let self_point = {};
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        console.log(res)
        self_point.latitude = res.latitude;
        self_point.longitude = res.longitude;
        let points = [];
        points.push(shop_point);
        points.push(self_point);

        that.mapCtx.includePoints({
          points: points,
          padding: [50, 50, 50, 50],
          success: function(res) {
            console.log(res)
          },
          fail: function(res) {
            console.log(res)
          }
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

  }
})