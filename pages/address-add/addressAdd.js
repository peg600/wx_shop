var commonCityData = require('../../utils/city.js')
var app = getApp();
var baseUrl = app.globalData.baseHttpUrl;
const shop_id = app.globalData.shop_id;
//获取应用实例
var app = getApp()
Page({
  data: {
    address_id :0,
    addressData:{},
    provinces: [],
    citys: [],
    districts: [],
    selProvince: '请选择',
    selCity: '请选择',
    selDistrict: '请选择',
    selProvinceIndex: 0,
    selCityIndex: 0,
    selDistrictIndex: 0,
    canSave:true
  },
  //验证电话号
  isPoneAvailable: function (pone) {
    var myreg = /^[1][3,4,5,7,8,6][0-9]{9}$/;
    if (!myreg.test(pone)) {
      return false;
    } else {
      return true;
    }
  },
  //验证邮编
  isPostcode: function (str) {
    var reg = /^[1-9]\d{5}$/g;
    // var reg = /^[1-9]\d{5}(?!\d)$/;
    if (reg.test(str)) {
      return true;
    } else {
      return false;
    }
  },
  bindCancel: function () {
    wx.navigateBack({})
  },
  bindSave: function (e) { 
    // ////console.log(e)
    // return
    if(this.data.canSave) {
      var that = this;
      var linkMan = e.detail.value.linkMan;
      var address = e.detail.value.address;
      var mobile = e.detail.value.mobile;
      var code = e.detail.value.code;

      if (linkMan == "") {
        wx.showToast({
          title: '请填写联系人姓名',
          icon: 'none'
        })
        return
      }
      if (mobile == "" || !this.isPoneAvailable(mobile)) {
        wx.showToast({
          title: '手机号码有误',
          icon: 'none'
        })
        return
      }
      if (this.data.selProvince == "请选择") {
        wx.showToast({
          title: '请选择地区',
          icon: 'none'
        })
        return
      }
      if (this.data.selCity == "请选择") {
        wx.showToast({
          title: '请选择地区',
          icon: 'none'
        })
        return
      }
      var cityId = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].id;
      var districtId;
      if (this.data.selDistrict == "请选择" || !this.data.selDistrict) {
        districtId = '';
      } else {
        districtId = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[this.data.selDistrictIndex].id;
      }
      ////console.log(districtId)
      if (address == "") {
        wx.showToast({
          title: '请填写详细地址',
          icon: 'none'
        })
        return
      }
      this.setData({
        canSave: false
      })
      ////console.log(wx.getStorageSync('session_id'))
      wx.showLoading({
        title: '请稍候',
      })
      if (this.data.address_id != 0) {
        wx.request({
          url: baseUrl + '/index.php?m=default&c=flow&a=updata_address_by_id',
          method: 'POST',
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          dataType: 'txt',
          data: {
            session_id: wx.getStorageSync('session_id'),
            provinceId: commonCityData.cityData[this.data.selProvinceIndex].id,
            province_name: this.data.selProvince,
            city_name: this.data.selCity,
            district_name: this.data.selDistrict,
            cityId: cityId,
            district_id: districtId,
            linkMan: linkMan,
            address: address,
            mobile: mobile,
            code: code,
            address_id: this.data.address_id,
            shop_id: shop_id
          },
          success: function (res) {
            ////console.log(res)
            function Trim(str) {
              return str.replace(/(^\s*)|(\s*$)/g, "");
            }
            res.data = JSON.parse(Trim(res.data))
            ////console.log(res)
            if (res.data.error == 0) {
              wx.showToast({
                title: '保存成功',
                icon: 'success',
                duration: 1000
              })
              setTimeout(function () {
                that.setData({
                  canSave: true
                })
                wx.navigateBack({
                  delta: 1
                })
              }, 1000)

            }
          },
          fail: function (err) {
            ////console.log(err)
            wx.showToast({
              title: '请求失败，请检查网络重试',
              icon: 'none',
              duration: 2000
            })
            that.setData({
              canSave: true
            })
          },
          complete: function () {
            wx.hideLoading();
          }
        })
      } else {
        wx.request({
          url: baseUrl + '/index.php?m=default&c=flow&a=add_address',
          method: 'POST',
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          dataType: 'txt',
          data: {
            session_id: wx.getStorageSync('session_id'),
            provinceId: commonCityData.cityData[this.data.selProvinceIndex].id,
            province_name: this.data.selProvince,
            city_name: this.data.selCity,
            district_name: this.data.selDistrict,
            cityId: cityId,
            district_id: districtId,
            linkMan: linkMan,
            address: address,
            mobile: mobile,
            code: code,
            shop_id: shop_id
            //  selProvince: '请选择',
            // selCity: '请选择',
            // selDistrict: '请选择',
          },
          success: function (res) {
            // ////console.log(res)
            // return 
            function Trim(str) {
              return str.replace(/(^\s*)|(\s*$)/g, "");
            }
            res.data = JSON.parse(Trim(res.data))
            ////console.log(res)
            if (res.data.error == 0) {
              wx.showToast({
                title: '保存成功',
                icon: 'success',
                duration: 1000
              })
              setTimeout(function () {
                that.setData({
                  canSave: true
                })
                wx.navigateBack({
                  delta: 1
                })
              }, 1000)

              // 登录错误 
              // wx.hideLoading();
              // wx.showModal({
              //   title: '失败',
              //   // content: res.data.msg,
              //   showCancel: false
              // })
              // return;
            }
            // 跳转到结算页面

          },
          fail: function (err) {
            ////console.log(err)
            wx.showToast({
              title: '请求失败，请检查网络重试',
              icon: 'none',
              duration: 2000
            })
            that.setData({
              canSave: true
            })
          },
          complete: function () {
            wx.hideLoading();
          }
        })
      }
    }
  },
  initCityData: function (level, obj) {
    if (level == 1) {
      var pinkArray = [];
      for (var i = 0; i < commonCityData.cityData.length; i++) {
        pinkArray.push(commonCityData.cityData[i].name);
      }
      //console.log(pinkArray)
      this.setData({
        provinces: pinkArray
      });
    } else if (level == 2) {
      var pinkArray = [];
      var dataArray = obj.cityList
      for (var i = 0; i < dataArray.length; i++) {
        pinkArray.push(dataArray[i].name);
      }
      ////console.log(pinkArray)
      this.setData({
        citys: pinkArray
      });
    } else if (level == 3) {
      var pinkArray = [];
      var dataArray = obj.districtList
      for (var i = 0; i < dataArray.length; i++) {
        pinkArray.push(dataArray[i].name);
      }
      ////console.log(pinkArray)
      this.setData({
        districts: pinkArray
      });
    }

  },
  bindPickerProvinceChange: function (event) {
    ////console.log(event);
    var selIterm = commonCityData.cityData[event.detail.value];
    this.setData({
      selProvince: selIterm.name,
      selProvinceIndex: event.detail.value,
      selCity: '请选择',
      selCityIndex: 0,
      selDistrict: '请选择',
      selDistrictIndex: 0
    })
    this.initCityData(2, selIterm)
  },
  bindPickerCityChange: function (event) {
    ////console.log(event)
    var selIterm = commonCityData.cityData[this.data.selProvinceIndex].cityList[event.detail.value];
    this.setData({
      selCity: selIterm.name,
      selCityIndex: event.detail.value,
      selDistrict: '请选择',
      selDistrictIndex: 0
    })
    this.initCityData(3, selIterm)
  },
  bindPickerChange: function (event) {
    ////console.log(event)
    var selIterm = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[event.detail.value];
    if (selIterm && selIterm.name && event.detail.value) {
      this.setData({
        selDistrict: selIterm.name,
        selDistrictIndex: event.detail.value
      })
    }
  },
  onLoad: function (e) {
    this.setData({
      navbar_height: app.globalData.height
    })
   getApp().parseInviter(e);

    ////console.log(e)
    this.initCityData(1);
    if (e.address_id){
      wx.showLoading({
        title: '请稍候',
        mask:true
      })
    var that = this, address_id = e.address_id;
    this.setData({
      address_id: address_id
    })
    wx.request({
      url: baseUrl + '/index.php?m=default&c=flow&a=get_address_by_adress_id',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      dataType: 'txt',
      data: {
        session_id: wx.getStorageSync('session_id'),
        address_id: address_id,
        shop_id: shop_id
      },
      success: function (res) {
        ////console.log(res)
        function Trim(str) {
          return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        res.data = JSON.parse(Trim(res.data))
          ////console.log(res.data)
          var dataAdd = {};
          dataAdd.provinceId = res.data.address.province;
          dataAdd.cityId = res.data.address.city;
          dataAdd.districtId = res.data.address.district;
          that.setDBSaveAddressId(dataAdd)
          var addressInfo ={};
          addressInfo.linkMan = res.data.address.consignee;
          addressInfo.mobile = res.data.address.mobile;
          addressInfo.address = res.data.address.address;
          addressInfo.code = res.data.address.zipcode;

        that.setData({
          addressData: addressInfo
        })
        // selProvince: '请选择',
        // selCity: '请选择',
        // selDistrict: '请选择',
        // selProvinceIndex: 0,
        // selCityIndex: 0,
        // selDistrictIndex: 0
      },
      fail: function (err) {
        ////console.log(err)
        wx.showToast({
          title: '请求失败，请检查网络重试',
          icon: 'none',
          duration: 2000
        })
      },
      complete: function () {
        wx.hideLoading();
      }
    })
  }    
    // var that = this;
    // this.initCityData(1);
    // var id = e.id;
    // if (id) {
    //   // 初始化原数据
    //   wx.showLoading();
    //   wx.request({
    //     url: app.globalData.baseUrl + '/user/shipping-address/detail',
    //     data: {
    //       token: app.globalData.token,
    //       id: id
    //     },
    //     success: function (res) {
    //       wx.hideLoading();
    //       if (res.data.code == 0) {
    //         that.setData({
    //           id: id,
    //           addressData: res.data.data,
    //           selProvince: res.data.data.provinceStr,
    //           selCity: res.data.data.cityStr,
    //           selDistrict: res.data.data.areaStr
    //         });
    //         that.setDBSaveAddressId(res.data.data);
    //         return;
    //       } else {
    //         wx.showModal({
    //           title: '提示',
    //           content: '无法获取快递地址数据',
    //           showCancel: false
    //         })
    //       }
    //     }
    //   })
    // }
  },
  setDBSaveAddressId: function (data) {
    var retSelIdx = 0;
    for (var i = 0; i < commonCityData.cityData.length; i++) {
      if (data.provinceId == commonCityData.cityData[i].id) {
        this.setData({ selProvinceIndex: i, selProvince: commonCityData.cityData[i].name})
        for (var j = 0; j < commonCityData.cityData[i].cityList.length; j++) {
          if (data.cityId == commonCityData.cityData[i].cityList[j].id) {
            this.setData({ selCityIndex: j, selCity: commonCityData.cityData[i].cityList[j].name})
            this.initCityData(2, commonCityData.cityData[i])
            for (var k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {
              if (data.districtId == commonCityData.cityData[i].cityList[j].districtList[k].id) {
               
                this.setData({ selDistrictIndex: k, selDistrict: commonCityData.cityData[i].cityList[j].districtList[k].name})
                this.initCityData(3, commonCityData.cityData[i].cityList[j])
              }
            }
          }
        }
      }
    }
  },
  selectCity: function () {

  },
  deleteAddress: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要删除该收货地址吗？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.baseUrl + '/user/shipping-address/delete',
            data: {
              token: app.globalData.token,
              id: id,
              shop_id: shop_id
            },
            success: (res) => {
              wx.navigateBack({})
            }
          })
        } else if (res.cancel) {
          ////console.log('用户点击取消')
        }
      }
    })
  }
})
