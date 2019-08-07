// component/topbar/topbar.js
let app = getApp(); 
let baseUrl = app.globalData.baseHttpUrl;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    float: {            //决定品类条是否始终浮动在最上方
      type: Boolean,
      value: false
    },
    top: {              //当前页面滚动后距顶部的距离，float为true时有效
      type: Number,
      value: 0,
      observer: "compareTop"
    },
    showSearchBar:{
      type:Boolean,
      value:true
    },

    goods: {            //不输入则默认为全部商品
      type: String, //goods_id用逗号分隔，排序根据输入顺序
      value: "",       //all：所有商品，按页排序
    },                 //hot或promote：热销或促销，排序根据order设定
    page_number: {  //每页显示的商品个数，goods不为“all”时有效
      type: Number,
      value: 20
    },
    limit_number: {  //最多取商品个数，goods不为“all”和goods_id时有效
      type: Number,
      value: 0
    },
    order: {    //指定排序方式，new从新到旧，low_price价格从低到高,high_price从高到低
      type: String,
      value: "new"
    },
    pull_down_refresh: {    //是否开启下拉刷新
      type: Boolean,
      value: false
    },
    margin: {
      type: Number,
      value: 0,
    },
    listStyle: {
      type: Number,
      value: 1, //0: 大图 1：小图 2：一大两小 3:一行三个 4:详细列表 5:横向滑动 
    },
    imageStyle: {
      type: Number,
      value: 0, //0:填充 1:留白
    },
    imageRatio: {
      type: Number,
      value: 1
    },
    itemStyle: {
      type: Number,
      value: 0, // 0:卡片1 1:卡片2 3：极简模式
    },
    itemGoodsName: {
      type: Number,
      value: 1, //0：隐藏，1：显示
    },
    itemGoodsDesc: {
      type: Number,
      value: 0, //0：隐藏, 1:显示
    },
    itemGoodPrice: {
      type: Number,
      value: 1, //0:隐藏，1：显示
    },
    itemBuyStyle: {
      type: Number,
      value: 0 //0: 隐藏 1：样式1 2：样式2 3：样式3 4：样式4
    },
    itemCornerStyle: {
      type: Number,
      value: 0 //0:隐藏 1：新品 2：热卖 3：New 4：Hot
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    componentlist: [],   //首选项的配置页内容，对象数组

    cat_list: [],
    current_cat: "",

    top_distance: "",    //组件生成时距离页面顶部的高度
    is_float: false,      //是否浮动
    has_shadow: false,    //是否有浮动阴影，仅当置顶时有用

    goodlist_height: ""
  },

  /**
   * 组件的方法列表
   */
  methods: {

    //获取物品分类列表
    getCatList() {
      let that = this;
      wx.request({
        url: `${baseUrl}/index.php?m=default&c=category`,
        method: 'POST',
        dataType: 'txt',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
          session_id: wx.getStorageSync('session_id')
        },
        success: function (res) {
          function Trim(str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
          }
          res = JSON.parse(Trim(res.data));
          //console.log(res)
          if (res && res.list) {
            that.setData({
              cat_list: res.list
            })
            if(that.data.componentlist.length == 0) {
              for (let key in res.list) {
                that.setData({
                  current_cat: res.list[key]
                })
                break;
              }
            }
          }
        }
      });
    },

    //获取第一项配置页
    getPageContent() {
      let that = this;
      wx.request({
        url: baseUrl + '/?c=page&a=getIndexPage&id=1',
        method: "POST",
        dataType: 'txt',
        success: res => {
          that.getCatList();
          function Trim(str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
          }
          let pages = JSON.parse(Trim(res.data));
          if(pages.pages != '') {                     //如果有配置
            let componentlist = JSON.parse(pages.pages);
            //console.log(componentlist)
            that.setData({
              componentlist: componentlist
            });
          }
        },
        fail: function (res) {
          
        }
      });
    },

    //选择某一品类
    chooseCat(e) {
      let that = this;
      const query = wx.createSelectorQuery().in(this)
      let component_name = "#goodlist";
      if(that.data.current_cat == "") {
        component_name = "#container"
      }
      query.select(component_name).boundingClientRect(function (res) {
        //console.log(res)
        that.setData({
          goodlist_height: res.height,
          show_shadow: true
        })

        let current_cat = e.currentTarget.dataset.cat
        that.setData({
          current_cat: current_cat
        })
      }).exec()
    },

    onComplete() {
      let that = this;
      if (!this.data.top_distance) {
        const query = wx.createSelectorQuery().in(this)
        query.select('#scroll-wrapper').boundingClientRect(function (res) {
          console.log(res.top)
          that.setData({
            top_distance: res.top
          })
          if (Math.round(res.top) == 0 && that.data.float) {
            that.setData({
              is_float: true
            })
          }
        }).exec()
      }
      
      if(this.data.show_shadow) {
        this.setData({
          show_shadow: false
        })
        that.triggerEvent("changeCat", that.data.top_distance, { bubbles: true, composed: true, })
      }else{
        this.setData({
          show_shadow: false
        })
      }
      
      
    },

    compareTop(newVal) { 
      if (Math.round(this.data.top_distance) == this.data.navbar_height) {
        if (newVal == this.data.navbar_height) {
          this.setData({
            has_shadow: false
          })
        }else{
          if (!this.data.has_shadow) {
            this.setData({
              has_shadow: true
            })
          }
        }
        return
      }
      if(this.data.float) {
        if(newVal > this.data.top_distance){
          if(!this.data.is_float) {
            this.setData({
              is_float: true,
              has_shadow: true
            })
          }
        }else{
          if (this.data.is_float) {
            this.setData({
              is_float: false,
              has_shadow: false
            })
          }
        }
      }
    },

    onReachBottom() {
      if(this.data.current_cat) {
        this.selectComponent("#goodlist").onReachBottom()
      }else{
        this.selectComponent("#container").onReachBottom()
      }
    }

  },

  attached: function () {
    this.setData({
      navbar_height: app.globalData.height
    })
    this.getPageContent();
  },

  ready() {
    let that = this;
    // setTimeout(() => {
    //   const query = wx.createSelectorQuery().in(this)
    //   query.select('#scroll-wrapper').boundingClientRect(function (res) {
    //     //console.log(res)
    //     that.setData({
    //       top_distance: res.top
    //     })
    //   }).exec()
    // },1000)
  }
})
