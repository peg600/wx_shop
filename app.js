//app.js
var tempUrl = require('/templeteUrl.js');
let baseHttpUrl = "https://holotest.feeai.cn";
let baseHttpUrlOnLine = "https://holotest.feeai.cn";
let dataUrl = "https://www.feeai.cn/wxapi";     //详情页图片服务器地址
let htmlUrl = "https://holotest.feeai.cn";
let socketUrl = "wss://holotest.feeai.cn/websocket";
let sourceUser = "";
let inviter = "";
let fittingVersion = 0;
let shop_id = "";
let shop_info = {};
let current_user_id = "";
let limit = 0;    //websocket计数器

let Utils = require("lib/Utils.js");
App({
  onLaunch: function (options) {
    if (options.scene == 1007 || options.scene == 1008) {
      this.globalData.share = true
    } else {
      this.globalData.share = false
    };
    this.globalData.height = 0;
    //获取设备顶部窗口的高度（不同设备窗口高度不一样，根据这个来设置自定义导航栏的高度）
    //不可在组件中获取
    // wx.getSystemInfo({
    //   success: (res) => {
    //     this.globalData.height = Math.round(res.statusBarHeight * 2 + 20)
    //   }
    // })
    this.globalData.tabbarInfo = {
      "icons": "/pages/img/home.png,/pages/img/minishop.png,/pages/img/photo.png,/pages/img/cart.png,/pages/img/person.png",
      "selectedIcons": "/pages/img/shome.png,/pages/img/sminishop.png,/pages/img/sphoto.png,/pages/img/scart.png,/pages/img/sperson.png",
      "pagePathes": "/pages/New/index,/pages/toPersonalShop/toPersonalShop,/pages/takephoto/takephoto,/pages/shoppingCart/shoppingCart,/pages/personCenter/personCenter",
      "texts": "首页,人人店,试戴,购物车,个人中心"
    };
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    //var logsss = wx.getStorageSync('session_id')
    let that = this;
    let a = new Date;

    // 登录
    let login_promise = new Promise(function (resolve, reject) {
      wx.login({
        success: res => {
          //console.log(res)
          //console.log(res.code)
          wx.request({
            url: baseHttpUrl + '/index.php?m=default&c=flow&a=check_user_by_code',
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            dataType: 'txt',
            data: {
              appid: that.globalData.appId,
              code: res.code,
              shop_id: shop_id
            },
            success: function (res) {
              //console.log(res)
              function Trim(str) {
                return str.replace(/(^\s*)|(\s*$)/g, "");
              }
              var result = JSON.parse(Trim(res.data));
              console.log(result)
              let is_new = result.is_new;
              sourceUser = result.source;
              var session_id = result.session_id;
              wx.setStorageSync('session_id', session_id);
              if (result.error != 0) {
                wx.showToast({
                  title: '登录失败！',
                  icon: 'none',
                  duration: 2000
                });
                return
              }
              var session_id = result.session_id;
              that.globalData.nick_name = result.nick_name;
              that.globalData.current_user_id = sourceUser; //当前用户
              console.log(sourceUser)
              that.globalData.session_id = session_id; //当前用户
              that.globalData.is_new = parseInt(is_new); //是否为未消费过的用户
              that.globalData.is_new_user = parseInt(result.is_new_user); //是否为新用户

              resolve(res);
            },
            fail: function (res) {
              reject(res);
            }
          })
        },
        fail: res => {
          reject(res);
        }
      })
    })
    this.globalData.login_promise = login_promise;
    
    var app = this;
    wx.request({
      url: baseHttpUrl + '/index.php?m=default&c=fitview&a=getFittingConfig',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      method: "POST",
      dataType: 'txt',
      data: {
        shop_id: shop_id
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        var result = JSON.parse(Trim(res.data));
        for (var i = 0;i < result.length; i ++)
        {
          if(result[i].code == 1)
            app.globalData.fittingVersion = parseInt(result[i].value);
          else if(result[i].code == 2)
            app.globalData.showCPA = parseInt(result[i].value);
        }
        
      }
    });
    
    // 获取用户信息
    wx.getSetting({
      success: res => {
          
      }
    })

    //去除本地信息
    var score = wx.getStorageSync("score");
    if(score && score.length >0)
    {
      this.globalData.score = JSON.parse(score);
    }

    //连接websocket
    // this.linkSocket();
    // let linkCheck = {
    //   timeout: 10000,
    //   timeoutObj: null,
    //   serverTimeoutObj: null,
    //   reset: function () {
    //     clearTimeout(this.timeoutObj);
    //     clearTimeout(this.serverTimeoutObj);
    //     return this;
    //   },
    //   start: function () {
    //     this.timeoutObj = setTimeout(() => {
    //       wx.sendSocketMessage({
    //         data: "ping",
    //         success() {

    //         },
    //         fail() {
    //           wx.closeSocket();
    //         }
    //       });
    //       this.serverTimeoutObj = setTimeout(() => {
    //         wx.closeSocket();
    //       }, this.timeout);
    //     }, this.timeout);
    //   }
    // };
    // this.link_check = linkCheck;

    this.globalData.systemInfo = {};
    wx.getSystemInfo({
      success: function (res) {
        that.globalData.systemInfo = res;
      }
    });
  },

  globalData: {
    login_promise: "",    //登录promise对象，用于确保首页onload函数在login后执行
    userInfo: null,
    nick_name:"",
    appId: "4",
    is_new_user:1,  //是否为首次登陆的用户
    is_new: 1,    //是否为未消费过的用户
    shopName:"Holo",
    homeUrl:"/pages/New/index",
    DataChanged: 0, //0:无改变 1://订单状态改变 2:购物车改变
    tempUrl: tempUrl,
    inviter: inviter,
    sourceUser: sourceUser,
    baseHttpUrl: baseHttpUrl,
    baseHttpUrlOnLine: baseHttpUrlOnLine,
    dataUrl: dataUrl,
    socketUrl: socketUrl,
    htmlUrl: htmlUrl,
    showCPA: 0,
    nextDirection: "fitview",   //takephoto中转页的跳转方向
    fittingVersion: fittingVersion,
    shop_id: shop_id,    //商户id
    shop_info: shop_info, //商户信息
    current_user_id: current_user_id,//当前用户
    tabbarInfo: {},
    session_id: "",

    has_photo: false,   //是否缓存了照片
    holo_smile_score: 0,    //缓存照片的分值
    credit: 0,     //用户积分

    onSocketMessage: function(res) {
      console.log(res)
    }
  },

  linkSocket() {
    return;
    let that = this;
    wx.connectSocket({
      url: socketUrl,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success() {
        console.log('连接成功')
        that.initEventHandle();
      }
    })
  },

  initEventHandle() {
    let that = this
    wx.onSocketMessage((res) => {
      if (res.data == "ping_ok") {
        console.log("ping ok")
        that.link_check.reset().start()
      } else {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        that.globalData.onSocketMessage(res);
      }
    })
    wx.onSocketOpen(() => {
      console.log('WebSocket连接打开')
      that.link_check.reset().start();
    })
    wx.onSocketError(function (res) {
      console.log('WebSocket连接打开失败')
      that.reconnect();
    })
    wx.onSocketClose(function (res) {
      console.log('WebSocket 已关闭！')
      that.reconnect();
    })
  },

  //断线重连，每5秒连一次，最多尝试12次
  reconnect() {
    if (this.lockReconnect) return;
    this.lockReconnect = true;
    clearTimeout(this.timer)
    if (limit < 12) {
      this.timer = setTimeout(() => {
        this.linkSocket();
        this.lockReconnect = false;
      }, 5000);
      limit = limit + 1;
    }
  },

  getShareParams:function()
  {
    var pages = getCurrentPages();
    var currentPage = pages[pages.length - 1].route;
    currentPage = this.fillPathParams(currentPage);
    return {
      title: '好Shopping，都是对美的一试钟情',
      path: currentPage
    }
  },

  resetInviter:function()
  {
    getApp().globalData.inviter = "";
    getApp().inviter = ""; 
  },

  parseInviter:function(options) {
    if (options.inviter) {
      if (options.inviter == this.globalData.current_user_id) {
        return
      }
      this.globalData.inviter = options.inviter;
      this.inviter = options.inviter;
    } else if (options.scene) {
      var scene = decodeURIComponent(options.scene);
      var pattern = /inviter=([0-9]+)/g;
      var match = pattern.exec(scene);
      if (match) {
        var inviter = match[1];
        if (inviter == this.globalData.current_user_id) {
          return
        }
        this.globalData.inviter = inviter;
        this.inviter = inviter;
      }
    }
    
    if(this.globalData.current_user_id) {
      this.addUserFriend();
      this.addUserFans();
      // if (this.globalData.is_new_user == "1") {
      //   this.addUserFans();
      // }
    }else{
      this.globalData.login_promise.then(() => {
        this.addUserFriend();
        this.addUserFans();
        // if (this.globalData.is_new_user == "1") {
        //   this.addUserFans();
        // }
      })
    }
    
  },

  fillPathParams:function(url)
  {
    if (url.indexOf("?") <= 0)
      return url + "?inviter=" + sourceUser;
    else
      return url + "&inviter=" + sourceUser;
  },

  addUserFriend() {
    let that = this;
    wx.request({
      url: `${that.globalData.baseHttpUrl}/index.php?m=default&c=flow&a=add_user_friend`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        session_id: wx.getStorageSync('session_id'),
        inviter: that.globalData.inviter
      },
      success: function (res) {
        //console.log(res)
      }
    });
  },

  addUserFans() {
    let that = this;
    wx.request({
      url: `${that.globalData.baseHttpUrl}/index.php?m=default&c=endorser&a=add_user_fans`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        session_id: wx.getStorageSync('session_id'),
        inviter: that.globalData.inviter
      },
      success: function (res) {
        
      }
    });
  },

  //向用户发送会员卡，若成功则将用户和卡信息保存到数据库
  addMemberCard() {
    let that = this;
    wx.request({
      url: `${that.globalData.baseHttpUrl}/index.php?m=default&c=flow&a=getSignPackage`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        mode: 1
      },
      success: function (res) {
        //console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        //console.log(res)

        wx.addCard({
          cardList: [
            {
              cardId: res.card_id,
              cardExt: '{"code":"","openid":"","timestamp":' + res.timestamp + ',"nonce_str":"' + res.nonceStr + '","signature":"' + res.signature + '"}'
            }],
          success(res) {
            //console.log(res) // 卡券添加结果
            if (res.cardList && res.cardList.isSuccess) {
              wx.request({
                url: `${that.globalData.baseHttpUrl}/index.php?m=default&c=flow&a=add_new_member`,
                method: 'POST',
                dataType: 'txt',
                header: { 'content-type': 'application/x-www-form-urlencoded' },
                data: {
                  session_id: wx.getStorageSync('session_id'),
                  code: res.cardList.code,    //此处为加密的code，需在后台解密
                  card_id: res.cardList.cardId
                },
                success: function (res) {
                  //console.log(res)
                },
                fail: function (res) {
                  wx.showModal({
                    title: '存储失败',
                    content: '',
                  })
                }
              });
            }
          },
          fail(res) {
            //console.log(res)
            if (res.errMsg == "addCard:fail cancel") {
              wx.showModal({
                title: '取消领取',
                content: '',
              })
            }else{
              wx.showModal({
                title: '领取失败',
                content: '',
              })
            }
          }
        })
      }
    });
  },

  //根据页面栈对象返回带参数的页面路径
  getPageUrl(pages) {
    if(pages) {
      let currentPage = pages[pages.length - 1]; //获取当前页面的对象
      let options = currentPage.options;
      let url = `/${currentPage.route}`
      let n = Object.getOwnPropertyNames(options).length;   //获取属性个数
      if(n>0) {
        let len = n;
        for (let key in options) {
          if (len == n) {
            url = `${url}?${key}=${options[key]}`;
          } else {
            url = `${url}&${key}=${options[key]}`;
          }
          len = len - 1;
        }
      }
      return url;
    }
  },

  //收集点击事件的formId
  collectFormId(form_id) {
    let formIds = this.globalData.globalFormIds; // 获取全局推送码数组
    
    if (!formIds) {
      formIds = [];
    }
    if (this.globalData.has_upload_form_id > 50) {
      return
    }
    let second = new Date().getTime().toString();   //当前毫秒数
    let data = {
      form_id: form_id,
      expire: parseInt(second.slice(0, second.length - 3)) + 604800  // 7天后的过期时间戳
    }
    formIds.push(data);
    this.globalData.globalFormIds = formIds;
    if (formIds.length >= 10) {
      this.uploadFormIds();
    }
  },

  //上传formId
  uploadFormIds() {
    let that = this;
    let formIds = this.globalData.globalFormIds;
    if (formIds && formIds.length) {
      formIds = JSON.stringify(formIds); // 转换成JSON字符串
      this.globalData.globalFormIds = []; // 清空当前全局推送码
      wx.request({  // 发送到服务器
        url: `${that.globalData.baseHttpUrl}/index.php?m=default&c=flow&a=save_form_id`,
        method: 'POST',
        dataType: 'txt',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
          session_id: wx.getStorageSync('session_id'),
          form_id: formIds
        },
        success: function (res) {
          function Trim(str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
          }
          res = JSON.parse(Trim(res.data));
          console.log(res)
          if(res.error == 0) {
            that.globalData.has_upload_form_id = that.globalData.has_upload_form_id + formIds.length;
          }else{
            
          }
        }
      });
    }
  },

  //将自己的对应活动的得分添加至表中
  addMyScore(score) {
    let that = this;
    //console.log(score)
    wx.request({
      url: `${that.globalData.baseHttpUrl}/index.php?m=default&c=flow&a=add_my_score`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        session_id: wx.getStorageSync('session_id'),
        score: score,
        action_id: that.globalData.action_id
      },
      success: function (res) {
        //console.log(res)
      }
    });
  },

  //获取好友信息及各游戏的分数
  getFriendScore() {
    let that = this;
    wx.request({
      url: `${that.globalData.baseHttpUrl}/index.php?m=default&c=flow&a=get_friend_score`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        session_id: wx.getStorageSync('session_id'),
        action_id: that.globalData.action_id
      },
      success: function (res) {
        //console.log(res)
        return res.data;
      }
    });
  },

  //检查缓存的照片和分值
  hasPhoto() {
    wx.getStorage({
      key: 'holo_smile_img',
      success(res) {
        wx.getStorage({
          key: 'holo_smile_score',
          success(res) {
            that.globalData.has_photo = true;
            that.globalData.holo_smile_score = res;
          }
        })
      }
    })
  },

  onHide: function () {
    this.uploadFormIds();
  }
})
