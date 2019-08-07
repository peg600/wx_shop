var Utils = {};
import ossUploader from 'aliyunOSS.js';
import convertPinyin from './toPinyin.js';
let pinYin = convertPinyin.convertPinyin;
let celebrity = require("./celebrity.js")
let md5 = require("./md5.js")

Utils.facePlusDetectAPI = "https://api-cn.faceplusplus.com/facepp/v3/detect";
Utils.facePlusBeautyAPI = "https://api-cn.faceplusplus.com/facepp/v1/beautify";
Utils.faceplusapiKey = "TvM-Vm6cQW9PY-CUZ0vWrPXqgIWXUQ-Q";
Utils.faceplusapisecret = "sGizktwSPCrOdDpQU5-zZsnWEY0MYwlP";
Utils.faceplusCompareAPI = "https://api-cn.faceplusplus.com/facepp/v3/compare";

Utils.baiduDetectAPI = "https://aip.baidubce.com/rest/2.0/face/v3/detect";
Utils.baiduCompareAPI = "https://aip.baidubce.com/rest/2.0/face/v3/match";
Utils.baiduSearchAPI = "https://aip.baidubce.com/rest/2.0/face/v3/search";
Utils.baiduAddAPI = "https://aip.baidubce.com/rest/2.0/face/v3/faceset/user/add";
Utils.baiduCutoutAPI = "https://aip.baidubce.com/rest/2.0/image-classify/v1/body_seg";
Utils.baiduBodyPositionAPI = "https://aip.baidubce.com/rest/2.0/image-classify/v1/body_attr";

Utils.toFix = function (value, count) {
  var num = value;
  if (typeof value !== 'number') {
    //console.log(value);
    num = parseInt(value);
  }
  return num.toFixed(count);
};

Utils.livePictureTest = function (requestObject) {
  var imgUrl = requestObject.imgUrl;
  var success = requestObject.success;
  var fail = requestObject.fail;
  var complete = requestObject.complete;
  let appid = "1256635511";
  var app = getApp();
  var baseUrl = getApp().globalData.baseHttpUrl;
  //获取腾讯云加密字符串
  wx.request({
    url: `${baseUrl}/index.php?m=default&c=flow&a=face_detect_tencent_code`,
    method: 'POST',
    dataType: 'txt',
    data: {},
    success: function (res) {
      res = JSON.parse(Utils.Trim(res.data));
      let signStr = res;

      //向腾讯云发送测是否活体
      wx.request({
        url: `https://recognition.image.myqcloud.com/face/livedetectpicture`,
        method: 'POST',
        dataType: 'txt',
        header: {
          "Content-Type": "application/json",
          "authorization": signStr
        },
        data: {
          appid: appid,
          url: imgUrl
        },
        success: function (res) {
          res = JSON.parse(Utils.Trim(res.data));
          if (res.code == 0) {
            if (res.data.score > 87) { //判断为真人
              if (success)
                success();
            } else {
              wx.hideLoading();
              wx.showModal({
                title: '温馨提示',
                content: '不支持对着照片翻拍，请使用摄像头对着真人拍照',
                showCancel: false,
                confirmText: "重新拍照",
                success: function (res) {
                  if (complete)
                    complete();
                }
              })
            }
          } else {
            wx.hideLoading();
            if (res.code == "-1101") {
              wx.showModal({
                title: '提示',
                content: '未检测到人脸，请确保脸部出现在摄像头有效区域然后重新拍照',
              })
            } else {
              wx.showModal({
                title: '发生错误(' + res.code + ")",
                content: res.message,
              })
            }
          }
        },
        fail: fail
      })
    },
    fail: fail
  });
},

  Utils.getScore = function (requestObject) {
    var imgUrl = requestObject.imgUrl;
    var localUrl = requestObject.localUrl;
    var generateBeauty = requestObject.generateBeauty;
    var success = requestObject.success;
    var fail = requestObject.fail;
    var complete = requestObject.compare;
    let that = this;
    var app = getApp();
    Utils.detect({
      apiType: "baidu",
      imgUrl: imgUrl,
      success: function (faceobj) {
        if (faceobj) {
          wx.setStorageSync("score", JSON.stringify(faceobj));
          app.globalData.score = faceobj;
          wx.setStorageSync("scoredImage", JSON.stringify({
            local: localUrl,
            url: imgUrl
          }));
          if (generateBeauty) {
            wx.removeStorageSync("beautyimage");
            //生成美颜图片
            Utils.generateBeauty({
              imgUrl: imgUrl,
              success: success,
            })
          } else if (success)
            success();
        } else {
          wx.hideLoading();
          wx.showToast({
            title: '没有检测到人脸，返回重新检测',
            icon: 'none',
            duration: 3000
          });
        }
      },
      fail: function (res) {
        Utils.showToast("检测错误，请重试");
        wx.hideLoading();
      },
      complete: function (res) {

      }
    })
  },

  Utils.uploadImage = function (requestObject) {
    var imgUrl = requestObject.imgUrl;
    var success = requestObject.success;
    var fail = requestObject.fail;
    var fileName = imgUrl;
    var index = fileName.lastIndexOf("/");
    if (index > 0)
      fileName = fileName.substr(index + 1);
    wx.getImageInfo({
      src: imgUrl,
      success: function (res) {
        //设置尺寸
        wx.setStorageSync("img_size", res.width + "," + res.height);
        ossUploader.upload(res.path, fileName, function (res1, imageUrl) {
          if (success)
            success(res1, imageUrl);
        }, fail);
      }
    });
  },

  Utils.parseScene = function (scene) {
    var arrPara = scene.split("&");
    var result = [];
    for (var i in arrPara) {
      var arr = arrPara[i].split("=");
      if (arr.length == 2) {
        result[arr[0]] = arr[1];
      }
    }
    return result;
  },

  Utils.generateBeauty = function (requestObject) {
    var imgUrl = requestObject.imgUrl;
    var success = requestObject.success;
    var fail = requestObject.fail;
    var complete = requestObject.complete;
    Utils.request({
      url: Utils.facePlusBeautyAPI,
      data: {
        api_key: Utils.faceplusapiKey,
        api_secret: Utils.faceplusapisecret,
        image_url: imgUrl
      },
      success: function (res) {
        var json = JSON.parse(Utils.Trim(res.data));
        if (json.result && json.result.length > 0) {
          wx.setStorageSync("beautyimage", json.result);
          if (success)
            success(json.result);
        } else {
          Utils.showToast("上传过程中出错，请重试");
          wx.hideLoading();
        }
      },
      fail: fail,
      complete: complete
    })
  },

  Utils.toRectangle = function (value) {
    var array = value.split(",");
    var obj = new Object();
    obj.left = parseInt(array[0]);
    obj.top = parseInt(array[1]);
    obj.width = parseInt(array[2]);
    obj.height = parseInt(array[3]);
    return obj;
  }

Utils.toSize = function (value) {
  var array = value.split(",");
  var obj = new Object();
  obj.width = parseInt(array[0]);
  obj.height = parseInt(array[1]);
  return obj;
}

Utils.formatDate = function (date) {
  return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDay();
};

Utils.request = function (requestObject) {
  var data = requestObject.data;
  var page = requestObject.page;
  var type = requestObject.type;
  var header = {
    'content-type': 'application/x-www-form-urlencoded'
  };
  if (type == "json")
    header = {
      'content-type': 'application/json'
    };
  //console.log(typeof data);
  if (typeof data !== 'string') {
    data["appid"] = getApp().globalData.appId;
    data["session_id"] = wx.getStorageSync("session_id");
  }
  wx.request({
    url: requestObject.url,
    method: 'POST',
    header: header,
    dataType: 'txt',
    data: data,
    success: requestObject.success,
    fail: function (res) {
      if (requestObject.fail)
        requestObject.fail(res);
      else {
        //wx.hideLoading();
        //Utils.showToast("网络错误，请检查重试");
      }
    },
    complete: function (res) {
      if (requestObject.complete)
        requestObject.complete(res);
      //else
      // wx.hideLoading();
    }
  })
},

  Utils.showToast = function (title) {
    wx.showToast({
      title: title,
      icon: 'none',
      duration: 2000
    })
  },

  Utils.Trim = function (str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
  },

  Utils.detect = function (requestObject) {
    var apiType = requestObject.apiType;
    var success = requestObject.success;
    var imgUrl = requestObject.imgUrl;
    var type = requestObject.type;
    var face_field = requestObject.face_field;
    if (face_field == undefined)
      face_field = "age,beauty,expression,face_shape,gender,glasses,emotion";
    if (type == undefined)
      type = "URL";
    let app = getApp();
    //百度
    if (apiType == "baidu") {
      Utils.request({
        url: app.globalData.baseHttpUrl + '/index.php?m=default&c=externalAPI&a=getBaiduAccessToken',
        data: {},
        success: function (res) {
          res = JSON.parse(Utils.Trim(res.data));
          //调用API
          Utils.request({
            url: Utils.baiduDetectAPI + "?access_token=" + res.access_token,
            data: {
              image: imgUrl,
              image_type: type,
              face_field: face_field
            },
            success: function (res) {
              res = JSON.parse(Utils.Trim(res.data));
              if (res.result.face_list.length > 0) {
                var obj = new Object();
                var faceobj = res.result.face_list[0];
                obj.face_rectangle = faceobj.location;
                obj.attributes = new Object();
                obj.attributes.gender = new Object();
                if (faceobj.gender) {
                  var gender = faceobj.gender.type;
                  gender = gender.slice(0, 1).toUpperCase() + gender.slice(1);
                  obj.attributes.gender.value = gender;
                }
                obj.attributes.beauty = new Object();
                obj.attributes.beauty.value = faceobj.beauty;
                obj.attributes.age = new Object();
                obj.attributes.age.value = faceobj.age;
                if (faceobj.emotion) {
                  obj.attributes.emotion = faceobj.emotion.type;
                  obj.attributes.expression = faceobj.expression.type;
                }
                if (faceobj.face_shape)
                  obj.attributes.face_shape = faceobj.face_shape.type;
                if (success)
                  success(obj);
              } else if (success)
                success(undefined);
            }
          })
        }
      })
    } else if (apiType == "faceplus") {
      Utils.request({
        url: Utils.facePlusDetectAPI,
        data: {
          api_key: Utils.faceplusapiKey,
          api_secret: Utils.faceplusapisecret,
          image_url: imgUrl,
          return_attributes: "gender,age,smiling,beauty,emotion"
        },
        success: function (res) {
          res = JSON.parse(Utils.Trim(res.data));
          var faceObj = undefined;
          if (res.faces.length > 0) {
            //console.log(res.faces[0]);
            if (success) {
              var obj = res.faces[0];
              obj.attributes.beauty.value = parseInt(Utils.toFix((obj.attributes.beauty.female_score + obj.attributes.beauty.male_score) * 0.5));
              success(obj)
            }
          } else if (success)
            success(undefined);
        }
      })
    }
  },

  Utils.compare = function (requestObject) {
    var apiType = requestObject.apiType;
    var success = requestObject.success;
    var imgUrl = requestObject.imgUrl;
    var imgUrl1 = requestObject.imgUrl1;
    let app = getApp();
    //百度
    if (apiType == "baidu") {
      Utils.request({
        url: app.globalData.baseHttpUrl + '/index.php?m=default&c=externalAPI&a=getBaiduAccessToken',
        data: {},
        success: function (res) {
          res = JSON.parse(Utils.Trim(res.data));
          var data1 = {
            "image": imgUrl,
            "image_type": "URL",
            "face_type": "LIVE",
          };
          var data2 = {
            "image": imgUrl1,
            "image_type": "URL",
            "face_type": "LIVE",
          };
          var datas = [data1, data2];
          datas = JSON.stringify(datas);
          //调用API
          Utils.request({
            url: Utils.baiduCompareAPI + "?access_token=" + res.access_token,
            data: datas,
            type: "json",
            success: function (res) {
              res = JSON.parse(Utils.Trim(res.data));
              var obj = new Object();
              obj.confidence = res.result.score;
              if (success)
                success(obj);
            }
          })
        }
      })
    } else if (apiType == "faceplus") {
      Utils.request({
        url: Utils.faceplusCompareAPI,
        data: {
          api_key: Utils.faceplusapiKey,
          api_secret: Utils.faceplusapisecret,
          image_url1: imgUrl,
          image_url2: imgUrl1,
          return_attributes: "gender,age,smiling,beauty,emotion"
        },
        success: function (res) {
          res = JSON.parse(Utils.Trim(res.data));
          if (success)
            success(res);
        }
      })
    }
  },

  //向百度人脸库中添加用户及照片
  Utils.add = function (requestObject) {
    let that = this;
    let app = getApp();
    let baseUrl = getApp().globalData.baseHttpUrl;
    console.log(celebrity.celebrity)
    let celebrity_data = celebrity.celebrity;
    let i = 0;
    let timer = setInterval(() => {
      if (i == celebrity_data.length) {
        clearInterval(timer);
      }
      let imgUrl = celebrity_data[i].img;
      let name = celebrity_data[i].name;
      let pinyin_name = pinYin.convertPinyin(celebrity_data[i].name);

      Utils.request({
        url: app.globalData.baseHttpUrl + '/index.php?m=default&c=externalAPI&a=getBaiduAccessToken',
        data: {},
        success: function (res) {
          res = JSON.parse(Utils.Trim(res.data));
          var data = {
            "image": imgUrl,
            "image_type": "URL",
            "group_id": "star",
            "user_id": `${i}_${pinyin_name}`,
            "user_info": name
          };
          data = JSON.stringify(data);
          //调用API
          Utils.request({
            url: Utils.baiduAddAPI + "?access_token=" + res.access_token,
            data: data,
            type: "json",
            success: function (res) {
              res = JSON.parse(Utils.Trim(res.data));
              console.log(res)
              if (success) {
                success(res);
              }
            }
          })
        }
      })
      i = i + 1;
    }, 1000)
  },

  //从百度人脸库中查找与上传图片最相似的n个用户
  Utils.search = function (requestObject) {
    var apiType = requestObject.apiType;
    var success = requestObject.success;
    var imgUrl = requestObject.imgUrl;
    let app = getApp();
    //百度
    if (apiType == "baidu") {
      Utils.request({
        url: app.globalData.baseHttpUrl + '/index.php?m=default&c=externalAPI&a=getBaiduAccessToken',
        data: {},
        success: function (res) {
          res = JSON.parse(Utils.Trim(res.data));
          var data = {
            "image": imgUrl,
            "image_type": "BASE64",
            "group_id_list": "star",
            "max_user_num": 50
          };
          data = JSON.stringify(data);

          Utils.request({
            url: Utils.baiduSearchAPI + "?access_token=" + res.access_token,
            data: data,
            type: "json",
            success: function (res) {
              res = JSON.parse(Utils.Trim(res.data));
              if (success) {
                success(res);
              }
            }
          })
        }
      })
    }
  },

  //抠出透明背景的人像图
  Utils.cutout = function (requestObject) {
    var apiType = requestObject.apiType;
    var success = requestObject.success;
    var fail = requestObject.fail;
    var imgUrl = requestObject.imgUrl;
    let app = getApp();
    //百度
    if (apiType == "baidu") {
      Utils.request({
        url: app.globalData.baseHttpUrl + '/index.php?m=default&c=externalAPI&a=getBaiduAccessToken',
        data: {
          type: "body"
        },
        success: function (res) {
          res = JSON.parse(Utils.Trim(res.data));
          var data = {
            "image": imgUrl,
            "type": "foreground"
          };

          Utils.request({
            url: Utils.baiduCutoutAPI + "?access_token=" + res.access_token,
            method: 'POST',
            dataType: 'json',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: data,
            success: function (res) {
              res = JSON.parse(Utils.Trim(res.data));
              if (success) {
                success(res);
              }
            },
            fail: function (res) {
              console.log(res)
              if (fail)
                fail(res);
            }
          })
        },
        fail: function (res) {
          if (fail)
            fail(res);
        }
      })
    }
  },

  //获取人体在图片中的位置
  Utils.body_position = function (requestObject) {
    var apiType = requestObject.apiType;
    var success = requestObject.success;
    var imgUrl = requestObject.imgUrl;
    let app = getApp();
    //百度
    if (apiType == "baidu") {
      Utils.request({
        url: app.globalData.baseHttpUrl + '/index.php?m=default&c=externalAPI&a=getBaiduAccessToken',
        data: {
          type: "body"
        },
        success: function (res) {
          res = JSON.parse(Utils.Trim(res.data));
          var data = {
            "image": imgUrl,
            "type": "orientation,is_human"
          };

          Utils.request({
            url: Utils.baiduBodyPositionAPI + "?access_token=" + res.access_token,
            method: 'POST',
            dataType: 'json',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: data,
            success: function (res) {
              res = JSON.parse(Utils.Trim(res.data));
              if (success) {
                success(res);
              }
            },
            fail: function (res) {
              console.log(res)
            }
          })
        },
        fail(res)
        {
          if(fail)
          fail(res);
        }
      })
    }
  }

//绘制居中对齐的文本
//mode: 对齐方式，默认或0：左对齐， 1：居中，
Utils.drawText = function (ctx, text, top, left, mode, width) {
  var text1 = text;
  if (width) {
    var length = 0,
      i = 0;
    text1 = "";
    for (i = 0; i < text.length; i++) {
      length += ctx.measureText(text[i]).width;
      if (length >= width) {
        break;
      }
      text1 += text[i];
    }
    if (i < text.length - 1)
      text1 += "...";
  } {
    if (mode == 1) {
      var length = ctx.measureText(text1).width;
      left = left - length / 2;
    } else if (mode == 2) {
      var length = ctx.measureText(text1).width;
      left = left - length;
    }
    ctx.fillText(text1, left, top);
  }
};

Utils.JDAPIRequest = function(requestObject)
{
  var apiName = requestObject.apiName;
  var strParam = requestObject.strParam;
  var success = requestObject.success;
  var access_token = requestObject.access_token;
  //对需要特殊版本的接口（如获取商品优惠券），需传入version
  var version = requestObject.version

  var date = new Date();
  Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
      "M+": this.getMonth() + 1, //月份 
      "d+": this.getDate(), //日 
      "h+": this.getHours(), //小时 
      "m+": this.getMinutes(), //分 
      "s+": this.getSeconds(), //秒 
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
      "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt))
      fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt))
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  }
  var timespan = date.Format("yyyy-MM-dd hh:mm:ss");
  var appSecret = "271d6651c2154f52b601cc5a7cdcb437";
  var sysParams = {
    "app_key": "c532f6fc22f74f9ab7c928ec8c31be8c",
    "format": "json",
    "method": apiName,
    "sign_method": "md5",
    "timestamp": timespan,
    "v": version ? version : "1.0"
  };
  var pmap = {
    "app_key": "c532f6fc22f74f9ab7c928ec8c31be8c",
    "format": "json",
    "method": apiName,
    "param_json": strParam,
    "sign_method": "md5",
    "timestamp": timespan,
    "v": version ? version : "1.0"
  };
  if(access_token){
    sysParams = {
      access_token:access_token,
      "app_key": "c532f6fc22f74f9ab7c928ec8c31be8c",
      "format": "json",
      "method": apiName,
      "sign_method": "md5",
      "timestamp": timespan,
      "v": version ? version : "1.0"
    };

    pmap = {
      access_token: access_token,
      "app_key": "c532f6fc22f74f9ab7c928ec8c31be8c",
      "format": "json",
      "method": apiName,
      "param_json": strParam,
      "sign_method": "md5",
      "timestamp": timespan,
      "v": version ? version : "1.0"
    };
  }
  var strSign = appSecret;
  for (var key in pmap) {
    if (pmap.hasOwnProperty(key) && pmap[key].length > 0)
      strSign = strSign + key + pmap[key];
  }
  strSign += appSecret;
  strSign = md5.hex_md5(strSign).toUpperCase();
  sysParams["sign"] = strSign;
  var url = "https://router.jd.com/api?";
  for (var key in sysParams) {
    if (sysParams.hasOwnProperty(key) && sysParams[key].length > 0)
      url = url + key + "=" + encodeURIComponent(sysParams[key]) + "&";
  }
  Utils.request({
    url: url,
    data: {
      "param_json": strParam
    },
    success: function (res) {
      res = JSON.parse(Utils.Trim(res.data));
      if (success)
        success(res);
    },
    fail: function (res) {
      console.log(res);
    }
  })
};

//根据当前时间判断是在某一时间段内，传入时间 year-month-day
//只传start_time判断是否在该时间之后，传end_time且start_time为false判断是否在该时间之前
//都传则判断是否在两者之间
Utils.isInTime = function(start_time,end_time) {
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  let later_than_start = false;
  let earlier_than_end = false;

  if(start_time) {
    let time_arr = start_time.split("-");
    if (year > time_arr[0]) {
      later_than_start = true;
    } else if (year < time_arr[0]) {
      later_than_start = false;
    } else {
      if (month > time_arr[1]) {
        later_than_start = true;
      } else if (month < time_arr[1]) {
        later_than_start = false;
      } else {
        if (day >= time_arr[2]) {
          later_than_start = true;
        } else {
          later_than_start = false;
        }
      }
    }
  }

  if(end_time) {
    let time_arr = end_time.split("-");
    if (year > time_arr[0]) {
      earlier_than_end = false;
    } else if (year < time_arr[0]) {
      earlier_than_end = true;
    } else {
      if (month > time_arr[1]) {
        earlier_than_end = false;
      } else if (month < time_arr[1]) {
        earlier_than_end = true;
      } else {
        if (day > time_arr[2]) {
          earlier_than_end = false;
        } else {
          earlier_than_end = true;
        }
      }
    }
  }

  if(start_time && !end_time){
    return later_than_start;
  }
  if(!start_time && end_time){
    return earlier_than_end;
  }
  if(start_time && end_time){
    return later_than_start && earlier_than_end;
  }
  
}

module.exports = Utils;