// pages/lottery/components/backhome/backhome.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    top:{
      type:Number,
      value:30,
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
    backHome(){
      wx.switchTab({
        url: '/pages/lottery/lottery',
      })
    }
  }
})
