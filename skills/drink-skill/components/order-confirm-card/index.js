// 订单确认卡片组件
// 地址选择：优先使用 wx.chooseAddress 系统地址选择器
// 失败/取消时降级打开半屏页面手动填写
// 规范：
// - 基础订单数据从 structuredContent 获取
// - imageUrl、价格明细、地址从 _meta 补充（Agent 不可见的纯渲染数据）
Component({
  data: {
    orderId: '',
    drinkName: '',
    specText: '',
    totalPrice: 0,
    basePrice: 0,
    extraPrice: 0,
    imageUrl: '',
    address: null,
    hasAddress: false,
    hint: ''
  },
  lifetimes: {
    created() {
      this._modelCtx = wx.modelContext.getContext(this)
      this._viewCtx = wx.modelContext.getViewContext(this)
      const { NotificationType } = wx.modelContext
      this._modelCtx.on(NotificationType.Result, (data) => {
        const result = data && data.result ? data.result : {}
        const sc = result.structuredContent || {}
        const meta = result._meta || {}
        const addr = meta.address || null
        this.setData({
          orderId: sc.orderId || '',
          drinkName: sc.drinkName || '',
          specText: sc.specText || '',
          totalPrice: sc.totalPrice || 0,
          basePrice: meta.basePrice || 0,
          extraPrice: meta.extraPrice || 0,
          imageUrl: meta.imageUrl || '',
          address: addr,
          hasAddress: !!addr,
          hint: sc.needAddress ? '请先添加收货地址' : ''
        })
        if (sc.orderId) {
          this._viewCtx.setRelatedPage({ query: `orderId=${sc.orderId}` })
        }
      })
    }
  },
  methods: {
    onTapPay() {
      if (!this.data.orderId) return
      const args = { orderId: this.data.orderId }
      // 如果卡片上已有地址，一并传递，避免异步时序导致订单缺少地址
      if (this.data.address) {
        args.address = this.data.address
      }
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: '确认下单' },
          { type: 'api/call', data: { name: 'payOrder', arguments: args } }
        ]
      })
    },
    onTapAddress() {
      // 原子组件不支持 wx.chooseAddress，通过 sendFollowUpMessage 触发原子接口
      // getAddress 原子接口内部会调用 wx.chooseAddress
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: '选择收货地址' },
          { type: 'api/call', data: { name: 'getAddress', arguments: {} } }
        ]
      })
    }
  }
})
