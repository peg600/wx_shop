  // pages/lottery/luckfriend/preview/preview.js
  import ossUploader from './../../../../lib/aliyunOSS.js';
  let app = getApp();
  let baseUrl = app.globalData.baseHttpUrl;
  let Utils = require("../../../../lib/Utils.js")
  let QQMapWX = require('../../../../lib/qqmap-wx-jssdk.js');
  let qqmapsdk;

  Page({
    /**
     * 页面的初始数据
     */
    data: {
      imgSource: "",
      autoChecked: false,
      img_scale: 1.0,
      matchImgSource: "",
      isOwner: false,
      show_rule: false,
      face_rectangle: [],
      img_size: [],
      autoHide: true,
      share_img: "",
      currentAction: [],
      action_id: 0,
      action_type: 0,
      child_action_id: 0,
      childAction: [],
      similarity: 0,
      canvas_width: 375,
      canvas_height: 667,
      canvas_height1: 485,
      valid_action: true,
      resultText: "",
      luck_info: "",
      gender: "Male",
      beauty: 90,
      age: 20,
      matchGender: "Male",
      matchBeauty: 90,
      matchAge: 20,
      luck_type: -1
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
      qqmapsdk = new QQMapWX({ //坐标sdk
        key: 'MLMBZ-OBT3F-XGEJR-JSZAN-DXVI7-PIBA5'
      });
      if (options.scene) {
        const scene = decodeURIComponent(options.scene);
        options = Utils.parseScene(scene);
      }
      if (options.id) {
        this.data.action_id = options.id;
        this.getActionInfo();
      } else {
        //新Action
        this.setData({
          isOwner: true
        })
        var score = JSON.parse(wx.getStorageSync("score"));
        var img_size = Utils.toSize(wx.getStorageSync("img_size"));
        var img_scale = 492 / img_size.width;
        var beautyImage = wx.getStorageSync("beautyimage")
        var face_rectangle = this.roundFaceRectangle(score.face_rectangle, img_size);
        if (beautyImage && beautyImage.length > 0) {
          var array = wx.base64ToArrayBuffer(beautyImage);
          var base64 = wx.arrayBufferToBase64(array);
          this.data.beautyImageSource = base64;
          this.setData({
            imgSource: "data:image/png;base64," + base64,
            face_rectangle: face_rectangle,
            beauty: (score.attributes.beauty.value),
            age: score.attributes.age.value,
            gender: score.attributes.gender.value,
            img_size: img_size,
            img_scale: img_scale
          });
        } else {
          var scoredImage = JSON.parse(wx.getStorageSync("scoredImage"));
          this.setData({
            imgSource: scoredImage.local,
            face_rectangle: face_rectangle,
            beauty: (score.attributes.beauty.value),
            age: score.attributes.age.value,
            gender: score.attributes.gender.value,
            img_size: img_size,
            img_scale: img_scale
          })
        }
      }
    },

    getActionInfo(id) {
      var that = this;
      if(id == undefined)
        id = that.data.action_id;
      wx.showLoading({
        title: '正在加载...',
      })
      Utils.request({
        url: `${baseUrl}/index.php?m=default&c=lottery1&a=getActionInfo`,
        data: {
          action_id: id
        },
        success: function(res) {
          var action = JSON.parse(Utils.Trim(res.data));
          if (action.error == "1") {
            that.setData({
              valid_action: false
            })
            wx.showToast({
              title: 'OOPS, 你正在查看的信息不存在!',
              icon: 'none',
              duration: 3000
            })
            return;
          }
          var img_size = Utils.toSize(action.img_size);
          var img_scale = 492 / img_size.width;
          //如果是Match
          if(action.parent_action_id > 0)
          {
            that.setData({
              similarity: parseInt(action.action_score3),
              resultText: action.result_text,
              child_action_id: action.action_id,
              childAction: action,
              matchBeauty: parseInt(action.action_score2),
              matchGender: parseInt(action.action_score1) == 0 ? "Male" : "Female",
              img_scale: img_scale,
              matchAge: action.action_score,
              face_rectangle: that.roundFaceRectangle(Utils.toRectangle(action.face), Utils.toSize(action.img_size)),
              img_size: Utils.toSize(action.img_size),
              action_type: parseInt(action.action_type),
              isOwner: (action.is_action_owner == "1" ? true : false),
              matchImgSource: action.action_beauty_image_url
            });

            that.getActionInfo(parseInt(action.parent_action_id));
          }
          else
          {
            var actionType = that.data.actionType;
            if (actionType < 64 || actionType == undefined)
              actionType = parseInt(action.action_type);
            that.setData({
              currentAction: action,
              beauty: parseInt(action.action_score2),
              gender: parseInt(action.action_score1) == 0 ? "Male" : "Female",
              img_scale: img_scale,
              age: action.action_score,
              face_rectangle: that.roundFaceRectangle(Utils.toRectangle(action.face), Utils.toSize(action.img_size)),
              img_size: Utils.toSize(action.img_size),
              action_type: actionType,
              isOwner: (action.is_action_owner == "1" ? true : false),
              imgSource: action.action_beauty_image_url
            });
          }
        },
        complete: function(res) {
          wx.hideLoading();
        }
      });
    },

    getLocation: function() {
      var that = this;
      var callback = function() {
        var fail = function() {
          Utils.showToast("提交错误，请重试!");
        }
        that.setData({
          luck_type: -1
        })
        var action_type = parseInt(wx.getStorageSync("action_type"));
        if (isNaN(action_type))
          action_type = 32;
        if (that.data.isOwner) {
          if (that.data.action_id == 0 || action_type == 64) {
            //上传美颜图片
            if (that.data.beautyImageSource.length > 0) {
              wx.showLoading({
                title: '正在提交...',
              })
              const fsm = wx.getFileSystemManager();
              var showImgData = that.data.beautyImageSource;
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
                    var scoreobj = JSON.parse(wx.getStorageSync("score"));
                    var image_url = scoredImage.url;
                    var beauty_url = imageUrl;
                    var score = 0;
                    var score1 = 0,
                      score2 = 0;
                    var face = scoreobj.face_rectangle.left + "," + scoreobj.face_rectangle.top + "," + scoreobj.face_rectangle.width + "," + scoreobj.face_rectangle.height;
                    var img_size = wx.getStorageSync("img_size");
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
                      case 64:
                        score = parseInt(scoreobj.attributes.age.value);
                        score1 = scoreobj.attributes.gender.value.toLowerCase() == "male" ? 0 : 1;
                        score2 = (scoreobj.attributes.beauty.value);
                        break;
                    };
                    var url = `${baseUrl}/index.php?m=default&c=lottery1&a=newAction`;
                    Utils.request({
                      url: url,
                      data: {
                        action_type: action_type,
                        action_score: score,
                        parent_action_id: that.data.action_id,
                        action_score1: score1,
                        action_score2: score2,
                        action_image_url: image_url,
                        action_beauty_image_url: beauty_url,
                        user_location: app.globalData.user_location,
                        face: face,
                        img_size: img_size
                      },
                      success: function(res) {
                        res = JSON.parse(Utils.Trim(res.data));
                        if (res.id > 0) {
                          if (action_type != 64) {
                            that.data.currentAction.action_beauty_image_url = beauty_url;
                            that.setData({
                              action_id: res.id
                            })
                            that.showSharePanel();
                            wx.hideLoading();
                          } else {
                            that.data.childAction.action_beauty_image_url = beauty_url;
                            that.data.child_action_id = res.id;
                            wx.getUserInfo({
                              success:function(res)
                              {
                                that.data.childAction.avatar_url = res.userInfo.avatarUrl;
                                that.data.childAction.nick_name = res.userInfo.nickName;

                                that.setData({
                                  childAction: that.data.childAction
                                })
                              }
                            })
                            that.setData({
                              child_action_id: res.id,
                            })
                            that.match();
                          }
                        } else {
                          fail();
                        }
                      },
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
            that.showSharePanel();
        } else {
          var url = '/pages/faceTest/choosePhoto/choosePhoto?type=64&targetUrl=' + encodeURI("/pages/lottery/luckfriend/preview/preview");
          wx.navigateTo({
            url: url,
          })
        }
      }

      if (app.globalData.user_location && app.globalData.user_location.length > 0) {
        callback();
        return;
      }
      wx.showLoading({
        title: '定位城市...',
      })
      wx.getLocation({
        success: function(res) {
          app.globalData.user_location = res.latitude + " " + res.longitude
          qqmapsdk.reverseGeocoder({
            location: {
              latitude: res.latitude,
              longitude: res.longitude
            },
            success: function(res) {
              if (res.status == 0) {
                let city = res.result.address_component.city;
                app.globalData.user_location = city;
              }
            },
            fail: function(res) {

            },
            complete: function(res) {
              wx.hideLoading();
              callback();
            }
          });
        },
        fail: function(res) {
          wx.navigateTo({
            url: '/pages/authorize/authorize?type=4',
          })
        },
        complete: function(res) {
          wx.hideLoading();
        }
      })
    },

    submitAction() {
      //不检查航程，直接提交
      this.getLocation();
      //this.selectComponent("#airlineChecker").hasAirlineAddress(false);
    },

    noAirSetting: function() {
      let that = this;
      wx.showModal({
        title: '提示',
        content: '参与赢春节机票的活动需要你提交春节的航程计划，是否提交?如果选择不提交，只能参与免费兑换商品的活动。',
        confirmText: '提交航程',
        cancelText: '不提交',
        success: function(res) {
          if (res.confirm) {
            that.selectComponent("#airlineChecker").redirect();
          } else
            that.getLocation();
        }
      })
    },

    hasAirSetting: function() {
      this.getLocation();
    },

    recommand() {
      this.setData({
        showRecommand: true
      })
    },

    goIndex() {
      wx.navigateTo({
        url: '/pages/lottery/luckfriend/luckfriend',
      })
    },

    showSharePanel() {
      var sharePanel = this.selectComponent("#sharePanel");
      if (sharePanel)
        sharePanel.show();
    },

    strokeRoundRect(ctx, x, y, w, h, r, stroke, dashed, arc) {
      // 开始绘制
      ctx.beginPath()
      if (stroke)
        ctx.setStrokeStyle(stroke);
      ctx.setFillStyle('transparent')
      // 左上角
      if (arc == undefined)
        arc = true;
      if (arc)
        ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)
      else {
        ctx.moveTo(x, y + r);
        ctx.lineTo(x, y);
        ctx.lineTo(x + r, y)
      }
      if (!dashed)
        ctx.lineTo(x + w - r, y)
      // 右上角
      if (arc)
        ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2)
      else {
        ctx.moveTo(x + w - r, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w, y + r);
      }
      if (!dashed)
        ctx.lineTo(x + w, y + h - r)
      // 右下角
      if (arc)
        ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5)
      else {
        ctx.moveTo(x + w, y + h - r);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x + w - r, y + h);
      }
      if (!dashed)
        ctx.lineTo(x + r, y + h)

      if (arc)
        ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI);
      else {
        ctx.moveTo(x + r, y + h);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x, y + h - r)
      }
      if (!dashed) {
        ctx.lineTo(x, y + r);
        ctx.closePath();
      }
      if (stroke)
        ctx.stroke();
      ctx.fill();
      //ctx.clip();
      //ctx.setFillStyle("white");
    },

    roundRect(ctx, x, y, w, h, r, r1, r2, r3) {
      if (r2 == undefined)
        r2 = r;
      if (r3 == undefined)
        r3 = r;
      if (r1 == undefined)
        r1 = r;
      // 开始绘制
      ctx.beginPath()
      // 因为边缘描边存在锯齿，最好指定使用 transparent 填充
      // 这里是使用 fill 还是 stroke都可以，二选一即可
      ctx.setFillStyle('transparent')
      // 左上角
      ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)

      // border-top
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + w - r1, y)
      //ctx.lineTo(x + w, y + r)
      // 右上角
      ctx.arc(x + w - r1, y + r1, r1, Math.PI * 1.5, Math.PI * 2)

      // border-right
      ctx.lineTo(x + w, y + h - r2)
      //ctx.lineTo(x + w - r, y + h)
      // 右下角
      ctx.arc(x + w - r2, y + h - r2, r2, 0, Math.PI * 0.5)

      // border-bottom
      ctx.lineTo(x + r3, y + h)
      //ctx.lineTo(x, y + h - r)
      // 左下角
      ctx.arc(x + r3, y + h - r3, r3, Math.PI * 0.5, Math.PI)

      // border-left
      ctx.lineTo(x, y + r)
      //ctx.lineTo(x + r, y)

      // 这里是使用 fill 还是 stroke都可以，二选一即可，但是需要与上面对应
      ctx.fill()
      // ctx.stroke()
      ctx.closePath()
      // 剪切
      ctx.clip()
      ctx.setFillStyle('white')
    },

    //绘制居中对齐的文本
    drawCenterText(ctx, text, top, left, width) {
      var text1 = text;
      if (width) {
        var length = 0,
          i = 0;
        text1 = "";
        for (i = 0; i < text.length; i++) {
          length += ctx.measureText(text[i]).width;
          if (length >= width) {
            break;
          }
          text1 += text[i];
        }
        if (i < text.length - 1)
          text1 += "...";
      } {
        var length = ctx.measureText(text1).width;
        left = left - length / 2;
        ctx.fillText(text1, left, top);
      }
    },

    drawResultShareImage(failCallback) {
      let that = this;
      wx.showLoading({
        title: '图片生成中(1/6)',
      })
      var left = 100,
        top = 329,
        right = 64,
        bottom = 23;
      var user_name = "";
      let n = 2; // wx.getSystemInfoSync().pixelRatio;
      let scale = 2;
      let width = 375 * scale * n;
      let height = 620 * scale * n;
      let ctx = wx.createCanvasContext('firstCanvas1');
      ctx.stroke();
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);
      ctx.scale(scale, scale)
      var fail = function(res) {
        Utils.showToast("生成图片失败,请重试！");
        wx.hideLoading();
        if (failCallback)
          failCallback();
      }

      var drawQrCode = function(ctx, owner, scale) {
        // 二维码
        Utils.request({
          url: `${baseUrl}/index.php?m=default&c=flow&a=generateQRCode`,
          page: that,
          data: {
            scene: ``,
            path: "pages/lottery/luckfriend/luckfriend" //注意此参数根目录不加“/”
          },
          success: function(res) {
            res = JSON.parse(Utils.Trim(res.data));
            if (res.status && res.status == 1) {
              let qrcode_path = res.info;
              wx.getImageInfo({
                src: qrcode_path,
                success: function(res2) {
                  var x = width / n / scale / 2 - (43 / 2);
                  var y = height / n / scale - (43 + 75);
                  ctx.save();
                  that.roundRect(ctx, x, y, 43, 43, 21);
                  ctx.drawImage(res2.path, x, y, 43, 43);
                  ctx.restore();
                  ctx.draw(true, () => {
                    wx.canvasToTempFilePath({
                      canvasId: 'firstCanvas1',
                      x: 0,
                      y: 0,
                      width: width,
                      height: height,
                      quality: 1,
                      success: function success(res) {
                        that.setData({
                          share_img: res.tempFilePath
                        })
                      },
                      fail: function(res) {
                        //console.log(res);
                      },
                      complete: function complete(e) {
                        wx.hideLoading();
                      }
                    });
                  })
                },
                complete: function(res) {

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
            wx.hideLoading();
            wx.showToast({
              title: '请求失败，请检查网络重试',
              icon: 'none',
              duration: 2000
            })
          },
          complete: function(res) {

          }
        })
      }

      var drawLeftHeadImage = function(ctx, that, scale) {
        wx.getImageInfo({
          src: that.data.currentAction.avatar_url,
          success: function(res1) {
            ctx.save();
            //左侧图片
            var imgWidth = 50;
            var left = 57;
            var top = 38;
            var imgHeight = res1.height / res1.width * imgWidth;
            that.roundRect(ctx, left, top, imgWidth, imgHeight, 25);
            ctx.drawImage(res1.path, left, top, imgWidth, imgHeight);
            ctx.restore();

            //右侧头像
            wx.showLoading({
              title: '图片生成中(5/6)',
            })
            drawRightHeadImage(ctx, that, scale);
          },
          fail: fail
        })
      }

      var drawRightHeadImage = function(ctx, that, scale) {
        wx.getUserInfo({
          success: function(res) {
            wx.getImageInfo({
              src: res.userInfo.avatarUrl,
              success: function(res1) {
                user_name = res.userInfo.nickName;
                ctx.save();
                var imgWidth = 50;
                var left = 270;
                var top = 38;
                var imgHeight = res1.height / res1.width * imgWidth;
                that.roundRect(ctx, left, top, imgWidth, imgHeight, 25);
                ctx.drawImage(res1.path, left, top, imgWidth, imgHeight);
                ctx.restore();
                wx.showLoading({
                  title: '图片生成中(6/6)',
                });

                //绘制相似度
                let size = 26;
                ctx.font = "normal bold " + size + "px sans-serif";
                ctx.setFillStyle("#bb3a34");
                ctx.setFontSize(size);
                that.drawCenterText(ctx, "相似度" + Utils.toFix(that.data.similarity) + "%", 70, 188);
                size = 21;
                ctx.font = "normal bold " + size + "px sans-serif";
                ctx.setFillStyle("#bb3a34");
                ctx.setFontSize(size);
                that.drawCenterText(ctx, that.data.resultText, 445, 188);

                //左用户名
                size = 13;
                ctx.font = "normal bold " + size + "px sans-serif";
                ctx.setFillStyle("black");
                ctx.setFontSize(size);
                that.drawCenterText(ctx, that.data.currentAction.nick_name, 105, 82, 60);

                //右用户名
                that.drawCenterText(ctx, user_name, 105, 295, 60);
                size = 11;
                ctx.font = "normal " + size + "px sans-serif";
                ctx.setFillStyle("black");

                //Info
                var info = "Beauty:" + that.data.currentAction.action_score2 + "  Age:" + that.data.currentAction.action_score + "  " + (parseInt(that.data.currentAction.action_score1) == 0 ? "Male" : "Female");
                that.drawCenterText(ctx, info, 335, 111, 145);

                if (that.data.similarity < 85) {
                  var score = JSON.parse(wx.getStorageSync('score'));
                  info = "Beauty:" + Utils.toFix(score.attributes.beauty.value) + "  Age:" + score.attributes.age.value + "  " + score.attributes.gender.value;
                }
                that.drawCenterText(ctx, info, 335, 266, 145);
                drawQrCode(ctx, that, scale);
              },
              fail: fail
            });
          },
          fail: fail
        })
      }

      var drawRightImage = function(ctx, that, scale) {
        wx.getImageInfo({
          src: that.data.childAction.action_beauty_image_url,
          success: function(res1) {
            ctx.save();
            //右侧照片
            var imgWidth = 138;
            var left = 197;
            var top = 123;

            var imgHeight = res1.height / res1.width * imgWidth;
            that.roundRect(ctx, left, top, imgWidth, imgHeight, 5);
            ctx.drawImage(res1.path, left, top, imgWidth, imgHeight);
            ctx.restore();

            //左侧头像
            wx.showLoading({
              title: '图片生成中(4/6)',
            })
            drawLeftHeadImage(ctx, that, scale);
          },
          fail: fail
        });
      };

      var drawLeftImage = function(ctx, that, scale) {
        wx.getImageInfo({
          src: that.data.currentAction.action_beauty_image_url,
          success: function(res1) {
            ctx.save();
            //左侧图片
            var imgWidth = 138;
            var left = 42;
            var top = 123;
            var imgHeight = res1.height / res1.width * imgWidth;
            that.roundRect(ctx, left, top, imgWidth, imgHeight, 5);
            ctx.drawImage(res1.path, left, top, imgWidth, imgHeight);
            ctx.restore();

            //右侧图片
            wx.showLoading({
              title: '图片生成中(3/6)',
            })
            drawRightImage(ctx, that, scale);
          },
          fail: fail
        });
      }

      wx.getImageInfo({
        src: "https://wao-files.oss-cn-beijing.aliyuncs.com/holo/result_share_bg_2.png",
        success: function(res) {
          // 商品图
          ctx.drawImage(res.path, 0, 0, res.width, res.height, 0, 0, width / n / scale, height / n / scale);
          wx.showLoading({
            title: '图片生成中(2/6)',
          });
          drawLeftImage(ctx, that, scale)
          ctx.translate(0, 15);
        },
        fail: fail
      })
    },

    roundFaceRectangle(rect, img_size) {
      var left = rect.left;
      var top = rect.top;
      var width = rect.width,
        height = rect.height;
      var bottom = top + height;
      var right = left + width;
      var centerX = (left + right) / 2;
      width = width * 1.1;
      left = centerX - width / 2;
      left = Math.max(0, left);
      right = Math.min(img_size.width, centerX + width / 2);
      top = Math.max(0, top - width * 0.15);
      rect.left = left;
      rect.top = top;
      rect.width = right - left;
      rect.height = bottom - top;
      return rect;
    },

    drawActionShareImage(failCallback) {
      let that = this;
      wx.showLoading({
        title: '图片生成中',
      })
      var left = 75,
        top = 305,
        right = 63,
        bottom = 23;
      let scale = 2;
      let n = 2; //wx.getSystemInfoSync().pixelRatio;
      let width = 375 * n * scale;
      let height = 667 * n * scale;

      let ctx = wx.createCanvasContext('firstCanvas');
      ctx.stroke();
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);
      ctx.scale(scale, scale);
      wx.getImageInfo({
        src: "https://wao-files.oss-cn-beijing.aliyuncs.com/holo/friend_share_bg_4.png",
        success: function(res) {
          // 商品图
          ctx.drawImage(res.path, 0, 0, width / n / scale, height / n / scale);
          wx.getImageInfo({
            src: that.data.currentAction.action_beauty_image_url,
            success: function(res1) {
              var imgWidth = 300;
              var imgHeight = res1.height / res1.width * imgWidth;
              var img_scale = imgWidth / that.data.img_size.width;
              ctx.save();
              ctx.setGlobalAlpha(1.0);
              that.roundRect(ctx, left / 2, top / 2, imgWidth, imgHeight, 5);
              ctx.drawImage(res1.path, left / 2, top / 2, imgWidth, imgHeight);
              ctx.restore();

              var left1 = left / 2 + that.data.face_rectangle.left * img_scale;
              var top1 = top / 2 + that.data.face_rectangle.top * img_scale;
              var width1 = img_scale * that.data.face_rectangle.width;
              var height1 = img_scale * that.data.face_rectangle.height;
              var txt = "Beauty:" + Utils.toFix(that.data.beauty) + "   " + "Age:" + that.data.age + "   " + (that.data.gender);

              var size = 11;
              ctx.font = "normal " + size + 'px sans-serif';
              ctx.setFillStyle("white");
              ctx.setGlobalAlpha(0.9);
              ctx.setFontSize(size);
              // that.drawCenterText(ctx,txt,top1, left/2 + imgWidth / 2)
              ctx.fillText(txt, left1, top1 - 10);

              ctx.save();
              ctx.setGlobalAlpha(0.6)
              ctx.setLineWidth(3);
              that.strokeRoundRect(ctx, left1, top1, width1, height1, 20, "white", true, false);
              ctx.setLineWidth(1);
              ctx.setGlobalAlpha(0.4);
              ctx.beginPath();
              ctx.moveTo(left1 + 40, top1);
              ctx.lineTo(left1 - 40 + width1, top1);
              ctx.moveTo(left1 + width1, top1 + 40);
              ctx.lineTo(left1 + width1, top1 + height1 - 40);
              ctx.moveTo(left1 + width1 - 40, top1 + height1);
              ctx.lineTo(left1 + 40, top1 + height1);
              ctx.moveTo(left1, top1 + height1 - 40);
              ctx.lineTo(left1, top1 + 40);
              ctx.stroke();
              //that.strokeRoundRect(ctx, left1, top1, width1, height1, 0, "white");
              ctx.restore();
              ctx.setGlobalAlpha(1.0);
              var drawQRCode = function() {
                // 二维码
                Utils.request({
                  url: `${baseUrl}/index.php?m=default&c=flow&a=generateQRCode`,
                  page: that,
                  data: {
                    scene: `id=${that.data.action_id}`,
                    path: "pages/lottery/luckfriend/preview/preview" //注意此参数根目录不加“/”
                  },
                  success: function(res) {
                    res = JSON.parse(Utils.Trim(res.data));
                    if (res.status && res.status == 1) {
                      let qrcode_path = res.info;
                      wx.getImageInfo({
                        src: qrcode_path,
                        success: function(res2) {
                          var x = width / n / scale - (65 + 21);
                          var y = height / n / scale - 65 - 12;
                          ctx.drawImage(res2.path, x, y, 65, 65);
                          ctx.draw(true, () => {
                            wx.canvasToTempFilePath({
                              canvasId: 'firstCanvas',
                              x: 0,
                              y: 0,
                              width: width,
                              height: height,
                              quality: 1,
                              success: function success(res) {
                                that.setData({
                                  share_img: res.tempFilePath
                                })

                              },
                              fail: function(res) {
                                //console.log(res);
                              },
                              complete: function complete(e) {
                                wx.hideLoading();
                              }
                            });
                          })
                        },
                        complete: function(res) {

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
                    wx.hideLoading();
                    wx.showToast({
                      title: '请求失败，请检查网络重试',
                      icon: 'none',
                      duration: 2000
                    })
                  },
                  complete: function(res) {

                  }
                })
              }

              drawQRCode();

            },
            fail: function(res) {
              wx.hideLoading();
              Utils.showToast("生成图片失败，请重试!");
              if (failCallback)
                failCallback();
            }
          });
        },
        fail: function(res) {
          Utils.showToast("生成图片失败,请重试！");
          wx.hideLoading();
          if (failCallback)
            failCallback();
        }
      })
    },

    drawShareImage(e) {
      let that = this;
      var failCallback = e.detail.failCallback;

      if (this.data.child_action_id > 0)
        this.drawResultShareImage(failCallback);
      else
        this.drawActionShareImage(failCallback);

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
      var actionType = parseInt(wx.getStorageSync("action_type"));
      //如果是Match，提交
      if (actionType == 64 && actionType != this.data.action_type && app.globalData.newFaceTest) {
        //提交Match
        //获取新的美颜照片
        var beautyImage = wx.getStorageSync("beautyimage");
        var score = JSON.parse(wx.getStorageSync("score"));
        var scoredImage = JSON.parse(wx.getStorageSync("scoredImage"));
        if (scoredImage)
          if (beautyImage && beautyImage.length > 0) {
            var array = wx.base64ToArrayBuffer(beautyImage);
            var base64 = wx.arrayBufferToBase64(array);
            this.data.beautyImageSource = base64;
            this.data.isOwner = true;
            this.setData({
              isOwner: true,
              matchBeauty: (score.attributes.beauty.value),
              matchAge: score.attributes.age.value,
              matchGender: score.attributes.gender.value,
              matchImgSource: "data:image/png;base64," + base64
            });
            this.submitAction();
          } else {
            var scoredImage = JSON.parse(wx.getStorageSync("scoredImage"));
            this.data.isOwner = true;
            this.setData({
              isOwner: true,
              matchImgSource: scoredImage.local
            })
            this.submitAction();
          }

        app.globalData.newFaceTest = false;
      }
    },

    //判断相似程度
    match() {
      let that = this;
      if (this.data.currentAction.action_beauty_image_url && this.data.currentAction.action_beauty_image_url.length > 0 && this.data.childAction.action_beauty_image_url && this.data.childAction.action_beauty_image_url.length > 0) {
        Utils.compare({
          apiType: "baidu",
          imgUrl: that.data.currentAction.action_beauty_image_url,
          imgUrl1: that.data.childAction.action_beauty_image_url,
          success: function(res) {
            Utils.request({
              url: `${baseUrl}/index.php?m=default&c=lottery1&a=updateMatchScore`,
              data: {
                action_score: res.confidence,
                action_id: that.data.child_action_id
              },
              success: function(res) {
                res = JSON.parse(Utils.Trim(res.data));
                if (res.error == "1") {
                  wx.hideLoading();
                  Utils.showToast("提交失败，请重试!");
                } else {
                  that.setData({
                    resultText: res.info,
                    show_result: true,
                    luck_info: res.msg,
                    similarity: res.score
                  })

                  wx.setStorageSync("action_type", "1");
                  if (res.luck == 0) {
                    that.setData({
                      luck_type: res.luck
                    });
                    var time = setTimeout(function() {
                      that.setData({
                        luck_type: -1
                      });
                    }, 3000);
                  } else {
                    that.setData({
                      luck_type: res.luck
                    });
                  }
                }
              },
              complete: function(res) {
                wx.hideLoading();
              }
            })
            that.setData({
              child_action_id: that.data.child_action_id,
            })
          }
        })
      }
    },

    showrule() {
      this.setData({
        show_rule: true
      })
    },

    shareMatch() {
      this.showSharePanel();
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    onAuthorized: function() {
      //如果是引导用户第一次进入，先显示规则
      var pages = getCurrentPages();
      if (pages.length == 1 && wx.getStorageSync("used") != "true") {
        this.setData({
          show_rule: true
        })
        wx.setStorageSync("used", "true");
      }
    },

    onReady: function() {


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

    backhome: function() {
      wx.switchTab({
        url: '/pages/lottery/lottery',
      })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
      let that = this;
      var path = "/pages/lottery/luckfriend/preview/preview?id=" + that.data.action_id;
      var title = '你长得和我有多像？测一测，赢春节免费机票';
      if (that.data.child_action_id > 0) {
        path = "/pages/lottery/luckfriend/preview/preview?id=" + that.data.child_action_id;
        title = '寻找长得有39%像你的朋友，赢春节免费机票';
      }
      return {
        title: title,
        imageUrl: "https://wao-files.oss-cn-beijing.aliyuncs.com/holo/friend_share_bg.jpg",
        path: path,
        success: function(res) {
          //跳转推荐
        }
      }
    }
  })