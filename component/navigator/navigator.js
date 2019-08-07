// component/navigator/navigator.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    navigatorStyle:{ 
      type:Number,
      value:0, //0：图文导航 1:文本导航
    },
    images:{
      type:String,
      value:'', //逗号","分割
    },
    texts:{
      type:String,
      value:'', //逗号","分割
    },
    URLs:{
      type:String,
      value:'',//逗号","分割
    },
    itemOneScreen:{
      type:Number,
      value:0, //0：固定，其他值横向滑动
    },
    background:{
      type:String,
      value:'white',
    },
    foreColor:{
      type:String,
      value:'#333'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    items:[]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _gotoUrl:function(e){
      var url = e.currentTarget.dataset.url;
      if(url != undefined && url.length > 0)
      {
        wx.navigateTo({
          url: url,
          success: function (res) { },
          fail: function (res) {
            wx.showToast({
              title: res,
            })
          },
          complete: function (res) { },
        })
      }
    }
  },

  attached: function () {
    var arr = this.data.images.split(",");
    var arr1 = this.data.texts.split(",");
    var arr2 = this.data.URLs.split(",");
    var len = arr.length;
    var that = this;
    for (var i = 0; i < len; i++) {
      this.data.items.push({ image: arr[i], text: arr1[i], url:arr2[i] });
    }

    var that = this;
    this.setData({
      items: that.data.items
    })
  },
})
