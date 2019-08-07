// component/tabbar/tabbar.js
let app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    add_class: {  //传入的class，在父组件中定义该class的样式，会被用于本组件
      type: String,
      value: 'basic'  //默认basic，定义在组件中
    },
    tabbar_set: {     
      type: String, 
      value: ""      
    },
    selected_index:   //当前调用组件的页面对应第几个导航
    {
      type:Number,
      value:0
    },
    show:     //控制tabbar显示隐藏
    {
      type:String,
      value:"true"
    }
  },

  options: {
    addGlobalClass: true,
    multipleSlots: true  // 在组件定义时的选项中启用多slot支持
  },

  /**
   * 组件的初始数据
   */
  data: {
    tabbar_data: {},
    tabBar: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _select: function (e) {
      var path = e.currentTarget.dataset.path;
      wx.reLaunch({
        url: path,
        success: function(res) {
          if (!app.globalData.has_upload_form_id) {
            app.uploadFormIds();
          }
        },
        fail: function (res) {
          wx.showToast({
            title: res.errMsg,
          })
        }
      })
    }
  },

  attached: function () {
    if (this.data.tabbar_set) {
      let tabbar_set = this.data.tabbar_set;
      this.setData({
        tabbar_data: JSON.parse(tabbar_set)
      })
      app.globalData.tabbar_set = JSON.parse(tabbar_set);
    }else{
      this.setData({
        tabbar_data: app.globalData.tabbar_set
      })
    }
  },
})
