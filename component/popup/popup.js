// component/popup/popup.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {       //控制显示，1为默认显示
      type: Number,
      value: 0
    },

    show_close: {     //是否显示关闭×
      type: Number,
      value: 1
    },

    max_height: {     //弹框最大高度,要带单位
      type: String,
      value: ""
    },

    mask_color: {     //蒙版颜色
      type: String,
      value: "rgba(0, 0, 0, 0.2)"
    },

    title_class: {    //标题栏样式
      type: String,
      value: "title-class"
    },

    title: {
      type: String,
      value: "test"
    },

    animate: {      //是否开启弹出动画
      type: Number,
      value: 1
    }
  },

  options: {
    externalClass: true,
    multipleSlots: true  // 在组件定义时的选项中启用多slot支持
  },

  /**
   * 组件的初始数据
   */
  data: {
    

  },

  /**
   * 组件的方法列表
   */
  methods: {
    toggleShow() {
      let that = this;
      this.setData({
        show: !that.data.show
      })

      this.setData({
        animationData: "",
      })
      
      if (this.data.show) {
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

    prevent() {
      return
    }
  }
})
