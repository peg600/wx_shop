// pages/actions/actionsJoin/actionsJoin.js
const app = getApp()
var baseUrl = app.globalData.baseHttpUrl;
const shop_id = app.globalData.shop_id;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userJoinList: [],
    isJoin: false,
    orderInfo: {},
    timer: '',
    isShowRule: false,
    isClick:true,
    headCount:0,
    discount:0,
    joinCount:0,
    picURL:"",
    startTime:"",
    goodsNumber:0,
    ptPrice:"",
    bargainPrice:"",
    new_data: [], //首页上新数据，只取前8个
    hotTypePage: 1,
  },
  //返回首页
  ReturnIndex: function () {
    wx.switchTab({
      url: '/pages/New/index',
    })
  },
  //获取用户授权后的信息，同意后执行帮助点赞
  onGotUserInfo: function (e) {
    if (!this.data.isClick){
        wx.showToast({
          title: '该活动已结束',
          icon:'none'
        })
        return 
    }
    var that = this;
    if (e.detail.userInfo) {
      var userInfo = e.detail.userInfo;
      this.setData({
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        city: userInfo.city,
        country: userInfo.country,
        gender: userInfo.gender,
        province: userInfo.province
      })
      wx.request({
        url: baseUrl + "/index.php?m=default&c=flow&a=join_actions_times",
        method: "POST",
        dataType: 'txt',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        data: { 
          session_id: wx.getStorageSync('session_id'), 
          user_name: userInfo.nickName, 
          avatar_url: userInfo.avatarUrl, 
          act_id: this.data.act_id,
          shop_id: shop_id
        },
        success: function (res) {
          //console.log(res)
          function Trim(str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
          }
          res.data = JSON.parse(Trim(res.data));
          if (res.data.error == 0) {
            wx.showToast({
              title: '成功',
              icon: 'success'
            })
            that.getJoinInfo(that.data.act_id)
          } else if (res.data.error == 1) {
            wx.showToast({
              title: '您已经参与过了！',
              icon: 'none'
            })
          } else if (res.data.error == 2) {
            wx.showToast({
              title: '获取用户信息失败，请重试',
              icon: 'none'
            })
          } else if (res.data.error == 2) {
            wx.showToast({
              title: '用户信息存在，但帮助失败（插入数据失败）',
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
        title: '授权失败，无法为好友助力！',
        icon: 'none'
      })
    }
  },
  //获取用户信息，同意后帮其包办
  baoBan: function () {
    wx.showModal({
      title: '',
      content: '暂无功能',
    })
    var that = this;
    // if (e.detail.userInfo) {
    //   var userInfo = e.detail.userInfo;
    //   this.setData({
    //     nickName: userInfo.nickName,
    //     avatarUrl: userInfo.avatarUrl,
    //     city: userInfo.city,
    //     country: userInfo.country,
    //     gender: userInfo.gender,
    //     province: userInfo.province
    //   })
    //   wx.request({
    //     url: baseUrl + "/index.php?m=default&c=flow&a=join_actions_times",
    //     method: "POST",
    //     dataType: 'txt',
    //     header: { 'content-type': 'application/x-www-form-urlencoded' },
    //     data: { session_id: wx.getStorageSync('session_id'), user_name: userInfo.nickName, avatar_url: userInfo.avatarUrl, act_id: this.data.act_id },
    //     success: function (res) {
    //       //console.log(res)
    //       function Trim(str) {
    //         return str.replace(/(^\s*)|(\s*$)/g, "");
    //       }
    //       res.data = JSON.parse(Trim(res.data));
    //       if (res.data.error == 0) {
    //         wx.showToast({
    //           title: '成功',
    //           icon: 'success'
    //         })
    //         that.getJoinInfo(that.data.act_id)
    //       } else if (res.data.error == 1) {
    //         wx.showToast({
    //           title: '您已经参与过了！',
    //           icon: 'none'
    //         })
    //       } else if (res.data.error == 2) {
    //         wx.showToast({
    //           title: '获取用户信息失败，请重试',
    //           icon: 'none'
    //         })
    //       } else if (res.data.error == 2) {
    //         wx.showToast({
    //           title: '用户信息存在，但帮助失败（插入数据失败）',
    //           icon: 'none'
    //         })
    //       }
    //     }
    //   })
    // } else {
    //   wx.showToast({
    //     title: '授权失败，无法为好友助力！',
    //     icon: 'none'
    //   })
    // }
  },
  //关闭规则
  closeRule: function () {
    //console.log('close')
    this.setData({
      isShowRule: false
    })
  },
  //开启规则
  showRule: function () {
    //console.log(123)
    this.setData({
      isShowRule: true
    })
  },
  //拆散
  breakComb: function (e) {
    if (!this.data.isClick) {
      wx.showToast({
        title: '该活动已结束',
        icon:'none'
      })
      return
    }
    var that = this;
    if (e.detail.userInfo) {
      var userInfo = e.detail.userInfo;
      this.setData({
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        city: userInfo.city,
        country: userInfo.country,
        gender: userInfo.gender,
        province: userInfo.province
      })
      wx.request({
        url: baseUrl + "/index.php?m=default&c=flow&a=break_actions_times",
        method: "POST",
        dataType: 'txt',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        data: { 
          session_id: wx.getStorageSync('session_id'), 
          user_name: userInfo.nickName, 
          avatar_url: userInfo.avatarUrl, 
          act_id: this.data.act_id,
          shop_id: shop_id
        },
        success: function (res) {
          //console.log(res)
          function Trim(str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
          }
          res.data = JSON.parse(Trim(res.data));
          if (res.data.error == 0) {
            wx.showToast({
              title: '成功',
              icon: 'success'
            })
            that.getJoinInfo(that.data.act_id)
          } else if (res.data.error == 1) {
            wx.showToast({
              title: '您已经参与过了！',
              icon: 'none',
            })
          } else if (res.data.error == 2) {
            wx.showToast({
              title: '',
              content: '获取用户信息失败，请重试',
            })
          } else if (res.data.error == 3) {
            wx.showToast({
              title: '',
              content: '用户信息存在，但帮助失败（插入数据失败）',
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
      wx.showModal({
        title: '',
        content: '授权失败，无法为好友助力！',
      })
    }
  },
  //根据rec_id获取当前该订单的参与情况
  getJoinInfo: function (act_id) {
    var that = this;
    wx.request({
      url: baseUrl + "/index.php?m=default&c=flow&a=get_join_actions_info",
      method: "POST",
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: { 
        act_id: act_id,
        shop_id: shop_id
      },
      success: function (res) {
        //console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data));
        that.setData({
          userJoinList: res.data.result
        })
        var joinCount = 0;
        res.data.result.forEach(function(item,index){
          if(item.think_cool == 1){
            joinCount++;
          }
        })
        that.setData({
          joinCount: joinCount
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
  //获取当前登录用户的user_id
  getUserId: function () {
    var that = this;
    wx.request({
      url: baseUrl + "/index.php?m=default&c=flow&a=get_user_id_by_session_id",
      method: "POST",
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: { 
        session_id: wx.getStorageSync('session_id'),
        shop_id: shop_id
      },
      success: function (res) {
        //console.log(res)
        that.setData({
          user_id: res.data
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
  //根据act_id获取当前订单、购买人信息(活动发起者)
  getOrderInfo: function (act_id) {
    var that = this;

    wx.showLoading({
      title: '请稍候',
    })
    wx.request({
      url: baseUrl + "/index.php?m=default&c=flow&a=get_orderinfo_by_act_id",
      method: "POST",
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: { 
        act_id: act_id,
        shop_id: shop_id
      },
      success: function (res) {
        //console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data));
        //console.log(res.data)  //看有无pic
        that.setData({
          orderInfo: res.data,
          picURL: res.data.picURL,
          startTime: res.data.created_time.split(" ")[0],
          bargainPrice: res.data.total,
          // bargainPrice: parseInt(res.data.total * 0.9)
        })
        wx.request({   //获取订单中的商品数量
          url: baseUrl + "/index.php?m=default&c=flow&a=get_order_info_by_act_id",
          method: "POST",
          dataType: 'txt',
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          data: { 
            order_id: res.data.order_id,
            shop_id: shop_id
          },
          success: function (res) {
            function Trim(str) {
              return str.replace(/(^\s*)|(\s*$)/g, "");
            }
            res.data = JSON.parse(Trim(res.data));
            //console.log(res.data)
            let num = 0;
            let ptPriceTotal = 0;
            for(let i=0;i<res.data.length;i++) {
              num += parseInt(res.data[i].goods_number);
              ptPriceTotal += parseInt(res.data[i].shop_price);
            }
            that.setData({
              goodsNumber: num,
              discount:Math.floor((ptPriceTotal - that.data.bargainPrice) * 100) / 100,
              ptPrice: ptPriceTotal
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
        if (res.data.status == 2) {
          that.setData({
            timer: '该订单已失效',
            isClick: false
          })
        } else if (res.data.status == 1) {

        } else if (res.data.status == 0) {
          that.countDown()
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
        wx.hideLoading();
      }
    })
  },
  //计算活动倒计时
  countDown: function () {
    var that = this;
    var created_time = that.data.orderInfo.created_time;
    //console.log(typeof created_time)
    var hCreated = Date.parse(created_time.replace(/-/g, "/"));        //null
    var countDownTime = 86400000;
    var timer = setInterval(function () {
      // //console.log(created_time)
      // //console.log(hCreated)
      var daojishi = countDownTime - (Date.parse(Date()) - hCreated);
      var houer = parseInt(daojishi / 3600000);
      var minute = parseInt((daojishi - houer * 3600000) / 60000);
      var second = parseInt((daojishi - houer * 3600000 - minute * 60000) / 1000);
      if (Date.parse(Date()) - hCreated >= countDownTime) {
        clearInterval(timer)
        that.setData({
          timer: '该订单已失效',
          isClick:false
        })
        wx.request({
          url: baseUrl + '/index.php?m=default&c=flow&a=expired_action',
          header: { "Content-Type": "application/x-www-form-urlencoded" },
          method: 'POST',
          data: {
            act_id: that.data.act_id,
            session_id: wx.getStorageSync('session_id'),
            shop_id: shop_id
          },
          dataType: 'txt',
          success: function (res) {
            //console.log(res)
            function Trim(str) {
              return str.replace(/(^\s*)|(\s*$)/g, "");
            }
            res.data = JSON.parse(Trim(res.data));
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
        // //console.log(typeof houer)
        // //console.log(typeof minute)
        // //console.log(typeof second)
        that.setData({
          // timer: houer + ':' + minute + ':' + second
          timer: houer + ":" + minute + ":" + second
        })
      }
    }, 1000)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getApp().parseInviter(options);
    //options.act_id = 366;
    var that = this;
    if (options.act_id) {
      //console.log(options.act_id)
      this.setData({
        act_id: options.act_id
      })
      
      this.getUserId();
    } else {
      wx.switchTab({
        url: '/pages/New/index'
      })
    }
    // wx.login({
    //   success:function(res){
    //     //console.log(res)
    //   }
    // })
    // 可以通过 wx.getSetting 先查询一下用户是否授权了 "scope.record" 这个 scope
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          wx.authorize({
            scope: 'scope.userInfo',
            success() {
              //console.log('this is success')
            },
            fail() {
              //console.log('this is fail')
            }
          })
        }
      }
    })

    wx.request({      //获得热销商品
      url: baseUrl + '/?c=category&a=getproducts',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType: 'txt',
      data: {
        page: that.data.hotTypePage,
        type: "hot",
        shop_id: shop_id
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data));
        //console.log(res.data)
        if (!res && res.data.list.length == 0) {
          return
        }
        //console.log(res.data.list)
        that.setData({
          new_data: res.data.list,
          hidden: true
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getJoinInfo(this.data.act_id);
    this.getOrderInfo(this.data.act_id);
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
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  goToFitview() {
    wx.switchTab({
      url: '/pages/takephoto/takephoto',
    })
  },
  
  goHome() {
    wx.switchTab({
      url: '/pages/New/index',
    })
  },

  //详细页处理函数  需携带good-id 发送到网页中
  toDetailListPage: e => {
    //console.log(e.currentTarget)
    wx.setStorage({
      key: 'goods_id',
      data: e.currentTarget.dataset.goodid,
    })
    wx.navigateTo({
      url: "/pages/detailPage/detailPage?goods_id=" + e.currentTarget.dataset.goodid,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var params = getApp().getShareParams();
    return params;
  }
})