// component/splitter/splitter.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    margin:{
      type:Number,
      value:0,
    },
    background:{
      type:String,
      value:'#E5E5E5'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    splitterLength:750
  },

  /**
   * 组件的方法列表
   */
  methods: {

  },

  attached: function () {
    this.data.splitterLength = 750 - 2 * this.data.margin;
    var that = this;
    this.setData({
      splitterLength: that.data.splitterLength
    })
  }
})
