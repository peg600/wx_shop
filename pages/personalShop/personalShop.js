// pages/personalShop/personalShop.js
const app = getApp()
var baseUrl = app.globalData.baseHttpUrl;
var htmlUrl = app.globalData.htmlUrl;
const shop_id = app.globalData.shop_id;


Page({ 

  /**
   * 页面的初始数据
   */
  data: {
    user_id: "",
    info: {},
    canvas_width: 0,
    canvas_height: 0,
    bac_img: "",
    bac_thumb: "",
    show_decorate: false,
    bac_list: {},
    is_master: false,
    is_up: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      current_user_id: app.globalData.current_user_id
    })
    // if(options.shop_id) {
    //   this.setData({
    //     user_id: options.user_id
    //   })
    // }
    console.log(options)
    if(options.user_id) {
      this.setData({
        user_id: options.user_id
      })
      if(app.globalData.current_user_id == options.user_id) {
        this.setData({
          is_master: true
        })
      }else{
        this.addHistory();
      }
    }else{
      this.setData({
        user_id: app.globalData.current_user_id
      })
    }
    if (options.inviter && options.inviter!= "") {
      getApp().globalData.inviter = options.inviter;
      getApp().inviter = options.inviter;
    }else{
      getApp().globalData.inviter = this.data.user_id;
      getApp().inviter = this.data.user_id; 
    }
  },

  getShopInfo() {
    let that = this;
    wx.request({
      url: baseUrl + '/index.php?m=default&c=shop&a=get_personal_shop_and_user_info_by_user_id',
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        user_id: that.data.user_id,
        shop_id: shop_id
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        wx.setNavigationBarTitle({
          title: res.info[0].personal_shop_name,
        })
        that.setData({
          info: res.info[0],
          bac_img: res.info[0].personal_shop_bac
        })
        wx.createSelectorQuery().select('#bac').boundingClientRect(function (rect) {
          var width = rect.width   // 节点的宽度
          var height = rect.height   // 节点的高度
          console.log(width, height)
          that.setData({
            canvas_width: width,
            canvas_height: height
          })
          // that.joinPic();
        }).exec()
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

  shareShop() {
    wx.navigateTo({
      url: `/pages/personalShop/personalShare/personalShare?inviter=${this.data.info.user_id}&master_id=${this.data.info.user_id}`
    })
  },



  addHistory() {
    let that = this;
    wx.request({
      url: baseUrl + '/index.php?m=default&c=shop&a=add_new_personal_history',
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        master_id: that.data.user_id,
        shop_id: shop_id,
        user_id: app.globalData.current_user_id
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        console.log(res)
        
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

  translate: function () {
    let animation = wx.createAnimation({
      duration: 500,
      timingFunction: "ease",
      delay: 0,
      transformOrigin: "50% 50%",
    })
    if(this.data.is_up) {
      let n = wx.getSystemInfoSync().windowWidth/375;
      animation.translate(0, 200*n).step();
      this.setData({
        is_up: false
      })
    }else{
      animation.translate(0, 0).step();
      this.setData({
        is_up: true
      })
    }
    this.setData({ animation:animation.export() })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    

  },

  joinPic() {
    let that = this;
    let width = that.data.canvas_width;
    let height = that.data.canvas_height;
    console.log(width)

    let ctx = wx.createCanvasContext('firstCanvas');
    ctx.stroke();
    wx.getImageInfo({
      src: that.data.bac_img,
      success: function (res) {
        console.log(res)
        let n = res.height/res.width;
        ctx.beginPath();
        ctx.rect(0, 0, width, height);  //裁剪框，占满屏幕
        ctx.clip();   //次方法下面的部分为待剪切区域，上面的部分为剪切区域

        //画图，width*n为保持比例的图片高度，为裁剪上部多出的高度，把图片上移
        ctx.drawImage(res.path, 0, -(width * n - height), width, width*n);  
        // ctx.draw();   //渲染，不可少
        
      
      },
    })
  },

  goBack: function() {
    wx.navigateTo({
      url: '/pages/toPersonalShop/toPersonalShop',
      fail:function(res)
      {
        wx.switchTab({
          url: '/pages/toPersonalShop/toPersonalShop',
        });
      }
    })
  },

  showDecorate: function () {
    this.setData({
      show_decorate: true,
      is_up: true
    })

    let animation = wx.createAnimation({
      duration: 500,
      timingFunction: "ease",
      delay: 0,
      transformOrigin: "50% 50%",
    })
    animation.translate(0, 0).step();
    this.setData({ animation: animation.export() })

    let that = this;

    wx.request({
      url: baseUrl + '/index.php?m=default&c=shop&a=get_all_personal_bac',
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        user_id: app.globalData.current_user_id,
        shop_id: shop_id
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        console.log(res)
        that.setData({
          bac_list: res
        })
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

  selectBac(e) {
    if (e.currentTarget.dataset.bac_url && e.currentTarget.dataset.bac_thumb_url) {
      this.setData({
        bac_img: e.currentTarget.dataset.bac_url,
        bac_thumb: e.currentTarget.dataset.bac_thumb_url
      })
      // this.joinPic();
    }
  },

  saveBac() {
    let that = this;
    if (that.data.bac_img && that.data.bac_thumb) {
      console.log(that.data.bac_img)
      console.log(that.data.bac_thumb)


      wx.request({
        url: baseUrl + '/index.php?m=default&c=shop&a=set_personal_bac',
        method: 'POST',
        dataType: 'txt',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
          user_id: app.globalData.current_user_id,
          shop_id: shop_id,
          personal_shop_bac: that.data.bac_img,
          personal_shop_thumb: that.data.bac_thumb
        },
        success: function (res) {
          function Trim(str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
          }
          res = JSON.parse(Trim(res.data));
          console.log(res)
          if(res) {
            that.setData({
              show_decorate: false,
              is_up: false
            })
          }else{
            wx.showToast({
              title: '请求失败，请检查网络重试',
              icon: 'none',
              duration: 2000
            })
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
    }else{
      that.setData({
        show_decorate: false,
        is_up: false
      })
    }
  },

  toPersonalMain()  {
    wx.navigateTo({
      url: `/pages/personalShop/personalMain/personalMain?user_id=${this.data.user_id}`,
    })
  },

  toPersonalCenter() {
    wx.navigateTo({
      url: `/pages/personalShop/personalCenter/personalCenter`,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getShopInfo();
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