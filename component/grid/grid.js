// component/grid/grid.js
Component({ 
  /**
   * 组件的属性列表
   */
  properties: {
    gridStyle:{
      type:Number,
      value: 0, //0:一行排列 1:两行排列 2:1左2右 3:1上2下 4:1左3右
    },
    images: {
      type: String,
      value: '',
    },
    URLs: {
      type: String,
      value: '',
    },
    imageMargin:{
      type:Number,
      value:0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    imageList: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _gotoURL:function(e)
    {
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
    var arr1 = this.data.URLs.split(",");
    var len = arr.length;
    var that = this;
    for (var i = 0; i < len; i++) {
      this.data.imageList.push({ image: arr[i], url: arr1[i] });
    }

    var that = this;
    this.setData({
      imageList: that.data.imageList
    })
  },
})
