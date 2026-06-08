// 保存地址，若有 pending 订单则自动续跑订单确认
// 规范（最佳实践）：
// - content：「事实陈述 + 业务动作」两段式
// - structuredContent：供 Agent 理解（不含 imageUrl）
// - _meta：组件渲染用（含 imageUrl、地址、价格明细），Agent 不可见
const { setAddress, getPendingOrder, findOrder, saveOrder, clearPendingOrder } = require('../utils/storage.js')

function isPhone(p) {
  return typeof p === 'string' && /^1\d{10}$/.test(p)
}

async function saveAddress({ name, phone, detail } = {}) {
  try {
    if (!name || !String(name).trim()) {
      return { isError: true, content: [{ type: 'text', text: '缺少收货人姓名。请反问用户补充。' }] }
    }
    if (!isPhone(phone)) {
      return { isError: true, content: [{ type: 'text', text: '手机号格式不正确，需为 11 位数字。请反问用户确认手机号。' }] }
    }
    if (!detail || !String(detail).trim()) {
      return { isError: true, content: [{ type: 'text', text: '缺少详细地址。请反问用户补充。' }] }
    }

    const address = {
      name: String(name).trim(),
      phone: String(phone).trim(),
      detail: String(detail).trim()
    }
    setAddress(address)

    const pendingId = getPendingOrder()
    if (pendingId) {
      const order = findOrder(pendingId)
      if (order) {
        order.address = address
        order.status = 'confirmed'
        saveOrder(order)
        clearPendingOrder()

        return {
          isError: false,
          // content：事实陈述 + 业务动作
          content: [{
            type: 'text',
            text: `地址已保存，订单已更新为 confirmed 状态。接下来为用户展示订单确认卡片（含地址），用简短话术引导用户点击"确认下单"完成支付。禁止以纯文本列出订单详情。`
          }],
          structuredContent: {
            success: true,
            orderId: order.orderId,
            drinkName: order.drinkName,
            specText: order.specText,
            totalPrice: order.totalPrice,
            needAddress: false,
            status: 'confirmed'
          },
          _meta: {
            imageUrl: order.imageUrl,
            basePrice: order.basePrice,
            extraPrice: order.extraPrice,
            address
          }
        }
      }
    }

    return {
      isError: false,
      content: [{ type: 'text', text: '地址已保存成功。' }],
      structuredContent: { success: true },
      _meta: {}
    }
  } catch (err) {
    console.error('[saveAddress] error', err)
    return {
      isError: true,
      content: [{ type: 'text', text: `保存地址失败：${err.message || '未知错误'}。` }]
    }
  }
}

module.exports = saveAddress
