// pages/endorser/similar/similar.js
const app = getApp();
var baseUrl = app.globalData.baseHttpUrl;
let Utils = require("../../../lib/Utils.js")
let celebrity = require("../../../lib/celebrity.js")
let celebrity_data = celebrity.celebrity;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    src: "",    //传入的图片路径
    img_src:"",   //canvas导出的图片路径

    categoray: [],    //前三品类
    brand: [],    //前三品牌

    canvas_width: "",
    canvas_height: "",

    user_info: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    app.parseInviter(options);

    //选择id
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          canvas_width: res.screenWidth,
          canvas_height: res.screenHeight
        })
      },
    })

    wx.getUserInfo({
      success(res) {
        console.log(res)
        const userInfo = res.userInfo
        that.setData({
          user_info: userInfo
        })
      }
    })

    if(options.src) {
      let src = options.src;
      this.setData({
        src: src
      })
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
                success: that.getOrder
              }
              Utils.search(requestObject);
            }
          })
          //以下两行注释的是同步方法
          //let base64 = wx.getFileSystemManager().readFileSync(res.tempFilePaths[0], 'base64') 
          //console.log(base64)
        }
      })
    }
    
  },

  //为比对后得到的数据进行排序
  getOrder(res) {
    console.log(res)
    let brands = {};
    let category = {};
    let category_data = [];

    let cat = [];
    
    if(res.error_code == 0) {
      let user_list = res.result.user_list;
      console.log(user_list)
      
      for(let i=0;i<user_list.length;i++) {
        let name = user_list[i].user_info;
        let score = user_list[i].score;
        
        for (let j = 0; j < celebrity_data.length;j++) {
          if (celebrity_data[j].name == name) {
            celebrity_data[j].score = score;
            let price = parseInt(parseInt(celebrity_data[j].price) * score / 100)
            let brand = celebrity_data[j].brand;
            for(let k=0;k<brand.length;k++) {
              // if (brands.hasOwnProperty(brand[k].name)) {
              //   brands[brand[k].name] = brands[brand[k].name] + 1
              // }else{
              //   brands[brand[k].name] = 1
              // }

              let has_star = false;
              if (category.hasOwnProperty(brand[k].cat_name)) {
                for(let m = 0; m < category[brand[k].cat_name].stars.length;m++){
                  if (category[brand[k].cat_name].stars[m].name == name) {
                    has_star = true;
                  }
                }
                if (has_star) {
                  
                }else{
                  category[brand[k].cat_name].stars.push({
                    name: name,
                    score: score,
                    price: price
                  })
                  if (category[brand[k].cat_name].stars.length<4) {
                    
                  }else{
                    category[brand[k].cat_name].stars.sort(function (a, b) {
                      return b.score - a.score;
                    })
                    category[brand[k].cat_name].stars.pop()
                  }
                  category[brand[k].cat_name].score = 0;
                  category[brand[k].cat_name].price = 0
                  for (let n = 0; n < category[brand[k].cat_name].stars.length; n++) {
                    category[brand[k].cat_name].score += category[brand[k].cat_name].stars[n].score;
                    category[brand[k].cat_name].price += category[brand[k].cat_name].stars[n].price;
                  }
                }
              } else {
                category[brand[k].cat_name] = {
                  name: brand[k].cat_name,
                  stars: []
                }
                category[brand[k].cat_name].stars.push({
                  name: name,
                  score:score,
                  price: price
                })

                category[brand[k].cat_name].score = score;
                category[brand[k].cat_name].price = price;
              }
            }
            break;
          }
        }
      }
      console.log(category)

      let category_keys = Object.keys(category);
      category_keys.sort(function (a, b) {
        return category[b].score - category[a].score;
      })

      //category_keys = category_keys.slice(0, 3);
      let all = category[category_keys[0]].score + category[category_keys[1]].score + category[category_keys[2]].score
      for (let i = 0; i < category_keys.length; i++) {
        let temp = {};
        temp.name = category_keys[i];
        temp.score = category[category_keys[i]].score / category[category_keys[i]].stars.length;
        temp.percent = (category[category_keys[i]].score / all * 100).toFixed(2)
        temp.price = Math.round(category[category_keys[i]].price / 3) 
        category_data.push(temp)
      }
      console.log(category_data)

      let brands_keys = []
      Loop1:
      for (let i = 0; i < user_list.length; i++) {
        let name = user_list[i].user_info;
        for (let j = 0; j < celebrity_data.length; j++) {
          if (celebrity_data[j].name == name) {
            let brand = celebrity_data[j].brand;
            for (let k = 0; k < brand.length; k++) {
              if (brand[k].cat_name == category_data[0].name) {
                brands_keys.push(brand[k].name)
                break Loop1;
              }
            }
          }
        }
      }
      console.log(brands_keys)

      this.setData({
        brand: brands_keys,
        category: category_data
      })

      this.drawChart();
    }else{
      wx.showToast({
        title: '网络错误，请重新检测',
        icon: 'none',
        duration: 3000
      });
    }
  },

  //canvas绘制雷达图
  drawChart() {
    let that = this;
    const ctx = wx.createCanvasContext('firstCanvas');
    let category = this.data.category;
    let count = category.length;
    let angle = Math.PI * 2 / count;    //每个角度
    let width = this.data.canvas_width;
    let height = 250;
    let line_color = "#B8B8B8";

    let max_score = 0;
    for (let i = 0; i < category.length;i++) {
      if (category[i].score > max_score) {
        max_score = category[i].score;
      }
    }

    //背景六边形
    let dist = 50;      //到边框距离
    let radius = (height - dist * 2) / 2;
    let x = width / 2;
    let y = height;
    let top = 50;     //距顶部距离
    let current_deg = 0;   //当前扇形的起始角度

    //画6个圈
    ctx.save();
    ctx.strokeStyle = line_color;
    var r = radius / count; //单位半径
    for (var i = 0; i < count; i++) {
      ctx.beginPath();
      var currR = r * (i + 1); //当前半径
      //画6条边
      for (var j = 0; j < count; j++) {
        var x0 = x + currR * Math.cos(angle * j);
        var y0 = x + currR * Math.sin(angle * j) + top;
        ctx.lineTo(x0, y0);
      }
      ctx.closePath()
      ctx.stroke();
    }
    ctx.restore();

    //顶点连线
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = line_color;
    for (var i = 0; i < count; i++) {
      var x0 = x + radius * Math.cos(angle * i);
      var y0 = x + radius * Math.sin(angle * i) + top;

      ctx.moveTo(x, x + top);
      ctx.lineTo(x0, y0);
    }
    ctx.stroke();
    ctx.restore();

    //绘制覆盖区域
    ctx.save();
    ctx.beginPath();
    for (var i = 0; i < count; i++) {
      var x0 = x + radius * Math.cos(angle * i) * category[i].score / max_score;
      var y0 = x + radius * Math.sin(angle * i) * category[i].score / max_score + top;
      ctx.lineTo(x0, y0);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fill();
    ctx.restore();

    //文字
    ctx.save();
    var fontSize = 16;
    ctx.font = fontSize + 'px';
    ctx.fillStyle = '#000000';
    for (var i = 0; i < count; i++) {
      let text = `${category[i].name}：${parseInt(category[i].score)}分`
      var x0 = x + radius * Math.cos(angle * i);
      var y0 = x + radius * Math.sin(angle * i) + top;
      if (angle * i == 0) {
        ctx.fillText(text, x0, y0);
      } else if (angle * i == Math.PI / 3) {
        ctx.fillText(text, x0, y0 + fontSize);
      } else if (angle * i == Math.PI * 2 / 3) {
        ctx.fillText(text, x0 - ctx.measureText(text).width + fontSize, y0 + fontSize);
      } else if (angle * i == Math.PI) {
        ctx.fillText(text, x0 - ctx.measureText(text).width - fontSize, y0);
      } else if (angle * i == Math.PI * 4 / 3) {
        ctx.fillText(text, x0 - ctx.measureText(text).width - fontSize, y0);
      } else {
        ctx.fillText(text, x0, y0);
      }
    }
    ctx.restore();

    ctx.font = "12px";
    ctx.setTextAlign("center");
    let text = `你的代言价是${that.data.category[0].price}万`
    ctx.fillText(text, width / 2, height + top + 50);

    text = `你最适合代言的品牌是${that.data.brand[0]}`
    ctx.fillText(text, width / 2, height + top + 100);


    //画头像
    wx.getImageInfo({
      src: that.data.user_info.avatarUrl,
      success: function(res) {
        let path = res.path;
        let avatar_x = 40;    //头像左上角的坐标
        let avatar_y = 40;
        let avatar_width = 40;
        ctx.save();         //保存上下文
        ctx.beginPath();      //开始绘制
        ctx.arc(avatar_x + avatar_width / 2, avatar_y + avatar_width / 2, avatar_width / 2, 0, Math.PI * 2, false);   //绘制裁剪区域
        ctx.clip();        //裁剪区域，使之后的绘图只在该圆形区域可见
        ctx.drawImage(path, avatar_x, avatar_y, avatar_width, avatar_width);
        ctx.restore();    //恢复之前保存的绘图上下文，继续绘制

        ctx.setTextAlign("left");
        ctx.setTextBaseline("middle");
        text = `${that.data.user_info.nickName}的代言结果`
        ctx.fillText(text, avatar_x + avatar_width + 10, avatar_y + avatar_width/2);

        ctx.draw(true, () => {
          wx.canvasToTempFilePath({
            canvasId: 'firstCanvas',
            x: 0,
            y: 0,
            width: that.data.canvas_width,
            height: that.data.canvas_height,
            quality: 1,
            success: function success(res) {
              wx.hideLoading();
              that.setData({
                img_src: res.tempFilePath
              })
            },
            fail: function (e) {
              console.log(e)
            }
          });
        })
      }
    })
    
    
  },

  toggleShare() {
    this.selectComponent("#sharepanel").show();
  },

  toPoster() {
    let that = this;
    wx.navigateTo({
      url: `/pages/endorser/takePhoto/takePhoto?path=/pages/endorser/poster/poster&src=${that.data.src}`,
    })
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

  }
})