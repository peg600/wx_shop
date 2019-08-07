// pages/lottery/lottery.js
let app = getApp();
let baseUrl = app.globalData.baseHttpUrl;

let QQMapWX = require('../../lib/qqmap-wx-jssdk.js');
let qqmapsdk;

let amapFile = require('../../lib/amap-wx.js');
let myAmapFun;

let Utils = require("../../lib/Utils.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    has_submit: false,    //是否已提交地址
    from_index: 0,
    destination_index: 0,
    from: "",
    addressInfo:false,
    backUrl:"",
    destination: "",
    from_weather: {},
    destination_weather: {},
    agree_rule: false,
    photo_score: 0,
    loaded:false,
    show_rule: false,
    cDate: "腊月初一",
    leftDays: 30,
    show_rule:false,
    show_intro:true,
    autoHide:true,
    rule_content: "1、活动时间:2019.1.1 ~ 2019.1.30\n\n2、在活动期间，凡是在开心小集购买商品，每个订单可获得一张抽奖券，每张抽奖券可获得一次抽取2019年春节免费机票的机会。\n\n3、参与活动前，您需要提交出发地和目的地，信息一旦提交，在活动期间将无法更改。中奖之后，请联系开心小集客服提供您相关的身份信息，开心小集将按照此信息向您提供经济舱机票一张。如果因为资料不正确或者未能及时提供导致奖品无法正确发放，开心小集不对产生的任何结果负责。\n\n4、如果您提交的出发地和目的地没有直航班机，开心小集只负担中转航班中航程最远的那部分机票费用，所以请在提交航程信息之前安排好您的出行计划。\n\n5、活动期间，机票数目不做限制，每2000名参与抽奖的用户作为一期抽奖，每一期抽奖会产生一张机票。\n\n6、抽奖活动中所使用的抽奖券作为用户在开心小集上购买商品的回馈，是和您购买的订单商品关联在一起的。正常情况下，开心小集上所售出的任何商品，均享受7天无理由退换的售后服务。抽奖券一旦使用，原则上认为您已经确认和奖券所关联的商品质量没有问题，相应的商品将不能再无理由退换，请妥善安排您参与抽奖的时间，确保您对购买的商品没有异议。\n\n7、开心小集承诺整个活动的公正和完整。\n\n8、本活动的最终解释权归开心小集运营方：飞艾科技（北京）有限公司所有。"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      navbar_height: app.globalData.height
    })
    qqmapsdk = new QQMapWX({    //坐标sdk
      key: 'VT4BZ-6XKL5-YKYIQ-QFJVR-5Y276-SUBSB'
    });

    myAmapFun = new amapFile.AMapWX({ 
      key: 'cb274a1c73283af39fee7a3da7d7c28f' 
    });

    if (options.photo_score) {
      this.setData({
        photo_score: options.photo_score
      })
    }

    if(options.backUrl)
    this.data.backUrl = options.backUrl;
    app.parseInviter(options);
    this.hasAirlineAddress();
  },

  showrule()
  {
    this.setData({
      show_rule:true
    })
  },

  gotoLuckFriend()
  {
    wx.navigateTo({
      url: '/pages/lottery/luckfriend/luckfriend',
    })
  },

  enterAction()
  {
    this.setData({
      show_intro:false
    })
  },

  gotoMall() {
    wx.switchTab({
      url: '/pages/New/index',
    })
  },

  gotoTicket()
  {
    wx.navigateTo({
      url: '/pages/lottery/ticket/ticket',
    })
  },

  gotoPK() {
    wx.navigateTo({
      url: '/pages/lottery/pk/index',
    })
  },

  getLocation() {
    let that = this;
    wx.showLoading({
      title: '正在定位...',
    })
    wx.getLocation({
      success: function(res) {
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function (res) {
            if(res.status == 0) {
              let city = res.result.address_component.city;
              that.setData({
                from: city
              })
            }
          },
          fail: function (res) {
            wx.hideLoading();
            Utils.showToast({
              title: '定位失败，请手动选择',
            })
          },
          complete: function (res) {
            wx.hideLoading(); 
          }
        });
      },
      fail:function(res)
      {
        wx.showToast({
          title: '获取定位失败',
          icon:'none',
          duration:3000
        })
      },
      complete:function(res)
      {
        wx.hideLoading();
      }
    })
  },

  //检查是否已有航线记录
  hasAirlineAddress() {
    let that = this;
    wx.request({
      url: `${baseUrl}/index.php?m=default&c=airline&a=has_airline_address`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        session_id: wx.getStorageSync('session_id')
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        //console.log(res)
        if (res._from) {
          app.globalData.hasAirlineSetting = true;
          that.setData({
            has_submit: true,
            addressInfo:false,
            show_intro: false,
            cDate: res.date,
            leftDays: res.leftDays,
            from: res._from,
            destination: res.destination,
            from_weather: res.from_weather.weather.lives[0],
            destination_weather: res.destination_weather.weather.lives[0]
          })
        }
        else
        {
          that.setData(
            {
              cDate: res.date,
              leftDays: res.leftDays
            }
          )
        }

        that.setData({
          loaded:true
        })
      },
      fail:function(e){
        wx.showToast({
          title: "网络错误，请检查重试!",
          duration: 3000,
          icon: 'none',
        })
      }
    });
  },

  getTicket()
  {
    Utils.request({
      url: `${baseUrl}/index.php?m=default&c=ticket`,
      data:{
        session_id: wx.getStorageSync('session_id')
      },
      success:function(res)
      {
        res = JSON.parse(Utils.Trim(res.data));
      },
    })
  },

  getFrom(e) {
    wx.navigateTo({
      url: '/pages/lottery/addressSelect/addressSelect',
    })
  },

  getDestination(e) {
    wx.navigateTo({
      url: '/pages/lottery/addressSelect/addressSelect?type=1',
    })
  },

  checkboxChange() {
    let that = this;
    this.setData({
      agree_rule: !that.data.agree_rule
    })
  },

  submit() {
    let that = this;
    let from = this.data.from;
    from = from.replace("市", "")
    let destination = this.data.destination;
    destination = destination.replace("市", "")
    if(!from) {
      wx.showToast({
        title: '需要选择出发地!',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (!destination) {
      wx.showToast({
        title: '需要选择目的地!',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    // if(from.name == destination.name) {
    if(from == destination) {
      wx.showToast({
        title: '出发地和目的地相同，请检查!',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    
    if (true) {
      if (this.data.agree_rule) {
        wx.showModal({
          title: '提示',
          content:"航程信息提交之后将不可更改，确认提交?",
          success: function (res) {
            if (res.confirm) {
              wx.showLoading({
                title: '提交中...',
              })
              wx.request({
                url: `${baseUrl}/index.php?m=default&c=airline&a=save_user_airline_address`,
                method: 'POST',
                dataType: 'txt',
                header: { 'content-type': 'application/x-www-form-urlencoded' },
                data: {
                  session_id: wx.getStorageSync('session_id'),
                  from: from,
                  destination: destination
                },
                success: function (res) {
                  function Trim(str) {
                    return str.replace(/(^\s*)|(\s*$)/g, "");
                  }
                  res = JSON.parse(Trim(res.data));
                  //console.log(res)
                  if(res) {
                    app.globalData.hasAirlineSetting = true;
                    that.setData({
                      has_submit: true,
                      addressInfo:false,
                      from_weather: res.from_weather.weather.lives[0],
                      destination_weather: res.destination_weather.weather.lives[0]
                    })
                    //如果存在返回URL，跳转
                    if (app.globalData.backUrl && app.globalData.backUrl.length > 0)
                    {
                      wx.navigateTo({
                        url: decodeURIComponent(app.globalData.backUrl),
                      })
                    }
                  }else{
                    wx.showToast({
                      title: '提交失败，请检查网络',
                      icon: 'none',
                      duration: 2000
                    })
                    return;
                  }
                },
                fail:function(res){
                  wx.showToast({
                    title: 'OOPS,出错了，请重试',
                    duration:3000
                  })
                },
                complete:function(res)
                {
                  wx.hideLoading();
                }
              });
            }
          }
        })
      } else {
        wx.showToast({
          title: '参加活动需阅读并同意活动规则!',
          icon: 'none',
          duration: 2000
        })
        return;
      }
    }else{
      wx.showToast({
        title: '起点或终点无机场，请重新选择!',
        icon: 'none',
        duration: 2000
      })
      return;
    }
  },

  //根据起点终点城市的编码查询天气
  getWeather(from_adcode, destination_adcode) {
    let that = this;
    wx.request({
      url: `https://restapi.amap.com/v3/weather/weatherInfo?key=b86478fd630bed79d338f7dae92ec04d&city=${from_adcode}`,
      method: 'GET',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      data: {
        
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        //console.log(res)
        that.setData({
          from_weather: res.lives[0]
        })
      }
    });
    wx.request({
      url: `https://restapi.amap.com/v3/weather/weatherInfo?key=b86478fd630bed79d338f7dae92ec04d&city=${destination_adcode}`,
      method: 'GET',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      data: {

      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        that.setData({
          destination_weather: res.lives[0]
        })
      }
    });
  },

  submitAddress:function()
  {
    this.setData({
      addressInfo:true
    })
  },

  closeForm:function()
  {
    this.setData({
      addressInfo: false
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
  onShareAppMessage: function (options) {
    let that = this;
      return {
        title: "开心购好物，刷脸赢春节机票",
        path: `/pages/lottery/lottery`
      }
  }
})