//index.js
//获取应用实例
// import template from "../template/personOperate"
var requestHttp = require('../common/httpRequest.js')

Page({
  data: {
		isShowSearch: false,
		isShowConditions: false,
		conditions: [
			{id: 1, content: "企业负责人", isSelected: false},
			{ id: 2, content: "招投标负责人", isSelected: false},
			{ id: 3, content: "资料员", isSelected: false},
			{ id: 4, content: "其他", isSelected: false}
		],
		isClickAdd: false,
		id: 0,
		companyList: [],
		total: 0
  },
  onLoad: function () {
		wx.showLoading({
			title: '加载中...',
		})

		wx.getSystemInfo({
			success: (res) => {
				this.setData({
					height: res.windowHeight
				})
			}
		})

		// 初始化列表
   this.handleHttpRequest()
  },
	onShow: function () {
		wx.showLoading({
			title: '加载中...',
		})
		this.handleHttpRequest()
	},
	// 请求列表
	handleHttpRequest(qymc, duty, temp) {
		let that = this
		requestHttp.request(
			'/BuildBid/public/index.php/index/Repository/searchRepFirm',
			'GET',
			{
				user_id: 1,
				qy_type: 1,
				qymc: qymc || '',
				duty: duty || '',
				page: 1,
				rows: temp || 10
			},
			'',
			function success(res) {
				if (res.data.status === 'success') {
					that.setData({
						companyList: res.data.rows,
						total: res.data.total
					})
					wx.hideLoading()
				} else {
					that.setData({
						companyList: [],
						total: 0
					})
				}
			},
			function fail() {
				wx.hideLoading()
			}
		)
	},
	// 点击搜索按钮
	handleSearchBtn: function(e) {
		let isShowSearch = !this.data.isShowSearch
		this.setData({
			isShowSearch
		})
	},
	// 点击筛查
	handleConditionsBtn: function(e) {
		let isShowConditions = 	!this.data.isShowConditions
		this.setData({
			isShowConditions
		})
	},
	// 点击某个筛选条件
	handleConditionsScreen: function(e) {
		wx.showLoading({
			title: '加载中...',
		})
		// 调用接口，筛选符合条件的数据
		let duty = e.currentTarget.dataset.duty
		this.handleHttpRequest('', duty)
		this.setData({
			isShowConditions: false
		})
	},
	// 点击添加按钮
	handleClickAdd: function(e) {
		wx.navigateTo({
			url: '../addCompany/addCompany',
		})
	},
	// 点击编辑
	handleClickEdit: function(e) {

		let dutyArr = e.currentTarget.dataset.dutyarr
		dutyArr.map((item, index) => {
			let one = this.data.conditions[index]
			one.isSelected = item.value
		})
	
		let isClickAdd = !this.data.isClickAdd
		this.setData({
			isClickAdd,
			conditions: this.data.conditions,
			currentQymc: e.currentTarget.dataset.qymc,
			currentRepId: e.currentTarget.dataset.repid,
			currentGsId: e.currentTarget.dataset.gsid
		})
	},
	// 弹出窗中，点击编辑
	handleAdd: function (e) {
		wx.showLoading({
			title: '加载中...',
		})

		let selectArr = this.data.conditions.filter((item) => {
			return item.isSelected
		})

		let duty = []
		selectArr.map((item) => {
			duty.push(item.content)
		})

		let that = this
		let params = {
			qy_type: 1,
			qymc: this.data.currentQymc,
			user_id: 1,
			gs_id: this.data.currentGsId,
			rep_id: this.data.currentRepId,
			duty: duty.join(',')
		}

		// 调用编辑接口 
		requestHttp.request(
			'/BuildBid/public/index.php/index/Repository/saveRepFirm',
			'POST',
			params,
			'application/x-www-form-urlencoded',
			function success(res) {
				if (res.data.status === 'success') {
					that.setData({
						isClickAdd: false
					})
					wx.showToast({
						title: '编辑成功',
						icon: 'success',
						duration: 1000
					})
					that.handleHttpRequest()
				}
			}
		)

		this.setData({
			isClickAdd: false
		})
		
	},
	// 弹出窗中 点击选择认识的人
	handleChoicePeople: function(e) {
		let index = e.currentTarget.dataset.index
		let item = this.data.conditions[index]
		item.isSelected = !item.isSelected
		this.setData({ conditions: this.data.conditions })
		
	},
	// 点击删除
	handleDeleteCompany: function(e) {
		let that = this
		wx.showModal({
			title: '提示',
			content: '您确定要删除吗？',
			success(res) {
				if (res.confirm) { // 点击确定
					let params = {
						rep_id: e.currentTarget.dataset.repid,
						qy_type: 1
					}

					// 调用删除接口
					requestHttp.request(
						'/BuildBid/public/index.php/index/Repository/delRepFirm',
						'DELETE',
						params,
						'application/x-www-form-urlencoded',
						function success(res) {
							if (res.data.status === 'success') {
								wx.showToast({
									title: '删除成功',
									icon: 'success',
									duration: 1000
								})

								that.handleHttpRequest()
							}
						}
					)
				}
			}
		})

	},
	// 加载更多
	loadMore: function () {
		let that = this
		let len = this.data.companyList.length
		if (len === this.data.total || this.data.total <= 10) {
			this.setData({
				loadMoreData: '已经到底了'
			})
			return
		}

		wx.showLoading({
			title: '加载中...',
		})

		setTimeout(function () {
			let temp = len + 10
			that.handleHttpRequest('', '', temp)
		}, 300)

	},
	// 搜索框 监听键盘完成按钮
	handleKeyBoardComplete: function(e) {
		wx.showLoading({
			title: '加载中...',
		})
		this.handleHttpRequest(e.detail.value)
	}
	
})
