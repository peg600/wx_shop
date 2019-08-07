// pages/address/address.js
var app = getApp();
var baseUrl = app.globalData.baseHttpUrl;
const shop_id = app.globalData.shop_id;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressList: [],
    chooseAddress:false
  },
  //跳转到新增地址页面
  addAddress: function (e) {
    wx.navigateTo({
      url: '/pages/address-add/addressAdd',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  //获取当前用户地址信息列表
  getAddressList: function () {
    wx.showLoading({
      title: '请稍候',
      mask:true
    })
    var that = this;
    wx.request({
      url: baseUrl + '/index.php?m=default&c=flow&a=get_address_by_user_id',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType:'txt',
      data: {
        session_id: wx.getStorageSync('session_id'),
        shop_id: shop_id
      },
      success: function (res) {
        //console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data))
        that.setData({
          addressList: res.data
        })
        //console.log(that.data.addressList)
        wx.hideLoading();
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
  //编辑当前地址信息
  editAddress:function(e){
    //console.log(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '/pages/address-add/addressAdd?address_id=' + e.currentTarget.dataset.id,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  //删除当前选中地址
  delAddress: function (e) {
    var that = this;
    wx.showModal({
      title: '确认删除？',
      content: '确认删除当前地址？',
      success: function (res) {
        if (res.confirm) {
          var address_id = e.currentTarget.dataset.id;
          wx.request({
            url: baseUrl + '/index.php?m=default&c=flow&a=del_address_by_address_id',
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            dataType:'txt',
            data: {
              session_id: wx.getStorageSync('session_id'),
              address_id: address_id,
              shop_id: shop_id
            },
            success: function (res) {
              function Trim(str) {
                return str.replace(/(^\s*)|(\s*$)/g, "");
              }
              res.data = JSON.parse(Trim(res.data))
              //console.log(res)
              if (res.data.message == 'success') {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
                that.getAddressList();
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
        } else if (res.cancel) {
          //console.log('用户点击取消')
        }
      }
    })
  },
  //设置当前地址为默认地址
  setDefault: function (e) {
    var that = this;
    var isDefault = e.currentTarget.dataset.default;
    if (isDefault == 1) {
      return
    }
    wx.showModal({
      title: '设置默认',
      content: '设置当前地址为默认地址？',
      success: function (res) {
        if (res.confirm) {
          var address_id = e.currentTarget.dataset.id;
          wx.request({
            url: baseUrl + '/index.php?m=default&c=flow&a=set_default_address',
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            dataType:'txt',
            data: {
              session_id: wx.getStorageSync('session_id'),
              address_id: address_id,
              shop_id: shop_id
            },
            success: function (res) {
              function Trim(str) {
                return str.replace(/(^\s*)|(\s*$)/g, "");
              }
              res.data = JSON.parse(Trim(res.data))
              //console.log(res)
              if (res.data.message == 'success') {
                // wx.showToast({
                //   title: '设置成功',
                //   icon: 'success'
                // })
                that.getAddressList();
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

        } else if (res.cancel) {
          //console.log('用户点击取消设置默认地址')
        }
      }
    })
  },
  //根据订单order_id选择当前地址为该订单的收货地址
  selectAddress:function(e){
    if (this.data.chooseAddress){
      //console.log(e)
      var address_id = e.currentTarget.dataset.id,
          order_id = this.data.order_id;
      //console.log(address_id)
      //console.log(this.data.order_id)
      wx.showModal({
        title: '确认选择？',
        content: '选择当前地址作为收货地址？',
        success:function(res){
          if(res.confirm){
            wx.request({
              url: baseUrl +'/index.php?m=default&c=flow&a=change_address_id_by_order_id',
              method: 'POST',
              header: { 'content-type': 'application/x-www-form-urlencoded' },
              dataType: 'txt',
              data: {
                session_id: wx.getStorageSync('session_id'),
                address_id: address_id,
                order_id: order_id,
                shop_id: shop_id
              },
              success: function (res) {
                //console.log(res)
                function Trim(str) {
                  return str.replace(/(^\s*)|(\s*$)/g, "");
                }
                res.data = JSON.parse(Trim(res.data))
                //console.log(res.data)
                if(res.data.message =='success' && res.data.error == 0){
                  wx.navigateBack({
                    delta: 1
                  })
                } else if (res.data.error == 1){
                  wx.showToast({
                    title: '出现错误请重试',
                    icon:'none'
                  })
                // }else{
                //   wx.showToast({
                //     title: '出现错误，请重试',
                //     icon: 'none'
                //   })
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
          } else if (res.cancel) {
            //console.log('用户点击取消')
          }
        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	  getApp().parseInviter(options);
    if (options.order_id){
      this.setData({
        chooseAddress:true,
        order_id: options.order_id
      })
    }
    //console.log(options)
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
    //console.log('show')
    this.getAddressList();

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
      title: '好Shopping，都是对美的一试钟情',
      path: '/pages/New/index'
    }
  }
})