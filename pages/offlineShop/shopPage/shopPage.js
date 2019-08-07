// pages/offlineShop/shopPage/shopPage.js
let app = getApp();
let baseUrl = app.globalData.baseHttpUrl;
let dataUrl = app.globalData.dataUrl;

let Utils = require("../../../lib/Utils.js")
let Sign = require("../../../lib/Sign.js")

let locked = false;   //领券锁，防止双击发出多个请求

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //小程序轮播图参数
    swiperCurrent: 0,
    indicatorDots: false,
    autoplay: true,
    interval: 3000,
    duration: 600,
    circular: true,
    show_swiper_img: false,

    shop_id: "1",
    distance: "",
    shop_info: {},
    show_coupons: true,
    share_img: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.parseInviter(options)

    if (options.shop_id) {
      this.setData({
        shop_id: options.shop_id
      })
    }
    if(options.distance) {
      this.setData({
        distance: options.distance
      })
    }

    if (options.scene) {
      var scene = decodeURIComponent(options.scene);
      var pattern = /shop_id=([0-9]+)/g;
      var match = pattern.exec(scene);
      if (match) {
        var shop_id = match[1];
        this.setData({
          shop_id: shop_id
        })
      }
    } 

    this.getOfflineShopCoupons()

    wx.setStorageSync('last_shop_id', this.data.shop_id)
    
  },

  getOfflineShopCoupons() {
    let that = this;
    let shop_id = this.data.shop_id;
    console.log(shop_id)
    wx.request({
      url: `${baseUrl}/index.php?m=default&c=offlineShop&a=get_offline_shop_coupons`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        shop_id: shop_id,
        session_id: wx.getStorageSync('session_id')
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        console.log(res)
        if(res) {
          res.images = res.images.split(",")
          if (res.claimed_coupons) {
            for (let i = 0; i < res.claimed_coupons.length; i++) {
              let is_intime = Utils.isInTime(false, res.claimed_coupons[i].end_time)
              if (!is_intime) {
                res.claimed_coupons[i].is_outdated = true;
              }
            }
          }
          if (res.coupons) {
            for (let i = res.coupons.length - 1; i >= 0; i--) {
              let is_intime = Utils.isInTime(false, res.coupons[i].end_time)
              if (!is_intime) {
                res.coupons.splice(i, 1);
              }
            }
          }
          if (res.goods_list) {
            for (let i = 0; i < res.goods_list.length; i++) {
              if (res.goods_list[i].goods_thumb.indexOf("https") == -1) {
                res.goods_list[i].goods_thumb = dataUrl + "/" + res.goods_list[i].goods_thumb;
              }
            }
          }
          console.log(res)
          that.setData({
            shop_info: res
          })
        }else{
          wx.removeStorage({
            key: 'last_shop_id',
            success: function(res) {},
          })
          wx.switchTab({
            url: '/pages/New/index',
          })
        }
      }
    });
  },

  //领取优惠券
  getCoupon(e) {
    if (locked) {
      return
    }
    locked = true;
    let that = this;
    let coupon_id = e.currentTarget.dataset.coupon_id;
    let max_claim_number = e.currentTarget.dataset.max_claim_number;
    let index = e.currentTarget.dataset.index;
    let shop_info = this.data.shop_info;

    wx.request({
      url: `${baseUrl}/index.php?m=default&c=offlineShop&a=get_coupon`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        coupon_id: coupon_id,
        shop_id: that.data.shop_id,
        session_id: wx.getStorageSync('session_id'),
        inviter: app.globalData.inviter,
        max_claim_number: max_claim_number
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        if (res) {
          if (!shop_info.coupons[index].number) {
            shop_info.coupons[index].number = 0;
          }
          shop_info.coupons[index].number = parseInt(shop_info.coupons[index].number) + 1;
          if (shop_info.coupons[index].number == shop_info.coupons[index].max_claim_number) {
            shop_info.coupons[index].used = true;
          }
          that.setData({
            shop_info: shop_info
          })
        }
      },
      fail: function (res) {
        console.log(res)
        wx.showToast({
          title: '领取失败，请检查网络',
        })
      },
      complete: function () {
        locked = false;
      }
    });
  },

  swiperChange: function (e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
  },

  //点击图片触发事件
  swipClick: function (e) {
    this.toggleShowSwiperImage();
    this.setData({
      autoplay: false
    })
  },

  toggleShowSwiperImage() {
    let that = this;
    this.setData({
      show_swiper_img: !that.data.show_swiper_img
    })
  },

  prevent() {

  },

  toggleShare() {
    this.selectComponent("#sharepanel").show();
  },

  drawShare() {
    if(this.data.share_img) {
      return
    }
    wx.showLoading({
      title: '加载中...',
    })
    let that = this;
    var img_src = that.data.shop_info.images[0];
    
    if(img_src.indexOf('https') == -1){
      img_src = img_src.replace('http','https');
    }
    console.log(img_src)
    const ctx = wx.createCanvasContext('shareCanvas');
    wx.getImageInfo({
      src: img_src,
      success: function (res) {
        that.setData({
          canvas_width: res.width,
          canvas_height: res.height
        })
        let canvas_width = that.data.canvas_width;
        let canvas_height = that.data.canvas_height;
        ctx.drawImage(res.path, 0, 0, canvas_width, canvas_height);
        //获取二维码
        Utils.request({
          url: baseUrl + '/index.php?m=default&c=flow&a=generateQRCode',
          data: {
            path: "pages/offlineShop/couponPage/couponPage",
            //path: "pages/New/index",
            scene: "shop_id=" + that.data.shop_id
          },
          success: function (res) {
            res = JSON.parse(Utils.Trim(res.data));
            console.log(res)
            if (res.status && res.status == 1) {
              let qrcode_path = baseUrl + "/" + res.info;
              wx.getImageInfo({
                src: qrcode_path,
                success: function (res2) {
                  var n = 3;
                  var x = canvas_width - 60 * n - 12;
                  var y = canvas_height - 60 * n - 12;
                  ctx.drawImage(res2.path, x, y, 60 * n, 60 * n);
                  ctx.draw(true, () => {
                    wx.canvasToTempFilePath({
                      canvasId: 'shareCanvas',
                      x: 0,
                      y: 0,
                      width: canvas_width,
                      height: canvas_height,
                      quality: 1,
                      success: function success(res) {
                        that.setData({
                          share_img: res.tempFilePath
                        })
                      },
                      fail: function (res) {
                        //console.log(res);
                      },
                      complete: function complete(e) {
                        wx.hideLoading();
                      }
                    });
                  })
                },
                fail: function(res) {
                  console.log(res)
                },
                complete: function (res) {

                }
              })

            } else {
              wx.hideLoading()
              wx.showToast({
                title: '请求失败，请检查网络重试',
                icon: 'none',
                duration: 2000
              })
            }
          }
        });
      }
    })
  },

  toPay() {
    let that = this;
    wx.navigateTo({
      url: `/pages/offlineShop/pay/pay?shop_id=${that.data.shop_id}`,
    })
  },

  toMap() {
    let that = this;
    wx.navigateTo({
      url: `/pages/offlineShop/map/map?shop_id=${that.data.shop_id}`,
    })
  },

  toFitview() {
    let that = this;
    wx.navigateTo({
      url: `/pages/fitview/fitview?shop_id=${that.data.shop_id}&shop_name=${that.data.shop_info.shop_name}&cat_id=2`,
    })
  },

  gotoDetail(e) {
    let that = this;
    let goods_info = e.currentTarget.dataset.goods_info;
    let goods_id = goods_info.goods_id;
    if (goods_info.is_cash_coupon && goods_info.is_cash_coupon == 1) {
      wx.navigateTo({
        url: `/pages/group_purchase/group_purchase?goods_id=${goods_id}&shop_id=${that.data.shop_id}`,
      })
    }else{
      wx.navigateTo({
        url: `/pages/detailPage/detailPage?goods_id=${goods_id}&shop_id=${that.data.shop_id}`,
      })
    }
  },

  toPersonalPage() {
    wx.switchTab({
      url: '/pages/offlineShop/personalPage/personalPage',
    })
  },

  toShare() {
    let that = this;
    wx.navigateTo({
      url: `/pages/offlineShop/share/share?shop_id=${that.data.shop_id}`,
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
    let that = this;
    return {
      title: that.data.shop_info.shop_name,
      path: `/pages/offlineShop/couponPage/couponPage?shop_id=${that.data.shop_id}&inviter=${app.globalData.current_user_id}`,
      imageUrl: that.data.shop_info.images[0],
    }
  }
})