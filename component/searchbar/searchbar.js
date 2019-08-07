// component/searchbar/searchbar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    placeholder: {    //默认文本
      type:String,
      value:""
    },
    float: {        //是否浮动
      type:Boolean,
      value:true
    },
    top: {          //当前页面距顶部距离，浮动时有效
      type: Number,
      value: 0,
      observer: "compareTop"
    },
    isguide:{       //是否点击后引导跳转
      type:Boolean,
      value:false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    searchInput: "",
    showClear: false,
    top_distance: "",    //组件生成时距离页面顶部的高度
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //绑定input输入数据
    listenSearch: function (e) {
      this.setData({
        searchInput: e.detail.value
      })

      if (e.detail.value) {
        this.setData({
          showClear: true
        })
      } else {
        this.setData({
          showClear: false
        })
      }
    },

    //清除输入的数据
    clearValue: function () {
      this.setData({
        searchInput: "",
        showClear: false
      })
    },

    getfocus:function(e)
    {
      if(!this.data.isguide)
      return;
      let that = this;
      wx.navigateTo({
        url: `/pages/search/search`,
      })
    },

    //点击搜索按钮
    searchNewList: function (e) {
      let that = this;
      this.triggerEvent("search", { key: that.data.searchInput }, {});
    },

    compareTop(newVal) {
      // //console.log(newVal)
      // //console.log(this.data.top_distance)
      if (Math.round(this.data.top_distance) == this.data.navbar_height) {
        if (newVal == this.data.navbar_height) {
          this.setData({
            has_shadow: false
          })
        } else {
          if (!this.data.has_shadow) {
            this.setData({
              has_shadow: true
            })
          }
        }
        return
      }
      if (this.data.float) {
        ////console.log("top:" + newVal + ";top_distance:" + this.data.top_distance);
        if (newVal > this.data.top_distance) {
          if (!this.data.is_float) {
            this.setData({
              is_float: true,
              has_shadow: true
            })
          }
        } else {
          if (this.data.is_float) {
            this.setData({
              is_float: false,
              has_shadow: false
            })
          }
        }
      }
    },
  }
})
