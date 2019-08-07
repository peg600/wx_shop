// component/imagelist/imagelist.js
Component({
  /**
   * 组件的属性列表
   */
  properties: { 
    listStyle:{
      type:Number,
      value:0, //0:轮播广告 1:一行一个 2:横向滑动(大) 3:横向滑动(小) 4:横向滑动(导航)
    },
    margin:{
      type:Number,
      value:20
    },
    radius:{
      type:Number,
      value:20
    },
    imageStyle: {
      type: Number,
      value: 0, //0:填充 1:留白
    },
    imageMargin:{
      type:Number,
      value:0,
    },
    imageNumberOneScreen:{
      type:Number,
      value:4
    },
    images:{
      type:String,
      value:'',
    },
    URLs:{
      type:String,
      value:'',
    },
    texts: {
      type: String,
      value: '',
    },
    titles:{
      type:String,
      value:'',
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    imageList:[],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _clickImage:function(e)
    {
      var url1 = e.currentTarget.dataset.url;
      var title = e.currentTarget.dataset.title;
      if (url1 != undefined && url1.length > 0)
      {
        if(url1.length > 5 && url1.substring(0,4)=="http")
        {
          url1 = "/pages/zActions/zActions?actionPageUrl=" + encodeURIComponent(url1) + "&actionTitle=" + title;
        }
       
          wx.navigateTo({
          url: url1,
          success: function (res) { },
          fail: function (res) { 
            wx.switchTab({
              url: url1,
            })
          },
          complete: function (res) { },
        })
      }
    }
  },

  attached: function () {
    var arr = this.data.images.split(",");
    var arr1 = this.data.URLs.split(",");
    var arr2 = this.data.texts.split(",");
    var arr3 = this.data.titles.split(",");

    var len = arr.length;
    var that = this;
    for (var i = 0; i < len; i++) {
      this.data.imageList.push({image:arr[i],url:arr1[i],text:arr2[i],title:arr3[i]});
    }

    var that = this;
    this.setData({
      imageList: that.data.imageList
    })
  },
})
