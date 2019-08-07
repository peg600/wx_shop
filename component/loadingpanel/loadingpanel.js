// component/loadingpanel/loadingpanel.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showloading:{
      type:Boolean,
      value:true
    },
    showerror:{
      type:Boolean,
      value:false
    }
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
    retry:function()
    {
      this.triggerEvent("retryRequest");
    },

    showLoadingTip()
    {
      this.setData({
        showerror: false,
        showloading: true
      })
    },

    showErrorTip()
    {
      this.setData({
        showerror:true,
        showloading:false
      })
    },

    hide()
    {
      this.setData({
        showerror:false,
        showloading:false
      })
    }
  }
})
