const { buildCatalog } = require('../data/seed.js')

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
    drink: null,
    dimensions: [], // 每个 option 带 _selected 字段供 wxml 使用
    totalPrice: 0,
    extraPrice: 0,
    specTextPreview: '',
    headerPaddingTop: 32
  },

  onLoad(query) {
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
          console.warn('[sku-picker] getDetailPageCloseButtonBoundingClientRect fail', err)
        }
      })
    } catch (e) {
      console.warn('[sku-picker] getDetailPageCloseButtonBoundingClientRect not available', e)
    }

    // 优先从 query 取 drinkId（主包预览入口），否则从 storage 取（Agent 半屏入口）
    let drinkId = query && query.drinkId ? Number(query.drinkId) : 0
    if (!drinkId) {
      try { drinkId = Number(wx.getStorageSync('current_sku_drink_id')) || 0 } catch (e) {}
    }
    const catalog = loadCatalog()
    const drink = catalog.find(d => d.id === drinkId)
    if (!drink) {
      wx.showToast({ title: '商品不存在', icon: 'none' })
      return
    }
    const schema = drink.skuSchema || { dimensions: [] }
    // 初始化：单选默认选第一个，多选默认不选
    const dims = schema.dimensions.map(dim => {
      const firstValue = (dim.options[0] && dim.options[0].value)
      return {
        key: dim.key,
        label: dim.label,
        multiple: !!dim.multiple,
        selectedValue: dim.multiple ? null : firstValue,
        selectedValues: dim.multiple ? [] : null,
        options: dim.options
      }
    })
    this.setData({ drink, dimensions: dims })
    this._recalc()
  },

  onTapOption(e) {
    const { dimKey, value } = e.currentTarget.dataset
    const dims = this.data.dimensions.map(d => {
      if (d.key !== dimKey) return d
      if (d.multiple) {
        const list = [...(d.selectedValues || [])]
        const idx = list.indexOf(value)
        if (idx >= 0) list.splice(idx, 1)
        else list.push(value)
        return { ...d, selectedValues: list }
      }
      return { ...d, selectedValue: value }
    })
    this.setData({ dimensions: dims })
    this._recalc()
  },

  _recalc() {
    const { drink, dimensions } = this.data
    if (!drink) return
    let extra = 0
    const labels = []
    const nextDims = dimensions.map(dim => {
      const options = dim.options.map(opt => {
        const selected = dim.multiple
          ? (dim.selectedValues || []).indexOf(opt.value) >= 0
          : dim.selectedValue === opt.value
        return Object.assign({}, opt, { _selected: selected })
      })
      if (dim.multiple) {
        const names = []
        for (const opt of options) {
          if (opt._selected) {
            extra += (opt.extraPrice || 0)
            names.push(opt.label)
          }
        }
        if (names.length) labels.push(`${dim.label}:${names.join('+')}`)
      } else {
        const opt = options.find(o => o._selected)
        if (opt) {
          extra += (opt.extraPrice || 0)
          labels.push(opt.label)
        }
      }
      return Object.assign({}, dim, { options })
    })
    this.setData({
      dimensions: nextDims,
      extraPrice: extra,
      totalPrice: drink.price + extra,
      specTextPreview: labels.join(' / ')
    })
  },

  onTapConfirm() {
    const { drink, dimensions, specTextPreview } = this.data
    if (!drink) return
    for (const dim of dimensions) {
      if (!dim.multiple && !dim.selectedValue) {
        wx.showToast({ title: `请选择${dim.label}`, icon: 'none' })
        return
      }
    }
    const specs = {}
    for (const dim of dimensions) {
      if (dim.multiple) specs[dim.key] = dim.selectedValues || []
      else specs[dim.key] = dim.selectedValue
    }
    try {
      // 半屏页面中使用 getContext() 无参数形式（文档规范：Page 中不传 this）
      const ctx = wx.modelContext && wx.modelContext.getContext()
      if (ctx && ctx.sendFollowUpMessage) {
        ctx.sendFollowUpMessage({
          content: [
            { type: 'text', text: `${drink.name} ${specTextPreview}，下单` },
            { type: 'api/call', data: { name: 'confirmSku', arguments: { drinkId: drink.id, specs } } }
          ]
        })
        return
      }
    } catch (err) {
      console.warn('[sku-picker] not in agent context', err)
    }
    wx.showToast({ title: `已选：${specTextPreview}`, icon: 'none' })
  }
})
