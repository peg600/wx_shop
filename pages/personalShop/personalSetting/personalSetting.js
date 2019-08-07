// pages/personalShop/personanSetting/personalSetting.js
const app = getApp()
var baseUrl = app.globalData.baseHttpUrl;
var htmlUrl = app.globalData.htmlUrl;
const shop_id = app.globalData.shop_id;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: {},
    show_shop_name_change: false,
    show_shop_slogan_change: false,
    shop_name: "",
    shop_slogan: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      current_user_id: app.globalData.current_user_id
    })
    this.getShopInfo();

    String.prototype.getlength = function () {
      return this.replace(/[\u0391-\uFFE5]/g, "aa").length;
    }
  },

  getShopInfo() {
    let that = this;
    wx.request({
      url: baseUrl + '/index.php?m=default&c=shop&a=get_personal_shop_and_user_info_by_user_id',
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
          info: res.info[0]
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

  showShopNameChange() {
    this.setData({
      show_shop_name_change: true
    })
  },

  showShopSloganChange() {
    this.setData({
      show_shop_slogan_change: true
    })
  },

  changeShopName: function (e) {
    this.setData({
      shop_name: e.detail.value
    })
  },

  changeShopSlogan: function (e) {
    this.setData({
      shop_slogan: e.detail.value
    })
  },

  submitName() {
    let that = this;
    if(that.data.shop_name.getlength()>16) {
      wx.showToast({
        title: '超过长度限制，请重新输入',
        icon: 'none',
        duration: 2000
      })
    } else if (that.data.shop_name.getlength()==0) {
      wx.showToast({
        title: '店名不能为空！',
        icon: 'none',
        duration: 2000
      })
    }
    else{
      wx.request({
        url: baseUrl + '/index.php?m=default&c=shop&a=change_personal_shop_name',
        method: 'POST',
        dataType: 'txt',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
          user_id: app.globalData.current_user_id,
          shop_id: shop_id,
          shop_name: that.data.shop_name
        },
        success: function (res) {
          function Trim(str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
          }
          res = JSON.parse(Trim(res.data));
          if (res) {
            that.getShopInfo();
            that.setData({
              show_shop_name_change: false
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
    }
    
  },

  submitSlogan() {
    let that = this;
    if (that.data.shop_slogan.getlength() > 40) {
      wx.showToast({
        title: '超过长度限制，请重新输入',
        icon: 'none',
        duration: 2000
      })
    }
    else{
      wx.request({
        url: baseUrl + '/index.php?m=default&c=shop&a=change_personal_shop_slogan',
        method: 'POST',
        dataType: 'txt',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
          user_id: app.globalData.current_user_id,
          shop_id: shop_id,
          shop_slogan: that.data.shop_slogan
        },
        success: function (res) {
          function Trim(str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
          }
          res = JSON.parse(Trim(res.data));
          if (res) {
            that.getShopInfo();
            that.setData({
              show_shop_slogan_change: false
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
    this.getShopInfo();
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