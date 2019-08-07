// component/dialog/dialog.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    visible:{
      type:Boolean,
      value:false
    },
    showCloseButton:{
      type:Boolean,
      value:false
    },
    autoHide: {
      type: Boolean,
      value: false
    },
    width:{
      type:Number,
      value:500
    },
    height:{
      type:Number,
      value:800
    },
    contentPadding:{
      type:Number,
      value:10
    },
    title:{
      type:String,
      value:''
    },
    content:{
      type:String,
      value:''
    },
    color:{
      type:String,
      value:""
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    left:"25%",
    top:"25%",
    top1:"25%",
  },

  /**
   * 组件的方法列表
   */
  methods: {
    hideDialog() {
      if (!this.data.autoHide)
      return;
      this.setData({
        visible: false
      })
    }
  },

  prevent()
  {

  },

  attached: function () 
  {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        let h = 750 * res.windowHeight / res.windowWidth;
        let left = (750 - that.data.width) * 0.5;
        let top = (h - that.data.height - 110 - 40) * 0.5; 
        that.setData({
          left:left +"rpx",
          top: top + "rpx",
          top1: top + that.data.height + 110 + 80+ "rpx"
        })
      }
    })
  }
})
