// 饮品推荐 - 返回最多 3 款商品
// 规范（最佳实践）：
// - content：「事实陈述 + 业务动作」两段式 + 禁止纯文本列详情
// - structuredContent：供 Agent 理解屏幕内容（不含 imageUrl 等纯渲染字段）
// - _meta：对 LLM 不可见，携带组件渲染需要但 Agent 无需理解的数据（如 imageUrl）
const { getCatalog } = require('../utils/storage.js')

const SCENARIO_FILTER = {
  coffee: [141, 133],
  tea: [135],
  warm: [139]
}

async function getRecommendedDrinks({ scenario = 'default' } = {}) {
  try {
    const catalog = getCatalog()
    let pool = catalog
    const filterIds = SCENARIO_FILTER[scenario]
    if (filterIds) {
      pool = catalog.filter(d => filterIds.includes(d.categoryId))
    }

    const picked = pool.slice(0, 3)
    const total = pool.length

    // structuredContent：Agent 理解屏幕内容（精简，不含图片地址）
    const items = picked.map(d => ({
      drinkId: d.id,
      name: d.name,
      price: d.price,
      categoryName: d.categoryName,
      description: d.description
    }))

    // _meta：组件渲染用（含 imageUrl），Agent 不可见
    const viewItems = picked.map(d => ({
      drinkId: d.id,
      name: d.name,
      price: d.price,
      categoryName: d.categoryName,
      description: d.description,
      imageUrl: d.imageUrl
    }))

    return {
      isError: false,
      // content：事实陈述 + 业务动作 + 禁止纯文本
      content: [{
        type: 'text',
        text: `已加载 ${picked.length} 款推荐饮品（共 ${total} 款可选）。接下来为用户展示推荐饮品卡片，用简短话术引导用户从卡片中选择，禁止以纯文本列出饮品详情。`
      }],
      structuredContent: {
        items,
        total,
        hasMore: total > picked.length,
        keyword: null
      },
      _meta: {
        viewItems,
        scenario
      }
    }
  } catch (err) {
    console.error('[getRecommendedDrinks] error', err)
    return {
      isError: true,
      content: [{ type: 'text', text: `推荐失败：${err.message || '未知错误'}。请引导用户稍后重试或换个方式描述需求。` }]
    }
  }
}

module.exports = getRecommendedDrinks
