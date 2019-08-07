// pages/order-pay/order-pay.jvar 
var app = getApp()
var baseUrl = app.globalData.baseHttpUrl;
const shop_id = app.globalData.shop_id;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    total:0,
    isShowShare:false,
    picURL:"",
    order_id:""
  },
  getlistProducts: function (index) {
    var that = this;
    wx.request({
      url: baseUrl + '/?c=category&a=getproducts&id=' + index ,
      data: {
        shop_id: shop_id
      },
      dataType:'txt',
      method: 'POST',
      success: res => {
        //console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data));
        //console.log(res)
        //  判断暂且留下
        if (!res && res.data.list.length == 0) {
          //console.log('暂无数据')
        }
        that.setData({
          allType_data: res.data.list,
        })
      }
    })
  },
  //跳转到订单详情
  toFindGoods: function(){
      wx.navigateTo({
        url: '/pages/orderInfoPage/orderInfoPage?order_id='+this.data.order_id,
      })
  },
//回到首页
  goBackIndex : function(){
       wx.switchTab({
         url: '/pages/New/index',
       })
  },
  //获取订单信息
  getOrderInfo:function(order_id){
    var that = this;
    //console.log(order_id, wx.getStorageSync('session_id'))
    wx.request({
      url: baseUrl + '/index.php?m=default&c=flow&a=get_order_info_by_order_id',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      data: {
        order_id:order_id,
        session_id:wx.getStorageSync('session_id'),
        shop_id: shop_id
      }, 
      dataType: 'txt',
      success: function(res){
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data));
        console.log(res.data)
        that.setData({
          total:res.data.order[0].total
        })
        if (res.data.order[0].act_id){
          that.setData({
            isShowShare:true,
            act_id: res.data.order[0].act_id,
            picURL: res.data.order[0].picURL
          })
          wx.navigateTo({      //直接跳转到分享
            url: '/pages/actions/actionsShare/actionsShare?act_id='+that.data.act_id+'&order_id='+order_id,
          })
        }else if(res.data.order[0].act_type != 0){
          if (res.data.order[0].act_type == '1') {
            wx.request({
              url: baseUrl + '/index.php?m=default&c=flow&a=is_in_group_purchase',
              header: { 'content-type': 'application/x-www-form-urlencoded' },
              dataType: 'txt',
              method: 'POST',
              data: {
                session_id: wx.getStorageSync('session_id'),
                order_id: res.data.order[0].order_id,
                shop_id: shop_id
              },
              success: function (res2) {
                function Trim(str) {
                  return str.replace(/(^\s*)|(\s*$)/g, "");
                }
                res2 = JSON.parse(Trim(res2.data));
                console.log(res2)
                if(res2.act_info.need_number>0) {   //人未满
                  wx.navigateTo({      //直接跳转到分享拼团
                    url: `/pages/group_purchase/group_purchase?order_id=${order_id}`
                  }) 
                }else{
                  wx.navigateTo({      //跳转到拼团完成
                    url: `/pages/group_purchase/group_purchase_complete/group_purchase_complete?order_id=${order_id}&captain_order_id=${res2.captain_order_id}`
                  })
                }
                
              }
            })
          }
        }else{
          that.setData({
            isShowShare: false
          })
        }      
      }
    })
  },
  //通知后台发送服务通知
  sendMessage:function(order_id){
    wx.request({
      url: baseUrl + '/index.php?m=default&c=flow&a=send_message',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType: 'txt',
      method: 'POST',
      data: {
        session_id: wx.getStorageSync('session_id'),
        order_id: order_id,
        shop_id: shop_id
      },
      success: function (res) {
        //console.log(res)
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getApp().parseInviter(options);
    if (options.order_id){
        this.setData({
          order_id: options.order_id,
          //picURL: wx.getStorageSync('picURL')
        })
        //console.log(options.order_id)
        this.getlistProducts(2);
        this.sendMessage(options.order_id);
        this.getOrderInfo(options.order_id);
      }else{
        wx.reLaunch({
          url: '/pages/New/index',
        })
      }
  },
  toDetailListPage:function(e){
    //console.log(e)
    wx.navigateTo({
      url: "/pages/detailPage/detailPage?goods_id=" + e.currentTarget.dataset.goodid,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
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
    getApp().resetInviter();
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
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      //console.log(res.target)
      //console.log(this.data.picURL)
      return {
        title: '帮我看看这些宝贝适合我不？适合帮我撮合下', 
        // path: '/pages/New/index'
        imageUrl:this.data.picURL,
        path: getApp().fillPathParams('/pages/actions/actionsJoin/actionsJoin?act_id=' + this.data.act_id + '&pic=' + this.data.picURL)
      }
    }
    return {
      title: '帮我看看这些宝贝适合我不？适合帮我撮合下',
      // path: '/pages/New/index'
      imageUrl: this.data.picURL,
      path: getApp().fillPathParams('/pages/actions/actionsJoin/actionsJoin?act_id=' + this.data.act_id + '&pic=' + this.data.picURL)
    }
   
  }
})