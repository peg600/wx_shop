// pages/lottery/luckfriend/components/rule.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    scrollHeight:{
      type:Number,
      value:590
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    selectedIndex:0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    switchRuleTab: function (e) {
      var index = e.currentTarget.dataset.index;
      this.setData({
        selectedIndex: index
      })
    },
  }
})
