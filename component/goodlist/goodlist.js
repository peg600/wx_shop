// component/goodlist/goodlist.js
const app = getApp();
var baseUrl = app.globalData.baseHttpUrl;
var dataUrl = app.globalData.dataUrl;
let Utils = require("../../lib/Utils.js")
let md5 = require("../../lib/md5.js")

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goods: { //不输入则默认为全部商品
      type: String, //goods_id用逗号分隔，排序根据输入顺序
      value: "", //all：所有商品，按页排序
    }, //hot或promote或new_user：热销或促销或新人优惠，排序根据order设定
    page_number: { //每页显示的商品个数，goods不为“all”时有效
      type: Number,
      value: 20
    },
    //相应操作风格
    actionStyle: {
      type: Number,
      value: 0 //0，显示 1：搜索
    },
    //搜索关键字
    keywords: {
      type: String,
      value: ""
    },
    background: {
      type: String,
      value: "white",
    },
    limit_number: { //最多取商品个数，goods不为“all”和goods_id时有效
      type: Number,
      value: 0
    },
    order: { //指定排序方式，new从新到旧，low_price价格从低到高,high_price从高到低
      type: String,
      value: ""
    },
    cat_id: { //指定品类，goods不为“all”和goods_id时有效
      type: String,
      value: "",
      observer: "changeCat"
    },
    pull_down_refresh: { //是否开启下拉刷新
      type: Boolean,
      value: false
    },
    margin: {
      type: Number,
      value: 0,
    },
    listStyle: {
      type: Number,
      value: 1, //0: 大图 1：小图 2：一大两小 3:一行三个 4:详细列表 5:横向滑动 
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
    itemGoodsName: {
      type: Number,
      value: 1, //0：隐藏，1：显示
    },
    itemGoodsDesc: {
      type: Number,
      value: 0, //0：隐藏, 1:显示
    },
    itemGoodPrice: {
      type: Number,
      value: 1, //0:隐藏，1：显示 2:显示幸运星价格
    },
    itemBuyStyle: {
      type: Number,
      value: 0 //0: 隐藏 1：样式1 2：样式2 3：样式3 4：样式4
    },
    promotionStyle: {
      type: Number,
      value: 1 //0:一直显示 1:有优惠时显示 2:不显示
    },
    itemCornerStyle: {
      type: Number,
      value: 0 //0:隐藏 1：新品 2：热卖 3：New 4：Hot 
    },
    dataSource: {
      type: Number,
      value: 0 //0:自由数据 1：京东
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    selectGood: '',
    new_data: [],
    pageIndex: 1,
    hasNewData: true,
    noMoreData: false,
    begin: 0, //后台提取数据的开始位置 
    score: 1.0,
    hasScore: false,
    can_use: true, //pullData锁，防止同时执行多次
    is_new: app.globalData.is_new
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _buy: function(e) {
      var id = e.currentTarget.dataset.id;
      var cat_id = e.currentTarget.dataset.catid;

      var app = getApp().globalData;
      var url = baseUrl + "/h5/fitting/b8c6da3834070b503d7d5ccad280562f.php?session_id=" + wx.getStorageSync('session_id') + "&goods_id=" + id + "&cat_id=" + cat_id + "&version=" + app.fittingVersion;
      url = encodeURIComponent(url);
      wx.navigateTo({
        url: '/pages/fitview/fitview?goods_id=' + id + '&cat_id=' + cat_id,
      })
    },

    _toDetailListPage: function(e) {
      wx.setStorage({
        key: 'goods_id',
        data: e.currentTarget.dataset.goodid,
      })
      let that = this;
      app.globalData.currentJDGood = e.currentTarget.dataset.good;
      wx.navigateTo({
        url: "/pages/detailPage/detailPage?goods_id=" + e.currentTarget.dataset.goodid + "&priceStyle=" + that.data.itemGoodPrice + "&promotionStyle=" + that.data.promotionStyle + "&dataSource=" + that.data.dataSource,
        success: function(res) {},
        fail: function(res) {},
        complete: function(res) {},
      })
    },

    onPullFinished: function(detail, option) {
      this.triggerEvent("pullFinished", detail, option);
      this.setData({
        noMoreData: false
      })
    },

    loadJDData(cat_id, pageIndex, success) {
      var strParam = '{"goodsReq":{"eliteId":' + cat_id + ',"pageIndex":' + pageIndex + '}}';
      Utils.JDAPIRequest({
        apiName: "jd.union.open.goods.jingfen.query",
        strParam: strParam,
        success: function(res) {
          if (res.jd_union_open_goods_jingfen_query_response && res.jd_union_open_goods_jingfen_query_response.result) {
            res = JSON.parse(res.jd_union_open_goods_jingfen_query_response.result);
            if (res.data && res.data.length > 0) {
              if (success)
                success(res.data);
            }
          } else if (success)
            success([]);
        },
        fail:function(res)
        {
          wx.hideLoading();
        }
      })
    },

    pullNewData: function() {
      var that = this;
      if (!this.data.hasNewData) {
        this.onPullFinished({
          hasNewData: false
        }, {});
        this.setData({
          noMoreData: true
        })
        that.loadComplete();
        return false;
      }

      this.data.can_use = false;
      var arr = this.data.goods.split(",");
      let begin = that.data.begin;
      let page_number = that.data.page_number;
      let limit_number = that.data.limit_number;
      var keyword = that.data.keywords;

      //若第一项可转为数字，则为goods_id数组
      if (parseInt(arr[0]) >= 0 && this.data.actionStyle == 0) { //若为goods_id数组
        wx.showLoading({
          title: '加载中...',
        })
        var length = arr.length;
        let len = 0;
        if (length - begin > page_number) {
          len = page_number;
        } else {
          len = length - begin
        }
        for (var i = begin; i < len; i++) {
          wx.request({
            url: baseUrl + '/?c=goods&a=index&id=' + arr[i],
            method: "POST",
            dataType: 'txt',
            success: res => {
              function Trim(str) {
                return str.replace(/(^\s*)|(\s*$)/g, "");
              }
              res.data = JSON.parse(Trim(res.data));
              res.data.load_complete = 1;
              that.data.new_data.push(res.data);
              that.setData({
                new_data: that.data.new_data
              });
              if (that.data.new_data.length == length) {
                that.data.hasNewData = false;
                begin = begin + len;
                that.setData({
                  begin: begin
                })
                wx.hideLoading();
                that.loadComplete();
              }
            }
          });
        }
      } else {
        let mode = arr[0];
        let order = "";
        let cat_id = "";
        //如果是搜索，必须设置keyword
        if (that.data.actionStyle == 1 && that.data.keywords.length == 0)
          return;

        var dealNewData = function(res) {
          if (res.length == 0) {
            that.data.hasNewData = false;
            that.setData({
              noMoreData: true
            })
            that.onPullFinished({
              hasNewData: false
            }, {});
            wx.hideLoading();
            that.loadComplete();
            return;
          } else {
            if (res.length < that.data.page_number) {
              that.data.hasNewData = false;
              that.setData({
                noMoreData: true
              })
            }
            begin = begin + page_number;
            that.setData({
              begin: begin
            })
          }
          that.data.new_data = that.data.new_data.concat(res);
          that.setData({
            new_data: that.data.new_data
          });
          that.loadComplete();
          that.onPullFinished({
            hasNewData: true
          }, {});
          wx.hideLoading();
        }

        //处理京东数据
        if (that.data.dataSource == 1) {
          if(that.data.actionStyle == 0) {
            that.loadJDData(16, that.data.pageIndex, function (res) {
              var goodlist = [];
              for (var i = 0; i < res.length; i++) {
                var goods = new Object();
                goods.isJD = true;
                goods.cat_id = res[i].categoryInfo.cid1;
                goods.goods_id = res[i].skuId;
                goods.goods_name = res[i].skuName;
                goods.owner = res[i].owner;
                goods.brandName = res[i].brandName;
                goods.cid3Name = res[i].categoryInfo.cid3Name;
                goods.shop_price = res[i].priceInfo.price;
                goods.goods_img = res[i].imageInfo.imageList[0].url;
                goods.thumb_img = res[i].imageInfo.imageList[0].url;
                goods.imageInfo = res[i].imageInfo.imageList;
                goods.materialUrl = res[i].materialUrl;
                goods.couponList = res[i].couponInfo.couponList;
                if (goods.couponList && goods.couponList.length > 1) {
                  goods.couponList = goods.couponList.sort(function(a,b) {
                    b.dicount - a.discount
                  })
                }
                goods.couponList[0].getStartTime = that.toYMD(goods.couponList[0].getStartTime);
                goods.couponList[0].getEndTime = that.toYMD(goods.couponList[0].getEndTime);
                goodlist.push(goods);

                if (res[i].couponInfo.couponList.length > 0) {
                  console.log(goods)
                }
              }
              var index = that.data.pageIndex + 1;
              that.setData({
                pageIndex: index
              });
              
              dealNewData(goodlist);
            });
          }else if(that.data.actionStyle == 1) {  //京东搜索
            let strParam = '{"pageParam":{"pageNum":' + that.data.pageIndex + ',"pageSize":20},"queryParam":{"keywords":"' + that.data.keywords + '"},"orderField":0}';
            Utils.JDAPIRequest({
              apiName: "jd.kepler.xuanpin.search.sku",
              strParam: strParam,
              access_token: "5477853e17694b40ad52759d2afe0cfd8",
              success: function (res) {
                let list = res.jd_kepler_xuanpin_search_sku_response.skuList.list
                
                let count = 0;
                let need_count = list.length; //个别商品获取失败也能正常显示其他商品
                let goodlist = [];
                for(let i=0;i<list.length;i++) {
                  let sku_id = list[i].id;
                  let strParam = '{"sku":' + sku_id +'}';

                  let count2 = 0;
                  let goods = new Object();
                  //根据商品sku获取基本信息
                  Utils.JDAPIRequest({
                    apiName: "public.product.base.query",
                    strParam: strParam,
                    access_token: "5477853e17694b40ad52759d2afe0cfd8",
                    success: function (res) {
                      if (res.public_product_base_query_response.code == 0) {
                        let good_info = res.public_product_base_query_response.result;
                        //console.log(good_info)
                        
                        goods.isJD = true;
                        goods.cat_id = good_info.category;
                        goods.goods_id = sku_id;
                        goods.brandName = good_info.brandName;
                        var categoryName = good_info.categoryName;
                        var lIndex = categoryName.lastIndexOf(";");
                        if(lIndex > 0)
                        categoryName = categoryName.substr(lIndex + 1);
                        goods.cid3Name = categoryName;
                        goods.goods_name = good_info.name;
                        goods.owner = good_info.owner;
                        goods.shop_price = good_info.price;
                        goods.goods_img = "http://img14.360buyimg.com/ads/" + good_info.img;
                        goods.thumb_img = "http://img14.360buyimg.com/ads/" + good_info.img;
                        goods.imageInfo = [];
                        for (let j = 1; j < good_info.images.length;j++) {
                          let temp = {};
                          temp.url = "http://img14.360buyimg.com/ads/" + good_info.images[j];
                          goods.imageInfo.push(temp)
                        }
                        goods.materialUrl = `item.jd.com/${sku_id}.html`;
                        count2++;
                        if (count2 == 2) {
                          count++;
                          goodlist.push(goods)
                        }
                      }else{
                        need_count --;
                      }
                      if (count == need_count) {
                        var index = that.data.pageIndex + 1;
                        that.setData({
                          pageIndex: index
                        });
                        dealNewData(goodlist);
                      }
                    },
                    fail: function() {
                      need_count--;
                      if (count == need_count) {
                        var index = that.data.pageIndex + 1;
                        that.setData({
                          pageIndex: index
                        });
                        dealNewData(goodlist);
                      }
                    }
                  })

                  //根据商品sku获取优惠券
                  Utils.JDAPIRequest({
                    apiName: "jd.kpl.open.item.findjoinactives",
                    strParam: strParam,
                    access_token: "5477853e17694b40ad52759d2afe0cfd8",
                    version: "2.0",
                    success: function (res) {
                      if (res.jd_kpl_open_item_findjoinactives_response.coupons) {
                        let coupons = res.jd_kpl_open_item_findjoinactives_response.coupons;

                        for(let k=0;k<coupons.length;k++) {
                          coupons[k].link = coupons[k].mUrl.split(",")[0];
                        }
                        goods.couponList = coupons;

                        if(coupons.length > 0) {
                          console.log(goods)
                        }

                        count2++;
                        if (count2 == 2) {
                          count++;
                          goodlist.push(goods)
                        }
                      } else {
                        need_count--;
                      }
                      if (count == need_count) {
                        var index = that.data.pageIndex + 1;
                        that.setData({
                          pageIndex: index
                        });
                        dealNewData(goodlist);
                      }
                    },
                    fail: function () {
                      need_count--;
                      if (count == need_count) {
                        var index = that.data.pageIndex + 1;
                        that.setData({
                          pageIndex: index
                        });
                        dealNewData(goodlist);
                      }
                    }
                  })
                }
              }
            })
          }
          
          return this.data.hasNewData;
        }

        if (limit_number) { //若设置了最大个数
          if (limit_number <= begin) {
            that.data.hasNewData = false;
            that.setData({
              noMoreData: true
            })
            that.onPullFinished({
              hasNewData: false
            }, {});
            that.loadComplete();
            return;
          }
          if (limit_number - begin < page_number) {
            page_number = limit_number - begin
          }
        }
        if (that.data.order) {
          order = that.data.order;
        }
        if (that.data.cat_id) {
          cat_id = that.data.cat_id
        }
        Utils.request({
          url: baseUrl + '/?c=category&a=load_goods_by_filter',
          data: {
            mode: mode,
            begin: begin,
            page_number: page_number,
            order: order,
            keyword: keyword,
            cat_id: cat_id
          },
          success: res => {

            function Trim(str) {
              return str.replace(/(^\s*)|(\s*$)/g, "");
            }
            res = JSON.parse(Trim(res.data));
            //console.log(res)
            for (let i = 0; i < res.length; i++) {
              res[i].load_complete = 1;
              var reg = new RegExp(/http/); // 匹配目标参数
              if (!reg.test(res[i].goods_img)) {
                res[i].goods_img = `${dataUrl}/${res[i].goods_img}`;
              }
              if (!reg.test(res[i].goods_thumb)) {
                res[i].goods_thumb = `${dataUrl}/${res[i].goods_thumb}`;
              }
            }

            dealNewData(res);
          },
          fail: res => {
            that.loadComplete();
            wx.hideLoading();
            wx.showToast({
              title: ' 请求失败，请检查网络重试',
            });
            that.onPullFinished({
              hasNewData: true
            }, {});
          }
        });
      }
      return this.data.hasNewData;
    },

    reset: function() {
      this.setData({
        selectGood: '',
        new_data: [],
        pageIndex: 1,
        hasNewData: true,
        noMoreData: false,
        begin: 0, //后台提取数据的开始位置 
        score: 1.0,
        hasScore: false,
        can_use: true //pullData锁，防止同时执行多次
      })
    },

    //搜索
    search: function(keyword) {
      if (keyword == this.data.keywords)
        return;
      this.reset();
      this.goods = "";
      this.data.keywords = keyword;
      this.data.pageIndex = 1;
      this.data.begin = 0;
      this.pullNewData();
    },

    searchJd(keyword) {
      if (keyword == this.data.keywords)
        return;
      let that = this;
      this.reset();
      this.goods = "";
      this.data.keywords = keyword;
      this.data.pageIndex = 1;

      
    },

    changeCat() {
      this.setData({
        begin: 0,
        new_data: [],
        hasNewData: true
      })
      this.pullNewData();
    },

    loadComplete() {
      this.data.can_use = true;
      this.triggerEvent("complete", {}, {
        bubbles: true,
        composed: true
      })
      this.setData({
        is_new: app.globalData.is_new
      })
    },

    onReachBottom() {
      if (this.data.pull_down_refresh && this.data.can_use) {
        this.pullNewData();
      }
    },

    updateScore() {
      let face = app.globalData.score;

      if (face) {
        if (this.data.promotionStyle <= 1) {
          var score = (face.attributes.beauty.value) * 0.01;
          if (score != this.data.score) {
            this.setData({
              hasScore: true,
              score: score
            })
          }
        }
      }
    },

    toJd(e) {
      var goods_info = e.currentTarget.dataset.goods_info;
      let goods_name = goods_info.goods_name;
      wx.navigateTo({
        url: `/pages/search/search?searchInput=${goods_name}`,
      })
    },

    //传入毫秒数返回年月日时间
    toYMD(time) {
      if(!Date.prototype.format) {
        Date.prototype.format = function (format) {
          var o = {
            "M+": this.getMonth() + 1, //month
            "d+": this.getDate(),    //day
            "h+": this.getHours(),   //hour
            "m+": this.getMinutes(), //minute
            "s+": this.getSeconds(), //second
            "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
            "S": this.getMilliseconds() //millisecond
          }
          if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
            (this.getFullYear() + "").substr(4 - RegExp.$1.length));
          for (var k in o) if (new RegExp("(" + k + ")").test(format))
            format = format.replace(RegExp.$1,
              RegExp.$1.length == 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
          return format;
        }
      }
      time = new Date(time);
      return time.format("yyyy-MM-dd");
    },
  },

  attached: function() {
    this.updateScore();
    this.pullNewData();
  },

  ready: function() {
    //console.log(this.data.goodName);
  },

  detached: function() {
    //console.log(this.data.goodName);
  },

  //页面生命周期
  pageLifetimes: {
    show() {
      // 页面被展示
      this.updateScore();
    },
  }
})