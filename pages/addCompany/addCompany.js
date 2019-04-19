
var requestHttp = require('../common/httpRequest.js')

Page({
	data: {
		companyList: [],
		isClickAdd: false,
		conditions: [
			{ id: 1, content: "企业负责人", isSelected: false },
			{ id: 2, content: "招投标负责人", isSelected: false },
			{ id: 3, content: "资料员", isSelected: false },
			{ id: 4, content: "其他", isSelected: false }
		],
	},
	onLoad: function() {
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

		// 列表数据请求 初始化
		this.handleRequestList('', 1, 10)
		
	},
	// 请求公司列表数据
	handleRequestList: function(gsmc, page, rows) {
		let that = this
		requestHttp.request(
			'/BuildBid/public/index.php/index/Element_set/getAllCompany',
			'GET',
			{
				gsmc: gsmc,
				page: page,
				rows: rows
			},
			'',
			function success(res) {
				if (res.data.status === 'success') {
					that.setData({
						companyList: res.data.rows,
						total: res.data.total
					})
					wx.hideLoading()
				}
			},
			function fail() {
				wx.hideLoading()
			}
		)
	},
	// 上拉加载更多
	loadMore: function() {
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

		setTimeout(function() {
			let temp = len + 10
			that.handleRequestList('', 1, temp)
		}, 300)

	},
	// 在搜索框中输入值
	inputSearchValue: function(e) {
		this.setData({searchValue: e.detail.value})
	},
	// 点击搜索
	handleClickSearch: function() {
		wx.showLoading({
			title: '加载中...',
		})
		let gsmc = this.data.searchValue || ''
		this.handleRequestList(gsmc, 1, 10)
	},
	// 点击选择
	handleClickChoice: function(e) {
		this.setData({ 
			isClickAdd: true, 
			qymc: e.currentTarget.dataset.gsmc,
			gsId: e.currentTarget.dataset.gsid
			})
	},
	// 弹出窗中，点击添加
	handleAdd: function (e) {
		let selectArr = this.data.conditions.filter((item) => {
			return item.isSelected
		})

		let duty = []
		selectArr.map((item) => {
			duty.push(item.content)
		})

		let params = {
			qy_type: 1,
			qymc: this.data.qymc,
			user_id: 1,
			gs_id: this.data.gsId,
			duty: duty.join(',')
		}
		// 调用添加接口 
		let that = this
		requestHttp.request(
			'/BuildBid/public/index.php/index/Repository/saveRepFirm',
			'POST',
			params,
			'application/x-www-form-urlencoded',
			function success(res) {
				if (res.data.status === 'success') {
					wx.showToast({
						title: '添加成功',
						icon: 'success',
						duration: 1000,
					})

					setTimeout(function() {
						wx.navigateBack({
							delta: 1,
							success: function () {
								that.setData({
									isClickAdd: false
								})
							}
						})
					}, 1000)
				
				}
			}
		)
	},
	// 弹出窗中 点击选择认识的人
	handleChoicePeople: function (e) {
		let index = e.currentTarget.dataset.index
		let item = this.data.conditions[index]
		item.isSelected = !item.isSelected
		this.setData({ conditions: this.data.conditions })

	}
})