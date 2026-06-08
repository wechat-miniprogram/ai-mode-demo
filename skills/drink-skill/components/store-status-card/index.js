// 实时动态原子组件示例
// 与 recommended-drinks 的无请求组件形成对比：
// - 无请求组件：仅渲染原子接口下发的 structuredContent，内容静态
// - 有请求组件：通过 wx.request 定时轮询后端，展示实时动态内容
// 注意：组件要使用网络请求，需要在 mcp.json 的 components 中声明 scope.dynamic 权限（非 scope.network）
// 此能力需要单独审核，非必要场景不建议使用
Component({
  data: {
    storeName: '',
    distance: '',
    address: '',
    // 数值直接用字符串，便于统一展示 "--" 占位
    queueText: '--',
    etaText: '--',
    status: 'loading',
    lastUpdate: ''
  },
  lifetimes: {
    created() {
      this._modelCtx = wx.modelContext.getContext(this)
      this._viewCtx = wx.modelContext.getViewContext(this)
      const { NotificationType } = wx.modelContext

      // 监听原子接口返回：拿到门店基础信息 + 轮询地址
      this._modelCtx.on(NotificationType.Result, (data) => {
        const result = (data && data.result) || {}
        const sc = result.structuredContent || {}
        const meta = result._meta || {}

        this.setData({
          storeName: sc.storeName || '',
          distance: sc.distance || '',
          address: sc.address || ''
        })

        this._statusUrl = meta.statusUrl
        this._pollInterval = meta.pollInterval || 5000

        // 先用本地 mock 立即填上一次数据，保证 UI 有数字
        this._applyStatus(this._mockStatus())
        // 再尝试发起远端请求 & 启动轮询
        this._fetchStatus()
        this._startPolling()
      })
    },
    detached() {
      this._stopPolling()
    }
  },
  methods: {
    _startPolling() {
      this._stopPolling()
      this._timer = setInterval(() => {
        this._fetchStatus()
      }, this._pollInterval || 5000)
    },
    _stopPolling() {
      if (this._timer) {
        clearInterval(this._timer)
        this._timer = null
      }
    },
    _applyStatus(s) {
      this.setData({
        queueText: String(s.queueCount),
        etaText: String(s.estimatedMinutes),
        status: 'ok',
        lastUpdate: this._formatTime(new Date())
      })
    },
    _fetchStatus() {
      // 如果没有 URL 或环境不支持，直接走本地 mock
      if (!this._statusUrl || !wx.request) {
        this._applyStatus(this._mockStatus())
        return
      }
      // 注意：原子组件仅支持 wx.request，且必须在 mcp.json 声明 scope.network 权限
      try {
        wx.request({
          url: this._statusUrl,
          method: 'GET',
          data: { t: Date.now() },
          success: (res) => {
            const d = (res && res.data) || this._mockStatus()
            this._applyStatus({
              queueCount: d.queueCount != null ? d.queueCount : this._mockStatus().queueCount,
              estimatedMinutes: d.estimatedMinutes != null ? d.estimatedMinutes : this._mockStatus().estimatedMinutes
            })
          },
          fail: () => {
            this._applyStatus(this._mockStatus())
          }
        })
      } catch (e) {
        this._applyStatus(this._mockStatus())
      }
    },
    _mockStatus() {
      const t = Math.floor(Date.now() / 5000)
      return {
        queueCount: (t % 9) + 1,
        estimatedMinutes: (t % 5) + 3
      }
    },
    _formatTime(d) {
      const pad = (n) => (n < 10 ? '0' + n : '' + n)
      return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    },
    onTapRefresh() {
      this.setData({ status: 'loading' })
      this._fetchStatus()
    }
  }
})
