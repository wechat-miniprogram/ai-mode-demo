// 删除订单内商品：从「当前活动订单」中移除指定商品项 -> 返回订单确认卡片（含剩余商品）
// 业务铁律：
//   - 订单至少保留一件商品：当订单仅剩一件时禁止删除，回复用户"仅剩一件不能删了"。
//   - 改规格场景：多件时"先删旧项(removeOrderItem)再加新项(addToOrder)"；仅一件时应改用 createOrder 覆盖，
//     因为最后一件删不掉（见 SKILL 用户意图分流）。
// 规范（最佳实践）：
// - content：「事实陈述 + 业务动作」两段式
// - structuredContent：供 Agent 理解订单状态（含 items 摘要，不含 imageUrl 等纯渲染字段）
// - _meta：组件渲染用（含 imageUrl、地址），Agent 不可见
const { getActiveOrder, getAddress, saveOrder, recalcOrderTotal } = require('../utils/storage.js')

async function removeOrderItem({ itemId } = {}) {
  try {
    const order = getActiveOrder()
    if (!order || !Array.isArray(order.items) || !order.items.length) {
      return {
        isError: true,
        content: [{ type: 'text', text: '当前没有进行中的订单，或订单内没有商品，无法删除。请直接告知用户暂无可删除的商品，禁止重试本接口。' }]
      }
    }

    // 仅剩一件：禁止删除，回复用户
    if (order.items.length <= 1) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: '订单中仅剩最后一件商品，不能删除。请直接告知用户「订单至少需保留一件商品，无法删除最后一件；如需清空整单可说『取消订单』」，禁止重试本接口。'
        }]
      }
    }

    if (!itemId) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `缺少 itemId，无法定位要删除的商品。当前订单商品：${order.items.map(it => `${it.itemId}=${it.drinkName}(${it.specText})`).join('、')}。请根据用户所指从中选定对应 itemId 后再调用，禁止编造 itemId。`
        }]
      }
    }

    const idx = order.items.findIndex(it => it.itemId === itemId)
    if (idx < 0) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `未在订单中找到 itemId=${itemId} 的商品。当前订单商品：${order.items.map(it => `${it.itemId}=${it.drinkName}(${it.specText})`).join('、')}。请从中重新选定正确 itemId，禁止编造。`
        }]
      }
    }

    const removed = order.items.splice(idx, 1)[0]
    recalcOrderTotal(order)

    const address = order.address || getAddress()
    if (address) order.address = address
    const needAddress = !address
    order.status = needAddress ? 'pending' : 'confirmed'
    saveOrder(order)

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
        text: `已从订单中删除「${removed.drinkName} ${removed.specText}」，现共 ${order.itemCount} 件，合计 ¥${order.totalPrice}。请用一句简短话术引导用户点击下方小程序卡片进入结算页查看剩余商品并下单。禁止以纯文本列出订单详情。`
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
    console.error('[removeOrderItem] error', err)
    return {
      isError: true,
      content: [{ type: 'text', text: `删除商品失败：${err.message || '未知错误'}。` }]
    }
  }
}

module.exports = removeOrderItem
