Component({
  data: {
    hasAddress: false,
    address: null,
    pendingOrderId: ''
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
        this.setData({
          hasAddress: !!sc.hasAddress,
          address: sc.address || null,
          pendingOrderId: meta.pendingOrderId || ''
        })
      })
    }
  },
  methods: {
    onTapEdit() {
      this._viewCtx.openDetailPage({
        url: '/packageDetail/pages/address-edit'
      })
    },
    onTapUse() {
      if (this.data.pendingOrderId) {
        this._modelCtx.sendFollowUpMessage({
          content: [
            { type: 'text', text: '使用该地址继续下单' },
            { type: 'api/call', data: { name: 'confirmOrder', arguments: { orderId: this.data.pendingOrderId } } }
          ]
        })
      }
    }
  }
})
