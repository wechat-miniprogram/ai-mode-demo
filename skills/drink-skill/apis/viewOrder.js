// 查看订单：调出「当前活动订单」-> 返回订单确认卡片，引导 handoff 进结算页查看
// 说明：本链路只维护一个活动订单（未支付）；支付完成后活动订单失效，此时视为无进行中订单。
// 规范（最佳实践）：
// - content：「事实陈述 + 业务动作」两段式
// - structuredContent：供 Agent 理解订单状态（含 items 摘要，不含 imageUrl 等纯渲染字段）
// - _meta：组件渲染用（含 imageUrl、地址），Agent 不可见
const { getActiveOrder, getAddress } = require('../utils/storage.js')

async function viewOrder() {
  try {
    const order = getActiveOrder()
    if (!order || !Array.isArray(order.items) || !order.items.length) {
      return {
        isError: true,
        content: [{ type: 'text', text: '当前没有进行中的订单可查看。请直接告知用户暂无进行中的订单，可先点单后再查看，禁止重试本接口。' }]
      }
    }

    const address = order.address || getAddress()
    const needAddress = !address

    const structuredContent = {
      orderId: order.orderId,
      items: order.items.map(it => ({ itemId: it.itemId, drinkName: it.drinkName, specText: it.specText, totalPrice: it.totalPrice })),
      itemCount: order.itemCount,
      totalPrice: order.totalPrice,
      needAddress,
      status: order.status
    }

    const handoffPayload = {
      orderId: order.orderId,
      items: order.items,
      itemCount: order.itemCount,
      totalPrice: order.totalPrice,
      address: address || null,
      needAddress,
      status: order.status
    }

    return {
      isError: false,
      content: [{
        type: 'text',
        text: `已为用户调出当前订单（共 ${order.itemCount} 件，合计 ¥${order.totalPrice}）。请用一句简短话术引导用户点击下方小程序卡片进入结算页查看订单详情${needAddress ? '并补充收货地址' : ''}。禁止以纯文本列出订单详情。`
      }],
      structuredContent,
      handoff: {
        query: `orderId=${order.orderId}`,
        payload: handoffPayload
      },
      _meta: {
        items: order.items,
        address: address || null
      }
    }
  } catch (err) {
    console.error('[viewOrder] error', err)
    return {
      isError: true,
      content: [{ type: 'text', text: `查看订单失败：${err.message || '未知错误'}。` }]
    }
  }
}

module.exports = viewOrder
