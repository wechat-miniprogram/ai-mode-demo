// 搜索饮品
// 规范（最佳实践）：
// - content：「事实陈述 + 业务动作」两段式 + 禁止纯文本列详情
// - structuredContent：供 Agent 理解（精简）
// - _meta：组件渲染用（含 imageUrl），Agent 不可见
// - 失败分支：堵死错误退路 + 给出正确出口
const { getCatalog } = require('../utils/storage.js')

async function searchDrinks({ keyword } = {}) {
  try {
    if (!keyword || typeof keyword !== 'string') {
      return {
        isError: true,
        content: [{ type: 'text', text: '缺少搜索关键词。请反问用户想搜什么饮品。' }]
      }
    }

    const kw = keyword.trim().toLowerCase()
    const catalog = getCatalog()
    const matched = catalog.filter(d =>
      d.name.toLowerCase().includes(kw) ||
      d.categoryName.toLowerCase().includes(kw) ||
      (d.description || '').toLowerCase().includes(kw)
    )

    if (!matched.length) {
      // 失败分支：事实陈述 + 禁止错误路径 + 给出正确出口
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `未在商品库中匹配到包含「${keyword}」的饮品记录。禁止编造商品名再次调用本接口，禁止使用空关键词兜底搜索。正确出口：引导用户换个关键词（如拿铁、美式、奶咖、水果茶），或调用 getRecommendedDrinks 展示推荐。`
        }]
      }
    }

    const picked = matched.slice(0, 3)

    // structuredContent：Agent 理解（精简，不含图片）
    const items = picked.map(d => ({
      drinkId: d.id,
      name: d.name,
      price: d.price,
      categoryName: d.categoryName,
      description: d.description
    }))

    // _meta：组件渲染（含 imageUrl）
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
        text: `已搜索到 ${matched.length} 款匹配「${keyword}」的饮品。接下来为用户展示搜索结果卡片，用简短话术引导用户从卡片中选择，禁止以纯文本列出饮品详情。`
      }],
      structuredContent: {
        items,
        total: matched.length,
        hasMore: matched.length > picked.length,
        keyword
      },
      _meta: {
        viewItems
      }
    }
  } catch (err) {
    console.error('[searchDrinks] error', err)
    return {
      isError: true,
      content: [{ type: 'text', text: `搜索失败：${err.message || '未知错误'}。请引导用户稍后重试。` }]
    }
  }
}

module.exports = searchDrinks
