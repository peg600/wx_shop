// pages/offlineShop/share/tagComponent/tag.js

const app = getApp();
var baseUrl = app.globalData.baseHttpUrl;

Component({
  /**
   * 组件的属性列表
   */
  properties: { 
    tag: {
      type: Object,
      value: ""
    },
    index: {
      type: Number,
      value: ""
    },
    chosen_tag: {
      type: Object,
      value: ""
    },
    screen_width: {
      type: Number,
      value: ""
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  attached() {
    console.log(this.data.tag)
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    changeDirect() {
      let that = this;
      let tag = this.data.tag;
      let index = this.data.index;
      let screen_width = this.data.screen_width;
      if (!tag.min_left && !tag.min_right) {
        const query = wx.createSelectorQuery().in(this)
        query.select(`#tag-${index}`).boundingClientRect(function (res) {
          console.log(res)
          tag.width = res.width;
          if(!tag.left) {
            if (res.left < res.width) {
              tag.min_left = tag.width
            }
          }else{
            if (screen_width - res.right < res.width) {
              tag.min_right = tag.x - (res.width - (screen_width - res.right))
            }
          }

          that.triggerEvent("changeDirect", {
            index: index,
            min_left: tag.min_left,
            min_right: tag.min_right,
            width: tag.width
          }, {
              bubbles: true,
              composed: true
            })
        }).exec()
      }else{
        this.triggerEvent("changeDirect", {
          index: index
        }, {
          bubbles: true,
          composed: true
        })
      }
    },

    chosen() {
      let that = this;
      this.triggerEvent("chosen", {
        index: that.data.index
      }, {
        bubbles: true,
        composed: true
      })
    }
  }
})
