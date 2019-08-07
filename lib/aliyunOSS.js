let uploadToOSS = function(source,fileName, successcallback, failcallback, completecallback)
{
  const ossEndpoint = "https://happymall.oss-cn-beijing.aliyuncs.com";
  const ossPolicy = "eyJleHBpcmF0aW9uIjoiMjAyMC0wMS0wMVQxMjowMDowMC4wMDBaIiwiY29uZGl0aW9ucyI6W1siY29udGVudC1sZW5ndGgtcmFuZ2UiLDAsMTA0ODU3NjAwMF1dfQ==";
  const ossSignature = "+Z40Soe/sIMlPUbkPCXhzvlvh0E=";
  const OSSAccessKeyId = "PGuwbwWCVPpjUi85";

  wx.uploadFile({
    url: ossEndpoint,
    filePath: source,
    name: 'file',
    formData: {
      name: source,
      key: fileName,
      policy: ossPolicy,
      signature: ossSignature,
      OSSAccessKeyId: OSSAccessKeyId,
      success_action_status: "200"
    },
    success: function (res) {
      var url = ossEndpoint + "/" + fileName;
      if(successcallback)
      successcallback(res,url);
    },
    fail: function (res) {
      if (failcallback)
        failcallback(res);
    },
    complete: function (res) {
      if(completecallback)
      completecallback(res);
    }
  })
}

module.exports = {    //数据暴露出去
  upload: uploadToOSS
};