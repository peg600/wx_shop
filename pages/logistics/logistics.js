// pages/logistics/logistics.js
const app = getApp();
const baseUrl = app.globalData.baseHttpUrl;
const shop_id = app.globalData.shop_id;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    logisticsInfo: {},
    logisticsList: [],
    addressInfo: {},
    isShow:false,
    isSingle:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	  getApp().parseInviter(options);
    // wx.showLoading({
    //   title: '请稍候',
    // })
    var that = this;
    if(options.sn != undefined && options.com != undefined)
    {
      var no = options.sn;       //运单号
      var com = options.com;    //快递公司简称
      that.isSingle = true;
      //console.log("Session:" + wx.getStorageSync('session_id'));
      wx.request({
        url: baseUrl + '/index.php?m=default&c=exp&a=query',
        method: 'POST',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        dataType: 'txt',
        data: {
          session_id: wx.getStorageSync('session_id'),
          no: no,
          com: com,
          shop_id: shop_id
        },
        success: function (res) {
          //console.log(res)
          function Trim(str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
          }
          res.data = JSON.parse(Trim(res.data))
          //console.log(res.data)
          if (res.data.result.error_code == 0) {
            wx.hideLoading();
            that.setData({
              shoplist: null,
              isShow: true,
              isSingle:true,
              logisticsInfo: res.data.result.result,
              logisticsList: res.data.result.result.list.reverse()
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
      return;
    }
    var order_id = options.order_id;
    var that = this;
    //get the summary of the express
    wx.request({
      url: baseUrl + '/?c=order&a=getexpresswithorder&id=' + order_id,
      method: "POST",
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType: 'txt',
      data: {
        shop_id: shop_id
      },
      success: res => {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data));
        //console.log(res.data)
        var keys = new Array();
        var values = new Array();
        for (var key in res.data) {
          keys.push(key);     //获取key值
          var goods = new Array();
          for (var key1 in res.data[key].goods)
          {
            goods.push(res.data[key].goods[key1]);
          }
          res.data[key].goods_list = goods;
          values.push(res.data[key]); //获取对应的value值
        }

        that.isSingle = keys.length == 1;
        //console.log(keys)
        if (keys.length == 1)
        {
          var no = values[0].express_form_sn;       //运单号
          var com = values[0].express_company_short;    //快递公司简称
          that.isSingle = true;
          //console.log("Session:" + wx.getStorageSync('session_id'));
          wx.request({
            url: baseUrl + '/index.php?m=default&c=exp&a=query',
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            dataType: 'txt',
            data: {
              session_id: wx.getStorageSync('session_id'),
              no: no,
              com: com,
              shop_id: shop_id
            },
            success: function (res) {
              function Trim(str) {
                return str.replace(/(^\s*)|(\s*$)/g, "");
              }
              res.data = JSON.parse(Trim(res.data))
              //console.log(res.data)
              if (res.data.result.error_code == 0) {
                wx.hideLoading();
                that.setData({
                  shoplist: null,
                  isShow: true,
                  isSingle: true,
                  logisticsInfo: res.data.result.result,
                  logisticsList: res.data.result.result.list.reverse()
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
          });
        }
        else
        {
          //console.log(values)
          for(var i=0;i<values.length;i++) {  //循环出每个运单
            for(var j=0;j<values[i].goods_list.length;j++) {
              var url = values[i].goods_list[j].goods_thumb;
              url = baseUrl + '/' + url;
              values[i].goods_list[j].goods_thumb = url;
            }
          }
          console.log(values)

          that.setData({
            shoplist: values,
            isShow: false,
            isSingle: that.isSingle,
            logisticsInfo: null,
            logisticsList: null
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
    });
  },

  bindexpress:function(no,com)
  {
    var that = this;
    wx.request({
      url: baseUrl + '/index.php?m=default&c=exp&a=query',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType: 'txt',
      data: {
        session_id: wx.getStorageSync('session_id'),
        no: no,
        com: com,
        shop_id: shop_id
      },
      success: function (res) {
        //console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data))
        //console.log(res.data)
        if (res.data.result.error_code == 0) {
          wx.hideLoading();
          //console.log(values)
          that.setData({
            shoplist: values,
            isShow: true,
            logisticsInfo: res.data.result.result,
            logisticsList: res.data.result.result.list.reverse()
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

  showexpress:function(e)
  {
    var sn = e.currentTarget.dataset.sn;
    var company = e.currentTarget.dataset.company;
    wx.navigateTo({
      url: '/pages/logistics/logistics?sn=' + sn + '&com=' + company
    })
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
     var params = getApp().getShareParams();
    return params;
  }
})