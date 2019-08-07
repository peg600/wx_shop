// pages/orderInfo/orderInfo.js
var temp = require('../index/templeteUrl.js');
const app = getApp();
var baseUrl = app.globalData.baseHttpUrl;
const shop_id = app.globalData.shop_id;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    statusNameList: temp.datas.statusNamelist,
    currentId: 0,
    dataChanged: 0,
    orderArr: [],
    baseUrl: baseUrl
  },
  toGoodsDetail:function(e){
    //console.log(e.currentTarget.dataset.goodsid)
    wx.navigateTo({
      url: "/pages/detailPage/detailPage?goods_id=" + e.currentTarget.dataset.goodsid,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  invitationJoin:function(){
    
  },
  promptDelivery:function(){
    wx.showToast({
      title: '已催促卖家发货',
      icon:'success'
    })
  },
  //删除订单
  delOrder: function (e) {
    var that = this;
    wx.showModal({
      title: '确认删除？',
      content: '删除此订单',
      success: function (res) {
        if (res.confirm) {
          var orderId = e.currentTarget.dataset.id;
          wx.request({
            url: baseUrl + '/index.php?m=default&c=flow&a=del_goods_by_order_id',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            method: "POST",
            dataType: 'txt',
            data: {
              session_id: wx.getStorageSync('session_id'),
              order_id: orderId,
              shop_id: shop_id
            },
            success: function (res) {
              function Trim(str) {
                return str.replace(/(^\s*)|(\s*$)/g, "");
              }
              res.data = JSON.parse(Trim(res.data));
              //console.log(res)
              if (res.data.message == 'success') {
                that.getOrderList();
              }
            },
            fail: function (err) {
              //console.log(err)
              wx.showToast({
                title: '请求失败，请检查网络重试',
                icon: 'none',
                duration: 2000
              })
            },
            complete:function()
            {
              getApp().DataChanged = 1;
            }
          })
        }
      }
    })
  },
  //根据currentID，获取订单信息
  currentIdRequest: function (currentId, sessionId) {
    wx.showLoading({
      title: '请稍候',
      mask:true
    })
    var that = this;
    var fName = "";
    var summary = app.orderSummary;
    if(summary == undefined)
    summary = new Object();
    var summaryCount = undefined;
    if (currentId == 0) {   //全部
      fName = 'get_all_order';  
    } else if (currentId == 1) {    //待付款
      fName = 'get_paystatus'; 
      summaryCount = summary.pay;
    } else if (currentId == 2) {    //待发货
      summaryCount = summary.sip;
      fName = 'get_shipping';
    } else if (currentId == 3) {    //待收货
      summaryCount = summary.sipd;
      fName = 'get_shiped';
    } else if (currentId == 4) {    //待评价
      summaryCount = summary.eva;
      fName = 'get_not_evaluate';
    } else if (currentId == 5){     //待分享
      summaryCount = summary.share;
      fName = 'get_share_info';
    // } else if (currentId == 6) {    //待拼团
    //   summaryCount = summary.group;
    //   fName = 'get_group_purchase_info';
    }else{
      wx.hideLoading();
      return 
    }
    //console.log(currentId)
    //console.log(fName);
    wx.showLoading({
      title: '请稍候',
    })
    wx.request({
      url: baseUrl + '/index.php?m=default&c=flow&a=' + fName,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      method: "POST",
      dataType: 'txt',
      data: {
        session_id: sessionId,
        shop_id: shop_id
      },
      success: function (res) {
        //console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data));
        console.log(res.data)
        console.log(fName)
        
        //计算概要信息
        var bindData = new Array();
        for (var i = 0;i < res.data.length; i ++)
        {
          var id = res.data[i].order_id;
          var tmp = bindData[id];
          if (tmp != undefined)
          {
            bindData[res.data[i].order_id].numberOfGoods ++;
            obj.needPay += Math.floor(parseFloat(res.data[i].shop_price) * 100) / 100 * parseInt(res.data[i].goods_number);
            bindData[res.data[i].order_id].goods_list.push({ shop_price: res.data[i].goods_price, rec_id: parseInt(res.data[i].rec_id), goods_attr: res.data[i].goods_attr, number: parseInt(res.data[i].number), goods_name: res.data[i].goods_name, label: res.data[i].attr_value, goods_thumb: res.data[i].goods_thumb, status: parseInt(res.data[i].status), shipping_status: parseInt(res.data[i].shipping_status), collect: parseInt(res.data[i].collect), evaluate: parseInt(res.data[i].evaluate), act_id: parseInt(res.data[i].act_id), pay_status: parseInt(res.data[i].pay_status), order_id: parseInt(id), share_status: parseInt(res.data[i].share_status)});
          }
          else
          {
            var obj = new Object();
            obj.total = res.data[i].total;
            obj.numberOfGoods = 1;
            obj.needPay = Math.floor(parseFloat(res.data[i].shop_price) * 100) / 100 *parseInt(res.data[i].goods_number);
            obj.goods_list = new Array();
            obj.goods_list.push({ shop_price: res.data[i].goods_price, goods_attr: res.data[i].goods_attr, rec_id: parseInt(res.data[i].rec_id),number: parseInt(res.data[i].number), goods_name: res.data[i].goods_name, label: res.data[i].attr_value, goods_thumb: res.data[i].goods_thumb, status: parseInt(res.data[i].status), shipping_status: parseInt(res.data[i].shipping_status), collect: parseInt(res.data[i].collect), evaluate: parseInt(res.data[i].evaluate), act_id: parseInt(res.data[i].act_id), pay_status : parseInt(res.data[i].pay_status), order_id:parseInt(id), share_status:parseInt(res.data[i].share_status)});
            obj.order_id = id;
            bindData[id] = obj;
          }
        }
        var result = new Array();
        for (var key in bindData) {
          result.push(bindData[key]);
        }
        if(summaryCount != undefined && parseInt(summaryCount) != result.length)
        app.DataChanged = 1;
        that.setData({
          orderArr: result
        })
        //console.log(that.data.orderArr.length)
        wx.hideLoading();
      },
      fail: function (err) {
        //console.log(err)
        wx.showToast({
          title: '请求失败，请检查网络重试',
          icon: 'none',
          duration: 2000
        })
      },
      complete: function () {
        wx.hideLoading();
      }
    })
  },
  //根据goods状态，获取订单列表
  getOrderList: function (e) {
    var currentId = this.data.currentId;
    var session_id = wx.getStorageSync('session_id'); // 取得本地存得的session_id
    //console.log(currentId)
    this.currentIdRequest(currentId, session_id);
  },
  //点击选择goods状态,并通过状态改变ajax获取订单信息
  seletGoodStatus: function (e) {
    var that = this;
    //console.log(e)
    this.setData({
      currentId: e.currentTarget.dataset.id
    })
    this.getOrderList();
  },
  //跳转到订单详情页面
  toOrderInfoPage:function(e){
    //console.log(e.currentTarget.dataset.id)
    var order_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/orderInfoPage/orderInfoPage?order_id='+order_id,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  //确认收货
  confirmCollect:function(e){
    var order_id = e.currentTarget.dataset.id;
    var that = this;
    wx.showModal({
      title: '确认收货？',
      content: '确认已收到商品？',
      success:function(res){
        if(res.confirm){
          wx.request({
            url: baseUrl + '/index.php?m=default&c=flow&a=confirm_collect',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            method: "POST",
            dataType: 'txt',
            data: {
              session_id: wx.getStorageSync('session_id'),
              order_id: order_id,
              shop_id: shop_id
            },
            success: function (res) {
              //console.log(res)
              function Trim(str) {
                return str.replace(/(^\s*)|(\s*$)/g, "");
              }
              res.data = JSON.parse(Trim(res.data));
              //console.log(res.data)
              if(res.data.error == 0){
                wx.showToast({
                  title: '确认收货成功',
                  icon:'success'
                })
                setTimeout(function(){
                  that.getOrderList();
                },1500)
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
        }else if(res.cancel){
          //console.log('用户取消确认收货')
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getApp().parseInviter(options);
    if (!options.status) {
    } else {
      this.setData({
        currentId: options.status
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getOrderList();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if((getApp().DataChanged == 1 || getApp().DataChanged == 3) && getApp().dataChanged != this.dataChanged){
    this.getOrderList();
    }
    this.dataChanged = getApp().dataChanged;
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
    this.getOrderList();
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
    var params = app.getShareParams();
    return params;
  }
})