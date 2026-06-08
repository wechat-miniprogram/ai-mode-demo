// 选中饮品，查看详情
// 规范（最佳实践）：
// - content：「事实陈述 + 业务动作（双分支显式指令）」
// - structuredContent：供 Agent 理解（含 specOptions，不含 imageUrl/skuSchema 完整版）
// - _meta：组件渲染用（含 imageUrl、完整 skuSchema），Agent 不可见
const { findDrink } = require('../utils/storage.js')

async function selectDrink({ drinkId } = {}) {
  try {
    if (!drinkId) {
      return {
        isError: true,
        content: [{ type: 'text', text: '缺少 drinkId。禁止编造 ID 再次调用本接口。正确出口：先调用 getRecommendedDrinks 或 searchDrinks 获取可用 drinkId。' }]
      }
    }
    const drink = findDrink(drinkId)
    if (!drink) {
      // 失败分支：堵死错误退路 + 给出正确出口
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `未在商品库中找到 drinkId=${drinkId} 的饮品记录。禁止编造其他 ID 再次调用本接口，禁止从用户自然语言推断 ID。正确出口：调用 getRecommendedDrinks 或 searchDrinks 获取有效的 drinkId。`
        }]
      }
    }

    // 记录当前选中的饮品 id，供 sku-picker 半屏读取
    try { wx.setStorageSync('current_sku_drink_id', drink.id) } catch (e) {}

    // structuredContent：精简 specOptions 供 Agent 理解可选规格（不含完整 schema）
    const specOptions = {}
    drink.skuSchema.dimensions.forEach(d => {
      specOptions[d.key] = {
        label: d.label,
        multiple: !!d.multiple,
        options: d.options.map(o => ({ value: o.value, label: o.label, extraPrice: o.extraPrice || 0 }))
      }
    })

    return {
      isError: false,
      // content：事实陈述
      content: [{
        type: 'text',
        text: `已加载饮品「${drink.name}」详情（基础价 ¥${drink.price}）。接下来为用户展示饮品详情卡片，用简短话术引导用户点击卡片上的"直接下单"按钮。禁止 Agent 主动调用 confirmSku 跳过卡片展示，禁止以纯文本列出商品详情。`
      }],
      // structuredContent：Agent 理解屏幕内容（不含图片、不含完整 schema）
      structuredContent: {
        drinkId: drink.id,
        name: drink.name,
        price: drink.price,
        description: drink.description,
        categoryName: drink.categoryName,
        specOptions
      },
      // _meta：组件渲染用（含图片和完整 skuSchema）
      _meta: {
        imageUrl: drink.imageUrl,
        skuSchema: drink.skuSchema
      }
    }
  } catch (err) {
    console.error('[selectDrink] error', err)
    return {
      isError: true,
      content: [{ type: 'text', text: `选择饮品失败：${err.message || '未知错误'}。` }]
    }
  }
}

module.exports = selectDrink
