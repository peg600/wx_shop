// pages/lottery/luckfriend/luckfrient.js
let app = getApp();
let baseUrl = app.globalData.baseHttpUrl;
let Utils = require("../../../lib/Utils.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show_rule: false,
    autoHide: true,
    selected_index: 0,
    luck_score: 0,
    beauty_score:0,
    new_star_number: 0,
    new_star2019_number: 0,
    new_star_number_from_beauty:0,
    new_star_number_from_score: 0,
    star_number: 0,
    star2019_number: 0,
    hasError: false,
    action_num:0,
    match:0,
    beauty:0,
    age:0,
    friend_num:0,
    loaded: false,
    hasNew: true,
    firstUser:[],
    secondUser:[],
    thirdUser:[]
  },

  newFinding() {
    wx.setStorageSync("action_type", 32);
    var url = '/pages/faceTest/choosePhoto/choosePhoto?type=32&targetUrl=' + encodeURI("/pages/lottery/luckfriend/preview/preview");
    wx.navigateTo({
      url: url,
    });
  },

  showrule() {
    this.setData({
      show_rule: true
    })
  },

  getBeautyStar(){
    let that = this;
    Utils.showToast("正在载入...");
    Utils.request({
      url: `${baseUrl}/index.php?m=default&c=lottery&a=getBeautyStar`,
      data: {},
      success: function (res) {
        res = JSON.parse(Utils.Trim(res.data));
        var firstUser= [], secondUser  = [], thirdUser = [];
        if(res.length > 0)
        firstUser = res[0];
        if (res.length > 1)
          secondUser = res[1];
        if (res.length > 2)
          thirdUser = res[2];
        that.setData({
          firstUser:firstUser,
          secondUser:secondUser,
          thirdUser:thirdUser
        });
        wx.hideLoading();
      },
      fail:function(res)
      {
        wx.hideLoading();
        Utils.showToast("网络出错，请重试");
      },
      complete:function(res)
      {

      }
    });
  },

  addStars(e) {
    var index = e.currentTarget.dataset.index;
    var number = this.data.new_star_number;
    var type = 0;
    let that = this;
    switch (index) {
      case "2":
        number = this.data.new_star2019_number;
        type = 1;
        break;
      case "3":
        number = this.data.new_star_number_from_score;
        type = 2;
        break;
        case "4":
        number = this.data.new_star_number_from_beauty;
        type = 3;
        break;
    }

    Utils.request({
      url: `${baseUrl}/index.php?m=default&c=lottery&a=getStars`,
      data: {
        type: type
      },
      success: function(res) {
        //console.log(res.data);
        res = JSON.parse(Utils.Trim(res.data));

        if (res.count > 0) {
          switch (index) {
            case "1":
              that.data.star_number += that.data.new_star_number;
              that.data.new_star_number = 0;
              break;
            case "2":
              that.data.star2019_number += that.data.new_star2019_number;
              that.data.new_star2019_number = 0;
              break;
            case "3":
              that.data.star_number += that.data.new_star_number_from_score;
              that.data.new_star_number_from_score = 0;
              break;
            case "4":
              that.data.star_number += that.data.new_star_number_from_beauty;
              that.data.new_star_number_from_beauty = 0;
              break;
          }

          that.setData({
            star_number: that.data.star_number,
            star2019_number: that.data.star2019_number,
            new_star2019_number: that.data.new_star2019_number,
            new_star_number: that.data.new_star_number,
            new_star_number_from_score: that.data.new_star_number_from_score,
            new_star_number_from_beauty:that.data.new_star_number_from_beauty
          })
        }
      }
    })
  },

  refresh() {
    this.setData({
      hasError: false
    });
    this.getStars();
  },

  getNewStars() {
    let that = this;
    Utils.request({
      url: `${baseUrl}/index.php?m=default&c=lottery&a=getNewStars`,
      data: {},
      success: function(res) {
        res = JSON.parse(Utils.Trim(res.data));
        if (res.error == 1) {
          if (res.errorCode != 0)
            Utils.showToast(res.msg);
        } else {
          var new_star_number = 0,
            new_star_number_from_score = 0,
            new_star_number_from_beauty = 0,
            new_star2019_number = 0;
          for (var i = 0; i < res.length; i++) {
            switch (res[i].type) {
              case "0":
                new_star_number++;
                break;
              case "1":
                new_star2019_number++;
                break;
              case "2":
                new_star_number_from_score++;
                break;
              case "3":
                new_star_number_from_beauty++;
                break;
            }
          }
          that.setData({
            hasNew: true,
            new_star_number: new_star_number,
            new_star_number_from_score: new_star_number_from_score,
            new_star_number_from_beauty: new_star_number_from_beauty,
            new_star2019_number: new_star2019_number
          })
        }

      },
      fail: function(res) {
        that.setData({
          hasError: true
        })
      },
      complete: function(res) {}
    })
  },

  getSummary() {
    let that = this;
    Utils.request({
      url: `${baseUrl}/index.php?m=default&c=lottery&a=getSummary`,
      data: {},
      success: function(res) {
        res = JSON.parse(Utils.Trim(res.data));
        if (res.error == 1) {
          if (res.errorCode != 0)
            Utils.showToast(res.msg);
        } else {
          that.setData({
            action_num:res.action_num,
            friend_num: res.friend_num,
            beauty:res.beauty,
            age:res.age,
            match:res.match
          })
        }
      },
      fail: function(res) {
        that.setData({
          hasError: true
        })
      },
      complete: function(res) {}
    })
  },

  getStars() {
    wx.showLoading({
      title: '正在载入...',
    })
    let that = this;
    Utils.request({
      url: `${baseUrl}/index.php?m=default&c=lottery&a=getNumberOfStars`,
      data: {},
      success: function(res) {
        res = JSON.parse(Utils.Trim(res.data));
        if (res.error == 1) {
          Utils.showToast(res.msg);
        } else {
          that.setData({
            luck_score: parseInt(res.luck_score),
            beauty_score:parseInt(res.beauty_score),
            star_number: parseInt(res.star_number),
            star2019_number: parseInt(res.star2019_number)
          })

          that.getNewStars();
        }
        that.setData({
          loaded: true
        })
      },
      fail: function(res) {
        that.setData({
          hasError: true
        })
      },
      complete: function(res) {
        wx.hideLoading();
      }
    })
  },

  goLuckMall() {
    wx.navigateTo({
      url: '/pages/lottery/luckfriend/luckmall/luckmall',
    })
  },

  switchtab(e) {
    var index = e.currentTarget.dataset.index;
    this.setData({
      selected_index: index
    });
    if (index == 1) {
      if (!this.data.loaded)
      {
        this.getStars();
        this.getSummary();
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getBeautyStar();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    //如果是从拍照返回
    var actionType = parseInt(wx.getStorageSync("action_type"));
    if ((actionType == 32 || actionType == 64) && app.globalData.newFaceTest) {
      app.globalData.newFaceTest = false;
      wx.navigateTo({
        url: '/pages/lottery/luckfriend/preview/preview'
      })
    }
  },

  backhome: function() {
    wx.switchTab({
      url: '/pages/lottery/lottery',
    })
  },

  goList:function()
  {
    wx.navigateTo({
      url: '/pages/lottery/luckfriend/matchlist/matchlist',
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: '寻找"20.19"好友，赢春节免费机票',
      imageUrl: "https://wao-files.oss-cn-beijing.aliyuncs.com/holo/friend_share_bg.jpg",
      path: "/pages/lottery/luckfriend/luckfriend",
      success: function(res) {
        //跳转推荐
      }
    }
  }
})