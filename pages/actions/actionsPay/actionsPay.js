// pages/shoppingCart/shoppingCart.js
const app = getApp()
var baseUrl = app.globalData.baseHttpUrl;
const shop_id = app.globalData.shop_id;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    carts: [],
    selectAllStatus: true,    // 全选状态，默认全选
    totalPrice: 0,
    count: 0,
    baseUrl: baseUrl,
    showDelIndex: -1,   //删除按钮通过购物车商品数组的索引控制显示隐藏
    startX: null,
    moveX: null

  },
  //进入商品详情页
  toGoodsDetail: function (e) {
    wx.navigateTo({
      url: "/pages/detailPage/detailPage?goods_id=" + e.currentTarget.dataset.goodid,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  //删除购物车中商品
  delGoods: function (e) {
    var rec_id = e.currentTarget.dataset.rec_id,
      that = this;
    wx.showModal({
      title: '确认删除？',
      content: '从购物车中删除此商品',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: baseUrl + '/index.php?m=default&c=flow&a=del_goods_by_rec_id',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            method: "POST",
            dataType: 'txt',
            data: {
              session_id: wx.getStorageSync('session_id'),
              rec_id: rec_id,
              shop_id: shop_id
            },
            success: function (res) {
              //console.log(res)
              function Trim(str) {
                return str.replace(/(^\s*)|(\s*$)/g, "");
              }
              res.data = JSON.parse(Trim(res.data))
              //console.log(res)
              if (res.data.error == 0) {
                // wx.showToast({
                //   title: '删除商品成功',
                //   icon:'success'
                // })
                that.getCartInfo();
                that.setData({
                  showDelIndex: -1
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
        } else {
          //console.log('用户取消了删除！')
        }
      },

    })
    //console.log(e)
  },
  //计算购买商品类型数量
  goodsCount: function () {
    var cartsArr = this.data.carts;
    var count = 0;
    for (var i = 0; i < cartsArr.length; i++) {
      if (cartsArr[i].selected) {
        count += 1;
      }
    }
    this.setData({
      count: count
    })
  },
  //右滑删除，手指触摸屏幕开始
  touchS: function (e) {
    if (e.touches.length == 1) {
      this.setData({
        //记录触摸起始位置的X坐标
        startX: e.touches[0].clientX,
        moveX: null
      });
    }
  },
  //右滑删除，手指触摸屏幕并开始移动
  touchM: function (e) {
    var moveX = e.touches[0].clientX;
    //计算手指起始点的X坐标与当前触摸点的X坐标的差值
    this.setData({
      //记录触摸起始位置的X坐标
      moveX: e.touches[0].clientX
    });
  },
  //右滑删除，手指离开屏幕
  touchE: function (e) {
    var startX = this.data.startX,
      moveX = this.data.moveX;
    //console.log(startX)
    //console.log(moveX == null)
    if (startX - moveX > 100 && moveX != null) {
      this.setData({
        showDelIndex: e.currentTarget.dataset.index,
        moveX: null,
        startX: null
      })
    } else {
      this.setData({
        showDelIndex: -1,
        moveX: null,
        startX: null
      })
    }

  },
  //计算购物车选中商品的总价
  total: function () {
    var cartsArr = this.data.carts;
    var total = 0;
    for (var i = 0; i < cartsArr.length; i++) {
      if (cartsArr[i].selected) {
        var price;
       
        cartsArr[i].goods_discount ? price = cartsArr[i].shop_price - cartsArr[i].goods_discount : price = cartsArr[i].shop_price;
        // var price = cartsArr[i].shop_price
        total += cartsArr[i].number * price;
      }
    }
    this.setData({
      totalPrice: total
    })
    this.goodsCount();
  },
  //增加商品数量
  add: function (e) {
    var index = e.target.dataset.index;
    var num = e.target.dataset.num;
    num++;
    if (num >= 999) {
      num = 999;
    }
    // //console.log(num)
    //console.log(this.data.carts[index].number)
    this.data.carts[index].number = num;
    this.setData({
      carts: this.data.carts
    })
    this.total()
  },
  //减少商品数量
  reduce: function (e) {
    var index = e.target.dataset.index;
    var num = e.target.dataset.num;
    num--;
    if (num <= 0) {
      num = 1;
    }
    this.data.carts[index].number = num;
    this.setData({
      carts: this.data.carts
    })
    this.total()
  },
  keyUpInput: function (e) {
    //console.log(e)
    var val = e.detail.value,
      index = e.currentTarget.dataset.index;
    //console.log(index, val)
    if (val > 999) {
      this.data.carts[index].number = 999;
      this.setData({
        carts: this.data.carts
      })
    } else if (val <= 0 && val != '') {
      this.data.carts[index].number = 1;
      this.setData({
        carts: this.data.carts
      })
    } else {
      this.data.carts[index].number = val;
      this.setData({
        carts: this.data.carts
      })
    }
    this.total()
  },
  inputFocus: function (e) {
    var val = e.detail.value,
      index = e.currentTarget.dataset.index;
    //console.log(index, val)
    if (val == '') {
      this.data.carts[index].number = 1;
      this.setData({
        carts: this.data.carts
      })
      this.total();
    }

  },
  //选中，取消选择的商品
  goodsSelected: function (e) {
    var index = e.target.dataset.index;
    this.data.carts[index].selected = !this.data.carts[index].selected;
    this.setData({
      carts: this.data.carts
    })
    this.total();
  },
  //全选，全不选
  chengeChecked: function (e) {
    var checked = !this.data.selectAllStatus;
    for (var i = 0; i < this.data.carts.length; i++) {
      this.data.carts[i].selected = checked;
    }
    this.setData({
      selectAllStatus: checked,
      carts: this.data.carts
    })
    this.total();
    //console.log(this.data.selectAllStatus)
  },
  //生成新订单，获取新订单id
  getOrderId: function () {

  },
  //计算购物车中选中的商品，跳转到订单详情页面
  payGoods: function () {
    if (this.data.carts.length > 0) {
      var carts = this.data.carts;
      var orderArr = [];
      for (var i = 0; i < carts.length; i++) {
        if (carts[i].selected == true) {
          orderArr.push(carts[i])
        }
      }
      if (orderArr.length > 0) {
        wx.showLoading({
          title: '请稍候',
        })
        wx.request({
          url: baseUrl + '/index.php?m=default&c=flow&a=insert_order_info_and_actions',
          method: "POST",
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          // dataType:'txt',
          data: {
            session_id: wx.getStorageSync('session_id'),
            shop_id: shop_id
          },
          success: function (res) {
            //console.log(res)
            //console.log(res.data)
            //console.log(typeof res.data)
            // function Trim(str) {
            //   return str.replace(/(^\s*)|(\s*$)/g, "");
            // }
            if (parseInt(res.data) <= 0){
              wx.showToast({
                title: '操作失败，请重试',
                icon: 'none'
              })
              return 
            }
            var orderId = parseInt(res.data);   //获取订单order_id
            //console.log(orderId)
            if (orderId > 0) {
              var count = 0;
              for (var j = 0; j < orderArr.length; j++) {
                //console.log(orderArr)
                //console.log(orderArr[j].goods_attr)
                wx.request({
                  url: baseUrl + '/index.php?m=default&c=flow&a=insert_goods_by_order_id',
                  // url: baseUrl + "/index.php?m=default&c=flow&a=get_cart_info",
                  method: "POST",
                  header: { 'content-type': 'application/x-www-form-urlencoded' },
                  dataType: 'txt',
                  data: {
                    session_id: wx.getStorageSync('session_id'),
                    order_id: orderId,
                    goods_id: orderArr[j].goods_id,
                    goods_attr_id: orderArr[j].goods_attr_id,
                    goods_number: orderArr[j].number,
                    goods_price: orderArr[j].shop_price,
                    rec_id: orderArr[j].rec_id,
                    goods_attr: orderArr[j].goods_attr,
                    shop_id: shop_id
                  },
                  success: function (res) {
                    function Trim(str) {
                      return str.replace(/(^\s*)|(\s*$)/g, "");
                    }
                    res.data = JSON.parse(Trim(res.data));
                    //console.log(res.data)
                    if (res.data > 0) {
                      count++;
                      if (count == orderArr.length) {
                        //插入成功后，通过order_Id，将关联的活动商品需要达成的条件数量插入到对应的act表里
                        wx.request({
                          url: baseUrl + "/index.php?m=default&c=flow&a=insert_headcount_to_act",
                          method: "POST",
                          dataType: 'txt',
                          header: { 'content-type': 'application/x-www-form-urlencoded' },
                          data: {
                            session_id: wx.getStorageSync('session_id'), 
                            order_id: orderId,
                            shop_id: shop_id
                          },
                          success: function (res) {
                            //console.log(res)
                            function Trim(str) {
                              return str.replace(/(^\s*)|(\s*$)/g, "");
                            }
                            res.data = JSON.parse(Trim(res.data));
                            if(res.data.error == 0){
                              wx.hideLoading();
                              wx.redirectTo({
                                url: '/pages/payCenter/payCenter?order_id=' + orderId
                              })
                            }else{
                              wx.showToast({
                                title: '生成活动订单错误，请重试',
                                icon:'none'
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
                        // app.globalData.prevOrderId = orderId;
                       
                      }
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
            } else {
              wx.showToast({
                title: '订单生成失败，请重试',
                icon: 'none'
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
      } else {
        wx.showToast({
          title: '当前未选择商品',
          icon: 'none'          
        })
      }
    }
  },
  getCartInfo: function () {
    wx.showLoading({
      title: '请稍候',
      mask: true
    })
    var that = this;
    var a = wx.getStorageSync('session_id');
    //console.log(a)
    wx.request({
      url: baseUrl + "/index.php?m=default&c=flow&a=get_cart_info",
      method: "POST",
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: { 
        session_id: wx.getStorageSync('session_id'),
        shop_id: shop_id
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data));
        //console.log(res.data)
        if (res.data.length > 0) {
          var result = res.data;
          for (var i = 0; i < result.length; i++) {
            result[i].selected = true;
          }

          that.setData({
            carts: result
          })
          that.total();
        } else {
          that.setData({
            carts: []
          })
        }
        wx.hideLoading()
        // //console.log(that.data.carts)
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
  //跳转到优惠券揭秘那
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   getApp().parseInviter(options);
    // //console.log(456)


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

    this.getCartInfo();
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
    this.getCartInfo();
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
  },

})