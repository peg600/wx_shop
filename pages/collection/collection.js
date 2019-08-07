// pages/collection/collection.js
const app = getApp();
var baseUrl = app.globalData.baseHttpUrl;
const shop_id = app.globalData.shop_id;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    collectionList:[],
    baseUrl:baseUrl,
    // isToGoods:true,
    selectGoodsIndex:-1
  },

  //跳转到商品详情页
  toGoodsDetail:function(e){
    ////console.log(e)
    if (this.data.selectGoodsIndex == e.currentTarget.dataset.index){
      this.setData({
        selectGoodsIndex:-1
      })
      return false
    }
    // ////console.log(e)
    var goods_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/detailPage/detailPage?goods_id=" + goods_id,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  //手指触摸元素350毫秒以上触发事件
  touchLongHandle:function(e){
    ////console.log('触摸了')
    ////console.log(e)
    this.setData({
      selectGoodsIndex:e.currentTarget.dataset.index
    })
  },
  //删除收藏物品
  delCollect:function(e){
    var that = this, rec_id = e.currentTarget.dataset.recid;
    ////console.log(rec_id)
    wx.showModal({
      title: '确认删除',
      content: '从收藏中删除此物品？',
      success:function(res){
        if(res.confirm){
          ////console.log('用户确认删除收藏');
          wx.request({
            url: baseUrl + '/index.php?m=default&c=flow&a=del_collect_by_user_rec_id',
            method: "POST",
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            dataType: 'txt',
            data: {
              session_id: wx.getStorageSync('session_id'),
              rec_id: rec_id,
              shop_id: shop_id
            },
            success: function (res) {
              ////console.log(res)
              function Trim(str) {
                return str.replace(/(^\s*)|(\s*$)/g, "");
              }
              res.data = JSON.parse(Trim(res.data));
              ////console.log(res.data)
              if(res.data.error == 0){
                // wx.showToast({
                //   title: '删除成功',
                //   icon:'success'
                // })
                that.setData({
                  selectGoodsIndex:-1
                })
                that.getCollectList();
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
        }else if(res.cancel){
          ////console.log('用户取消删除收藏')
        }
      }
    })
  },
  //获取收藏中的商品
  getCollectList:function(){
    wx.showLoading({
      title: '请稍候',
      mask:true
    })
    var that = this;
    wx.request({
      url: baseUrl + '/index.php?m=default&c=flow&a=get_collection',
      method: "POST",
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType: 'txt',
      data: {
        session_id: wx.getStorageSync('session_id'),
        shop_id: shop_id
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data));
        ////console.log(res.data)
        if (res.data.result) {
          that.setData({
            collectionList: res.data.result
          })
        }else{
          that.setData({
            collectionList:[]
          })
        }
        wx.hideLoading();
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      navbar_height: app.globalData.height
    })
    getApp().parseInviter(options);
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
    this.getCollectList();
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
    ////console.log('下拉刷新')
    this.getCollectList();
    wx.stopPullDownRefresh();
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