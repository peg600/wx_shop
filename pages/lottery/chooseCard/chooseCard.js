// pages/lottery/chooseCard/chooseCard.js
let app = getApp();
let baseUrl = app.globalData.baseHttpUrl;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    share_bonus: [5, 100, 1000],    //当前分享奖励抽中的分值
    has_chosen: false,    //是否已抽取
    chosen_index: "",   //抽中第几个
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      navbar_height: app.globalData.height
    })
    this.hasChosenCard();
  },

  //检测当日是否已抽卡
  hasChosenCard() {
    let that = this;
    wx.request({
      url: `${baseUrl}/index.php?m=default&c=flow&a=has_chosen_card`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        session_id: wx.getStorageSync('session_id'),
        credit_type: 15
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        //console.log(res)
        if (res.error == 1) {
          that.setData({
            has_chosen: true
          })
        }
      }
    });
  },

  //分享抽牌
  chooseCard(e) {
    let that = this;
    let index = e.target.dataset.index;
    let bonus = parseInt(Math.random() * 10) + 1
    if (bonus >= 1 && bonus <= 6) {
      bonus = 5
    } else if (bonus > 6 && bonus <= 9) {
      bonus = 100
    } else {
      bonus = 1000
    }
    wx.request({
      url: `${baseUrl}/index.php?m=default&c=flow&a=add_user_credit`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        session_id: wx.getStorageSync('session_id'),
        credit_type: 15,
        credit: bonus
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        //console.log(res)
        let bonus_arr = [5, 20, 100];
        for (let i = 0; i < bonus_arr.length; i++) {
          if (bonus_arr[i] == bonus) {
            let temp = bonus_arr[index];
            bonus_arr[index] = bonus_arr[i];
            bonus_arr[i] = temp;
          }
        }
        that.setData({
          share_bonus: bonus_arr,
          has_chosen: true,
          chosen_index: index
        })
        app.globalData.credit = res.credit;

        wx.showToast({
          title: `领取到${bonus}笑脸`,
          icon: 'none',
          duration: 2000
        })
      }
    });
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