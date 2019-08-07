// pages/index/type/type.js
const app = getApp();
var apsData = app.globalData.tempUrl.datas;
var baseUrl = app.globalData.baseHttpUrl
const shop_id = app.globalData.shop_id;
let Utils = require("../../../lib/Utils.js")
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
    hasMoreList: [{
      text: "测试"
    }],
    page: 1,
    active_click: false,
    sortShow: false,
    showClear:false,
    cipt:'',
    isAsc:true,
    sortFlag:true

  },
  getGoodList: function () {
    var that = this;
    var strParam = '{"pageParam":{"pageIndex":1,"pageSize":20},"queryParam":{"keywords":"' + that.data.searchInput +'"},"orderField":0}';
    Utils.JDAPIRequest({
      apiName:"jd.kepler.xuanpin.search.sku",
      strParam: strParam,
      access_token:"5477853e17694b40ad52759d2afe0cfd8",
      success:function(res)
      {
        console.log(res);
        wx.hideLoading();
      }
    })
    return;
    var that = this;

    wx.request({
      url: baseUrl+'/?c=category&a=getproducts&page=1&keywords=' + that.data.searchInput,
      method: "POST",
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType:'txt',
      data: {
        shop_id: shop_id
      },
      success: function (res) {
        //console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data));
        var list = res.data.list;
        if (list.length == 0) {
          that.setData({
            historyShow:true,
            sortShow:false
          })
          wx.showToast({
            title: '暂无商品信息',
            icon: 'none'
          })
        }
        that.setData({
          glasses_data: list,
          hidden: true
        })
        if (that.data.glasses_data.length > 0) {
          that.setData({
            sortShow: true
          })
        }
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
    var order;
    var that = this;
    
    if (e.currentTarget.id == 0 || e.currentTarget.id == 2){
      order ="DESC"
    }else{
      if (this.data.sortFlag) {
        order = 'ASC'
      } else {
        order = 'DESC'
      }
    }
    this.setData({
      activeShopId: e.currentTarget.id,
      active_click: true,
      hidden: false
    });
    var that = this;
    wx.request({
      url: baseUrl + '?c=category&a=getproducts&id=&page=&sort=' + e.currentTarget.dataset.sorts + '&order='+order+'&keywords=' + this.data.searchInput,
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
          glasses_data: res.data.list,
          hidden: true,
          sortFlag: !that.data.sortFlag
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

  // 历史搜索去重

  removeDuplicatedItem: function (arr) {
    var hash = {};
    arr = arr.reduce(function (item, next) {
      hash[next.name] ? '' : hash[next.name] = true && item.push(next);
      return item
    }, [])
    return arr
  },


  //绑定input输入数据
  listenSearch: function (e) {
    this.setData({
      searchInput: e.detail.value
    })
    //console.log(e.detail.value)
    if(e.detail.value){
      this.setData({
        showClear:true
      })
    }else{
      this.setData({
        showClear:false
      })
      //console.log('no')
    }
  },
  //清除输入的数据
  clearValue:function(){
    //console.log('clear false')
    this.setData({
      sortShow:false,
      historyShow:true,
      cipt:'',
      showClear:false,
      glasses_data:[]
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


      searchData.push({
        name: self.data.searchInput
      });


      wx.setStorageSync('searchData', this.removeDuplicatedItem(searchData));

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
  //跳转到商品详情页
  toDetailListPage: e => {
    //console.log(e.currentTarget)
    wx.navigateTo({
      url: "/pages/detailPage/detailPage?goods_id=" + e.currentTarget.dataset.goodid,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  clickHistory: function (e) {
    this.setData({
      historyShow: false,
      searchInput: e.currentTarget.dataset.name.name,
      hidden: false,
      cipt: e.currentTarget.dataset.name.name,
      showClear:true
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
    //console.log('下拉了')
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
 var params = getApp().getShareParams();
    return params;
  },


  onReachBottom: function () {

    var that = this;
    that.setData({
      hidden: false
    })
    var history = wx.getStorageSync('id');

    var onpushId = that.data.activeShopId;
    var localId = wx.setStorageSync('id', onpushId);

    if (that.data.active_click && onpushId != history && that.data.hasMoreList.length == 0) {
      that.setData({
        page: "1"
      })
    }

    //if (!this.data.hasMore) return
    var pages = ++this.data.page;
    //console.log(pages + "这是页数")
    wx.request({
      url: baseUrl+'/?c=category&a=getproducts&page=' + pages + '&keywords=' + that.data.searchInput,
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
      },
      complete:function(){
         wx.hideNavigationBarLoading();
         wx.stopPullDownRefresh()
      }

    })
    if (that.data.hasMoreList.length == 0) {
      that.setData({
        hidden: false
      })
      return
    }
  },
  // onPullDownRefresh: function (e) {
  //   var that = this;
  //   that.setData({
  //     hasRefesh: true,
  //   });

  //   wx.request({
  //     url: 'https://www.iwao.cn:8008/shopping/?c=category&a=getproducts&page=1&keywords=' + that.data.searchInput,
  //     method: "post",
  //     success: function (res) {
  //       that.setData({
  //         glasses_data: res.data.list,
  //         hidden: true,
  //         page: 1,
  //         hasRefesh: false,
  //       });
  //     },
  //     complete:function(){
  //        wx.hideNavigationBarLoading();
  //        wx.stopPullDownRefresh();
  //     }
  //   })
  // },
})