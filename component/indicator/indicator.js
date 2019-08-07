// component/indicator/indicator.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title:{
      type:String,
      value:''
    },
    subTitle:{
      type:String,
      value:''
    },
    showDot:{
      type:Number,
      value:1
    },
    margin:{
      type:Number,
      value:20,
    },
    tip:{
      type:String,
      value:''
    },
    tipType:{
      type:Number,
      value:0 //0：文本,1:image
    },
    URL:{
      type:String,
      value:'',
    },
    background:{      //背景颜色
      type:String,
      value:''
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
    _goto:function(e)
    {
      if (this.data.URL != undefined && this.data.URL.length > 0)
      {
        var url = this.data.URL;
        wx.navigateTo({
          url: url,
          fail:function(res)
          {
            wx.switchTab({
              url: url,
            })
          }
        })
      }
    }
  }
})
