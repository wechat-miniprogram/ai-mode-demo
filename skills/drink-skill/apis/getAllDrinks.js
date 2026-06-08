// 获取全部饮品（主要供半屏数据读取或 Agent 询问总量时使用）
// 规范（最佳实践）：
// - content：「事实陈述 + 业务动作」两段式
// - structuredContent：供 Agent 理解的结构化数据
const { getCatalog, getCategories } = require('../utils/storage.js')

async function getAllDrinks({ categoryId } = {}) {
  try {
    const catalog = getCatalog()
    const categories = getCategories()

    let items = catalog
    if (categoryId) {
      items = catalog.filter(d => d.categoryId === Number(categoryId))
    }

    const simpleItems = items.map(d => ({
      drinkId: d.id,
      name: d.name,
      price: d.price,
      categoryName: d.categoryName
    }))

    return {
      isError: false,
      content: [{
        type: 'text',
        text: `全部饮品数据已返回（${simpleItems.length} 款，${categories.length} 个分类）。本接口数据主要供半屏页面使用，通常无需向用户展示全量列表。`
      }],
      structuredContent: {
        categories,
        items: simpleItems,
        total: simpleItems.length
      },
      _meta: {}
    }
  } catch (err) {
    console.error('[getAllDrinks] error', err)
    return {
      isError: true,
      content: [{ type: 'text', text: `获取饮品列表失败：${err.message || '未知错误'}。` }]
    }
  }
}

module.exports = getAllDrinks
