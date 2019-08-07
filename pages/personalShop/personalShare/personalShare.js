// pages/personalShop/personalShare/personalShare.js
const app = getApp()
var baseUrl = app.globalData.baseHttpUrl;
var htmlUrl = app.globalData.htmlUrl;
const shop_id = app.globalData.shop_id;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    share_shop: true,
    inviter: "",
    goods_id: "",
    pic_url: "",
    master_id: "",
    shop_info: {},
    goods_id: "",
    goods_info: {},
    n: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      current_user_id: app.globalData.current_user_id
    })
    let that = this;
    if(options.inviter && options.inviter != "") {
      this.setData({
        inviter: options.inviter
      })
    }
    if(options.goods_id && options.goods_id != "") {
      this.setData({
        share_shop: false,
        goods_id: options.goods_id,
      })
    }
    if(options.master_id && options.master_id != "") {
      this.setData({
        master_id: options.master_id
      })
    }
    
    this.getPxSize();
    
  },

  getPxSize() {
    let that = this;
    let wrapper = '.shop-canvas-wrapper';
    if(!that.data.share_shop) {
      wrapper = '.goods-canvas-wrapper';
    }
    wx.createSelectorQuery().select(wrapper).boundingClientRect(function (rect) {
      var width = rect.width   // 节点的宽度
      var height = rect.height   // 节点的高度
      console.log(width, height)
      that.setData({
        canvas_width: width,
        canvas_height: height
      })
      that.getShopInfo();
    }).exec()
    this.setData({
      n: wx.getSystemInfoSync().windowWidth/320
    })
  },

  getShopInfo() {
    let that = this;
    wx.request({
      url: baseUrl + '/index.php?m=default&c=shop&a=get_personal_shop_and_user_info_by_user_id',
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        user_id: that.data.master_id,
        shop_id: shop_id
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        console.log(res)
        that.setData({
          has_shop: res.has_shop,
          shop_info: res.info[0]
        })

        if (that.data.share_shop) {
          that.drawShop();
        } else {
          that.getGoodsInfo();
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
  },

  getGoodsInfo() {
    let that = this;
    wx.request({
      url: baseUrl + '/index.php?m=default&c=shop&a=get_personal_goods_and_info_by_goods_id',
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        user_id: that.data.master_id,
        shop_id: shop_id,
        goods_id: that.data.goods_id
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        res = res[0];
        if (res.goods_img && res.goods_img !== "") {
          res.goods_img = `${baseUrl}/${res.goods_img}`;
        }
        if (res.goods_thumb && res.goods_thumb !== "") {
          res.goods_thumb = `${baseUrl}/${res.goods_thumb}`;
        }
        if (res.original_img && res.original_img !== "") {
          res.original_img = `${baseUrl}/${res.original_img}`;
        }
        console.log(res)

        that.setData({
          goods_info: res
        })

        that.drawGoods();

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

  drawShop() {
    let that = this;
    let n = that.data.n;
    let width = that.data.canvas_width;
    let height = that.data.canvas_height;

    let ctx = wx.createCanvasContext('firstCanvas');
    ctx.stroke();
    console.log(that.data.shop_info)
    wx.getImageInfo({
      src: that.data.shop_info.personal_shop_thumb,
      success: function (res) {
        console.log(res)

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);
        
        ctx.beginPath();

        ctx.drawImage(res.path, 5 * n, 5 * n, width - 10 * n, width - 10 * n);

        that.drawRoundRect(ctx, 12 * n, 10 * n, 110 * n, 25 * n, 5 * n);

        ctx.lineWidth = 4 * n;
        ctx.fillStyle = "white";
        ctx.fill();

        that.drawRoundRect(ctx, 12 * n, 10 * n, 110 * n, 25 * n, 5 * n);

        ctx.lineWidth = 4*n;
        ctx.strokeStyle = "rgb(252,209,154)";
        ctx.stroke();

        ctx.font = "10px Arial";
        ctx.setTextAlign("center");
        ctx.fillStyle = "#757575";
        ctx.fillText(that.data.shop_info.personal_shop_name, 65 * n, 26 * n);

        ctx.drawImage("../../img/personal_share_slogan.png", 20 * n, 266 * n, 182 * n, 26 * n);

        ctx.font = "9px Arial";
        ctx.setTextAlign("right");
        ctx.fillText("识别小程序二维码", 80 * n, height - 34 * n);

        ctx.drawImage("../../img/QRcode.jpg", 90 * n, height - 60 * n, 50 * n, 50 * n);

        ctx.setTextAlign("left");
        ctx.fillText("进入宝岛眼镜店", 150 * n, height - 34 * n);

        ctx.draw(true, () => {
        wx.canvasToTempFilePath({
          canvasId: 'firstCanvas',
          x: 0,
          y: 0,
          width: width,
          height: height,
          success: function success(res) {
            console.log(res)
            that.setData({
              pic_url: res.tempFilePath
            })
          },
          complete: function complete(e) {
            
          }
        });
        })
      },
    })
  },

  drawGoods() {
    let that = this;
    let n = that.data.n;
    let width = that.data.canvas_width;
    let height = that.data.canvas_height;

    let ctx = wx.createCanvasContext('secondCanvas');
    ctx.stroke();
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
    wx.getImageInfo({
      src: that.data.goods_info.goods_img,
      success: function (res) {
        
        ctx.beginPath();

        // 商品图
        ctx.drawImage(res.path, 0, 0, width, width);

        // 灰线
        ctx.lineWidth = 2 * n;
        ctx.strokeStyle = "#ccc";
        ctx.moveTo(10 * n, width);
        ctx.lineTo(width - 10 * n, width);
        ctx.stroke();

        // 名称
        ctx.font = "10px Arial";
        ctx.textAlign = "left";
        ctx.fillStyle = "rgb(86,86,86)";
        that.drawText(ctx, that.data.goods_info.goods_name, 17 * n, 257 * n, width - 34 * n);

        // 价格
        ctx.font = "13px Arial";
        ctx.textAlign = "left";
        ctx.fillStyle = "rgb(255,0,0)";
        ctx.fillText(`￥${that.data.goods_info.shop_price}`, 17 * n, 330 * n);

        ctx.font = "9px Arial";
        ctx.textAlign = "left";
        ctx.fillStyle = "rgb(59,59,59)";
        ctx.fillText(`官方售价：￥${that.data.goods_info.market_price}`, 17 * n + ctx.measureText(`￥${that.data.goods_info.shop_price}`).width + 30 * n, 330 * n);

        // 店名
        ctx.font = "11px Arial";
        ctx.textAlign = "left";
        ctx.fillStyle = "rgb(59,59,59)";
        ctx.fillText(`来自${that.data.shop_info.personal_shop_name}推荐`, 80 * n, 355 * n);

        // logo
        ctx.drawImage("../../img/personal_share_logo.png", 20 * n, 375 * n, 88 * n, 40 * n);

        // 二维码
        ctx.drawImage("../../img/QRcode.jpg", 150 * n, 365 * n, 70 * n, 70 * n);


        // wx.getImageInfo({
        //   src: that.data.shop_info.master_thumb,
        //   success: function (res2) {
        //     ctx.drawImage(res2.path, 42, 355, 16, 16);

        //     ctx.font = "9px Arial";
        //     ctx.textAlign = "left";
        //     ctx.fillStyle = "rgb(59,59,59)";
        //     ctx.fillText(`来自${that.data.shop_info.personal_shop_name}推荐`, 80, 355);
        //   }
        // })  

        ctx.draw(true, () => {
          wx.canvasToTempFilePath({
            canvasId: 'secondCanvas',
            x: 0,
            y: 0,
            width: width,
            height: height,
            success: function success(res) {
              console.log(res)
              that.setData({
                pic_url: res.tempFilePath
              })
            },
            complete: function complete(e) {

            }
          });
        })
      },
    })
  },

  // 用于canvas绘制圆角矩形
  drawRoundRect(cxt, x, y, width, height, radius){
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

  // 绘制自动换行的文本，ctx，文本，起始位置x，y，每行宽度
  drawText(ctx,t, x, y, w){
    var chr = t.split("");
    var temp = "";
    var row = [];

    // ctx.font = "20px Arial";
    // ctx.fillStyle = "black";
    // ctx.textBaseline = "middle";

    for(var a = 0; a<chr.length; a++){
      if (ctx.measureText(temp).width < w) {
    
      }
      else {
        row.push(temp);
        temp = "";
      }
      temp += chr[a];
    }
    row.push(temp);
    for (var b = 0; b < row.length; b++) {
      ctx.fillText(row[b], x, y + (b + 1) * 20);
    }
  },

  //保存至相册
  saveImageToPhotosAlbum: function () {
    if (!this.data.pic_url) {
      wx.showModal({
        title: '提示',
        content: '图片绘制中，请稍后重试',
        showCancel: false
      })
    }
    wx.saveImageToPhotosAlbum({
      filePath: this.data.pic_url,
      success: (res) => {
        wx.showModal({
          title: '提示',
          content: '保存成功',
          showCancel: false
        })
      },
      fail: (err) => {
        console.log(err)
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
    let that = this;
    return {
      title: '分享文案',
      path: `/pages/personalShop/personalShop?inviter=${that.data.inviter}&shop_id=${shop_id}&user_id=${that.data.master_id}`,
    };
  }
})