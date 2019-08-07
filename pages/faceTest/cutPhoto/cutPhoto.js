import WeCropper from '../../../we-cropper/we-cropper.js'

const app = getApp();
const device = wx.getSystemInfoSync()
const width = device.windowWidth
const height = device.windowHeight

let src = "https://www.feeai.cn/wxapi/SessionImage/sharePic/8181aca3333448cced65cadd454d3438.jpg"

Page({
  data: {
    cropperOpt: {
      id: 'cropper',
      width,
      height,
      scale: 2.5,
      zoom: 8,
      cut: {    //裁剪框位置及狂傲
        x: (width - 300) / 2,
        //y: (height - 300) / 2
        y: (height - 300) / 2 - 50,
        width: 300,
        height: 300
      }
    }
  },
  touchStart (e) {
    this.wecropper.touchStart(e)
  },
  touchMove (e) {
    this.wecropper.touchMove(e)
  },
  touchEnd (e) {
    this.wecropper.touchEnd(e)
  },
  getCropperImage () {
    this.wecropper.getCropperImage((src) => {
      let that = this;
      if (src) {
        // wx.previewImage({
        //   current: '', // 当前显示图片的http链接
        //   urls: [src] // 需要预览的图片http链接列表
        // })
        if(that.data.share) {
          wx.navigateTo({
            url: `/pages/offlineShop/share/share?src=${that.data.src}`,
          })
          return;
        }

        //上传图片进行人脸识别
        wx.showLoading({
          title: '评分中',
        })
        wx.uploadFile({
          url: `${app.globalData.baseHttpUrl}/index.php?m=default&c=flow&a=face_detect_baidu`, 
          filePath: src,
          name: 'file',
          formData: {
            'user': 'test'
          },
          success: function (res) {
            function Trim(str) {
              return str.replace(/(^\s*)|(\s*$)/g, "");
            }
            res = JSON.parse(Trim(res.data));
            console.log(res)
            if(res.error == 0) {
              wx.hideLoading();
              res = res.data;
              wx.showModal({
                title: 'aaa',
                content: `beauty:${res.beauty},expression:${res.expression.type}`,
              })
            }else{
              wx.hideLoading();
              wx.showModal({
                title: 'error',
                content: `${res.message}`,
              })
            }
          },
          fail: function (error) {
            wx.hideLoading();
            console.log(error);
          }
        })
      } else {
        wx.hideLoading();
        console.log('获取图片地址失败，请稍后重试')
      }
    })
  },

  uploadTap () {
    const self = this

    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success (res) {
        const src = res.tempFilePaths[0]
        //  获取裁剪图片资源后，给data添加src属性及其值

        self.wecropper.pushOrign(src)
      }
    })
  },

  getImage() {
    var _this = this
    wx.navigateBack({
      
    })
  },

  onLoad (option) {
    const { cropperOpt } = this.data
    let that = this;
    if(option.src) {
      src = option.src
    }
    if(option.share) {
      this.setData({
        share: option.share
      })
    }

    new WeCropper(cropperOpt)
      .on('ready', (ctx) => {
        console.log(`wecropper is ready for work!`)
        that.wecropper.pushOrign(src);
      })
      .on('beforeImageLoad', (ctx) => {
        console.log(`before picture loaded, i can do something`)
        console.log(`current canvas context:`, ctx)
        wx.showToast({
          title: '上传中',
          icon: 'loading',
          duration: 20000
        })
      })
      .on('imageLoad', (ctx) => {
        console.log(`picture loaded`)
        console.log(`current canvas context:`, ctx)
        wx.hideToast()
      })
      .on('beforeDraw', (ctx, instance) => {
        // console.log(`before canvas draw,i can do something`)
        // console.log(`current canvas context:`, ctx)
      })
      .updateCanvas()
  }
})
