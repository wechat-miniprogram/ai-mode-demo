// 推荐饮品列表组件
// 规范：
// - 组件渲染基于 structuredContent（Agent 语义筛选后下发）
// - imageUrl 等纯渲染字段从 _meta 补充（Agent 不可见，不参与语义筛选）
Component({
  data: {
    title: '为你推荐',
    items: [],
    total: 0,
    hasMore: false
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
        // 优先使用 _meta.viewItems（含 imageUrl），fallback 到 structuredContent.items
        const viewItems = meta.viewItems || sc.items || []
        this.setData({
          items: viewItems.slice(0, 3),
          total: sc.total || viewItems.length,
          hasMore: sc.hasMore || (sc.total && sc.total > 3),
          title: sc.keyword ? `"${sc.keyword}" 搜索结果` : '为你推荐'
        })
        if (sc.keyword) {
          this._viewCtx.setRelatedPage({ query: `keyword=${encodeURIComponent(sc.keyword)}` })
        }
      })
    }
  },
  methods: {
    onTapItem(e) {
      const item = e.currentTarget.dataset.item
      if (!item) return
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: `选择${item.name}` },
          { type: 'api/call', data: { name: 'selectDrink', arguments: { drinkId: item.drinkId } } }
        ]
      })
    },
    onTapMore() {
      this._viewCtx.openDetailPage({
        url: '/packageDetail/pages/more-drinks'
      })
    }
  }
})
