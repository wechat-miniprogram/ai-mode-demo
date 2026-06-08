// 原子接口：获取最近门店信息
// 规范（最佳实践）：
// - content：「事实陈述 + 业务动作」两段式
// - structuredContent：供 Agent 理解（门店基础信息）
// - _meta：组件渲染用（轮询配置 statusUrl/pollInterval），Agent 不可见
async function getStoreStatus({ storeId } = {}) {
  const store = {
    storeId: storeId || 'ST_10086',
    storeName: '望京SOHO店',
    distance: '320m',
    address: '北京市朝阳区望京SOHO T1 B1',
    statusUrl: 'https://example.com/mock/drink/store-status'
  }

  return {
    isError: false,
    // content：事实陈述 + 业务动作
    content: [{
      type: 'text',
      text: `已定位到最近门店「${store.storeName}」（${store.distance}）。接下来为用户展示门店状态卡片，实时排队与出杯时间将在卡片中动态刷新。禁止以纯文本列出门店详情。`
    }],
    structuredContent: {
      storeId: store.storeId,
      storeName: store.storeName,
      distance: store.distance,
      address: store.address
    },
    _meta: {
      statusUrl: store.statusUrl,
      pollInterval: 5000
    }
  }
}

module.exports = getStoreStatus
