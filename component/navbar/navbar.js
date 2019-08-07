// component/navbar/navbar.js

const app = getApp()
Component({
  properties: {
    title: {      //标题
      type: String,
      value: "开心小集",
    },
    show_capsule: {   //控制显示左上图标,1显示，0隐藏
      type: Number,
      value: 1
    },
  },

  data: {
    height: '',

  },

  attached: function () {
    // 获取是否是通过分享进入的小程序
    this.setData({
      share: app.globalData.share
    })
    // 定义导航栏的高度   方便对齐
    this.setData({
      height: app.globalData.height
    })
  },
  methods: {
    // 返回上一页面
    _navback() {
      wx.navigateBack()
    },
    //返回到首页
    _backhome() {
      wx.switchTab({
        url: '/pages/New/index',
      })
    }
  }

})
