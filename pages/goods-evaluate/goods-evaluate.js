// pages/goods-evaluate/goods-evaluate.js
const app = getApp();
var baseUrl = app.globalData.baseHttpUrl;
const shop_id = app.globalData.shop_id;
Page({

  /**
   * 页面的初始数据
   */
  data: {

    shop_:
    {
      bg_src: "../img/star.png", plain_src: "../img/bg-star.png",
    },
    flag: 5, //控制商品评分的字段
    lags: 0,
    seps: 0,
    sers: 0,
    getGoodsRank : 0,
    rec_id:0,
    goodsImgUrl:'',
    isUserInfo:false,
    userInfo:{}

  },

  moreStarListShop: function (e) {
    ////console.log(e)
    var indexStar = e.currentTarget.id;
    ////console.log(indexStar , 'aaa')
    this.setData({
      flag: indexStar
    })
  },
  staticStarListShop: function (e) {
    ////console.log(e)
    var indexStar = e.currentTarget.id;
    ////console.log(indexStar)
    this.setData({
      lags: indexStar
    })
  },
  speedStarListShop: function (e) {
    var indexStar = e.currentTarget.id;
    this.setData({
      seps: indexStar
    })
  },
  serverStarListShop: function (e) {
    var indexStar = e.currentTarget.id;
    this.setData({
      sers: indexStar
    })
  },
  bindFormSubmit: function (e) {
    var userInfo = this.data.userInfo;
    if (!userInfo.nickName){
      userInfo.nickName = "";
      userInfo.avatarUrl = "";
    }
    var that = this
    wx.request({
      url: baseUrl + '/index.php?m=default&c=flow&a=add_comment',
      method: "POST",
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType:'txt',
      data: {
          rec_id: this.data.rec_id,
          content: e.detail.value.textarea,
          session_id:wx.getStorageSync('session_id'),
          flag: this.data.flag, //控制商品评分的字段
          lags: this.data.lags,
          seps: this.data.seps,
          sers: this.data.sers,
          nick_name: userInfo.nickName,
          avatar_url: userInfo.avatarUrl,
          shop_id: shop_id
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data));
            ////console.log(e)
            if (res.data.message == 'success'){
              wx.showToast({
                title: '评论成功',
                icon:'success'
              })
              //设置数据更新类型
              getApp().DataChanged = 1;
              wx.navigateBack({
                delta: 1
              })
            }
            // if(!e && e.data.length ==0){
            //     return
            // }
            // wx.showToast({
            //   title: e.data.message,
            // })
      },
      fail: function (err) {
        ////console.log(err)
        wx.showToast({
          title: '请求失败，请检查网络重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  chooseImage: function (e) {
    var that = this
    wx.chooseImage({
      count: 3,
      success: function (res) {
        ////console.log(res)
        ////console.log(res)
        that.setData({
          tempFiles: res.tempFiles
        })
      },
    })
  },
  //根据rec_id获取商品信息
  getGoodsInfo:function(recId){
    var that = this;
    wx.request({
      url: baseUrl + '/index.php?m=default&c=flow&a=get_goods_by_rec_id',
      method: "POST",
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType: 'txt',
      data: {
        rec_id: recId,
        shop_id: shop_id
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data));
        ////console.log(res)
        if (res.data.message == 'success') {
          that.setData({
            goodsImgUrl: baseUrl + '/' + res.data.goods.goods_thumb
          })
        }
       
      },
      fail: function (err) {
        ////console.log(err)
        wx.showToast({
          title: '请求失败，请检查网络重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  //非匿名评论，获取用户信息
  onGotUserInfo:function(e){
    ////console.log(e)
    if (e.detail.userInfo){
      this.setData({
        isUserInfo: !this.data.isUserInfo
      })
      if(this.data.isUserInfo){
          this.setData({
            userInfo: e.detail.userInfo
          })
      }else{
        this.setData({
          userInfo: {}
        })
      }
    }else{
      this.setData({
        isUserInfo: false
      })
    }
  },
   /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      navbar_height: app.globalData.height
    })

   getApp().parseInviter(options);
    if (!options.rec_id || options.rec_id ==null){
      wx.redirectTo({
        url: '/pages/New/index'
      })
    }else{
      var rec_id = options.rec_id;
      this.setData({
        rec_id:rec_id
      })
    }

    this.getGoodsInfo(this.data.rec_id)
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
     var params = getApp().getShareParams();
    return params;
  }
})