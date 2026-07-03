# 小程序 AI Demo - WeStoreCafe 点单场景（小微 AI Handoff 模式）

本项目是微信小程序 AI demo，演示**小微 SubAgent「AI Handoff」接力**：
用户在小微对话中与小程序 AI 交互，平台返回**文本回复 + 小程序卡片**，
用户点击卡片后 **handoff 接力**进入小程序的开发者业务页（接力页），在小程序内完成选品、下单、支付。

> 小微对话内**不渲染原子组件（GUI 卡片）**，只展示「文本 + 小程序卡片」；
> 原子组件代码与 `componentPath` 保留以便后续复用。

## handoff 接力机制（核心）

```
对话 → 调用原子接口（返回 handoff） → 文本回复 + 小程序卡片
   → 用户点击卡片 → 按 pagePath 打开接力页 → wx.onAgentHandoff(path/query/payload)
   → 接力页 onLoad(query) 展示业务内容 → 小程序内普通导航完成后续
```

## 接口 → 接力页映射

| 接口 | handoff.query | 接力页 | 说明 |
|------|---------------|--------|------|
| searchDrinks | `keyword=拿铁`（可留空=全部） | `home` | 搜索/浏览全部（首页） |
| selectDrink | `drinkId=289` | `sku-picker` | 详情 + 选规格 |
| createOrder | `orderId=xxx` | `checkout` | 新建订单（首杯/换一杯）→ 结算页 |
| addToOrder | `orderId=xxx` | `checkout` | 追加商品到当前订单 → 结算页（展示全部已选商品） |
| removeOrderItem | `orderId=xxx` | `checkout` | 删除订单内某商品（至少保留一件）→ 结算页 |
| viewOrder | `orderId=xxx` | `checkout` | 查看当前进行中的订单 → 结算页 |
| cancelOrder | 空 | `home` | 取消/清空整单 → 回首页重新挑选 |
| saveAddress | `orderId=xxx` | `checkout` | 保存地址 → 结算页确认支付 |


### 开发者适配四件套
1. **mcp.json**：在 `apis[]._meta.ui.pagePath` 声明接力页（不含 query）。
2. **原子接口返回值**：顶层增加 `handoff: { query: 'string', payload?, card? }`。
3. **app.js**：`onLaunch` 注册 `wx.onAgentHandoff`，按 `pageId` 缓存 `{ path, query, payload }`。
4. **接力业务页**：`onLoad(query)` 解析 query；可选按 `pageId` 取 `payload` 加速首屏。


## 项目结构

```
├── app.js / app.json / app.wxss    # 全局配置；app.js 注册 wx.onAgentHandoff
├── data/seed.js                     # 首页目录种子数据（主包）
├── pages/home/                      # 首页 + 搜索 handoff 承接页（消费 keyword）
├── skills/drink-skill/              # WeStoreCafe SKILL（独立分包）
│   ├── SKILL.md                     # 业务说明（handoff 模式）
│   ├── mcp.json                     # 原子接口声明（含 _meta.ui.pagePath）
│   ├── apis/                        # 原子接口实现（返回 handoff）
│   └── components/                  # 原子组件（小微不渲染，保留兼容）
├── packageDetail/pages/             # 接力页（独立分包）
│   ├── sku-picker                   # 详情/选规格接力页（消费 drinkId + payload）
│   └── checkout                     # 订单结算接力页（消费 orderId + payload，地址+支付）
└── page-meta.json                   # 页面元数据（未调原子接口时的出卡依据）
```

## 快速开始

1. 使用微信开发者工具导入本项目（基础库需支持小微 handoff：`wx.onAgentHandoff`）。
2. 填写已申请 AI 开发模式 + 小微 handoff 内测权限的 AppID。
3. 编译运行，通过小微 AI 对话体验「文本 + 小程序卡片 → 点击接力进业务页」流程。

## 注意事项（小微当前阶段）

- 对话内**不渲染原子组件**，半屏页 `openDetailPage` 改为 handoff 进**完整页**。
- `wx.openAgent` / `wx.navigateBackAgent` 当前不可用，接力页不要依赖「返回 Agent 对话」。
- handoff `query` 为 **string**；接力页 `onLoad` 收到框架解析后的对象。
