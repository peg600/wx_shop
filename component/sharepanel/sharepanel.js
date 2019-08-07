// component/sharePanel/sharepanel.js
let app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    share_img:{
      type:String,
      value:""
    },
    shareTip:{
      type:String,
      value:"保存图片到手机后，可分享到社交媒体"
    },
    shareWeiXin:{
      type:String,
      value:"分享给好友"
    },
    shareQuan:{
      type:String,
      value:"保存海报"
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    visible:false,
    animationData:"",
    savePicAnimation:"",
    show_share_image:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onDrawCanvas(failCallback)
    {
      this.triggerEvent('getShareImage',{failCallback:failCallback});
    },

    show()
    {
      this.data.visible = false;
      this.toggle();
    },

    hide()
    {
      this.data.visible = true;
      this.toggle();
    },

    toggle()
    {
    
      this.setData({
        visible: !this.data.visible,
        show_share_image: false
      })

      this.setData({
        animationData: "",
        savePicAnimation: "",
      })
      
      if (this.data.visible) {
        var animation = wx.createAnimation({
          duration: 300,
          timingFunction: "ease",
          delay: 0,
          transformOrigin: "50% 50%",
        })
        animation.translate(0, 0).step();
        this.setData({
          animationData: animation.export(),
        })
      }
    },

    toggleShowShare()
    {
      this.toggle();
    },

    toggleSharePage() {
      let that = this;
      this.setData({
        show_share_image: !this.data.show_share_image,
      })
      if (!this.properties.share_img) {
        var fail = function(res)
        {
          that.toggleSharePage();
        }
        this.onDrawCanvas(fail);
      }

      this.setData({
        savePicAnimation: "",
      })
      var animation = wx.createAnimation({
        duration: 300,
        timingFunction: "ease",
        delay: 0,
        transformOrigin: "50% 50%",
      })
      if (this.data.show_share_image) {
        animation.translate(0, 0).step();
        this.setData({
          savePicAnimation: animation.export(),
        })
      }
    },

    //准备保存图片的授权
    prepareSaveImage() {
      let that = this;
      wx.getSetting({
        success(res) {
          if (!res.authSetting['scope.writePhotosAlbum']) {
            wx.authorize({
              scope: 'scope.writePhotosAlbum',
              success() {//这里是用户同意授权后的回调
                that.saveImageToPhotosAlbum();
              },
              fail() {//这里是用户拒绝授权后的回调
                let pages = getCurrentPages() //获取加载的页面
                let url = app.getPageUrl(pages);
                wx.navigateTo({
                  url: `/pages/authorize/authorize?type=3&url=${url}`,
                })
              }
            })
          } else {//用户已经授权过了
            that.saveImageToPhotosAlbum();
          }
        }
      })
    },

    //保存至相册
    saveImageToPhotosAlbum: function () {
      if (!this.properties.share_img) {
        wx.showModal({
          title: '提示',
          content: '图片绘制中，请稍后重试',
          showCancel: false
        })
      }
      var that = this;
      wx.saveImageToPhotosAlbum({
        filePath: that.properties.share_img,
        success: (res) => {
         wx.showToast({
           title: '保存成功',
         })
        that.triggerEvent("shareFinished");
        },
        fail: (err) => {
          //console.log(err)
        }
      })
    },
  }
})
