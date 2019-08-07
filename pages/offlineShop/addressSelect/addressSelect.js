// pages/lottery/addressSelect/addressSelect.js
import citys from './../../../lib/city.js';
import ap from './../../../lib/airport.js';
import convertPinyin from './../../../lib/toPinyin.js';
let pinYin = convertPinyin.convertPinyin;

let app = getApp();
let qqmap = require('../../../lib/qqmap-wx-jssdk.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    toView: 'Z',
    scrollHeight:1000,
    citylist: [],
    //下面是热门城市数据，模拟数据
    newcity: ['北京市', '上海市', '广州市', '深圳市', '成都市', '杭州市'],
    locateCity: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.parseInviter(options)

    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        let h = 750 * res.windowHeight / res.windowWidth
        that.setData({
          scrollHeight:h
        })
      }
    })
    //load data
    let airport = ap.airport;
    airport = this.convertAirport(airport);
    var citys = [];
    for (var i = 0;i < airport.length; i ++)
    {
      var letter = airport[i].first;
      var obj = undefined;
      for (var j = 0; j < citys.length; j ++)
      {
        if(citys[j].letter == letter)
        {
          obj = citys[j];
          break;
        }
      }
      if(obj == undefined)
      {
        obj = new Object();
        obj.letter = airport[i].first;
        obj.data = [];
        citys.push(obj);
      }
      var obj1 = new Object();
      obj1.id = airport[i].code;
      obj1.cityName = airport[i].areaName;
      obj.data.push(obj1);
      
    }
    this.setData({
      citylist:citys,
      toView: "Z"
    })
  },

  //将城市名称转为拼音
  convertAirport(airport) {
    let that = this;
    for (let i = 0; i < airport.length; i++) {
      let pinyin = pinYin.convertPinyin(airport[i].areaName);
      airport[i].pinyin = pinyin;
      airport[i].first = airport[i].pinyin.substr(0, 1).toUpperCase();
    }
    airport = airport.sort(function (a, b) {
      return a.first.localeCompare(b.first)
    })
    return airport;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this,
      cityOrTime = wx.getStorageSync('locatecity') || {},
      time = new Date().getTime(),
      city = '';
    if (!cityOrTime.time || (time - cityOrTime.time > 1800000)) {//每隔30分钟请求一次定位
     // this.getLocate();
    } else {//如果未满30分钟，那么直接从本地缓存里取值
      that.setData({
        locateCity: cityOrTime.city
      })
    }
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

  //点击城市
  cityTap(e) {
    const val = e.currentTarget.dataset.val || '',
      types = e.currentTarget.dataset.types || '',
      Index = e.currentTarget.dataset.index || '',
      that = this;
    let city = this.data.citySel;
    switch (types) {
      case 'locate':
        //定位内容
        city = this.data.locateCity;
        break;
      case 'national':
        //全国
        city = '全国';
        break;
      case 'new':
        //热门城市
        city = val;
        break;
      case 'list':
        //城市列表
        city = val.cityName;
        break;
    }
    if (city) {
      var pages = getCurrentPages();
      var currPage = pages[pages.length - 1];   //当前页面
      var prevPage = pages[pages.length - 2];  //上一个页面

      prevPage.setData({
        city: city
      });
      prevPage.reload();
      wx.navigateBack();
      
    } else {
      //console.log('还没有');
    }

  },
  //点击城市字母
  letterTap(e) {
    var item = e.currentTarget.dataset.item.letter;
    this.setData({
      toView: item
    });
    //console.log(this.data.toView);
  },

  //调用定位
  getLocate() {
    let that = this;
    new qqmap().getLocateInfo().then(function (val) {//这个方法在另一个文件里，下面有贴出代码
      //console.log(val);
      if (val.indexOf('市') !== -1) {//这里是去掉“市”这个字
        //console.log(val.indexOf('市') - 1);
        val = val.slice(0, val.indexOf('市'));
        //console.log(val);
      }
      that.setData({
        locateCity: val
      });
      //把获取的定位和获取的时间放到本地存储
      wx.setStorageSync('locatecity', { city: val, time: new Date().getTime() });
    });
  }
})