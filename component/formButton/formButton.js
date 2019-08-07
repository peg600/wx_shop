// components/formButton/formButton.js
const app = getApp();
var baseUrl = app.globalData.baseHttpUrl;
 
Component({
  /**
   * 组件的属性列表
   */ 
  properties: {
    add_class: {  //传入的class，在父组件中定义该class的样式，会被用于本组件
      type: String,
      value: 'basic'  //默认basic，定义在组建中
    },
    
    tabbar_num: {   //传入tabbar个数，根据个数决定宽度
      type: Number,
      value: 1
    },

    bottom: {   //fix距离底部位置，当需动态设置时使用
      type: Number,
      value:""
    }
  },
  options: {
    addGlobalClass: true,
    multipleSlots: true  // 在组件定义时的选项中启用多slot支持
  },

  /**
   * 组件的初始数据
   */
  data: {
    has_submit: false,
    position: "",
    bounds:[]
  },

  attached() {
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getPosition() {
      let that = this;
      const query = wx.createSelectorQuery().in(this)
      query.select('#wrapper').boundingClientRect(function (res) {
        that.setData({
          position: res
        })
      }).exec()
    },

    setBounds(bounds)
    {
      this.setData({
        bounds:bounds
      })
    },

    saveFormId(e) {
      console.log(1)
      app.collectFormId(e.detail.formId);
      var formButtonTapDetail = e // detail对象，提供给事件监听函数
      var formButtonTapOption = {} // 触发事件的选项
      this.triggerEvent('formButtonTap', formButtonTapDetail, formButtonTapOption)
    }
  },

  ready() {
    let that = this;
    this.getPosition();
  }
})
