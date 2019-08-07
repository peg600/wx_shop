// pages/components/checkAuth/checkAuth.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {

  },

  attached:function()
  {
    wx.getSetting({
      success:function(res)
      {
        if(res.authSetting && !res.authSetting["scope.userInfo"])
        {
          var pages = getCurrentPages();
          var currentPage = pages[pages.length - 1] //获取当前页面的对象

          var url = currentPage.route;
          if(currentPage.options)
          {
            url = url + "?";
            for(var key in currentPage.options)
            {
              url += (key + "=" + currentPage.options[key]);
            }
          }
          wx.redirectTo({
            url: '/pages/authorize/authorize?url=/' + encodeURIComponent(url),
          })
        }
      }
    });
  }
})
