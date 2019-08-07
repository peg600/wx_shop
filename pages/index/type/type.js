// pages/index/type/type.js
const app = getApp();
var apsData = app.globalData.tempUrl.datas;
const baseUrl = app.globalData.baseHttpUrl;
const shop_id = app.globalData.shop_id;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sortNameList: apsData.sortNameList,
    glasses_data: [],
    activeShopId: "0",
    historys: [],//保存历史搜索纪录噢
    historyShow: true,
    searchInput: '',
    hidden: true,
    adjustHttp: "加载中···",
    hasMoreList : [{
       text:"测试"
    }],
    page : 1

  },
  getGoodList: function () {
    var that = this;

    wx.request({
      url: 'https://www.iwao.cn:8008/shopping/?c=category&a=getproducts&page=1&keywords=' + that.data.searchInput,
      method: "POST",
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType:'txt',
      data: {
        shop_id: shop_id
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data));
        var list = res.data.list;
        that.setData({
          glasses_data: list,
          hidden: true
        })

      },
      fail: function (err) {
        //console.log(err)
        wx.showToast({
          title: '请求失败，请检查网络重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  sortBindGetList: function (e) {
    this.setData({
      activeShopId: e.currentTarget.id
    });

    var that = this;
    wx.request({
      url: 'https://www.iwao.cn:8008/shopping/?c=category&a=getproducts&id=&page=&sort=' + e.currentTarget.dataset.sorts + '&oder=DESC',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType:'txt',
      data: {
        shop_id: shop_id
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data));
        if (!res.data || res.data.length == 0) {
          return
        };
        that.setData({
          glasses_data: res.data.list
        })
      },
      fail: function (err) {
        //console.log(err)
        wx.showToast({
          title: '请求失败，请检查网络重试',
          icon: 'none',
          duration: 2000
        })
      }
    })

  },

  // 去重

  removeDuplicatedItem: function (arr) {
    var ret = [];
    debugger
    for (var i = 0, j = arr.length; i < j; i++) {
      if (ret.indexOf(arr[i].name) === -1) {
        ret.push(arr[i]);
      }
    }
    return ret;
  },
  //绑定input输入数据
  listenSearch: function (e) {
    this.setData({
      searchInput: e.detail.value
    })
  },
  //点击搜索按钮
  searchNewList: function (e) {
    var self = this;
    if (self.data.searchInput.length == 0) {
      return;
    }
    //控制搜索历史
    var self = this;

    this.getGoodList()
    if (this.data.searchInput != '') {
      //将搜索记录更新到缓存
      var searchData = self.data.historys;
     // var a= this.removeDuplicatedItem(searchData);
      
      searchData.push({
        name: self.data.searchInput
      });
      ;
      wx.setStorageSync('searchData', searchData);
      self.setData({ historyShow: false, hidden: false })
    }
  },
  //清楚缓存 historys
  clearLog: function () {
    wx.removeStorageSync('searchData')
    this.setData({
      historys: [],
      historyShow: false,
    })
  },
  //打开搜索历史 并且在页面加载的时候 show!
  openLocationsercher: function () {
    this.setData({
      historys: wx.getStorageSync('searchData') || [],
      historyShow: true,
    })
  },
  clickHistory: function (e) {

    this.setData({
      historyShow: false,
      searchInput: e.currentTarget.dataset.name.name
    })

    this.getGoodList();
  },
  // clearLog :function(){
  //   //console.log('aa')
  //    this.setData({
  //      historyShow : false
  //    })
  //     //wx.removeStorageSync('searchLog')
  // },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	  getApp().parseInviter(options);
    var that = this;

    that.openLocationsercher()
    //获取  搜索 列表



  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },


  onReachBottom: function () {

    var that = this;
    that.setData({
      hidden: false
    })

    
    //if (!this.data.hasMore) return
    var pages = ++this.data.page;
    //console.log(pages + "这是页数")
    wx.request({
      url: 'https://www.iwao.cn:8008/shopping/?c=category&a=getproducts&page='   + pages + '&keywords=' + that.data.searchInput,
      data: {
        shop_id: shop_id
      },
      dataType:'txt',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data));
        that.setData({
          glasses_data: that.data.glasses_data.concat(res.data.list),
          hidden: true,
          hasMoreList: res.data.list
        })

      },
      fail: function (err) {
        //console.log(err)
        wx.showToast({
          title: '请求失败，请检查网络重试',
          icon: 'none',
          duration: 2000
        })
      }

    })
    if (that.data.hasMoreList.length == 0) {
      that.setData({
        hidden: false
      })
      return
    }
  },
  onPullDownRefresh: function (e) {
    var that = this;
    that.setData({
      hasRefesh: true,
    });

    wx.request({
      url: 'https://www.iwao.cn:8008/shopping/?c=category&a=getproducts&page=' + 0 + '&type=hot',
      method: "POST",
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType:'txt',
      data: {
        shop_id: shop_id
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data));
        that.setData({
          glasses_data: res.data.list,
          hidden: true,
          page: 1,
          hasRefesh: false,
        });
      },
      fail: function (err) {
        //console.log(err)
        wx.showToast({
          title: '请求失败，请检查网络重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
})