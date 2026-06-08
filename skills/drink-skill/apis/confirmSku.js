// 确认 SKU：校验规格 -> 生成订单草稿 -> 返回订单确认卡片
// 规范（最佳实践）：
// - content：「事实陈述 + 业务动作」两段式
// - structuredContent：供 Agent 理解订单状态（不含 imageUrl 等纯渲染字段）
// - _meta：组件渲染用（含 imageUrl、价格明细、地址），Agent 不可见
const { findDrink, getAddress, saveOrder, setPendingOrder } = require('../utils/storage.js')
const { validateSpecs } = require('../utils/sku.js')
const { genOrderId } = require('../utils/id.js')

async function confirmSku({ drinkId, specs } = {}) {
  try {
    if (!drinkId) {
      return {
        isError: true,
        content: [{ type: 'text', text: '缺少 drinkId。禁止编造，应先调用 selectDrink。' }]
      }
    }
    const drink = findDrink(drinkId)
    if (!drink) {
      return {
        isError: true,
        content: [{ type: 'text', text: `未找到 drinkId=${drinkId} 的饮品。禁止编造 ID，应先调用 selectDrink 获取有效 drinkId。` }]
      }
    }

    const check = validateSpecs(drinkId, specs)
    if (!check.valid) {
      return {
        isError: true,
        content: [{ type: 'text', text: `规格不合法：${check.error}。禁止再次使用相同无效值重试。正确出口：引导用户通过饮品详情卡片上的"选规格"按钮打开半屏重新选择。` }]
      }
    }

    const orderId = genOrderId()
    const order = {
      orderId,
      drinkId: drink.id,
      drinkName: drink.name,
      basePrice: check.basePrice,
      extraPrice: check.extraPrice,
      totalPrice: check.totalPrice,
      specs: check.normalizedSpecs,
      specText: check.specText,
      imageUrl: drink.imageUrl,
      status: 'pending',
      createTime: new Date().toISOString()
    }
    saveOrder(order)

    const address = getAddress()
    if (!address) {
      setPendingOrder(orderId)
      return {
        isError: false,
        // content：事实陈述 + 业务动作
        content: [{
          type: 'text',
          text: `订单已生成（${drink.name} ${check.specText}，¥${check.totalPrice}），但用户尚未填写收货地址。接下来为用户展示订单确认卡片，卡片上有"添加收货地址"入口，用简短话术引导用户在卡片上补充地址，禁止以纯文本列出订单详情。`
        }],
        // structuredContent：Agent 理解订单状态
        structuredContent: {
          orderId,
          drinkName: drink.name,
          specText: check.specText,
          totalPrice: check.totalPrice,
          needAddress: true,
          status: 'awaiting_address'
        },
        // _meta：组件渲染用
        _meta: {
          imageUrl: drink.imageUrl,
          basePrice: check.basePrice,
          extraPrice: check.extraPrice,
          address: null,
          pendingOrderId: orderId
        }
      }
    }

    // 有地址：直接订单确认
    order.address = address
    order.status = 'confirmed'
    saveOrder(order)

    return {
      isError: false,
      // content：事实陈述 + 业务动作
      content: [{
        type: 'text',
        text: `订单已生成并确认（${drink.name} ${check.specText}，¥${check.totalPrice}）。接下来为用户展示订单确认卡片，用简短话术引导用户点击卡片上的"确认下单"按钮，禁止以纯文本列出订单详情。`
      }],
      structuredContent: {
        orderId,
        drinkName: drink.name,
        specText: check.specText,
        totalPrice: check.totalPrice,
        needAddress: false,
        status: 'confirmed'
      },
      _meta: {
        imageUrl: drink.imageUrl,
        basePrice: check.basePrice,
        extraPrice: check.extraPrice,
        address
      }
    }
  } catch (err) {
    console.error('[confirmSku] error', err)
    return {
      isError: true,
      content: [{ type: 'text', text: `确认规格失败：${err.message || '未知错误'}。` }]
    }
  }
}

module.exports = confirmSku
