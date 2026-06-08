// 订单确认（展示）
// 规范（最佳实践）：
// - content：「事实陈述 + 业务动作」两段式
// - structuredContent：供 Agent 理解（不含 imageUrl）
// - _meta：组件渲染用（含 imageUrl、价格明细、地址），Agent 不可见
const { findOrder, getAddress, saveOrder } = require('../utils/storage.js')

async function confirmOrder({ orderId } = {}) {
  try {
    if (!orderId) {
      return { isError: true, content: [{ type: 'text', text: '缺少 orderId。禁止编造，应从上游接口返回值获取。' }] }
    }
    const order = findOrder(orderId)
    if (!order) {
      return { isError: true, content: [{ type: 'text', text: `未找到订单 ${orderId}。禁止编造 orderId 再次调用。正确出口：引导用户重新选品下单。` }] }
    }

    const address = order.address || getAddress()
    if (!address) {
      return {
        isError: false,
        content: [{ type: 'text', text: `订单 ${orderId} 缺少收货地址。接下来为用户展示订单确认卡片，卡片上有"添加地址"入口，用简短话术引导用户在卡片上补充地址。禁止以纯文本列出订单详情。` }],
        structuredContent: {
          orderId,
          drinkName: order.drinkName,
          specText: order.specText || '',
          totalPrice: order.totalPrice,
          needAddress: true,
          status: 'awaiting_address'
        },
        _meta: {
          imageUrl: order.imageUrl || '',
          basePrice: order.basePrice || 0,
          extraPrice: order.extraPrice || 0,
          address: null,
          pendingOrderId: orderId
        }
      }
    }

    if (!order.address) {
      order.address = address
      order.status = 'confirmed'
      saveOrder(order)
    }

    return {
      isError: false,
      content: [{
        type: 'text',
        text: `订单 ${order.orderId} 确认完毕。接下来为用户展示订单确认卡片，用简短话术引导用户点击"确认下单"完成支付。禁止以纯文本列出订单详情。`
      }],
      structuredContent: {
        orderId: order.orderId,
        drinkName: order.drinkName,
        specText: order.specText,
        totalPrice: order.totalPrice,
        needAddress: false,
        status: 'confirmed'
      },
      _meta: {
        imageUrl: order.imageUrl || '',
        basePrice: order.basePrice || 0,
        extraPrice: order.extraPrice || 0,
        address
      }
    }
  } catch (err) {
    console.error('[confirmOrder] error', err)
    return {
      isError: true,
      content: [{ type: 'text', text: `订单确认失败：${err.message || '未知错误'}。` }]
    }
  }
}

module.exports = confirmOrder
