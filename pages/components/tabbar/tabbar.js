// pages/component/tabbar/tabbar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    selected_index:{
      type:Number,
      value:0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    tabbar_set: JSON.stringify([
      {
        "pagePath": "/pages/New/index",
        "text": "颜值集市",
        "iconPath": "/pages/img/home.png",
        "selectedIconPath": "/pages/img/shome.png"
      },
      {
        "pagePath": "/pages/lottery/lottery",
        "text": "春节免费机票",
        "pageTum": "navigate",
        "iconPath": "/pages/img/photo.png",
        "selectedIconPath": "/pages/img/sphoto.png"
      },
      {
        "pagePath": "/pages/personCenter/personCenter",
        "text": "个人中心",
        "iconPath": "/pages/img/person.png",
        "selectedIconPath": "/pages/img/sperson.png"
      }
    ])
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
