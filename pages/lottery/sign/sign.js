// pages/lottery/sign/sign.js
let app = getApp();
let baseUrl = app.globalData.baseHttpUrl;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    everyday_bonus: 0,    //每日领取的分数
    serial_bonus: [],     //连续签到各档位奖励

    show_sign: false,   //显示签到弹窗
    credit: 0,
    serial_days: 0,
    has_signed: false, 

    photo_score: wx.getStorageSync('holo_smile_score')
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      navbar_height: app.globalData.height
    })
    let that = this;
    let credit = app.globalData.credit;
    that.setData({
      credit: credit
    })
    if (options.photo_score) {   //若为拍照后跳转回来
      this.setData({
        photo_score: options.photo_score
      })
      this.showSign();
    }
    this.getSignInfo();
  },

  //获取签到设定
  getSignInfo() {
    let that = this;
    wx.request({
      url: `${baseUrl}/index.php?m=default&c=flow&a=get_sign_info`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        session_id: wx.getStorageSync('session_id')
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        //console.log(res)
        that.setData({
          everyday_bonus: res.everyday_bonus,
          serial_bonus: res.serial_bonus
        })
        that.hasBonus();
      },
      fail: function(res) {
        //console.log(res)
        wx.showToast({
          title: '网络连接出错',
          icon: 'none',
          duration: 2000
        })
        return;
      }
    });
  },

  //检查某档位奖励是否领取过
  hasBonus() {
    let that = this;
    let serial_bonus = this.data.serial_bonus;
    for (let i = 0; i < serial_bonus.length; i++) {
      wx.request({
        url: `${baseUrl}/index.php?m=default&c=flow&a=has_bonus`,
        method: 'POST',
        dataType: 'txt',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
          session_id: wx.getStorageSync('session_id'),
          credit_type: serial_bonus[i].id
        },
        success: function (res) {
          function Trim(str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
          }
          res = JSON.parse(Trim(res.data));
          //console.log(res)
          if (res.error == "0") {
            serial_bonus[i].has = true;
          } else {
            serial_bonus[i].has = false;
          }
          that.setData({
            serial_bonus: serial_bonus
          })
        }
      });
    }
  },

  //领取连续签到奖励
  getBonus(e) {
    let that = this;
    let set_info = e.currentTarget.dataset.set_info;
    let index = e.currentTarget.dataset.set_index;

    wx.request({
      url: `${baseUrl}/index.php?m=default&c=flow&a=add_user_credit`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        session_id: wx.getStorageSync('session_id'),
        credit_type: set_info.id,
        credit: set_info.bonus
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        //console.log(res)
        let serial_bonus = that.data.serial_bonus;
        serial_bonus[index].has = false;

        that.setData({
          serial_bonus: serial_bonus,
          credit: res.credit
        })
        app.globalData.credit = res.credit;

        wx.showToast({
          title: `领取到${set_info.bonus}笑脸`,
          icon: 'none',
          duration: 2000
        })
      }
    });
  },

  //签到并显示签到结果
  showSign() {
    let that = this;
    wx.request({
      url: `${baseUrl}/index.php?m=default&c=flow&a=user_sign`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        session_id: wx.getStorageSync('session_id')
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        //console.log(res)
        if (res.error == "0") {
          that.setData({
            serial_days: res.data.serial_days,
            show_sign: true,
            has_signed: true
          })
        }
      }
    });
  },

  //领取签到奖励
  addSignCredit() {
    let that = this;
    wx.request({
      url: `${baseUrl}/index.php?m=default&c=flow&a=add_user_credit`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        session_id: wx.getStorageSync('session_id'),
        credit_type: 1,
        credit: parseInt(that.data.everyday_bonus * that.data.photo_score / 100)
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        //console.log(res)
        that.setData({
          credit: res.credit,
          show_sign: false
        })
        app.globalData.credit = res.credit;
      }
    });
  },

  takePhoto() {
    wx.redirectTo ({
      url: '/pages/faceTest/choosePhoto/choosePhoto?from=sign',
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