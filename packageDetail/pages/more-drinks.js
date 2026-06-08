// 注意：半屏页面运行在独立环境，通过 storage 读取由原子接口注入的 catalog
// 若 storage 为空或版本过期则使用本地兜底 seed
const { buildCatalog, CATEGORIES } = require('../data/seed.js')

const CATALOG_VERSION = 2

function loadCatalog() {
  const cached = wx.getStorageSync('drinks_catalog')
  const version = wx.getStorageSync('drinks_catalog_version')
  if (cached && cached.length && version === CATALOG_VERSION) return cached
  const fresh = buildCatalog()
  try {
    wx.setStorageSync('drinks_catalog', fresh)
    wx.setStorageSync('drinks_catalog_version', CATALOG_VERSION)
  } catch (e) {}
  return fresh
}

Page({
  data: {
    categories: [],
    activeCategoryId: 0,
    items: [],
    headerPaddingTop: 32
  },

  onShow() {
    // 获取半屏页面关闭按钮位置，让标题避开
    try {
      wx.getDetailPageCloseButtonBoundingClientRect({
        success: (rect) => {
          if (rect) {
            const btnBottom = (rect.top || 0) + (rect.height || 0)
            this.setData({
              headerPaddingTop: Math.max(btnBottom + 8, 32)
            })
          }
        },
        fail: (err) => {
          console.warn('[more-drinks] getDetailPageCloseButtonBoundingClientRect fail', err)
        }
      })
    } catch (e) {
      console.warn('[more-drinks] getDetailPageCloseButtonBoundingClientRect not available', e)
    }

    const catalog = loadCatalog()
    const categories = [{ id: 0, name: '全部' }].concat(CATEGORIES)
    this.setData({
      categories,
      activeCategoryId: 0,
      items: catalog
    })
    this._catalog = catalog
  },

  onTapCategory(e) {
    const id = Number(e.currentTarget.dataset.id)
    const items = id === 0
      ? this._catalog
      : this._catalog.filter(d => d.categoryId === id)
    this.setData({ activeCategoryId: id, items })
  },

  onTapDrink(e) {
    const item = e.currentTarget.dataset.item
    if (!item) return
    try {
      // 半屏页面中使用 getContext() 无参数形式（文档规范：Page 中不传 this）
      const ctx = wx.modelContext && wx.modelContext.getContext()
      if (ctx && ctx.sendFollowUpMessage) {
        ctx.sendFollowUpMessage({
          content: [
            { type: 'text', text: `选择${item.name}` },
            { type: 'api/call', data: { name: 'selectDrink', arguments: { drinkId: item.id } } }
          ]
        })
        return
      }
    } catch (err) {
      console.warn('[more-drinks] not in agent context', err)
    }
    // 非 Agent 环境（主包预览）：提示即可
    wx.showToast({ title: `选择了 ${item.name}`, icon: 'none' })
  }
})
