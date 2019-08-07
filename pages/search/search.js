// pages/index/type/type.js
const app = getApp();
var apsData = app.globalData.tempUrl.datas;
var baseUrl = app.globalData.baseHttpUrl
const shop_id = app.globalData.shop_id;
Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    sortNameList: apsData.sortNameList,
    glasses_data: [],
    activeShopId: "0",
    historys: [],//保存历史搜索纪录
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
    sortFlag:true               // true==ASC,false==DESC

  },

  getGoodList: function () {
  if(this.data.searchInput.length > 0) {
      this.selectComponent("#goodlist").search(this.data.searchInput);
    } 
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
    ////console.log(e.detail.value)
    if(e.detail.value){
      this.setData({
        showClear:true
      })
    }else{
      this.setData({
        showClear:false
      })
    }
  },

  //清除输入的数据
  clearValue:function(){
   this.selectComponent("#goodlist").reset();
  },
  //点击搜索按钮
  searchNewList: function (e) {
    var self = this;
    if (e && e.detail && e.detail.key && e.detail.key.length > 0) {
      self.data.searchInput = e.detail.key;
    } else if (!(self.data.searchInput && self.data.searchInput.length > 0)) {
      return
    }
    
    //控制搜索历史
    var self = this;

    this.getGoodList();


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
    ////console.log(e.currentTarget)
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
  //   ////console.log('aa')
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
    if(options.searchInput) {
      this.setData({
        searchInput: options.searchInput,
        placeholder: options.searchInput
      })
      this.searchNewList();
    }

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
    ////console.log('下拉了')
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
    });
    this.selectComponent("#goodlist").onReachBottom();
  },
})