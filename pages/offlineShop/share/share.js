// pages/offlineShop/share/share.js

let app = getApp();
let baseUrl = app.globalData.baseHttpUrl;
let dataUrl = app.globalData.dataUrl;

let Utils = require("../../../lib/Utils.js")
let Sign = require("../../../lib/Sign.js")

let ctx = "";
let scroll_top = 0;
let n = "";   

let current_index = "";   //当前被拖动的tag及其位置
let current_x = 0;
let current_y = 0;

let delete_left = "";
let delete_right = "";
let delete_top = "";
let delete_bottom = "";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // src: "http://wao-files.oss-cn-beijing.aliyuncs.com/holo/%E5%AE%9D%E5%B2%9B1.jpg",    //原图src
    src: "",    //原图src
    img_width: "",
    img_height: "",

    canvas_width: "100vw",
    canvas_height: "",
    share_img: "",     //canvas导出的src

    screen_width: "",
    screen_height: "",
    tags: [],
    show_delete: false,
    delete_active: false,
    delete_top_height: ""     //删除按钮距离上部的基准距离，取背景图片高度和scroll-view可见窗口高度中较小的那个
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    if(options.shop_id) {
      this.setData({
        shop_id: options.shop_id
      })
    }
    if(options.src) {
      this.setData({
        src: options.src
      })
    }else{
      let that = this;
      wx.getSetting({
        success: function (res) {
          if (res.authSetting["scope.camera"]) {
            that.chooseImage();
          }
        }
      })
    }

    let that = this;
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          screen_width: res.screenWidth,
          screen_height: res.screenHeight
        })
        n = res.screenWidth / 750
      },
    })
    //this.drawCanvas();
  },

  chooseImage() {
    let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success(res) {
        that.setData({
          src: res.tempFilePaths[0],
          tags: [],
          share_img: ""
        })
        //清空上张图的delete位置信息
        if (delete_left) {
          delete_left = "";
          delete_right = "";
          delete_top = "";
          delete_bottom = "";
        }
      }
    })
  },

  onImageLoad(e) {
    let that = this;
    this.createSelectorQuery().select("#editor").boundingClientRect(function (res) { 
      that.setData({
        area_width: res.width,
        area_height: res.height,
        image_height: res.height
      })
      that.createSelectorQuery().select("#editor-wrapper").boundingClientRect(function (res2) {
        if (res2.height >= res.height) {
          that.setData({
            delete_top_height: res.height
          })
        }else{
          that.setData({
            delete_top_height: res2.height
          })
        }
      }).exec();
    }).exec();
  },

  toggleChooseTag(e) {
    let index = e.detail.index;
    let tags = this.data.tags;
    let chosen_tag = this.data.chosen_tag;

    if (tags[index].chosen) {
      tags[index].chosen = 0;
      chosen_tag = "";
    } else {
      tags[index].chosen = 1;
      chosen_tag = tags[index];
      chosen_tag.index = index;
    }
    this.setData({
      tags: tags,
      chosen_tag: chosen_tag
    })
  },

  drawCanvas() {
    wx.showLoading({
      title: '加载中...',
    })
    let that = this;
    // if (img_src.indexOf('http') >=0 && img_src.indexOf('https') == -1) {
    //   img_src = img_src.replace('http', 'https');
    // }
    ctx = wx.createCanvasContext('firstCanvas');

    wx.getImageInfo({
      src: that.data.src,
      success: function (res) {
        console.log(res)
        that.setData({
          canvas_width: res.width,
          canvas_height: res.height
        })

        let canvas_width = res.width;
        let canvas_height = res.height;
        let n = canvas_width / that.data.screen_width;  
        let m = that.data.screen_width / 750;  
        ctx.drawImage(res.path, 0, 0, canvas_width, canvas_height);

        ctx.scale(n,n);
        
        //绘制标签
        let tags = that.data.tags;
        console.log(tags)
        for(let i=0;i<tags.length;i++) {
          let tag = tags[i];
          if(!tag.show) {
            continue;
          }
          tag.y = Math.round(tag.y + 25 * m);
          if(tag.left) {
            tag.x = Math.round(tag.x + tag.tag_width - 20 * m);
            //圆点
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.arc((tag.min_left ? tag.min_left : tag.x), tag.y, 10 * m, 0, 2 * Math.PI);
            ctx.closePath()
            ctx.fill();

            //线
            ctx.beginPath();
            ctx.strokeStyle = "white";
            ctx.lineWidth = "1";
            ctx.moveTo((tag.min_left ? tag.min_left : tag.x) - 10 * m, tag.y);
            ctx.lineTo((tag.min_left ? tag.min_left : tag.x) - 10 * m - 30 * m, tag.y);
            ctx.closePath()
            ctx.stroke();

            //标签
            ctx.fontStyle = "white";
            ctx.setFontSize(28 * m);
            ctx.setTextAlign('right');
            ctx.setTextBaseline('top')
            ctx.fillStyle = "rgba(0,0,0,0.2)";
            let text_width = ctx.measureText(tag.text).width;
            text_width = text_width + 2 * 20 * m;
            ctx.strokeStyle = "white";
            ctx.lineWidth = "1";
            that.drawRoundRect(ctx, (tag.min_left ? tag.min_left : tag.x) - 10 * m - 30 * m - text_width, tag.y - 25 * m, text_width, 50 * m, 25 * m);
            ctx.stroke();
            ctx.fill();
            ctx.fillStyle = "white";
            ctx.fillText(tag.text, (tag.min_left ? tag.min_left : tag.x) - 10 * m - 30 * m - 20 * m, tag.y - 25 * m + (48 - 28) / 2 * m);
          }else{
            console.log(tag)
            tag.x = Math.round(tag.x + 20 * m);
            //圆点
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.arc((tag.min_right ? tag.min_right : tag.x), tag.y, 10 * m, 0, 2 * Math.PI);
            ctx.closePath()
            ctx.fill();

            //线
            ctx.beginPath();
            ctx.strokeStyle = "white";
            ctx.lineWidth = "1";
            ctx.moveTo((tag.min_right ? tag.min_right : tag.x) + 10 * m, tag.y);
            ctx.lineTo((tag.min_right ? tag.min_right : tag.x) + 10 * m + 30 * m, tag.y);
            ctx.closePath()
            ctx.stroke();

            //标签
            ctx.fontStyle = "white";
            ctx.setFontSize(28 * m);
            ctx.setTextAlign('left');
            ctx.setTextBaseline('top')
            ctx.fillStyle = "rgba(0,0,0,0.2)";
            let text_width = ctx.measureText(tag.text).width;
            text_width = text_width + 2 * 20 * m;
            ctx.strokeStyle = "white";
            ctx.lineWidth = "1";
            that.drawRoundRect(ctx, (tag.min_right ? tag.min_right : tag.x) + 10 * m + 30 * m, tag.y - 25 * m, text_width, 50 * m, 25 * m);
            ctx.stroke();
            ctx.fill();
            ctx.fillStyle = "white";
            ctx.fillText(tag.text, (tag.min_right ? tag.min_right : tag.x) + 10 * m + 30 * m + 20 * m, tag.y - 25 * m + (48 - 28) / 2 * m);
          }
          
        }

        //获取二维码
        Utils.request({
          url: baseUrl + '/index.php?m=default&c=flow&a=generateQRCode',
          data: {
            path: "pages/takephoto/takephoto",
            session_id: app.globalData.session_id,
            shop_id: that.data.shop_id,
            scene: `shop_id=${that.data.shop_id}`
          },
          success: function (res) {
            console.log(res)
            res = JSON.parse(Utils.Trim(res.data));
            if (res.status && res.status == 1) {
              let qrcode_path = baseUrl + "/" + res.info;
              wx.getImageInfo({
                src: qrcode_path,
                success: function (res2) {
                  console.log(res2)
                  var x = (canvas_width) / n - 60 - 12;
                  var y = (canvas_height) / n - 60 - 12;
                  
                  ctx.drawImage(res2.path, x, y, 60, 60);
                  ctx.draw(true, () => {
                    wx.canvasToTempFilePath({
                      canvasId: 'firstCanvas',
                      x: 0,
                      y: 0,
                      width: canvas_width,
                      height: canvas_height,
                      quality: 1,
                      success: function success(res) {
                        that.setData({
                          share_img: res.tempFilePath
                        })
                      },
                      fail: function (res) {
                        //console.log(res);
                      },
                      complete: function complete(e) {
                        wx.hideLoading();
                      }
                    });
                  })
                },
                fail: function (res) {
                  console.log(res)
                },
                complete: function (res) {

                }
              })
            } else {
              wx.hideLoading()
              wx.showToast({
                title: '请求失败，请检查网络重试',
                icon: 'none',
                duration: 2000
              })
            }
          }
        });
      }
    })
  },

  // 用于canvas绘制圆角矩形
  drawRoundRect(cxt, x, y, width, height, radius) {
    cxt.beginPath();
    cxt.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
    cxt.lineTo(width - radius + x, y);
    cxt.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2);
    cxt.lineTo(width + x, height + y - radius);
    cxt.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2);
    cxt.lineTo(radius + x, height + y);
    cxt.arc(radius + x, height - radius + y, radius, Math.PI * 1 / 2, Math.PI);
    cxt.closePath();
  },

  chooseTag(e) {
    let x = e.detail.x;
    let y = e.detail.y + scroll_top;
    console.log(e)
    wx.navigateTo({
      url: `/pages/offlineShop/share/chooseTag/chooseTag?x=${x}&y=${y}`,
    })
  },

  onScroll(e) {
    scroll_top = e.detail.scrollTop;
  },

  //拖动触发
  changePos(e) {
    //console.log(e.detail.x,e.detail.y)
    let that = this;
    current_index = e.currentTarget.dataset.index;
    current_x = e.detail.x;
    current_y = e.detail.y;

    if(!this.data.show_delete) {
      this.setData({
        show_delete: true
      })
      
      if(!delete_left) {
        this.createSelectorQuery().select("#delete").boundingClientRect(function (res) { 
          console.log(res)
          delete_top = res.top;
          delete_right = res.right;
          delete_bottom = res.bottom;
          delete_left = res.left;
        }).exec();
      }
    }

    if(delete_left && this.data.show_delete) {
      let tag = this.data.tags[current_index];
      let center_x = current_x + tag.tag_width / 2;
      let center_y = current_y + 25 * n;
      //console.log(center_x, center_y)
      if (delete_left < center_x && delete_right > center_x && delete_top < center_y - scroll_top && delete_bottom > center_y - scroll_top) {
        if (!that.data.delete_active) {
          that.setData({
            delete_active: true
          })
        }
      } else {
        if (that.data.delete_active) {
          that.setData({
            delete_active: false
          })
        }
      }
    }

    // let tags = this.data.tags;
    // let index = e.currentTarget.dataset.index;
    // tags[index].x = e.detail.x;
    // tags[index].y = e.detail.y;
    // this.setData({
    //   tags: tags
    // })
    // if (e.detail.y > this.data.image_height) {
    //   this.setData({
    //     delete_active: true
    //   })
    // }else{
    //   this.setData({
    //     delete_active: false
    //   })
    // }
  },

  prevent() {

  },

  onTouchEnd(e) {
    let index = e.currentTarget.dataset.index;
    let tags = this.data.tags;
    if (this.data.delete_active) {
      tags[index].show = false;
      this.setData({
        tags: tags,
        show_delete: false,
        delete_active: false
      })
    }else{
      if(index == current_index) {
        tags[index].x = current_x;
        tags[index].y = current_y;
        this.setData({
          tags: tags,
          show_delete: false
        })
      }
    }

    // if (tags[index].y > this.data.image_height) {
    //   tags[index].show = false;
    //   this.setData({
    //     tags: tags,
    //     delete_active: false
    //   })
    // } 
    
  },

  //改变标签方向
  changeDirect(e) {
    let that = this;
    let tags = this.data.tags;
    let index = e.currentTarget.dataset.index;
    let tag = tags[index];
    let screen_width = this.data.screen_width;

    this.createSelectorQuery().select(`#tag-${index}`).boundingClientRect(function (res) {
      if (tag.left) {   //左转右
        tag.left = 0;
        if (screen_width - res.right < res.width) {
          tag.x = screen_width - res.width;
          console.log(1)
        }else{
          tag.x = tag.x + res.width - 40 * tag.n;
          console.log(2)
        }
      }else{    //右转左
        tag.left = 1;
        if (res.left < res.width) {
          tag.x = 0;
          console.log(3)
        }else{
          tag.x = tag.x - res.width + 40 * tag.n;
          console.log(4)
        }
      }
      
      that.setData({
        tags: tags
      })
    }).exec();
    

    // if (!tag.min_left && !tag.min_right) {
    //   this.createSelectorQuery().select(`#tag-${index}`).boundingClientRect(function (res) {
    //     console.log(res)
    //     tag.width = res.width;
    //     if (!tag.left) {
    //       if (res.left < res.width) {
    //         tag.min_left = tag.width
    //       }
    //     } else {
    //       if (screen_width - res.right < res.width) {
    //         tag.min_right = tag.x - (res.width - (screen_width - res.right))
    //       }
    //     }

    //     let min_left = tag.min_left;
    //     let min_right = tag.min_right;
    //     let width = tag.width;

    //     if (tag.left) {
    //       tag.left = 0;
    //     } else {
    //       tag.left = 1
    //     }

    //     if (!tag.min_left) {
    //       tag.min_left = min_left
    //     }
    //     if (!tag.min_right) {
    //       tag.min_right = min_right
    //     }

    //     console.log(tag)
    //     that.setData({
    //       tags: tags
    //     })
    //   }).exec()
    // } else {
    //   if (tag.left) {
    //     tag.left = 0;
    //   } else {
    //     tag.left = 1
    //   }

    //   console.log(tag)
    //   this.setData({
    //     tags: tags
    //   })
    // }
  },

  //保存至相册
  saveImageToPhotosAlbum: function () {
    if (!this.data.share_img) {
      wx.showModal({
        title: '提示',
        content: '图片绘制中，请稍后重试',
        showCancel: false
      })
    }
    var that = this;
    wx.saveImageToPhotosAlbum({
      filePath: that.data.share_img,
      success: (res) => {
        wx.showToast({
          title: '保存成功',
        })
      },
      fail: (err) => {
        //console.log(err)
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