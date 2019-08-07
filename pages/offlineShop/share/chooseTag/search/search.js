// pages/offlineShop/share/chooseTag/search/search.js

let app = getApp();
let baseUrl = app.globalData.baseHttpUrl;

let QQMapWX = require('../../../../../lib/qqmap-wx-jssdk.js');
let qqmapsdk;

let Utils = require("../../../../../lib/Utils.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchInput: "",
    showClear: false,
    screen_width: "",

    history_search: [],
    shop_list: [],
    brand_list: [],

    current_mode: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.hasOwnProperty('x')) {
      this.setData({
        x: options.x
      })
    }
    if (options.hasOwnProperty('y')) {
      this.setData({
        y: options.y
      })
    }

    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          screen_width: res.screenWidth
        })
      },
    })

    qqmapsdk = new QQMapWX({    //坐标sdk
      key: 'VT4BZ-6XKL5-YKYIQ-QFJVR-5Y276-SUBSB'
    });

    if(options.mode) {
      this.setData({
        current_mode: options.mode
      })
      if (options.mode == 1) {
        this.getLocation();
      }
    }
    if (options.key_word) {
      this.setData({
        searchInput: options.key_word
      })
      this.search();
    }else{
      this.getLocation()
    }

    let history_search = wx.getStorageSync('holo_history_search');
    this.setData({
      history_search: history_search
    })
  },

  //绑定input输入数据
  listenSearch: function (e) {
    this.setData({
      searchInput: e.detail.value
    })

    if (e.detail.value) {
      this.setData({
        showClear: true
      })
    } else {
      this.setData({
        showClear: false
      })
    }
  },

  //清除输入的数据
  clearValue: function () {
    this.setData({
      searchInput: "",
      showClear: false
    })
  },

  clearHistory() {
    wx.clearStorage('holo_history_search');
    this.setData({
      history_search: []
    })
  },

  search() {
    let that = this;
    wx.request({
      url: `${baseUrl}/index.php?m=default&c=offlineShop&a=search_shop_and_brand`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        latitude: that.data.latitude,
        longitude: that.data.longitude,
        city: that.data.city,
        start: that.data.start,
        key_word: that.data.searchInput
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        console.log(res)

        that.setData({
          shop_list: res.shop_list,
          brand_list: res.brand_list
        })
      }
    })
  },

  changeMode(e) {
    let mode = e.currentTarget.dataset.mode;
    this.setData({
      current_mode: mode
    })
  },

  chooseTag(e) {
    let tag_data = {};
    if (e.currentTarget.dataset.tag_data) {
      tag_data = e.currentTarget.dataset.tag_data;
    }else{
      tag_data.name = this.data.searchInput;
    }
    let screen_width = this.data.screen_width;

    //判断是否加入历史记录
    if (!tag_data.is_history) {
      let history = {};
      history.is_history = true;
      if (tag_data.shop_id) {
        history.icon = "/pages/img/addressc.png";
      } else if (tag_data.brand_id) {
        history.icon = "/pages/img/pending_pay.png"
      }

      if (tag_data.name) {
        history.name = tag_data.name
      } else if (tag_data.shop_name) {
        history.name = tag_data.shop_name
      } else if (tag_data.brand_name) {
        history.name = tag_data.brand_name
      }
      
      let search_history = wx.getStorageSync('holo_history_search');
      if (!search_history) {
        search_history = [];
        search_history.push(history);
      } else {
        let has_added = false;
        for(let i=0;i<search_history.length;i++) {
          if (search_history[i].name == history.name) {
            has_added = true;
            break;
          }
        }
        if(!has_added) {
          search_history.push(history);
        }
      }
      
      wx.setStorage({
        key: 'holo_history_search',
        data: search_history,
      })
    }

    let n = screen_width / 750;

    let tag = {};
    tag.x = Math.round(this.data.x);
    tag.y = Math.round(this.data.y - 25 * n);
    if (tag_data.icon) {
      tag.icon = tag_data.icon;
    }
    
    if (tag_data.name) {
      tag.text = tag_data.name
    } else if (tag_data.shop_name) {
      tag.text = tag_data.shop_name
    } else if (tag_data.brand_name) {
      tag.text = tag_data.brand_name
    }
    tag.length = this.countStringByte(tag.text);
    let tag_width = (40 + 30 + 20 * 2 + 14 * tag.length) * n;
    tag.tag_width = tag_width;

    if (tag.x >= screen_width / 2) {
      tag.left = 0;
      if (screen_width - tag.x < tag_width) {
        tag.left = 1;
        tag.x = tag.x - tag.tag_width + 20 * n;
      } else {
        tag.x = tag.x - 20 * n;
      }
    } else {
      tag.left = 1;
      if (tag.x < tag_width) {
        tag.left = 0;
        tag.x = tag.x - 20 * n;
      } else {
        tag.x = tag.x - tag.tag_width + 20 * n;
      }
    }

    tag.n = n;
    tag.show = true;

    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 3];  //编辑页面
    let tags = prevPage.data.tags;
    tags.push(tag);
    prevPage.setData({
      tags: tags
    })
    wx.navigateBack({
      delta: 2
    })
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

  //计算字符串的字节数
  countStringByte(str) {
    var bytesCount = 0;
    for (var i = 0; i < str.length; i++) {
      var c = str.charAt(i);
      if (/^[\u0000-\u00ff]$/.test(c)) //匹配双字节
      {
        bytesCount += 1;
      }
      else {
        bytesCount += 2;
      }
    }
    return bytesCount;
  },

  getOfflineShopList() {
    let that = this;
    if (this.data.no_more_data) {
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
        if (res.length > 0) {
          for (let i = 0; i < res.length; i++) {
            res[i].images = res[i].images.split(",");
            res[i].second_cat = res[i].second_cat.split(",");
            if (that.data.latitude) {    //若有具体坐标，则根据位置排序
              res[i].distance = that.getDistance(res[i].latitude, res[i].longitude, that.data.latitude, that.data.longitude)
            }

            res[i].icon = "/pages/img/addressc.png"
          }
          // res = res.sort(function(a,b) {
          //   return a.distance - b.distance;
          // })
        }
        if (res.length < 20) {
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