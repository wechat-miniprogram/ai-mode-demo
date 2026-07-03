// 接力页：订单结算（地址 + 支付）
// 小微 AI Handoff 入口（createOrder / addToOrder / saveAddress）：
//   - onLoad(query) 接收 string query 解析后的对象（orderId）
//   - 可选从 wx.onAgentHandoff 缓存按 pageId 取 payload（预置 order）加速首屏
//   - 进入小程序后用普通 wx.chooseAddress / wx.requestPayment 完成下单（不依赖 wx.openAgent）
function calcHeaderPaddingTop() {
  try {
    const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
    const statusBar = (info && info.statusBarHeight) || 20
    let capsuleBottom = statusBar + 44
    if (wx.getMenuButtonBoundingClientRect) {
      const rect = wx.getMenuButtonBoundingClientRect()
      if (rect && rect.bottom) capsuleBottom = rect.bottom + 8
    }
    const winWidth = (info && info.windowWidth) || 375
    return Math.max(Math.round(capsuleBottom * 750 / winWidth), 64)
  } catch (e) {
    return 88
  }
}

// 计算左上角返回按钮位置/尺寸（与右上角胶囊垂直对齐），返回 rpx
function calcNavBack() {
  try {
    const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
    const winWidth = (info && info.windowWidth) || 375
    const px2rpx = (px) => Math.round(px * 750 / winWidth)
    let top = ((info && info.statusBarHeight) || 20) + 6
    let size = 32
    if (wx.getMenuButtonBoundingClientRect) {
      const rect = wx.getMenuButtonBoundingClientRect()
      if (rect && rect.top) {
        top = rect.top
        size = rect.height || 32
      }
    }
    return { top: px2rpx(top), size: px2rpx(size) }
  } catch (e) {
    return { top: 88, size: 64 }
  }
}

function getOpenid() {
  const userInfo = wx.getStorageSync('userInfo')
  return (userInfo && userInfo.openid) ? userInfo.openid : 'anonymous'
}

function loadOrder(orderId) {
  if (!orderId) return null
  try {
    const orders = wx.getStorageSync(`orders_${getOpenid()}`) || []
    return orders.find(o => o.orderId === orderId) || null
  } catch (e) {
    return null
  }
}

function saveOrder(order) {
  try {
    const key = `orders_${getOpenid()}`
    const orders = wx.getStorageSync(key) || []
    const idx = orders.findIndex(o => o.orderId === order.orderId)
    if (idx >= 0) orders[idx] = order
    else orders.push(order)
    wx.setStorageSync(key, orders)
  } catch (e) {}
}

// 兼容规范化：把订单统一成多商品模型（items[] + totalPrice + itemCount）
// - 新模型：已有 items[]，仅回填 itemCount/totalPrice
// - 旧扁平单商品：包装成 items=[{...}]
function normalizeOrder(order) {
  if (!order) return order
  if (!Array.isArray(order.items)) {
    if (order.drinkName || order.drinkId) {
      order.items = [{
        drinkId: order.drinkId,
        drinkName: order.drinkName,
        imageUrl: order.imageUrl,
        specs: order.specs,
        specText: order.specText,
        basePrice: order.basePrice,
        extraPrice: order.extraPrice,
        totalPrice: order.totalPrice
      }]
    } else {
      order.items = []
    }
  }
  order.itemCount = order.items.length
  order.totalPrice = order.items.reduce((sum, it) => sum + (Number(it.totalPrice) || 0), 0)
  return order
}

function clearActiveOrderId() {
  try { wx.removeStorageSync(`active_order_${getOpenid()}`) } catch (e) {}
}

// 仅用于展示：把「饮品名 + 规格」完全相同的商品合并为一行，带数量 qty 与该行小计 lineTotal
// 不改动底层 order.items，只影响结算页渲染
function buildDisplayItems(order) {
  const items = (order && Array.isArray(order.items)) ? order.items : []
  const map = {}
  const list = []
  items.forEach(it => {
    const key = `${it.drinkName}||${it.specText || ''}`
    if (map[key]) {
      map[key].qty += 1
      map[key].lineTotal += Number(it.totalPrice) || 0
    } else {
      const row = {
        drinkName: it.drinkName,
        specText: it.specText,
        imageUrl: it.imageUrl,
        unitPrice: Number(it.totalPrice) || 0,
        qty: 1,
        lineTotal: Number(it.totalPrice) || 0
      }
      map[key] = row
      list.push(row)
    }
  })
  return list
}

Page({
  data: {
    order: null,
    displayItems: [],
    address: null,
    paying: false,
    paid: false,
    headerPaddingTop: 88,
    navBackTop: 88,
    navBackSize: 64
  },

  onLoad(query) {
    const nb = calcNavBack()
    this.setData({ headerPaddingTop: calcHeaderPaddingTop(), navBackTop: nb.top, navBackSize: nb.size })

    // 1) 解析 handoff query（orderId）
    const orderId = query && query.orderId ? String(query.orderId) : ''

    // 2) 取 wx.onAgentHandoff 缓存 payload（预置 order）
    let payload = null
    try {
      const app = getApp()
      if (app && app.takeAgentHandoff) {
        const handoff = app.takeAgentHandoff(this.getPageId())
        payload = handoff && handoff.payload
        if (handoff) console.log('[checkout] handoff', handoff)
      }
    } catch (e) {}

    // handoff payload 是对话侧（skill 独立分包）最新数据，含 saveAddress 刚保存的地址；
    // 与本地订单合并，payload 字段优先，确保收货地址等最新信息同步到结算页
    let order = loadOrder(orderId)
    if (payload && payload.orderId) {
      order = Object.assign({}, order || {}, payload)
      saveOrder(order)
    }

    if (!order || !order.orderId) {
      wx.showToast({ title: '订单不存在', icon: 'none' })
      return
    }

    normalizeOrder(order)

    const address = order.address || this._readStoredAddress()
    if (address && !order.address) {
      order.address = address
      order.status = 'confirmed'
      saveOrder(order)
    }

    this.setData({
      order,
      displayItems: buildDisplayItems(order),
      address: address || null,
      paid: order.status === 'paid'
    })
  },

  // 左上角返回：栈内有上一页则返回，否则回首页（承接页可能被直接打开）
  onTapBack() {
    const pages = getCurrentPages()
    if (pages && pages.length > 1) {
      wx.navigateBack({ delta: 1 })
    } else {
      wx.reLaunch({ url: '/pages/home/home' })
    }
  },

  _readStoredAddress() {
    try {
      return wx.getStorageSync(`address_${getOpenid()}`) || null
    } catch (e) {
      return null
    }
  },

  // 选择收货地址（系统地址选择器）
  onTapChooseAddress() {
    if (!wx.chooseAddress) {
      wx.showToast({ title: '当前环境不支持选择地址', icon: 'none' })
      return
    }
    wx.chooseAddress({
      success: (res) => {
        const detail = (res.provinceName || '') + (res.cityName || '') + (res.countyName || '') + (res.detailInfo || '')
        const address = { name: res.userName, phone: res.telNumber, detail }
        try { wx.setStorageSync(`address_${getOpenid()}`, address) } catch (e) {}
        const order = Object.assign({}, this.data.order, { address, status: 'confirmed' })
        saveOrder(order)
        this.setData({ address, order })
      },
      fail: () => {
        wx.showToast({ title: '未选择地址', icon: 'none' })
      }
    })
  },

  // 发起支付（mock 兜底）
  onTapPay() {
    const { order, address, paying } = this.data
    if (paying) return
    if (!order) return
    if (!address) {
      wx.showToast({ title: '请先选择收货地址', icon: 'none' })
      return
    }
    this.setData({ paying: true })

    const finishPaid = (method) => {
      const paid = Object.assign({}, order, {
        status: 'paid',
        payTime: new Date().toISOString(),
        payMethod: method
      })
      saveOrder(paid)
      clearActiveOrderId() // 支付完成，活动订单指针失效（后续 addToOrder 需重新建单）
      this.setData({ paying: false, paid: true, order: paid })
      wx.showToast({ title: '支付成功', icon: 'success' })
    }

    if (!wx.requestPayment) {
      finishPaid('mock')
      return
    }
    // 注意：以下为演示用占位参数
    wx.requestPayment({
      timeStamp: String(Math.floor(Date.now() / 1000)),
      nonceStr: 'demo_' + Math.random().toString(36).slice(2, 10),
      package: 'prepay_id=demo_prepay',
      signType: 'RSA',
      paySign: 'demo_sign',
      success: () => finishPaid('wxpay'),
      fail: () => finishPaid('mock') // 环境不可用 -> 降级 mock，确保流程跑通
    })
  },

  onTapBackHome() {
    wx.reLaunch({ url: '/pages/home/home' })
  }
})
