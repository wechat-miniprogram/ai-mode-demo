// 饮品详情卡片组件
// 规范：
// - 基础数据从 structuredContent 获取（Agent 语义筛选后下发）
// - imageUrl、完整 skuSchema 从 _meta 补充（Agent 不可见的纯渲染数据）

// 单选维度默认值（与 validateSpecs / sku-picker 页保持一致）
const DEFAULT_SINGLE_SPEC = { temperature: 'ice', sugar: 'normal', cupSize: 'medium' }

Component({
  data: {
    drinkId: 0,
    name: '',
    price: 0,
    description: '',
    categoryName: '',
    imageUrl: '',
    dimsLabel: ''
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
        // skuSchema 从 _meta 获取（完整版供组件渲染规格标签）
        const schema = meta.skuSchema || { dimensions: [] }
        const dims = (schema.dimensions || []).map(d => d.label).join(' / ')
        this.setData({
          drinkId: sc.drinkId,
          name: sc.name,
          price: sc.price,
          description: sc.description || '',
          categoryName: sc.categoryName || '',
          imageUrl: meta.imageUrl || '',  // imageUrl 从 _meta 获取
          dimsLabel: dims
        })
        this._skuSchema = schema
        if (sc.drinkId) {
          this._viewCtx.setRelatedPage({ query: `drinkId=${sc.drinkId}` })
        }
      })
    }
  },
  methods: {
    onTapOrder() {
      if (!this.data.drinkId) return
      const specs = {}
      const dims = (this._skuSchema && this._skuSchema.dimensions) || []
      dims.forEach(d => {
        if (d.multiple) {
          specs[d.key] = []
        } else {
          specs[d.key] = DEFAULT_SINGLE_SPEC[d.key] || d.options[0].value
        }
      })
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: '直接下单' },
          { type: 'api/call', data: { name: 'createOrder', arguments: { drinkId: this.data.drinkId, specs } } }
        ]
      })
    },
    onTapModifySku() {
      if (!this.data.drinkId) return
      this._viewCtx.openDetailPage({
        url: `/packageDetail/pages/sku-picker?drinkId=${this.data.drinkId}`
      })
    }
  }
})
