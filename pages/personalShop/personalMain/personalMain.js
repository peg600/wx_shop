// pages/personalShop/personalMain/personalMain.js
const app = getApp()
var baseUrl = app.globalData.baseHttpUrl;
var htmlUrl = app.globalData.htmlUrl;
const shop_id = app.globalData.shop_id;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: {},
    goods_list: {},
    is_master: false,
    user_id: "",
    current_goods: {},
    show_edit: false,
    current_goods_info: "",

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      current_user_id: app.globalData.current_user_id
    })
    if(options.user_id) {
      this.setData({
        user_id: options.user_id
      })
      if(app.globalData.current_user_id == options.user_id) {
        this.setData({
          is_master: true
        })
      }
    }else{
      this.setData({
        user_id: app.globalData.current_user_id
      })
    }

    String.prototype.getlength = function () {
      return this.replace(/[\u0391-\uFFE5]/g, "aa").length;
    }


    let that = this;

    wx.request({
      url: baseUrl + '/index.php?m=default&c=shop&a=get_personal_shop_and_user_info_by_user_id',
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        user_id: that.data.user_id,
        shop_id: shop_id
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        console.log(res)
        that.setData({
          has_shop: res.has_shop,
          info: res.info[0]
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

    that.getGoodsInfo();
  },

  getGoodsInfo() {
    let that = this;
    wx.request({
      url: baseUrl + '/index.php?m=default&c=shop&a=get_personal_goods_and_info_by_user_id',
      method: 'POST',
      dataType: 'txt',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        user_id: that.data.user_id,
        shop_id: shop_id
      },
      success: function (res) {
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res = JSON.parse(Trim(res.data));
        console.log(res)
        for (let i = 0; i < res.length; i++) {
          if (res[i].goods_img && res[i].goods_img !== "") {
            res[i].goods_img = `${baseUrl}/${res[i].goods_img}`;
          }
          if (res[i].goods_thumb && res[i].goods_thumb !== "") {
            res[i].goods_thumb = `${baseUrl}/${res[i].goods_thumb}`;
          }
          if (res[i].original_img && res[i].original_img !== "") {
            res[i].original_img = `${baseUrl}/${res[i].original_img}`;
          }
        }
        that.setData({
          goods_list: res
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

  toDetail(e) {
    let goods_id = "";
    if (e.currentTarget.dataset.goods_id) {
      goods_id = e.currentTarget.dataset.goods_id;
    }
    wx.navigateTo({
      url: `/pages/detailPage/detailPage?goods_id=${goods_id}`,
    })
  },

  showEdit(e) {
    if (e.currentTarget.dataset.current_goods) {
      this.setData({
        current_goods: e.currentTarget.dataset.current_goods,
        current_goods_info: e.currentTarget.dataset.current_goods.personal_goods_brief,
        show_edit: true
      })
    }
  },

  shareGoods(e) {
    if (e.currentTarget.dataset.goods_id) {
      let goods_id = e.currentTarget.dataset.goods_id;
      wx.navigateTo({
        url: `/pages/personalShop/personalShare/personalShare?inviter=${this.data.info.user_id}&master_id=${this.data.info.user_id}&goods_id=${goods_id}`
      })
    }
  },

  prevent() {
    
  },
  
  hideEdit() {
    this.setData({
      show_edit: false
    })
  },

  changeInfo(e) {
    this.setData({
      current_goods_info: e.detail.value
    })
  },

  submitInfo() {
    let that = this;
    if (that.data.current_goods_info.getlength() > 255) {
      wx.showToast({
        title: '超过长度限制，请重新输入',
        icon: 'none',
        duration: 2000
      })
    } else {
      wx.request({
        url: baseUrl + '/index.php?m=default&c=shop&a=change_personal_goods_brief',
        method: 'POST',
        dataType: 'txt',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
          user_id: app.globalData.current_user_id,
          goods_id: that.data.current_goods.goods_id,
          goods_brief: that.data.current_goods_info
        },
        success: function (res) {
          function Trim(str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
          }
          res = JSON.parse(Trim(res.data));
          console.log(res)
          if (res) {
            that.getGoodsInfo();
            that.setData({
              show_edit: false
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
    }

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

  }
})