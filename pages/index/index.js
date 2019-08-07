const app = getApp();
var baseUrl = app.globalData.baseHttpUrl;
Page({
  data: {
    componentlist: [],
    goodslist:[],
    pageIndex:1,
    hidden:false,
    top: 0,
    noMoreData:false
  },

  onLoad(options) {
    var that = this;
    //获取页面Head头
    wx.request({
      url: baseUrl + '/?c=page&a=getIndexPage&id=0',
      method: "POST",
      dataType: 'txt',
      success: res => {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        var pages = JSON.parse(Trim(res.data));
        that.data.componentlist = JSON.parse(pages.pages);

        that.setData({
          componentlist: that.data.componentlist
        });
      }
    });
  },

  onReachBottom: function () {
    var that = this;
    that.setData({
      hidden: false
    });

    this.selectComponent("#all_goods").pullNewData();
  },

  goSearch:function()
  {
    wx.navigateTo({
      url: '/pages/index/search/search',
    })
  },

  onPageScroll:function(e)
  {
    let that = this;
    this.data.top = e.scrollTop;
    this.setData({
      top:e.scrollTop
    })
  },

  goTop:function()
  {
    wx.pageScrollTo({
      scrollTop: 0,
    })
  },

  pullGoodFinished:function(e)
  {
    this.setData({
      hidden: true
    });

    if(!e.detail.hasNewData)
    {
      this.data.noMoreData = true;
      var that = this;
      this.setData({
        noMoreData:that.data.noMoreData
      })
    }
  },

  onShareAppMessage: function () {

  }
})