// 搜索 / 浏览饮品
// 规范（最佳实践）：
// - keyword 有值：按名称/分类/描述检索；keyword 留空：返回全部饮品（浏览/随便看看）
// - content：「事实陈述 + 业务动作」两段式 + 禁止纯文本列详情
// - structuredContent：供 Agent 理解（精简）
// - _meta：组件渲染用（含 imageUrl），Agent 不可见
// - 失败分支：堵死错误退路 + 给出正确出口
const { getCatalog } = require('../utils/storage.js')

async function searchDrinks({ keyword } = {}) {
  try {
    const hasKw = !!(keyword && typeof keyword === 'string' && keyword.trim())
    const catalog = getCatalog()

    // keyword 留空 -> 返回全部；有值 -> 按词检索
    const matched = hasKw
      ? (() => {
          const kw = keyword.trim().toLowerCase()
          return catalog.filter(d =>
            d.name.toLowerCase().includes(kw) ||
            d.categoryName.toLowerCase().includes(kw) ||
            (d.description || '').toLowerCase().includes(kw)
          )
        })()
      : catalog

    // 仅「带关键词但零命中」才算失败分支
    if (hasKw && !matched.length) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `未在商品库中匹配到包含「${keyword}」的饮品记录。禁止编造商品名再次调用本接口。正确出口：引导用户换个关键词（如拿铁、美式、奶咖、水果茶）重新搜索，或不带关键词调用本接口浏览全部饮品。`
        }]
      }
    }

    // 返回全量匹配结果（不再只取前 3）
    const picked = matched

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
      // content：事实陈述 + 业务动作（小微：引导点击小程序卡片进入列表页）
      content: [{
        type: 'text',
        text: hasKw
          ? `已搜索到 ${matched.length} 款匹配「${keyword}」的饮品。本次检索已完成，请直接用一句简短话术引导用户点击下方小程序卡片，在结果列表中自行挑选。【必须遵守】本轮禁止再次调用检索、也禁止自行编写代码对本批饮品逐条比对筛选。若用户指定的具体饮品名与结果中任何一款都不完全相同（例如用户想要名字恰好叫「拿铁」的，但结果里只有「焦糖蜂窝拿铁」这类带前缀的），说明该店没有完全同名的商品，此时必须直接展示本批结果卡片，并用一句话向用户说明没有完全同名的商品、请其从相近结果中挑选，严禁反复重新搜索。禁止以纯文本列出饮品详情。`
          : `已为用户列出全部 ${matched.length} 款饮品。请用一句简短话术引导用户点击下方小程序卡片进入完整列表挑选。禁止以纯文本列出饮品详情。`
      }],
      structuredContent: {
        items,
        total: matched.length,
        hasMore: matched.length > picked.length,
        keyword: hasKw ? keyword : null
      },
      // handoff：小微接力数据。query 为 string；留空关键词时 query 为空 -> 承接页展示全部
      handoff: {
        query: hasKw ? `keyword=${encodeURIComponent(keyword)}` : '',
        payload: { items: viewItems, keyword: hasKw ? keyword : null }
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
