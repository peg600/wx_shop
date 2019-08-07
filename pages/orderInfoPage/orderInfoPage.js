// pages/orderInfoPage/orderInfoPage.js
var app = getApp();
var baseUrl = app.globalData.baseHttpUrl;
const shop_id = app.globalData.shop_id;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order_id: 0,
    discount: 0,
    goodsList: [],
    addressInfo: {},
    baseUrl: baseUrl,
    total: 0,
    status: 0,    //状态码 0：待付款 1：待发货 2：待收货 3：完成 4:钟情购分享 5:拼团中
    imgSrc: '../img/waitforpay.png',
    orderNumber: '8917920448',
    isShow: false

  },
  //根据订单id获取该订单信息
  getOrderInfo(order_id) {
    wx.showLoading({
      title: '请稍候',
      mask: true
    })
    this.setData({
      isShow: false
    })
    var that = this;
    wx.request({
      url: baseUrl + '/index.php?m=default&c=flow&a=get_order_info_by_order_id',
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
        //根据订单进行状态设置status状态码
        that.setStatus(res.data.order[0]);
        if (res.data.order[0].address) {
          that.setData({
            showAddress: false
          })
        } else {
          var info = {};
          info.address = res.data.order[0].address;
          info.consignee = res.data.order[0].consignee;
          info.mobile = res.data.order[0].mobile;
          info.province_name = res.data.order[0].province_name;
          info.city_name = res.data.order[0].city_name;
          info.district_name = res.data.order[0].district_name;
          that.setData({
            showAddress: false,
            addressInfo: info
          })
        }
        that.setData({
          goodsList: res.data.order,
          isShow: true
        })
        that.totalPrice(res.data.order)
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
  //跳转到分享页面
  toActionsShare:function(e){
    //console.log(e)
    wx.navigateTo({
      url: '/pages/actions/actionsShare/actionsShare?act_id=' + e.currentTarget.dataset.actid + '&order_id=' + e.currentTarget.dataset.orderid
    })
  },
  //跳转到团购页面
  toGroup: function (e) {
    //console.log(e)
    let order_id = e.currentTarget.dataset.orderid;
    //获取团长order_id
    wx.request({
      url: baseUrl + '/index.php?m=default&c=flow&a=get_captain_by_order_id',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      method: "POST",
      dataType: 'txt',
      data: {
        session_id: wx.getStorageSync('session_id'),
        order_id: order_id,
        shop_id: shop_id
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        //console.log(res)
        wx.navigateTo({
          url: '/pages/group_purchase/group_purchase?&order_id=' + res
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
  //根据订单进行状态设置status状态码
  setStatus: function (obj) {
    var station = 0, imgSrc = '';
    if (obj.pay_status == 0) {
      imgSrc = '../img/waitforpay.png';
      station = 0;
    } else if (obj.pay_status == 1 && obj.act_type<=0 && obj.status==0 && obj.status != ''){
      //console.log('panduan')
      station = 4;
      imgSrc = '../img/join.png';
    } else if (obj.pay_status == 1 && obj.act_type == 1 && obj.status == 1 && obj.status != '') {
        station = 5;
      imgSrc = '../img/group.jpg';
    } else if (obj.pay_status == 1 && obj.shipping_status == 0) {
      station = 1;
      imgSrc = '../img/waitdelivergoods.png';
    } else if (obj.pay_status == 1 && obj.shipping_status == 1 && obj.collect == 0) {
      station = 2;
      imgSrc = '../img/waitcollectgoods.png';
    } else if (obj.pay_status == 1 && obj.shipping_status == 1 && obj.collect == 1) {
      station = 3;
      imgSrc = '../img/complete.png';
    }
    this.setData({
      status: station,
      imgSrc: imgSrc
    })
    //console.log(this.data.status)
  },
  //计算总价
  totalPrice: function (arr) {
    if (arr[0].total) {
      this.setData({
        total: arr[0].total
      })
    } else {
      var total = 0;
      for (var i = 0; i < arr.length; i++) {
        total += parseFloat(arr[i].shop_price) * arr[i].number
      }
      this.setData({
        total: total
      })
    }


  },
  //付款功能,跳转到支付页面
  toPay: function (e) {
    var order_id = this.data.order_id;
    wx.navigateTo({
      url: '/pages/payCenter/payCenter?order_id=' + order_id
    })
  },
  //取消订单
  delOrder: function () {
    var order_id = this.data.order_id;
    wx.showModal({
      title: '确认删除？',
      content: '删除此订单',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: baseUrl + '/index.php?m=default&c=flow&a=del_goods_by_order_id',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            method: "POST",
            dataType: 'txt',
            data: {
              session_id: wx.getStorageSync('session_id'),
              order_id: order_id,
              shop_id: shop_id
            },
            success: function (res) {
              function Trim(str) {
                return str.replace(/(^\s*)|(\s*$)/g, "");
              }
              res.data = JSON.parse(Trim(res.data));
              //console.log(res)
              if (res.data.message == 'success') {
                getApp().DataChanged = 1;
                wx.showToast({
                  title: '删除成功',
                  icon: 'none'
                })
                wx.navigateBack({
                  delta: 1
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
      }
    })
  },
  toEva: function () {
    wx.navigateTo({
      url: '/pages/goods-evaluate/goods-evaluate?rec_id=',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  queryLogistics: function () {
    wx.navigateTo({
      url: '/pages/logistics/logistics?order_id=' + this.data.order_id,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
 
  getlistProducts: function (index) {
    var that = this;

    wx.request({
      url: baseUrl + '/?c=category&a=getproducts&id=' + index,
      data: {
        shop_id: shop_id
      },
      dataType: 'txt',
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
  //详细页处理函数  需携带good-id 发送到网页中
  toDetailListPage: e => {
    //console.log(e.currentTarget)
    wx.navigateTo({
      url: "/pages/detailPage/detailPage?goods_id=" + e.currentTarget.dataset.goodid,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  confirmCollect: function (e) {
    var order_id = this.data.order_id;
    var that = this;
    wx.showModal({
      title: '确认收货？',
      content: '确认已收到商品？',
      success: function (res) {
        if (res.confirm) {
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
              if (res.data.error == 0) {
                that.getOrderInfo(order_id);
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
        } else if (res.cancel) {
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
    var order_id = options.order_id;
    // order_id = 814;
    //console.log(options.order_id);
    this.setData({
      order_id: order_id
    })
    this.getOrderInfo(order_id);
    this.getlistProducts(2)
  },
  copyNumber: function () {
    wx.setClipboardData({
      data: this.data.orderNumber,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            //console.log(res.data)
          }
        })
      }
    })
  },
  //跳转到退款页面
  refund: function (e) {
    //console.log(e)
    var rec_id = e.currentTarget.dataset.recid;
    wx.navigateTo({
      url: '/pages/refundPage/refundPage?rec_id=' + rec_id,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  //该商品已经申请退款，跳转到退款详情页
  showRefund: function (e) {
    //console.log(e)
    var rec_id = e.currentTarget.dataset.recid;
    wx.navigateTo({
      url: '/pages/refundPage/refundDetail/refundDetail?rec_id=' + rec_id,
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
    if(getApp().DataChanged == 4 && this.dataChanged != getApp().DataChanged)
    {
    this.getOrderInfo(this.data.order_id);
    this.getlistProducts(2);
    }
    this.DataChanged = getApp().DataChanged;
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