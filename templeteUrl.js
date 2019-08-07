function checkUrl(urlString , newUrl) {
  if (urlString != "") {
    var reg = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;
    if (reg.test(urlString)) {
        return true
    }
  }
}

function getQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 匹配目标参数

  var result = window.location.search.substr(1).match(reg); // 对querystring匹配目标参数
  if (result != null) {
    return decodeURIComponent(result[2]);
  } else {
    return null;
  }
}
 var  url =  {
    temp_url: 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=',
    bannerUrl: "https://www.feeai.cn/wxapi/data/attached/afficheimg/"
  }
 var datas = {
   sortNameList : [
     {
       "name": "综合",
       "activeId" : "0",
       "sortName": ""
     },
     {
       "name": "销量",
       "activeId": "1",
       "sortName": "sales_volume"
       
     },
     {
       "name": "人气",
       "activeId": "2",
       "sortName": "click_count"
     },
     {
       "name": "价格",
       "activeId": "3",
       "sortName": "shop_price"
     }
   ],
   statusNamelist : [
     {
       text : "全部",
       types : "all",
       id : 0
     },
     {
       text: "待付款",
       types: "noPay",
       id: 1
     },
     {
       text: "待发货",
       types: "noPick",
       id: 2
     },
     {
       text: "待收货",
       types: "noSlowPick",
       id: 3
     },
     {
       text: "已完成",
       types: "noCompare",
       id: 4
     }
   ]
 }


module.exports = {
  url: url,
  datas : datas,
  checkUrl : checkUrl,
  getStringQure: getQueryString
}


