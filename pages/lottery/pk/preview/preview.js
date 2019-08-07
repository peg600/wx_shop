// pages/lottery/action/preview/preview.js
import ossUploader from './../../../../lib/aliyunOSS.js';
let app = getApp();
let baseUrl = app.globalData.baseHttpUrl;
var fail = function(res) {
  wx.showToast({
    title: '网络错误，请重试',
    icon: 'none',
    duration: 3000
  })
};

var Trim = function Trim(str) {
  return str.replace(/(^\s*)|(\s*$)/g, "");
};

//滤镜
const ImageFilters = require('../../../../lib/weImageFilters.js')
const Helper = require('../../../../lib/weImageFiltersHelper.js')

let helper = new Helper({
  canvasId: 'maskImage',
  width: 300,
  height: 400
})

Page({
  /**
   * 页面的初始数据
   */
  data: {
    imgSource: "",
    beautyImageSource: "",
    action_id: 0,
    action_type: 0,
    valid_action: true,
    showRecommand: false,
    isOwner: false,
    ready: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    this.setData({
      navbar_height: app.globalData.height
    })
    if (options.id) {
      this.data.action_id = options.id;
      this.getActionInfo();
    } else {
      //新Action
      this.setData({
        isOwner: true
      })

      var beautyImage = wx.getStorageSync("beautyimage")
      if (beautyImage && beautyImage.length > 0) {
        var array = wx.base64ToArrayBuffer(beautyImage);
        var base64 = wx.arrayBufferToBase64(array);
        this.data.beautyImageSource = base64;
        this.setData({
          imgSource: "data:image/png;base64," + base64
        });
      } else {
        var scoredImage = JSON.parse(wx.getStorageSync("scoredImage"));
        this.setData({
          imgSource: scoredImage.local
        })
      }
    }
  },

  getActionInfo() {
    var that = this;
    var id = that.data.action_id;
    wx.showLoading({
      title: '正在加载...',
    })
    wx.request({
      url: `${baseUrl}/index.php?m=default&c=ActionFlow&a=getActionInfo`,
      method: 'POST',
      dataType: 'txt',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        session_id: wx.getStorageSync('session_id'),
        action_id: id
      },
      success: function(res) {
        var action = JSON.parse(Trim(res.data));
        if (action.error == "1") {
          that.setData({
            valid_action: false
          })
          wx.showToast({
            title: 'OOPS,你正在查看的信息不存在!',
            icon: 'none',
            duration: 3000
          })
          return;
        }
        that.setData({
          action_type: parseInt(action.action_type),
          isOwner: (action.is_action_owner == "1" ? true : false),
          imgSource: action.action_beauty_image_url
        });

        that.createImageMask();
      },
      fail: fail,
      complete: function(res) {
        wx.hideLoading();
      }
    });
  },


  createImageMask() {
    if (!this.data.isOwner) {
      let that = this;
      wx.downloadFile({
        url: that.data.imgSource,
        success: function(res) {
          helper.initCanvas(res.tempFilePath, () => {
            var data = helper.createImageData();
            data = ImageFilters.Mosaic(ImageFilters.StackBlur(data, 60), 20);
            helper.putImageData(data, () => {
              that.setData({
                ready: true
              })
            }, "resultmaskImage");
          });
        }
      })

    }
  },

  submitAction() {
    var that = this;
    if (this.data.isOwner) {
      if (that.data.action_id == 0) {
        //上传美颜图片
        if (this.data.beautyImageSource.length > 0) {
          wx.showLoading({
            title: '正在提交...',
          })
          const fsm = wx.getFileSystemManager();
          var showImgData = this.data.beautyImageSource;
          showImgData = showImgData.replace(/\ +/g, ""); //去掉空格方法
          showImgData = showImgData.replace(/[\r\n]/g, "");
          const buffer = wx.base64ToArrayBuffer(showImgData);
          var scoredImage = JSON.parse(wx.getStorageSync("scoredImage"));
          var index = scoredImage.local.lastIndexOf("/");
          var fileName = scoredImage.local.substr(index + 1);
          var date = new Date();
          var randomString = date.toLocaleTimeString();
          var localFileName = wx.env.USER_DATA_PATH + '/' + fileName;

          fsm.writeFile({
            filePath: localFileName,
            data: buffer,
            encoding: 'binary',
            success: function(res) {
              ossUploader.upload(localFileName, "beauty_" + fileName, function(res, imageUrl) {
                var session_id = wx.getStorageSync('session_id');
                var action_type = parseInt(wx.getStorageSync("action_type"));
                if (isNaN(action_type))
                  action_type = 32;
                var scoreobj = JSON.parse(wx.getStorageSync("score"));
                var image_url = scoredImage.url;
                var beauty_url = imageUrl;
                var score = 0;
                switch (action_type) {
                  //大笑
                  case 2:
                    score = parseInt(scoreobj.attributes.smile.value);
                    break;
                  case 4:
                    score = parseInt(scoreobj.attributes.emotion.anger);
                    break;
                  case 8:
                    score = parseInt(scoreobj.attributes.emotion.sadness);
                    break;
                  case 16:
                    score = parseInt(scoreobj.attributes.emotion.surprise);
                    break;
                  case 32:
                    score = parseInt(scoreobj.attributes.age);
                    break;
                };

                //提交
                wx.request({
                  url: `${baseUrl}/index.php?m=default&c=lottery&a=newAction`,
                  method: 'POST',
                  dataType: 'txt',
                  header: {
                    'content-type': 'application/x-www-form-urlencoded'
                  },
                  data: {
                    session_id: wx.getStorageSync('session_id'),
                    action_type: action_type,
                    action_score: score,
                    action_image_url: image_url,
                    action_beauty_image_url: beauty_url
                  },
                  success: function(res) {
                    res = JSON.parse(Trim(res.data));
                    if (res.id > 0) {
                      that.setData({
                        action_id: res.id
                      })
                      wx.showToast({
                        title: '提交成功:' + that.data.action_id,
                        duration: 3000
                      });

                      that.showSharePanel();
                    } else {
                      fail();
                    }
                  },
                  fail: function(res) {
                    fail();
                  },
                  complete: function(res) {
                    wx.hideLoading();
                  }
                });
              }, function(res) {
                wx.hideLoading();
                fail();
              })
            },
            fail: function(res) {
              wx.showToast({
                title: '生成过程中发生错误，请重试!',
                icon: 'none',
                duration: 2000
              })
            }
          });
        }
      } else
        this.showSharePanel();
    } else {
      var url = '/pages/faceTest/choosePhoto/choosePhoto?type=' + this.data.action_tpye + "&targetUrl=" + encodeURI("/pages/lottery/action/preview/preview");
      wx.navigateTo({
        url: '',
      })
    }
  },

  recommand() {
    this.setData({
      showRecommand: true
    })
  },

  showSharePanel() {
    var sharePanel = this.selectComponent("#sharePanel");
    if (sharePanel)
      sharePanel.show();
  },



  drawShareImage() {

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
    let that = this;
    var path = "/pages/lottery/action/preview/preview?id=" + that.data.action_id;
    return {
      title: "挑战表情帝，赢春节免费机票",
      path: path
    }
  }
})