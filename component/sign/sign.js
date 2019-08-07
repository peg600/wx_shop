// component/sign/sign.js
let app = getApp();
let baseUrl = app.globalData.baseHttpUrl;

Component({
  /** 
   * 组件的属性列表
   */
  properties: {
    show: {     //显示本组件
      type: Boolean,
      value: false
    },    
    everyday_bonus: {   //每日领取的分数
      type: Number,
      value: 100
    },
    serial_bonus: {   //连续签到各档位奖励
      type: String,
      value: ""
    },
    photo_score: {
      type: Number,
      value: 0,
      observer: 'showSign'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    show_sign: false,   //显示签到弹窗
    credit: 0,
    serial_days: 0,
    has_signed: false,

    serial_bonus_set: [], 
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //判断今天是否已签过到，控制是否显示
    _isSignedToday() {
      let that = this;
      wx.request({
        url: `${baseUrl}/index.php?m=default&c=flow&a=get_sign_info_by_user_id`,
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
          if(res.has_signed == "0") {
            that.setData({
              show: true
            })
          }else{
            that.setData({
              has_signed: true
            })
            let myEventDetail = { has_signed: that.data.has_signed };
            that.triggerEvent('refreshHasSigned', myEventDetail);
          }
          if(res.data) {
            that.setData({
              serial_days: res.data.serial_days
            })
          }
        }
      });
    },

    _getScore() {
      let that = this;
      wx.request({
        url: `${baseUrl}/index.php?m=default&c=flow&a=get_credit_by_user_id`,
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
          if(res) {
            that.setData({
              credit: res.credit
            })
            let myEventDetail = { credit: res.credit};
            that.triggerEvent('refreshCredit', myEventDetail);
          }
        }
      });
    },

    takePhoto() {
      wx.reLaunch({
        url: '/pages/faceTest/choosePhoto/choosePhoto?from=sign',
      })
    },

    hide() {
      this.setData({
        show: false
      })
    },

    //签到并显示签到结果
    showSign(newValue) {
      let that = this;
      if (!newValue) {
        return
      }
      wx.request({
        url: `${baseUrl}/index.php?m=default&c=flow&a=user_sign`,
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
          if(res.error == "0") {
            that.setData({
              serial_days: res.data.serial_days,
              show_sign: true,
              has_signed: true
            })
            let myEventDetail = { has_signed: that.data.has_signed };
            that.triggerEvent('refreshHasSigned', myEventDetail);
          }
        }
      });
    },

    addSignCredit() {
      let that = this;
      wx.request({
        url: `${baseUrl}/index.php?m=default&c=flow&a=add_user_credit`,
        method: 'POST',
        dataType: 'txt',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
          session_id: wx.getStorageSync('session_id'),
          credit_type: 1,
          credit: parseInt(that.data.everyday_bonus * that.data.photo_score/100) 
        },
        success: function (res) {
          function Trim(str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
          }
          res = JSON.parse(Trim(res.data));
          //console.log(res)
          that.setData({
            credit: res.credit,
            show_sign: false
          })
          let myEventDetail = { credit: res.credit };
          that.triggerEvent('refreshCredit', myEventDetail);
        }
      });
    },

    getBonus(e) {
      let that = this;
      let set_info = e.currentTarget.dataset.set_info;
      let index = e.currentTarget.dataset.set_index;

      wx.request({
        url: `${baseUrl}/index.php?m=default&c=flow&a=add_user_credit`,
        method: 'POST',
        dataType: 'txt',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
          session_id: wx.getStorageSync('session_id'),
          credit_type: set_info.id,
          credit: set_info.bonus
        },
        success: function (res) {
          function Trim(str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
          }
          res = JSON.parse(Trim(res.data));
          //console.log(res)
          let serial_bonus_set = that.data.serial_bonus_set;
          serial_bonus_set[index].has = false;

          that.setData({
            serial_bonus_set: serial_bonus_set,
            credit: res.credit
          })
          let myEventDetail = { credit: res.credit };
          that.triggerEvent('refreshCredit', myEventDetail);
          
          wx.showToast({
            title: `领取到${set_info.bonus}笑脸`,
            icon: 'none',
            duration: 2000
          })
        }
      });
    },

    hasBonus(one_serial_bonus) {
      let that = this;
      let id = one_serial_bonus.id
      wx.request({
        url: `${baseUrl}/index.php?m=default&c=flow&a=has_bonus`,
        method: 'POST',
        dataType: 'txt',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
          session_id: wx.getStorageSync('session_id'),
          credit_type: id
        },
        success: function (res) {
          function Trim(str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
          }
          res = JSON.parse(Trim(res.data));
          //console.log(res)
          if(res.error == "0") {
            one_serial_bonus.has = true;
          }else{
            one_serial_bonus.has = false;
          }
        }
      });
    },
  },

  attached: function () {
    let that = this;
    if (this.data.serial_bonus) {
      let serial_bonus = this.data.serial_bonus;
      serial_bonus = JSON.parse(serial_bonus)
      for (let i = 0; i < serial_bonus.length; i++) {
        wx.request({
          url: `${baseUrl}/index.php?m=default&c=flow&a=has_bonus`,
          method: 'POST',
          dataType: 'txt',
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          data: {
            session_id: wx.getStorageSync('session_id'),
            credit_type: serial_bonus[i].id
          },
          success: function (res) {
            function Trim(str) {
              return str.replace(/(^\s*)|(\s*$)/g, "");
            }
            res = JSON.parse(Trim(res.data));
            //console.log(res)
            if (res.error == "0") {
              serial_bonus[i].has = true;
            } else {
              serial_bonus[i].has = false;
            }
            that.setData({
              serial_bonus_set: serial_bonus
            })
          }
        });
        // wx.getStorage({
        //   key: `holo_sign_bonus${serial_bonus[i].id}`,
        //   success: function(res) {
        //     serial_bonus[i].has = true
        //   },
        //   fail: function(res) {
        //     serial_bonus[i].has = false
        //   },
        //   complete: function() {
        //     that.setData({
        //       serial_bonus_set: serial_bonus
        //     })
        //   }
        // })
      }
    }

    this._isSignedToday();
    this._getScore();
  },

 
})
