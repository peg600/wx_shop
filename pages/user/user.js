// pages/user/user.js
const app = getApp();
const baseUrl = app.globalData.baseHttpUrl;
const shop_id = app.globalData.shop_id;
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
 getApp().parseInviter(options);
    
    // wx.showLoading({
    //   title:'标题',
    //   mask:true
    // })
    // setTimeout(function () {
    //   wx.hideLoading()
    // }, 2000)
    // wx.getUserInfo({
    //   openIdList: ['selfOpenId'],
    //   lang: 'zh_CN',
    //   success: function(res){
    //     //console.log('success', res.data)
    //     //console.log('成功了吗')
    //   },
    //   fail: function(res){
    //     reject(res)
    //     //console.log('失败了吗')
    //   }
    // })
  },
  onGoUserInfo:function(e){
    //console.log(e)
  },
  sendMsg:function(){
    wx.request({
      url: 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=11_5WSfQfRhdzclqYFgZETaj1T1uY_8m4tVDuiPIS6c7bjS0ExS1ZoyupGOWIRLMNdKcrcYwAO3DqEYo9CIBF3AjkixJ0Ry3mQOrZtzgLHH_BzIzXRRb2tvhGVgIWuJHvaLQVrNy3H8YSPurIitNIHiAHAFAZ',
      method:'POST',
      // header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType:'json',
      data:{
        "touser":"oQ7J65f1cuso0OnfjU1PXAHVGg7Y",
        "template_id":"WJDx3htGvtyp84GS9EK600mF-rjXqUVhnicNRJpvP48",
        "form_id":"wx251448405120270fe49149573532137680",
        "data": { "keyword1": { "value": "339208499" } },
        "shop_id": "shop_id"
      },
      success: function (res) {
        //console.log(res)
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