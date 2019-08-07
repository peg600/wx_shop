// component/goodprice/goodprice.js
const app = getApp();
var baseUrl = app.globalData.baseHttpUrl;
let Utils = require("../../lib/Utils.js")

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goods_info: {
      type: Object,
      value: {},
      observer: "getGoodPrice"
    },
    price_class: {    //价格的class
      type: String,
      value: "default-price"
    },
    market_price_class: {   //市场价的class,默认不显示
      type: String,
      value: "default-market-price"
    },
    price_type: {    //显示价格(1)或星星(2)
      type: Number,
      value: 1
    },
    show_style: {   //商品价格和市场价的显示方式
      type: Number,
      value: 1    //折行显示(1),同行显示(2)
    },
    new_user_tip: {   //显示新人价格图标，显示(1),不显示(0)
      type: Number,
      value: 1
    }
  },

  options: {
    addGlobalClass: true,
    multipleSlots: true  // 在组件定义时的选项中启用多slot支持
  },

  /**
   * 组件的初始数据
   */
  data: {
    is_new: app.globalData.is_new,
    price: "",
    score: 0,
    hasScore: false,
    has_new_user_price: false
  },

  attached: function () {
    this.getGoodPrice();
  },

  //页面生命周期
  pageLifetimes: {
    show() {
      // 页面被展示
      this.updateScore();
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getGoodPrice() {
      if (!this.data.goods_info.load_complete) {
        return
      }
      let that = this;
      let goods_info = this.data.goods_info;
      //console.log(goods_info)
      let is_new = app.globalData.is_new;
      this.updateScore();

      //商品基础价格
      let base_price = goods_info.shop_price;
      let min_price = 0;
      let max_price = 0;
      if (is_new && goods_info.max_new_user_price > 0) {
        this.setData({
          has_new_user_price: true
        })
        if (goods_info.max_new_user_price == goods_info.min_new_user_price) {
          base_price = goods_info.max_new_user_price
        }else{
          min_price = goods_info.min_new_user_price;
          max_price = goods_info.max_new_user_price;
        }
      } else if (is_new && goods_info.new_user_price > 0) {
        this.setData({
          has_new_user_price: true
        })
        base_price = goods_info.new_user_price
      } else if (goods_info.max_price > 0) {
        if (goods_info.max_price == goods_info.min_price) {
          base_price = goods_info.max_price
        } else {
          min_price = goods_info.min_price;
          max_price = goods_info.max_price;
        }
      }
      base_price = Utils.toFix(base_price, 2);
      min_price = Utils.toFix(min_price, 2);
      max_price = Utils.toFix(max_price, 2);

      //计算优惠
      let base_promotion = 0;
      let min_promotion = 0;
      let max_promotion = 0;
      if(this.data.hasScore) {
        let base_promotion = goods_info.promotion_base;
        let min_promotion = 0;
        let max_promotion = 0;
        if (goods_info.max_promotion > 0) {
          if (goods_info.max_promotion == min_promotion) {
            base_promotion = goods_info.max_promotion
          } else {
            min_promotion = goods_info.min_promotion;
            max_promotion = goods_info.max_promotion;
          }
        }
        base_promotion = Utils.toFix(base_promotion * that.data.score, 2);
        min_promotion = Utils.toFix(min_promotion * that.data.score, 2);
        max_promotion = Utils.toFix(max_promotion * that.data.score, 2);
      }
      
      //最终价格字符串
      let price = "";
      
      if (min_price > 0 && max_price > 0) {
        price = `￥${min_price - min_promotion}~￥${max_price - max_promotion}`;
      }else{
        price = `￥${base_price - base_promotion}`;
      }
      this.setData({
        price: price
      })

    },

    updateScore() {
      let face = app.globalData.score;
      if (face) {
        var score = (face.attributes.beauty.value) * 0.01;
        this.setData({
          hasScore: true,
          score: score
        })
      }
    }

    

  }
})
