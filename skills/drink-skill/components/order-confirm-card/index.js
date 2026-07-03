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
    // 注意：handoff 模式下本组件在小微对话内不渲染，支付与选址均改由接力页
    // checkout 内用 wx.requestPayment / wx.chooseAddress 就地完成；
    // 原 payOrder / getAddress 原子接口已随 handoff 改造下线，故此处不再发起 api/call。
    onTapPay() {
      // 已下线：支付在接力页 checkout 完成
    },
    onTapAddress() {
      // 已下线：收货地址在接力页 checkout 通过 wx.chooseAddress 选择
    }
  }
})
