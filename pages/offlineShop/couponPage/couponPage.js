// pages/offlineShop/couponPage/couponPage.js
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
    shop_id: "1",
    shop_info: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    if (options.shop_id) {
      this.setData({
        shop_id: options.shop_id
      })
    }

    if (options.scene) {
      let scene = decodeURIComponent(options.scene);
      let pattern = /shop_id=([0-9]+)/g;
      let match = pattern.exec(scene);
      if (match) {
        let shop_id = match[1];
        this.setData({
          shop_id: shop_id
        })
      }
    }

    let that = this;
    if (app.globalData.current_user_id) {   //login已完成
      console.log("login已完成")
      app.parseInviter(options)
      that.getOfflineShopCoupons(that.data.shop_id)
    } else {
      console.log("登录未完成")
      app.globalData.login_promise.then(() => {
        app.parseInviter(options)
        that.getOfflineShopCoupons(that.data.shop_id)
      })
    }
    
  },

  //获取店铺信息及该店中当前用户未领取的优惠券
  getOfflineShopCoupons() {
    let that = this;
    let shop_id = this.data.shop_id;
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

        if (!res.coupons || res.coupons.length == 0) {
          wx.navigateTo({
            url: `/pages/offlineShop/shopPage/shopPage?shop_id=${that.data.shop_id}`,
          })
        }

        res.images = res.images.split(",")
        if(res.claimed_coupons) {
          for (let i = 0; i < res.claimed_coupons.length;i++) {
            let is_intime = Utils.isInTime(false,res.claimed_coupons[i].end_time)
            if (!is_intime) {
              res.claimed_coupons[i].is_outdated = true;
            }
          }
        }
        if (res.coupons) {
          for (let i = 0; i < res.coupons.length; i++) {
            let is_intime = Utils.isInTime(false,res.coupons[i].end_time)
            if (!is_intime) {
              res.coupons.splice(i,1);
            }
          }
        }
        console.log(res)
        that.setData({
          shop_info: res
        })
      }
    });
  },

  //领取单张优惠券
  getCoupon(e) {
    if(locked) {
      return
    }
    locked = true;
    let that = this;
    let coupon_id = e.currentTarget.dataset.coupon_id;
    let max_claim_number = e.currentTarget.dataset.max_claim_number;
    let index = e.currentTarget.dataset.index;
    let shop_info = this.data.shop_info;

    console.log(app.globalData.inviter)
    
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
        console.log(res)
        if(res) {
          if (!shop_info.coupons[index].number) {
            shop_info.coupons[index].number = 0;
          }
          shop_info.coupons[index].number = parseInt(shop_info.coupons[index].number) + 1;
          console.log(shop_info.coupons[index].number)
          if (shop_info.coupons[index].number == shop_info.coupons[index].max_claim_number) {
            shop_info.coupons[index].used = true;
          }
          that.setData({
            shop_info: shop_info
          })
        }
      },
      fail: function(res) {
        console.log(res)
        wx.showToast({
          title: '领取失败，请检查网络',
        })
      },
      complete: function() {
        locked = false;
      }
    });
  },

  //领取单张优惠券
  getAllCoupons() {
    if (locked) {
      return
    }
    locked = true;
    let that = this;
    
    let shop_info = this.data.shop_info;
    let shop_id = shop_info.shop_id;
    let coupons = shop_info.coupons;

    wx.request({
      url: `${baseUrl}/index.php?m=default&c=offlineShop&a=get_all_coupons`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        coupons: JSON.stringify(coupons),
        shop_id: that.data.shop_id,
        session_id: wx.getStorageSync('session_id'),
        inviter: app.globalData.inviter,
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        console.log(res)
        if (res) {
          wx.showToast({
            title: '领取成功',
            duration: 2000
          })
          setTimeout(() => {
            wx.navigateTo({
              url: `/pages/offlineShop/shopPage/shopPage?shop_id=${that.data.shop_id}`,
            })
          },2000)
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

  gotoShop() {
    let that = this;
    wx.navigateTo({
      url: `/pages/offlineShop/shopPage/shopPage?shop_id=${that.data.shop_id}`,
    })
  },

  goBack() {
    wx.switchTab({
      url: '/pages/New/index',
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
    this.getOfflineShopCoupons(this.data.shop_id)
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