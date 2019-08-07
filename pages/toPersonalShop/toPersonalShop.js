// pages/toPersenalShop/toPersonalShop.js
const app = getApp();
var baseUrl = app.globalData.baseHttpUrl;
var htmlUrl = app.globalData.htmlUrl;
const shop_id = app.globalData.shop_id;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    has_shop:"",
    info:{},
    history_list:{},
    shop_list:{},
    componentlist: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      current_user_id: app.globalData.current_user_id
    })

    getApp().globalData.inviter = "";
    getApp().inviter = ""; 

    this.data.componentlist.push({
      "name": "indicator",
      "text": "今日推荐",
      "tip": ""
    });
    this.data.componentlist.push({
      "name": "shoplist",
      "listStyle": "2",
      "mode": "1",
      "limit": "3",
      "params": "recommand=1",
      "itemShopName": "1",
      "itemShopDesc": "1"
    });
    this.data.componentlist.push({
      "name": "indicator",
      "text": "附近的店",
      "tip": "更多>>",
      "URL":"/pages/toPersonalShop/personal_shop_list/personal_shop_list"
    });
    this.data.componentlist.push({
      "name": "shoplist",
      "listStyle": "3",
      "mode": "2",
      "limit": "3",
      "itemShopName": "1",
      "itemShopDesc": "1"
    });

    var that = this;
    that.setData({
      componentlist: that.data.componentlist
    });
  },

  getAllShop() {
  },

  getHistory() {
    let that = this;
    wx.request({
      url: baseUrl + '/index.php?m=default&c=flow&a=get_personal_shop_visit_history',
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        session_id: wx.getStorageSync('session_id'),
        shop_id: shop_id,
        start: 0,
        end: 3
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        console.log(res)
        that.setData({
          history_list: res
        })
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

  getShopInfo() {
    let that = this;
    wx.request({
      url: baseUrl + '/index.php?m=default&c=flow&a=get_personal_shop_and_user_info_by_user_id',
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        user_id: app.globalData.current_user_id,
        shop_id: shop_id
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        console.log(res)
        that.setData({
          has_shop: res.has_shop,
          info: res.info.length > 0 ? res.info[0]:""
        })
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

  newShop: function (shop_id, latitude, longitude)
  {
    var that = this;
    wx.request({
      url: baseUrl + '/index.php?m=default&c=flow&a=add_new_personal_shop',
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        session_id: wx.getStorageSync('session_id'),
        shop_id: shop_id,
        latitude: latitude,
        longitude: longitude
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        console.log(res)
        if (res) {
          that.getShopInfo();
          that.getAllShop();
          wx.showToast({
            title: '开店成功！',
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '请求失败，请检查网络重试',
            icon: 'none',
            duration: 2000
          })
        }
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

  addNewShop(e) {
    console.log(wx.getStorageSync('session_id'));
    let that = this;
    if(e.detail.userInfo) {
      let userInfo = e.detail.userInfo;
      wx.request({
        url: baseUrl + '/index.php?m=default&c=flow&a=update_user_info_by_user_id',
        method: 'POST',
        dataType: 'txt',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
          session_id: wx.getStorageSync('session_id'),
          nick_name: userInfo.nickName,
          avatar_url: userInfo.avatarUrl,
          city: userInfo.city,
          country: userInfo.country,
          gender: userInfo.gender,
          province: userInfo.province
        },
        success: function (res) {
          function Trim(str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
          }
          res = JSON.parse(Trim(res.data));
          
          wx.getLocation({
            success: function (res) {
              that.newShop(shop_id, res.latitude, res.longitude);
            },
            fail:function(res)
            {
              wx.showToast({
                title: '获取位置失败，你的小店将不会被推荐给附近的人',
                complete:function(res1)
                {
                  that.newShop(shop_id, "", "");
                }
              })
            }
          });
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

    }else{
      wx.showToast({
        title: '已拒绝授权，可以先看看别人的店',
        icon: 'none',
        duration: 2000
      })
    }
    
  },

  toMyShop(e) {
    let user_id = "";
    if (e.currentTarget.dataset.user_id) {
      user_id = e.currentTarget.dataset.user_id;
    } else {
      user_id = app.globalData.current_user_id;
    }

    wx.navigateTo({
      url: `/pages/personalShop/personalShop?user_id=${user_id}`,
    })
  },

  moreShop() {
    wx.navigateTo({
      url: `/pages/toPersonalShop/personal_shop_list/personal_shop_list`,
    })
  },

  moreHistory() {
    wx.navigateTo({
      url: `/pages/toPersonalShop/personal_history/personal_history`,
    })
  },

  shareShop() {
    wx.navigateTo({
      url: `/pages/personalShop/personalShare/personalShare?inviter=${this.data.info.user_id}&master_id=${this.data.info.user_id}`
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
    this.getShopInfo();

    this.getHistory();

    this.getAllShop();
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