// component/container/container.js
Component({ 
  /**
   * 组件的属性列表
   */
  properties: {
    componentlist:{
      type:Array,
      value:[]
    },
    pull_down_refresh: {
      type: Boolean,
      value:false
    },
    top: {            //页面滚动到顶部的距离
      type: Number,
      value: 0
    },
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
    onReachBottom() {
      if (this.data.pull_down_refresh) {
        let goodlist_arr = this.selectAllComponents("#all_goods");
        //console.log(goodlist_arr)
        for(let i=0;i<goodlist_arr.length;i++) {
          goodlist_arr[i].onReachBottom();
        }
      }
    },

    onComplete() {  //监听goodlist子组件的加载完毕事件并上传，当作为topbar的子组件时有用
      this.triggerEvent("complete", {}, {
        bubbles: true,
        composed: true
      })
    },

    onChangCat(e) {
      //console.log(e)
    }
  },

  ready() {
    this.triggerEvent("componentReady");
  }
})
