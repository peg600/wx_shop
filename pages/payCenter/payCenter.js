// pages/payCenter/payCenter.js 
var app = getApp();
var baseUrl = app.globalData.baseHttpUrl;
const shop_id = app.globalData.shop_id;
Page({

  /**
   * 页面的初始数据 
   */
  data: {
    shop: "Holo",
    curAddressData: true,
    code: 0,
    cartlist: [],
    totalPrice: 0,
    orderId: 0,
    promotion: 0,
    promotionValue:0,
    baseUrl: baseUrl,
    addressInfo: {},
    isActions:0,            //是否参加了活动，0为未参加，1为参加了
    act_id:0,
    readToPay:0,
    buyNow: true,
    inPosting:false,
    isClickActions: false,

    act_type: "",   //所参加的活动类别
    act_price: ""   //商品活动价格
  },
  addAddress: function () {
    wx.navigateTo({
      url: "/pages/address-add/addressAdd"
    })
  },
  //跳转到地址页面地址列表
  selectAddress:function(){
    wx.navigateTo({
      url: '/pages/address/address?order_id='+this.data.orderId,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  toggleRule: function () {
    this.setData({
      isClickActions: !this.data.isClickActions
    })
  },

  toActions: function (e) {
 
    if(this.inPosting)
      return;
    if (e.detail.userInfo) {
      this.inPosting = true;
    
      var that = this;
      var userInfo = e.detail.userInfo;
      var that = this;
      wx.request({
        url: baseUrl + '/index.php?m=default&c=flow&a=insert_userinfo_by_user_id',
        method: 'POST',
        dataType: 'txt',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
          session_id: wx.getStorageSync('session_id'),
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          city: userInfo.city,
          country: userInfo.country,
          gender: userInfo.gender,
          province: userInfo.province,
          shop_id: shop_id
        },
        success: function (res) {
          //console.log(res)
          function Trim(str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
          }
          res.data = JSON.parse(Trim(res.data));
          if (res.data.error == 0) {
            that.createOrder();
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
          that.inPosting = false;
        }
      })
    }
    
  },

  //计算订单内商品总价
  totalPrice: function () {
    var goodsList = this.data.cartlist;
    //console.log('goodsList', goodsList)
    var total = 0;
    for (var i = 0; i < goodsList.length; i++) {
      var price;
      goodsList[i].act_id ? price = goodsList[i].bargain_price : price = goodsList[i].shop_price;
      total += goodsList[i].number * price;
    }
    this.setData({
      totalPrice: total,
      readToPay:1
    });

    if(this.data.promotion > 0)
    {
      var promotion = Math.floor(total * this.data.promotion * 100) /100;
      this.setData({
        promotionValue: promotion,
      });
    }
  },

  getPromotion:function() {
    var that = this;
    wx.request({
      url: baseUrl + '/index.php?c=flow&a=getPromotionByUser',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType: 'txt',
      data: {
        session_id: wx.getStorageSync('session_id'),
        shop_id: shop_id
      },
      success: function (res) {
        //console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data));
        var promotion = parseFloat(res.data.count);
        that.setData({
          promotion: promotion
        });

        if (that.data.totalPrice > 0) {
          var promotion1 = Math.floor(that.data.totalPrice * promotion * 100) / 100;
          that.setData({
            promotionValue: promotion1,
          });
        }
      }
    });
  },

  //根据订单order_id获取订单内物品信息
  getOrderGoods: function (orderId) {
    var that = this;
    console.log(orderId)
  
    wx.request({
      url: baseUrl + '/index.php?c=flow&a=get_goods_by_order_id',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType: 'txt',
      data: {
        session_id: wx.getStorageSync('session_id'),
        order_id: orderId
      },
      success: function (res) {
        console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data));
        console.log(res.data)
        if (res.data[0].act_id && res.data[0].act_id>0){
          that.setData({
            isActions:1,
            act_id: res.data[0].act_id
          })
        }
        //此处用商品地址判断不对
        if(!res.data[0].address){
          that.getDefaultAddress(wx.getStorageSync('session_id'));
          // that.getAdressByAdressId(res.data[0].address_id);
        }else{
          //console.log('有地址');
          var objAdd = {};
          objAdd.province_name = res.data[0].province_name;
          objAdd.city_name = res.data[0].city_name;
          objAdd.district_name = res.data[0].district_name;
          objAdd.address = res.data[0].address;
          objAdd.consignee = res.data[0].consignee;
          objAdd.mobile = res.data[0].mobile;
          //console.log(res.data[0].province_name)
          that.setData({
            addressInfo:objAdd,
            curAddressData:false,
            
          })
          //console.log(that.data.addressInfo)
          
        }
        that.setData({
          cartlist: res.data
        })
        //console.log(that.data.cartlist)
        // that.setData({
        //   cartlist: res.data
        // })
        that.totalPrice();
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
  createOrder: function (e) {
    var that = this;
    //console.log(this.data.orderId)
    //console.log(this.data.curAddressData)
    if (this.data.curAddressData == true) {
      wx.showToast({
        title: '请先选择收货地址',
        icon: 'none',
        mask: true
      })
      return
    }
    var order_id = this.data.orderId;
    wx.showLoading({
      title: '请稍候',
    })
    // 判断订单是否参加团购活动，并判断活动是否有效，若无效则跳转
    wx.request({
      url: baseUrl + '/index.php?m=default&c=flow&a=is_in_group_purchase',
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        session_id: wx.getStorageSync('session_id'),
        shop_id: shop_id,
        order_id: order_id
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        console.log(res);
        if(res.act_type == '1') {   //若为团购
          if(res.message == 'full') {
            // wx.showToast({
            //   title: '该团人数已满',
            //   duration: 2000
            // })
            wx.navigateTo({
              url: `/pages/group_purchase_join/group_purchase_join?order_id=${res.captain_order_id}`,
            })
          } else if (res.message == 'success') {
            let hCreated = Date.parse(res.act_info.act_start_time.replace(/-/g, "/"));
            that.pay();
          }
        }else{    //普通购买
          that.pay();
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
      complete: function () {

      }
    })
  },

  pay() {
    let order_id = this.data.orderId;
    wx.request({
      url: baseUrl + '/index.php?m=default&c=flow&a=test_pay',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType: 'txt',
      data: {
        session_id: wx.getStorageSync('session_id'),
        province_name: this.data.addressInfo.province_name,
        city_name: this.data.addressInfo.city_name,
        district_name: this.data.addressInfo.district_name,
        address: this.data.addressInfo.address,
        consignee: this.data.addressInfo.consignee,
        mobile: this.data.addressInfo.mobile,
        order_id: order_id,
        shop_id: shop_id
      },
      success: function (res) {

        //console.log(wx.getStorageSync('session_id'))
        console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data))
        //console.log(res.data)
        var total = res.data.total;
        var form_id = res.data.package;
        wx.requestPayment({
          timeStamp: res.data.timeStamp,
          nonceStr: res.data.nonceStr,
          package: res.data.package,
          signType: 'MD5',
          paySign: res.data.paySign,
          success: function (res) {
            //console.log(res)
            //console.log("success")
            wx.request({
              url: baseUrl + '/index.php?c=flow&a=change_pay_status',
              method: 'POST',
              dataType: 'txt',
              header: { 'content-type': 'application/x-www-form-urlencoded' },
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
                res.data = Trim(res.data);
                console.log(res)
                //console.log('成功了，可以跳转了')
                if (res.data == 'success') {
                  wx.redirectTo({
                    url: '/pages/order-pay/order-pay?order_id=' + order_id
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
          },
          fail: function (res) {
            wx.showToast({
              title: '支付失败，请重试',
            })
            //console.log(res)
            //console.log("fail")
          },
          complete: function (res) {
            //console.log(res)
            //console.log("complete")
          }
        })
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
 
  //获取用户设置的默认地址
  getDefaultAddress: function (session_id) {
    var that = this;
    wx.request({
      url: baseUrl + '/index.php?c=flow&a=get_default_address',
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        session_id: session_id,
        shop_id: shop_id
      },
      success: function (res) {
        //console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data));
        //console.log(res.data)
        //console.log(res.data.address)
        if (res.data.address) {
          that.setData({
            addressInfo: res.data.address,
            curAddressData: false
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
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getApp().parseInviter(options);
    console.log(options)
   
    if(options.from === "buyfriend") {
      this.setData({
        buyNow: false
      });
    }
    if(options.pic) {
      //console.log(options.pic)
      wx.setStorage({
        key: 'picURL',
        data: options.pic
      })
    }
    if (options.act_type) {
      this.setData({
        act_type: options.act_type
      });
    }
    if (options.act_price) {
      this.setData({
        act_price: options.act_price
      });
    }
    var orderId = options.order_id;
    var session_id = wx.getStorageSync('session_id');
    this.setData({
      orderId: orderId
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
    this.getPromotion();
    this.getOrderGoods(this.data.orderId);

    getApp().DataChanged = 3;
    
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