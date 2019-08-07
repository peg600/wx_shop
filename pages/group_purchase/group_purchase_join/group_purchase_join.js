// pages/group_purchase/group_purchase_join/group_purchase_join.js

const app = getApp()
var baseUrl = app.globalData.baseHttpUrl;
var htmlUrl = app.globalData.htmlUrl;
const shop_id = app.globalData.shop_id;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods_id: "220",
    captain_order_id: "",
    current_order_info: {},
    goods_info: {},
    users_info: {},
    users_number:{},
    group_list: {},
    show_rule: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.order_id) {
      this.setData({
        captain_order_id: options.order_id
      })
    }

    let that = this;
    
    // 根据团长order_id获取拼团用户信息
    wx.request({
      url: baseUrl + '/index.php?c=flow&a=get_group_users_by_order_id',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType: 'txt',
      data: {
        session_id: wx.getStorageSync('session_id'),
        // order_id: 1753,
        order_id: that.data.captain_order_id,
        shop_id: shop_id
      },
      success: function (res) {
        //console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        that.setData({
          users_info: res
        })
        console.log(that.data.users_info)
      }
    });

    // 根据团长order_id获得现有团内人数
    wx.request({
      url: baseUrl + '/index.php?c=flow&a=get_group_users_number_by_order_id',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType: 'txt',
      data: {
        session_id: wx.getStorageSync('session_id'),
        // order_id: 1753,
        order_id: that.data.captain_order_id,
        shop_id: shop_id
      },
      success: function (res) {
        //console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        that.setData({
          users_number: res
        })
  
        console.log(that.data.users_number)
      }
    });

    // 根据团长order_id获取该团及所属的拼团活动及商品的信息
    wx.request({
      url: baseUrl + '/index.php?c=flow&a=get_group_purchase_order_info_by_order_id',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType: 'txt',
      data: {
        session_id: wx.getStorageSync('session_id'),
        // order_id: 1753,
        order_id: that.data.captain_order_id,
        shop_id: shop_id
      },
      success: function (res) {
        //console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        let starttime = res[0].act_start_time.replace(new RegExp("-", "gm"), "/");
        res[0].act_start_time_sec = (new Date(starttime)).getTime();
        that.setData({
          current_order_info: res[0]
        })
        console.log(that.data.current_order_info)
        that.countDown("current_order_info", that.data.current_order_info,undefined)

        // 获取团购商品信息
        wx.request({
          url: baseUrl + '/index.php?c=flow&a=get_act_goods_info',
          method: 'POST',
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          dataType: 'txt',
          data: {
            act_id: that.data.current_order_info.act_id,
            act_type: that.data.current_order_info.act_type,
            order_id: that.data.current_order_info.order_id,
          },
          success: function (res) {
            //console.log(res)
            function Trim(str) {
              return str.replace(/(^\s*)|(\s*$)/g, "");
            }
            res = JSON.parse(Trim(res.data));
            res[0].goods_img = `${baseUrl}/${res[0].goods_img}`;
            that.setData({
              goods_info: res[0]
            })
            console.log(that.data.goods_info)
          }
        });
      }
    });

    //获取部分团购设置及其下拼单中的团的团长订单信息
    wx.request({
      url: baseUrl + '/index.php?c=flow&a=get_group_purchase_captain_order_info_by_act_id',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType: 'txt',
      data: {
        session_id: wx.getStorageSync('session_id'),
        act_id: 1,
        shop_id: shop_id
      },
      success: function (res) {
        //console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        console.log(res)
        for (let i = 0; i < res.length; i++) {
          // res[i].avatar_url = `${baseUrl}/${res[i].avatar_url}`;
          //根据团长order_id获取拼团组员人数
          wx.request({
            url: baseUrl + '/index.php?c=flow&a=get_group_purchase_number_by_order_id',
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            dataType: 'txt',
            data: {
              session_id: wx.getStorageSync('session_id'),
              order_id: res[i].order_id,
              shop_id: shop_id
            },
            success: function (res2) {
              //console.log(res)
              function Trim(str) {
                return str.replace(/(^\s*)|(\s*$)/g, "");
              }
              res2 = JSON.parse(Trim(res2.data));
              res[i].member_number = res2[0].member_number;
              res[i].need_number = parseInt(res[i].group_number) - parseInt(res[i].member_number) - 1;
              
              that.setData({
                group_list: res
              })
              that.countDown("group_list",res,i)
            }
          });
        }
      }
    });
  },

  showRule:function() {
    this.setData({
      show_rule: true
    })
  },
  hideRule: function () {
    this.setData({
      show_rule: false
    })
  },

  //倒计时函数，传入相应的拼团对象
  countDown: function (objName,obj,i) {
    var that = this;
    if(i !== undefined) {
      var act = obj[i];
    }else{
      var act = obj;
    }
    var created_time = act.act_start_time;
    var hCreated = Date.parse(created_time.replace(/-/g, "/"));        //null
    var countDownTime = act.expire_day * 86400000 + act.expire_hour * 3600000 + act.expire_minute * 60000;
    var timer = setInterval(function () {
      var daojishi = countDownTime - (Date.parse(Date()) - hCreated);
      var hour = parseInt(daojishi / 3600000);
      var minute = parseInt((daojishi - hour * 3600000) / 60000);
      var second = parseInt((daojishi - hour * 3600000 - minute * 60000) / 1000);
      if (Date.parse(Date()) - hCreated >= countDownTime) {
        clearInterval(timer)
        act.timer = '';
        let str = '';
        if (i !== undefined) {
          str = `${objName}[${i}].timer`;
        } else {
          str = `${objName}.timer`;
        }
        that.setData({
          [str]: act.timer
        })
        // that.setData({
        //   timer: '该订单已失效',
        //   isClick: false
        // })
        // wx.request({
        //   url: baseUrl + '/index.php?m=default&c=flow&a=expired_action',
        //   header: { "Content-Type": "application/x-www-form-urlencoded" },
        //   method: 'POST',
        //   data: {
        //     act_id: that.data.act_id,
        //     session_id: wx.getStorageSync('session_id'),
        //     shop_id: shop_id
        //   },
        //   dataType: 'txt',
        //   success: function (res) {
        //     //console.log(res)
        //     function Trim(str) {
        //       return str.replace(/(^\s*)|(\s*$)/g, "");
        //     }
        //     res.data = JSON.parse(Trim(res.data));
        //   },
        //   fail: function (err) {
        //     //console.log(err)
        //     wx.showToast({
        //       title: '请求失败，请检查网络重试',
        //       icon: 'none',
        //       duration: 2000
        //     })
        //   }
        // })
      } else {
        clearInterval(timer);
        act.timer = hour + ":" + minute + ":" + second;
        let str = '';
        if (i !== undefined) {
          str = `${objName}[${i}].timer`;
        } else {
          str = `${objName}.timer`;
        }
        that.setData({
          [str]: act.timer
        })
        that.countDown(objName,obj,i);
      }
    }, 1000)
  },

  gotoDetail() {
    wx.navigateTo({
      url: "/pages/detailPage/detailPage?goods_id=" + this.data.current_order_info.goods_id,
    })
  },

  joinGroup(e) {
    let order_info = {};
    if(e.currentTarget.dataset.order_info) {
      order_info = e.currentTarget.dataset.order_info;
    }else{
      order_info = this.data.current_order_info;
    }
    console.log(order_info)
    console.log(this.data.goods_info)
    let goods_id = order_info.goods_id;
    let top_order_id = order_info.order_id;
    wx.navigateTo({
      url: `/pages/detailPage/detailPage?goods_id=${goods_id}&top_order_id=${top_order_id}`,
    })


    // let number = 1;

    // var goodsList = [];
    // var goods_product = {
    //   "goods_id": goods_id,
    //   "goods_attr_id": this.data.goods_info.goods_attr_id
    // };
    // goodsList.push(goods_product);
    // var goodsObject = {};
    // goodsObject.session_id = wx.getStorageSync('session_id');
    // goodsObject.goods_id = JSON.stringify(goodsList);
    // goodsObject.inviter = undefined;
    // goodsObject.number = number;
    // goodsObject.from = "miniprogram";
    // goodsObject.shop_id = shop_id;
    // goodsObject.act_type = order_info.act_type;
    // goodsObject.act_id = order_info.act_id;
    // goodsObject.top_order_id = order_info.order_id;
    // this.getOrderId(goodsObject, baseUrl);
  },

  getOrderId(goodsObject, baseUrl) {
    console.log(goodsObject)
    wx.request({
      url: baseUrl + '/index.php?m=default&c=flow&a=shop_now_by_action',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      dataType: 'txt',
      data: {
        session_id: goodsObject.session_id,
        goods_id: goodsObject.goods_id,
        inviter: goodsObject.inviter,
        number: goodsObject.number,
        from: goodsObject.from,
        shop_id: goodsObject.shop_id,
        act_type: goodsObject.act_type,
        act_id: goodsObject.act_id,
        top_order_id: goodsObject.top_order_id
      },
      success: function (res) {
        console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        console.log(res)
        if (res.message == 'success') {
          wx.navigateTo({
            url: `/pages/payCenter/payCenter?order_id=${res.order_id}&from=${goodsObject.from}`
          });
          return true;
        }
      }
    });
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
  
  }
})