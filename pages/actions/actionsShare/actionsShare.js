// pages/actions/actionsShare/actionsShare.js
var app = getApp();
var baseUrl = app.globalData.baseHttpUrl;
const shopId = app.globalData.shopId;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    act_id:0,
    goodsInfo:[],
    yuanTotal:0,
    total:0,
    discount:0,
    count:0,
    yuanTotal:0,
    baseUrl:baseUrl,
    isTime:false,
    isShowBtn:false,
    picURL: ""
  },
  total:function(){
    var total = 0, yuanTotal=0, count = 0;
      this.data.goodsInfo.forEach(function(item){
        count ++;
        yuanTotal += parseInt(item.shop_price);
      })
      //console.log(total)
      this.setData({
        count:count,
        discount: Math.floor((yuanTotal - this.data.total) * 100)/100,
        yuanTotal:yuanTotal
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   getApp().parseInviter(options);
    // options.act_id = 60;
    //options.order_id = 872;
    if (options.act_id > 0){
      this.setData({
        act_id: options.act_id
      })

      this.getActionsInfo(options.order_id);
    }

    
  },
  getActionsInfo: function (order_id){
    var that = this;
    wx.request({
      url: baseUrl + '/index.php?m=default&c=flow&a=get_order_info_by_act_id',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      method: "POST",
      dataType: 'txt',
      data: {
        order_id: order_id,
        shopId: shopId
      },
      success: function (res) {
        //console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data));
        //console.log(res)
        that.setData({
          goodsInfo:res.data,
          total:Math.floor(parseFloat(res.data[0].total) * 100) /100,
          picURL: res.data[0].picURL
        })
        //console.log(res.data[0].status)
        if (res.data[0].status == 2){
          //console.log(res.data[0])
          that.setData({
            timer: '该订单已失效',
            isTime: false,
            isShowBtn:false
          })
        } else if (res.data[0].status == 1){
          
        } else if (res.data[0].status == 0){
          //console.log('该订单进行中')
          that.setData({
            isTime:true,
            isShowBtn:true
          })
          that.countDown()
        }
        
        that.total();
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
  //计算倒计时
  countDown: function () {
    var that = this;
    var created_time = that.data.goodsInfo[0].created_time;
    //console.log(typeof created_time)
    var hCreated = Date.parse(created_time.replace(/-/g, "/"));   //null
    var countDownTime = 86400000;
    var timer = setInterval(function () {
      // //console.log(created_time)
      // //console.log(hCreated)
      var daojishi = countDownTime - (Date.parse(Date()) - hCreated);
      var houer = parseInt(daojishi / 3600000);
      var minute = parseInt((daojishi - houer * 3600000) / 60000);
      var second = parseInt((daojishi - houer * 3600000 - minute * 60000) / 1000);
      if (Date.parse(Date()) - hCreated >= countDownTime) {
        clearInterval(timer)
        that.setData({
          timer: '该订单已失效',
          isTime:false,
          isShowBtn:false
        })
        wx.request({
          url: baseUrl + '/index.php?m=default&c=flow&a=expired_action',
          header: { "Content-Type": "application/x-www-form-urlencoded" },
          method: 'POST',
          data:{
            act_id: that.data.act_id,
            session_id: wx.getStorageSync('session_id'),
            shopId: shopId
          },
          dataType: 'txt',
          success: function (res) {
            //console.log(res)
            function Trim(str) {
              return str.replace(/(^\s*)|(\s*$)/g, "");
            }
            res.data = JSON.parse(Trim(res.data));
           
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
      } else {
        // //console.log(typeof houer)
        // //console.log(typeof minute)
        // //console.log(typeof second)
        if(houer<10){
          houer = '0' + '' + houer
        }
        if (minute < 10) {
          minute = '0' + '' + minute
        }
        if (second < 10) {
          second = '0' + '' + second
        }

        that.setData({
          // timer: houer + ':' + minute + ':' + second
          timer: houer  + ":" +  minute + ":" +  second+'后结束',
          isTime:true,
          isShowBtn:true
        })
      }
    }, 1000)
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
    return {
      title:'必须得听听你的意见，我买的这些东西怎么样？适合我的话帮我撮合下！',
     // imageUrl: this.data.picURL,
      path: getApp().fillPathParams('/pages/actions/actionsJoin/actionsJoin?act_id='+this.data.act_id),
    }
  }
})