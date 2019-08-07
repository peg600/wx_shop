// pages/group_perchase/group_perchase.js

const app = getApp()
var baseUrl = app.globalData.baseHttpUrl;
var htmlUrl = app.globalData.htmlUrl;
const shop_id = app.globalData.shop_id;

var locked = false;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods_id: "",
    group_purchase_id: "",
    goods_info: "",
    group_list: "",
    current_order_info: "",
    users_info: "",

    inviter_info: "",
    show_share: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.parseInviter(options)
    
    if(options.group_purchase_id) {   //从分享进入
      this.setData({
        group_purchase_id: options.group_purchase_id
      })
      this.getFriendGroup()
    }
    if(options.shop_id) {
      this.setData({
        shop_id: options.shop_id
      })
    }
    if (options.goods_id) {           //从商品进入
      this.setData({
        goods_id: options.goods_id
      })
      this.getCashCouponGroupPurchaseInfo();
    }

    this.getGroupPurchaseGoodsAndShopInfo();


    // // 根据团长order_id获取该团及所属的拼团活动及商品的信息
    // wx.request({
    //   url: baseUrl + '/index.php?c=flow&a=get_group_purchase_order_info_by_order_id',
    //   method: 'POST',
    //   header: { 'content-type': 'application/x-www-form-urlencoded' },
    //   dataType: 'txt',
    //   data: {
    //     session_id: wx.getStorageSync('session_id'),
    //     order_id: that.data.order_id,
    //     shop_id: shop_id
    //   },
    //   success: function (res) {
    //     //console.log(res)
    //     function Trim(str) {
    //       return str.replace(/(^\s*)|(\s*$)/g, "");
    //     }
    //     res = JSON.parse(Trim(res.data));
    //     that.setData({
    //       current_order_info: res[0]
    //     })
    //     console.log(that.data.current_order_info)
    //     that.countDown("current_order_info", that.data.current_order_info, undefined)

    //     // 获取团购商品信息
    //     wx.request({
    //       url: baseUrl + '/index.php?c=flow&a=get_act_goods_info',
    //       method: 'POST',
    //       header: { 'content-type': 'application/x-www-form-urlencoded' },
    //       dataType: 'txt',
    //       data: {
    //         act_id: that.data.current_order_info.act_id,
    //         act_type: that.data.current_order_info.act_type,
    //         order_id: that.data.current_order_info.order_id,
    //       },
    //       success: function (res) {
    //         //console.log(res)
    //         function Trim(str) {
    //           return str.replace(/(^\s*)|(\s*$)/g, "");
    //         }
    //         res = JSON.parse(Trim(res.data));
    //         res[0].goods_img = `${baseUrl}/${res[0].goods_img}`;
    //         that.setData({
    //           goods_info: res[0]
    //         })
    //         console.log(that.data.goods_info)
    //       }
    //     });
    //   }
    // });

    // //获取部分团购设置及其下拼单中的团的团长订单信息
    // wx.request({
    //   url: baseUrl + '/index.php?c=flow&a=get_group_purchase_captain_order_info_by_act_id',
    //   method: 'POST',
    //   header: { 'content-type': 'application/x-www-form-urlencoded' },
    //   dataType: 'txt',
    //   data: {
    //     session_id: wx.getStorageSync('session_id'),
    //     act_id: 1,
    //     shop_id: shop_id
    //   },
    //   success: function (res) {
    //     //console.log(res)
    //     function Trim(str) {
    //       return str.replace(/(^\s*)|(\s*$)/g, "");
    //     }
    //     res = JSON.parse(Trim(res.data));
    //     console.log(res)
    //     for (let i = 0; i < res.length; i++) {
    //       // res[i].avatar_url = `${baseUrl}/${res[i].avatar_url}`;
    //       //根据团长order_id获取拼团组员人数
    //       wx.request({
    //         url: baseUrl + '/index.php?c=flow&a=get_group_purchase_number_by_order_id',
    //         method: 'POST',
    //         header: { 'content-type': 'application/x-www-form-urlencoded' },
    //         dataType: 'txt',
    //         data: {
    //           session_id: wx.getStorageSync('session_id'),
    //           order_id: res[i].order_id,
    //           shop_id: shop_id
    //         },
    //         success: function (res2) {
    //           //console.log(res)
    //           function Trim(str) {
    //             return str.replace(/(^\s*)|(\s*$)/g, "");
    //           }
    //           res2 = JSON.parse(Trim(res2.data));
    //           res[i].member_number = res2[0].member_number;
    //           res[i].need_number = parseInt(res[i].group_number) - parseInt(res[i].member_number);
    //           that.setData({
    //             group_list: res
    //           })
    //           that.countDown("group_list", res, i)
    //         }
    //       });
    //     }
    //   }
    // });
  },

  //获取好友邀请的团的相关信息
  getFriendGroup() {
    let that = this;
    wx.request({
      url: baseUrl + '/index.php?c=offlineShop&a=get_friend_group',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType: 'txt',
      data: {
        group_purchase_id: that.data.group_purchase_id
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        console.log(res)
        that.setData({
          inviter_info: res
        })
        that.countDown("inviter_info", res, undefined)
      }
    });
  },

  gotoDetail: function () {
    wx.navigateTo({
      url: "/pages/detailPage/detailPage?goods_id=" + this.data.goods_info.goods_id,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  countDown: function (objName, obj, i) {
    var that = this;
    if (i !== undefined) {
      var act = obj[i];
    } else {
      var act = obj;
    }
    // var created_time = act.act_start_time;
    var created_time = act.create_time;
    var hCreated = Date.parse(created_time.replace(/-/g, "/"));        //null
    // var countDownTime = act.expire_day * 86400000 + act.expire_hour * 3600000 + act.expire_minute * 60000;
    var countDownTime = 86400000;
    var timer = setInterval(function () {
      var daojishi = countDownTime - (Date.parse(Date()) - hCreated);
      var hour = parseInt(daojishi / 3600000);
      var minute = parseInt((daojishi - hour * 3600000) / 60000);
      var second = parseInt((daojishi - hour * 3600000 - minute * 60000) / 1000);
      if (Date.parse(Date()) - hCreated >= countDownTime) {   //失效
        clearInterval(timer)
        act.timer = '';
        let str = '';
        if (i !== undefined) {
          str = `${objName}[${i}].timer`;
        } else {
          str = `${objName}.timer`;
        }
        that.setData({
          [str]: act.timer
        })
        // that.setData({
        //   timer: '该订单已失效',
        //   isClick: false
        // })
        wx.request({
          url: baseUrl + '/index.php?m=default&c=offlineShop&a=group_expired',
          header: { "Content-Type": "application/x-www-form-urlencoded" },
          method: 'POST',
          data: {
            appid: app.globalData.appId,
            group_purchase_id: act.group_purchase_id
          },
          dataType: 'txt',
          success: function (res) {
            console.log(res)
            function Trim(str) {
              return str.replace(/(^\s*)|(\s*$)/g, "");
            }
            res.data = JSON.parse(Trim(res.data));
            that.data.group_list.expired_number ++ ;
            that.setData({
              group_list: that.data.group_list
            })
          },
          fail: function (err) {
            console.log(err)
            // wx.showToast({
            //   title: '请求失败，请检查网络重试',
            //   icon: 'none',
            //   duration: 2000
            // })
          }
        })
      } else {
        clearInterval(timer);
        act.timer = hour + ":" + minute + ":" + second;
        let str = '';
        if (i !== undefined) {
          str = `${objName}[${i}].timer`;
        } else {
          str = `${objName}.timer`;
        }
        that.setData({
          [str]: act.timer
        })
        that.countDown(objName, obj, i);
      }
    }, 1000)
  },

  //获取拼团商品及店铺信息
  getGroupPurchaseGoodsAndShopInfo() {
    let that = this;
    wx.request({
      url: baseUrl + '/index.php?c=offlineShop&a=get_group_purchase_goods_and_shop_info',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType: 'txt',
      data: {
        goods_id: that.data.goods_id
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        console.log(res)
        that.setData({
          info: res
        })
      }
    });
  },

  //发起优惠券拼购支付，添加订单
  payNewCashCouponGroupPurchase() {
    if (locked) {
      return
    }
    locked = true;
    let that = this;
    let info = that.data.info

    wx.request({
      url: `${baseUrl}/index.php?m=default&c=offlineShop&a=offline_shop_pay`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        appid: app.globalData.appId,
        shop_id: that.data.shop_id,
        session_id: wx.getStorageSync('session_id'),
        shop_name: info.shop_name,
        nick_name: app.globalData.nick_name,
        goods_id: that.data.goods_id,
        coupons: "",
        cash_coupons: "",
        price: info.shop_price,
        final_price: info.shop_price,
        commision: info.commision,
        group_purchase_id: "",
        type: 2
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

            //升级订单状态为拼团中，并插入拼团记录，返回团id
            wx.request({
              url: baseUrl + '/index.php?c=offlineShop&a=offline_shop_pay_complete',
              method: 'POST',
              dataType: 'txt',
              header: { 'content-type': 'application/x-www-form-urlencoded' },
              data: {
                appid: app.globalData.appId,
                shop_id: that.data.shop_id,
                goods_id: that.data.goods_id,
                order_sn: res.data.out_trade_no,
                session_id: wx.getStorageSync('session_id'),
                coupons: "",
                cash_coupons: "",
                price: info.shop_price,
                final_price: info.shop_price,
                commision: info.commision,
                form_id: res.data.form_id,
                order_id: res.data.order_id,
                group_purchase_id: "",
                type: 2
              },
              success: function (res3) {
                console.log(res3)
                function Trim(str) {
                  return str.replace(/(^\s*)|(\s*$)/g, "");
                }
                res3 = JSON.parse(Trim(res3.data))
                console.log(res3)
                if (res3.error == 0) {
                  that.setData({
                    show_share: true,
                    share_group_purchase_id: res3.group_purchase_id
                  })
                  that.getCashCouponGroupPurchaseInfo();
                }else{
                  wx.showToast({
                    title: '更新订单错误，请检查网络',
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
              complete: function () {
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
      fail: function (e) {
        console.log(e);
        wx.showToast({
          title: '支付失败，请检查网络重试',
          icon: 'none',
        })
        locked = false;
      }
    });
  },

  //参团支付，添加订单
  joinCashCouponGroupPurchase(e) {
    if (locked) {
      return
    }
    locked = true;
    let that = this;
    let info = that.data.info;
    let group_purchase_id = e.currentTarget.dataset.group_purchase_id;

    wx.request({
      url: `${baseUrl}/index.php?m=default&c=offlineShop&a=offline_shop_pay`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        appid: app.globalData.appId,
        shop_id: that.data.shop_id,
        session_id: wx.getStorageSync('session_id'),
        shop_name: info.shop_name,
        nick_name: app.globalData.nick_name,
        goods_id: that.data.goods_id,
        coupons: "",
        cash_coupons: "",
        price: info.shop_price,
        final_price: info.shop_price,
        commision: info.commision,
        group_purchase_id: group_purchase_id,
        type: 3
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

            //参团并更新状态，为团员添加现金券
            wx.request({
              url: baseUrl + '/index.php?c=offlineShop&a=offline_shop_pay_complete',
              method: 'POST',
              dataType: 'txt',
              header: { 'content-type': 'application/x-www-form-urlencoded' },
              data: {
                appid: app.globalData.appId,
                shop_id: that.data.shop_id,
                goods_id: that.data.goods_id,
                order_sn: res.data.out_trade_no,
                session_id: wx.getStorageSync('session_id'),
                coupons: "",
                cash_coupons: "",
                price: info.shop_price,
                final_price: info.shop_price,
                commision: info.commision,
                form_id: res.data.form_id,
                order_id: res.data.order_id,
                group_purchase_id: group_purchase_id,
                type: 3
              },
              success: function (res3) {
                console.log(res3)
                function Trim(str) {
                  return str.replace(/(^\s*)|(\s*$)/g, "");
                }
                res3 = JSON.parse(Trim(res3.data))
                console.log(res3)
                if (res3.error == 0) {
                  wx.showToast({
                    title: '参团成功，即将返回店铺',
                    icon: 'none',
                    duration: 2000
                  })
                  setTimeout(() => {
                    wx.redirectTo({
                      url: `/pages/offlineShop/shopPage/shopPage?shop_id=${that.data.shop_id}`,
                    })
                  },2000)
                } else {
                  wx.showToast({
                    title: '参团失败，请检查网络',
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
              complete: function () {
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
      fail: function (e) {
        console.log(e);
        wx.showToast({
          title: '支付失败，请检查网络重试',
          icon: 'none',
        })
        locked = false;
      }
    });
  },

  //根据goods_id获取所有拼单中的团的列表
  getCashCouponGroupPurchaseInfo() {
    let that = this;
    wx.request({
      url: baseUrl + '/index.php?c=offlineShop&a=get_cash_coupon_group_purchase_info_by_goods_id',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType: 'txt',
      data: {
        goods_id: that.data.goods_id
      },
      success: function (res) {
        //console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        console.log(res)
        res.expired_number = 0;
        
        that.setData({
          group_list: res
        })

        for (let i = 0; i < res.length; i++) {
          that.countDown("group_list", res, i)
        }
      }
    });
  },

  hide() {
    this.setData({
      show_share: false
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
      title: '拼单文案',
      // imageUrl: this.data.picURL,
      path: getApp().fillPathParams('/pages/group_purchase/group_purchase?group_purchase_id=' + that.data.share_group_purchase_id + "&goods_id=" + that.data.goods_id + '&shop_id=' + that.data.shop_id + "&inviter=" + app.globalData.current_user_id),
    }
  }
})