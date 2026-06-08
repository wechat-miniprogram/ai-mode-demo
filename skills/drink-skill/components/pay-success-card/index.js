// 支付成功卡片组件
// 规范：
// - 基础数据从 structuredContent 获取
// - imageUrl 从 _meta 补充（Agent 不可见的纯渲染数据）
Component({
  data: {
    orderId: '',
    paidAmount: 0,
    payTime: '',
    payTimeText: '',
    drinkName: '',
    specText: '',
    imageUrl: ''
  },
  lifetimes: {
    created() {
      this._modelCtx = wx.modelContext.getContext(this)
      const { NotificationType } = wx.modelContext
      this._modelCtx.on(NotificationType.Result, (data) => {
        const result = data && data.result ? data.result : {}
        const sc = result.structuredContent || {}
        const meta = result._meta || {}
        let timeText = ''
        if (sc.payTime) {
          try {
            const t = new Date(sc.payTime)
            const pad = (n) => String(n).padStart(2, '0')
            timeText = `${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`
          } catch (e) { timeText = '' }
        }
        this.setData({
          orderId: sc.orderId || '',
          paidAmount: sc.paidAmount || 0,
          payTime: sc.payTime || '',
          payTimeText: timeText,
          drinkName: sc.drinkName || '',
          specText: sc.specText || '',
          imageUrl: meta.imageUrl || ''  // 图片从 _meta 获取
        })
      })
    }
  }
})
