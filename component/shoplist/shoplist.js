// component/goodlist/goodlist.js
const app = getApp();
var baseUrl = app.globalData.baseHttpUrl;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    shops: {
      type: Int16Array,
      value: [],
    },
    mode:{
      type:Number,
      value: 0, //0:指定Shops参数，1:自动获取 2:LBS
    },
    limit:
    {
      type:Number,
      value: 0,//当mode为1时，指定自动获取数据的记录数. 0为全部
    },
    params:
    {
      type:String,
      value:'' //自动获取时，过滤参数
    },
    listStyle: {
      type: Number,
      value: 1, //0: 大图 1：小图 2：一大两小 4:一行三个 3:详细列表 5:横向滑动 
    },
    imageStyle: {
      type: Number,
      value: 0, //0:填充 1:留白
    },
    imageRatio: {
      type: Number,
      value: 1
    },
    itemStyle: {
      type: Number,
      value: 0, // 0:卡片1 1:卡片2 3：极简模式
    },
    itemShopName: {
      type: Number,
      value: 1, //0：隐藏，1：显示
    },
    itemShopDesc: {
      type: Number,
      value: 0, //0：隐藏, 1:显示
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    selectGood: '',
    new_data: [],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _toDetailListPage: function(e) {
      var user_id = e.currentTarget.dataset.userid;
      wx.navigateTo({
        url: "/pages/personalShop/personalShop?user_id=" + user_id,
        success: function(res) {},
        fail: function(res) {
          //console.log(res);
        },
        complete: function(res) {},
      })
    },
  },

  attached: function() {
    var that = this;
    switch(this.data.mode)
    {
      case 0:
      {
          var ids = this.data.shops;
          wx.request({
            url: baseUrl + '/?c=shop&a=getPersonalShopInfo&ids=' + ids,
            method: "POST",
            dataType: 'txt',
            success: res => {
              function Trim(str) {
                return str.replace(/(^\s*)|(\s*$)/g, "");
              }
              res.data = JSON.parse(Trim(res.data));
              that.data.new_data = (res.data);
              that.setData({
                new_data: that.data.new_data
              })
            }
          });
      } 
      break;
      case 1:
      {
        var param = this.data.params;
        var limit = this.data.limit;
          wx.request({
            url: baseUrl + '/?c=shop&a=getPersonalShops',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            method: "POST",
            dataType: 'txt',
            data:{
              shop_id:53,
              param: param,
              limit: limit
            },
            success: res => {
              function Trim(str) {
                return str.replace(/(^\s*)|(\s*$)/g, "");
              }
              res.data = JSON.parse(Trim(res.data));
              that.data.new_data = (res.data);
              that.setData({
                new_data: that.data.new_data
              })
            }
          });
      }
      break;
      case 2:
      {
        wx.getLocation({
          success: function(res) {
            var limit = that.data.limit;
            wx.request({
              url: baseUrl + '/?c=shop&a=getNearPersonalShops',
              header: { 'content-type': 'application/x-www-form-urlencoded' },
              method: "POST",
              dataType: 'txt',
              data: {
                shop_id: 53,
                limit: limit,
                lat: res.latitude,
                lon: res.longitude
              },
              success: res => {
                function Trim(str) {
                  return str.replace(/(^\s*)|(\s*$)/g, "");
                }
                res.data = JSON.parse(Trim(res.data));
                that.data.new_data = (res.data);
                that.setData({
                  new_data: that.data.new_data
                })
              }
            });
          },
        })
      }
      break;
    }
  },

  ready: function() {},

  detached: function() {

  },
})