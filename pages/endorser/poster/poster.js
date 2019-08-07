// pages/endorser/poster/poster.js
const app = getApp();
var baseUrl = app.globalData.baseHttpUrl;
let Utils = require("../../../lib/Utils.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    src: "",        //抠图后的src
    img_src: "",    //canvas导出的src
    mode: "widthFix",
    body_position: "",
    canvas_width: "",
    canvas_height: "",

    bac_list: "",
    current_bac: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    app.parseInviter(options);

    var query = wx.createSelectorQuery();
    if (options.src) {
      wx.showLoading({
        title: '加载中...',
      })
      this.getBacList();
      let src = options.src;
      wx.getImageInfo({
        src: src,
        success: function (res) {
          let type = res.type;
          wx.getFileSystemManager().readFile({
            filePath: src, //选择图片返回的相对路径
            encoding: 'base64', //编码格式
            success: res => { //成功的回调
              let base64 = res.data;
              
              let requestObject = {
                apiType: "baidu",
                imgUrl: base64,
                success: that.getImage
              }
              Utils.cutout(requestObject);
            },
            fail: function (res) {
              console.log(res)
            }
          })
          //以下两行注释的是同步方法
          //let base64 = wx.getFileSystemManager().readFileSync(res.tempFilePaths[0], 'base64') 
          //console.log(base64)
        },
        fail:function(res) {
          console.log(res)
        }
      })
    }
  },

  getImage(res) {
    let that = this;
    console.log(res)
    if(!res.error_code) {
      let src = res.foreground;
      this.setData({
        src: src
      })
      
      let requestObject = {
        apiType: "baidu",
        imgUrl: res.foreground,
        success: that.getPosition
      }
      Utils.body_position(requestObject);
    }else{
      wx.showToast({
        title: '图片转换失败',
        icon: 'none',
        duration: 3000
      });
    }
  },

  getPosition(res) {
    console.log(res)
    if (!res.error_code) {
      let pos = res.person_info[0].location;
      this.setData({
        body_position: pos
      })
      if (this.data.src) {
        this.drawPoster()
      }
    } else {
      wx.showToast({
        title: '图片转换失败',
        icon: 'none',
        duration: 3000
      });
    }
  },

  getBacList() {
    let that = this;
    wx.request({
      url: `${app.globalData.baseHttpUrl}/index.php?m=default&c=endorser&a=get_bac_list`,
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {},
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        that.setData({
          bac_list: res,
          current_bac: res[0]
        })

        if(that.data.hangup) {
          that.drawPoster();
          that.setData({
            hangup: false
          })
        }
      }
    });
  },

  //绘制海报
  drawPoster() {
    wx.showLoading({
      title: '加载中...',
    })
    if (!this.data.current_bac) {   //若背景图未加载完成，则标记挂起状态
      this.setData({
        hangup: true
      })
      return
    }
    let that = this;
    let src = this.data.src;
    let pos = this.data.body_position;
    let current_bac = this.data.current_bac;
    const ctx = wx.createCanvasContext('firstCanvas');

    wx.getImageInfo({
      src: current_bac.src,
      success: function (res) {
        that.setData({
          canvas_width: res.width,
          canvas_height: res.height
        })
        let canvas_width = that.data.canvas_width;
        let canvas_height = that.data.canvas_height;

        const fsm = wx.getFileSystemManager();
        src = src.replace(/\ +/g, ""); //去掉空格方法
        src = src.replace(/[\r\n]/g, "");
        const buffer = wx.base64ToArrayBuffer(src);
        const time = new Date().getTime();
        const fileName = `${wx.env.USER_DATA_PATH}/${time}.png`;
        fsm.writeFile({
          filePath: fileName,
          data: buffer,
          encoding: 'binary',
          success() {
            ctx.drawImage(res.path, 0, 0, canvas_width, canvas_height)

            let width = 0;
            let height = 0;
            if (pos.width <= current_bac.width && pos.height <= current_bac.height) {     //若抠图比放置框小
              width = pos.width;
              height = pos.height;
            } else {    //根据比例，缩放抠图使其能完全显示
              let n1 = pos.height / pos.width;
              let n2 = current_bac.height / current_bac.width;
              if (n1 == n2) {
                width = current_bac.width;
                height = current_bac.height;
              } else if (n1 < n2) {
                width = current_bac.width;
                height = current_bac.width * n1;
              } else if (n1 > n2) {
                height = current_bac.height;
                width = current_bac.height / n1;
              }
            }
            ctx.drawImage(fileName, pos.left, pos.top, pos.width, pos.height, current_bac.x, current_bac.y, width, height)
            ctx.draw(true, () => {
              wx.canvasToTempFilePath({
                canvasId: 'firstCanvas',
                x: 0,
                y: 0,
                width: canvas_width,
                height: canvas_height,
                quality: 1,
                success: function success(res) {
                  wx.hideLoading();
                  current_bac.loaded_src = res.tempFilePath;
                  that.setData({
                    img_src: res.tempFilePath,
                    current_bac: current_bac
                  })
                },
                fail: function (e) {
                  console.log(e)
                }
              });
            })
          },
          fail(res) {
            console.log(res)
          },
        });
      },
      fail: function (res) {
        console.log(res)
      }
    })

  },

  chooseBac(e) {
    let that = this;
    let index = parseInt(e.target.dataset.index);
    if (this.data.current_bac.src !== this.data.bac_list[index].src) {
      this.setData({
        current_bac: that.data.bac_list[index]
      })
      if (this.data.current_bac.loaded_src) {
        this.setData({
          img_src: that.data.current_bac.loaded_src
        })
      }else{
        this.drawPoster();
      }
    }
  },

  toggleShare() {
    this.selectComponent("#sharepanel").show();
  },

  onShareFinished() {
    this.setData({
      show_jump: true
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
  onShareAppMessage: function () {
    let that = this;
    this.setData({
      show_jump: true
    })
    
    return {
      title: "分享测试",
      path: `/pages/authorize/authorize?inviter=${app.globalData.current_user_id}`,
      imageUrl: that.data.img_src,
    }
  }
})