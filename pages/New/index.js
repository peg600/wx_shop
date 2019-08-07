let app = getApp();
let baseUrl = app.globalData.baseHttpUrl;

let QQMapWX = require('../../lib/qqmap-wx-jssdk.js');
let qqmapsdk;

let amapFile = require('../../lib/amap-wx.js');
let myAmapFun;

let Utils = require("../../lib/Utils.js");

Page({
  data: {
    componentlist: [],
    goodslist:[],
    pageIndex:1,
    hidden:false,
    top: 0,
    noMoreData:false,
    shop_list: [],
    city:"还未选择城市",
    latitude: "",
    longitude: "",
    start: 0,
    show_tip: false,
    no_more_data: false,
    show_no_more: false,

  },

  onLoad(options) {
    var that = this;

    // let last_shop_id = wx.getStorageSync('last_shop_id');
    // if (last_shop_id) {
    //   wx.navigateTo({
    //     url: `/pages/offlineShop/shopPage/shopPage?shop_id=${last_shop_id}`,
    //   })
    // }

    qqmapsdk = new QQMapWX({    //坐标sdk
      key: 'VT4BZ-6XKL5-YKYIQ-QFJVR-5Y276-SUBSB'
    });

    this.getLocation();
    //this.getOfflineShopList();

    if (app.globalData.current_user_id) {   //login已完成
      console.log("login已完成")
      app.parseInviter(options)
      wx.getUserInfo({
        success: function (res) {
          app.globalData.userInfo = res.userInfo
        },
        fail: function (res) {
          wx.redirectTo({
            url: '/pages/authorize/authorize',
          })
        }
      })
    } else {
      console.log("登录未完成")
      app.globalData.login_promise.then(() => {
        app.parseInviter(options)
        wx.getUserInfo({
          success: function (res) {
            app.globalData.userInfo = res.userInfo
          },
          fail: function (res) {
            wx.redirectTo({
              url: '/pages/authorize/authorize',
            })
          }
        })
      })
    }

    //获取页面Head头
    wx.request({
      url: baseUrl + '/?c=page&a=getIndexPage&id=4',
      method: "POST",
      dataType: 'txt',
      success: res => {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        var pages = JSON.parse(Trim(res.data));
        console.log(JSON.parse(pages.pages))
        that.data.componentlist = JSON.parse(pages.pages);
        that.setData({
          componentlist: that.data.componentlist,
          hidden: true
        });
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
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function (res) {
            if (res.status == 0) {
              let city = res.result.address_component.city;
              that.setData({
                city: city,
                latitude: latitude,
                longitude: longitude,
                shop_list: [],
                start: 0,
                show_tip: false,
                no_more_data: false,
                show_no_more: false
              })
              that.getOfflineShopList();
            }
          },
          fail: function (res) {
            wx.hideLoading();
            Utils.showToast({
              title: '定位失败，请手动选择',
              icon: 'none'
            })
            that.setData({
              show_tip: true
            })
          },
          complete: function (res) {
            wx.hideLoading();
          }
        });
      },
      fail: function (res) {
        wx.showToast({
          title: '获取定位失败',
          icon: 'none',
          duration: 3000
        })
        that.setData({
          show_tip: true
        })
      },
      complete: function (res) {
        wx.hideLoading();
      }
    })
  },

  getOfflineShopList() {
    let that = this;
    if(this.data.no_more_data) {
      this.setData({
        show_no_more: true
      })
      return;
    }
    that.setData({
      hidden: false
    });
    wx.request({
      url: `${baseUrl}/index.php?m=default&c=offlineShop&a=get_offline_shop_list`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        latitude: that.data.latitude,
        longitude: that.data.longitude,
        city: that.data.city,
        start: that.data.start
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        console.log(res)
        if(res.length > 0) {
          for (let i = 0; i < res.length; i++) {
            res[i].images = res[i].images.split(",");
            res[i].second_cat = res[i].second_cat.split(",");
            if(that.data.latitude) {    //若有具体坐标，则根据位置排序
              res[i].distance = that.getDistance(res[i].latitude, res[i].longitude, that.data.latitude, that.data.longitude)
            }

            if(res[i].coupons) {
              for (let j = res[i].coupons.length-1;j>=0;j--) {
                let coupon = res[i].coupons[j];
                let is_intime = Utils.isInTime(coupon.start_time, coupon.end_time)
                if (!is_intime) {
                  coupon.is_outdated = true;
                }
                coupon.can_use = parseInt(res[i].coupons[j].can_use);

                if (coupon.is_outdated || !coupon.can_use) {
                  res[i].coupons.splice(j,1);
                }
              }
            }
          }
          res = res.sort(function(a,b) {
            return a.distance - b.distance;
          })
        }
        if(res.length < 20) {
          that.setData({
            no_more_data: true
          })
        }
        let start = that.data.start;
        start = start + res.length;
        let shop_list = that.data.shop_list;
        shop_list = shop_list.concat(res);
        that.setData({
          shop_list: shop_list,
          start: start,
          hidden: true
        })
      }
    });
  },

  //计算两个火星坐标点之间的距离
  getDistance(la1, lo1, la2, lo2) {
    var La1 = la1 * Math.PI / 180.0;
    var La2 = la2 * Math.PI / 180.0;
    var La3 = La1 - La2;
    var Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
    s = s * 6378.137;
    s = Math.round(s * 10000) / 10000;
    s = s.toFixed(2);
    return s;
  },

  toggleShowAllCoupon(e) {
    let shop_list = this.data.shop_list;
    let index = e.currentTarget.dataset.index;
    if (!shop_list[index].show_all_coupon) {
      shop_list[index].show_all_coupon = true;
    } else {
      shop_list[index].show_all_coupon = !shop_list[index].show_all_coupon
    }
    this.setData({
      shop_list: shop_list
    })
  },

  toggleShowAllGoods(e) {
    let shop_list = this.data.shop_list;
    let index = e.currentTarget.dataset.index;
    if (!shop_list[index].show_all_goods) {
      shop_list[index].show_all_goods = true;
    } else {
      shop_list[index].show_all_goods = !shop_list[index].show_all_goods
    }
    this.setData({
      shop_list: shop_list
    })
  },

  goChooseCity() {
    wx.navigateTo({
      url: `/pages/offlineShop/addressSelect/addressSelect`,
    })
  },

  prevent() {

  },

  gotoShop(e) {
    let shop = e.currentTarget.dataset.shop;
    wx.navigateTo({
      url: `/pages/offlineShop/shopPage/shopPage?shop_id=${shop.shop_id}&distance=${shop.distance}`,
    })
  },

  gotoDetail(e) {
    let goods_id = e.currentTarget.dataset.goods_id;
    wx.navigateTo({
      url: `/pages/detailPage/detailPage?goods_id=${goods_id}`,
    })
  },

  //清空页面记录并重新加载商铺列表，用于切换位置后
  reload() {
    this.setData({
      shop_list: [],
      latitude: "",
      longitude: "",
      start: 0,
      show_tip: false,
      no_more_data: false,
      show_no_more: false
    })
    this.getOfflineShopList();
  },

  onReachBottom: function () {
    var that = this;
    // that.setData({
    //   hidden: false
    // });
    this.getOfflineShopList();
    //this.selectComponent("#all_goods").pullNewData();
  },

  goSearch:function()
  {
    wx.navigateTo({
      url: '/pages/index/search/search',
    })
  },

  onPageScroll:function(e)
  {
    let that = this;
    this.data.top = e.scrollTop;
    this.setData({
      top:e.scrollTop
    })
  },

  goTop:function()
  {
    wx.pageScrollTo({
      scrollTop: 0,
    })
  },

  pullGoodFinished:function(e)
  {
    this.setData({
      hidden: true
    });

    if(!e.detail.hasNewData)
    {
      this.data.noMoreData = true;
      var that = this;
      this.setData({
        noMoreData:that.data.noMoreData
      })
    }
  },

  onShareAppMessage: function () {

  }
})