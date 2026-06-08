// 支付订单
// 规范（最佳实践）：
// - 若微信支付环境不可用，自动降级为 mock 支付成功（与 mcp.json description 一致）
// - content：「事实陈述 + 业务动作」两段式
// - structuredContent：供 Agent 理解（不含 imageUrl）
// - _meta：组件渲染用（含 imageUrl），Agent 不可见
const { findOrder, saveOrder } = require('../utils/storage.js')

function requestWxPayment(order) {
  return new Promise((resolve, reject) => {
    if (!wx || typeof wx.requestPayment !== 'function') {
      return reject(new Error('当前环境不支持 wx.requestPayment'))
    }
    try {
      wx.requestPayment({
        timeStamp: String(Math.floor(Date.now() / 1000)),
        nonceStr: 'demo_' + Math.random().toString(36).slice(2, 10),
        package: 'prepay_id=demo_prepay',
        signType: 'MD5',
        paySign: 'demo_sign',
        success: () => resolve(),
        fail: (err) => reject(err || new Error('wx.requestPayment 调用失败'))
      })
    } catch (e) {
      reject(e)
    }
  })
}

function mockPaySuccess(order) {
  order.status = 'paid'
  order.payTime = new Date().toISOString()
  order.payMethod = 'mock'
  saveOrder(order)
  return order
}

async function payOrder({ orderId, address: inputAddress } = {}) {
  try {
    if (!orderId) {
      return { isError: true, content: [{ type: 'text', text: '缺少 orderId。禁止编造，应从 confirmSku/saveAddress 返回值获取。' }] }
    }
    const order = findOrder(orderId)
    if (!order) {
      return { isError: true, content: [{ type: 'text', text: `未找到订单 ${orderId}。禁止编造 orderId 再次调用。正确出口：引导用户重新选品下单。` }] }
    }
    if (order.status === 'paid') {
      return {
        isError: false,
        content: [{ type: 'text', text: '该订单已支付完成。接下来为用户展示支付成功卡片。' }],
        structuredContent: {
          orderId,
          paidAmount: order.totalPrice,
          payTime: order.payTime,
          status: 'paid',
          drinkName: order.drinkName,
          specText: order.specText
        },
        _meta: { imageUrl: order.imageUrl || '' }
      }
    }

    if (!order.address) {
      const { getAddress } = require('../utils/storage.js')
      const addr = inputAddress || getAddress()
      if (addr) {
        order.address = addr
        order.status = 'confirmed'
        saveOrder(order)
      } else {
        return {
          isError: true,
          content: [{ type: 'text', text: '订单缺少收货地址，无法发起支付。正确出口：引导用户点击订单确认卡上的"添加收货地址"栏补充地址后再下单。禁止在无地址时再次调用 payOrder。' }]
        }
      }
    }

    // 尝试真实支付，失败则自动降级为 mock 成功
    let paid
    try {
      await requestWxPayment(order)
      order.status = 'paid'
      order.payTime = new Date().toISOString()
      order.payMethod = 'wxpay'
      saveOrder(order)
      paid = order
    } catch (err) {
      console.warn('[payOrder] wx.requestPayment failed, fallback to mock:', (err && err.errMsg) || err)
      paid = mockPaySuccess(order)
    }

    return {
      isError: false,
      // content：事实陈述 + 业务动作
      content: [{
        type: 'text',
        text: `支付成功，订单 ${paid.orderId} 已完成（¥${paid.totalPrice}）。接下来为用户展示支付成功卡片，并简短告知用户"支付成功，预计 20 分钟内出杯"。禁止以纯文本重复订单详情。`
      }],
      structuredContent: {
        orderId: paid.orderId,
        paidAmount: paid.totalPrice,
        payTime: paid.payTime,
        status: 'paid',
        drinkName: paid.drinkName,
        specText: paid.specText
      },
      _meta: {
        imageUrl: paid.imageUrl || '',
        address: paid.address,
        payMethod: paid.payMethod
      }
    }
  } catch (err) {
    console.error('[payOrder] error', err)
    return {
      isError: true,
      content: [{ type: 'text', text: `支付失败：${err.message || '未知错误'}。` }]
    }
  }
}

module.exports = payOrder
