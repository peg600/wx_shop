// pages/offlineShop/pay/pay.js
let app = getApp();
let baseUrl = app.globalData.baseHttpUrl;
let dataUrl = app.globalData.dataUrl;

let Utils = require("../../../lib/Utils.js")
let Sign = require("../../../lib/Sign.js")

let locked = false;   //支付锁
let balance = 0;    //现金券变动值

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shop_id: "1",
    shop_info: {},
    price: "",      //应付金额
    show_coupons: false,  
    selected_coupons: [],      //选用的优惠券
    selected_cash_coupons: [],   //选择的现金券
    use_user_cash_coupon: false,  //是否启用现金券余额
    final_price: "",     //实付金额
    type: 1,
    group_purchase_id: "",
    order_id: ""
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
    if (options.goods_id) {
      this.setData({
        goods_id: options.goods_id
      })
    }
    if(options.price) {   //重新支付时指定原价
      this.setData({
        base_price: options.price,
        price: options.price,
        final_price: options.price
      })
    }
    if (options.type) {   //重新支付时指定支付种类
      this.setData({
        type: options.type
      })
    }
    if (options.group_purchase_id) {   //重新参团支付时会有
      this.setData({
        group_purchase_id: options.group_purchase_id
      })
    }
    if (options.order_id) {   //重新参团支付时会有
      this.setData({
        order_id: options.order_id
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
    this.getOfflineShopCoupons()
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
        res.images = res.images.split(",")

        if (res.claimed_coupons) {
          let arr = res.claimed_coupons.concat();   //拷贝已有券，将多个相同券展开显示
          for (let i = 0; i < res.claimed_coupons.length; i++) {
            if (res.claimed_coupons[i].can_use > 1) {
              for (let j = 1; j < res.claimed_coupons[i].can_use; j++) {
                arr.splice(i, 0, res.claimed_coupons[i])
              }
            }
          }
          res.claimed_coupons = arr;
          console.log(res.claimed_coupons)
          res.claimed_coupons = that.isCouponUsable(res.claimed_coupons)
        }
        res.user_cash_coupon = Math.round(res.user_cash_coupon * 100) / 100;

        console.log(res)
        
        that.setData({
          shop_info: res
        })
      }
    });
  },

  //判断已领取的优惠券是否可用
  isCouponUsable(coupons) {
    for (let i = 0; i < coupons.length; i++) {
      coupons[i].usable = true;
      coupons[i].together = parseInt(coupons[i].together);

      //是否在使用时间内
      let is_intime = Utils.isInTime(coupons[i].start_time,coupons[i].end_time)
      if (!is_intime) {
        coupons[i].usable = false;
      }

      //价格条件是否满足
      if (coupons[i].quota && this.data.price) {
        let price = this.data.price;
        if (price < coupons[i].quota) {
          coupons[i].usable = false;
        }
      }

      //是否满足单独使用
      let selected_coupons = this.data.selected_coupons;
      if (selected_coupons.length > 0) {
        if (!coupons[i].together) {
          coupons[i].usable = false;
        }else{
          if (selected_coupons.length == 1 && !selected_coupons[0].together) {
            coupons[i].usable = false;
          }
        }
      }

      //判断同种券是否超过使用数量限制
      if (coupons[i].can_use > 0) {
        let selected_number = 0;
        for (let j = 0; j < coupons.length; j++) {
          if (coupons[j].coupon_id == coupons[i].coupon_id && coupons[j].selected) {
            selected_number++;
          }
        }
        for (let k = 0; k < coupons.length; k++) {
          if (coupons[k].coupon_id == coupons[i].coupon_id) {
            coupons[k].selected_number = selected_number;
            if (coupons[k].selected_number == coupons[k].max_together_number && !coupons[k].selected) {
              coupons[k].usable = false;
            }
          }
        }
      }
    }
    return coupons;
  },

  listenInput(e) {
    this.setData({
      price: parseFloat(e.detail.value),
      final_price: parseFloat(e.detail.value)
    })
    this.clear();
    if(this.data.shop_info.claimed_coupons) {
      this.calcCoupon();
    }
  },

  //重新输入价格后清空之前的券状态
  clear() {
    balance = 0;
    let claimed_coupons = this.data.shop_info.claimed_coupons
    if (claimed_coupons) {
      for (let i = 0; i < claimed_coupons.length; i++) {
        claimed_coupons[i].selected = false;
      }
    }

    let claimed_cash_coupons = this.data.shop_info.claimed_cash_coupons
    if (claimed_cash_coupons) {
      for (let i = 0; i < claimed_cash_coupons.length; i++) {
        claimed_cash_coupons[i].selected = false;
      }
    }
    
    let that = this;
    this.setData({
      use_user_cash_coupon: false,
      selected_coupons: [],
      selected_cash_coupons: [],
      shop_info: that.data.shop_info
    })
  },
  
  calcCoupon() {
    let shop_info = this.data.shop_info;
    let claimed_coupons = shop_info.claimed_coupons;
    claimed_coupons = this.isCouponUsable(claimed_coupons)
    this.setData({
      shop_info: shop_info
    })
  },

  //选择或取消选择优惠券
  toggleChooseCoupon(e) {
    if(!parseFloat(this.data.price)) {
      wx.showToast({
        title: '请先输入价格',
        icon: 'none',
        duration: 1500
      })
      return
    }
    if (this.data.selected_cash_coupons.length > 0) {
      wx.showToast({
        title: '优惠券和现金券不可同时使用！',
        icon: 'none',
        duration: 1500
      })
      return
    }
    
    
    let that = this;
    let coupon = e.currentTarget.dataset.coupon;
    let index = e.currentTarget.dataset.index;
    let shop_info = this.data.shop_info;
    let selected_coupons = this.data.selected_coupons;

    if (this.data.final_price == 0 && !coupon.selected) {
      wx.showToast({
        title: '实付金额已为0元，不能再添加优惠券',
        icon: 'none',
        duration: 1500
      })
      return
    }

    if (coupon.selected) {
      coupon.selected = false;
      for (let i = 0; i < selected_coupons.length;i++) {
        if (selected_coupons[i].coupon_id == coupon.coupon_id) {
          selected_coupons.splice(i,1);
        }
      }
    }else{
      coupon.selected = true;
      selected_coupons.push(coupon);
    }
    shop_info.claimed_coupons[index] = coupon;
    this.setData({
      shop_info: shop_info,
      selected_coupons: selected_coupons,
      final_price: that.data.price
    })
    this.calcCoupon();
    this.calcFinalPrice();
  },

  //选择或取消选择现金券
  toggleChooseCashCoupon(e) {
    if (!parseFloat(this.data.price)) {
      wx.showToast({
        title: '请先输入价格',
        icon: 'none',
        duration: 1500
      })
      return
    }
    if (this.data.selected_coupons.length > 0) {
      wx.showToast({
        title: '优惠券和现金券不可同时使用！',
        icon: 'none',
        duration: 1500
      })
      return
    }
    
    let that = this;
    let coupon = e.currentTarget.dataset.coupon;
    let index = e.currentTarget.dataset.index;
    let shop_info = this.data.shop_info;
    let selected_cash_coupons = this.data.selected_cash_coupons;

    if (this.data.final_price == 0 && !coupon.selected) {
      wx.showToast({
        title: '实付金额已为0元，不能再添加现金券',
        icon: 'none',
        duration: 1500
      })
      return
    }

    if (coupon.selected) {
      coupon.selected = false;
      for (let i = 0; i < selected_cash_coupons.length; i++) {
        if (selected_cash_coupons[i].coupon_id == coupon.coupon_id) {
          selected_cash_coupons.splice(i, 1);
        }
      }
    } else {
      coupon.selected = true;
      selected_cash_coupons.push(coupon);
    }
    shop_info.claimed_cash_coupons[index] = coupon;
    this.setData({
      shop_info: shop_info,
      selected_cash_coupons: selected_cash_coupons,
      final_price: that.data.price
    })
    this.calcFinalPrice();
  },

  //选择现金券余额
  toggleUseUserCashCoupon() {
    if (!parseFloat(this.data.price)) {
      wx.showToast({
        title: '请先输入价格',
        icon: 'none',
        duration: 1500
      })
      return
    }
    if (this.data.selected_coupons.length > 0) {
      wx.showToast({
        title: '优惠券和现金券不可同时使用！',
        icon: 'none',
        duration: 1500
      })
      return
    }

    if (this.data.final_price == 0 && !this.data.use_user_cash_coupon) {
      wx.showToast({
        title: '实付金额已为0元，不能再使用现金券余额',
        icon: 'none',
        duration: 1500
      })
      return
    }
    
    let that = this;
    balance = 0;
    this.setData({
      use_user_cash_coupon: !that.data.use_user_cash_coupon,
      final_price: that.data.price
    })
    this.calcFinalPrice();
  },

  calcFinalPrice() {
    let price = this.data.price;
    let final_price = this.data.final_price;
    for(let i=0;i<this.data.selected_coupons.length;i++) {
      let coupon = this.data.selected_coupons[i];
      if(coupon.discount) {
        final_price = final_price - coupon.discount;
        if (final_price < 0) {
          final_price = 0;
          break;
        }
      }
      if(coupon.percent) {
        final_price = final_price * coupon.percent;
      }
    }
    for (let i = 0; i < this.data.selected_cash_coupons.length; i++) {
      let coupon = this.data.selected_cash_coupons[i];
      if (coupon.goods_discount) {
        final_price = final_price - coupon.goods_discount;
      }
      if (final_price <= 0) {
        if (final_price < 0) {
          balance = -final_price;
          final_price = 0;
        }
        break;
      }
    }
    if (final_price > 0 && this.data.shop_info.user_cash_coupon > 0 && this.data.use_user_cash_coupon) {  
      if (final_price >= this.data.shop_info.user_cash_coupon) {
        final_price = final_price - this.data.shop_info.user_cash_coupon;
        balance = -this.data.shop_info.user_cash_coupon;
      }else{
        balance = -final_price;
        final_price = 0;
      }
    }
    final_price = Math.round(final_price * 100) / 100;    //四舍五入保留两位小数
    
    this.setData({
      final_price: final_price
    })
  },

  //支付金额为0时
  zeroPay() {
    locked = true;
    let that = this;
    let coupons = "";
    for (let i = 0; i < this.data.selected_coupons.length; i++) {
      if (coupons == "") {
        coupons = this.data.selected_coupons[i].coupon_id;
      } else {
        coupons = coupons + "," + this.data.selected_coupons[i].coupon_id
      }
    }

    let cash_coupons = "";
    for (let i = 0; i < this.data.selected_cash_coupons.length; i++) {
      if (cash_coupons == "") {
        cash_coupons = this.data.selected_cash_coupons[i].coupon_id;
      } else {
        cash_coupons = cash_coupons + "," + this.data.selected_cash_coupons[i].coupon_id
      }
    }

    let shop_id = this.data.shop_id;
    wx.request({
      url: `${baseUrl}/index.php?m=default&c=offlineShop&a=zero_pay`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        appid: app.globalData.appId,
        shop_id: that.data.shop_id,
        session_id: wx.getStorageSync('session_id'),
        shop_name: that.data.shop_info.shop_name,
        nick_name: app.globalData.nick_name,
        goods_id: that.data.goods_id,
        coupons: coupons,
        cash_coupons: cash_coupons,
        balance: balance,
        price: that.data.price,
        final_price: that.data.final_price,
        commision: that.data.shop_info.commision,
        type: 1
      },
      success: function (res) {
        console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        console.log(res)
        if(res.error == 0) {
          wx.showToast({
            title: '支付成功！',
            duration: 2000
          })
      
          setTimeout(() => {
            wx.navigateBack()
          }, 2000)
        }else{
          wx.showToast({
            title: '连接失败，请检查网络重试！',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function(e) {
        wx.showToast({
          title: '连接失败，请检查网络重试！',
          icon: 'none',
          duration: 2000
        })
      },
      complete: function() {
        locked = false;
      }
    });
  },

  //调用支付并扣除使用的优惠券
  pay() {
    if(locked) {
      return
    }
    if (!this.data.price) {
      wx.showToast({
        title: '请先输入价格',
        icon: 'none',
      })
      return
    }
    if (this.data.final_price == 0) {
      this.zeroPay();
      return;
    }
    locked = true;
    let that = this;
    let coupons = "";
    for (let i = 0; i < this.data.selected_coupons.length;i++) {
      if (coupons == "") {
        coupons = this.data.selected_coupons[i].coupon_id;
      }else{
        coupons = coupons + "," + this.data.selected_coupons[i].coupon_id
      }
    }

    let cash_coupons = "";
    for (let i = 0; i < this.data.selected_cash_coupons.length; i++) {
      if (cash_coupons == "") {
        cash_coupons = this.data.selected_cash_coupons[i].coupon_id;
      } else {
        cash_coupons = cash_coupons + "," + this.data.selected_cash_coupons[i].coupon_id
      }
    }
    console.log(that.data.shop_info)

    wx.request({
      url: `${baseUrl}/index.php?m=default&c=offlineShop&a=offline_shop_pay`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        appid: app.globalData.appId,
        shop_id: that.data.shop_id,
        session_id: wx.getStorageSync('session_id'),
        shop_name: that.data.shop_info.shop_name,
        nick_name: app.globalData.nick_name,
        goods_id: that.data.goods_id,
        coupons: coupons,
        cash_coupons: cash_coupons,
        balance: balance,
        price: that.data.price,
        final_price: that.data.final_price,
        commision: that.data.shop_info.commision,
        group_purchase_id: that.data.group_purchase_id,
        order_id: that.data.order_id,
        type: that.data.type
      },
      success: function (res) {
        console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data))
        console.log(res.data)
        if (res.data.state != 1) {
          wx.showToast({
            title: res.data.text,
            icon: 'none',
            duration: 2000
          })
          return
        }

        wx.requestPayment({
          timeStamp: res.data.timeStamp,
          nonceStr: res.data.nonceStr,
          package: res.data.package,
          signType: 'MD5',
          paySign: res.data.paySign,
          success: function (res2) {
            console.log(res2)
            wx.request({
              url: baseUrl + '/index.php?c=offlineShop&a=offline_shop_pay_complete',
              method: 'POST',
              dataType: 'txt',
              header: { 'content-type': 'application/x-www-form-urlencoded' },
              data: {
                appid: app.globalData.appId,
                shop_id: that.data.shop_id,
                order_sn: res.data.out_trade_no,
                session_id: wx.getStorageSync('session_id'),
                goods_id: that.data.goods_id,
                coupons: coupons,
                cash_coupons: cash_coupons,
                balance: balance,
                price: that.data.price,
                final_price: that.data.final_price,
                commision: that.data.shop_info.commision,
                form_id: res.data.form_id,
                order_id: res.data.order_id,
                group_purchase_id: that.data.group_purchase_id,
                type: that.data.type
              },
              success: function (res3) {
                function Trim(str) {
                  return str.replace(/(^\s*)|(\s*$)/g, "");
                }
                res3 = JSON.parse(Trim(res3.data));
                console.log(res3)
                if(res3.error == 0) {
                  if(res3.ready == 1) {
                    wx.showToast({
                      title: '支付成功！',
                      duration: 2000
                    })
                  } else if (res3.ready == 2) {
                    wx.showToast({
                      title: '开团成功！',
                      duration: 2000
                    })
                  } else if (res3.ready == 3) {
                    wx.showToast({
                      title: '拼单成功！',
                      duration: 2000
                    })
                  }
                  setTimeout(() => {
                    wx.navigateBack()
                  }, 2000)
                }else{
                  wx.showToast({
                    title: '请求失败，请检查网络重试',
                    icon: 'none',
                    duration: 2000
                  })
                }
                
              },
              fail: function (err) {
                console.log(err)
                wx.showToast({
                  title: '请求失败，请检查网络重试',
                  icon: 'none',
                  duration: 2000
                })
              },
              complete: function() {
                locked = false;
              }
            })
          },
          fail: function (res) {
            wx.showToast({
              title: '支付失败，请重试',
              icon: 'none',
            })
            locked = false;
          }
        })
      },
      fail: function(e) {
        console.log(e);
        wx.showToast({
          title: '支付失败，请检查网络重试',
          icon: 'none',
        })
        locked = false;
      }
    });
  },

  toggleShowCoupons() {
    if (!parseFloat(this.data.price)) {
      wx.showToast({
        title: '请先输入价格',
        icon: 'none',
      })
      return
    }
    let that = this;

    this.setData({
      show_coupons: !that.data.show_coupons
    })
    
    if (this.data.show_coupons) {
      let animation = wx.createAnimation({
        duration: 300,
        timingFunction: "ease",
        delay: 0,
        transformOrigin: "50% 50%",
      })
      animation.translate(0, 0).step();
      this.setData({
        animationData: animation.export(),
      })
    }else{
      this.setData({
        animationData: ""
      })
    }
  },

  toggleShowCashCoupons() {
    if (!parseFloat(this.data.price)) {
      wx.showToast({
        title: '请先输入价格',
        icon: 'none',
      })
      return
    }
    let that = this;

    this.setData({
      show_cash_coupons: !that.data.show_cash_coupons
    })

    if (this.data.show_cash_coupons) {
      let animation = wx.createAnimation({
        duration: 300,
        timingFunction: "ease",
        delay: 0,
        transformOrigin: "50% 50%",
      })
      animation.translate(0, 0).step();
      this.setData({
        animationData2: animation.export(),
      })
    } else {
      this.setData({
        animationData2: ""
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