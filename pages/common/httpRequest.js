var app = getApp()
function request(url, reType, postData, header, doSuccess, doFail, doComplete) {
	var host = app.globalData.host
	wx.request({
		url: host + url,
		data: postData,
		method: reType,
		header: {
			'content-type': header || 'application/json'
		},
		success: function(res) {
			if (typeof doSuccess == "function") {
				doSuccess(res)
			}
		},
		fail: function() {
			if (typeof doFail == "function") {
				doFail()
			}
		},
		complete: function() { // 接口调用结束的回调函数（成功、失败都会执行）
			if (typeof doComplete == "function") {
				doComplete()
			}
		}
	})
}

module.exports.request = request;