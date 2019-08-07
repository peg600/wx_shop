// component/headpanel/headpanel.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title:{
      type:String,
      value:'',
    },
    textsize:
    {
      type:Number,
      value:0, //0:大 1:中 2:小
    },
    subtitle:{
      type:String,
      value:'',
    },
    alignment:{
      type:Number,
      value:0, //0:左 1:居中 2:右
    },
    background:{
      type:String,
      value:'white'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    textalign:"center"
  },

  /**
   * 组件的方法列表
   */
  methods: {

  },

  attached: function () {
    switch (this.data.alignment) {
      case 0:
        this.data.textalign = "left";
        break;
      case 1:
        this.data.textalign = "center";
        break;
      case 2:
        this.data.textalign = "right";
        break;
    }

    var that = this;
    this.setData({
      textalign: that.data.textalign
    })
  }
})
