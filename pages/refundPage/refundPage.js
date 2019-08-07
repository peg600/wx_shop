var app = getApp();
var baseUrl = app.globalData.baseHttpUrl;
const shop_id = app.globalData.shop_id;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrl: baseUrl,
    rec_id:0,
    goodsInfo:{},
    content:'',
    selectContent:'',
    reasonArr:['拍错/不喜欢/效果差','质量问题','材质/面料/大小与商品描述不符','卖家发错货','收到商品少见被损坏','其他'],
    reasonIndex:-1,
    isShow:true,
    selectClass:''
  },
  selectReason:function(e){
    //console.log(e.detail.value)
    this.setData({
      reasonIndex: e.detail.value,
      selectContent: this.data.reasonArr[e.detail.value]
    })
  },

  textInput:function(e){
    //console.log(e.detail.value)
    this.setData({
      content: e.detail.value
    })
  },
  submission:function(){
    var content = this.data.content, selectContent = this.data.selectContent, rec_id = this.data.rec_id;
    if (selectContent == ''){
      wx.showToast({
        title: '选择原因',
        icon: 'none'
      })
      return 
    }
    wx.showLoading({
      title: '正在处理',
    })
    wx.request({
      url: baseUrl + '/index.php?m=default&c=flow&a=refund_by_rec_id',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      method: "POST",
      dataType: 'txt',
      data: {
        rec_id: rec_id,
        session_id: wx.getStorageSync('session_id'),
        content: content,
        select_content: selectContent,
        shop_id: shop_id
      },
      success: function (res) {
        wx.hideLoading();
        //console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data));
        if(res.data.error == 0){
          //console.log('处理成功，跳转')
          getApp().DataChanged = 4;
          wx.redirectTo({
            url: '/pages/refundPage/refundDetail/refundDetail?rec_id=' + rec_id,
            success: function(res) {},
            fail: function(res) {},
            complete: function(res) {},
          })

        }else{
          //console.log('处理失败')
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
  getOrderInfo:function(rec_id){
    wx.showLoading({
      title: '请稍候',
    })
    var that = this;
    wx.request({
      url: baseUrl + '/index.php?m=default&c=flow&a=get_goods_by_rec_id',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      method: "POST",
      dataType: 'txt',
      data: {
        rec_id: rec_id,
        shop_id: shop_id
      },
      success: function (res) {
        //console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data));
        //console.log(res.data)
        that.setData({
          goodsInfo:res.data.goods,
          isShow:false
        })
        wx.hideLoading();
       
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getApp().parseInviter(options);
    if (options.rec_id){
      var rec_id = options.rec_id;
      //console.log('rec:' + rec_id)
      this.setData({
        rec_id:rec_id
      })
    }else{
      wx.navigateBack({
        delta:1
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
    this.getOrderInfo(this.data.rec_id)
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