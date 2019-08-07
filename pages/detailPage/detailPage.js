// pages/detailPage/detailPage.js
let app = getApp();
let baseUrl = app.globalData.baseHttpUrl;
let dataUrl = app.globalData.dataUrl;
let shop_id = app.globalData.shop_id;

let inviter = app.inviter;
let version = app.globalData.fittingVersion;
 
let is_shop_btn_click = true;
let screen_width = wx.getSystemInfoSync().windowWidth;

let Utils = require("../../lib/Utils.js")
let WxParse = require('../wxParse/wxParse.js');
let WxDiscode = require('../wxParse/wxDiscode.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //小程序轮播图参数
    swiperCurrent: 0,
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 600,
    circular: true,
    show_swiper_img: false,
    hasScore: false,
    score: 1.0,
    promotionStyle:0,
    image_scroll_list: [], //轮播图图片数组
    goods_info: {}, //商品信息
    goods_attr: [], //商品款式列表
    current_attr: [], //当前选中的款式,可由多个款式组合
    current_attr_id: "", //当前选中的多个款式的拼接，如 2234|2256
    stock_number_arr: [], //商品各款式组合的库存
    current_stock: [], //当前选择的款式组合库存、价格
    goods_actions: [], //商品参与的活动数组
    priceStyle:0, //价格计量方式 2：幸运星
    buyStyle:0,
    //锚点跳跃相关
    top: "",
    detail_position: 0,
    show_tabbar_top: false,
    canvas_width:375,
    canvas_height:667,
    show_attr: false, //显示款式选择框
    cart_num: 0, //购物车数量
    cart_add: 1, //添加到购物车的数量
    is_collected: false, //是否收藏

    group_action_info: false, //商品参加的拼团活动信息
    group_list: [], //拼单中的团
    is_buy_group: false, //是否通过团购按钮
    is_add_group: false, //是否通过参团按钮
    top_order_id: "", //所参团的订单id
    add_order_id: "", //点击的参团的id

    show_share: false,
    show_share_page: false,
    share_img: "", //分享图base64
    user_id:0,

    min_price: 0,
    max_price: 0,

    show_video: false,
    is_new: app.globalData.is_new,

    show_socket: false,
    other_user: ""

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    if(options.scene)
    {
      const scene = decodeURIComponent(options.scene);
      options = Utils.parseScene(scene);
    }
    var contact_path = "/pages/detailPage/detailPage?"
    if (options.shop_id) {
      this.setData({
        shop_id: options.shop_id
      })
    }
    if (options.goods_id) {
      this.setData({
        goods_id: options.goods_id,
        contact_path: contact_path + "goods_id=" + options.goods_id
      })
      console.log(options.goods_id)
    }
    if (options.top_order_id) {
      this.setData({
        top_order_id: options.top_order_id
      })
    }

    if(options.priceStyle > 0)
    {
      this.setData({
        priceStyle:options.priceStyle
      })
    }

    if(options.promotionStyle)
    {
      this.setData({
        promotionStyle:options.promotionStyle
      })
    }
    app.parseInviter(options);
  
    this.imageScrollList();
    this.getGoodsInfo();
    //this.getCollectInfo();
    //this.getPromotion();

    this.setData({
      detail_position: 440 * wx.getSystemInfoSync().windowWidth / 320,
      user_id: app.globalData.current_user_id
    })

    //this.initWebsocket();
  },

  //进入或展示详情页时，向websocket发送个人信息，监听其他人的浏览推送
  initWebsocket() {
    let that = this;
    app.globalData.onSocketMessage = this.onSocketMessage;
    wx.getUserInfo({
      success: function (res) {
        let data = JSON.parse(res.rawData);
        data.goods_id = that.data.goods_id;
        data = JSON.stringify(data);
        wx.sendSocketMessage({
          data: data,
          success() {

          },
          fail() {
            wx.closeSocket();
          }
        });
      },
      fail(err) {
        console.log(err)
      }
    })
  },

  //离开详情页时告知服务端，并重置onSocketMessage
  leaveDetailpage() {
    wx.sendSocketMessage({
      data: "leave_detail",
      success() {
        app.globalData.onSocketMessage = function (res) {
          console.log(res)
        }
      },
      fail() {
        wx.closeSocket();
      }
    });
  },

  onPageScroll: function(e) {
    let that = this;
    this.data.top = e.scrollTop;
    this.setData({
      top: e.scrollTop
    })
  },

  //获取优惠券相关信息
  getPromotion()
  {
    let that = this;
    Utils.request({
      url: `${baseUrl}/index.php?c=promotion&goods_id=${that.data.goods_id}&a=getTicketInfo`,
      data:{},
      success:function(res)
      {
        res = JSON.parse(Utils.Trim(res.data));
        if(res.error != "1")
        {
          that.setData({
            tickets:res
          })
          //获取和商品相关联的优惠券信息
          Utils.request({
            url: `${baseUrl}/index.php?c=promotion&a=getTicketForGoods`,
            data: {
              goods_id: that.data.goods_id
            },
            success: function (res1)
            {
              res1 = JSON.parse(Utils.Trim(res1.data));
              if(res1.error != "1")
              {
                for(var i = 0;i < res1.length; i ++)
                {
                  var ticket = res1[i].ticket_id;
                  for (var j = 0;j < res.length; j ++)
                  {
                    if(res[j].ticket_id == ticket)
                    {
                      if (res[j].goods_valid_code == 2)
                        res.slice(j,1);
                      else if (res[j].goods_valid_code == 1)
                        res[j].goods_valid_code = 0;
                      break;
                    }

                  }
                }

                that.setData({
                  tickets: res
                })
              }
            }
          })
        }
      }
    })
  },

  setStockNumber()
  {
    if (!this.data.stock_number_arr)
    return;
    var product_number = this.data.stock_number_arr[this.data.current_attr_id];
    this.setData({
      is_new: app.globalData.is_new,
      current_stock: product_number
    })
  },

  //获取轮播图
  imageScrollList() {
    let that = this;
    wx.request({
      url: `${baseUrl}/index.php?c=goods&id=${that.data.goods_id}&a=get_goods_gallery`,
      method: 'POST',
      dataType: 'txt',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {

      },
      success: function(res) {
        res = JSON.parse(Utils.Trim(res.data));
        ////console.log(res)
        that.setData({
          image_scroll_list: res
        })
      },
      fail: function(err) {
        ////console.log(err)
        wx.showToast({
          title: '请求失败，请检查网络重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  getGoodsInfo() {
    let that = this;
    wx.showLoading({
      title: '',
    })
    wx.request({
      url: `${baseUrl}/index.php?c=goods&id=${that.data.goods_id}`,
      method: 'POST',
      dataType: 'txt',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {

      },
      success: function(res) {
        res = JSON.parse(Utils.Trim(res.data));
        console.log(res)
        that.setData({
          goods_info: res
        })
        if (res.goods_video) {
          that.setData({
            autoplay: false
          })
        }
        that.getGoodsAttr();
        let url = baseUrl.split("/happymall")[0];
        res.goods_desc = res.goods_desc.replace(new RegExp("/wxapi", 'g'), `${dataUrl}`)

        //修正“产品参数”字体大小
        res.goods_desc = res.goods_desc.replace(new RegExp("12px", 'g'), "28rpx");
        res.goods_desc = res.goods_desc.replace(new RegExp("pt", 'g'), "px");
        /**
         * WxParse.wxParse(bindName , type, data, target,imagePadding)
         * 1.bindName绑定的数据名(必填)
         * 2.type可以为html或者md(必填)
         * 3.data为传入的具体数据(必填)
         * 4.target为Page对象,一般为this(必填)
         * 5.imagePadding为当图片自适应是左右的单一padding(默认为0,可选)
         */

        WxParse.wxParse('article', 'html', res.goods_desc, that, 0);
      },
      fail: function(err) {
        ////console.log(err)
        wx.hideLoading();
        wx.showToast({
          title: '请求失败，请检查网络重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  getGoodsAttr() {
    let that = this;
    wx.request({
      url: `${baseUrl}/index.php?c=goods&id=${that.data.goods_id}&a=getProducts`,
      method: 'POST',
      dataType: 'txt',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {

      },
      success: function(res) {
        res = JSON.parse(Utils.Trim(res.data));
        console.log(res)
        let goods_attr = [];
        let current_attr = [];
        var stock_number_arr = [];
        var price = undefined;
        var min_price = that.data.goods_info.shop_price;
        var max_price = that.data.goods_info.shop_price;
        for (var i = 0; i < res.length; i++) {
          var good_attrs = res[i].goods_attr;
          if(res[i].price > 0)
          {
            min_price = Math.min(min_price, res[i].price);
            max_price = Math.max(max_price,res[i].price);
          }
          for (var j = 0; j < good_attrs.length; j++) {
            var good_attr = good_attrs[j];
            var attr_name = good_attr.attr_name;
            var values = undefined;
            for (var k = 0; k < goods_attr.length; k++) {
              if (goods_attr[k].name == attr_name) {
                values = goods_attr[k].values;
                break;
              }
            }

            if (values == undefined) {
              var attr = new Object();
              attr.name = attr_name;
              attr.values = [];
              goods_attr.push(attr);
              values = attr.values;
            }

            //判断是否重复
            var obj = undefined;
            for (var k = 0; k < values.length; k++) {
              if (values[k].label == good_attr.attr_value) {
                obj = values[k];
                break;
              }
            }

            price = res[i].price.length > 0 ? res[i].price : good_attr.shop_price;
            if (obj == undefined) {
              obj = new Object();
              obj.label = good_attr.attr_value;
              obj.attr_thumb = good_attr.attr_thumb.length > 0 ? good_attr.attr_thumb : good_attr.goods_img;
              obj.goods_attr_id = good_attr.goods_attr_id;
              obj.product_number = res[i].product_number;
              obj.price = res[i].price.length > 0 ? res[i].price : good_attr.shop_price;
              //若为新用户且该款式有新人优惠价
              if (app.globalData.is_new && res[i].new_user_product_price) {
                obj.new_user_product_price = res[i].new_user_product_price
              }
              values.push(obj);

              if (current_attr[j] == undefined) {
                current_attr.push(obj);
              }
            }
          }

          var obj = new Object();
          obj.product_number = res[i].product_number;
          obj.product_id = res[i].product_id;
          obj.price = price == undefined ? res[i].price : price;
          //若为新用户且该款式有新人优惠价
          if (app.globalData.is_new && res[i].new_user_product_price) {
            obj.new_user_price = res[i].new_user_product_price
          }
          stock_number_arr[res[i].attr_value] = obj;
        }

        let goods_info = that.data.goods_info;
       // goods_info.max_new_user_price = res[0].max_new_user_price;
        goods_info.max_price = max_price;
        //goods_info.max_promotion = res[0].max_promotion;
        //goods_info.min_new_user_price = res[0].min_new_user_price;
        goods_info.min_price = min_price;
        //goods_info.min_promotion = res[0].min_promotion;
        goods_info.load_complete = 1;
      
        let current_attr_id = that.transAttrId(current_attr);
        that.setData({
          min_price:min_price,
          max_price: max_price,
          goods_attr: goods_attr,
          current_attr: current_attr,
          current_attr_id: current_attr_id,
          stock_number_arr: stock_number_arr,
          //current_stock: stock_number_arr[current_attr_id],
          goods_info: goods_info
        })
        wx.hideLoading();
      },
      fail: function(err) {
        wx.hideLoading();
        wx.showToast({
          title: '请求失败，请检查网络重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  //获取购物车商品数
  getCartsNum() {
    let that = this;
    wx.request({
      url: `${baseUrl}/index.php?m=default&c=flow&a=getCartsNum`,
      method: 'POST',
      dataType: 'txt',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        session_id: wx.getStorageSync('session_id'),
        shop_id: shop_id
      },
      success: function(res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        that.setData({
          cart_num: res.result.num
        })
      },
      fail: function(err) {
        wx.showToast({
          title: '请求失败，请检查网络重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  //导入微信购物车
  add_shopping_list() {
    let that = this;
    wx.request({
      url: `${app.globalData.baseHttpUrl}/index.php?m=default&c=flow&a=add_shopping_list`,
      method: 'POST',
      dataType: 'txt',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        session_id: wx.getStorageSync('session_id'),
        goods_id: that.data.goods_id,
        number: that.data.cart_add,
        goods_attr_id: that.data.current_attr_id,
        shop_id: shop_id
      },
      success: function(res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
      }
    });
  },

  //获取该商品目前所参与的活动，并相应的调整界面
  getGoodsActions() {
    let that = this;
    wx.request({
      url: `${baseUrl}/index.php?m=default&c=flow&a=get_goods_actions_by_goods_id`,
      method: 'POST',
      dataType: 'txt',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        goods_id: that.data.goods_id
      },
      success: function(res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        if (res.length > 0) {
          for (let i = 0; i < res.length; i++) {
            if (res[i].act_id > 0) {
              wx.request({
                url: `${baseUrl}/index.php?m=default&c=flow&a=get_action_info`,
                method: 'POST',
                dataType: 'txt',
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                  act_type: res[i].act_type,
                  act_id: res[i].act_id
                },
                success: function(res2) {
                  function Trim(str) {
                    return str.replace(/(^\s*)|(\s*$)/g, "");
                  }
                  res2 = JSON.parse(Trim(res2.data));
                  res2 = res2[0];
                  let timestamp = (new Date()).getTime();
                  let start_time = Date.parse(res2.start_time.replace(/-/g, "/"));
                  let end_time = Date.parse(res2.end_time.replace(/-/g, "/"));
                  if (timestamp > start_time && timestamp < end_time && res2.is_active == '1') {
                    let action = Object.assign(res[i], res2);
                    let goods_actions = that.data.goods_actions;
                    goods_actions.push(action);
                    that.setData({
                      goods_actions: goods_actions
                    })

                    if (res[i].act_type == "1") {
                      that.setData({
                        group_action_info: action
                      })
                      that.getOtherGroups();
                    }
                  }

                },
                fail: function(err) {
                  wx.showToast({
                    title: '请求失败，请检查网络重试',
                    icon: 'none',
                    duration: 2000
                  })
                }
              })
            }
          }
        }
      },
      fail: function(err) {
        wx.showToast({
          title: '请求失败，请检查网络重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  //获取部分团购设置及其下拼单中的团的团长订单信息
  getOtherGroups() {
    let that = this;
    wx.request({
      url: baseUrl + '/index.php?c=flow&a=get_group_purchase_captain_order_info_by_act_id',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      dataType: 'txt',
      data: {
        session_id: wx.getStorageSync('session_id'),
        act_id: 1,
        shop_id: shop_id
      },
      success: function(res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        for (let i = 0; i < res.length; i++) {
          // res[i].avatar_url = `${baseUrl}/${res[i].avatar_url}`;
          //根据团长order_id获取拼团组员人数
          wx.request({
            url: baseUrl + '/index.php?c=flow&a=get_group_purchase_number_by_order_id',
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            dataType: 'txt',
            data: {
              session_id: wx.getStorageSync('session_id'),
              order_id: res[i].order_id,
              shop_id: shop_id
            },
            success: function(res2) {
              function Trim(str) {
                return str.replace(/(^\s*)|(\s*$)/g, "");
              }
              res2 = JSON.parse(Trim(res2.data));
              res[i].member_number = res2[0].member_number;
              res[i].need_number = parseInt(res[i].group_number) - parseInt(res[i].member_number);

              that.setData({
                group_list: res
              })
              that.countDown("group_list", res, i)
            }
          });
        }
      }
    });
  },

  //倒计时函数，传入相应的拼团对象
  countDown: function(objName, obj, i) {
    var that = this;
    if (i !== undefined) {
      var act = obj[i];
    } else {
      var act = obj;
    }
    var created_time = act.act_start_time;
    var hCreated = Date.parse(created_time.replace(/-/g, "/")); //null
    var countDownTime = act.expire_day * 86400000 + act.expire_hour * 3600000 + act.expire_minute * 60000;
    var timer = setInterval(function() {
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
        that.countDown(objName, obj, i);
      }
    }, 1000)
  },

  //参团
  joinGroup(e) {
    let order_info = {};
    if (e.currentTarget.dataset.order_info) {
      order_info = e.currentTarget.dataset.order_info;
    } else {
      order_info = this.data.current_order_info;
    }
    this.ShowAttrAddGroup();
    this.setData({
      add_order_id: order_info.order_id
    })
  },

  //获取是否收藏
  getCollectInfo() {
    let that = this;
    wx.request({
      url: `${baseUrl}/index.php?m=default&c=flow&a=get_collect_info`,
      method: 'POST',
      dataType: 'txt',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        session_id: wx.getStorageSync('session_id'),
        goods_id: that.data.goods_id,
        shop_id: shop_id
      },
      success: function(res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        if (res.result == 'exits') {
          that.setData({
            is_collected: true
          })
        } else if (res.result == 'null') {
          that.setData({
            is_collected: false
          })
        }
      },
      fail: function(err) {
        ////console.log(err)
        wx.showToast({
          title: '请求失败，请检查网络重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  //收藏
  toggleCollect() {
    let that = this;
    wx.request({
      url: `${baseUrl}/index.php?m=default&c=flow&a=change_collect_info`,
      method: 'POST',
      dataType: 'txt',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        session_id: wx.getStorageSync('session_id'),
        goods_id: that.data.goods_id,
        shop_id: shop_id
      },
      success: function(res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        if (res.error == 0) {
          that.setData({
            is_collected: !that.data.is_collected
          })
        } else {
          wx.showToast({
            title: '请求失败，请检查网络重试',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function(err) {
        ////console.log(err)
        wx.showToast({
          title: '请求失败，请检查网络重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  //普通购买
  buyNow() {
    let that = this;
    if (!is_shop_btn_click) {
      return
    }
    if (this.data.cart_add > this.data.current_stock.product_number) {
      wx.showToast({
        title: '库存不足,请重新选择!',
        icon: 'none',
        duration: 2000
      })
      return
    }
    var buy = function()
    {
      wx.showLoading({
        title: '提交订单...',
      })
      var url = `${baseUrl}/index.php?m=default&c=goods&a=get_number_of_product`;
      //检查库存
      Utils.request({
        url: url,
        data: {
          goods_attr: that.data.current_attr_id
        },
        success: function (res) {
          res = JSON.parse(Utils.Trim(res.data));
          if (parseInt(res.product_number) < that.data.cart_add) {
            wx.hideLoading();
            var stock_number_arr = that.data.stock_number_arr;
            stock_number_arr[that.data.current_attr_id].product_number = res.product_number;
            that.data.current_stock.product_number = res.product_number;
            that.setData({
              stock_number_arr: stock_number_arr,
              current_stock: that.data.current_stock
            })
            Utils.showToast("库存不足，请重新选择");
            return;
          }
          is_shop_btn_click = false;
          let label = that.getAttrLabel(that.data.current_attr);
          let product_id = that.data.stock_number_arr[that.data.current_attr_id].product_id;
          var promotion = 0;
          if (that.data.hasScore)
            promotion = Utils.toFix(that.data.goods_info.promotion_base * that.data.score, 2);
          var star_price = 0;
          if(that.data.buyStyle == 2)
          {
            promotion = that.data.goods_info.shop_price * that.data.cart_add;
            star_price = that.data.goods_info.star_price;
          }
          let goodsList = [];
          let goods_product = {
            "goods_id": that.data.goods_id,
            "goods_number": that.data.cart_add,
            "goods_attr_label": label,
            "product_id": product_id,
            "promotion": promotion,
            "star_price": star_price,
            "goods_attr_id": that.data.current_attr_id
          };
          goodsList.push(goods_product);
          goodsList = JSON.stringify(goodsList);

          wx.request({
            url: `${baseUrl}/index.php?m=default&c=flow&a=shop_now`,
            method: 'POST',
            dataType: 'txt',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
              session_id: wx.getStorageSync('session_id'),
              goods: goodsList,
              inviter: inviter,
              from: "miniprogram",
              shop_id: shop_id
            },
            success: function (res) {
              //console.log(res)

              function Trim(str) {
                return str.replace(/(^\s*)|(\s*$)/g, "");
              }
              res = JSON.parse(Trim(res.data));
              if (res.message == 'success') {
                wx.hideLoading();
                that.toPayCenter(res.order_id);
              } else {
                wx.showToast({
                  title: '请求失败，请检查网络重试',
                  icon: 'none',
                  duration: 2000
                })
              }
            },
            fail: function (err) {
              ////console.log(err)
              wx.showToast({
                title: '请求失败，请检查网络重试',
                icon: 'none',
                duration: 2000
              })
            },
            complete: function () {
              is_shop_btn_click = true;
            }
          })
        },
        fail: function (res) {
          wx.hideLoading();
          Utils.showToast("网络错误，请重试!");
        }
      })
    }
    //兑换
    if(this.data.buyStyle == 2)
    {
      //检查可用的星星
      let that = this;
      Utils.request({
        url: `${baseUrl}/index.php?m=default&c=lottery&a=getNumberOfStars`,
        data: {},
        success: function (res) {
          res = JSON.parse(Utils.Trim(res.data));
          if (res.error == 1) {
            Utils.showToast(res.msg);
          }
          else {
            if(res.star_number < that.data.goods_info.star_price)
            Utils.showToast("没有足够的幸运星");
            else
            {
              buy();
            }
          }
        },
        fail: function (res) {
          Utils.showToast("发生错误，请重试!");
        },
        complete: function (res) {
          wx.hideLoading();
        }
      });
      return;
    }
    else
    {
      //检测是否有颜值数据
      if (!this.data.hasScore) {
        wx.showModal({
          title: '温馨提醒',
          content: '系统检测到你还未测试颜值，进行颜值测试可以获得相应的颜值优惠',
          confirmText: "去测颜值",
          cancelText: "直接下单",
          success: function (res) {
            if (res.confirm) {
              that.goTest();
            }
            else
            buy();
          }
        })
      }
      else
        buy();
    }
  },

  //团购
  buyGroup() {
    let that = this;
    if (!is_shop_btn_click) {
      return
    }
    is_shop_btn_click = false;

    wx.showLoading({
      title: '处理中，请稍候',
    })

    if (that.data.add_order_id) {
      that.setData({
        top_order_id: that.data.add_order_id
      })
    }

    let goodsList = [];
    let goods_product = {
      "goods_id": that.data.goods_id,
      "goods_attr_id": that.data.current_attr_id
    };
    goodsList.push(goods_product);
    goodsList = JSON.stringify(goodsList);

    wx.request({
      url: `${baseUrl}/index.php?m=default&c=flow&a=shop_now_by_action`,
      method: 'POST',
      dataType: 'txt',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        session_id: wx.getStorageSync('session_id'),
        goods_id: goodsList,
        inviter: inviter,
        number: that.data.cart_add,
        from: "miniprogram",
        shop_id: shop_id,
        act_type: that.data.group_action_info.act_type,
        act_id: that.data.group_action_info.act_id,
        top_order_id: that.data.top_order_id
      },
      success: function(res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        ////console.log(res)
        if (res.message == 'success') {
          ////console.log('判断成功，我还没跳转呢');
          wx.hideLoading();
          that.toPayCenter(res.order_id);
        } else {
          wx.showToast({
            title: '请求失败，请检查网络重试',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function(err) {
        ////console.log(err)
        wx.showToast({
          title: '请求失败，请检查网络重试',
          icon: 'none',
          duration: 2000
        })
      },
      complete: function() {
        is_shop_btn_click = true;
      }
    })
  },

  swiperChange: function(e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
    if(this.data.show_video) {
      this.hideVideo();
    }
  },

  //点击图片触发事件
  swipClick: function(e) {
    this.toggleShowSwiperImage();
    this.setData({
      autoplay: false
    })
  },

  toggleShowSwiperImage() {
    let that = this;
    this.setData({
      show_swiper_img: !that.data.show_swiper_img
    })
  },

  scrollToTop() {
    wx.pageScrollTo({
      scrollTop: 0
    })
  },

  scrollToDetail() {
    let that = this;
    wx.pageScrollTo({
      scrollTop: that.data.detail_position,
    })
  },

  prevent() {

  },

  toggleShowAttr(e) {
    var buyStyle = e.currentTarget.dataset.buystyle;
    if(buyStyle == undefined)
      buyStyle = 0;
    this.setData({
      show_attr: !this.data.show_attr,
      buyStyle: buyStyle,
      is_buy_group: false,
      is_add_group: false
    })

    this.setData({
      animationData3: "",
    })
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "ease",
      delay: 0,
      transformOrigin: "50% 50%",
    })
    if (this.data.show_attr) {
      animation.translate(0, 0).step();
      this.setData({
        animationData3: animation.export(),
      })
    }
  },

  drawShareImage() {
    this.drawCanvas();
  },

  //显示分享方式栏
  toggleShowShare() {
    this.selectComponent("#sharepanel").show();
  },

  ShowAttrGroup() {
    this.setData({
      show_attr: true,
      is_buy_group: true
    })

    this.setData({
      animationData3: "",
    })
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "ease",
      delay: 0,
      transformOrigin: "50% 50%",
    })
    if (this.data.show_attr) {
      animation.translate(0, 0).step();
      this.setData({
        animationData3: animation.export(),
      })
    }
  },

  ShowAttrAddGroup() {
    this.setData({
      show_attr: true,
      is_add_group: true
    })

    this.setData({
      animationData3: "",
    })
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "ease",
      delay: 0,
      transformOrigin: "50% 50%",
    })
    if (this.data.show_attr) {
      animation.translate(0, 0).step();
      this.setData({
        animationData3: animation.export(),
      })
    }
  },


  getCartAdd(e) {
    let val = parseInt(e.detail.value); //通过e.detail.value传入的为字符串，转为数字
    this.setData({
      cart_add: val
    });
  },

  chooseAttr(e) {
    if (e.currentTarget.dataset.index >= 0 && e.currentTarget.dataset.attr) {
      let index = e.currentTarget.dataset.index;
      let attr = e.currentTarget.dataset.attr;
      let current_attr = this.data.current_attr;
      current_attr[index] = attr
      let current_attr_id = this.transAttrId(current_attr);
      this.setData({
        current_attr: current_attr,
        current_attr_id: current_attr_id
      })
      //console.log(current_attr_id)
      //if (this.data.stock_number_arr.length > 0) {
        this.setStockNumber();
      //}
    }
  },

  add() {
    this.setData({
      cart_add: this.data.cart_add + 1
    })
  },

  minus() {
    if (this.data.cart_add > 1) {
      this.setData({
        cart_add: this.data.cart_add - 1
      })
    }
  },

  toCustomService() {
    wx.navigateTo({
      url: `/pages/transfer/transfer?goods_id=${this.data.goods_id}`,
    })
  },

  toHome() {
    wx.switchTab({
      url: app.globalData.homeUrl,
    })
  },

  toShoppingCart() {
    wx.switchTab({
      url: `/pages/shoppingCart/shoppingCart`,
    })
  },

  toFitview() {
    wx.navigateTo({
      url: `/pages/fitview/fitview?goods_id=${this.data.goods_info.goods_id}&cat_id=${this.data.goods_info.cat_id}`,
    })
  },

  toCamera() {
    let that = this;
    wx.reLaunch({
      url: `/pages/faceTest/choosePhoto/choosePhoto?goods_id=${that.data.goods_id}`,
    })
  },

  toPayCenter(order_id) {
    if (this.data.group_action_info) {
      wx.navigateTo({
        url: `/pages/payCenter/payCenter?order_id=${order_id}&from=miniprogram&act_type=${this.data.group_action_info.act_type}&act_price=${this.data.group_action_info.act_price}`,
      })
    } else {
      wx.navigateTo({
        url: `/pages/payCenter/payCenter?order_id=${order_id}&from=miniprogram`,
      })
    }
  },

  drawCanvas() {
    let that = this;
    wx.showLoading({
      title: '图片生成中',
    })
    var ration = wx.getSystemInfoSync().pixelRatio;
    let n = wx.getSystemInfoSync().windowWidth / 375;
    let width = 375 * n;
    let height = 667 * n;

    let ctx = wx.createCanvasContext('firstCanvas');
    ctx.stroke();
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
    wx.getImageInfo({
      src: that.data.goods_info.goods_img,
      success: function(res) {

        ctx.beginPath();

        // 名称
        ctx.font = "14px Arial";
        ctx.textAlign = "left";
        ctx.fillStyle = "rgb(86,86,86)";
        that.drawText(ctx, that.data.goods_info.goods_name, 20 * n, 10 * n, width - 70 * n);

        // 价格
        ctx.font = "18px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = "rgb(255,0,0)";
        ctx.fillText(`￥${that.data.goods_info.shop_price}`, 17 * n, 75 * n);

        ctx.font = "11px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = "rgb(59,59,59)";
        ctx.fillText(`官方售价：${that.data.goods_info.market_price}`, 20 * n + ctx.measureText(`￥${that.data.goods_info.shop_price}`).width + 50 * n, 72 * n);

        // 商品图
        ctx.drawImage(res.path, 0, 110 * n, width, width);

        // 保障图
        ctx.drawImage("../img/web_baoyou.png", 20, 85 * n, 80 * n, 15 * n);
        ctx.drawImage("../img/web_change.png", 120 * n, 85 * n, 80 * n, 15 * n);
        ctx.drawImage("../img/web_fahuo.png", 210 * n, 85 * n, 90 * n, 15 * n);

        let ypos = height - (height - width - 110 * n) / 2; //图片下方区域高度居中位置

        ctx.font = "16px Arial";
        ctx.textAlign = "left";
        ctx.fillStyle = "rgb(51,51,51)";
        ctx.fillText(`开心小集`, width / 2, ypos - 10 * n);

        ctx.font = "11px Arial";
        ctx.textAlign = "left";
        ctx.fillStyle = "rgb(176,176,176)";
        ctx.fillText(`长按识别小程序码`, width / 2, ypos + 10 * n);

        // 二维码
        wx.request({
          url: `${baseUrl}/index.php?m=default&c=flow&a=generateQRCode`,
          method: 'POST',
          dataType: 'txt',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            appid: app.globalData.appId,
            session_id: wx.getStorageSync('session_id'),
            scene: `goods_id=${that.data.goods_id}`,
            path: "pages/lottery/lottery" //注意此参数根目录不加“/”
          },
          success: function(res) {
            //console.log(res)

            function Trim(str) {
              return str.replace(/(^\s*)|(\s*$)/g, "");
            }
            res = JSON.parse(Trim(res.data));
            if (res.status && res.status == 1) {
              let qrcode_path = res.info;
              wx.getImageInfo({
                src: qrcode_path,
                success: function(res2) {
                  ctx.drawImage(res2.path, 50 * n, ypos - 50 * n, 100 * n, 100 * n);
                  ctx.draw(true, () => {
                    wx.canvasToTempFilePath({
                      canvasId: 'firstCanvas',
                      x: 0,
                      y: 0,
                      width: width,
                      height: height,
                      quality:1,
                      success: function success(res) {
                        that.setData({
                          share_img: res.tempFilePath
                        })
                        wx.hideLoading();
                      },
                      complete: function complete(e) {

                      }
                    });
                  })
                }
              })

            } else {
              wx.showToast({
                title: '请求失败，请检查网络重试',
                icon: 'none',
                duration: 2000
              })
            }
          },
          fail: function(err) {
            //console.log('生成二维码失败')
            wx.showToast({
              title: '请求失败，请检查网络重试',
              icon: 'none',
              duration: 2000
            })
          }
        })

      },
      fail: function(res) {
        wx.hideLoading();
      }
    })
  },

  // 绘制自动换行的文本，ctx，文本，起始位置x，y，每行宽度
  drawText(ctx, t, x, y, w) {
    var chr = t.split("");
    var temp = "";
    var row = [];

    for (var a = 0; a < chr.length; a++) {
      if (ctx.measureText(temp).width < w) {

      } else {
        row.push(temp);
        temp = "";
      }
      temp += chr[a];
    }
    row.push(temp);
    for (var b = 0; b < row.length; b++) {
      if (row.length > 1) {
        ctx.fillText(row[b] + "...", x, y + (b + 1) * 20);
        break;
      } else {
        ctx.fillText(row[b], x, y + (b + 1) * 20);
      }
    }
  },

  transAttrId(current_attr) {
    if (current_attr.length == 1) {
      return current_attr[0].goods_attr_id;
    } else {
      let attr = "";
      for (let i = 0; i < current_attr.length; i++) {
        if (i == 0) {
          attr = current_attr[0].goods_attr_id;
        } else {
          attr = `${attr}|${current_attr[i].goods_attr_id}`
        }
      }
      return attr;
    }
  },

  getAttrLabel(current_attr) {
    if (current_attr.length == 1) {
      return current_attr[0].label;
    } else {
      let attr = "";
      for (let i = 0; i < current_attr.length; i++) {
        if (i == 0) {
          attr = current_attr[0].label;
        } else {
          attr = `${attr}|${current_attr[i].label}`
        }
      }
      return attr;
    }
  },

  pullGoodFinished() {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let that = this;
    //this.getCartsNum();
    this.videoContext = wx.createVideoContext('myVideo');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.updateScore();
    //this.initWebsocket();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    //this.leaveDetailpage();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    //this.leaveDetailpage();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this;
    that.setData({
      hidden: false
    });
    this.selectComponent("#all_goods").pullNewData();
  },

  pullGoodFinished: function(e) {
    this.setData({
      hidden: true
    });

    if (!e.detail.hasNewData) {
      this.data.noMoreData = true;
      var that = this;
      this.setData({
        noMoreData: that.data.noMoreData
      })
    }
  },

  goTest: function() {
    var url = '/pages/faceTest/choosePhoto/choosePhoto?type=1&targetUrl=' + encodeURI("/pages/detailPage/detailPage");
    wx.navigateTo({
      url: url,
    })
  },

  setStarPrice(){
    let that = this;
    Utils.request({
      url: `${baseUrl}/index.php?c=goods&a=setStarPrice`,
      data:{
        goods_id:that.data.goods_id,
        star_price:1
      },
      success:function(res)
      {
        res = JSON.parse(Utils.Trim(res.data));
        if(res.count > 0)
        {
          Utils.showToast("更新成功");
        }
      }
    })
  },

  togglePromotion()
  {
    let that = this;
    this.setData({
      show_promotion: !that.data.show_promotion
    })
    this.setData({
      animationData3: "",
    })
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "ease",
      delay: 0,
      transformOrigin: "50% 50%",
    })
    if (true) {
      animation.translate(0, 0).step();
      this.setData({
        animationData3: animation.export(),
      })
    }
  },

  updateScore() {
    let face = app.globalData.score;

    if (face && this.data.promotionStyle<=1) {
      var score = (face.attributes.beauty.value) * 0.01;
      if (score != this.data.score) {
        this.setData({
          hasScore: true,
          score: score
        })
      }
    }
  },

  showVideo() {
    this.setData({
      show_video: true
    })
  },

  hideVideo() {
    this.setData({
      show_video: false
    })
  },

  videoError() {
    wx.showToast({
      title: '视频错误',
      icon: 'none',
      duration: 2000
    })
    this.hideVideo();
  },

  //接收到websocket信息时
  onSocketMessage(res) {
    console.log(res)
    let that = this;
    if (this.data.show_socket) {
      return
    }
    this.setData({
      other_user: res,
      show_socket: true
    })
    setTimeout(() => {
      that.setData({
        show_socket: false
      })
    },3000)
  },


  _getTicket: function (e) {
    var ticket_id = e.currentTarget.dataset.id;
    var user_id = e.currentTarget.dataset.userid;
    var index = e.currentTarget.dataset.index;
    var count = e.currentTarget.dataset.count;
    var num_condition = e.currentTarget.dataset.num_condition;
    if (count >= num_condition) {
      //console.log("已经领取");
      return;
    }
    var session_id = wx.getStorageSync('session_id');
    var that = this;
    Utils.request({
      url: baseUrl + '/index.php?m=default&c=promotion&a=getTicketByUser',
      data: {
        ticket_id: ticket_id,
        count: count,
      },
      success: function (res) {
        res.data = JSON.parse(Utils.Trim(res.data));
        if (res.data.error == 0) {
          wx.showToast({
            title: '领取成功',
          })
          that.data.tickets[index].count++;
          that.setData(
            {
              tickets: that.data.tickets
            }
          )
        }
        else {
          wx.showToast({
            title: '领取失败',
          })
        }
      }
    });
  },

  toShop() {
    let that = this;
    wx.navigateTo({
      url: `/pages/offlineShop/shopPage/shopPage?shop_id=${that.data.goods_info.shop_id}`,
    })
  },

  toPay() {
    let that = this;
    wx.navigateTo({
      url: `/pages/offlineShop/pay/pay?shop_id=${that.data.goods_info.shop_id}&goods_id=${that.data.goods_id}`,
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    let that = this;
    return {
      title: that.data.goods_info.goods_name,
      path: `/pages/detailPage/detailPage?goods_id=${that.data.goods_id}&inviter=${app.globalData.sourceUser}`,
      imageUrl: that.data.goods_info.goods_img,
    }
  }
})